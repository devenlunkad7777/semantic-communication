/**
 * Utility functions for handling semantic embeddings and noise simulation
 */

// Type definition for a semantic vector
export type SemanticVector = number[];

/**
 * Calculate cosine similarity between two vectors
 */
export const calculateCosineSimilarity = (vectorA: SemanticVector, vectorB: SemanticVector): number => {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must have the same dimensions');
  }

  const dotProduct = vectorA.reduce((sum, a, i) => sum + a * vectorB[i], 0);
  
  const magnitudeA = Math.sqrt(vectorA.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(vectorB.reduce((sum, val) => sum + val * val, 0));
  
  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0;
  }
  
  return dotProduct / (magnitudeA * magnitudeB);
};

/**
 * Add Gaussian noise to a semantic vector
 * @param vector Original semantic vector
 * @param noiseVariance Variance of the noise (higher = more noise)
 * @returns New vector with added noise
 */
export const addGaussianNoise = (vector: SemanticVector, noiseVariance: number): SemanticVector => {
  // Scale noise variance to ensure appropriate effect levels
  // For very small values, we want minimal effect
  const scaledVariance = noiseVariance * 0.1; // Scale down the variance to make the slider more responsive
  
  // Calculate vector magnitude to apply proportional noise
  const vectorMagnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  const scaleFactor = vectorMagnitude * 0.01; // Small percentage of vector magnitude
  
  return vector.map(value => {
    // Box-Muller transform to generate Gaussian noise
    const u1 = Math.random();
    const u2 = Math.random();
    // Avoid log(0)
    const z0 = Math.sqrt(-2.0 * Math.log(Math.max(u1, 0.0000001))) * Math.cos(2.0 * Math.PI * u2);
    
    // Scale noise by variance and original vector magnitude for proportional effect
    const noise = z0 * Math.sqrt(scaledVariance) * scaleFactor;
    
    return value + noise;
  });
};

/**
 * Combine two noisy vectors using weighted averaging
 * @param vector1 First noisy vector
 * @param vector2 Second noisy vector
 * @param weight1 Weight for the first vector (0-1)
 * @returns Combined vector
 */
export const combineVectors = (
  vector1: SemanticVector, 
  vector2: SemanticVector, 
  weight1: number = 0.5
): SemanticVector => {
  if (vector1.length !== vector2.length) {
    throw new Error('Vectors must have the same dimensions');
  }
  
  const weight2 = 1 - weight1;
  
  return vector1.map((val, index) => val * weight1 + vector2[index] * weight2);
};

/**
 * Utility function to simulate random boolean with given probability
 * @param probability Probability of returning true (0-1)
 * @returns True or false based on probability
 */
export const randomBool = (probability: number): boolean => {
  return Math.random() < probability;
};

/**
 * Delete random tokens in a given string with given probability
 * @param text A string to process
 * @param probability Probability to delete each token (0-1)
 * @returns String with random tokens deleted
 */
export const deleteRandomToken = (text: string, probability: number): string => {
  const tokens = text.split(' ');
  const remainingTokens = tokens.filter(() => !randomBool(probability));
  return remainingTokens.join(' ');
};

/**
 * Replace random tokens in a string by a filler token with given probability
 * @param text A string to process
 * @param probability Probability to replace each token (0-1)
 * @param fillerToken Token replacing chosen tokens
 * @returns String with random tokens replaced
 */
export const replaceRandomToken = (text: string, probability: number, fillerToken: string = "BLANK"): string => {
  const tokens = text.split(' ');
  const resultTokens = tokens.map(token => randomBool(probability) ? fillerToken : token);
  return resultTokens.join(' ');
};

/**
 * Random permutation over the tokens of a string, restricted to a range
 * @param text A string to process
 * @param range Max range for token permutation
 * @returns String with tokens permuted
 */
