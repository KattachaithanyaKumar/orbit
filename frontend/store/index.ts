import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./auth-slice";
import workspacesReducer from "./workspaces-slice";

export const makeStore = () =>
  configureStore({
    reducer: {
      auth: authReducer,
      workspaces: workspacesReducer,
    },
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
