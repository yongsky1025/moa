import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";

// store : 애플리케이션 내에 공유되는 상태 데이터
export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
