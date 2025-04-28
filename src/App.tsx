import React, { useState } from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import { motion } from 'framer-motion';
import TextInput from './components/transmitter/TextInput';
import ChannelSimulation from './components/channel/ChannelSimulation';
import NoisyTextDisplay from './components/channel/NoisyTextDisplay';
import Receiver from './components/receiver/Receiver';
import Relay from './components/relay/Relay';
import FlowDiagram from './components/visualization/FlowDiagram';
import ThemeToggle from './components/common/ThemeToggle';
import ModelSettings from './components/common/ModelSettings';
import './App.css';

const App: React.FC = () => {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <Provider store={store}>
      <div className="min-h-screen bg-background-light dark:bg-background-dark transition-colors duration-200">
        <header className="bg-blue-600 dark:bg-blue-800 text-white p-4 shadow-md">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold">Cooperative Semantic Communication</h1>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <button 
                onClick={() => setShowSettings(!showSettings)}
                className="px-3 py-1 bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 rounded-md transition-colors"
              >
                Settings
              </button>
            </div>
          </div>
        </header>

        <main className="container mx-auto py-8 px-4">
          {showSettings ? (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <ModelSettings />
            </motion.div>
          ) : null}
          
          {/* Flow Diagram Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6"
          >
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md transition-colors">
              <h2 className="text-xl font-bold mb-4 dark:text-white">Transmission Flow</h2>
              <FlowDiagram />
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <div className="flex flex-col space-y-6">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md transition-colors">
                <h2 className="text-xl font-bold mb-4 dark:text-white">Transmitter</h2>
                <TextInput />
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md transition-colors">
                <h2 className="text-xl font-bold mb-4 dark:text-white">Channel</h2>
                <ChannelSimulation />
                <NoisyTextDisplay />
              </div>
            </div>
            
            <div className="flex flex-col space-y-6">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md transition-colors">
                <h2 className="text-xl font-bold mb-4 dark:text-white">Mode Selection</h2>
                <Relay />
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md transition-colors">
                <h2 className="text-xl font-bold mb-4 dark:text-white">Receiver</h2>
                <Receiver />
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md transition-colors"
          >
            <h2 className="text-xl font-bold mb-4 dark:text-white">About This Demo</h2>
            <p className="text-gray-700 dark:text-gray-300">
              This application demonstrates cooperative semantic communication with two transmission modes:
            </p>
            <ul className="list-disc ml-6 mt-2 text-gray-700 dark:text-gray-300">
              <li><strong>Direct Line-of-Sight (LOS):</strong> Semantic vector transmitted directly from source to destination</li>
              <li><strong>Relay-Assisted:</strong> When channel conditions are poor (similarity below threshold), a relay node combines two noisy copies</li>
            </ul>
            <p className="mt-4 text-gray-700 dark:text-gray-300">
              Try adjusting the noise variance to see how it affects transmission quality, and switch between transmission modes to observe the benefits of relay-assisted semantic combining.
            </p>
            <p className="mt-2 text-gray-700 dark:text-gray-300">
              <strong>Semantic Similarity:</strong> The application uses sentence-transformer technology to measure how semantically similar the received message is to the original, giving a more accurate assessment than traditional vector similarity.
            </p>
          </motion.div>
        </main>
        
        <footer className="bg-gray-800 dark:bg-gray-900 text-white p-4 mt-8 transition-colors">
          <div className="container mx-auto text-center">
            <p>Cooperative Semantic Communication Demonstration - &copy; {new Date().getFullYear()}</p>
          </div>
        </footer>
      </div>
    </Provider>
  );
};

export default App;
