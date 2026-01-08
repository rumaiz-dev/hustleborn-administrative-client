import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  sidebarShow: true,
  theme: 'light',
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setSidebarShow: (state, action) => {
      state.sidebarShow = action.payload;
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
    },
  },
});

export const { setSidebarShow, setTheme } = uiSlice.actions;

export const selectSidebarShow = (state) => state.ui.sidebarShow;
export const selectTheme = (state) => state.ui.theme;

export default uiSlice.reducer;