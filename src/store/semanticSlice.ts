import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { SemanticState, TransmissionMode } from './types';
import geminiService from '../services/geminiService';
import { 
  addGaussianNoise, 
  getCachedModelSimilarity,
  combineVectors,
  SemanticVector 
} from '../utils/semanticEmbedding';

const initialState: SemanticState = {
  inputText: '',
  originalVector: null,
  noisyLOSVector: null,
  noisyRelayVector: null,
  combinedVector: null,
  reconstructedText: '',
  semanticSummary: '', // Added semanticSummary with empty default
  noiseVariance: 0.1,
  similarityThreshold: 0.7,
  semanticSimilarity: null,
  transmissionMode: TransmissionMode.LOS,
  isLoading: false,
  apiKey: '',
  useSentenceTransformer: true, // Enable sentence transformer by default
  snrValue: 20, // Default SNR value of 20dB
  // Text noise properties
  textNoiseType: 'delete',
  textNoiseProbability: 0.2,
  textNoiseRange: 3,
  textNoiseFillerToken: 'BLANK',
  noisyTextOutput: ''
};

// Async thunk for encoding text to semantic vector
export const encodeText = createAsyncThunk(
  'semantic/encodeText',
  async (text: string, { dispatch }) => {
    // Get semantic summary before getting embedding
    const summary = await geminiService.getSemanticSummary(text);
    dispatch(setSemanticSummary(summary));
    return await geminiService.getEmbedding(text);
  }
);

// Async thunk for decoding vector to text
export const decodeVector = createAsyncThunk(
  'semantic/decodeVector',
  async (vector: SemanticVector) => {
    return await geminiService.generateTextFromVector(vector);
  }
);

// Thunk for processing the entire semantic communication pipeline
export const processCommunication = createAsyncThunk(
  'semantic/processCommunication',
  async (_, { getState, dispatch }) => {
    const state = (getState() as any).semantic as SemanticState;
    
    if (!state.originalVector) {
      throw new Error('No original vector available');
    }
    
    // Add noise to the original vector (LOS path)
    const noisyLOSVector = addGaussianNoise(state.originalVector, state.noiseVariance);
    
    // We need to get reconstructed text first to calculate semantic similarity
    let vectorToUse: SemanticVector = noisyLOSVector;
    
    // Update state
    dispatch(semanticSlice.actions.setNoisyLOSVector(noisyLOSVector));
    
    // Check if we should use relay mode (we'll use vector similarity temporarily to make this decision)
    // For more accuracy, we could update this to use semantic similarity after reconstruction
    const vectorSimilarity = Math.max(0, 1 - (state.noiseVariance * 10));
    
    if (vectorSimilarity < state.similarityThreshold && state.transmissionMode === TransmissionMode.RELAY) {
      // Generate a second noisy vector (relay path)
      const noisyRelayVector = addGaussianNoise(state.originalVector, state.noiseVariance);
      
      // Combine the two noisy vectors
      const combinedVector = combineVectors(noisyLOSVector, noisyRelayVector, 0.5);
      
      vectorToUse = combinedVector;
      
      // Update state with all vectors
      dispatch(semanticSlice.actions.setNoisyRelayVector(noisyRelayVector));
      dispatch(semanticSlice.actions.setCombinedVector(combinedVector));
    } else {
      // Update state
      dispatch(semanticSlice.actions.setNoisyRelayVector(null));
      dispatch(semanticSlice.actions.setCombinedVector(null));
    }
    
    // Decode the vector back to text
    const reconstructedText = await dispatch(decodeVector(vectorToUse)).unwrap();
    
    // Now calculate semantic similarity between original and reconstructed text
    // Always use the Python backend server for similarity calculation
    let semanticSimilarity: number;
    try {
      // Use the Python sentence-transformer model via the backend server
      semanticSimilarity = await getCachedModelSimilarity(
        state.inputText, 
        reconstructedText
      );
      console.log(`Semantic similarity from backend: ${semanticSimilarity}`);
    } catch (error) {
      console.error('Failed to get similarity from backend:', error);
      // If the backend fails, set similarity to null to indicate an error
      semanticSimilarity = 0;
    }
    
    return {
      noisyLOSVector,
      semanticSimilarity,
      reconstructedText
    };
  }
);