export const randomTokenPermutation = (text: string, range: number): string => {
  const tokens = text.split(' ');
  const newIndices = tokens.map((_, i) => i + Math.random() * (range + 1));
  
  // Sort tokens based on new indices
  const sortedPairs = newIndices.map((index, i) => [index, tokens[i]] as [number, string]);
  sortedPairs.sort((a, b) => a[0] - b[0]);
  
  const resultTokens = sortedPairs.map(pair => pair[1]);
  return resultTokens.join(' ');
};

/**
 * Get a simple bag-of-words embedding for a text
 * @param text The text to embed
 * @returns A vector representation where each dimension corresponds to a word count
 */
export const getTextEmbedding = (text: string): number[] => {
  // Convert to lowercase and split into words
  const words = text.toLowerCase().split(/\s+/);
  // Get unique words
  const uniqueWords = Array.from(new Set(words));
  
  // Create a vector with word counts
  return uniqueWords.map(word => {
    return words.filter(w => w === word).length;
  });
};

/**
 * Calculate semantic similarity between two texts using bag-of-words embeddings
 * @param text1 First text
 * @param text2 Second text
 * @returns Similarity score between 0 and 1
 */
export const calculateTextSemanticSimilarity = (text1: string, text2: string): number => {
  const vec1 = getTextEmbedding(text1);
  const vec2 = getTextEmbedding(text2);
  
  // If either text is empty, return 0
  if (vec1.length === 0 || vec2.length === 0) {
    return 0;
  }
  
  // To handle vectors of different sizes (different vocabularies),
  // we need to pad the vectors (similar to the Python implementation)
  const maxLen = Math.max(vec1.length, vec2.length);
  const vec1Padded = [...vec1, ...new Array(maxLen - vec1.length).fill(0)];
  const vec2Padded = [...vec2, ...new Array(maxLen - vec2.length).fill(0)];
  
  // Calculate norms
  const norm1 = Math.sqrt(vec1Padded.reduce((sum, val) => sum + val * val, 0));
  const norm2 = Math.sqrt(vec2Padded.reduce((sum, val) => sum + val * val, 0));
  
  if (norm1 === 0 || norm2 === 0) {
    return 0;
  }
  
  // Calculate dot product
  const dotProduct = vec1Padded.reduce((sum, val, i) => sum + val * vec2Padded[i], 0);
  
  // Cosine similarity
  return dotProduct / (norm1 * norm2);
};

/**
 * Get a more advanced semantic embedding that accounts for word position and context
 * This provides a slightly more sophisticated approach than simple bag-of-words
 * @param text The text to embed
 * @returns A vector representation
 */
export const getAdvancedTextEmbedding = (text: string): number[] => {
  const words = text.toLowerCase().split(/\s+/);
  const uniqueWords = Array.from(new Set(words));
  const vector: number[] = [];
  
  // For each unique word, we compute a value that factors in position
  uniqueWords.forEach(word => {
    // Find all positions where this word appears
    const positions = words.map((w, i) => w === word ? i + 1 : 0).filter(pos => pos > 0);
    
    // Basic frequency
    const frequency = positions.length / words.length;
    
    // Position-weighted value (words at the beginning and end have more weight)
    const positionWeight = positions.reduce((sum, pos) => {
      // Words at the beginning and end are weighted more
      const relativePos = pos / words.length;
      const positionImportance = 1 - 2 * Math.abs(relativePos - 0.5); // Higher for words at the beginning or end
      return sum + positionImportance;
    }, 0) / Math.max(1, positions.length);
    
    vector.push(frequency);
    vector.push(positionWeight);
    vector.push(frequency * positionWeight);
  });
  
  return vector;
};

/**
 * Calculate advanced semantic similarity between two texts
 * This combines multiple similarity metrics for better results
 * @param text1 First text
 * @param text2 Second text
 * @returns Similarity score between 0 and 1
 */
