import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { loginApi } from "../../api/authApi";
import { getUserFromToken, getRoleFromToken } from "../../utils/jwtUtils";

export const adminLogin = createAsyncThunk("adminAuth/login", async (payload, thunkAPI) => {
  try {
    const response = await loginApi(payload);
    
    if (!response || !response.access_token) {
      return thunkAPI.rejectWithValue("Invalid response from server");
    }
    
    const role = getRoleFromToken(response.access_token);
    
    if (!role) {
      return thunkAPI.rejectWithValue("Failed to decode token");
    }
    
    checkAuthorization(role);
    
    localStorage.setItem("admin_token", response.access_token);
    
    return response;
  } catch (err) {
    if (err.message === "Unauthorized Access") {
      return thunkAPI.rejectWithValue("Unauthorized Access");
    } else {
      return thunkAPI.rejectWithValue(err.response?.data?.detail || err.message || "Login failed");
    }
  }
});

const checkAuthorization = (role) => {
  const allowedRoles = ["admin", "staff"];  
  if (!allowedRoles.includes(role)) {
    throw new Error("Unauthorized Access"); 
  }
};

const getInitialUser = () => {
  const token = localStorage.getItem("admin_token");
  if (token) {
    return getUserFromToken(token);
  }
  return null;
};

const adminAuthSlice = createSlice({
  name: "adminAuth",
  initialState: {
    token: localStorage.getItem("admin_token") || null,
    user: getInitialUser(),
    loading: false,
    error: null
  },
  reducers: {
    logout: (state) => {
      state.token = null;
      state.user = null;
      localStorage.removeItem("admin_token"); // Use admin_token
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(adminLogin.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(adminLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.access_token;
        state.user = getUserFromToken(action.payload.access_token) || action.payload;
      })
      .addCase(adminLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { logout } = adminAuthSlice.actions;
export default adminAuthSlice.reducer;

