import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/types';
import { TransmissionMode } from '../../store/types';
import { setTransmissionMode } from '../../store/semanticSlice';
import VectorVisualization from '../visualization/VectorVisualization';
import { motion } from 'framer-motion';

const Relay: React.FC = () => {
  const dispatch = useDispatch();
  const { 
    transmissionMode, 
    noisyLOSVector, 
    noisyRelayVector, 
    combinedVector,
    semanticSimilarity, // Changed from cosineSimilarity to semanticSimilarity
    similarityThreshold
  } = useSelector((state: RootState) => state.semantic);

  const handleModeChange = (mode: TransmissionMode) => {
    dispatch(setTransmissionMode(mode));
  };

  const isRelayActive = transmissionMode === TransmissionMode.RELAY && 
    semanticSimilarity !== null && // Changed from cosineSimilarity to semanticSimilarity
    semanticSimilarity < similarityThreshold;

  return (
    <div className="w-full bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md transition-colors">
      <h2 className="text-lg font-semibold mb-4 dark:text-white">Transmission Mode</h2>
      
      <div className="flex flex-col">
        <div className="flex justify-between mb-6 space-x-2">
          <button
            onClick={() => handleModeChange(TransmissionMode.LOS)}
            className={`flex-1 py-2 px-4 rounded-md transition-colors ${
              transmissionMode === TransmissionMode.LOS
                ? 'bg-blue-600 dark:bg-blue-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Direct Line-of-Sight
          </button>
          
          <button
            onClick={() => handleModeChange(TransmissionMode.RELAY)}
            className={`flex-1 py-2 px-4 rounded-md transition-colors ${
              transmissionMode === TransmissionMode.RELAY
                ? 'bg-blue-600 dark:bg-blue-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Relay-Assisted
          </button>
        </div>
        
        {transmissionMode === TransmissionMode.RELAY && (
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 rounded-md transition-colors">
            <p className="text-sm dark:text-gray-200">
              When similarity falls below the threshold ({similarityThreshold.toFixed(2)}), 
              the relay node will combine two independent noisy copies to improve reception.
            </p>
          </div>
        )}
        
        {isRelayActive && noisyRelayVector && combinedVector && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4"
          >
            <h3 className="text-md font-medium mb-3 dark:text-white">Relay Processing</h3>
            
            <div className="flex flex-col space-y-6">
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">LOS Vector</div>
                <VectorVisualization 
                  vector={noisyLOSVector}
                  label="Noisy LOS"
                  color="#EF4444"
                  width={300}
                  height={30}
                />
              </div>
              
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Relay Vector</div>
                <VectorVisualization 
                  vector={noisyRelayVector}
                  label="Noisy Relay"
                  color="#F59E0B"
                  width={300}
                  height={30}
                />
              </div>
              
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Combined Vector</div>
                <VectorVisualization 
                  vector={combinedVector}
                  label="Combined"
                  color="#10B981"
                  width={300}
                  height={30}
                />
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Relay;