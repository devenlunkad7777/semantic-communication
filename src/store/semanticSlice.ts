import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { SemanticState, TransmissionMode, RelayMode, ActivePath } from './types';
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
  // BPSK simulation properties
  ebnoValue: 10, // Default Eb/N0 value of 10dB
  bpskResult: null,
  bpskNoisyText: '',
  bpskReconstructedText: '',
  // Text noise properties
  textNoiseType: 'delete',
  textNoiseProbability: 0.2,
  textNoiseRange: 3,
  textNoiseFillerToken: 'BLANK',
  noisyTextOutput: '',
  // Added iteration count for BPSK reconstruction
  iterationCount: 0,
  // Relay communication parameters
  relayMode: RelayMode.DF,
  distanceBR: 10,        // Distance: Base Station to Relay (in meters)
  distanceRD: 10,        // Distance: Relay to Destination (in meters)
  pathLossExponent: 2.5, // Path-loss exponent
  noisePower: 0.001,     // Noise power (Watts) = 1e-3
  snrThreshold: 0.1,     // SNR threshold (linear scale)
  activePath: ActivePath.NONE, // Initially no path is active
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
  async (
    params: { 
      text?: string; 
      isIteration?: boolean; 
      iterationNumber?: number 
    } = {}, 
    { getState, dispatch }
  ) => {
    const state = (getState() as any).semantic as SemanticState;
    
    // If this is an iteration, use the provided text and update iteration count
    const textToProcess = params.text || state.inputText;
    const isIteration = params.isIteration || false;
    const iterationNumber = params.iterationNumber || 0;
    
    // If this is an iteration, update the iteration count
    if (isIteration) {
      dispatch(semanticSlice.actions.setIterationCount(iterationNumber));
    } else {
      // Reset iteration count for new transmissions
      dispatch(semanticSlice.actions.setIterationCount(0));
    }
    
    // For non-iterations, encode the input text to get a vector
    // For iterations, we skip this step as we're working with the already reconstructed text
    if (!isIteration && !state.originalVector) {
      await dispatch(encodeText(textToProcess)).unwrap();
    }
    
    // Update state with the text being processed
    if (!isIteration) {
      dispatch(semanticSlice.actions.setInputText(textToProcess));
    }
    
    // Get the current state with potentially updated values
    const currentState = (getState() as any).semantic as SemanticState;
    
    // For non-iterations, handle the semantic vector channel
    let noisyLOSVector = currentState.noisyLOSVector;
    if (!isIteration && currentState.originalVector) {
      // Add noise to the original vector (LOS path)
      noisyLOSVector = addGaussianNoise(currentState.originalVector, currentState.noiseVariance);
      
      // Update state
      dispatch(semanticSlice.actions.setNoisyLOSVector(noisyLOSVector));
    }
    
    // Run BPSK simulation in parallel for the physical channel
    // In case of iteration, use the reconstructed text from the previous iteration
    let textToTransmit = isIteration ? 
      textToProcess : 
      (currentState.semanticSummary || textToProcess);
    
    let bpskNoisyText = "";
    
    try {
      // Run BPSK text transmission simulation with the current Eb/N0 value
      const BACKEND_URL = 'http://localhost:5000';
      const bpskResponse = await fetch(`${BACKEND_URL}/bpsk-text-noise`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          text: textToTransmit,
          ebno_db: currentState.ebnoValue // Use the Eb/N0 value from state
        })
      });
      
      if (bpskResponse.ok) {
        const bpskResult = await bpskResponse.json();
        bpskNoisyText = bpskResult.received_text;
        
        // Store the BPSK result in state
        dispatch(semanticSlice.actions.setBPSKResult(bpskResult));
        dispatch(semanticSlice.actions.setBPSKNoisyText(bpskNoisyText));
      }
    } catch (error) {
      console.error('BPSK simulation error:', error);
      // Continue with the normal semantic decoding even if BPSK fails
    }
    
    // We need to get reconstructed text first to calculate semantic similarity
    let semanticReconstructedText = "";
    
    // Only do semantic vector processing for non-iterations or if we have a vector
    if (!isIteration && noisyLOSVector) {
      let vectorToUse: SemanticVector = noisyLOSVector;
      
      // Check if we should use relay mode
      const vectorSimilarity = Math.max(0, 1 - (currentState.noiseVariance * 10));
      
      if (vectorSimilarity < currentState.similarityThreshold && currentState.transmissionMode === TransmissionMode.RELAY) {
        // Generate a second noisy vector (relay path)
        const noisyRelayVector = addGaussianNoise(currentState.originalVector!, currentState.noiseVariance);
        
        // Handle relay processing based on mode
        let processedRelayVector = noisyRelayVector;
        
        if (currentState.relayMode === RelayMode.DF) {
          // Decode-and-Forward (DF) Mode:
          // 1. We simulate decoding at the relay by passing the noisy relay vector to LLM
          // 2. Then re-encode the processed result as a new vector
          try {
            // For simulation purposes, we'll represent this by regenerating a vector with less noise
            // In a real implementation, this would involve actual LLM decoding and reprocessing
            processedRelayVector = addGaussianNoise(
              currentState.originalVector!, 
              currentState.noiseVariance * 0.6  // Reduced noise after DF processing
            );
          } catch (error) {
            console.error('Error in DF relay processing:', error);
          }
        } else {
          // Amplify-and-Forward (AF) Mode:
          // Apply path loss based on distance and amplify
          
          // Calculate path loss based on distance and exponent
          const pathLossFactorBR = Math.pow(currentState.distanceBR, -currentState.pathLossExponent);
          const pathLossFactorRD = Math.pow(currentState.distanceRD, -currentState.pathLossExponent);
          
          // Apply path loss to relay vector (simulated by increasing noise variance)
          const relayPathLossNoise = currentState.noiseVariance * (1 + (1 - pathLossFactorBR));
          
          // For AF mode, the relay just amplifies (which we simulate by slightly reducing the noise)
          const amplificationFactor = 1 / Math.sqrt(relayPathLossNoise + currentState.noisePower);
          processedRelayVector = noisyRelayVector.map(value => value * amplificationFactor);
        }
        
        // Combine the two vectors using a weighted averaging approach
        // For DF, give more weight to relay vector as it's been through semantic processing 
        // For AF, use equal weights since both paths have similar reliability
        const relayWeight = currentState.relayMode === RelayMode.DF ? 0.6 : 0.5;
        const combinedVector = combineVectors(noisyLOSVector, processedRelayVector, 1 - relayWeight);
        
        vectorToUse = combinedVector;
        
        // Set the active path to RELAY since we're using relay-assisted communication
        dispatch(semanticSlice.actions.setActivePath(ActivePath.RELAY));
        
        // Update state with all vectors
        dispatch(semanticSlice.actions.setNoisyRelayVector(processedRelayVector));
        dispatch(semanticSlice.actions.setCombinedVector(combinedVector));
      } else {
        // Set the active path to LOS since we're using direct line-of-sight
        dispatch(semanticSlice.actions.setActivePath(ActivePath.LOS));
        
        // Update state
        dispatch(semanticSlice.actions.setNoisyRelayVector(null));
        dispatch(semanticSlice.actions.setCombinedVector(null));
      }
      
      // Decode the vector back to text for semantic channel
      semanticReconstructedText = await dispatch(decodeVector(vectorToUse)).unwrap();
    }
    
    // Process BPSK noisy text through LLM for reconstruction
    let bpskReconstructedText = "";
    if (bpskNoisyText) {
      try {
        // Send the noisy BPSK text to the LLM for reconstruction
        bpskReconstructedText = await geminiService.reconstructTextFromPhysicalError(
          isIteration ? textToProcess : currentState.inputText, // Use the appropriate original text
          bpskNoisyText,
          iterationNumber // Pass iteration number for context
        );
        
        // Store the reconstructed text
        dispatch(semanticSlice.actions.setBPSKReconstructedText(bpskReconstructedText));
      } catch (error) {
        console.error('Error reconstructing from BPSK noisy text:', error);
        // If reconstruction fails, continue with normal semantic decoding
      }
    }
    
    // Now calculate semantic similarity between original and reconstructed text
    // Always use the Python backend server for similarity calculation
    let semanticSimilarity: number;
    
    // Choose which reconstructed text to use for similarity calculation and display
    // Use BPSK reconstructed text if available, otherwise use semantic reconstructed text
    const finalReconstructedText = bpskReconstructedText || semanticReconstructedText;
    
    try {
      // For iteration, compare with the input text for that iteration
      // For initial transmission, compare with the original input
      const referenceText = isIteration ? textToProcess : currentState.inputText;
      
      // Use the Python sentence-transformer model via the backend server
      semanticSimilarity = await getCachedModelSimilarity(
        referenceText, 
        finalReconstructedText
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
      reconstructedText: finalReconstructedText,
      bpskNoisyText,
      bpskReconstructedText,
      iterationCount: iterationNumber
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
    },
    setEbnoValue: (state, action: PayloadAction<number>) => {
      state.ebnoValue = action.payload;
    },
    setBPSKResult: (state, action: PayloadAction<any>) => {
      state.bpskResult = action.payload;
      state.bpskNoisyText = action.payload.received_text;
    },
    setBPSKNoisyText: (state, action: PayloadAction<string>) => {
      state.bpskNoisyText = action.payload;
    },
    setBPSKReconstructedText: (state, action: PayloadAction<string>) => {
      state.bpskReconstructedText = action.payload;
    },
    setIterationCount: (state, action: PayloadAction<number>) => {
      state.iterationCount = action.payload;
    },
    // Relay communication parameter actions
    setRelayMode: (state, action: PayloadAction<RelayMode>) => {
      state.relayMode = action.payload;
    },
    setDistanceBR: (state, action: PayloadAction<number>) => {
      state.distanceBR = action.payload;
    },
    setDistanceRD: (state, action: PayloadAction<number>) => {
      state.distanceRD = action.payload;
    },
    setPathLossExponent: (state, action: PayloadAction<number>) => {
      state.pathLossExponent = action.payload;
    },
    setNoisePower: (state, action: PayloadAction<number>) => {
      state.noisePower = action.payload;
    },
    setSnrThreshold: (state, action: PayloadAction<number>) => {
      state.snrThreshold = action.payload;
    },
    setActivePath: (state, action: PayloadAction<ActivePath>) => {
      state.activePath = action.payload;
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
        state.iterationCount = action.payload.iterationCount;
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
  setTextNoise,
  setEbnoValue,
  setBPSKResult,
  setBPSKNoisyText,
  setBPSKReconstructedText,
  setIterationCount,  // Export the new action
  // Relay communication parameter actions
  setRelayMode,
  setDistanceBR,
  setDistanceRD,
  setPathLossExponent,
  setNoisePower,
  setSnrThreshold,
  setActivePath
} = semanticSlice.actions;

export default semanticSlice.reducer;