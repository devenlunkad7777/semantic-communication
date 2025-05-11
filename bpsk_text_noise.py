import numpy as np

def text_to_bits(text, encoding='utf-8', errors='surrogatepass'):
    """Convert a string to a list of bits."""
    bits = bin(int.from_bytes(text.encode(encoding, errors), 'big'))[2:]
    # pad leading zeros to make full bytes
    padding = 8 - (len(bits) % 8)
    if padding != 8:
        bits = '0' * padding + bits
    return np.array([int(b) for b in bits])

def bits_to_text(bits, encoding='utf-8', errors='replace'):
    """Convert a list/array of bits back to a string."""
    # Ensure we have complete bytes (multiple of 8 bits)
    if len(bits) % 8 != 0:
        # Pad with zeros if necessary
        bits = np.append(bits, np.zeros(8 - (len(bits) % 8), dtype=int))
    
    try:
        # Convert bits to a bit string
        bit_string = ''.join(str(int(bit)) for bit in bits)
        
        # Process in byte chunks to handle potential errors more gracefully
        bytes_list = []
        for i in range(0, len(bit_string), 8):
            byte_bits = bit_string[i:i+8]
            try:
                byte_val = int(byte_bits, 2)
                bytes_list.append(byte_val)
            except ValueError:
                # Skip invalid bytes
                continue
        
        if not bytes_list:
            return "*** Error decoding text ***"
            
        # Convert bytes to text
        byte_data = bytes(bytes_list)
        return byte_data.decode(encoding, errors)
        
    except Exception as e:
        print(f"Error converting bits to text: {e}")
        return "*** Error decoding text ***"

def add_awgn_noise(signal, EbN0_dB):
    """Add AWGN noise to a BPSK signal for a given Eb/N0 in dB."""
    EbN0 = 10 ** (EbN0_dB / 10)
    # For BPSK, Eb = 1 (since symbols are ±1), so noise variance = N0/2 = 1/(2*EbN0)
    noise_variance = 1 / (2 * EbN0)
    noise = np.sqrt(noise_variance) * np.random.randn(*signal.shape)
    return signal + noise

def bpsk_mod(bits):
    """BPSK mod: 0 -> -1, 1 -> +1"""
    return 2*bits - 1

def bpsk_demod(rx):
    """Hard-decision BPSK demod: rx>0 -> 1 else 0."""
    return (rx >= 0).astype(int)

def transmit_text_over_awgn(text, EbN0_dB):
    """
    Transmit text over an AWGN channel using BPSK modulation.
    
    Args:
        text: Input text string
        EbN0_dB: Signal-to-noise ratio in dB
        
    Returns:
        tuple: (received_text, bit_error_rate, transmitted_bits, received_bits)
    """
    # 1. Text -> bits
    bits = text_to_bits(text)
    # 2. BPSK modulate
    tx_signal = bpsk_mod(bits)
    # 3. Add noise
    rx_signal = add_awgn_noise(tx_signal, EbN0_dB)
    # 4. Demodulate
    bits_rx = bpsk_demod(rx_signal)
    # 5. Bits -> text
    text_rx = bits_to_text(bits_rx)
    # 6. Compute BER
    ber = np.mean(bits != bits_rx)
    
    # Return received text, BER, and the bit arrays for analysis
    return text_rx, ber, bits, bits_rx

if __name__ == "__main__":
    input_text = "Hello, world!"
    for EbN0_dB in [0, 2, 4, 6, 8, 10]:
        received, ber, _, _ = transmit_text_over_awgn(input_text, EbN0_dB)
        print(f"Eb/N0 = {EbN0_dB} dB | BER = {ber:.5f} | Received: {received!r}")