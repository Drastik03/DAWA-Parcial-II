import { configureStore } from '@reduxjs/toolkit';
import CustomizerReducer from './customizer/CustomizerSlice';
import UserProfileReducer from './apps/userProfile/UserProfileSlice';

export const store = configureStore({
  reducer: {
    customizer: CustomizerReducer,
    userpostsReducer: UserProfileReducer,
  },
});

export default store;
