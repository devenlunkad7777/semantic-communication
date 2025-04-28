import { 
  calculateCosineSimilarity, 
  addGaussianNoise, 
  combineVectors, 
  SemanticVector 
} from './semanticEmbedding';

describe('Semantic Embedding Utilities', () => {
  // Test vector data
  const vectorA: SemanticVector = [0.1, 0.2, 0.3, 0.4, 0.5];
  const vectorB: SemanticVector = [0.5, 0.4, 0.3, 0.2, 0.1];
  const sameVector: SemanticVector = [0.1, 0.2, 0.3, 0.4, 0.5];
  const zeroVector: SemanticVector = [0, 0, 0, 0, 0];
  
  describe('calculateCosineSimilarity', () => {
    test('should return 1.0 for identical vectors', () => {
      const similarity = calculateCosineSimilarity(vectorA, sameVector);
      expect(similarity).toBeCloseTo(1.0);
    });
    
    test('should handle orthogonal vectors', () => {
      // Create orthogonal vector
      const orthogonalVector: SemanticVector = [0.5, -0.4, 0.3, -0.2, -0.2];
      const similarity = calculateCosineSimilarity(vectorA, orthogonalVector);
      expect(similarity).toBeCloseTo(0);
    });
    
    test('should handle zero vectors', () => {
      const similarity = calculateCosineSimilarity(zeroVector, vectorA);
      expect(similarity).toBe(0);
    });
    
    test('should throw error for vectors with different dimensions', () => {
      const shorterVector: SemanticVector = [0.1, 0.2, 0.3];
      expect(() => calculateCosineSimilarity(vectorA, shorterVector)).toThrow();
    });
  });
  
  describe('addGaussianNoise', () => {
    test('should add noise to vector', () => {
      const noisyVector = addGaussianNoise(vectorA, 0.1);
      
      // Check dimensions remain the same
      expect(noisyVector.length).toBe(vectorA.length);
      
      // Check that values are different after adding noise
      let hasDifference = false;
      for (let i = 0; i < vectorA.length; i++) {
        if (vectorA[i] !== noisyVector[i]) {
          hasDifference = true;
          break;
        }
      }
      expect(hasDifference).toBe(true);
      
      // Check that zero variance produces same vector
      const noNoiseVector = addGaussianNoise(vectorA, 0);
      // Values might still differ slightly due to floating point
      for (let i = 0; i < vectorA.length; i++) {
        expect(noNoiseVector[i]).toBeCloseTo(vectorA[i]);
      }
    });
  });
  
  describe('combineVectors', () => {
    test('should combine two vectors with default weight', () => {
      const combinedVector = combineVectors(vectorA, vectorB);
      
      // With default weight 0.5, each element should be average of the two
      for (let i = 0; i < vectorA.length; i++) {
        expect(combinedVector[i]).toBe((vectorA[i] + vectorB[i]) / 2);
      }
    });
    
    test('should apply custom weights correctly', () => {
      const weight = 0.7;
      const combinedVector = combineVectors(vectorA, vectorB, weight);
      
      for (let i = 0; i < vectorA.length; i++) {
        expect(combinedVector[i]).toBeCloseTo(vectorA[i] * weight + vectorB[i] * (1 - weight));
      }
    });
    
    test('should throw error for vectors with different dimensions', () => {
      const shorterVector: SemanticVector = [0.1, 0.2, 0.3];
      expect(() => combineVectors(vectorA, shorterVector)).toThrow();
    });
  });
});