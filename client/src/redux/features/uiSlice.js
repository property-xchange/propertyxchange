import { createSlice } from '@reduxjs/toolkit';
import { navLinks } from '../../data/navLinks.js';

const mode = JSON.parse(localStorage.getItem('Martvilla-theme-mode')) || false;

const initialState = {
  isDropdownOpen: false,
  position: null,
  currentLink: {},
  isSidebarOpen: false,
  isFilterMenuOpen: false,
  isAgentInfoOpen: false,
  darkMode: mode,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    openDropdown: (state, action) => {
      const mainLink = action.payload.link;
      state.currentLink = navLinks.find((link) => link.linkText === mainLink);
      state.isDropdownOpen = true;
      state.position = action.payload.center;
    },
    closeDropdown: (state) => {
      state.isDropdownOpen = false;
    },
    toggleDropdown: (state) => {
      state.isDropdownOpen = !state.isDropdownOpen;
    },

    openSidebar: (state) => {
      state.isSidebarOpen = true;
    },
    closeSidebar: (state) => {
      state.isSidebarOpen = false;
    },
    toggleSidebar: (state) => {
      state.isSidebarOpen = !state.isSidebarOpen;
    },
    openFilterMenu: (state) => {
      state.isFilterMenuOpen = true;
    },
    closeFilterMenu: (state) => {
      state.isFilterMenuOpen = false;
    },
    openAgentInfo: (state) => {
      state.isAgentInfoOpen = true;
    },
    closeAgentInfo: (state) => {
      state.isAgentInfoOpen = false;
    },
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
    },
  },
});

export default uiSlice.reducer;

export const uiStore = (state) => state.ui;

export const {
  openDropdown,
  closeDropdown,
  toggleDropdown,
  openSidebar,
  closeSidebar,
  toggleSidebar,
  openFilterMenu,
  closeFilterMenu,
  toggleDarkMode,
  openAgentInfo,
  closeAgentInfo,
} = uiSlice.actions;
