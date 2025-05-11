import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/types';
import { RelayMode } from '../../store/types';

const RelayFlowDiagram: React.FC = () => {
  const { relayMode } = useSelector((state: RootState) => state.semantic);

  const isDFMode = relayMode === RelayMode.DF;

  return (
    <div className="mt-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md transition-colors">
      <h3 className="text-lg font-semibold mb-4 dark:text-white">
        {isDFMode ? 'Decode-and-Forward (DF) Flow' : 'Amplify-and-Forward (AF) Flow'}
      </h3>

      <div className="relative w-full h-64 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        {/* Base Station */}
        <div className="absolute left-10 top-1/2 transform -translate-y-1/2 flex flex-col items-center">
          <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.553 22v-4.2m0-4.2V9.6M5.447 22h14.106M5.447 13.8h14.106M5.447 9.6v4.2m0 8.2v-4.2m0-4.2V9.6m5.894-7.2v19.6m2.318-19.6v19.6" />
            </svg>
          </div>
          <span className="text-xs font-medium dark:text-gray-300">Base Station</span>
        </div>

        {/* Relay Node */}
        <div className="absolute left-1/2 top-12 transform -translate-x-1/2 flex flex-col items-center">
          <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center text-white mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 11l3-3m0 0l3 3m-3-3v8m0-13a9 9 0 110 18 9 9 0 010-18z" />
            </svg>
          </div>
          <span className="text-xs font-medium dark:text-gray-300">Relay Node</span>
          <div className="mt-1 text-xs text-center p-1 rounded bg-gray-100 dark:bg-gray-700 dark:text-gray-300">
            {isDFMode ? 'Decode & Re-encode' : 'Amplify Signal'}
          </div>
        </div>

        {/* Destination */}
        <div className="absolute right-10 top-1/2 transform -translate-y-1/2 flex flex-col items-center">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <span className="text-xs font-medium dark:text-gray-300">Destination</span>
        </div>

        {/* Signal Path Lines */}
        {/* Base to Relay */}
        <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }}>
  <defs>
    <marker id="arrowhead" markerWidth="10" markerHeight="7" 
            refX="9" refY="3.5" orient="auto">
      <polygon points="0 0, 10 3.5, 0 7" fill="#4B5563" className="dark:fill-gray-400" />
    </marker>
  </defs>

  {/* Base to Relay (dashed diagonal upward) */}
  <path 
    d="M 90 128 L 280 78" 
    stroke="#4B5563" 
    strokeWidth="2" 
    strokeDasharray="5,5" 
    className="dark:stroke-gray-400"
    markerEnd="url(#arrowhead)" 
    fill="none"
  />

  {/* Base to Destination (straight horizontal) */}
  <path 
    d="M 90 128 L 520 128" 
    stroke="#4B5563" 
    strokeWidth="2" 
    className="dark:stroke-gray-400"
    markerEnd="url(#arrowhead)" 
    fill="none"
  />

  {/* Relay to Destination (diagonal downward) */}
  <path 
    d="M 335 78 L 520 128" 
    stroke="#4B5563" 
    strokeWidth="2" 
    strokeDasharray="5,5" 
    className="dark:stroke-gray-400"
    markerEnd="url(#arrowhead)" 
    fill="none"
  />
</svg>


        {/* Signal Animations */}
        <div className="signal-dot base-to-relay"></div>
        <div className="signal-dot base-to-destination"></div>
        <div className="signal-dot relay-to-destination"></div>
      </div>

      {/* Process Description */}
      <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">
        <h4 className="text-sm font-medium mb-2 dark:text-white">Process Flow</h4>
        {isDFMode ? (
          <ol className="text-xs space-y-2 text-gray-600 dark:text-gray-300 ml-4 list-decimal">
            <li>User input is processed through LLM for semantic extraction</li>
            <li>Semantic meaning is modulated using BPSK</li>
            <li>Signal transmitted to both relay and destination</li>
            <li>Relay <strong>demodulates and decodes</strong> the signal</li>
            <li>Decoded output is processed through LLM to recover semantic meaning</li>
            <li>Semantic meaning is re-modulated and transmitted to destination</li>
            <li>Destination combines direct and relay signals</li>
            <li>Combined signal is processed through LLM for final output</li>
          </ol>
        ) : (
          <ol className="text-xs space-y-2 text-gray-600 dark:text-gray-300 ml-4 list-decimal">
            <li>User input is processed through LLM for semantic extraction</li>
            <li>Semantic meaning is modulated using BPSK</li>
            <li>Signal transmitted to both relay and destination</li>
            <li>Relay simply <strong>amplifies</strong> the received signal</li>
            <li>Amplified signal is forwarded to destination without decoding</li>
            <li>Destination combines direct and amplified relay signals</li>
            <li>Combined signal is processed through LLM for final output</li>
          </ol>
        )}      </div>

      <style>{`
        .signal-dot {
          position: absolute;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #3B82F6;
        }
        
        .base-to-relay {
          animation: baseToRelay 3s infinite linear;
        }
        
        .base-to-destination {
          animation: baseToDestination 4s infinite linear;
        }
        
        .relay-to-destination {
          animation: relayToDestination 3s infinite linear;
          animation-delay: 1.5s;
        }
        
        @keyframes baseToRelay {
  0% {
    left: 90px;
    top: 128px;
    opacity: 1;
  }
  100% {
    left: 280px;
    top: 78px;
    opacity: 0;
  }
}

@keyframes baseToDestination {
  0% {
    left: 90px;
    top: 128px;
    opacity: 1;
  }
  100% {
    left: 520px;
    top: 128px;
    opacity: 0;
  }
}

@keyframes relayToDestination {
  0% {
    left: 335px;
    top: 78px;
    opacity: 1;
  }
  100% {
    left: 520px;
    top: 128px;
    opacity: 0;
  }
}


      `}</style>
    </div>
  );
};

export default RelayFlowDiagram;
