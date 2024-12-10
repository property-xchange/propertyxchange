import React, { useContext } from 'react';
import Sidebar from './Sidebar';
import { RiMenuUnfoldLine } from 'react-icons/ri';
import { RiMenuFoldLine } from 'react-icons/ri';
import { useSelector, useDispatch } from 'react-redux';
import { toggleSidebar } from '../../redux/features/toggleSlice';
import { AuthContext } from '../../context/AuthContext.jsx';
import toast, { Toaster } from 'react-hot-toast';

const Dashboard = ({ children }) => {
  const dispatch = useDispatch();

  const { currentUser } = useContext(AuthContext);
  const isSidebarFolded = useSelector((state) => state.sidebar.isSidebarFolded);

  const handleToggleSidebar = () => {
    dispatch(toggleSidebar());
  };

  return (
    <div className="flex relative mt-10 border border-1">
      <Toaster position="top-center" reverseOrder={false}></Toaster>
      <div className="">
        <Sidebar isFolded={isSidebarFolded} />
      </div>
      <div className="p-3 w-[100%] overflow-y-auto">
        <div
          className="absolute text-2xl text-white bg-slate-600 p-2 cursor-pointer rounded-sm"
          onClick={handleToggleSidebar}
        >
          {isSidebarFolded ? <RiMenuUnfoldLine /> : <RiMenuFoldLine />}
        </div>
        <div className="flex-grow p-8 h-screen overflow-y-auto hide-scrollbar overflow-x-auto w-[400px] sm:w-full">
          <h1 className="font-bold text-center text-2xl">
            Welcome back {currentUser.firstName || currentUser.username}!
          </h1>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
