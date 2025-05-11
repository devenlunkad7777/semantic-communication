import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/types';
import { TransmissionMode, RelayMode } from '../../store/types';
import { 
  setTransmissionMode, 
  setRelayMode, 
  setDistanceBR, 
  setDistanceRD, 
  setPathLossExponent,
  setNoisePower,
  setSnrThreshold
} from '../../store/semanticSlice';
import VectorVisualization from '../visualization/VectorVisualization';
import RelayFlowDiagram from '../visualization/RelayFlowDiagram';
import { motion } from 'framer-motion';
import Slider from '../common/Slider';
import RelayPerformance from './RelayPerformance';

const Relay: React.FC = () => {
  const dispatch = useDispatch();
  const { 
    transmissionMode,
    relayMode, 
    noisyLOSVector, 
    noisyRelayVector, 
    combinedVector,
    semanticSimilarity, 
    similarityThreshold,
    // Relay parameters
    distanceBR,
    distanceRD,
    pathLossExponent,
    noisePower,
    snrThreshold
  } = useSelector((state: RootState) => state.semantic);

  const handleModeChange = (mode: TransmissionMode) => {
    dispatch(setTransmissionMode(mode));
  };

  const handleRelayModeChange = (mode: RelayMode) => {
    dispatch(setRelayMode(mode));
  };

  const isRelayActive = transmissionMode === TransmissionMode.RELAY && 
    semanticSimilarity !== null && 
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
          <div className="mb-4">
            <div className="p-3 mb-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 rounded-md transition-colors">
              <p className="text-sm dark:text-gray-200">
                When similarity falls below the threshold ({similarityThreshold.toFixed(2)}), 
                the relay node will combine two independent noisy copies to improve reception.
              </p>
            </div>

            {/* Relay Mode Selection */}
            <div className="mb-4">
              <h3 className="text-md font-medium mb-3 dark:text-white">Relay Mode</h3>
              <div className="flex justify-between space-x-2">
                <button
                  onClick={() => handleRelayModeChange(RelayMode.DF)}
                  className={`flex-1 py-2 px-4 rounded-md transition-colors ${
                    relayMode === RelayMode.DF
                      ? 'bg-green-600 dark:bg-green-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  Decode-and-Forward (DF)
                </button>
                
                <button
                  onClick={() => handleRelayModeChange(RelayMode.AF)}
                  className={`flex-1 py-2 px-4 rounded-md transition-colors ${
                    relayMode === RelayMode.AF
                      ? 'bg-yellow-600 dark:bg-yellow-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  Amplify-and-Forward (AF)
                </button>
              </div>
            </div>
            
            {/* Relay Parameters */}
            <div className="mb-4">
              <h3 className="text-md font-medium mb-3 dark:text-white">Relay Parameters</h3>

              <Slider
                label="Base Station to Relay Distance (meters)"
                value={distanceBR}
                onChange={(value) => dispatch(setDistanceBR(value))}
                min={1}
                max={50}
                step={1}
                tooltip="Distance between base station and relay node in meters"
              />

              <Slider
                label="Relay to Destination Distance (meters)"
                value={distanceRD}
                onChange={(value) => dispatch(setDistanceRD(value))}
                min={1}
                max={50}
                step={1}
                tooltip="Distance between relay node and destination in meters"
              />

              <Slider
                label="Path Loss Exponent"
                value={pathLossExponent}
                onChange={(value) => dispatch(setPathLossExponent(value))}
                min={2}
                max={5}
                step={0.1}
                tooltip="Higher values indicate more signal attenuation with distance"
              />

              <Slider
                label="Noise Power (mW)"
                value={noisePower * 1000} // Convert from Watts to milliWatts for display
                onChange={(value) => dispatch(setNoisePower(value / 1000))} // Convert back to Watts
                min={0.01}
                max={10}
                step={0.01}
                tooltip="Ambient noise power in milliWatts"
              />

              <Slider
                label="SNR Threshold"
                value={snrThreshold}
                onChange={(value) => dispatch(setSnrThreshold(value))}
                min={0.01}
                max={1}
                step={0.01}
                tooltip="Minimum acceptable Signal-to-Noise Ratio for communication"
              />
            </div>
            
            {/* Relay Mode Description */}
            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700/30 border border-gray-200 dark:border-gray-600 rounded-md transition-colors">
              <h4 className="text-sm font-medium mb-2 dark:text-white">
                {relayMode === RelayMode.DF ? "Decode-and-Forward (DF) Mode" : "Amplify-and-Forward (AF) Mode"}
              </h4>
              <p className="text-sm dark:text-gray-300">
                {relayMode === RelayMode.DF 
                  ? "In DF mode, the relay node fully decodes the received signal, processes it through the LLM, and then re-encodes before forwarding to the destination."
                  : "In AF mode, the relay node simply amplifies the received signal (boosting SNR) before forwarding it to the destination, without decoding."
                }
              </p>            </div>
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
        
        {/* Add RelayPerformance component when in Relay mode */}
        {transmissionMode === TransmissionMode.RELAY && <RelayPerformance />}
        
        {/* Add RelayFlowDiagram component when in Relay mode */}
        {transmissionMode === TransmissionMode.RELAY && <RelayFlowDiagram />}
      </div>
    </div>
  );
};

export default Relay;