#!/usr/bin/env python
"""
Test script to demonstrate the Semantic Communication Flow.
This script provides a direct way to test the semantic flow functionality.
"""

import sys
from bpsk_text_noise import transmit_text_over_awgn
from sentence_transformers import SentenceTransformer
from scipy.spatial import distance
import numpy as np

def run_semantic_flow_test():
    """Run a test of the semantic flow pipeline with fixed example."""
    # Load the SentenceTransformer model
    print("Loading SentenceTransformer model...")
    model = SentenceTransformer('all-MiniLM-L6-v2')
    print("Model loaded successfully!\n")
    
    # Test parameters
    input_text = "This is a test message for semantic communication."
    ebno_db = 5.0  # Signal-to-noise ratio
    
    print("\n" + "=" * 60)
    print(" SEMANTIC COMMUNICATION FLOW TEST ".center(60, "="))
    print("=" * 60)
    
    # Step 1: User input
    print(f"\n[STEP 1] User Input:")
    print(f"\"{input_text}\"")
    
    # Step 2: LLM processing (mock)
    print("\n[STEP 2] LLM Processing:")
    llm_processed = f"The input message is about testing semantic communication."
    print(f"\"{llm_processed}\"")
    
    # Step 3: Add BPSK noise
    print("\n[STEP 3] Adding BPSK noise:")
    noisy_text, ber, bits_tx, bits_rx = transmit_text_over_awgn(llm_processed, ebno_db)
    print(f"BPSK processed text: \"{noisy_text}\"")
    print(f"Bit Error Rate: {ber:.5f}")
    print(f"Total bits: {len(bits_tx)}")
    print(f"Error bits: {int(np.sum(bits_tx != bits_rx))}")
    
    # Step 4: Reconstruct using LLM (mock)
    print("\n[STEP 4] Reconstructing with LLM:")
    # Clean up obvious noise
    cleaned_text = noisy_text
    for char in ['�', '�', '�', '�', '�']:
        cleaned_text = cleaned_text.replace(char, '')
        
    # In a real implementation, this would call an LLM API
    reconstructed_text = f"The input is testing semantic communication."
    
    print("\n----- RECONSTRUCTION RESULT -----")
    print(f"Original Input: {input_text}")
    print(f"LLM Processed:  {llm_processed}")
    print(f"After BPSK:     {noisy_text}")
    print(f"Reconstructed:  {reconstructed_text}")
    print("---------------------------------")
    
    # Step 5: Calculate similarity
    print("\n[STEP 5] Calculating similarity:")
    original_vec = model.encode([input_text])[0]
    reconstructed_vec = model.encode([reconstructed_text])[0]
    similarity = 1 - distance.cosine(original_vec, reconstructed_vec)
    
    print(f"\nSimilarity score between original and reconstructed: {similarity:.5f}")
    
    print("\n" + "=" * 60)
    print(" RESULTS SUMMARY ".center(60, "="))
    print("=" * 60)
    print(f"Input text:        \"{input_text}\"")
    print(f"LLM processed:     \"{llm_processed}\"")
    print(f"BPSK noisy text:   \"{noisy_text}\"")
    print(f"Reconstructed:     \"{reconstructed_text}\"")
    print(f"Similarity score:   {similarity:.5f}")
    print("=" * 60)

if __name__ == "__main__":
    run_semantic_flow_test()
