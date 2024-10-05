import { combineReducers, configureStore } from "@reduxjs/toolkit";
import sdkReducer from "./slices/sdk";
import socketReducer from "./slices/socket";
import workspaceReducer from "./slices/workspace";

const rootReducer = combineReducers({
  sdk: sdkReducer,
  socket: socketReducer,
  workspace: workspaceReducer,
});

export default configureStore({
  reducer: rootReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
