# Transmitter Components

This module implements the transmitter side of the semantic communication system, responsible for text input and preprocessing.

## Components

### TextInput

The `TextInput` component provides the user interface for entering the message to be transmitted through the semantic communication channel. It handles:

- User text input with character count visualization
- Dispatching the input text to the Redux store
- Triggering text encoding into semantic vectors
- Initiating simulations (AWGN, BPSK) with the provided text

### LlmSummaryDisplay

The `LlmSummaryDisplay` component visualizes the output of the LLM's semantic processing:

- Displays the semantic summary of the input text
- Shows the extracted core meaning that will be transmitted
- Visualizes bandwidth savings through semantic compression
- Calculates compression ratio: `original_text_length / semantic_summary_length`

## Technical Details

### Semantic Encoding Process

The transmitter uses model embeddings to transform the input text into semantic vectors:

1. The input text is processed by the LLM (OpenAI/Gemini API)
2. The LLM extracts the core semantic meaning
3. The semantic meaning is encoded into a high-dimensional vector
4. This vector representation is what gets transmitted through the channel

### Bandwidth Estimation

The component estimates potential bandwidth savings through semantic analysis:

```javascript
const bandwidthSavings = estimateBandwidth(originalText, semanticSummary);
```

Where the bandwidth calculation considers:
- Character-level compression
- Information density
- Semantic preservation score

## Usage

1. Enter your message in the text input field
2. The system automatically processes it into a semantic representation
3. The semantic summary is displayed, showing what will be transmitted
4. Observe the estimated bandwidth savings through semantic processing
