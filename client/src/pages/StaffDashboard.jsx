import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  IconButton,
  Divider,
  Stack
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import SecurityIcon from '@mui/icons-material/Security';
import InventoryIcon from '@mui/icons-material/Inventory';
import ListAltIcon from '@mui/icons-material/ListAlt';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { useContext } from 'react';
import UserContext from '../contexts/UserContext'; // ✅ import if not already
import StaffSidebar from '../components/StaffSidebar'; // add this at the top


const StaffDashboard = () => {
  const [customers, setCustomers] = useState([]);
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const [insight, setInsight] = useState('');
  const [generating, setGenerating] = useState(false);

useEffect(() => {
  axios.get('http://localhost:3001/staff/customers', {
    headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
  })
    .then(res => {
      console.log("✅ Customers fetched:", res.data); // Add this
      setCustomers(res.data);
    })
    .catch((err) => {
      console.error("❌ Failed to fetch customers:", err?.response?.data || err.message);
      navigate('/login');
    });
}, []);

  const [securityLogs, setSecurityLogs] = useState([]);

  useEffect(() => {
  axios.get('http://localhost:3001/staff/security-logs', {
    headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
  })
    .then(res => {
      setSecurityLogs(res.data);
    })
    .catch(err => {
      console.error("❌ Failed to fetch security logs:", err?.response?.data || err.message);
    });
}, []);

  const handleGenerateInsight = async () => {
  setGenerating(true);
  try {
    const res = await axios.post('http://localhost:3001/staff/generate-insight', { customers }, {
      headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
    });
    setInsight(res.data.insight);
  } catch (err) {
    console.error("❌ AI insight error:", err?.response?.data || err.message);
    setInsight("Failed to generate insight.");
  } finally {
    setGenerating(false);
  }


};

  const getStatus = count => {
    if (count >= 5) return { label: 'Active', icon: <CheckCircleOutlineIcon color="success" /> };
    if (count >= 1) return { label: 'Low activity', icon: <WarningAmberOutlinedIcon color="warning" /> };
    return { label: 'Inactive', icon: <CancelOutlinedIcon color="error" /> };
  };

  return (
    <Box display="flex" minHeight="100vh">
    {/* Sidebar remains unchanged */}
    <StaffSidebar />

    {/* Main Panel */}
    <Box flexGrow={1} p={4} bgcolor="#f2f4f7">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Engagement status</Typography>
        <Button
          variant="contained"
          sx={{
            backgroundColor: '#e0e0e0',
            borderRadius: '20px',
            color: 'black',
            fontWeight: 500,
            textTransform: 'none',
            '&:hover': {
              backgroundColor: '#d5d5d5'
            }
          }}
        >
          Filter
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
        <Table>
          <TableHead sx={{ bgcolor: '#f9f9f9' }}>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>User (email)</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.isArray(customers) && customers.map((c, i) => {
              const status = getStatus(c.login_count);
              return (
                <TableRow key={c.id}>
                  <TableCell>{i + 1}</TableCell>
                  <TableCell>{c.email}</TableCell>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      {status.icon}
                      <Typography variant="body2">{status.label}</Typography>
                      <Tooltip title="Login activity based engagement">
                        <IconButton size="small">
                          <InfoOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <Box mt={4}>
  <Typography variant="h6" gutterBottom>AI Insight</Typography>
  <Button
    variant="outlined"
    onClick={handleGenerateInsight}
    disabled={generating}
    sx={{ mb: 2 }}
  >
    {generating ? "Generating..." : "Generate Insight"}
  </Button>
  <Paper
    variant="outlined"
    sx={{ p: 2, whiteSpace: 'pre-wrap', backgroundColor: '#fafafa', minHeight: 120 }}
  >
    {insight || "Click 'Generate Insight' to analyse engagement data."}
  </Paper>
</Box>


    </Box>
  </Box>
);

};

export default StaffDashboard;
