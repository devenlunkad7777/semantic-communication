import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/types';
import { setApiKey, setUseSentenceTransformer } from '../../store/semanticSlice';
import Button from './Button';

const ModelSettings: React.FC = () => {
  const dispatch = useDispatch();
  const { apiKey, useSentenceTransformer } = useSelector((state: RootState) => state.semantic);
  
  const [geminiKeyInput, setGeminiKeyInput] = useState(apiKey);
  const [localTransformer, setLocalTransformer] = useState(useSentenceTransformer);
  const [showKeys, setShowKeys] = useState(false);
  
  const handleGeminiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGeminiKeyInput(e.target.value);
  };
  
  const handleTransformerToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalTransformer(e.target.checked);
  };
  
  const handleSubmit = () => {
    dispatch(setApiKey(geminiKeyInput));
    dispatch(setUseSentenceTransformer(localTransformer));
  };
  
  const toggleShowKeys = () => {
    setShowKeys(!showKeys);
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md transition-colors">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold dark:text-white">API Settings</h2>
        <Button 
          label={showKeys ? "Hide Keys" : "Show Keys"} 
          onClick={toggleShowKeys}
          primary={false}
          className="text-sm py-1 px-2"
        />
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Gemini API Key
          </label>
          <input
            type={showKeys ? "text" : "password"}
            value={geminiKeyInput}
            onChange={handleGeminiKeyChange}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            placeholder="Enter your Gemini API key"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Used for semantic vector generation and text reconstruction
          </p>
        </div>
        
        <div className="flex items-center">
          <input
            id="sentence-transformer-toggle"
            type="checkbox"
            checked={localTransformer}
            onChange={handleTransformerToggle}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label 
            htmlFor="sentence-transformer-toggle" 
            className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
          >
            Use Sentence Transformer for similarity calculation
          </label>
        </div>
        
        <div className="flex justify-end">
          <Button
            label="Save Settings"
            onClick={handleSubmit}
            primary={true}
          />
        </div>
      </div>
      
      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 rounded-md text-sm text-gray-600 dark:text-gray-300">
        <p className="font-medium mb-1">About the Semantic Similarity Models:</p>
        <p>This application uses two different approaches:</p>
        <ol className="list-decimal pl-5 space-y-1 mt-2">
          <li><span className="font-medium">Gemini API</span>: For text-to-vector and vector-to-text conversion</li>
          <li><span className="font-medium">Sentence Transformer</span>: For more accurate semantic similarity calculation using the all-MiniLM-L6-v2 model running on a local Python server</li>
        </ol>
        <p className="mt-2">To use the Sentence Transformer, you must start the local Python server with:</p>
        <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded my-2 font-mono text-xs">
          python semantic_server.py
        </div>
        <p>If the server is not running or you uncheck the option, a simpler local similarity calculation will be used.</p>
      </div>
    </div>
  );
};

export default ModelSettings;