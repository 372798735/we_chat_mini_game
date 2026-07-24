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
        /*
         忽略 persist/PERSIST action 的序列化检查
         通常与 redux-persist 配合使用，该库需要持久化部分非序列化数据
        */
        ignoredActions: ['persist/PERSIST'],
      },
    }),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch