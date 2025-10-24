import React, { useState, useEffect } from 'react';
import './App.css';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { io } from 'socket.io-client';

// Import components
import ClusterMap from './components/ClusterMap';
import LogStream from './components/LogStream';
import MetricsPanel from './components/MetricsPanel';

// Always connect through the nginx proxy
// We use an empty string as the URL so Socket.IO will connect to the same host/port as the page
const MODEL_SERVICE_URL = '';

function App() {
  // State
  const [darkMode, setDarkMode] = useState(false);
  const [connections, setConnections] = useState({});
  const [logs, setLogs] = useState([]);

  // Theme
  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light'
    }
  });

  // WebSocket connection
  useEffect(() => {
    let socket;
    try {
      socket = io(MODEL_SERVICE_URL, {
        path: '/socket.io',
        transports: ['websocket'],
        upgrade: false,
        forceNew: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
      });
      
      socket.on('error', (error) => {
        console.error('Socket.IO error:', error);
      });
      
      socket.on('connect_error', (error) => {
        console.error('Socket.IO connection error:', error);
        // Try to reconnect with a different transport
        socket.io.opts.transports = ['polling', 'websocket'];
      });

      socket.on('disconnect', (reason) => {
        console.log('Socket.IO disconnected:', reason);
        if (reason === 'io server disconnect') {
          // Try to reconnect if the server disconnected us
          socket.connect();
        }
      });
    } catch (err) {
      console.error('Socket.IO init error:', err);
      socket = null;
    }

    if (socket) {
      socket.on('connect', function() {
        console.log('Connected to model service');
      });

      socket.on('connection_update', function(data) {
        setConnections(prev => ({
          ...prev,
          [data.id]: data.metrics
        }));
      });

      socket.on('log_entry', function(log) {
        setLogs(prev => [...prev.slice(-999), log]);
      });
    }

    fetch(MODEL_SERVICE_URL + '/metrics')
      .then(function(res) { return res.json(); })
      .then(function(data) { setConnections(data); })
      .catch(function(err) { console.error('Error fetching metrics:', err); });

    return function cleanup() {
      if (socket) socket.disconnect();
    };
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              TARP Log Connector
            </Typography>
            <IconButton 
              color="inherit" 
              onClick={() => setDarkMode(!darkMode)}
            >
              {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Toolbar>
        </AppBar>

        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <ClusterMap connections={connections} darkMode={darkMode} />
            </Grid>
            <Grid item xs={12} md={8}>
              <LogStream logs={logs} darkMode={darkMode} />
            </Grid>
            <Grid item xs={12} md={4}>
              <MetricsPanel connections={connections} darkMode={darkMode} />
            </Grid>
          </Grid>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
