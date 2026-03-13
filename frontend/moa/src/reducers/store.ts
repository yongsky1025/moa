import { configureStore } from "@reduxjs/toolkit";

// store : 애플리케이션 내에 공유되는 상태 데이터
export const store = configureStore({
  reducer: {},
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
