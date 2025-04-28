import React, { useState, useRef, useEffect } from 'react';

interface ZoomableImageModalProps {
  imageUrl: string;
  altText: string;
  onClose: () => void;
}

const ZoomableImageModal: React.FC<ZoomableImageModalProps> = ({ imageUrl, altText, onClose }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Handle escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Reset zoom and position when image changes
  useEffect(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, [imageUrl]);

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 5)); // Max zoom 5x
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.5)); // Min zoom 0.5x
  };

  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (dragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    // Zoom in/out with mouse wheel
    if (e.deltaY < 0) {
      setScale(prev => Math.min(prev + 0.1, 5));
    } else {
      setScale(prev => Math.max(prev - 0.1, 0.5));
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-[90vw] max-h-[90vh] flex flex-col"
        style={{ width: '80vw', height: '80vh' }}
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold dark:text-white">AWGN Simulation Plot</h2>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">Zoom: {Math.round(scale * 100)}%</span>
            <button
              onClick={handleZoomOut}
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="Zoom out"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="dark:text-white">
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </button>
            <button
              onClick={handleReset}
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="Reset zoom"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="dark:text-white">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="16"></line>
                <line x1="8" y1="12" x2="16" y2="12"></line>
              </svg>
            </button>
            <button
              onClick={handleZoomIn}
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="Zoom in"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="dark:text-white">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="dark:text-white">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
        
        <div 
          ref={containerRef}
          className="flex-1 overflow-hidden relative bg-gray-100 dark:bg-gray-900"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        >
          <div 
            className="absolute flex items-center justify-center w-full h-full"
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
              transition: dragging ? 'none' : 'transform 0.1s ease-out',
              cursor: dragging ? 'grabbing' : 'grab'
            }}
          >
            <img
              src={imageUrl}
              alt={altText}
              className="object-contain"
              draggable={false}
            />
          </div>
          <div className="absolute bottom-4 left-4 text-sm bg-white dark:bg-gray-800 p-2 rounded-md opacity-70 dark:text-white">
            <p>Tip: Use mouse wheel to zoom in/out</p>
            <p>Click and drag to pan the image</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ZoomableImageModal;