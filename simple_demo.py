"""
Semantic Communication Flow - Simple Console Demo

This script demonstrates the complete semantic communication flow with clear console output.
"""

import sys
from bpsk_text_noise import transmit_text_over_awgn
from sentence_transformers import SentenceTransformer
from scipy.spatial import distance
import numpy as np

# Default settings
DEFAULT_TEXT = "This is a test message for semantic communication."
DEFAULT_EBN0 = 5.0  # Signal-to-noise ratio in dB

# Get input text from command line or prompt
if len(sys.argv) > 1:
    input_text = sys.argv[1]
else:
    print("\nSEMANTIC COMMUNICATION FLOW")
    print("--------------------------")
    input_text = input("Enter text (or press Enter for default): ").strip()
    if not input_text:
        input_text = DEFAULT_TEXT
        print(f"Using default: '{DEFAULT_TEXT}'")

# Get Eb/N0 setting
ebno_db = DEFAULT_EBN0
if len(sys.argv) > 2:
    try:
        ebno_db = float(sys.argv[2])
    except ValueError:
        print(f"Invalid Eb/N0 value. Using default {DEFAULT_EBN0} dB.")

# ===== STEP 1: Display user input =====
print("\n" + "=" * 70)
print(" SEMANTIC COMMUNICATION FLOW ".center(70, "="))
print("=" * 70)

print("\n[STEP 1] USER INPUT")
print("-" * 70)
print(f"Input text: \"{input_text}\"")
print(f"Eb/N0: {ebno_db} dB")

# ===== STEP 2: LLM Processing =====
print("\n[STEP 2] LLM PROCESSING")
print("-" * 70)

# LLM processing prompt
semantic_prompt = f"""You are a semantic communication processor. Your task is to extract the core meaning 
from the following text without changing its essential information. Keep the same tone 
and intent, but represent it in a way that preserves semantic content while potentially 
allowing for communication efficiency. Respond with only the processed text, without 
any explanations or additional comments.

Input Text: "{input_text}"
"""
print("LLM Processing Prompt:")
print(f"{semantic_prompt.strip()}")
print("-" * 70)

# Mock LLM implementation - this would call a real LLM in production
llm_processed = f"Processed: {input_text}"
print(f"LLM output: \"{llm_processed}\"")

# ===== STEP 3: BPSK Noise Addition =====
print("\n[STEP 3] BPSK NOISE ADDITION")
print("-" * 70)
noisy_text, ber, bits_tx, bits_rx = transmit_text_over_awgn(llm_processed, ebno_db)
error_bits = np.sum(bits_tx != bits_rx)
print(f"Bit Error Rate: {ber:.6f} ({error_bits} errors in {len(bits_tx)} bits)")
print(f"Noisy text: \"{noisy_text}\"")

# ===== STEP 4: LLM Reconstruction =====
print("\n[STEP 4] LLM RECONSTRUCTION")
print("-" * 70)

# Clean up noise symbols for display
cleaned_text = noisy_text
for char in ['�', '�', '�', '�', '�']:
    cleaned_text = cleaned_text.replace(char, ' ')

# LLM reconstruction prompt
reconstruction_prompt = f"""You are a text reconstruction specialist. You've received a message that was transmitted 
over a noisy channel and contains errors or corrupted characters. 

Your task is to reconstruct the original meaning of the message based on context and 
semantic understanding. Do not add explanations or additional content - respond only 
with your best reconstruction of the original message.

Corrupted Message: "{cleaned_text}"
"""
print("LLM Reconstruction Prompt:")
print(f"{reconstruction_prompt.strip()}")
print("-" * 70)

# Mock LLM implementation - this would call a real LLM in production
reconstructed_text = f"Reconstructed: {cleaned_text}"
print(f"Reconstructed text: \"{reconstructed_text}\"")

# ===== STEP 5: Calculate Similarity =====
print("\n[STEP 5] SEMANTIC SIMILARITY")
print("-" * 70)
print("Loading sentence transformer model...")
model = SentenceTransformer('all-MiniLM-L6-v2')
print("Model loaded!")

# Calculate similarity
original_vec = model.encode([input_text])[0]
reconstructed_vec = model.encode([reconstructed_text])[0]
similarity = 1 - distance.cosine(original_vec, reconstructed_vec)
print(f"Similarity score: {similarity:.5f}")

# ===== SUMMARY =====
print("\n" + "=" * 70)
print(" RESULTS SUMMARY ".center(70, "="))
print("=" * 70)
print(f"Original input:    \"{input_text}\"")
print(f"LLM processed:     \"{llm_processed}\"")
print(f"BPSK noisy text:   \"{noisy_text}\"")
print(f"LLM reconstructed: \"{reconstructed_text}\"")
print(f"Similarity score:   {similarity:.5f}")
print("=" * 70)
