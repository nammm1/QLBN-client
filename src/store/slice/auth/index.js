import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    isLogin: false,
    accessToken: null,
    userInfo: {},
    role: null
}

export const counterSlice = createSlice({
    name: 'counter',
    initialState,
    reducers: {
        login: (state, action) => {
            state.isLogin = true;
            state.userInfo = action.payload.userInfo;
            state.accessToken = action.payload.accessToken;
            state.role = action.payload.role;
        },
        logout: (state) => {
            state.isLogin = false;
            state.userInfo = {};
            state.accessToken = null;
            state.role = null;
        }
    },
})

// Action creators are generated for each case reducer function
export const { login, logout } = counterSlice.actions

export const reducer = counterSlice.reducer