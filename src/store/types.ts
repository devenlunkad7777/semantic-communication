import { SemanticVector } from '../utils/semanticEmbedding';

export enum TransmissionMode {
  LOS = 'line-of-sight', // Direct transmission
  RELAY = 'relay-assisted' // Relay-assisted transmission
}

export interface SemanticState {
  inputText: string;
  originalVector: SemanticVector | null;
  noisyLOSVector: SemanticVector | null;
  noisyRelayVector: SemanticVector | null;
  combinedVector: SemanticVector | null;
  reconstructedText: string;
  semanticSummary: string; // Added semanticSummary to store the LLM processed text
  noiseVariance: number;
  similarityThreshold: number;
  semanticSimilarity: number | null;
  transmissionMode: TransmissionMode;
  isLoading: boolean;
  apiKey: string;
  useSentenceTransformer: boolean; // Flag to use local sentence transformer service
  snrValue: number; // SNR value in dB for AWGN simulation
  // Text noise properties
  textNoiseType: 'delete' | 'replace' | 'permutation';
  textNoiseProbability: number;
  textNoiseRange: number;
  textNoiseFillerToken: string;
  noisyTextOutput: string;
}

export interface RootState {
  semantic: SemanticState;
}