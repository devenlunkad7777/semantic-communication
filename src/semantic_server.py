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
    # ...existing code...

@app.route('/health', methods=['GET'])
def health_check():
    # ...existing code...

@app.route('/', methods=['GET'])
def home():
    # ...existing code...

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

@app.route('/run-awgn-auto', methods=['POST'])
def run_awgn_auto():
    """Endpoint to run the AWGN simulation automatically with default parameters"""
    try:
        # Import the awgn_simulation module
        import awgn_simulation
        
        # Run the simulation with default parameters (non-interactive)
        # This will save the awgn_simulation.png file
        thread = threading.Thread(
            target=awgn_simulation.run_awgn_simulation,
            kwargs={
                'signal_frequency': 10,
                'sampling_freq': 1000,
                'duration': 1,
                'desired_SNR': 20
            }
        )
        thread.start()
        
        return jsonify({
            'status': 'success',
            'message': 'AWGN simulation executed automatically'
        })
    except Exception as e:
        print(f"Error running automatic AWGN simulation: {e}")
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

def run_server():
    """Function to start the Flask server"""
    print("Starting server on http://localhost:5000")
    print("Use the /calculate-similarity endpoint to get semantic similarity between texts")
    app.run(debug=True, port=5000)

if __name__ == '__main__':
    run_server()