import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/types';
import { RelayMode } from '../../store/types';

// Interface for performance metrics
interface PerformanceMetrics {
  outageProbability: number;
  ergodicCapacity: number;
  bitErrorRate: number;
}

const RelayPerformance: React.FC = () => {
  const { 
    relayMode, 
    distanceBR, 
    distanceRD,
    pathLossExponent,
    noisePower,
    snrThreshold,
    snrValue,
    inputText
  } = useSelector((state: RootState) => state.semantic);

  const [dfMetrics, setDFMetrics] = useState<PerformanceMetrics>({
    outageProbability: 0,
    ergodicCapacity: 0,
    bitErrorRate: 0,
  });

  const [afMetrics, setAFMetrics] = useState<PerformanceMetrics>({
    outageProbability: 0,
    ergodicCapacity: 0,
    bitErrorRate: 0,
  });
  // Calculate performance metrics whenever parameters change
  useEffect(() => {
    // Only calculate metrics if there's input text
    if (!inputText) {
      // Reset metrics to zero if no input
      setDFMetrics({
        outageProbability: 0,
        ergodicCapacity: 0,
        bitErrorRate: 0,
      });
      setAFMetrics({
        outageProbability: 0,
        ergodicCapacity: 0,
        bitErrorRate: 0,
      });
      return;
    }
    
    // These calculations are simplified models - in a real implementation,
    // you would use more accurate models based on the MATLAB reference code
    
    // Convert SNR from dB to linear
    const snrLinear = Math.pow(10, snrValue / 10);
    
    // Path loss calculations
    const meanPowerBR = Math.pow(distanceBR, -pathLossExponent);
    const meanPowerRD = Math.pow(distanceRD, -pathLossExponent);
    
    // Simplified calculations for DF mode
    const dfOutageProb = calculateOutageProbability('df', meanPowerBR, meanPowerRD, snrLinear, snrThreshold, noisePower);
    const dfCapacity = calculateErgodicCapacity('df', meanPowerBR, meanPowerRD, snrLinear, noisePower);
    const dfBER = calculateBER('df', meanPowerBR, meanPowerRD, snrLinear, noisePower);
    
    setDFMetrics({
      outageProbability: dfOutageProb,
      ergodicCapacity: dfCapacity,
      bitErrorRate: dfBER
    });

    // Simplified calculations for AF mode
    const afOutageProb = calculateOutageProbability('af', meanPowerBR, meanPowerRD, snrLinear, snrThreshold, noisePower);
    const afCapacity = calculateErgodicCapacity('af', meanPowerBR, meanPowerRD, snrLinear, noisePower);
    const afBER = calculateBER('af', meanPowerBR, meanPowerRD, snrLinear, noisePower);
    
    setAFMetrics({
      outageProbability: afOutageProb,
      ergodicCapacity: afCapacity,
      bitErrorRate: afBER
    });
  }, [distanceBR, distanceRD, pathLossExponent, noisePower, snrThreshold, snrValue, inputText]);
  
  // Simplified calculation functions based on MATLAB reference
  const calculateOutageProbability = (
    mode: string, 
    powerBR: number, 
    powerRD: number, 
    snr: number, 
    threshold: number,
    noise: number
  ): number => {
    // This is a simplified model - real calculations would be more complex
    const snrBR = powerBR * snr / noise;
    const snrRD = powerRD * snr / noise;
    
    if (mode === 'df') {
      // DF uses the minimum of both SNRs
      const snrDF = Math.min(snrBR, snrRD);
      return Math.max(0.001, Math.min(0.999, 1 - Math.exp(-(threshold / snrDF))));
    } else {
      // AF mode calculation (simplified)
      const snrAF = (snrBR * snrRD) / (snrBR + snrRD + 1);
      return Math.max(0.001, Math.min(0.999, 1 - Math.exp(-(threshold / snrAF))));
    }
  };

  const calculateErgodicCapacity = (
    mode: string, 
    powerBR: number, 
    powerRD: number, 
    snr: number,
    noise: number
  ): number => {
    const snrBR = powerBR * snr / noise;
    const snrRD = powerRD * snr / noise;
    
    if (mode === 'df') {
      // DF uses the minimum of both SNRs for capacity
      const snrDF = Math.min(snrBR, snrRD);
      return Math.log2(1 + snrDF);
    } else {
      // AF mode capacity calculation (simplified)
      const snrAF = (snrBR * snrRD) / (snrBR + snrRD + 1);
      return Math.log2(1 + snrAF);
    }
  };

  const calculateBER = (
    mode: string, 
    powerBR: number, 
    powerRD: number, 
    snr: number,
    noise: number
  ): number => {
    const snrBR = powerBR * snr / noise;
    const snrRD = powerRD * snr / noise;
    
    const qFunction = (x: number): number => {
      // Approximation of the Q-function
      return 0.5 * Math.exp(-0.5 * x * x);
    };
    
    if (mode === 'df') {
      // DF BER calculation
      const snrDF = Math.min(snrBR, snrRD);
      return qFunction(Math.sqrt(2 * snrDF));
    } else {
      // AF BER calculation
      const snrAF = (snrBR * snrRD) / (snrBR + snrRD + 1);
      return qFunction(Math.sqrt(2 * snrAF));
    }
  };

  const currentMetrics = relayMode === RelayMode.DF ? dfMetrics : afMetrics;
  const comparisonMetrics = relayMode === RelayMode.DF ? afMetrics : dfMetrics;
  const comparisonModeLabel = relayMode === RelayMode.DF ? 'Amplify-and-Forward' : 'Decode-and-Forward';
  // Max capacity value for progress bar scaling to prevent overflow
  const MAX_CAPACITY = 10;  // Set this to an appropriate maximum for your use case

  return (
    <div className="mt-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md transition-colors">
      <h3 className="text-lg font-semibold mb-4 dark:text-white">
        Relay Performance Metrics
      </h3>

      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <h4 className="text-md font-medium mb-3 dark:text-white">
          Relay Mode Comparison
        </h4>
        
        <div className="space-y-6">
          {/* Outage Probability Comparison */}
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Outage Probability</p>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Decode-and-Forward (DF):</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {(dfMetrics.outageProbability * 100).toFixed(2)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full" 
                    style={{ width: `${dfMetrics.outageProbability * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Amplify-and-Forward (AF):</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {(afMetrics.outageProbability * 100).toFixed(2)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-indigo-500 dark:bg-indigo-400 h-2 rounded-full" 
                    style={{ width: `${afMetrics.outageProbability * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 italic">
              Lower is better
            </p>
          </div>
          
          {/* Ergodic Capacity Comparison */}
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ergodic Capacity (bits/s/Hz)</p>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Decode-and-Forward (DF):</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {dfMetrics.ergodicCapacity.toFixed(2)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-green-600 dark:bg-green-500 h-2 rounded-full" 
                    style={{ width: `${Math.min((dfMetrics.ergodicCapacity / MAX_CAPACITY) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Amplify-and-Forward (AF):</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {afMetrics.ergodicCapacity.toFixed(2)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-emerald-500 dark:bg-emerald-400 h-2 rounded-full" 
                    style={{ width: `${Math.min((afMetrics.ergodicCapacity / MAX_CAPACITY) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 italic">
              Higher is better
            </p>
          </div>
          
          {/* Bit Error Rate Comparison */}
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Bit Error Rate</p>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Decode-and-Forward (DF):</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {dfMetrics.bitErrorRate === 0 ? '0' : dfMetrics.bitErrorRate.toExponential(2)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-red-600 dark:bg-red-500 h-2 rounded-full" 
                    style={{ width: `${Math.min((dfMetrics.bitErrorRate / 0.01) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Amplify-and-Forward (AF):</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {afMetrics.bitErrorRate === 0 ? '0' : afMetrics.bitErrorRate.toExponential(2)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-orange-500 dark:bg-orange-400 h-2 rounded-full" 
                    style={{ width: `${Math.min((afMetrics.bitErrorRate / 0.01) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 italic">
              Lower is better
            </p>
          </div>
        </div>

        {/* Current Mode Highlight */}
        <div className="mt-6 p-3 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">
          <h5 className="text-sm font-medium mb-2 dark:text-white">Current Mode: {relayMode === RelayMode.DF ? 'Decode-and-Forward (DF)' : 'Amplify-and-Forward (AF)'}</h5>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {relayMode === RelayMode.DF ? 
              "Decode-and-Forward (DF) typically provides better bit error rate performance compared to AF, especially at higher SNR values, because it regenerates the signal at the relay." : 
              "Amplify-and-Forward (AF) is generally simpler to implement but can amplify noise along with the signal, resulting in potential higher bit error rates at low SNR values."}
          </p>
          
          {inputText ? null : (
            <p className="mt-2 text-xs text-yellow-600 dark:text-yellow-400">
              Enter text input to see actual performance metrics.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RelayPerformance;
