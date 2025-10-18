import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');
  const userType = localStorage.getItem('userType'); // "farmer" or "warehouse"

  const handleLogout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('userType');
    // Clear any other session data if applicable here
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-success px-4">
      <Link className="navbar-brand fw-bold text-white" to="/">Food Spoilage Predictor</Link>
      <div className="collapse navbar-collapse">
        <ul className="navbar-nav ms-auto">
          <li className="nav-item">
            <Link className="nav-link text-white" to="/about">About</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link text-white" to="/services">Services</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link text-white" to="/contact">Contact</Link>
          </li>

          {userId ? (
            <>
              <li className="nav-item">
                <Link
                  className="nav-link text-white"
                  to={userType === 'farmer' ? '/farmer/dashboard' : '/warehouse/dashboard'}
                >
                  Dashboard
                </Link>
              </li>
              <li className="nav-item">
                <button className="btn btn-outline-light ms-2" onClick={handleLogout}>
                  Logout
                </button>
              </li>
            </>
          ) : (
            <li className="nav-item">
              <Link className="nav-link text-white" to="/login">Logout</Link>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
