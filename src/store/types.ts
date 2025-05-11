import { SemanticVector } from '../utils/semanticEmbedding';

export enum TransmissionMode {
  LOS = 'line-of-sight', // Direct transmission
  RELAY = 'relay-assisted' // Relay-assisted transmission
}

export enum RelayMode {
  DF = 'decode-and-forward',
  AF = 'amplify-and-forward'
}

export enum ActivePath {
  LOS = 'line-of-sight',
  RELAY = 'relay-assisted',
  NONE = 'none'
}

export interface BPSKResult {
  original_text: string;
  received_text: string;
  ber: number;
  ebno_db: number;
  bit_count: number;
  error_bits: number;
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
  // BPSK simulation properties
  ebnoValue: number; // Eb/N0 value in dB for BPSK simulation
  bpskResult: BPSKResult | null; // Result of BPSK simulation
  bpskNoisyText: string; // Noisy text received through BPSK channel
  bpskReconstructedText: string; // Text reconstructed from BPSK noisy text by LLM
  // Text noise properties
  textNoiseType: 'delete' | 'replace' | 'permutation';
  textNoiseProbability: number;
  textNoiseRange: number;
  textNoiseFillerToken: string;
  noisyTextOutput: string;
  // Iteration tracking for BPSK reconstruction
  iterationCount: number;
  // Relay communication parameters
  relayMode: RelayMode;
  distanceBR: number;  // Distance: Base Station to Relay (in meters)
  distanceRD: number;  // Distance: Relay to Destination (in meters)
  pathLossExponent: number; // Path-loss exponent
  noisePower: number;  // Noise power (Watts)
  snrThreshold: number; // SNR threshold (linear scale)
  activePath: ActivePath; // Tracks which path (LOS or Relay) was used for the output
}

export interface RootState {
  semantic: SemanticState;
}