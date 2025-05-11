import React from 'react';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/types';
import { TransmissionMode } from '../../store/types';

interface NodeProps {
  label: string;
  x: number;
  y: number;
  active?: boolean;
}

const Node: React.FC<NodeProps> = ({ label, x, y, active = false }) => {
  return (
    <div 
      className={`absolute rounded-full p-3 flex items-center justify-center shadow-md transition-colors ${
        active ? 'bg-blue-600 dark:bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
      }`}
      style={{ 
        left: `${x}%`, 
        top: `${y}%`, 
        transform: 'translate(-50%, -50%)',
        width: '60px',
        height: '60px'
      }}
    >
      <span className="text-xs font-medium">{label}</span>
    </div>
  );
};
interface Point {
  x: number; // in percentage
  y: number; // in percentage
}

interface LineProps {
  from: Point;
  to: Point;
}
const nodeRadius = 32; // since w-16 = 64px



interface LineProps {
  from: { x: number; y: number };
  to: { x: number; y: number };
}

const Line: React.FC<LineProps> = ({ from, to }) => {
  return (
    <svg className="absolute inset-0 w-full h-full z-0 pointer-events-none">
      <line
        x1={`${from.x}%`}
        y1={`${from.y}%`}
        x2={`${to.x}%`}
        y2={`${to.y}%`}
        stroke="gray"
        strokeWidth="2"
      />
    </svg>
  );
};








interface PacketProps {
  from: { x: number; y: number };
  to: { x: number; y: number };
  color: string;
  isVisible: boolean;
  delay?: number;
}

const Packet: React.FC<PacketProps> = ({ from, to, color, isVisible, delay = 0 }) => {
  return (
    <motion.div
      initial={{ 
        opacity: 0,
        x: `${from.x}%`, 
        y: `${from.y}%` 
      }}
      animate={{ 
        opacity: isVisible ? 1 : 0,
        x: isVisible ? `${to.x}%` : `${from.x}%`,
        y: isVisible ? `${to.y}%` : `${from.y}%`
      }}
      transition={{ 
        duration: 1.5,
        delay,
        repeat: isVisible ? Infinity : 0,
        repeatDelay: 1
      }}
      className="absolute w-3 h-3 rounded-full z-10"
      style={{ 
        backgroundColor: color,
        boxShadow: `0 0 8px ${color}`
      }}
    />
  );
};

const FlowDiagram: React.FC = () => {
  const { 
    transmissionMode, 
    originalVector, 
    noisyLOSVector,
    semanticSimilarity,
    similarityThreshold
  } = useSelector((state: RootState) => state.semantic);
  const transmitterPos = { x: 20, y: 70 }; // TX bottom-left
  const receiverPos = { x: 80, y: 70 };    // RX bottom-right
  const relayPos = { x: 50, y: 30 };       // RELAY top-center
  

  

  // Determine if relay is active
  const isRelayActive = transmissionMode === TransmissionMode.RELAY && 
    semanticSimilarity !== null && 
    semanticSimilarity < similarityThreshold;

  // Animation is visible when we have vectors
  const isTransmissionVisible = Boolean(originalVector);

  return (
    <div className="relative w-full h-48 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-colors">
      {/* Direct path line (TX to RX) */}
      <Line from={transmitterPos} to={receiverPos} />

      {/* Relay path lines */}
      {transmissionMode === TransmissionMode.RELAY && (
        <>
          <Line from={transmitterPos} to={relayPos} />
          <Line from={relayPos} to={receiverPos} />
        </>
      )}

      {/* Nodes */}
      <Node label="TX" x={transmitterPos.x} y={transmitterPos.y} active={isTransmissionVisible} />
      {transmissionMode === TransmissionMode.RELAY && (
        <Node label="RELAY" x={relayPos.x} y={relayPos.y} active={isRelayActive} />
      )}
      <Node label="RX" x={receiverPos.x} y={receiverPos.y} active={noisyLOSVector !== null} />

      {/* Packets for direct path */}
      <Packet 
        from={transmitterPos}
        to={receiverPos}
        color="#3B82F6"
        isVisible={isTransmissionVisible && !isRelayActive}
      />

      {/* Packets for relay path */}
      {isRelayActive && (
        <>
          <Packet 
            from={transmitterPos}
            to={relayPos}
            color="#F59E0B"
            isVisible={isTransmissionVisible}
          />
          <Packet 
            from={relayPos}
            to={receiverPos}
            color="#10B981"
            isVisible={isTransmissionVisible}
            delay={0.75}
          />
        </>
      )}
    </div>
  );
};

export default FlowDiagram;
