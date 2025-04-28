import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/types';
import ZoomableImageModal from '../common/ZoomableImageModal';

interface AWGNPlotDisplayProps {
  refreshTrigger?: number; // Optional prop to trigger a refresh of the plot
}

const AWGNPlotDisplay: React.FC<AWGNPlotDisplayProps> = ({ refreshTrigger = 0 }) => {
  const [plotData, setPlotData] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  // State for modal
  const [showModal, setShowModal] = useState<boolean>(false);
  
  // Get the input text and SNR value from Redux state
  const { inputText, snrValue } = useSelector((state: RootState) => state.semantic);
  
  // Keep track of the last text we plotted to avoid unnecessary refreshes
  const [lastPlottedText, setLastPlottedText] = useState<string>('');
  const [lastPlottedSNR, setLastPlottedSNR] = useState<number>(0);
  
  // Define the backend URL - this is the Flask server address
  const BACKEND_URL = 'http://localhost:5000';

  // Fetch the plot whenever refreshTrigger changes or input text or SNR value changes
  useEffect(() => {
    // Skip if nothing relevant changed and this isn't a manual refresh
    if (
      inputText === lastPlottedText && 
      snrValue === lastPlottedSNR && 
      refreshTrigger === 0
    ) {
      return;
    }
    
    // Function to fetch the latest plot from the server
    const fetchPlot = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Add a cache-busting parameter to avoid browser caching
        const timestamp = new Date().getTime();
        // Change the URL to point to the Flask server
        const response = await fetch(`${BACKEND_URL}/awgn_simulation.png?t=${timestamp}`, {
          method: 'GET',
          // Add these headers to help with CORS
          headers: {
            'Accept': 'image/png',
            'Cache-Control': 'no-cache'
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch AWGN simulation plot');
        }
        
        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob);
        setPlotData(imageUrl);
        
        // Update the last plotted values
        setLastPlottedText(inputText);
        setLastPlottedSNR(snrValue);
      } catch (err) {
        console.error('Error fetching AWGN plot:', err);
        setError('Failed to load AWGN simulation plot. Make sure the simulation has been run.');
      } finally {
        setIsLoading(false);
      }
    };

    // Add a small delay to ensure the plot file has been generated
    // before attempting to fetch it (especially when running automatically)
    const fetchTimer = setTimeout(() => {
      fetchPlot();
    }, 2000); // 2 second delay to give time for plot generation

    // Clean up the timeout if component unmounts or dependencies change
    return () => clearTimeout(fetchTimer);
  }, [refreshTrigger, inputText, snrValue, BACKEND_URL, lastPlottedText, lastPlottedSNR]); // Re-fetch when input text or SNR changes

  const handleRunSimulation = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Call the automatic simulation endpoint with the current input text and SNR value
      const response = await fetch(`${BACKEND_URL}/run-awgn-auto`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          text: inputText || "Hello, Semantic Communication!",
          snr: snrValue
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to run AWGN simulation');
      }
      
      // Wait for a moment to ensure the plot is generated
      setTimeout(async () => {
        // Add a cache-busting parameter to avoid browser caching
        const timestamp = new Date().getTime();
        const imgResponse = await fetch(`${BACKEND_URL}/awgn_simulation.png?t=${timestamp}`, {
          headers: {
            'Accept': 'image/png',
            'Cache-Control': 'no-cache'
          }
        });
        
        if (!imgResponse.ok) {
          throw new Error('Failed to fetch updated AWGN plot');
        }
        
        const blob = await imgResponse.blob();
        const imageUrl = URL.createObjectURL(blob);
        setPlotData(imageUrl);
        setLastPlottedText(inputText); // Update last plotted text
        setLastPlottedSNR(snrValue);   // Update last plotted SNR
        setIsLoading(false);
      }, 2000); // 2 second delay
    } catch (err) {
      console.error('Error running or fetching AWGN simulation:', err);
      setError('Failed to run AWGN simulation or fetch plot.');
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <h3 className="text-md font-medium mb-3 dark:text-white">AWGN Simulation Plot</h3>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64 bg-gray-100 dark:bg-gray-700 rounded">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="flex flex-col justify-center items-center h-64 bg-gray-100 dark:bg-gray-700 rounded p-4">
          <p className="text-red-500 text-center mb-4">{error}</p>
          <button
            onClick={handleRunSimulation}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Run AWGN Simulation
          </button>
        </div>
      ) : plotData ? (
        <div className="flex flex-col items-center">
          <div className="relative group">
            <img 
              src={plotData} 
              alt="AWGN Simulation" 
              className="max-w-full h-auto rounded shadow-lg cursor-pointer hover:shadow-xl transition-all"
              onClick={() => setShowModal(true)}
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
              <button
                onClick={() => setShowModal(true)}
                className="bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-lg"
              >
                <span className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                  Click to Zoom
                </span>
              </button>
            </div>
          </div>
          <div className="mt-3 text-sm text-gray-600 dark:text-gray-300">
            <span className="font-medium">Current SNR: {snrValue} dB</span>
            {(inputText !== lastPlottedText || snrValue !== lastPlottedSNR) && (
              <span className="ml-2 text-amber-500 dark:text-amber-400">
                (Click "Re-run" to update)
              </span>
            )}
          </div>
          <button
            onClick={handleRunSimulation}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Re-run Simulation
          </button>
          {(inputText !== lastPlottedText || snrValue !== lastPlottedSNR) && (
            <p className="mt-2 text-sm text-amber-500 dark:text-amber-400">
              {inputText !== lastPlottedText ? "Text has changed. " : ""}
              {snrValue !== lastPlottedSNR ? "SNR value has changed. " : ""}
              Click "Re-run Simulation" to update the plot.
            </p>
          )}
          
          {/* Zoomable modal */}
          {showModal && plotData && (
            <ZoomableImageModal
              imageUrl={plotData}
              altText="AWGN Simulation"
              onClose={() => setShowModal(false)}
            />
          )}
        </div>
      ) : (
        <div className="flex justify-center items-center h-64 bg-gray-100 dark:bg-gray-700 rounded">
          <button
            onClick={handleRunSimulation}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Run AWGN Simulation
          </button>
        </div>
      )}
    </div>
  );
};

export default AWGNPlotDisplay;