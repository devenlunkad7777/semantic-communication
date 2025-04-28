import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { SemanticVector } from '../../utils/semanticEmbedding';

interface VectorVisualizationProps {
  vector: SemanticVector | null;
  label: string;
  color: string;
  width?: number;
  height?: number;
}

const VectorVisualization: React.FC<VectorVisualizationProps> = ({ 
  vector, 
  label,
  color, 
  width = 200, 
  height = 50 
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!vector || !svgRef.current) return;

    // Clear previous visualization
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    
    // For visualization purposes, we'll take a subset of the vector
    // In a real app, you might want to use dimensionality reduction techniques like t-SNE or PCA
    const displayVector = vector.slice(0, 50);
    
    // Normalize to [0, 1] for visualization
    const maxVal = Math.max(...displayVector.map(Math.abs));
    const normalizedVector = displayVector.map(val => val / maxVal);
    
    // Scale domains
    const xScale = d3.scaleBand()
      .domain(normalizedVector.map((_, i) => i.toString()))
      .range([0, width])
      .padding(0.1);
      
    const yScale = d3.scaleLinear()
      .domain([-1, 1])
      .range([height, 0]);
      
    // Draw bars
    svg.selectAll('.bar')
      .data(normalizedVector)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', (_: number, i: number) => xScale(i.toString()) || 0)
      .attr('width', xScale.bandwidth())
      .attr('y', (d: number) => d >= 0 ? yScale(d) : yScale(0))
      .attr('height', (d: number) => Math.abs(yScale(0) - yScale(d)))
      .attr('fill', color)
      .attr('opacity', 0.8);
      
    // Add label
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', height + 20)
      .attr('text-anchor', 'middle')
      .attr('class', 'text-xs text-gray-600 dark:text-gray-400')
      .text(label);
      
  }, [vector, color, width, height, label]);
  
  if (!vector) {
    return (
      <div className="flex flex-col items-center">
        <div className="w-full h-12 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center text-gray-400 dark:text-gray-500 transition-colors">
          No vector data
        </div>
        <span className="text-xs text-gray-600 dark:text-gray-400 mt-2 transition-colors">{label}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <svg
        ref={svgRef}
        width={width}
        height={height + 25}
        className="overflow-visible"
      />
    </div>
  );
};

export default VectorVisualization;