export const calculateAdvancedSemanticSimilarity = (text1: string, text2: string): number => {
  // Get basic bag-of-words similarity
  const basicSimilarity = calculateTextSemanticSimilarity(text1, text2);
  
  // Get more advanced similarity that considers word positions
  const vec1 = getAdvancedTextEmbedding(text1);
  const vec2 = getAdvancedTextEmbedding(text2);
  
  if (vec1.length === 0 || vec2.length === 0) {
    return basicSimilarity;
  }
  
  // Pad vectors to same length
  const maxLen = Math.max(vec1.length, vec2.length);
  const vec1Padded = [...vec1, ...new Array(maxLen - vec1.length).fill(0)];
  const vec2Padded = [...vec2, ...new Array(maxLen - vec2.length).fill(0)];
  
  // Calculate norms
  const norm1 = Math.sqrt(vec1Padded.reduce((sum, val) => sum + val * val, 0));
  const norm2 = Math.sqrt(vec2Padded.reduce((sum, val) => sum + val * val, 0));
  
  if (norm1 === 0 || norm2 === 0) {
    return basicSimilarity;
  }
  
  // Calculate dot product
  const dotProduct = vec1Padded.reduce((sum, val, i) => sum + val * vec2Padded[i], 0);
  
  // Advanced similarity
  const advancedSimilarity = dotProduct / (norm1 * norm2);
  
  // Combine metrics (with higher weight on the advanced similarity)
  return 0.3 * basicSimilarity + 0.7 * advancedSimilarity;
};

/**
 * Calculate semantic similarity using a local sentence-transformers model
 * This communicates with a local Python Flask server running the sentence-transformers model
 * @param text1 First text to compare (original text)
 * @param text2 Second text to compare (received text)
 * @returns Promise that resolves to a similarity score between 0 and 1
 */
export const calculateModelBasedSimilarity = async (
  text1: string, 
  text2: string
): Promise<number> => {
  // If either text is empty, return 0
  if (!text1 || !text2) {
    console.warn('Empty text. Returning 0 similarity.');
    return Promise.resolve(0);
  }

  console.log(`Requesting similarity calculation from Python backend:`);
  console.log(`Original Text: "${text1}"`);
  console.log(`Received Text: "${text2}"`);
  try {
    // Determine the API URL based on current hostname
    const BACKEND_URL = window.location.hostname === 'localhost' ? 
      'http://localhost:5000' : 
      `http://${window.location.hostname}:5000`;
      
    // Communicate with the Python Flask server using the correct parameter names
    const response = await fetch(`${BACKEND_URL}/calculate-similarity`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        original_text: text1,  // Updated to match backend expectations
        received_text: text2   // Updated to match backend expectations
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Python server error:', errorText);
      throw new Error(`Backend server error: ${errorText}`);
    }

    const result = await response.json();
    console.log('Backend similarity score:', result.similarity);
    
    return result.similarity;
  } catch (error) {
    console.error('Error calculating model-based similarity:', error);
    throw error;
  }
};

/**
 * Cached/Memoized version of model-based similarity to avoid duplicate calls
 */
const similarityCache = new Map<string, number>();

export const getCachedModelSimilarity = async (
  text1: string,
  text2: string
): Promise<number> => {
  // Create a cache key based on both texts (order doesn't matter for similarity)
  const textsArray = [text1, text2].sort();
  const cacheKey = textsArray.join('|||');
  
  // Check if we have a cached result
  if (similarityCache.has(cacheKey)) {
    return similarityCache.get(cacheKey)!;
  }
  
  try {
    // Calculate new similarity
    const similarity = await calculateModelBasedSimilarity(text1, text2);
    
    // Store in cache
    similarityCache.set(cacheKey, similarity);
    
    return similarity;
  } catch (error) {
    console.error('Failed to get similarity from backend, falling back to local calculation');
    // Fall back to the advanced local calculation if API call fails
    const fallbackSimilarity = calculateAdvancedSemanticSimilarity(text1, text2);
    similarityCache.set(cacheKey, fallbackSimilarity);
    return fallbackSimilarity;
  }
};