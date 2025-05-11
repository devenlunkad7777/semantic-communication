import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setInputText, encodeText, processCommunication, runAwgnSimulation } from '../../store/semanticSlice';
import { RootState } from '../../store/types';
import Button from '../common/Button';
import LlmSummaryDisplay from './LlmSummaryDisplay';

const TextInput: React.FC = () => {
  const dispatch = useDispatch();
  const { inputText, isLoading, apiKey } = useSelector((state: RootState) => state.semantic);
  const [localText, setLocalText] = useState(inputText);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalText(e.target.value);
  };
  
  const handleSubmit = async () => {
    if (localText.trim() === '') return;
    
    // Update the Redux state with the new input text
    dispatch(setInputText(localText));
    
    // Get embedding for the input text
    await dispatch(encodeText(localText) as any);
    
    // Process the semantic communication
    await dispatch(processCommunication({ text: localText }) as any);
    
    // Automatically run the AWGN simulation with the new text
    await dispatch(runAwgnSimulation() as any);
    
    // Increment refresh trigger to tell visualization components to update
    setRefreshTrigger(prev => prev + 1);
  };
  
  return (
    <div className="w-full bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md transition-colors">
      <h2 className="text-lg font-semibold mb-2 dark:text-white">Input Text</h2>
      <textarea
        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3 dark:bg-gray-700 dark:text-white transition-colors"
        value={localText}
        onChange={handleInputChange}
        placeholder="Enter a sentence to encode and transmit semantically..."
        rows={3}
      />
      <div className="flex justify-end">
        <Button
          label={isLoading ? "Processing..." : "Transmit"}
          onClick={handleSubmit}
          disabled={isLoading || localText.trim() === ''}
        />
      </div>
      {!apiKey && (
        <p className="text-sm text-amber-500 dark:text-amber-400 mt-2">
          Demo mode: Using mock semantic processing. Add your Gemini API key in settings for real results.
        </p>
      )}
      
      {/* Add the LLM Summary Display component */}
      <LlmSummaryDisplay />
    </div>
  );
};

export default TextInput;