// Run AWGN simulation automatically
export const runAwgnSimulation = createAsyncThunk(
  'semantic/runAwgnSimulation',
  async (_, { getState }) => {
    try {
      // Get the current state to access the input text and SNR value
      const state = (getState() as any).semantic as SemanticState;
      const inputText = state.inputText || "Hello, Semantic Communication!";
      const snrValue = state.snrValue; // Use the SNR value directly from state
      
      const BACKEND_URL = 'http://localhost:5000';
      
      // Ensure we're always sending a valid JSON object
      const requestData = {
        text: inputText,
        snr: snrValue // Use the SNR value from the slider
      };
      
      const response = await fetch(`${BACKEND_URL}/run-awgn-auto`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestData)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server response error:', errorText);
        throw new Error('Failed to run AWGN simulation');
      }
      
      const result = await response.json();
      console.log('AWGN simulation response:', result);
      return { success: true };
    } catch (error) {
      console.error('Error running AWGN simulation:', error);
      return { success: false };
    }
  }
);

const semanticSlice = createSlice({
  name: 'semantic',
  initialState,
  reducers: {
    setInputText: (state, action: PayloadAction<string>) => {
      state.inputText = action.payload;
    },
    setSemanticSummary: (state, action: PayloadAction<string>) => {
      state.semanticSummary = action.payload;
    },
    setNoiseVariance: (state, action: PayloadAction<number>) => {
      state.noiseVariance = action.payload;
    },
    setSimilarityThreshold: (state, action: PayloadAction<number>) => {
      state.similarityThreshold = action.payload;
    },
    setTransmissionMode: (state, action: PayloadAction<TransmissionMode>) => {
      state.transmissionMode = action.payload;
    },
    setNoisyLOSVector: (state, action: PayloadAction<SemanticVector>) => {
      state.noisyLOSVector = action.payload;
    },
    setNoisyRelayVector: (state, action: PayloadAction<SemanticVector | null>) => {
      state.noisyRelayVector = action.payload;
    },
    setCombinedVector: (state, action: PayloadAction<SemanticVector | null>) => {
      state.combinedVector = action.payload;
    },
    setApiKey: (state, action: PayloadAction<string>) => {
      state.apiKey = action.payload;
      geminiService.setApiKey(action.payload);
    },
    setUseSentenceTransformer: (state, action: PayloadAction<boolean>) => {
      state.useSentenceTransformer = action.payload;
    },
    setSNRValue: (state, action: PayloadAction<number>) => {
      state.snrValue = action.payload;
    },
    setTextNoise: (state, action: PayloadAction<{
      type?: 'delete' | 'replace' | 'permutation',
      probability?: number,
      range?: number,
      fillerToken?: string,
      appliedNoisyText?: string
    }>) => {
      if (action.payload.type !== undefined) {
        state.textNoiseType = action.payload.type;
      }
      if (action.payload.probability !== undefined) {
        state.textNoiseProbability = action.payload.probability;
      }
      if (action.payload.range !== undefined) {
        state.textNoiseRange = action.payload.range;
      }
      if (action.payload.fillerToken !== undefined) {
        state.textNoiseFillerToken = action.payload.fillerToken;
      }
      if (action.payload.appliedNoisyText !== undefined) {
        state.noisyTextOutput = action.payload.appliedNoisyText;
      }
    }
  },
  extraReducers: builder => {
    builder
      // Encode text
      .addCase(encodeText.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(encodeText.fulfilled, (state, action) => {
        state.originalVector = action.payload;
        state.isLoading = false;
      })
      .addCase(encodeText.rejected, (state) => {
        state.isLoading = false;
      })
      
      // Process communication
      .addCase(processCommunication.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(processCommunication.fulfilled, (state, action) => {
        state.semanticSimilarity = action.payload.semanticSimilarity;
        state.reconstructedText = action.payload.reconstructedText;
        state.isLoading = false;
      })
      .addCase(processCommunication.rejected, (state) => {
        state.isLoading = false;
      });
  }
});

export const { 
  setInputText, 
  setSemanticSummary,
  setNoiseVariance, 
  setSimilarityThreshold,
  setTransmissionMode,
  setApiKey,
  setUseSentenceTransformer,
  setSNRValue,
  setTextNoise 
} = semanticSlice.actions;

export default semanticSlice.reducer;