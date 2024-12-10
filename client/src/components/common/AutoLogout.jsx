import React, { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../helper/helper';
import { AuthContext } from '../../context/AuthContext';

const AutoLogout = () => {
  const [inactiveTime, setInactiveTime] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    // Activity events that will reset the inactive timer
    const events = ['click', 'mousemove', 'keydown', 'scroll', 'touchstart'];

    // Resets the inactivity time on any user activity
    const resetInactiveTime = () => {
      setInactiveTime(0);
    };

    // Adds event listeners for the activity events
    events.forEach((event) => {
      window.addEventListener(event, resetInactiveTime);
    });

    const handleLogout = async () => {
      try {
        await logout(); // Trigger logout API request
        localStorage.clear(); // Clear local storage
        resetAuth(); // Clear Zustand auth state
        navigate('/sign-in'); // Redirect to sign-in page
      } catch (error) {
        console.error('Failed to logout:', error);
      }
    };

    // Timer to track inactivity
    const interval = setInterval(() => {
      setInactiveTime((prev) => prev + 1);

      // If inactive time exceeds 20 minutes (20 * 60 seconds)
      if (inactiveTime >= 20 * 60) {
        handleLogout(); // Logout user
      }
    }, 1000); // Runs every second to track inactivity

    // Cleanup function
    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, resetInactiveTime);
      });
      clearInterval(interval);
    };
  }, [inactiveTime, navigate, resetAuth]);

  return null;
};

export default AutoLogout;
