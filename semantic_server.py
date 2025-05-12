from flask import Flask, request, jsonify, Response
from flask_cors import CORS
from scipy.spatial import distance
from sentence_transformers import SentenceTransformer
import traceback
import subprocess
import os
import sys
import threading
import numpy as np  # Add NumPy import here
import requests
import json

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Load the SentenceTransformer model once when the server starts
print("Loading SentenceTransformer model 'all-MiniLM-L6-v2'...")
model = SentenceTransformer('all-MiniLM-L6-v2')
print("Model loaded successfully!")

@app.route('/calculate-similarity', methods=['POST'])
def calculate_similarity():
    try:
        data = request.json
        original_text = data.get('original_text')
        received_text = data.get('received_text')
        
        print(f"\n=== Similarity Calculation ===")
        print(f"Original Text: {original_text}")
        print(" ")
        print(f"Received Text: {received_text}")
        print(" ")
        
        if not original_text or not received_text:
            return jsonify({'error': 'Both original_text and received_text are required'}), 400
        
        # Encode the sentences into vectors
        original_vec = model.encode([original_text])[0]
        received_vec = model.encode([received_text])[0]
        
        # Calculate similarity score
        similarity_score = 1 - distance.cosine(original_vec, received_vec)
        
        print(f"Original Text: {original_text}")
        print(" ")
        print(f"Received Text: {received_text}")
        print(" ")
        print(f"Similarity Score: {similarity_score}")
        print(" ")        
        return jsonify({
            'similarity': float(similarity_score),
            'original_text': original_text,
            'received_text': received_text
        })
    
    except Exception as e:
        print(f"Error processing request: {e}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'ok', 'model': 'all-MiniLM-L6-v2'})

@app.route('/', methods=['GET'])
def home():
    return """
    <html>
        <head><title>Semantic Communication Backend API</title></head>
        <body>
            <h1>Semantic Communication Backend API</h1>
            <p>This server provides various endpoints for semantic communication simulation.</p>
            <h2>API Endpoints</h2>
            <ul>
                <li><strong>POST /calculate-similarity</strong> - Calculate similarity between original and received texts</li>
                <li><strong>POST /bpsk-text-noise</strong> - Apply BPSK modulation and noise to text</li>
                <li><strong>POST /reconstruct-text</strong> - Reconstruct text corrupted by noise</li>
                <li><strong>POST /semantic-flow</strong> - Complete semantic communication flow</li>
                <li><strong>GET /health</strong> - Health check endpoint</li>
                <li><strong>GET /run-awgn-simulation</strong> - Launch AWGN simulation in a new window</li>
            </ul>
            <h2>Semantic Flow Process</h2>
            <ol>
                <li>User enters a sentence, which is processed by an LLM</li>
                <li>The LLM output is subjected to BPSK noise simulation</li>
                <li>The noisy text is then reconstructed using an LLM</li>
                <li>Similarity score is calculated between original input and reconstructed text</li>
            </ol>
            <h2>Example Request</h2>
            <pre>
            POST /semantic-flow
            Content-Type: application/json
            
            {
                "input_text": "This is a test message for semantic communication",
                "ebno_db": 5.0,
                "skip_initial_llm": false
            }
            </pre>
        </body>
    </html>
    """

@app.route('/run-awgn-simulation', methods=['GET'])
def run_awgn():
    """Endpoint to launch AWGN simulation in a new process"""
    try:
        # Get the path to the main.py script
        script_dir = os.path.dirname(os.path.abspath(__file__))
        main_script = os.path.join(script_dir, 'main.py')
        
        # Launch the AWGN simulation in a new process
        # Use pythonw on Windows to run without console window, or python on other platforms
        python_exe = 'pythonw' if sys.platform == 'win32' else 'python'
        subprocess.Popen([python_exe, main_script, 'awgn'], 
                        creationflags=subprocess.CREATE_NEW_CONSOLE if sys.platform == 'win32' else 0)
        
        return jsonify({
            'status': 'success',
            'message': 'AWGN simulation launched successfully'
        })
    except Exception as e:
        print(f"Error launching AWGN simulation: {e}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/awgn_simulation.png', methods=['GET'])
def serve_awgn_plot():
    """Serve the AWGN simulation plot file"""
    try:
        script_dir = os.path.dirname(os.path.abspath(__file__))
        plot_path = os.path.join(script_dir, 'awgn_simulation.png')
        
        if not os.path.exists(plot_path):
            return jsonify({
                'error': 'Plot file not found. Run the AWGN simulation first.'
            }), 404
        
        with open(plot_path, 'rb') as f:
            plot_data = f.read()
            
        response = Response(plot_data, mimetype='image/png')
        response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
        response.headers['Pragma'] = 'no-cache'
        response.headers['Expires'] = '0'
        return response
        
    except Exception as e:
        print(f"Error serving AWGN plot: {e}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/run-awgn-auto', methods=['POST', 'OPTIONS'])
def run_awgn_auto():
    """Endpoint to run the AWGN simulation automatically with the provided text"""
    # Handle preflight OPTIONS request for CORS
    if request.method == 'OPTIONS':
        return '', 200
        
    try:
        # Get the request data safely
        text = "Hello, Semantic Communication!"  # Default text
        snr = 20  # Default SNR
        
        # Check if request has actual content before trying to parse JSON
        if request.data and request.content_type == 'application/json':
            try:
                data = request.get_json(silent=True) or {}
                text = data.get('text', text)
                snr = data.get('snr', snr)
            except Exception as e:
                # Log the error but continue with defaults
                print(f"Warning: Could not parse JSON data: {e}")
        else:
            print("Note: No JSON data in request, using default values")
        
        # Import the awgn_simulation module
        import awgn_simulation
        
        # Run the simulation with the provided text
        thread = threading.Thread(
            target=awgn_simulation.run_awgn_simulation,
            kwargs={
                'text': text,
                'desired_SNR': snr
            }
        )
        thread.start()
        
        return jsonify({
            'status': 'success',
            'message': 'AWGN simulation executed with text input',
            'text': text,
            'snr': snr
        })
    except Exception as e:
        print(f"Error running automatic AWGN simulation: {e}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/bpsk-text-noise', methods=['POST', 'OPTIONS'])
def bpsk_text_noise():
    """Endpoint to simulate BPSK modulated text transmission with AWGN noise"""
    # Handle preflight OPTIONS request for CORS
    if request.method == 'OPTIONS':
        return '', 200
        
    try:
        # Get request data
        data = request.json
        text = data.get('text', "Hello, Semantic Communication!")
        ebno_db = float(data.get('ebno_db', 10.0))
        
        # Import the BPSK text noise functions
        from bpsk_text_noise import transmit_text_over_awgn
        
        # Simulate the transmission
        text_rx, ber, bits_tx, bits_rx = transmit_text_over_awgn(text, ebno_db)
        
        # Return the results
        return jsonify({
            'status': 'success',
            'original_text': text,
            'received_text': text_rx,
            'ber': float(ber),
            'ebno_db': ebno_db,
            'bit_count': len(bits_tx),
            'error_bits': int(np.sum(bits_tx != bits_rx))
        })
    except Exception as e:
        print(f"Error processing BPSK text noise request: {e}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/reconstruct-text', methods=['POST', 'OPTIONS'])
def reconstruct_text():
    """Endpoint to reconstruct text that has been corrupted by noise using LLM"""
    # Handle preflight OPTIONS request for CORS
    if request.method == 'OPTIONS':
        return '', 200
        
    try:
        # Get request data
        data = request.json
        corrupted_text = data.get('corrupted_text', "")
        original_text = data.get('original_text', "")  # Optional, for similarity calculation
        
        if not corrupted_text:
            return jsonify({'error': 'corrupted_text is required'}), 400
        
        print(f"\n=== Text Reconstruction ===")
        print(f"Corrupted Text: {corrupted_text}")
        
        # Reconstruct text - in a real implementation, this would call an LLM API
        # For now, we'll use a simple mock implementation
        
        # Clean up obvious noise characters
        cleaned_text = corrupted_text
        for char in ['�', '�', '�', '�', '�']:
            cleaned_text = cleaned_text.replace(char, '')
            
        # Apply reconstruction logic - in a real implementation this would use an LLM
        reconstructed_text = f"Reconstructed: {cleaned_text}"
        
        # Strip any "Reconstructed: " prefix if it already exists (to avoid double prefixing)
        if reconstructed_text.startswith("Reconstructed: "):
            reconstructed_text = reconstructed_text[14:]
            
        print(f"Reconstructed Text: {reconstructed_text}")
        
        # Calculate similarity with original if provided
        similarity = None
        if original_text:
            original_vec = model.encode([original_text])[0]
            reconstructed_vec = model.encode([reconstructed_text])[0]
            similarity = 1 - distance.cosine(original_vec, reconstructed_vec)
            print(f"Similarity Score: {similarity:.5f}")
        
        response = {
            'status': 'success',
            'corrupted_text': corrupted_text,
            'reconstructed_text': reconstructed_text
        }
        
        if similarity is not None:
            response['similarity'] = float(similarity)
            response['original_text'] = original_text
            
        return jsonify(response)
        
    except Exception as e:
        print(f"Error reconstructing text: {e}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/semantic-flow', methods=['POST', 'OPTIONS'])
def semantic_flow_endpoint():
    """Endpoint to run the complete semantic communication flow:
    1. Process input text with LLM (optional)
    2. Add BPSK noise to text
    3. Reconstruct with LLM
    4. Calculate similarity
    """
    # Handle preflight OPTIONS request for CORS
    if request.method == 'OPTIONS':
        return '', 200
        
    try:
        # Get request data
        data = request.json
        input_text = data.get('input_text', "Hello, Semantic Communication!")
        ebno_db = float(data.get('ebno_db', 5.0))
        skip_initial_llm = data.get('skip_initial_llm', False)
        
        print("\n" + "=" * 60)
        print(" SEMANTIC COMMUNICATION FLOW ".center(60, "="))
        print("=" * 60)
        print(f"\n[STEP 1] User Input Text:")
        print(f"\"{input_text}\"")
        print(f"\nSignal-to-Noise Ratio (Eb/N0): {ebno_db} dB")        # Initial LLM processing (optional)
        if not skip_initial_llm:
            print("\n[STEP 2] LLM Processing:")
            llm_processed = process_with_llm(input_text)  # Use our LLM processing function
            print(f"\"{llm_processed}\"")
        else:
            llm_processed = input_text
            print("\n[STEP 2] Skipping initial LLM processing")
            print(f"Using original text: \"{llm_processed}\"")
        
        # Add BPSK noise
        from bpsk_text_noise import transmit_text_over_awgn
        print("\n[STEP 3] Adding BPSK noise:")
        noisy_text, ber, bits_tx, bits_rx = transmit_text_over_awgn(llm_processed, ebno_db)
        print(f"BPSK processed text: \"{noisy_text}\"")
        print(f"Bit Error Rate: {ber:.5f}")
        print(f"Total bits: {len(bits_tx)}")
        print(f"Error bits: {int(np.sum(bits_tx != bits_rx))}")        # Step 4: Reconstruct the noisy text using LLM
        print("\n[STEP 4] Reconstructing with LLM...")
        
        # This is where we send the BPSK noisy text directly to the LLM for reconstruction
        reconstructed_text = reconstruct_with_llm(noisy_text)
        
        # For demonstration purposes, strip any "Reconstructed version of: " prefix
        if reconstructed_text.startswith("Reconstructed version of: "):
            reconstructed_text = reconstructed_text[24:]
            
        print("\n----- RECONSTRUCTION RESULT -----")
        print(f"Original Input: {input_text}")
        print(f"After BPSK:     {noisy_text}")
        print(f"Reconstructed:  {reconstructed_text}")
        print("--------------------------------")
        
        # Calculate similarity between original and reconstructed
        # Using the sentence transformer model already loaded in this file
        original_vec = model.encode([input_text])[0]
        reconstructed_vec = model.encode([reconstructed_text])[0]
        similarity = 1 - distance.cosine(original_vec, reconstructed_vec)
        print(f"\nSimilarity score: {similarity:.5f}")
        
        # Return all results
        return jsonify({
            'status': 'success',
            'input_text': input_text,
            'llm_processed': llm_processed,
            'noisy_text': noisy_text,
            'reconstructed_text': reconstructed_text,
            'similarity': float(similarity),
            'ber': float(ber),
            'ebno_db': ebno_db,
            'error_bits': int(np.sum(bits_tx != bits_rx))
        })
        
    except Exception as e:
        print(f"Error processing semantic flow request: {e}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

def run_server():
    """Function to start the Flask server"""
    import socket
    print("\n" + "=" * 70)
    print(" SEMANTIC COMMUNICATION BACKEND SERVER ".center(70, "="))
    print("=" * 70 + "\n")
    
    # Get the local IP address
    hostname = socket.gethostname()
    ip_address = socket.gethostbyname(hostname)
    
    print(f"Server is starting on http://localhost:5000 (local access)")
    print(f"Server is also accessible on http://{ip_address}:5000 (network access)")
    print("\nTo test the semantic flow with default parameters, you can use:")
    print("curl -X POST http://localhost:5000/semantic-flow -H \"Content-Type: application/json\" -d \"{\\\"input_text\\\": \\\"This is a test message\\\", \\\"ebno_db\\\": 5.0}\"")
    print("\nOr access http://localhost:5000 in your browser for API documentation.")
    print("\nPress Ctrl+C to stop the server.\n")
    app.run(debug=False, port=5000, host='0.0.0.0')  # Bind to all network interfaces

def reconstruct_with_llm(noisy_text):
    """
    Reconstruct the BPSK noisy text using an LLM.
    In a production system, this would call an actual LLM API.
    
    Args:
        noisy_text: Text that has been corrupted by noise
        
    Returns:
        str: The reconstructed text
    """
    # First clean up obvious noise characters for cleaner prompt
    cleaned_text = noisy_text
    for char in ['�', '�', '�', '�', '�']:
        cleaned_text = cleaned_text.replace(char, ' ')
    
    # In a real implementation, this would be the prompt for the LLM
    prompt = f"""You are a text reconstruction specialist. You've received a message that was transmitted 
over a noisy channel and contains errors or corrupted characters. 

Your task is to reconstruct the original meaning of the message based on context and 
semantic understanding. Do not add explanations or additional content - respond only 
with your best reconstruction of the original message.

Corrupted Message: "{cleaned_text}"
"""
    
    print("\n[LLM RECONSTRUCTION PROMPT]")
    print("-" * 60)
    print(prompt)
    print("-" * 60)
    
    # MOCK IMPLEMENTATION - In a real system, this would call an actual LLM API
    # e.g., OpenAI API, Gemini API, or a local model
    
    # For demonstration, we'll just clean up the text and assume it's reconstructed
    # In a real implementation, you'd replace this with an actual LLM API call:
    # reconstructed_text = call_llm_api(prompt)
    
    reconstructed_text = f"Reconstructed version of: {cleaned_text}"
    
    return reconstructed_text

def process_with_llm(input_text):
    """
    Process the input text with an LLM to extract semantic meaning.
    In a production system, this would call an actual LLM API.
    
    Args:
        input_text: Original text from the user
        
    Returns:
        str: The processed text with extracted semantic meaning
    """
    # In a real implementation, this would be the prompt for the LLM
    prompt = f"""You are a semantic communication processor. Your task is to extract the core meaning 
from the following text without changing its essential information. Keep the same tone 
and intent, but represent it in a way that preserves semantic content while potentially 
allowing for communication efficiency. Respond with only the processed text, without 
any explanations or additional comments.

Input Text: "{input_text}"
"""
    
    print("\n[LLM PROCESSING PROMPT]")
    print("-" * 60)
    print(prompt)
    print("-" * 60)
    
    # MOCK IMPLEMENTATION - In a real system, this would call an actual LLM API
    # For demonstration, we'll just assume it's processed
    # In a real implementation, you'd replace this with an actual LLM API call:
    # processed_text = call_llm_api(prompt)
    
    processed_text = f"Processed: {input_text}"
    
    return processed_text

if __name__ == '__main__':
    run_server()