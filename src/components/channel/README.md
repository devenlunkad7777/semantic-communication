# Channel Simulation Components

This module implements various channel models and noise simulations for the semantic communication system.

## Components

### ChannelSimulation

The `ChannelSimulation` component provides the core channel modeling functionality:

- Controls noise variance settings in the semantic domain
- Offers visual representation of the communication channel
- Manages SNR (Signal-to-Noise Ratio) settings for AWGN simulation
- Dispatches channel simulation actions to the Redux store

### BPSKNoiseSimulation

The `BPSKNoiseSimulation` component simulates a physical BPSK (Binary Phase Shift Keying) channel:

- Configurable Eb/N0 (Energy per bit to noise power spectral density ratio)
- Simulates bit errors that occur during BPSK transmission
- Displays BER (Bit Error Rate) based on SNR settings
- Shows the received noisy text after transmission

### TextNoiseSimulation

The `TextNoiseSimulation` component provides direct text-level noise simulation:

- Supports multiple noise types:
  - **Deletion**: Random character deletion
  - **Replacement**: Character substitution with random characters
  - **Permutation**: Local character order shuffling
- Configurable noise probability and affected range
- Real-time visualization of noise effects

### NoisyTextDisplay

The `NoisyTextDisplay` component visualizes the output of the noisy channel:

- Side-by-side comparison of original and noisy text
- Character-level highlighting of differences and errors
- Displays error statistics and affected positions

## Technical Details

### AWGN Channel Model

The Additive White Gaussian Noise (AWGN) channel adds Gaussian noise to the semantic vector:

```javascript
// Add Gaussian noise to each dimension of the vector
function addGaussianNoise(vector, noiseVariance) {
  return vector.map(value => {
    // Generate Gaussian noise with specified variance
    const noise = Math.sqrt(noiseVariance) * normalRandom();
    return value + noise;
  });
}
```

### BPSK Modulation and Demodulation

The system implements BPSK modulation for physical layer simulation:

1. Text is converted to binary data
2. Binary data is modulated using BPSK (0 → -1, 1 → +1)
3. AWGN is added to the modulated signal
4. The received signal is demodulated using a threshold detector
5. Binary data is converted back to text

### Bit Error Rate Calculation

For BPSK in AWGN channel, the theoretical BER is calculated as:

```
BER = 0.5 * erfc(√(Eb/N0))
```

Where:
- `erfc` is the complementary error function
- `Eb/N0` is the ratio of bit energy to noise power spectral density

## Usage

1. Adjust the noise variance slider to control semantic channel conditions
2. Set the Eb/N0 value for BPSK simulation to control physical channel conditions
3. Select noise type and parameters for text-level noise simulation
4. Observe the effects on transmitted information through visualization components
