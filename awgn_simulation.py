import numpy as np
import matplotlib.pyplot as plt
import io
import base64

def text_to_sinusoidal(text, sampling_rate=10):
    """
    Convert text to a sinusoidal wave representation.
    
    Args:
        text: Input text string
        sampling_rate: Number of points per character
        
    Returns:
        tuple: (time array, original signal, character positions)
    """
    if not text:
        text = "Default text for simulation"
    
    # Map text to numerical values (ASCII values)
    numerical_values = np.array([ord(char) for char in text])
    
    # Generate detailed time values with multiple points per character
    t = np.linspace(0, len(numerical_values), len(numerical_values) * sampling_rate)
    
    # Generate x values (indices of characters) for scatter points
    char_positions = np.arange(len(numerical_values))
    
    # Normalize ASCII values to get amplitudes between 0 and 1
    amplitude = numerical_values / np.max(numerical_values)
    
    # Generate the sinusoidal signal
    # Use a frequency that shows reasonable oscillation
    frequency = 2.0 * np.pi / (len(numerical_values) / 3)  # Adjust frequency based on text length
    
    # Create the sinusoidal wave with a smoother curve (using interpolation for values between characters)
    signal = np.zeros(len(t))
    for i, amp in enumerate(amplitude):
        # Add a sinusoidal component for each character
        signal += amp * np.sin(frequency * (t - i)) * np.exp(-0.5 * ((t - i) / 0.5) ** 2)
    
    # Normalize the final signal
    signal = signal / np.max(np.abs(signal))
    
    return t, signal, char_positions, amplitude

def run_awgn_simulation(text="Hello, Semantic Communication!", sampling_rate=10, desired_SNR=20):
    """
    Run AWGN simulation with the given parameters, converting text to sinusoidal signal.
    
    Args:
        text: Text to convert to sinusoidal signal
        sampling_rate: Number of points per character
        desired_SNR: Signal-to-Noise ratio in dB (default: 20)
        
    Returns:
        dict: Dictionary containing simulation data and plot as base64 string
    """
    # Convert text to sinusoidal
    t, original_signal, char_positions, amplitudes = text_to_sinusoidal(text, sampling_rate)
    
    # Calculate signal power
    signal_power = np.mean(original_signal**2)
    
    # Calculate noise power based on SNR
    noise_power = signal_power / (10**(desired_SNR / 10))
    
    # Generate Gaussian noise
    noise = np.sqrt(noise_power) * np.random.randn(len(original_signal))
    
    # Add noise to the original signal
    noisy_signal = original_signal + noise
    
    # Create plot
    plt.figure(figsize=(10, 8))
    
    # Plot original text as ASCII values
    plt.subplot(4, 1, 1)
    plt.stem(char_positions, amplitudes, basefmt=" ", linefmt="C0-", markerfmt="C0o")
    plt.title(f'Text Representation: "{text}"')
    plt.xlabel('Character Position')
    plt.ylabel('Normalized\nASCII Value')
    plt.grid(True, alpha=0.3)
    
    # Plot the original signal
    plt.subplot(4, 1, 2)
    plt.plot(t, original_signal)
    plt.title('Original Sinusoidal Signal')
    plt.xlabel('Time')
    plt.ylabel('Amplitude')
    plt.grid(True, alpha=0.3)
    
    # Plot the noise
    plt.subplot(4, 1, 3)
    plt.plot(t, noise)
    plt.title(f'Gaussian Noise (SNR: {desired_SNR} dB)', fontweight='bold')
    plt.xlabel('Time')
    plt.ylabel('Amplitude')
    plt.grid(True, alpha=0.3)
    
    # Plot the noisy signal
    plt.subplot(4, 1, 4)
    plt.plot(t, noisy_signal)
    plt.title(f'Noisy Signal with SNR = {desired_SNR} dB')
    plt.xlabel('Time')
    plt.ylabel('Amplitude')
    plt.grid(True, alpha=0.3)
    
    plt.tight_layout()
    
    # Save plot to in-memory buffer
    buf = io.BytesIO()
    plt.savefig(buf, format='png', dpi=100)
    buf.seek(0)
    
    # Convert PNG image to base64 string
    plot_base64 = base64.b64encode(buf.read()).decode('utf-8')
    plt.close()
    
    # Sample data points (decimating to avoid sending too much data)
    sample_rate = 10  # Take every 10th point to reduce data size
    
    result = {
        'plot_base64': plot_base64,
        'time': t[::sample_rate].tolist(),
        'original_signal': original_signal[::sample_rate].tolist(),
        'noise': noise[::sample_rate].tolist(),
        'noisy_signal': noisy_signal[::sample_rate].tolist(),
        'snr': desired_SNR,
        'text': text
    }
    
    # Show the results
    print(f"AWGN Simulation Complete")
    print(f"Input Text: {text}")
    print(f"SNR: {desired_SNR} dB")
    
    # Also save the figure to a file for reference
    plt.figure(figsize=(10, 8))
    
    # Convert base64 back to image for display
    img_data = base64.b64decode(result['plot_base64'])
    buf = io.BytesIO(img_data)
    img = plt.imread(buf, format='png')
    
    plt.imshow(img)
    plt.axis('off')
    
    # Save the figure
    plt.savefig('awgn_simulation.png')
    print(f"Plot saved to 'awgn_simulation.png'")
    
    return result

def run_interactive_simulation():
    """Run the AWGN simulation with interactive parameters from the user"""
    print("\n=== AWGN Simulation Parameters ===")
    try:
        text = input("Enter text to simulate (default: 'Hello, Semantic Communication!'): ") or "Hello, Semantic Communication!"
        snr = float(input("Enter desired SNR in dB (default: 20): ") or 20)
        
        result = run_awgn_simulation(
            text=text,
            desired_SNR=snr
        )
        
        print("\nSimulation completed successfully!")
        
    except ValueError as e:
        print(f"Invalid input: {e}")
        print("Using default parameters instead.")
        run_awgn_simulation()


# Run the simulation directly if this file is executed
if __name__ == "__main__":
    run_interactive_simulation()