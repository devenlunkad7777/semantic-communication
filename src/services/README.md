# Services

This directory contains service modules that handle external API communication and data processing for the semantic communication system.

## Service Modules

### geminiService.ts

The `geminiService` module integrates with Google's Gemini API for:

- Semantic text embedding generation
- Text reconstruction from semantic vectors
- Semantic summarization of input text
- Error correction in BPSK received messages

#### Key Functions:

- `getEmbedding(text)`: Converts text to semantic vector representation
- `generateTextFromVector(vector)`: Reconstructs text from semantic vectors
- `getSemanticSummary(text)`: Extracts core semantic meaning from text
- `reconstructTextFromPhysicalError(originalText, noisyText)`: Corrects errors in text

#### Implementation:

```typescript
export async function getEmbedding(text: string): Promise<number[]> {
  const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/embedding-001:embedText', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey
    },
    body: JSON.stringify({
      text: text,
      taskType: 'SEMANTIC_SIMILARITY'
    })
  });
  
  const data = await response.json();
  return data.embedding.values;
}
```

### openaiService.ts

The `openaiService` module integrates with OpenAI's API as an alternative to Gemini for:

- Text embedding generation using various models
- Text completion and reconstruction
- Semantic processing

#### Key Functions:

- `createEmbedding(text)`: Generates embeddings using OpenAI models
- `generateCompletion(prompt)`: Creates text completions based on prompts
- `semanticReconstruction(noisyText)`: Reconstructs corrupted text

#### Testing:

The `openaiService.test.ts` file contains unit tests for the OpenAI service functions, ensuring:
- Proper API interaction
- Correct handling of responses
- Error management
- Mock testing for offline development

## Usage

Services are typically used through the Redux slice actions:

```typescript
// In semanticSlice.ts
export const encodeText = createAsyncThunk(
  'semantic/encodeText',
  async (text: string) => {
    // Use either Gemini or OpenAI based on configuration
    return useOpenAI 
      ? await openaiService.createEmbedding(text)
      : await geminiService.getEmbedding(text);
  }
);
```

## Configuration

API keys for these services are managed through:
- Environment variables
- User input in the ModelSettings component
- Secure storage in the Redux store
