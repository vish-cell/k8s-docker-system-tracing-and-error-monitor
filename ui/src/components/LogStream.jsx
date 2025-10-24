import React, { useState, useEffect, useRef } from 'react';
import { 
  Paper, 
  List, 
  ListItem, 
  ListItemText, 
  Typography, 
  Chip,
  TextField,
  Box
} from '@mui/material';
import moment from 'moment';

const LogStream = ({ logs, darkMode }) => {
  const [filter, setFilter] = useState('');
  const bottomRef = useRef(null);

  // Auto-scroll to bottom on new logs
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  const filteredLogs = logs.filter(log => 
    filter === '' || 
    log.message.toLowerCase().includes(filter.toLowerCase()) ||
    log.pod.toLowerCase().includes(filter.toLowerCase()) ||
    log.namespace.toLowerCase().includes(filter.toLowerCase())
  );

  const getLogLevelColor = (level) => {
    switch (level) {
      case 'ERROR':
        return '#f44336';
      case 'WARN':
        return '#FFC107';
      case 'INFO':
        return '#4CAF50';
      default:
        return '#757575';
    }
  };

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        height: '600px', 
        display: 'flex', 
        flexDirection: 'column',
        bgcolor: darkMode ? '#1a1a1a' : '#fff'
      }}
    >
      <Box p={2}>
        <TextField
          fullWidth
          variant="outlined"
          size="small"
          placeholder="Filter logs..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          sx={{
            '& .MuiOutlinedInput-root': {
              color: darkMode ? '#fff' : '#000',
              '& fieldset': {
                borderColor: darkMode ? 'rgba(255,255,255,0.23)' : 'rgba(0,0,0,0.23)'
              }
            }
          }}
        />
      </Box>

      <List 
        sx={{ 
          flex: 1, 
          overflow: 'auto',
          '& .MuiListItem-root': {
            borderBottom: '1px solid',
            borderColor: darkMode ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)'
          }
        }}
      >
        {filteredLogs.map((log, index) => (
          <ListItem key={index}>
            <ListItemText
              primary={
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography 
                    variant="body2" 
                    sx={{ color: darkMode ? '#fff' : '#000' }}
                  >
                    {moment(log.timestamp).format('HH:mm:ss')}
                  </Typography>
                  <Chip
                    label={log.level}
                    size="small"
                    sx={{
                      backgroundColor: getLogLevelColor(log.level),
                      color: '#fff'
                    }}
                  />
                  <Typography 
                    variant="body2" 
                    sx={{ color: darkMode ? '#fff' : '#000' }}
                  >
                    {`${log.namespace}/${log.pod}`}
                  </Typography>
                </Box>
              }
              secondary={
                <Typography 
                  variant="body2" 
                  sx={{ 
                    mt: 0.5,
                    color: darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)'
                  }}
                >
                  {log.message}
                </Typography>
              }
            />
          </ListItem>
        ))}
        <div ref={bottomRef} />
      </List>
    </Paper>
  );
};

export default LogStream;