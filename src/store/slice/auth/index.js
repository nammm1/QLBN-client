import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    isLogin: false,
    accessToken: null,
    userInfo: {},
    vai_tro: null
}

export const counterSlice = createSlice({
    name: 'counter',
    initialState,
    reducers: {
        login: (state, action) => {
            state.isLogin = true;
            state.userInfo = action.payload.userInfo;
            state.accessToken = action.payload.accessToken;
            state.vai_tro = action.payload.vai_tro;
        },
        logout: (state) => {
            state.isLogin = false;
            state.userInfo = {};
            state.accessToken = null;
            state.vai_tro = null;
        }
    },
})

// Action creators are generated for each case reducer function
export const { login, logout } = counterSlice.actions

export const reducer = counterSlice.reducer