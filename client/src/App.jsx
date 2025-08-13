import { useEffect, useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { Outlet, useLocation } from 'react-router-dom';
import BackToTopButton from './components/common/BackToTopButton';
import Footer from './components/common/Footer';
import Navbar from './components/common/Navbar';
import { closeDropdown } from './redux/features/uiSlice';
import Dropdown from './components/common/DropDown';
import NewsLetter from './components/common/NewsLetter';
import Loader from './components/common/Loader';
import { useAuthStore } from './zustand/store';
import { Toaster } from 'react-hot-toast';

function App() {
  const [showButton, setShowButton] = useState(false);
  const [showLoader, setShowLoader] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  const dispatch = useDispatch();
  const location = useLocation();
  const { checkAuth, isCheckingAuth } = useAuthStore();

  // Memoized scroll handler to prevent recreation on every render
  const handleScroll = useCallback(() => {
    setShowButton(window.scrollY > 500);
  }, []);

  // Memoized dropdown close handler
  const handleCloseDropdown = useCallback(() => {
    dispatch(closeDropdown());
  }, [dispatch]);

  // Handle scroll to top button visibility
  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Initialize authentication ONCE when app loads
  useEffect(() => {
    const initAuth = async () => {
      try {
        setShowLoader(true);

        // Check if user has a valid token
        const token = localStorage.getItem('token');
        if (token) {
          await checkAuth();
        }
      } catch (error) {
        console.log('Auth check failed on startup:', error);
        // Clear any stale data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setShowLoader(false);
        setIsInitialized(true);
      }
    };

    initAuth();
  }, []); // Empty dependency array - only run once

  // Handle window load event
  useEffect(() => {
    const handleLoad = () => {
      setShowLoader(false);
    };

    // Check if window is already loaded
    if (document.readyState === 'complete') {
      setShowLoader(false);
    } else {
      window.addEventListener('load', handleLoad);
    }

    return () => window.removeEventListener('load', handleLoad);
  }, []);

  // Show loader while checking auth or while app is initializing
  const shouldShowLoader = showLoader || isCheckingAuth || !isInitialized;

  return (
    <div>
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />

      {/* Only render main content after initialization */}
      {isInitialized && (
        <>
          <Navbar />
          <Dropdown />
          <div
            className="min-h-screen pb-40"
            onClick={handleCloseDropdown}
            onMouseOver={handleCloseDropdown}
          >
            <Outlet />
          </div>
          <div className="px-[2%] md:px-[6%] bg-card-dark border border-card-dark">
            <NewsLetter />
            <div className="mt-20">
              <Footer />
            </div>
          </div>
          <BackToTopButton showButton={showButton} />
        </>
      )}
    </div>
  );
}

export default App;
