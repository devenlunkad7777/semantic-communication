import openAIService, { EMBEDDING_SIZE } from './openaiService';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('OpenAI Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getEmbedding', () => {
    test('should return mock embedding when no API key is provided', async () => {
      // Ensure no API key is set
      openAIService.setApiKey('');
      
      const result = await openAIService.getEmbedding('Test sentence');
      
      // Should return a mock embedding of the correct size
      expect(result).toHaveLength(EMBEDDING_SIZE);
      expect(Array.isArray(result)).toBe(true);
      
      // Should not have called axios
      expect(mockedAxios.post).not.toHaveBeenCalled();
    });

    test('should call OpenAI API when API key is provided', async () => {
      // Mock successful API response
      const mockEmbedding = Array(EMBEDDING_SIZE).fill(0.1);
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          data: [
            {
              embedding: mockEmbedding
            }
          ]
        }
      });
      
      // Set API key
      openAIService.setApiKey('test-api-key');
      
      const result = await openAIService.getEmbedding('Test sentence');
      
      // Should have called axios with correct params
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://api.openai.com/v1/embeddings',
        {
          input: 'Test sentence',
          model: 'text-embedding-ada-002'
        },
        {
          headers: {
            'Authorization': 'Bearer test-api-key',
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Should return the mock embedding from API
      expect(result).toEqual(mockEmbedding);
    });

    test('should fall back to mock embedding on API error', async () => {
      // Mock API error
      mockedAxios.post.mockRejectedValueOnce(new Error('API Error'));
      
      // Set API key
      openAIService.setApiKey('test-api-key');
      
      const result = await openAIService.getEmbedding('Test sentence');
      
      // Should have attempted to call API
      expect(mockedAxios.post).toHaveBeenCalled();
      
      // Should return a mock embedding as fallback
      expect(result).toHaveLength(EMBEDDING_SIZE);
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('generateTextFromVector', () => {
    test('should return mock text when no API key is provided', async () => {
      // Ensure no API key is set
      openAIService.setApiKey('');
      
      const mockVector = Array(EMBEDDING_SIZE).fill(0.1);
      const result = await openAIService.generateTextFromVector(mockVector);
      
      // Should return mock text
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
      
      // Should not have called axios
      expect(mockedAxios.post).not.toHaveBeenCalled();
    });

    test('should call OpenAI API when API key is provided', async () => {
      // Mock successful API response
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          choices: [
            {
              message: {
                content: 'Reconstructed text'
              }
            }
          ]
        }
      });
      
      // Set API key
      openAIService.setApiKey('test-api-key');
      
      const mockVector = Array(EMBEDDING_SIZE).fill(0.1);
      const result = await openAIService.generateTextFromVector(mockVector);
      
      // Should have called axios with correct params
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://api.openai.com/v1/chat/completions',
        expect.objectContaining({
          model: 'gpt-3.5-turbo',
          messages: expect.arrayContaining([
            expect.objectContaining({
              role: 'system'
            }),
            expect.objectContaining({
              role: 'user',
              content: expect.stringContaining('Reconstruct a sentence from this semantic vector')
            })
          ])
        }),
        expect.any(Object)
      );
      
      // Should return the reconstructed text from API
      expect(result).toBe('Reconstructed text');
    });

    test('should return error message on API error', async () => {
      // Mock API error
      mockedAxios.post.mockRejectedValueOnce(new Error('API Error'));
      
      // Set API key
      openAIService.setApiKey('test-api-key');
      
      const mockVector = Array(EMBEDDING_SIZE).fill(0.1);
      const result = await openAIService.generateTextFromVector(mockVector);
      
      // Should have attempted to call API
      expect(mockedAxios.post).toHaveBeenCalled();
      
      // Should return an error message
      expect(typeof result).toBe('string');
      expect(result).toContain('Error');
    });
  });
});