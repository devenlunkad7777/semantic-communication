import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store/types';
import Slider from '../common/Slider';
import { setEbnoValue } from '../../store/semanticSlice';

const BPSKNoiseSimulation: React.FC = () => {
  const dispatch = useDispatch();
  const { 
    ebnoValue,
    bpskNoisyText,
    bpskResult,
  } = useSelector((state: RootState) => state.semantic);
  
  const [showResults, setShowResults] = useState<boolean>(false);

  const handleEbNoChange = (value: number) => {
    dispatch(setEbnoValue(value));
  };

  useEffect(() => {
    // Show results section if we have BPSK results
    if (bpskNoisyText) {
      setShowResults(true);
    }
  }, [bpskNoisyText]);

  return (
    <div className="mt-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md transition-colors">
      <h2 className="text-lg font-semibold mb-2 dark:text-white">BPSK Modulation Text Noise</h2>
      
      <div className="mb-4">
        <Slider
          label="Eb/N0 Value (dB)"
          value={ebnoValue}
          onChange={handleEbNoChange}
          min={0}
          max={20}
          step={0.5}
          tooltip="Signal-to-Noise Ratio for BPSK modulation (higher = less noise)"
        />
        
        <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          <p className="italic">BPSK simulation runs automatically when you click "Transmit" in the main panel</p>
        </div>
      </div>
      
      {showResults && (
        <div className="space-y-4">
          {bpskResult && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bit Error Rate (BER):</h3>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold">{(bpskResult.ber * 100).toFixed(4)}%</span>
                <span className="text-sm text-gray-500">
                  ({bpskResult.error_bits} errors in {bpskResult.bit_count} bits)
                </span>
              </div>
              <div className="mt-2 w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                <div 
                  className={`h-2.5 rounded-full ${bpskResult.ber > 0.1 ? 'bg-red-500' : bpskResult.ber > 0.01 ? 'bg-yellow-500' : 'bg-green-500'}`} 
                  style={{ width: `${Math.min(bpskResult.ber * 500, 100)}%` }}
                ></div>
              </div>
            </div>
          )}
          
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Physical Layer Output (With Bit Errors):</h3>
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-md dark:text-white font-mono text-sm overflow-auto max-h-60">
              {bpskNoisyText || "No data received"}
            </div>
            <p className="mt-2 text-xs text-gray-600 dark:text-gray-400 italic">
              The noisy BPSK text is sent to the LLM for reconstruction and will appear in the Receiver's text box.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default BPSKNoiseSimulation;