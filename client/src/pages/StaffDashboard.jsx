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
import http from '../https';

const StaffDashboard = () => {
  const [customers, setCustomers] = useState([]);
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const [insight, setInsight] = useState('');
  const [generating, setGenerating] = useState(false);
  const [filters, setFilters] = useState({
  all: true,
  active: true,
  low: true,
  inactive: true
});
const [showFilter, setShowFilter] = useState(false); // 👈 ADD THIS
const [selectedUser, setSelectedUser] = useState(null);
const [inactivityModalOpen, setInactivityModalOpen] = useState(false);


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

  const handleFilterChange = (type) => {
  if (type === 'all') {
    const newValue = !filters.all;
    setFilters({
      all: newValue,
      active: newValue,
      low: newValue,
      inactive: newValue
    });
  } else {
    const updated = {
      ...filters,
      [type]: !filters[type],
      all: false // uncheck 'All' if any individual is changed
    };
    const allChecked = updated.active && updated.low && updated.inactive;
    setFilters({ ...updated, all: allChecked });
  }
};

const handleInfoClick = async (user) => {
  try {
    const res = await axios.post("http://localhost:3001/staff/inactivity-likelihood", {
      email: user.email,
      login_count: user.login_count,
      created_at: user.createdAt // if available
    }, {
      headers: { Authorization: `Bearer ${localStorage.getItem('staffAccessToken')}` }
    });

    const userWithLikelihood = {
  ...user,
  likelihood: res.data.likelihood
};
setSelectedUser(userWithLikelihood);
setInactivityModalOpen(true);
  } catch (err) {
    console.error("❌ Failed to fetch inactivity likelihood", err?.response?.data || err.message);
  }
};




  return (
    <Box display="flex" minHeight="100vh">
    {/* Sidebar remains unchanged */}
    <StaffSidebar />

    {/* Main Panel */}
    <Box flexGrow={1} p={4} bgcolor="#f2f4f7">
      <Box display="flex" justifyContent="space-between" alignItems="start" mb={2} position="relative">
  <Box>
    <Typography variant="h5" gutterBottom>Engagement status</Typography>
  </Box>
  <Box>
    <Button
      variant="contained"
      onClick={() => setShowFilter(prev => !prev)}
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

    {showFilter && (
      <Box sx={{
        mt: 1,
        position: 'absolute',
        right: 0,
        bgcolor: 'white',
        border: '1px solid #ccc',
        borderRadius: 2,
        p: 2,
        width: 200,
        boxShadow: 3,
        zIndex: 10
      }}>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Filter by</Typography>
        {['all', 'active', 'low', 'inactive'].map(type => (
          <Box key={type}>
            <label>
              <input
                type="checkbox"
                checked={filters[type]}
                onChange={() => handleFilterChange(type)}
              />{" "}
              {type === 'all' ? 'All' :
                type === 'active' ? 'Active' :
                  type === 'low' ? 'Low activity' : 'Inactive'}
            </label>
          </Box>
        ))}
        <Button variant="outlined" size="small" sx={{ mt: 1 }}>Apply filters</Button>
      </Box>
    )}
  </Box>
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
            {Array.isArray(customers) && customers
  .filter(c => {
    const count = c.login_count;
    if (count >= 5 && filters.active) return true;
    if (count >= 1 && count < 5 && filters.low) return true;
    if (count === 0 && filters.inactive) return true;
    return false;
  })
  .map((c, i) => {
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
              <IconButton size="small" onClick={() => handleInfoClick(c)}>
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
    {inactivityModalOpen && selectedUser && (
  <>
    {/* Background overlay */}
    <Box
      onClick={() => setInactivityModalOpen(false)} // optional: close when clicked outside
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        bgcolor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 1399
      }}
    />

    {/* Modal content */}
    <Box
      sx={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        bgcolor: 'white',
        borderRadius: 2,
        boxShadow: 24,
        p: 4,
        minWidth: 360,
        zIndex: 1400
      }}
    >
      <Stack spacing={2}>
        <Typography><strong>Name:</strong> {selectedUser.name}</Typography>
        <Typography><strong>Email:</strong> {selectedUser.email}</Typography>
        <Typography><strong>Inactivity Likelihood:</strong> {selectedUser.likelihood}%</Typography>

        {selectedUser.likelihood >= 70 && (
          <Button variant="contained" color="primary">
            Send re-engagement email
          </Button>
        )}

        <Stack direction="row" spacing={2} justifyContent="flex-end">
  <Button
    variant="outlined"
    onClick={() => setInactivityModalOpen(false)}
  >
    Close
  </Button>
  <Button
    variant="contained"
    onClick={() => {
      setInactivityModalOpen(false);
      navigate('/staff/customer-status', { state: { user: selectedUser } });
    }}
  >
    More info
  </Button>
</Stack>
      </Stack>
    </Box>
  </>
)}


  </Box>
);

};

export default StaffDashboard;
