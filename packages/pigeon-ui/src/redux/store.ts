import { combineReducers, configureStore } from "@reduxjs/toolkit";
import sdkReducer from "./slices/sdk";

const rootReducer = combineReducers({
  sdk: sdkReducer,
});

export default configureStore({
  reducer: rootReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
