import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/types';
import { 
  setNoiseVariance, 
  setSimilarityThreshold, 
  processCommunication, 
  runAwgnSimulation,
  setSNRValue 
} from '../../store/semanticSlice';
import Slider from '../common/Slider';
import Button from '../common/Button';
import AWGNPlotDisplay from '../visualization/AWGNPlotDisplay';
import TextNoiseSimulation from './TextNoiseSimulation';

const ChannelSimulation: React.FC = () => {
  const dispatch = useDispatch();
  const { 
    originalVector, 
    noisyLOSVector, 
    noiseVariance, 
    similarityThreshold,
    isLoading,
    inputText,
    snrValue // Get the SNR value from Redux state
  } = useSelector((state: RootState) => state.semantic);
  
  // Add state to trigger AWGN plot refresh
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleNoiseChange = (value: number) => {
    dispatch(setNoiseVariance(value));
  };

  const handleThresholdChange = (value: number) => {
    dispatch(setSimilarityThreshold(value));
  };

  // Handle SNR slider change
  const handleSNRChange = (value: number) => {
    dispatch(setSNRValue(value));
  };

  const applyNoise = async () => {
    await dispatch(processCommunication() as any);
    
    // After processing communication, run the AWGN simulation with the current text
    await dispatch(runAwgnSimulation() as any);
    
    // Increment refresh trigger to reload the AWGN plot
    setRefreshTrigger(prev => prev + 1);
  };
  
  // When input text changes, update the refresh trigger
  useEffect(() => {
    if (inputText) {
      setRefreshTrigger(prev => prev + 1);
    }
  }, [inputText]);

  return (
    <div className="w-full">
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md transition-colors">
        <h2 className="text-lg font-semibold mb-4 dark:text-white">Channel Simulation</h2>
        
        <div className="mb-6">
          <Slider
            label="Noise Variance"
            value={noiseVariance}
            onChange={handleNoiseChange}
            min={0}
            max={1}
            step={0.01}
            tooltip="Controls how much noise is added to the semantic vector (higher = more noise)"
          />
          
          {/* SNR Slider for AWGN Simulation */}
          <Slider
            label="SNR Value (dB)"
            value={snrValue}
            onChange={handleSNRChange}
            min={5}
            max={50}
            step={1}
            tooltip="Signal-to-Noise Ratio for AWGN simulation (higher = less noise)"
          />

          <Slider
            label="Similarity Threshold for Relay"
            value={similarityThreshold}
            onChange={handleThresholdChange}
            min={0}
            max={1}
            step={0.01}
            tooltip="If semantic similarity falls below this threshold, relay mode will be used"
          />

          <div className="flex justify-end">
            <Button
              label="Apply Noise"
              onClick={applyNoise}
              disabled={isLoading || !originalVector}
            />
          </div>
        </div>
        
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          {/* Pass the refreshTrigger to AWGNPlotDisplay */}
          <AWGNPlotDisplay refreshTrigger={refreshTrigger} />
        </div>
      </div>
      
      {/* Text Noise Simulation Component */}
      <TextNoiseSimulation />
    </div>
  );
};

export default ChannelSimulation;