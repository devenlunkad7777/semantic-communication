#!/usr/bin/env python
"""
Semantic Communication Flow Implementation.
This module processes text through the full semantic communication pipeline:
1. User text -> LLM processing
2. LLM output -> BPSK noise addition
3. Noisy text -> LLM reconstruction
4. Calculate similarity between original and reconstructed text
"""

import numpy as np
from bpsk_text_noise import transmit_text_over_awgn
from sentence_transformers import SentenceTransformer
from scipy.spatial import distance
import requests
import json
import os
import textwrap

# Constants
DEFAULT_EBN0 = 5.0  # Default Eb/N0 in dB for BPSK transmission

class SemanticFlow:
    def __init__(self):
        """Initialize the SemanticFlow processor."""
        self.model = SentenceTransformer('all-MiniLM-L6-v2')
        self.openai_api_key = os.getenv('OPENAI_API_KEY', '')
        self.gemini_api_key = os.getenv('GEMINI_API_KEY', '')
        
        # Select which LLM to use (defaulting to Gemini if available)
        if self.gemini_api_key:
            self.llm_type = 'gemini'
            print("Using Google Gemini LLM.")
        elif self.openai_api_key:
            self.llm_type = 'openai'
            print("Using OpenAI LLM.")
        else:
            self.llm_type = None
            print("No API keys found. LLM functionality will be mocked.")
    
    def _call_openai_api(self, prompt):
        """Call OpenAI API to generate text."""
        if not self.openai_api_key:
            return f"[Mock OpenAI response for: {prompt}]"
        
        try:
            response = requests.post(
                'https://api.openai.com/v1/chat/completions',
                headers={
                    'Content-Type': 'application/json',
                    'Authorization': f'Bearer {self.openai_api_key}'
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
    
    def _call_gemini_api(self, prompt):
        """Call Google Gemini API to generate text."""
        if not self.gemini_api_key:
            return f"[Mock Gemini response for: {prompt}]"
        
        try:
            url = f"https://generativelanguage.googleapis.com/v1/models/gemini-1.0-pro:generateContent?key={self.gemini_api_key}"
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
      def process_with_llm(self, text, is_reconstruction=False):
        """Process text with LLM, either for initial processing or reconstruction."""
        if is_reconstruction:
            # Clean up obvious noise characters for cleaner prompt
            cleaned_text = text
            for char in ['�', '�', '�', '�', '�']:
                cleaned_text = cleaned_text.replace(char, ' ')
                
            prompt = f"""You are a text reconstruction specialist. You've received a message that was transmitted 
over a noisy channel and contains errors or corrupted characters. 

Your task is to reconstruct the original meaning of the message based on context and 
semantic understanding. Do not add explanations or additional content - respond only 
with your best reconstruction of the original message.

Corrupted Message: "{cleaned_text}"
"""
        else:
            prompt = f"""You are a semantic communication processor. Your task is to extract the core meaning 
from the following text without changing its essential information. Keep the same tone 
and intent, but represent it in a way that preserves semantic content while potentially 
allowing for communication efficiency. Respond with only the processed text, without 
any explanations or additional comments.

Input Text: "{text}"
"""
            
        # Print the prompt for debugging and transparency
        print(f"\n[LLM {'RECONSTRUCTION' if is_reconstruction else 'PROCESSING'} PROMPT]")
        print("-" * 60)
        print(prompt)
        print("-" * 60)
            
        if self.llm_type == 'openai':
            return self._call_openai_api(prompt)
        elif self.llm_type == 'gemini':
            return self._call_gemini_api(prompt)
        else:
            # Mock LLM response if no API keys are available
            if is_reconstruction:
                return f"Reconstructed version of: {text}"
            else:
                return f"Processed version of: {text}"
    
    def calculate_similarity(self, text1, text2):
        """Calculate semantic similarity between two texts using cosine similarity."""
        # Encode texts to vectors
        vec1 = self.model.encode([text1])[0]
        vec2 = self.model.encode([text2])[0]
        
        # Calculate cosine similarity
        similarity = 1 - distance.cosine(vec1, vec2)
        return similarity
    
    def run_flow(self, input_text, ebn0_db=DEFAULT_EBN0):
        """
        Run the complete semantic communication flow.
        
        Args:
            input_text: Original text from the user
            ebn0_db: Signal-to-noise ratio for BPSK transmission
            
        Returns:
            dict: Results of each step in the flow
        """
        print("\n" + "=" * 60)
        print(" SEMANTIC COMMUNICATION FLOW ".center(60, "="))
        print("=" * 60)
        
        # Step 1: Process input text with LLM
        print("\n[STEP 1] Processing input text with LLM...")
        llm_processed = self.process_with_llm(input_text)
        print(f"\nInput text: {input_text}")
        print(f"\nLLM processed text: {llm_processed}")
        
        # Step 2: Add noise to LLM output using BPSK
        print("\n" + "-" * 60)
        print("\n[STEP 2] Adding BPSK noise to LLM output...")
        noisy_text, ber, _, _ = transmit_text_over_awgn(llm_processed, ebn0_db)
        print(f"\nEb/N0: {ebn0_db} dB")
        print(f"Bit Error Rate: {ber:.5f}")
        print(f"\nBPSK processed text: {noisy_text}")
          # Step 3: Reconstruct text using LLM
        print("\n" + "-" * 60)
        print("\n[STEP 3] Reconstructing text with LLM...")
        reconstructed_text = self.process_with_llm(noisy_text, is_reconstruction=True)
        print(f"\nReconstructed text: \"{reconstructed_text}\"")
        
        # Calculate similarity between original and reconstructed text
        print("\n" + "-" * 60)
        print("\n[STEP 4] Calculating similarity scores...")
        
        # Input vs LLM processed
        similarity_input_processed = self.calculate_similarity(input_text, llm_processed)
        print(f"\nSimilarity (Input vs LLM processed): {similarity_input_processed:.4f}")
        
        # LLM processed vs Reconstructed
        similarity_processed_reconstructed = self.calculate_similarity(llm_processed, reconstructed_text)
        print(f"Similarity (LLM processed vs Reconstructed): {similarity_processed_reconstructed:.4f}")
        
        # Input vs Reconstructed (end-to-end)
        similarity_input_reconstructed = self.calculate_similarity(input_text, reconstructed_text)
        print(f"Similarity (Input vs Reconstructed): {similarity_input_reconstructed:.4f}")
        
        # Final Summary
        print("\n" + "=" * 60)
        print(" FLOW SUMMARY ".center(60, "="))
        print("=" * 60)
        print(f"Original Input:    \"{input_text}\"")
        print(f"LLM Processed:     \"{llm_processed}\"")
        print(f"BPSK Noisy Text:   \"{noisy_text}\"")
        print(f"LLM Reconstructed: \"{reconstructed_text}\"")
        print("-" * 60)
        print(f"End-to-end similarity score: {similarity_input_reconstructed:.4f}")
        print("=" * 60)
        
        # Return results
        return {
            'input_text': input_text,
            'llm_processed': llm_processed,
            'noisy_text': noisy_text,
            'reconstructed_text': reconstructed_text,
            'similarity_input_processed': similarity_input_processed,
            'similarity_processed_reconstructed': similarity_processed_reconstructed,
            'similarity_input_reconstructed': similarity_input_reconstructed,
            'ber': ber,
            'ebn0_db': ebn0_db
        }

def run_interactive_semantic_flow():
    """Run the semantic flow interactively."""
    flow = SemanticFlow()
    
    while True:
        print("\n" + "=" * 80)
        print("Semantic Communication Flow".center(80))
        print("=" * 80)
        print("\nEnter a sentence to process through the semantic communication pipeline.")
        print("(or type 'exit' to quit)")
        
        user_input = input("\nInput text: ").strip()
        if user_input.lower() in ('exit', 'quit'):
            break
        
        # Get Eb/N0 setting
        try:
            ebn0_input = input("\nEnter Eb/N0 in dB (or press Enter for default 5.0 dB): ").strip()
            ebn0_db = float(ebn0_input) if ebn0_input else DEFAULT_EBN0
        except ValueError:
            print("Invalid input. Using default Eb/N0 of 5.0 dB.")
            ebn0_db = DEFAULT_EBN0
        
        # Run the flow
        flow.run_flow(user_input, ebn0_db)
        
        input("\nPress Enter to continue...")

if __name__ == "__main__":
    run_interactive_semantic_flow()
