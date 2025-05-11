"""
Simple Command Line Tool for Semantic Communication Flow

This will print the output directly to the console.
"""

import sys
from bpsk_text_noise import transmit_text_over_awgn
from sentence_transformers import SentenceTransformer
from scipy.spatial import distance
import numpy as np

def clear_screen():
    """Clear the console screen."""
    print("\n" * 100)  # Simple way to push previous output up

def print_header(title):
    """Print a section header."""
    print("\n" + "=" * 70)
    print(f" {title} ".center(70, "="))
    print("=" * 70)

def print_step(step_num, title):
    """Print a step header."""
    print(f"\n[STEP {step_num}] {title}")
    print("-" * 70)

def print_result(label, value):
    """Print a result with label."""
    print(f"{label}: {value}")

def run_semantic_flow(input_text, ebno_db=5.0):
    """Run the semantic communication flow and print results."""
    clear_screen()
    print_header("SEMANTIC COMMUNICATION FLOW")
    
    # Print system information
    print("\nInitializing components...")
    print("Loading Sentence Transformer model...")
    model = SentenceTransformer('all-MiniLM-L6-v2')
    print("Model loaded successfully!")
    print(f"BPSK Eb/N0 Setting: {ebno_db} dB")
    
    # Step 1: User input
    print_step(1, "User Input")
    print_result("Input Text", f'"{input_text}"')
      # Step 2: LLM Processing with improved prompt
    print_step(2, "LLM Processing")
    
    # LLM processing prompt
    semantic_prompt = f"""You are a semantic communication processor. Your task is to extract the core meaning 
from the following text without changing its essential information. Keep the same tone 
and intent, but represent it in a way that preserves semantic content while potentially 
allowing for communication efficiency. Respond with only the processed text.

Input Text: "{input_text}"
"""
    print("LLM Processing Prompt:")
    print(f"{semantic_prompt}")
    
    # In a real implementation, this would call an LLM API
    llm_processed = f"Processed version: {input_text}"
    print_result("LLM Output", f'"{llm_processed}"')
    
    # Step 3: BPSK Noise Addition
    print_step(3, "BPSK Noise Addition")
    noisy_text, ber, bits_tx, bits_rx = transmit_text_over_awgn(llm_processed, ebno_db)
    error_bits = np.sum(bits_tx != bits_rx)
    print_result("Bit Error Rate", f"{ber:.6f} ({error_bits} errors in {len(bits_tx)} bits)")
    print_result("Noisy Text", f'"{noisy_text}"')
      # Step 4: LLM Reconstruction with improved prompt
    print_step(4, "LLM Reconstruction")
    
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
    print(f"{reconstruction_prompt}")
    
    # In a real implementation, this would call an LLM API
    reconstructed_text = f"Reconstructed: {cleaned_text}"
    print_result("Reconstructed Text", f'"{reconstructed_text}"')
    
    # Step 5: Calculate Similarity
    print_step(5, "Calculate Similarity")
    original_vec = model.encode([input_text])[0]
    reconstructed_vec = model.encode([reconstructed_text])[0]
    similarity = 1 - distance.cosine(original_vec, reconstructed_vec)
    print_result("Similarity Score", f"{similarity:.5f}")
    
    # Print summary
    print_header("RESULTS SUMMARY")
    print(f"Original Input:     '{input_text}'")
    print(f"LLM Processed:      '{llm_processed}'")
    print(f"After BPSK Noise:   '{noisy_text}'")
    print(f"LLM Reconstructed:  '{reconstructed_text}'")
    print(f"Similarity Score:    {similarity:.5f}")
    print("=" * 70)
    
    return {
        'input_text': input_text,
        'llm_processed': llm_processed,
        'noisy_text': noisy_text,
        'reconstructed_text': reconstructed_text,
        'similarity': similarity,
        'ber': ber
    }

if __name__ == "__main__":
    # Get input from command line or use default
    default_text = "This is a test message for semantic communication."
    
    if len(sys.argv) > 1:
        input_text = sys.argv[1]
    else:
        print("\nSEMANTIC COMMUNICATION FLOW DEMO")
        print("--------------------------------")
        input_text = input("Enter text to process (or press Enter for default): ").strip()
        if not input_text:
            input_text = default_text
            print(f"Using default text: '{default_text}'")
    
    # Get Eb/N0 setting
    ebno_db = 5.0  # Default
    if len(sys.argv) > 2:
        try:
            ebno_db = float(sys.argv[2])
        except ValueError:
            print("Invalid Eb/N0 value. Using default 5.0 dB.")
    
    # Run the flow
    run_semantic_flow(input_text, ebno_db)
