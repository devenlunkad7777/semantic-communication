from flask import Flask, request, jsonify, Response
from flask_cors import CORS
from scipy.spatial import distance
from sentence_transformers import SentenceTransformer
import traceback
import subprocess
import os
import sys
import threading

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
        <head><title>Sentence Transformer Similarity API</title></head>
        <body>
            <h1>Sentence Transformer Similarity API</h1>
            <p>This server calculates semantic similarity between texts using the sentence-transformers model.</p>
            <h2>API Endpoints</h2>
            <ul>
                <li><strong>POST /calculate-similarity</strong> - Calculate similarity between original and received texts</li>
                <li><strong>GET /health</strong> - Health check endpoint</li>
            </ul>
            <h2>Example Request</h2>
            <pre>
            POST /calculate-similarity
            Content-Type: application/json
            
            {
                "original_text": "Text input by user",
                "received_text": "Text received after transmission"
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

def run_server():
    """Function to start the Flask server"""
    print("Starting server on http://localhost:5000")
    print("Use the /calculate-similarity endpoint to get semantic similarity between texts")
    app.run(debug=True, port=5000)

if __name__ == '__main__':
    run_server()