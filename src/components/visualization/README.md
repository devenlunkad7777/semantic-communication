# Visualization Components

This module provides visual representations of the semantic communication system's behavior and performance metrics.

## Components

### AWGNPlotDisplay

The `AWGNPlotDisplay` component visualizes the Additive White Gaussian Noise (AWGN) channel simulation:

- Displays time-domain plots of original signal, noise, and noisy signal
- Shows text representation as ASCII values
- Visualizes the effect of different SNR (Signal-to-Noise Ratio) values
- Provides interactive zoom functionality for detailed inspection
- Supports re-running simulations with different parameters

### FlowDiagram

The `FlowDiagram` component provides a visual representation of the semantic communication process:

- Illustrates the end-to-end flow of information through the system
- Shows encoding, channel transmission, and decoding stages
- Highlights active transmission paths and modes
- Updates dynamically based on the current system configuration
- Uses animated transitions to illustrate data flow

### RelayFlowDiagram

The `RelayFlowDiagram` component visualizes the relay-assisted communication system:

- Shows both direct (Line of Sight) and relay paths
- Illustrates different relay modes (DF and AF)
- Visualizes signal processing at relay nodes
- Depicts the signal combination process at the destination
- Updates dynamically based on relay configuration

### VectorVisualization

The `VectorVisualization` component provides insight into the high-dimensional semantic vectors:

- Visualizes semantic vectors using dimensionality reduction techniques (PCA/t-SNE)
- Shows the original vector, noisy vector, and reconstructed vector in the same space
- Illustrates the impact of channel noise on semantic representation
- Allows exploration of vector changes during transmission
- Helps understand semantic drift in different channel conditions

## Technical Details

### AWGN Simulation

The AWGN simulation uses the following mathematical model:

```
y(t) = x(t) + n(t)
```

Where:
- `x(t)` is the original signal
- `n(t)` is Gaussian noise with variance σ²
- `y(t)` is the resulting noisy signal

The SNR is calculated as:

```
SNR = 10 * log10(Signal Power / Noise Power) dB
```

### Vector Visualization Techniques

For visualizing high-dimensional semantic vectors, the component uses:

1. **Principal Component Analysis (PCA)**: Linear dimensionality reduction
   ```
   Y = X * W
   ```
   Where X is the data matrix and W contains the principal component weights

2. **t-SNE**: Non-linear dimensionality reduction for better cluster preservation
   ```
   P_ij = (p_j|i + p_i|j) / 2N
   ```
   Where p_j|i is the conditional probability of point j given point i

## Usage

1. Use the AWGN Plot Display to understand channel noise behavior
2. Observe the Flow Diagram to understand the system's current configuration
3. For relay systems, use the Relay Flow Diagram to visualize path selection
4. Utilize Vector Visualization to understand semantic representation changes during transmission
