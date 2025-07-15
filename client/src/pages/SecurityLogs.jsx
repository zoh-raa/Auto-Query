// pages/SecurityLogs.jsx
import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Tooltip, Stack, Button
} from '@mui/material';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import { useNavigate } from 'react-router-dom';
import UserContext from '../contexts/UserContext';
import StaffSidebar from '../components/StaffSidebar'; // add this at the top

const SecurityLogs = () => {
  const [securityLogs, setSecurityLogs] = useState([]);
  const navigate = useNavigate();
  const { user } = useContext(UserContext);

  useEffect(() => {
    axios.get('http://localhost:3001/staff/security-logs', {
      headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
    })
      .then(res => setSecurityLogs(res.data))
      .catch(err => {
        console.error("❌ Failed to fetch security logs:", err?.response?.data || err.message);
        navigate('/login');
      });
  }, []);

  return (
    <Box display="flex" minHeight="100vh">
      {/* Sidebar */}
      <StaffSidebar /> 

      {/* Main Content */}
      <Box flexGrow={1} p={4} bgcolor="#f2f4f7">
        <Typography variant="h5" gutterBottom>Login Attempts</Typography>
        <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
          <Table>
            <TableHead sx={{ bgcolor: '#f9f9f9' }}>
              <TableRow>
                <TableCell>Email</TableCell>
                <TableCell>IP Address</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Device</TableCell>
                <TableCell>Anomaly Score</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {securityLogs.map((log, i) => {
                const isHigh = log.anomaly_score === 'High';
                return (
                  <TableRow key={i} sx={{ backgroundColor: isHigh ? '#fddede' : 'transparent' }}>
                    <TableCell>{log.email}</TableCell>
                    <TableCell>{log.ip}</TableCell>
                    <TableCell>{log.location}</TableCell>
                    <TableCell>{log.device}</TableCell>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography variant="body2">{log.anomaly_score}</Typography>
                        {isHigh && (
                          <Tooltip title="High anomaly detected">
                            <WarningAmberOutlinedIcon color="error" />
                          </Tooltip>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
};

export default SecurityLogs;
