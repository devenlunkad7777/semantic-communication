# Receiver Components

This module implements the receiver side of the semantic communication system, responsible for processing received signals and reconstructing the original message.

## Components

### Receiver

The `Receiver` component handles the processing and display of received messages:

- Visualizes the received semantic vector after channel transmission
- Displays the reconstructed message from the semantic vector
- Shows the semantic similarity between original and reconstructed messages
- Provides reconstruction quality metrics based on channel conditions
- Supports iterative reconstruction for improved quality

## Technical Details

### Semantic Decoding Process

The receiver transforms the noisy semantic vector back into human-readable text:

1. The noisy vector is processed by the LLM (OpenAI/Gemini API)
2. The LLM attempts to reconstruct the original semantic meaning
3. The semantic meaning is converted back into natural language text
4. The reconstructed text is compared with the original for similarity assessment

### Semantic Similarity Calculation

The system calculates semantic similarity using cosine similarity between vector embeddings:

```javascript
function calculateCosineSimilarity(vec1, vec2) {
  const dotProduct = vec1.reduce((sum, val, i) => sum + val * vec2[i], 0);
  const mag1 = Math.sqrt(vec1.reduce((sum, val) => sum + val * val, 0));
  const mag2 = Math.sqrt(vec2.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (mag1 * mag2);
}
```

### Iterative Reconstruction

For challenging channel conditions, the receiver implements iterative reconstruction:

1. Initial reconstruction is performed on the noisy vector
2. The result is passed back through the system for further refinement
3. Each iteration potentially improves reconstruction quality
4. The process continues until convergence or a preset iteration limit

### Error Analysis

The receiver analyzes errors in reconstruction:

- Word-level error detection
- Semantic drift identification
- Context preservation assessment
- Information loss quantification

## Usage

1. After message transmission, observe the reconstructed text
2. Compare with the original message to assess communication quality
3. Check semantic similarity score for objective quality assessment
4. For poor channel conditions, initiate iterative reconstruction
5. Analyze error patterns to optimize channel parameters
