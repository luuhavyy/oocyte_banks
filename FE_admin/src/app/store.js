import { configureStore } from "@reduxjs/toolkit";
import adminAuthReducer from "../features/auth/adminAuthSlice";
import uiReducer from "../features/ui/uiSlice";
import staffReducer from "../features/staffs/staffSlice";
import patientReducer from "../features/patients/patientSlice";

export const store = configureStore({
  reducer: {
    adminAuth: adminAuthReducer,
    ui: uiReducer,
    staff: staffReducer,
    adminPatient: patientReducer,
  },
});

