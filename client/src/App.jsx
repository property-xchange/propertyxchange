import { useEffect, useState } from 'react';
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
  const [showLoader, setShowLoader] = useState(false);
  const dispatch = useDispatch();
  const route = useLocation();
  const { checkAuth } = useAuthStore();

  // Show/Hide scroll to top button
  useEffect(() => {
    const handleScroll = () => {
      window.scrollY > 500 ? setShowButton(true) : setShowButton(false);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleCloseDropdown = (e) => {
    dispatch(closeDropdown());
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [route]);

  useEffect(() => {
    window.addEventListener('load', () => {
      setShowLoader(false);
    });
    return () => window.removeEventListener('load', () => setShowLoader(false));
  }, []);

  return (
    <div>
      <Toaster position="top-center" reverseOrder={false}></Toaster>
      {showLoader && <Loader />}
      <Navbar />
      <Dropdown />
      <div
        className="min-h-screen pb-40"
        onClick={handleCloseDropdown}
        onMouseOver={() => dispatch(closeDropdown())}
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
    </div>
  );
}

export default App;
