# Cooperative Semantic Communication Web Application

A visual demonstration of end-to-end semantic communication under direct line-of-sight (LOS) and relay-assisted semantic combining modes.

## Overview

This web application demonstrates semantic communication principles by:

1. Converting user text input into semantic vectors (embeddings)
2. Simulating transmission through a noisy channel
3. Reconstructing the original message from noisy vectors
4. Showing how relay-assisted semantic combining can improve performance

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

### Semantic Decoding (Receiver)
- Reconstruction of the original text from noisy vectors
- Side-by-side comparison of original and reconstructed text with highlighted differences

### Transmission Modes
- **Direct Line-of-Sight (LOS)**: Direct transmission from transmitter to receiver
- **Relay-Assisted**: When the semantic similarity falls below a threshold, two noisy copies are combined to improve reception quality

### Visualization
- Interactive flow diagram showing the transmission path
- Animated packets representing semantic data transmission
- Vector visualizations showing the original, noisy, and combined semantic representations

## Technology Stack

- **Frontend**: React with TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Visualization**: D3.js
- **State Management**: Redux Toolkit
- **API Integration**: Axios for Google Gemini API calls

## Getting Started

### Prerequisites
- Node.js (v14 or later)
- A Google Gemini API key for semantic encoding/decoding

### Installation

1. Clone the repository
```
git clone https://github.com/yourusername/cooperative-semantic-communication.git
cd cooperative-semantic-communication
```

2. Install dependencies
```
npm install
```

3. Start the development server
```
npm start
```

4. Open your browser and navigate to `http://localhost:3000`

## Usage

1. Enter your Google Gemini API key in the Settings menu (top-right corner)
2. Type a sentence in the input field and click "Transmit"
3. Adjust the noise variance slider to see how it affects transmission quality
4. Toggle between LOS and Relay-Assisted modes to compare performance
5. Observe the flow diagram to see the active transmission path
6. Compare the original and reconstructed text to evaluate performance

## Implementation Details

### Semantic Vector Handling
- Texts are converted to dense embedding vectors using Google's Gemini embedding-001 model
- For development without an API key, mock vectors are generated deterministically

### Noise Simulation
- Gaussian noise is applied using the Box-Muller transform
- Adjustable variance controls the noise intensity

### Relay Mechanism
- Activates when cosine similarity between original and noisy vectors falls below a threshold
- Combines two independent noisy copies using weighted averaging

### User Interface
- Responsive design works on both desktop and mobile
- Real-time visualizations update as parameters change
- Dark/light mode support

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- Google for Gemini API
- React and Redux communities for excellent documentation
