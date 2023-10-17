import { createSlice } from '@reduxjs/toolkit';
import { STORAGE_PREFIX } from 'src/utils/auth';

const initialState = {
  userInfo: process.browser ? JSON.parse(window.localStorage.getItem(`${STORAGE_PREFIX}userInfo`)) : {},
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.userInfo = action.payload;

      if (process.browser) {
        if (action.payload === null) {
          return window.localStorage.removeItem(`${STORAGE_PREFIX}userInfo`);
        }
  
        window.localStorage.setItem(`${STORAGE_PREFIX}userInfo`, JSON.stringify(action.payload));
      }

      window.location.reload();
    }
  },
});

export const { setUser } = userSlice.actions;

export default userSlice.reducer;
