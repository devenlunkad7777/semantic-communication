# Semantic Communication System Components

This directory contains the React components that implement the Semantic Communication System. The components are organized into logical modules based on their role in the communication process.

## Module Structure

The component system is organized into the following modules:

### [Transmitter](./transmitter/README.md)
Components responsible for text input and semantic encoding:
- Text input interface
- Semantic summarization
- Vector encoding
- Bandwidth estimation

### [Channel](./channel/README.md)
Components simulating different communication channels and noise models:
- AWGN channel simulation
- BPSK modulation and transmission
- Text-level noise simulation
- Noisy text visualization

### [Relay](./relay/README.md)
Components implementing relay-assisted communication:
- Decode-and-Forward (DF) relay mode
- Amplify-and-Forward (AF) relay mode
- Path loss modeling
- Performance visualization

### [Receiver](./receiver/README.md)
Components handling message reception and reconstruction:
- Semantic vector processing
- Message reconstruction
- Similarity calculation
- Error analysis

### [Visualization](./visualization/README.md)
Components providing visual representations of the system:
- AWGN plot display
- Flow diagrams
- Vector visualizations
- Performance metrics

### [Common](./common/README.md)
Reusable UI components used throughout the system:
- Buttons and form controls
- Model settings panel
- Theme toggle
- Interactive modals

## Communication Flow

The system implements a complete semantic communication pipeline:

1. **Input & Encoding**: User text is encoded into semantic vectors
2. **Channel Simulation**: Vectors pass through simulated noisy channels
3. **Relay Processing**: Optional relay paths provide diversity gain
4. **Reception & Reconstruction**: Noisy vectors are reconstructed into text
5. **Evaluation**: Similarity metrics assess communication quality

## Integration

The components integrate with the Redux store to maintain application state:
- `semanticSlice.ts`: Contains the state and actions for the semantic system
- `types.ts`: Defines TypeScript types used throughout the components
- `services/`: Contains API services for LLM communication

## Technologies

- React 18+
- TypeScript
- Redux Toolkit
- TailwindCSS
- Sentence Transformers API
- OpenAI/Gemini API integration

## Implementation Details

For detailed information about each component module, please refer to the README files in the respective directories:
- [Transmitter README](./transmitter/README.md)
- [Channel README](./channel/README.md)
- [Relay README](./relay/README.md)
- [Receiver README](./receiver/README.md)
- [Visualization README](./visualization/README.md)
- [Common README](./common/README.md)
