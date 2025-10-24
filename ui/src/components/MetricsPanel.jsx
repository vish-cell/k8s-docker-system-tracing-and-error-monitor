import React from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
  Chip
} from '@mui/material';
import moment from 'moment';

const MetricsPanel = ({ connections, darkMode }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return '#4CAF50';
      case 'slow':
        return '#FFC107';
      case 'error':
        return '#f44336';
      default:
        return '#757575';
    }
  };

  const calculateAverageLatency = (latencies) => {
    if (!latencies || latencies.length === 0) return 0;
    return Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length);
  };

  return (
    <Paper 
      elevation={3}
      sx={{ 
        bgcolor: darkMode ? '#1a1a1a' : '#fff',
        '& .MuiTableCell-root': {
          color: darkMode ? '#fff' : 'inherit'
        }
      }}
    >
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Connection</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Avg. Latency</TableCell>
              <TableCell align="right">Requests</TableCell>
              <TableCell align="right">Errors</TableCell>
              <TableCell>Last Seen</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.entries(connections).map(([id, data]) => (
              <TableRow key={id}>
                <TableCell>
                  <Typography variant="body2">{id}</Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={data.status}
                    size="small"
                    sx={{
                      bgcolor: getStatusColor(data.status),
                      color: '#fff'
                    }}
                  />
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2">
                    {calculateAverageLatency(data.latency)}ms
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2">
                    {data.request_count}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2">
                    {data.error_count}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {moment(data.last_seen).fromNow()}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default MetricsPanel;