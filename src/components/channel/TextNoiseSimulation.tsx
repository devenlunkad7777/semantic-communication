import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/types';
import { setTextNoise } from '../../store/semanticSlice';
import { deleteRandomToken, replaceRandomToken, randomTokenPermutation } from '../../utils/semanticEmbedding';
import Slider from '../common/Slider';
import Button from '../common/Button';

const TextNoiseSimulation: React.FC = () => {
  const dispatch = useDispatch();
  const { 
    inputText, 
    textNoiseType,
    textNoiseProbability,
    textNoiseRange,
    textNoiseFillerToken,
    isLoading 
  } = useSelector((state: RootState) => state.semantic);

  // Define noise type as a union type to match the expected values
  const handleNoiseTypeChange = (type: 'delete' | 'replace' | 'permutation') => {
    dispatch(setTextNoise({ type }));
  };

  const handleProbabilityChange = (value: number) => {
    dispatch(setTextNoise({ probability: value }));
  };

  const handleRangeChange = (value: number) => {
    dispatch(setTextNoise({ range: value }));
  };

  const handleFillerTokenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setTextNoise({ fillerToken: e.target.value }));
  };

  const applyTextNoise = () => {
    if (!inputText) return;
    
    let noisyText = inputText;
    
    switch (textNoiseType) {
      case 'delete':
        noisyText = deleteRandomToken(inputText, textNoiseProbability);
        break;
      case 'replace':
        noisyText = replaceRandomToken(inputText, textNoiseProbability, textNoiseFillerToken);
        break;
      case 'permutation':
        noisyText = randomTokenPermutation(inputText, textNoiseRange);
        break;
      default:
        break;
    }
    
    dispatch(setTextNoise({ appliedNoisyText: noisyText }));
  };

  return (
    <div className="w-full bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md transition-colors mt-4">
      <h2 className="text-lg font-semibold mb-4 dark:text-white">Text Noise Simulation</h2>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Noise Type</label>
        <div className="flex flex-wrap gap-2">
          <Button
            label="Delete Tokens"
            onClick={() => handleNoiseTypeChange('delete')}
            primary={textNoiseType === 'delete'}
            className="text-sm"
          />
          <Button
            label="Replace Tokens"
            onClick={() => handleNoiseTypeChange('replace')}
            primary={textNoiseType === 'replace'}
            className="text-sm"
          />
          <Button
            label="Permute Tokens"
            onClick={() => handleNoiseTypeChange('permutation')}
            primary={textNoiseType === 'permutation'}
            className="text-sm"
          />
        </div>
      </div>
      
      {(textNoiseType === 'delete' || textNoiseType === 'replace') && (
        <Slider
          label="Noise Probability"
          value={textNoiseProbability}
          onChange={handleProbabilityChange}
          min={0}
          max={1}
          step={0.01}
          tooltip="Probability of deleting/replacing each token"
        />
      )}
      
      {textNoiseType === 'replace' && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Replacement Token
          </label>
          <input 
            type="text"
            value={textNoiseFillerToken}
            onChange={handleFillerTokenChange}
            placeholder="BLANK"
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white transition-colors"
          />
        </div>
      )}
      
      {textNoiseType === 'permutation' && (
        <Slider
          label="Permutation Range"
          value={textNoiseRange}
          onChange={handleRangeChange}
          min={1}
          max={10}
          step={1}
          tooltip="Maximum shift range for each token"
        />
      )}
      
      <div className="flex justify-end mt-4">
        <Button
          label="Apply Text Noise"
          onClick={applyTextNoise}
          disabled={isLoading || !inputText}
        />
      </div>
    </div>
  );
};

export default TextNoiseSimulation;