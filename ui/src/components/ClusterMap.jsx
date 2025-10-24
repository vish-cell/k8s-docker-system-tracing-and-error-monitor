import React, { useEffect, useRef } from 'react';
import cytoscape from 'cytoscape';
import cola from 'cytoscape-cola';
import { Paper } from '@mui/material';

// Register the cola layout
cytoscape.use(cola);

const ClusterMap = ({ connections, darkMode }) => {
  const cyRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize cytoscape
    cyRef.current = cytoscape({
      container: containerRef.current,
      style: [
        {
          selector: 'node',
          style: {
            'background-color': darkMode ? '#4CAF50' : '#2196F3',
            'label': 'data(id)',
            'color': darkMode ? '#fff' : '#000',
            'text-opacity': 0.8,
            'font-size': '10px',
            'text-wrap': 'wrap',
            'text-max-width': '80px'
          }
        },
        {
          selector: 'edge',
          style: {
            'width': 2,
            'line-color': darkMode ? '#9E9E9E' : '#757575',
            'target-arrow-color': darkMode ? '#9E9E9E' : '#757575',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier'
          }
        },
        {
          selector: '.error',
          style: {
            'line-color': '#f44336',
            'target-arrow-color': '#f44336'
          }
        },
        {
          selector: '.slow',
          style: {
            'line-color': '#FFC107',
            'target-arrow-color': '#FFC107'
          }
        }
      ]
    });

    // Initial layout
    cyRef.current.layout({
      name: 'cola',
      infinite: true,
      fit: true,
      padding: 30
    }).run();

    return () => {
      if (cyRef.current) {
        cyRef.current.destroy();
      }
    };
  }, [darkMode]);

  // Update graph when connections change
  useEffect(() => {
    if (!cyRef.current) return;

    const cy = cyRef.current;
    const graph = { nodes: new Set(), edges: [] };

    // Process connections
    Object.entries(connections).forEach(([id, data]) => {
      const [source, target] = id.split('->');
      graph.nodes.add(source);
      graph.nodes.add(target);
      graph.edges.push({
        data: {
          id: `edge-${id}`,
          source,
          target,
          status: data.status
        }
      });
    });

    // Update nodes
    const nodes = Array.from(graph.nodes).map(id => ({
      data: { id }
    }));

    // Batch update the graph
    cy.batch(() => {
      cy.elements().remove();
      cy.add([...nodes, ...graph.edges]);
      
      // Apply styles based on status
      cy.edges().forEach(edge => {
        const status = edge.data('status');
        edge.removeClass('error slow');
        if (status === 'error') edge.addClass('error');
        if (status === 'slow') edge.addClass('slow');
      });
    });

    // Apply layout if there are changes
    cy.layout({
      name: 'cola',
      infinite: false,
      fit: true,
      padding: 30,
      animate: true,
      randomize: false,
      maxSimulationTime: 1000
    }).run();
  }, [connections]);

  return (
    <Paper 
      ref={containerRef} 
      elevation={3} 
      sx={{ 
        height: '600px',
        bgcolor: darkMode ? '#1a1a1a' : '#fff'
      }} 
    />
  );
};

export default ClusterMap;