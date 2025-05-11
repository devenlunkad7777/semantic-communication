import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store/types';
import { ActivePath, TransmissionMode } from '../../store/types';
import { motion } from 'framer-motion';
import { getCachedModelSimilarity } from '../../utils/semanticEmbedding';
import { processCommunication } from '../../store/semanticSlice';
import Button from '../common/Button';

const Receiver: React.FC = () => {
  const dispatch = useDispatch();  const { 
    inputText, 
    reconstructedText, 
    semanticSimilarity,
    bpskReconstructedText,
    bpskNoisyText, // Added bpskNoisyText to access the noisy text
    iterationCount = 0,
    activePath, // Add the activePath to track which path was used
    transmissionMode // Add transmissionMode to use in the path explanation
  } = useSelector((state: RootState) => state.semantic);
  const [similarityScore, setSimilarityScore] = useState<number | null>(semanticSimilarity);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Use BPSK reconstructed text if available, otherwise use the regular reconstructed text
  const finalReconstructedText = bpskReconstructedText || reconstructedText;

  // Get the active path label
  const getActivePathLabel = () => {
    switch (activePath) {
      case ActivePath.LOS:
        return {
          label: "Line-of-Sight",
          icon: "📡", 
          color: "text-blue-600 dark:text-blue-400",
          bg: "bg-blue-50 dark:bg-blue-900/20",
          border: "border-blue-200 dark:border-blue-800"
        };
      case ActivePath.RELAY:
        return {
          label: "Relay-Assisted",
          icon: "🔄",
          color: "text-green-600 dark:text-green-400",
          bg: "bg-green-50 dark:bg-green-900/20",
          border: "border-green-200 dark:border-green-800"
        };
      default:
        return {
          label: "Not determined",
          icon: "❓",
          color: "text-gray-600 dark:text-gray-400",
          bg: "bg-gray-50 dark:bg-gray-800",
          border: "border-gray-200 dark:border-gray-700"
        };
    }
  };

  const pathInfo = getActivePathLabel();  // Component to display the active path
  const ActivePathIndicator = () => {
    if (!activePath || activePath === ActivePath.NONE) return null;
    
    return (
      <motion.div 
        className={`flex items-center px-3 py-2 rounded-md mt-2 mb-4 ${pathInfo.bg} ${pathInfo.border} border`}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.span 
          className="text-lg mr-2"
          initial={{ scale: 0.5 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          {pathInfo.icon}
        </motion.span>
        <div className="flex-1">
          <h4 className={`font-medium ${pathInfo.color}`}>Active Path:</h4>
          <p className="text-sm dark:text-white">{pathInfo.label}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            {getPathSelectionReason()}
          </p>
        </div>
        <div className="ml-auto flex items-center">
          <div className={`h-2 w-2 rounded-full mr-1 ${activePath === ActivePath.RELAY ? 'bg-green-500' : 'bg-blue-500'} animate-pulse`}></div>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {activePath === ActivePath.RELAY ? 'Relay mode: ' + (pathInfo.label.includes('Relay') ? pathInfo.label.split(' ')[1] : '') : 'Direct transmission'}
          </span>
        </div>
      </motion.div>
    );
  };

  // Fetch semantic similarity score from the Python backend when texts change
  useEffect(() => {
    const fetchSimilarity = async () => {
      if (!inputText || !finalReconstructedText) {
        setSimilarityScore(0);
        return;
      }

      const cleanReconstructedText = getCleanReconstructedText();
      
      try {
        // Get similarity score from backend
        const score = await getCachedModelSimilarity(inputText, cleanReconstructedText);
        setSimilarityScore(score);
        console.log('Semantic similarity from Python backend:', score);
      } catch (error) {
        console.error('Error fetching similarity from backend:', error);
        // If backend fails, use the stored similarity score from Redux
        setSimilarityScore(semanticSimilarity || 0);
      }
    };

    fetchSimilarity();
  }, [inputText, finalReconstructedText, semanticSimilarity]);

  // Function to handle the continue iteration button click
  const handleContinueIteration = () => {
    if (!finalReconstructedText) return;
    
    setIsProcessing(true);
    
    // Use the reconstructed text as the new input for the next iteration
    // Use type assertion to fix the TypeScript error with dispatch
    dispatch(processCommunication({ 
      text: finalReconstructedText, 
      isIteration: true, 
      iterationNumber: iterationCount + 1 
    }) as any);
    
    // Reset processing state after a small delay to show loading animation
    setTimeout(() => setIsProcessing(false), 800);
  };

  // Clean up the reconstructed text to remove explanatory content
  const getCleanReconstructedText = () => {
    if (!finalReconstructedText) return '';

    // Check for various patterns of explanatory text and extract just the reconstructed message
    
    // Check common explanatory phrases
    if (
      finalReconstructedText.toLowerCase().includes('this is impossible to answer') ||
      finalReconstructedText.toLowerCase().includes('without knowing the context') ||
      finalReconstructedText.toLowerCase().includes('impossible to reconstruct')
    ) {
      // Return just the original message, or a clean error message
      return inputText || "Unable to reconstruct the message";
    }
    
    // Pattern: "The original sentence was likely something very close to: **"text"**"
    const boldTextMatch = finalReconstructedText.match(/\*\*"(.*?)"\*\*/);
    if (boldTextMatch && boldTextMatch[1]) {
      return boldTextMatch[1];
    }
    
    // Pattern: "The original message was likely: 'text'"
    const likelyMatch = finalReconstructedText.match(/the original (?:message|sentence) was likely:?\s*["']?(.*?)["']?(?:\.|$)/i) ||
                        finalReconstructedText.match(/original text:?\s*["']?(.*?)["']?(?:\.|$)/i);
    
    if (likelyMatch && likelyMatch[1]) {
      return likelyMatch[1].trim();
    }
    
    // Pattern: "Here's why:" or "Here is why:" - take everything before
    const hereWhyIndex = finalReconstructedText.search(/Here(?:'s| is) why:/i);
    if (hereWhyIndex > 0) {
      return finalReconstructedText.substring(0, hereWhyIndex).trim();
    }
    
    // Pattern: Anything that starts with "The core meaning of" - usually contains quotes
    const coreMeaningMatch = finalReconstructedText.match(/The core meaning of ['"]([^'"]*)['"]/i);
    if (coreMeaningMatch && coreMeaningMatch[1]) {
      return coreMeaningMatch[1];
    }
    
    // If other complex patterns failed, try a simple approach:
    // If there are quotes in the text, assume the reconstruction is in quotes
    const quotedTextMatch = finalReconstructedText.match(/["'](.*?)["']/);
    if (quotedTextMatch && quotedTextMatch[1]) {
      return quotedTextMatch[1];
    }

    // If we can't extract a specific message, return the first sentence only
    // This avoids lengthy explanations
    const firstSentenceMatch = finalReconstructedText.match(/^([^.!?]+[.!?])/);
    if (firstSentenceMatch && firstSentenceMatch[1]) {
      return firstSentenceMatch[1].trim();
    }

    // If all else fails, return the original text
    return finalReconstructedText;
  };

  // Function to highlight differences between original and reconstructed text
  const highlightDifferences = () => {
    if (!inputText) return null;
    
    const cleanReconstructedText = getCleanReconstructedText();
    const score = similarityScore || 0;
    
    // Simple character by character comparison (in a real app would use a proper diff algorithm)
    const originalWords = inputText.split(' ');
    const reconstructedWords = cleanReconstructedText.split(' ');
    
    return (
      <div className="flex flex-col space-y-4">
        <div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Original Text:</h3>
          <p className="p-3 bg-gray-100 dark:bg-gray-700 rounded-md dark:text-white transition-colors">
            {inputText}
          </p>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Reconstructed Text:
            {bpskReconstructedText && 
              <span className="ml-2 text-xs text-blue-600 dark:text-blue-400">
                (BPSK reconstruction via LLM)
              </span>
            }
          </h3>
          <p className="p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 rounded-md transition-colors">
            {reconstructedWords.map((word, i) => {
              const isMatch = i < originalWords.length && 
                originalWords[i].toLowerCase() === word.toLowerCase();
              
              return (
                <span 
                  key={i} 
                  className={`${isMatch ? 'dark:text-gray-200' : 'text-red-600 font-medium dark:text-red-400'}`}
                >
                  {word}{' '}
                </span>
              );
            })}
          </p>
        </div>

        {/* Display the BPSK Noisy Text if available */}
        {bpskNoisyText && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              BPSK Noisy Text:
            </h3>
            <p className="p-3 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-100 dark:border-yellow-800 rounded-md transition-colors">
              {bpskNoisyText}
            </p>
          </div>
        )}
          {/* Python Backend Semantic Similarity Score Display */}
        <div className="mt-2 p-4 bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600">
          <div className="flex flex-col space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Sentence-Transformer Similarity:
              </span>
              <span className="font-bold text-lg">
                {(score * 100).toFixed(2)}%
              </span>
            </div>
            <div className="text-sm">
              <span className="font-medium">Similarity Score: </span>
              <span className="font-mono">{score.toFixed(4)}</span>
              <span className="ml-2 text-gray-500">({getSimilarityRating(score)})</span>
            </div>
              {/* Path Information */}
            {activePath && activePath !== ActivePath.NONE && (
              <div 
                className={`mt-1 text-sm ${pathInfo.color} flex items-center cursor-help`}
                title={getPathSelectionReason()}
              >
                <span className="mr-1">{pathInfo.icon}</span>
                <span className="font-medium">
                  {activePath === ActivePath.RELAY ? 
                    `Relay-Assisted Communication (${activePath === ActivePath.RELAY ? "Better performance" : "Activated"})` : 
                    "Line-of-Sight Direct Communication"}
                </span>
                <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">
                  (hover for details)
                </span>
              </div>
            )}
          </div>
          <div className="mt-2 w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
            <div 
              className={`h-2.5 rounded-full ${getSimilarityColorClass(score)}`} 
              style={{ width: `${score * 100}%` }}
            ></div>
          </div>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Calculated using Python sentence-transformers (all-MiniLM-L6-v2 model)
          </p>
        </div>
      </div>
    );
  };
  
  // Helper function to determine color based on similarity score
  const getSimilarityColorClass = (score: number): string => {
    if (score >= 0.8) return "text-green-600 dark:text-green-400 bg-green-500";
    if (score >= 0.6) return "text-blue-600 dark:text-blue-400 bg-blue-500";
    if (score >= 0.4) return "text-yellow-600 dark:text-yellow-400 bg-yellow-500";
    return "text-red-600 dark:text-red-400 bg-red-500";
  };
  
  // Helper function to provide a text rating based on similarity score
  const getSimilarityRating = (score: number): string => {
    if (score >= 0.9) return "Excellent";
    if (score >= 0.8) return "Very Good";
    if (score >= 0.7) return "Good";
    if (score >= 0.6) return "Moderate";
    if (score >= 0.4) return "Poor";
    return "Very Poor";
  };  // Helper function to get explanation for why a specific path was chosen - uses transmissionMode from component scope
  const getPathSelectionReason = () => {
    if (transmissionMode === TransmissionMode.LOS) {
      return "Direct Line-of-Sight mode was selected by the user.";
    }
    
    if (activePath === ActivePath.RELAY) {
      return "Relay path was used because it provided better signal quality.";
    }
    
    if (activePath === ActivePath.LOS) {
      return "Line-of-Sight path was used because the relay conditions weren't optimal.";
    }
    
    return "Path selection not determined.";
  };

  return (
    <div className="w-full bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md transition-colors">
      <h2 className="text-lg font-semibold mb-4 dark:text-white">Semantic Decoding (Receiver)</h2>
      
      <ActivePathIndicator />
      
      {finalReconstructedText ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {highlightDifferences()}
          
          {/* Add iteration information and control button */}
          <div className="mt-4 flex flex-col space-y-2">
            {iterationCount > 0 && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Current iteration: {iterationCount}
              </p>
            )}
            
            <Button
              label={isProcessing ? "Processing..." : "Continue to iterate"}
              onClick={handleContinueIteration}
              disabled={isProcessing}
              className="mt-2"
            />
            
            <p className="text-xs text-gray-500 italic">
              This will send the reconstructed text through the BPSK channel again
            </p>
          </div>

          {/* Display the active path information */}
          <div className={`mt-4 p-4 rounded-md border ${pathInfo.border} ${pathInfo.bg}`}>
            <div className="flex items-center space-x-2">
              <span className={`text-lg ${pathInfo.color}`}>{pathInfo.icon}</span>
              <span className={`text-sm font-medium ${pathInfo.color}`}>{pathInfo.label}</span>
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="p-6 text-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 rounded-md transition-colors">
          Awaiting transmission...
        </div>
      )}
    </div>
  );
};

export default Receiver;