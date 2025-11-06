import React, { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import HomeIcon from '@mui/icons-material/Home';
import WarehouseIcon from '@mui/icons-material/Store';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import ScienceIcon from '@mui/icons-material/Science';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AuthContext from '../context/AuthContext';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useContext(AuthContext);
  const userType = user?.userType;

  const isLogin = location.pathname === "/login";
  const isWarehouseRegister = location.pathname === "/register/warehouse";
  const isFarmerRegister = location.pathname === "/register/farmer";
  const isRegister = isWarehouseRegister || isFarmerRegister;

  const showInfoLinks = !user || (userType !== 'warehouse' && userType !== 'farmer');

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
    window.location.reload();
  };

  return (
    <AppBar position="static" sx={{ background: 'linear-gradient(90deg, #43cea2, #185a9d)' }}>
      <Toolbar>
        <Typography
          variant="h6"
          component={Link}
          to="/"
          sx={{
            flexGrow: 1,
            color: 'white',
            textDecoration: 'none',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <HomeIcon sx={{ mr: 1 }} />
          Food Spoilage Predictor
        </Typography>
        <Stack direction="row" spacing={2}>
          {/* Info pages for everyone */}
          {showInfoLinks && (
            <>
              <Button color="inherit" component={Link} to="/about">About</Button>
              <Button color="inherit" component={Link} to="/services">Services</Button>
              <Button color="inherit" component={Link} to="/contact">Contact</Button>
              {/* Registration buttons always shown on nav for landing/unauthed */}
              {!user && (
                <>
                  <Button color="inherit" component={Link} to="/register/farmer">
                    Farmer Register
                  </Button>
                  <Button color="inherit" component={Link} to="/register/warehouse">
                    Warehouse Register
                  </Button>
                </>
              )}
              {/* Show only a single login button on registration pages */}
              {!user && isRegister && (
                <Button color="inherit" component={Link} to="/login">
                  Login
                </Button>
              )}
              {/* Show login if on login or non-dashboard page (but not on reg page) */}
              {!user && !isRegister && isLogin && (
                <Button color="inherit" component={Link} to="/login">
                  Login
                </Button>
              )}
            </>
          )}

          {user ? (
            <>
              {/* Warehouse dashboard & features */}
              {userType === 'warehouse' && (
                <>
                  <Button color="inherit" startIcon={<WarehouseIcon />} component={Link} to="/warehouse/dashboard">
                    Warehouse Dashboard
                  </Button>
                  <Button color="inherit" startIcon={<ScienceIcon />} component={Link} to="/predict">
                    Spoilage Predictor
                  </Button>
                  <Button color="inherit" startIcon={<Inventory2Icon />} component={Link} to="/warehouse/inventory">
                    Inventory Management
                  </Button>
                  <Button color="inherit" startIcon={<LocalShippingIcon />} component={Link} to="/warehouse/ImportExportDashboard">
                    Import & Export
                  </Button>
                </>
              )}
              {/* Farmer dashboard */}
              {userType === 'farmer' && (
                <Button color="inherit" startIcon={<AgricultureIcon />} component={Link} to="/farmer/dashboard">
                  Farmer Dashboard
                </Button>
              )}
              <Button color="inherit" variant="outlined" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : null}
        </Stack>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
