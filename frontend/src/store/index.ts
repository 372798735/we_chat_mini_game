import { configureStore } from '@reduxjs/toolkit'
import appReducer from './slices/appSlice'
import taskReducer from './slices/taskSlice'
import pomodoroReducer from './slices/pomodoroSlice'
import statisticsReducer from './slices/statisticsSlice'
import authReducer from './slices/authSlice'

export const store = configureStore({
  reducer: {
    app: appReducer,
    tasks: taskReducer,
    pomodoro: pomodoroReducer,
    statistics: statisticsReducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch