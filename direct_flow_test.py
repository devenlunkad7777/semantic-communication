"""
Simple Direct Test for Semantic Communication Flow

This script demonstrates the complete flow:
1. User enters a sentence
2. LLM processes the sentence (mocked)
3. BPSK noise is added to the LLM output
4. LLM reconstructs the sentence (mocked)
5. Similarity is calculated

No external APIs or complex imports - just a direct test.
"""

import numpy as np
from bpsk_text_noise import transmit_text_over_awgn
from sentence_transformers import SentenceTransformer
from scipy.spatial import distance

# Example input text
input_text = "This is a test message for semantic communication."
ebno_db = 5.0  # Signal-to-noise ratio (Eb/N0) in dB

print("\n" + "=" * 60)
print(" SEMANTIC COMMUNICATION FLOW DEMO ".center(60, "="))
print("=" * 60)

# STEP 1: Print the user input
print("\nSTEP 1: User Input Text")
print("-" * 30)
print(f'"{input_text}"')

# STEP 2: Process with LLM (mocked here)
print("\nSTEP 2: LLM Processing")
print("-" * 30)
llm_processed = f"The input is a message about testing semantic communication."
print(f'"{llm_processed}"')

# STEP 3: Add BPSK noise
print("\nSTEP 3: Adding BPSK Noise")
print("-" * 30)
noisy_text, ber, bits_tx, bits_rx = transmit_text_over_awgn(llm_processed, ebno_db)
error_bits = np.sum(bits_tx != bits_rx)
print(f"Eb/N0: {ebno_db} dB")
print(f"Bit Error Rate: {ber:.6f} ({error_bits} errors in {len(bits_tx)} bits)")
print(f'BPSK Noisy Text: "{noisy_text}"')

# STEP 4: Reconstruct with LLM (mocked)
print("\nSTEP 4: LLM Reconstruction")
print("-" * 30)
# Clean up any noise symbols that could cause display issues
cleaned_text = noisy_text
for char in ['�', '�', '�', '�', '�']:
    cleaned_text = cleaned_text.replace(char, '')
reconstructed_text = f"The message is about testing semantic communication."
print(f'Reconstructed: "{reconstructed_text}"')

# STEP 5: Calculate similarity
print("\nSTEP 5: Calculate Similarity")
print("-" * 30)
# Initialize the model
print("Loading sentence transformer model...")
model = SentenceTransformer('all-MiniLM-L6-v2')
print("Model loaded!")

# Calculate similarity
original_vec = model.encode([input_text])[0]
reconstructed_vec = model.encode([reconstructed_text])[0]
similarity = 1 - distance.cosine(original_vec, reconstructed_vec)
print(f"Similarity Score: {similarity:.5f}")

# Print summary
print("\n" + "=" * 60)
print(" RESULTS SUMMARY ".center(60, "="))
print("=" * 60)
print(f"Original Input:     '{input_text}'")
print(f"LLM Processed:      '{llm_processed}'")
print(f"After BPSK Noise:   '{noisy_text}'")
print(f"LLM Reconstructed:  '{reconstructed_text}'")
print(f"Similarity Score:    {similarity:.5f}")
print("=" * 60)
