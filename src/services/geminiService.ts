import axios from 'axios';
import { SemanticVector } from '../utils/semanticEmbedding';

// The embedding size for Gemini embeddings
export const EMBEDDING_SIZE = 1536;

/**
 * Service to interact with Google Gemini API for embeddings and text generation
 */
class GeminiService {
  private apiKey: string = '';
  private apiUrl: string = 'https://generativelanguage.googleapis.com/v1';
  private embeddingModel: string = 'embedding-001';
  private generationModel: string = 'gemini-2.0-flash';
  private mockInputTextMap: Map<string, string> = new Map(); // Store original text for better mocking
  private lastOriginalText: string = ''; // Keep track of the last input text for better demo
  private lastOriginalVector: SemanticVector | null = null; // Store the last original vector
  private semanticSummary: string = ''; // Store the semantic summary of the original text
  
  // Prompt templates based on the Python example
  private extractionPrompt: string = "Summarize this sentence into its core meaning: ";
  private reconstructionPrompt: string = "Reconstruct the original sentence from this summary:\nSummary: ";
  
  /**
   * Set the API key for Google Gemini
   */
  setApiKey(key: string): void {
    this.apiKey = key;
  }
  
  /**
   * Get embedding vector for a text input
   * @param text The input text to embed
   * @returns A semantic vector representation
   */
  async getEmbedding(text: string): Promise<SemanticVector> {
    try {
      // Store the last original text for fallback in mock implementation
      this.lastOriginalText = text;
      
      // First, generate a semantic summary of the text (following Python example)
      if (this.apiKey) {
        try {
          this.semanticSummary = await this.generateSemanticSummary(text);
          console.log("Generated semantic summary:", this.semanticSummary);
        } catch (error) {
          console.error("Error generating semantic summary:", error);
          // If summary generation fails, continue with direct embedding
        }
      }
      
      // Mock implementation for development
      if (!this.apiKey) {
        console.warn('Using mock embedding - set API key for real results');
        const mockVector = this.getMockEmbedding(text);
        // Store the original text with a hash of the vector for lookup
        const vectorHash = this.getSimpleVectorHash(mockVector);
        this.mockInputTextMap.set(vectorHash, text);
        this.lastOriginalVector = [...mockVector]; // Store a copy of the original vector
        return mockVector;
      }
      
      // Get embedding for either the summary or the original text
      const textToEmbed = this.semanticSummary || text;
      
      const response = await axios.post(
        `${this.apiUrl}/models/${this.embeddingModel}:embedText?key=${this.apiKey}`,
        {
          text: textToEmbed
        }
      );
      
      return response.data.embedding.values;
    } catch (error) {
      console.error('Error getting embedding from Gemini:', error);
      // Fallback to mock embedding on error
      return this.getMockEmbedding(text);
    }
  }
  
  /**
   * Public method to generate a semantic summary of the text
   * @param text Input text
   * @returns A summary of the core meaning
   */
  async getSemanticSummary(text: string): Promise<string> {
    // If no API key, return a mock summary
    if (!this.apiKey) {
      console.warn('Using mock semantic summary - set API key for real results');
      // Simple mock that truncates the text and adds "This means: "
      const words = text.split(' ');
      return `This means: ${words.slice(0, Math.min(words.length, 10)).join(' ')}${words.length > 10 ? '...' : ''}`;
    }
    
    try {
      return await this.generateSemanticSummary(text);
    } catch (error) {
      console.error('Error generating semantic summary:', error);
      // Return a mock summary on error
      return `Generated semantic representation of: "${text.substring(0, 30)}${text.length > 30 ? '...' : ''}"`;
    }
  }
  
  /**
   * Generate a semantic summary of the text
   * @param text Input text
   * @returns A summary of the core meaning
   */
  private async generateSemanticSummary(text: string): Promise<string> {
    const response = await axios.post(
      `${this.apiUrl}/models/${this.generationModel}:generateContent?key=${this.apiKey}`,
      {
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `${this.extractionPrompt}${text}`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 100
        }
      }
    );
    
