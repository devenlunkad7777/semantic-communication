import { configureStore } from '@reduxjs/toolkit';
import semanticReducer from './semanticSlice';

export const store = configureStore({
  reducer: {
    semantic: semanticReducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;