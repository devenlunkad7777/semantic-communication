"""
DEMO: Semantic Communication Flow

This is a simplified demo of the semantic communication flow that demonstrates:
1. User input text
2. LLM processing (mocked)
3. BPSK noise addition
4. LLM reconstruction (mocked)
5. Similarity calculation
"""

# Import required libraries
import numpy as np
from bpsk_text_noise import transmit_text_over_awgn
from scipy.spatial import distance
from sentence_transformers import SentenceTransformer

# ====== USER INPUT TEXT ======
# This is the text provided by the user
input_text = "This is a test message for semantic communication."
print("\n" + "=" * 60)
print(" SEMANTIC COMMUNICATION FLOW ".center(60, "="))
print("=" * 60)
print("\n1. USER INPUT TEXT:")
print(f'   "{input_text}"')

# ====== LLM PROCESSING ======
# In a real implementation, this would call an LLM API with this prompt:
semantic_prompt = f"""You are a semantic communication processor. Your task is to extract the core meaning 
from the following text without changing its essential information. Keep the same tone 
and intent, but represent it in a way that preserves semantic content while potentially 
allowing for communication efficiency. Respond with only the processed text, without 
any explanations or additional comments.

Input Text: "{input_text}"
"""
print("\n2. LLM PROCESSING:")
print("   --- Prompt ---")
print(f"   {semantic_prompt.strip()}")
print("   -------------")

# Here we just mock the LLM output
llm_processed = "This message demonstrates semantic communication testing."
print("   LLM Output:")
print(f'   "{llm_processed}"')

# ====== BPSK NOISE ADDITION ======
# Add BPSK noise to the LLM output
ebno_db = 5.0  # Signal-to-noise ratio in dB
noisy_text, ber, bits_tx, bits_rx = transmit_text_over_awgn(llm_processed, ebno_db)
error_bits = int(np.sum(bits_tx != bits_rx))
print("\n3. BPSK NOISE ADDITION:")
print(f"   Eb/N0: {ebno_db} dB")
print(f"   Bit Error Rate: {ber:.6f} ({error_bits} errors in {len(bits_tx)} bits)")
print(f'   Noisy Text: "{noisy_text}"')

# ====== LLM RECONSTRUCTION ======
# In a real implementation, this would call an LLM API with this prompt:
reconstruction_prompt = f"""You are a text reconstruction specialist. You've received a message that was transmitted 
over a noisy channel and contains errors or corrupted characters.

Your task is to reconstruct the original meaning of the message based on context and 
semantic understanding. Do not add explanations or additional content - respond only 
with your best reconstruction of the original message.

Corrupted Message: "{noisy_text}"
"""
print("\n4. LLM RECONSTRUCTION:")
print("   --- Prompt ---")
print(f"   {reconstruction_prompt.strip()}")
print("   -------------")

# Here we just mock the reconstruction
reconstructed_text = "This is a demonstration of semantic communication test."
print("   LLM Output:")
print(f'   "{reconstructed_text}"')

# ====== SIMILARITY CALCULATION ======
# Calculate semantic similarity between original and reconstructed text
print("\n5. SIMILARITY CALCULATION:")
# Load the model (this might take a moment)
print("   Loading model...")
model = SentenceTransformer('all-MiniLM-L6-v2')
# Calculate similarity
original_vec = model.encode([input_text])[0]
reconstructed_vec = model.encode([reconstructed_text])[0]
similarity = 1 - distance.cosine(original_vec, reconstructed_vec)
print(f"   Semantic Similarity Score: {similarity:.5f}")

# ====== RESULTS SUMMARY ======
print("\n" + "-" * 60)
print(" RESULTS SUMMARY ".center(60, "-"))
print("-" * 60)
print(f"Original Input:    \"{input_text}\"")
print(f"LLM Processed:     \"{llm_processed}\"")
print(f"BPSK Noisy Text:   \"{noisy_text}\"")
print(f"LLM Reconstructed: \"{reconstructed_text}\"")
print(f"Similarity Score:   {similarity:.5f}")
print("-" * 60)
print("\nDone! This demonstrates the complete semantic communication flow.")
