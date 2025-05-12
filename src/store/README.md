# Redux Store

This directory contains the Redux store configuration and slice definitions for the semantic communication system.

## Store Structure

The Redux store is organized into the following files:

### index.ts

Configures and exports the Redux store:

- Sets up the Redux store with appropriate middleware
- Combines reducers from different slices
- Configures Redux DevTools integration for development
- Provides TypeScript type definitions for the store

```typescript
import { configureStore } from '@reduxjs/toolkit';
import semanticReducer from './semanticSlice';

export const store = configureStore({
  reducer: {
    semantic: semanticReducer,
    // Additional reducers would be added here
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({
    serializableCheck: false // Allows non-serializable values in state
  }),
  devTools: process.env.NODE_ENV !== 'production'
});
```

### semanticSlice.ts

The core slice that manages the semantic communication state:

- Defines the structure of the semantic communication state
- Implements reducer functions for state updates
- Provides async thunks for API operations
- Handles the complete communication flow from transmitter to receiver

#### Key Features:

1. **State Structure**:
   - Input text and processed vectors
   - Noise parameters and channel conditions
   - Transmission mode settings
   - Processing results and metrics
   - Relay configuration parameters

2. **Async Operations**:
   - Text encoding into semantic vectors
   - Vector decoding back to text
   - Communication process simulation
   - AWGN simulation execution
   - BPSK text transmission

3. **Reducer Logic**:
   - Parameter updates (noise, SNR, etc.)
   - Mode changes (transmission, relay)
   - Result storage and processing
   - Vector manipulation and storage

### types.ts

Defines TypeScript interfaces and types used throughout the application:

- `SemanticState`: The structure of the semantic communication state
- `SemanticVector`: Type definition for semantic vector data
- `TransmissionMode`: Enum for different transmission modes
- `RelayMode`: Enum for relay operation modes
- `ActivePath`: Enum for tracking active communication paths
- `TextComparisonResult`: Interface for comparison results
- `BPSKResult`: Interface for BPSK simulation results

```typescript
export enum TransmissionMode {
  LOS = 'LOS',            // Direct Line-of-Sight
  RELAY = 'RELAY'         // Relay-assisted
}

export enum RelayMode {
  DF = 'DF',              // Decode-and-Forward
  AF = 'AF'               // Amplify-and-Forward
}

export interface SemanticState {
  inputText: string;
  originalVector: SemanticVector | null;
  noisyLOSVector: SemanticVector | null;
  // Additional fields...
}
```

## Implementation Details

### State Management Flow

The semantic communication process follows this flow in the Redux store:

1. **Text Input**: Stored in state via `setInputText` action
2. **Vector Encoding**: Processed through `encodeText` async thunk
3. **Channel Simulation**: Handled by `processCommunication` thunk
   - Adds noise to the semantic vector
   - Simulates BPSK transmission in parallel
   - Processes relay paths if enabled
4. **Text Reconstruction**: Converts noisy vector back to text
5. **Performance Analysis**: Calculates similarity and error metrics

### Usage Example

```typescript
// In a React component
import { useDispatch } from 'react-redux';
import { setInputText, processCommunication } from '../store/semanticSlice';

const dispatch = useDispatch();

// Update input text
dispatch(setInputText("Hello, semantic communication!"));

// Process the complete communication pipeline
dispatch(processCommunication());
```

## Advanced Features

### Relay Communication

The store manages relay-assisted communication with:

- Path selection logic based on SNR thresholds
- Different processing for DF and AF modes
- Path loss calculations based on distance
- Signal combination at the destination

### Iterative Processing

Supports iterative text reconstruction for challenging channel conditions:

- Multiple passes through the LLM for refinement
- Tracking of iteration count and convergence
- Comparison of results between iterations
- Automatic termination when quality targets are reached
