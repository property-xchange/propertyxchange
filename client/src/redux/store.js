import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { sidebarReducer } from './features/toggleSlice.js';
import dataReducer from './features/dataSlice';
import uiReducer from './features/uiSlice';
import userReducer from './features/userSlice.js';

const rootReducer = combineReducers({
  sidebar: sidebarReducer,
  ui: uiReducer,
  data: dataReducer,
  userRedux: userReducer,
});

const persistConfig = {
  key: 'root',
  storage,
  version: 1,
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);
