import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    user: {},
};

const authSlice = createSlice({
    name: 'authSlice',
    initialState,
    reducers: {
        setUser(state, action) {
            state.user = action.payload;
        },
        reset(state) {
            state.user = {};
        },
    },
    extraReducers: {},
});

const { setUser, reset } = authSlice.actions;

export const authActions = {
    setUser,
    reset,
};

export default authSlice.reducer;
