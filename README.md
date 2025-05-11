# Cooperative Semantic Communication Web Application

A visual demonstration of end-to-end semantic communication under direct line-of-sight (LOS) and relay-assisted semantic combining modes.

## Quick Start - Semantic Communication Flow

To run the semantic communication flow demonstration:

```bash
python main.py flow
```

or for an interactive experience:

```bash
python main.py
```

This will demonstrate:
1. User input text
2. LLM processing of the text (with prompt shown)
3. BPSK noise addition to the processed text
4. LLM reconstruction of the noisy text (with prompt shown)
5. Calculation of semantic similarity between original and reconstructed text
6. Relay-assisted communication with performance comparison

### Using Real LLM APIs

The demonstration uses mock LLM responses by default, but you can connect to real LLM APIs:

1. Copy `.env.example` to `.env` and add your API keys:
   ```
   OPENAI_API_KEY=your_api_key_here
   GEMINI_API_KEY=your_api_key_here
   ```

2. Modify `semantic_server.py` and `demo_flow.py` to use the actual API calls:
   ```python
   # In semantic_server.py and demo_flow.py, uncomment:
   from llm_service import call_llm_api
   
   # And replace mock implementations with:
   processed_text = call_llm_api(prompt)
   ```

## Overview

This web application demonstrates semantic communication principles by:

1. Converting user text input into semantic vectors (embeddings)
2. Simulating transmission through a noisy channel
3. Reconstructing the original message from noisy vectors
4. Showing how relay-assisted semantic combining can improve performance
5. Comparing different relay modes: Decode-and-Forward (DF) and Amplify-and-Forward (AF)

## Running the Backend

### Option 1: Demo Mode
```bash
python demo_flow.py
```
A simple demonstration of the semantic flow with console output.

### Option 2: Interactive CLI
```bash
python main.py flow
```
Interactive command-line interface for the semantic flow.

### Option 3: Web Server
```bash
python semantic_server.py
```
Start the Flask server to expose API endpoints for the semantic communication flow.

API endpoints:
- POST `/semantic-flow` - Run the complete flow (input → LLM → BPSK → LLM → similarity)
- POST `/bpsk-text-noise` - Add BPSK noise to text
- POST `/reconstruct-text` - Reconstruct noisy text using LLM
- POST `/calculate-similarity` - Calculate similarity between two texts
- POST `/run-awgn-auto` - Run AWGN simulation with automatic parameters

## Features

### User Input
- Text entry for arbitrary sentences to transmit

### Semantic Encoding (Transmitter)
- Conversion of text to semantic vectors using Google Gemini embeddings API
- Visual representation of semantic vectors

### Channel Simulation
- Configurable AWGN (Additive White Gaussian Noise) channel
- Adjustable noise variance via slider
- Real-time visualization of noise effects on semantic vectors

### Relay-Assisted Communication
- Two relay modes:
  - **Decode-and-Forward (DF)**: Relay decodes the message before forwarding, offering better error correction
  - **Amplify-and-Forward (AF)**: Relay amplifies the received signal without decoding, simpler but propagates noise
- Configurable relay parameters:
  - Base Station to Relay Distance
  - Relay to Destination Distance
  - Path Loss Exponent
  - Noise Power
  - SNR Threshold
- Performance metrics comparison between relay modes:
  - Outage Probability
  - Ergodic Capacity
  - Bit Error Rate

### Semantic Decoding (Receiver)
- Reconstruction of the original text from noisy vectors
- Side-by-side comparison of original and reconstructed text with highlighted differences
- Path indicator showing which communication path (LOS or Relay) was used for the final output

### Transmission Modes
- **Direct Line-of-Sight (LOS)**: Direct transmission from transmitter to receiver
- **Relay-Assisted**: When the semantic similarity falls below a threshold, two noisy copies are combined to improve reception quality

### Visualization
- Interactive flow diagram showing the transmission path
- Animated packets representing semantic data transmission
- Vector visualizations showing the original, noisy, and combined semantic representations
- Relay flow diagram illustrating the relay-assisted communication process

## Technology Stack

- **Frontend**: React with TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Visualization**: D3.js
- **State Management**: Redux Toolkit
- **API Integration**: Axios for Google Gemini API calls
- **Backend**: Python with Flask
- **Semantic Similarity**: Sentence-Transformers (all-MiniLM-L6-v2 model)

## Getting Started

### Prerequisites
- Node.js (v14 or later)
- Python 3.8 or later
- A Google Gemini API key for semantic encoding/decoding (optional)

### Installation

1. Clone the repository
```
git clone https://github.com/yourusername/cooperative-semantic-communication.git
cd cooperative-semantic-communication
```

2. Install frontend dependencies
```
npm install
```

3. Install Python backend dependencies
```
pip install -r requirements.txt
```

4. Start the semantic server
```
python semantic_server.py
```

5. In a new terminal, start the development server
```
npm start
```

4. Open your browser and navigate to `http://localhost:3000`

## Usage

1. Enter your Google Gemini API key in the Settings menu (top-right corner)
2. Type a sentence in the input field and click "Transmit"
3. Adjust the noise variance slider to see how it affects transmission quality
4. Toggle between LOS and Relay-Assisted modes to compare performance
5. When in Relay mode, choose between DF and AF relay methods
6. Adjust relay parameters to optimize performance
7. Observe the flow diagram to see the active transmission path
8. Compare the original and reconstructed text to evaluate performance
9. Check the path indicator in the receiver to see which path was used

## Implementation Details

### Semantic Vector Handling
- Texts are converted to dense embedding vectors using Google's Gemini embedding-001 model
- For development without an API key, mock vectors are generated deterministically

### Noise Simulation
- Gaussian noise is applied using the Box-Muller transform
- Adjustable variance controls the noise intensity

### Relay Mechanism
- Two relay protocols implemented:
  - **Decode-and-Forward (DF)**: The relay decodes the received signal, re-encodes it, and then transmits it to the destination
  - **Amplify-and-Forward (AF)**: The relay simply amplifies the received signal (including noise) and forwards it to the destination
- Path selection based on SNR comparison and configurable threshold
- Path tracking to indicate which path (LOS or Relay) was used for the final output

### Performance Metrics
- **Outage Probability**: Probability that the received SNR falls below the threshold
- **Ergodic Capacity**: Average channel capacity over fading distribution
- **Bit Error Rate**: Ratio of bit errors to total transmitted bits

### User Interface
- Responsive design works on both desktop and mobile
- Real-time visualizations update as parameters change
- Dark/light mode support
- Visual indicators for active communication paths

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- Google for Gemini API
- React and Redux communities
- Sentence-Transformers for semantic similarity calculations
