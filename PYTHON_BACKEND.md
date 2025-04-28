# Cooperative Semantic Communication - Python Backend

This document explains how to set up and run the Python backend components of the Cooperative Semantic Communication project.

## Setup

1. Make sure you have Python 3.11 or newer installed

2. Install the required dependencies:

```bash
pip install -r requirements.txt
```

Or if you're using a virtual environment:

```bash
# Create a virtual environment (optional)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## Running the Backend

The backend is designed with a central entry point (`main.py`) that lets you choose which component to run:

```bash
python main.py
```

Without any arguments, this will display an interactive menu where you can choose:
1. Run Semantic Similarity Server
2. Run AWGN Simulation
0. Exit

### Command-line Usage

You can also directly specify which component to run using command-line arguments:

1. Run the Semantic Similarity Server:
```bash
python main.py server
```

2. Run the AWGN Simulation:
```bash
python main.py awgn
```

3. Get help:
```bash
python main.py --help
```

## Component Details

### Semantic Similarity Server

This runs a Flask server on `http://localhost:5000` that provides an API for calculating semantic similarity between texts using the sentence-transformers model (all-MiniLM-L6-v2). This server is used by the React frontend to calculate the similarity between original and reconstructed messages.

API Endpoints:
- `POST /calculate-similarity` - Calculate similarity between original and received texts
- `GET /health` - Health check endpoint

### AWGN Simulation

This runs an interactive simulation of Additive White Gaussian Noise (AWGN) on a sinusoidal signal. You can specify parameters like:
- Signal frequency
- Signal duration
- Signal-to-Noise Ratio (SNR)

The simulation will generate visualizations showing:
- Original signal
- Noise
- Noisy signal

The plots are saved to `awgn_simulation.png` for reference.

## Integration with Frontend

The Semantic Similarity Server must be running for the React frontend to properly calculate semantic similarity between original and reconstructed messages. The frontend makes API calls to this server when comparing texts.