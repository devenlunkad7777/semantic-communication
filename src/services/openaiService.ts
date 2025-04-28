import axios from 'axios';
import { SemanticVector } from '../utils/semanticEmbedding';

// The actual embedding size will depend on the model used
export const EMBEDDING_SIZE = 1536;

/**
 * Service to interact with OpenAI API for embeddings and text generation
 */
class OpenAIService {
  private apiKey: string = '';
  private apiUrl: string = 'https://api.openai.com/v1';
  
  /**
   * Set the API key for OpenAI
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
      // Mock implementation for development
      if (!this.apiKey) {
        console.warn('Using mock embedding - set API key for real results');
        return this.getMockEmbedding(text);
      }
      
      const response = await axios.post(
        `${this.apiUrl}/embeddings`,
        {
          input: text,
          model: 'text-embedding-ada-002'
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return response.data.data[0].embedding;
    } catch (error) {
      console.error('Error getting embedding:', error);
      // Fallback to mock embedding on error
      return this.getMockEmbedding(text);
    }
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
        return 'This is a mock reconstructed sentence. Add your OpenAI API key for real results.';
      }
      
      // In a real implementation, we would use a technique to convert vector back to text
      // This might involve finding the closest embedding in a database or using a specialized API
      // For now, we'll call the chat completion API with a prompt about the vector
      
      const response = await axios.post(
        `${this.apiUrl}/chat/completions`,
        {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a semantic reconstruction system. Generate a sentence that would likely have this embedding.'
            },
            {
              role: 'user',
              content: `Reconstruct a sentence from this semantic vector: ${JSON.stringify(vector.slice(0, 10))}... (truncated)`
            }
          ]
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('Error generating text:', error);
      return 'Error reconstructing text. Please check your API key and try again.';
    }
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
}

// Create an instance of the service
const openAIServiceInstance = new OpenAIService();

export default openAIServiceInstance;