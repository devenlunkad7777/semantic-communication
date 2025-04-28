import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/types';

const LlmSummaryDisplay: React.FC = () => {
  const { semanticSummary, isLoading } = useSelector((state: RootState) => state.semantic);

  return (
    <div className="mt-4">
      <h3 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">
        LLM-Processed Sentence:
      </h3>
      <div className="bg-gray-100 dark:bg-gray-700 rounded-md p-3 min-h-[60px] text-gray-800 dark:text-gray-200">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-pulse">Processing with LLM...</div>
          </div>
        ) : semanticSummary ? (
          semanticSummary
        ) : (
          <span className="text-gray-500 dark:text-gray-400 italic">
            Submit text to see the LLM-processed version before transmission
          </span>
        )}
      </div>
    </div>
  );
};

export default LlmSummaryDisplay;