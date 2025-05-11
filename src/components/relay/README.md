# Relay-Assisted Semantic Communication

This module implements a relay-assisted semantic communication system with two relay modes: Decode-and-Forward (DF) and Amplify-and-Forward (AF).

## Features

### Relay Communication Modes

1. **Decode-and-Forward (DF)**
   - At the relay node, the signal is fully demodulated and decoded
   - The decoded message is processed through the LLM to extract or refine semantic meaning
   - This semantic meaning is then re-modulated and forwarded to the destination
   - Offers better performance at lower SNR values by removing noise before forwarding

2. **Amplify-and-Forward (AF)**
   - The relay simply amplifies the received signal without decoding
   - The amplified signal (including any noise) is forwarded to the destination
   - Simpler implementation but may amplify noise along with the signal

### Configurable Parameters

- **Base to Relay Distance**: Distance between the base station and relay node (in meters)
- **Relay to Destination Distance**: Distance between the relay node and destination (in meters)
- **Path Loss Exponent**: Higher values indicate more signal attenuation with distance
- **Noise Power**: Ambient noise power in the communication channel
- **SNR Threshold**: Minimum acceptable Signal-to-Noise Ratio for communication

### Performance Metrics

The system visualizes several key performance metrics:

- **Outage Probability**: Probability that the SNR falls below the threshold
- **Ergodic Capacity**: Average data rate that can be achieved (bits/s/Hz)
- **Bit Error Rate (BER)**: Probability of bit errors during transmission

### Visual Components

- **Relay Flow Diagram**: Visual representation of the DF and AF communication processes
- **Vector Visualizations**: Visualize the noisy LOS vector, relay vector, and combined vector
- **Performance Comparison**: Compare the performance of DF and AF relay modes

## Implementation Details

The system implements a semantic communication framework where:

1. User input is processed through an LLM to extract semantic meaning
2. The semantic meaning is modulated for transmission
3. Signals are transmitted through both direct (LOS) and relay paths
4. The destination combines the signals from both paths
5. The combined signal is processed through the LLM to recover the original meaning

## Usage

1. Select "Relay-Assisted" transmission mode
2. Choose between DF and AF relay modes based on your requirements
3. Adjust the parameters to simulate different communication scenarios
4. Observe the performance metrics and flow diagram to understand the system behavior
