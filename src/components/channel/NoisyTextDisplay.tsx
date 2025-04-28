// filepath: c:\Users\deven\OneDrive\Desktop\6th SEM mini project\mini\src\components\channel\NoisyTextDisplay.tsx
import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/types';
import { motion } from 'framer-motion';

const NoisyTextDisplay: React.FC = () => {
  const { inputText, noisyTextOutput } = useSelector((state: RootState) => state.semantic);

  return (
    <div className="w-full bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md transition-colors mt-4">
      <h2 className="text-lg font-semibold mb-4 dark:text-white">Noisy Received Text</h2>
      
      {noisyTextOutput ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col space-y-4"
        >
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Original Text:</h3>
            <p className="p-3 bg-gray-100 dark:bg-gray-700 rounded-md dark:text-white transition-colors">
              {inputText}
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Noisy Received Text:</h3>
            <p className="p-3 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-100 dark:border-yellow-800 rounded-md transition-colors">
              {noisyTextOutput}
            </p>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              This is the noisy text received after transmission, which is used to reconstruct the original message.
            </p>
          </div>
        </motion.div>
      ) : (
        <div className="p-6 text-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 rounded-md transition-colors">
          Apply text noise to see the received message before reconstruction...
        </div>
      )}
    </div>
  );
};

export default NoisyTextDisplay;