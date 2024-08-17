import { createSlice } from "@reduxjs/toolkit";
import PigeonSDK from "pigeon-sdk";

export const sdkSlice = createSlice({
  name: "sdk",
  initialState: {
    value: new PigeonSDK("http://localhost:8080"),
  },
  reducers: {},
});

export default sdkSlice.reducer;
