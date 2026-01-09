import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import uiReducer from "../features/ui/uiSlice";
import patientReducer from "../features/patient/patientSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    patient: patientReducer,
  },
});

