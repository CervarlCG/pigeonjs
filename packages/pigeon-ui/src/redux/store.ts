import { combineReducers, configureStore } from "@reduxjs/toolkit";
import sdkReducer from "./slices/sdk";
import socketReducer from "./slices/socket";

const rootReducer = combineReducers({
  sdk: sdkReducer,
  socket: socketReducer,
});

export default configureStore({
  reducer: rootReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
