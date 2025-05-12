# Utils

This directory contains utility modules that provide core functionality for the semantic communication system.

## Utility Modules

### semanticEmbedding.ts

The `semanticEmbedding` module implements fundamental operations for semantic vector processing:

- Vector generation and manipulation
- Noise addition and simulation
- Similarity calculations
- Bandwidth estimation

#### Key Functions:

##### Vector Operations

```typescript
// Add Gaussian noise to a semantic vector
export function addGaussianNoise(vector: SemanticVector, noiseVariance: number): SemanticVector {
  return vector.map(value => {
    const noise = Math.sqrt(noiseVariance) * normalRandom();
    return value + noise;
  });
}

// Combine two semantic vectors with weighting
export function combineVectors(vec1: SemanticVector, vec2: SemanticVector, weight: number): SemanticVector {
  return vec1.map((value, index) => {
    return (weight * value) + ((1 - weight) * vec2[index]);
  });
}
```

##### Similarity Calculations

```typescript
// Calculate cosine similarity between vectors
export function calculateCosineSimilarity(vec1: SemanticVector, vec2: SemanticVector): number {
  const dotProduct = vec1.reduce((sum, val, i) => sum + val * vec2[i], 0);
  const mag1 = Math.sqrt(vec1.reduce((sum, val) => sum + val * val, 0));
  const mag2 = Math.sqrt(vec2.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (mag1 * mag2);
}

// Get similarity from backend sentence-transformer model
export async function getCachedModelSimilarity(text1: string, text2: string): Promise<number> {
  // Implementation details...
}
```

##### Bandwidth Estimation

```typescript
// Estimate bandwidth savings through semantic processing
export function estimateBandwidth(originalText: string, semanticSummary: string): {
  compressionRatio: number;
  bytesSaved: number;
  percentageSaved: number;
} {
  const originalBytes = new TextEncoder().encode(originalText).length;
  const summaryBytes = new TextEncoder().encode(semanticSummary).length;
  
  const compressionRatio = originalBytes / summaryBytes;
  const bytesSaved = originalBytes - summaryBytes;
  const percentageSaved = (bytesSaved / originalBytes) * 100;
  
  return {
    compressionRatio,
    bytesSaved,
    percentageSaved
  };
}
```

### Testing

The `semanticEmbedding.test.ts` file contains unit tests for the semantic embedding utilities:

- Vector operation tests
- Noise addition verification
- Similarity calculation validation
- Boundary condition handling

## Mathematical Background

### Cosine Similarity

Cosine similarity measures the cosine of the angle between two vectors, providing a similarity score between -1 and 1:

```
cos(θ) = (A·B) / (||A|| × ||B||)
```

Where:
- A·B is the dot product of vectors A and B
- ||A|| and ||B|| are the Euclidean norms (magnitudes) of vectors A and B

### Gaussian Noise Generation

The Box-Muller transform is used to generate Gaussian-distributed random variables:

```
Z₀ = √(-2 ln U₁) × cos(2π × U₂)
Z₁ = √(-2 ln U₁) × sin(2π × U₂)
```

Where:
- U₁ and U₂ are independent random variables uniformly distributed between 0 and 1
- Z₀ and Z₁ are independent random variables with a standard normal distribution

## Usage

Utility functions are used throughout the application, particularly in the Redux slice operations and component logic:

```typescript
// Example usage in a component
const noisyVector = addGaussianNoise(originalVector, noiseVariance);
const similarity = calculateCosineSimilarity(originalVector, noisyVector);
```
