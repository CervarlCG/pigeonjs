import { createSlice } from "@reduxjs/toolkit";
import { io } from "socket.io-client";

export const socketSlice = createSlice({
  name: "sdk",
  initialState: {
    value: io("http://localhost:8080", { autoConnect: false }),
  },
  reducers: {
    connectSocket(state, action) {
      state.value.auth = { token: action.payload };
      state.value.connect();
    },
  },
});

export const { connectSocket } = socketSlice.actions;

export default socketSlice.reducer;