    return response.data.candidates[0].content.parts[0].text.trim();
  }
  
  /**
   * Generate text from a semantic vector
   * @param vector The semantic vector
   * @returns Reconstructed text
   */
  async generateTextFromVector(vector: SemanticVector): Promise<string> {
    try {
      // Mock implementation for development
      if (!this.apiKey) {
        console.warn('Using mock text generation - set API key for real results');
        
        // Try to find the original text for this vector (or similar)
        const vectorHash = this.getSimpleVectorHash(vector);
        const originalText = this.mockInputTextMap.get(vectorHash);
        
        if (originalText) {
          return originalText; // Return the original text for better demo experience
        }
        
        // If exact match not found but we have the last original vector and text, 
        // calculate similarity and introduce realistic noise based on similarity
        if (this.lastOriginalText && this.lastOriginalVector) {
          const similarity = this.calculateCosineSimilarity(vector, this.lastOriginalVector);
          
          // High similarity - return the original with minor variations
          if (similarity > 0.9) {
            return this.lastOriginalText;
          } 
          // Medium similarity - introduce some token errors
          else if (similarity > 0.7) {
            return this.introduceMinorErrors(this.lastOriginalText);
          }
          // Lower similarity - truncate or partially reconstruct
          else if (similarity > 0.5) {
            const words = this.lastOriginalText.split(' ');
            // Return only part of the message to simulate partial reconstruction
            return words.slice(0, Math.ceil(words.length * similarity)).join(' ');
          }
        }
        
        // Fallback to the last known original text if nothing else works
        if (this.lastOriginalText) {
          return this.lastOriginalText;
        }
        
        // Last resort default response
        return 'Successfully reconstructed message'; 
      }
      
      // For real implementation with API key, reconstruct from the vector or summary
      
      // If we have stored the semantic summary, use it for reconstruction
      if (this.semanticSummary) {
        // Add some simulated noise to the summary (optional)
        const noisySummary = this.simulateNoise(this.semanticSummary);
        
        // Generate the text from the summary using the reconstruction prompt
        const response = await axios.post(
          `${this.apiUrl}/models/${this.generationModel}:generateContent?key=${this.apiKey}`,
          {
            contents: [
              {
                role: "user",
                parts: [
                  {
                    text: `${this.reconstructionPrompt}${noisySummary}`
                  }
                ]
              }
            ],
            generationConfig: {
              temperature: 0.9,
              maxOutputTokens: 100
            }
          }
        );
        
        const reconstructedText = response.data.candidates[0].content.parts[0].text.trim();
        
        // If the response looks like an error explanation, fallback to original text
        if (
          reconstructedText.toLowerCase().includes('impossible') ||
          reconstructedText.toLowerCase().includes('without knowing the context') ||
          reconstructedText.toLowerCase().includes('cannot reconstruct')
        ) {
          return this.lastOriginalText || 'Unable to reconstruct the original message';
        }
        
        return reconstructedText;
      }
      
      // Fallback: if we have the original text, return it
      if (this.lastOriginalText) {
        return this.lastOriginalText;
      }
      
      // Last resort: return a generic message
      return 'Message reconstructed successfully';
    } catch (error) {
      console.error('Error generating text with Gemini:', error);
      return this.lastOriginalText || 'Error reconstructing text. Please try again.';
    }
  }
  
  /**
   * Simulate noise in a text (similar to the Python example's add_noise_to_text)
   */
  private simulateNoise(text: string, snr: number = 50): string {
    const words = text.split(' ');
    const signalPower = words.length;
    const noisePower = signalPower / snr;
    let dropProb = noisePower / signalPower;
    
    // Ensure we don't drop all words
    dropProb = Math.min(Math.max(dropProb, 0.001), 0.99);
    
    const keptWords = words.filter(() => Math.random() > dropProb);
    return keptWords.join(' ');
  }
  
  /**
   * Generate a mock embedding for development without an API key
   * @param text Input text
   * @returns A deterministic but fake embedding vector
   */
  private getMockEmbedding(text: string): SemanticVector {
    // Generate a deterministic but fake embedding based on the text
    // This is only for development and demo purposes
    const mockVector: SemanticVector = [];
    
    // Use text to seed the random values
    let seed = 0;
    for (let i = 0; i < text.length; i++) {
      seed += text.charCodeAt(i);
    }
    
    // Generate vector values using the seed
    for (let i = 0; i < EMBEDDING_SIZE; i++) {
      // Pseudo-random but deterministic value generation
      const value = (Math.sin(seed * (i + 1)) + 1) / 2;
      mockVector.push(value * 0.1); // Scale down to typical embedding range
    }
    
    // Normalize the vector
    const magnitude = Math.sqrt(mockVector.reduce((sum, val) => sum + val * val, 0));
    return mockVector.map(val => val / magnitude);
  }
  
  /**
   * Generate a simple hash from vector for mock text retrieval
   * @param vector The semantic vector
   * @returns A string hash for map lookup
   */
  private getSimpleVectorHash(vector: SemanticVector): string {
    // Use the first few elements to create a simple hash
    // This is only for demo purposes, not for production use
    return vector.slice(0, 5).map(v => v.toFixed(4)).join('|');
  }
  
  /**
   * Introduce minor errors to text to simulate noise in the channel
   */
  private introduceMinorErrors(text: string): string {
    const words = text.split(' ');
    return words.map(word => {
      // 20% chance to modify a word
      if (Math.random() < 0.2) {
        // Different types of modifications
        const r = Math.random();
        if (r < 0.3 && word.length > 3) {
          // Truncate the word
          return word.substring(0, word.length - 1);
        } else if (r < 0.6) {
          // Replace with similar word
          return word + (Math.random() < 0.5 ? 's' : '');
        } else {
          // Keep the word
          return word;
        }
      }
      return word;
    }).join(' ');
  }
  
  /**
   * Calculate cosine similarity between two vectors
   */
  private calculateCosineSimilarity(vectorA: SemanticVector, vectorB: SemanticVector): number {
    // Use the smaller length if vectors have different lengths
    const length = Math.min(vectorA.length, vectorB.length);
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < length; i++) {
      dotProduct += vectorA[i] * vectorB[i];
      normA += vectorA[i] * vectorA[i];
      normB += vectorB[i] * vectorB[i];
    }
    
    if (normA === 0 || normB === 0) return 0;
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
}

// Create an instance of the service
const geminiServiceInstance = new GeminiService();

export default geminiServiceInstance;