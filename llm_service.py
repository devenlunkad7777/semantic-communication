"""
LLM Service for Semantic Communication.

This module provides functions for interacting with LLM APIs 
for semantic extraction and reconstruction.
"""

import os
import requests
import json

# Check for API keys in environment variables
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY', '')
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', '')

def call_openai_api(prompt):
    """Call OpenAI API with a prompt."""
    if not OPENAI_API_KEY:
        return f"[Mock OpenAI response - no API key]"
    
    try:
        response = requests.post(
            'https://api.openai.com/v1/chat/completions',
            headers={
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {OPENAI_API_KEY}'
            },
            json={
                'model': 'gpt-3.5-turbo',
                'messages': [{'role': 'user', 'content': prompt}],
                'temperature': 0.7,
                'max_tokens': 200
            },
            timeout=10
        )
        return response.json()['choices'][0]['message']['content'].strip()
    except Exception as e:
        print(f"Error calling OpenAI API: {e}")
        return f"[Error: {str(e)}]"

def call_gemini_api(prompt):
    """Call Google Gemini API with a prompt."""
    if not GEMINI_API_KEY:
        return f"[Mock Gemini response - no API key]"
    
    try:
        url = f"https://generativelanguage.googleapis.com/v1/models/gemini-1.0-pro:generateContent?key={GEMINI_API_KEY}"
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {
                "temperature": 0.7,
                "maxOutputTokens": 200,
                "topP": 0.8,
                "topK": 40
            }
        }
        
        response = requests.post(
            url,
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        result = response.json()
        return result["candidates"][0]["content"]["parts"][0]["text"].strip()
    except Exception as e:
        print(f"Error calling Gemini API: {e}")
        return f"[Error: {str(e)}]"

def call_llm_api(prompt):
    """
    Call an LLM API with the given prompt.
    This function will try to use available API keys in order:
    1. Gemini (if GEMINI_API_KEY is set)
    2. OpenAI (if OPENAI_API_KEY is set)
    3. Mock response (if no keys are set)
    """
    if GEMINI_API_KEY:
        return call_gemini_api(prompt)
    elif OPENAI_API_KEY:
        return call_openai_api(prompt)
    else:
        # Mock implementation for when no API keys are available
        print("No API keys found. Using mock LLM response.")
        return f"[Mock LLM response for prompt: {prompt[:30]}...]"

# Test the module if run directly
if __name__ == "__main__":
    test_prompt = "Hello, what is semantic communication?"
    print(f"Testing LLM API call with prompt: {test_prompt}")
    response = call_llm_api(test_prompt)
    print(f"Response: {response}")
