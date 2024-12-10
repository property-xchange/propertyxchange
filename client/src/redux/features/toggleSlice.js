// reducers.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isSidebarFolded: false,
};

export const sidebarSlice = createSlice({
  name: 'sidebar',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.isSidebarFolded = !state.isSidebarFolded;
    },
  },
});

export const { toggleSidebar } = sidebarSlice.actions;
export const sidebarReducer = sidebarSlice.reducer;
