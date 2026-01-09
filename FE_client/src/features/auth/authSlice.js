import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { loginApi, registerApi } from "../../api/authApi";
import { getUserFromToken } from "../../utils/jwtUtils";

export const login = createAsyncThunk("auth/login", async (payload, thunkAPI) => {
  try {
    const response = await loginApi(payload);
    localStorage.setItem("client_token", response.access_token);
    return response;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.detail || "Login failed");
  }
});

export const register = createAsyncThunk("auth/register", async (payload, thunkAPI) => {
  try {
    const response = await registerApi(payload);
    localStorage.setItem("client_token", response.access_token);
    return response;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.detail || "Register failed");
  }
});

const getInitialUser = () => {
  const token = localStorage.getItem("client_token");
  if (token) {
    return getUserFromToken(token);
  }
  return null;
};

const authSlice = createSlice({
  name: "auth",
  initialState: {
    token: localStorage.getItem("client_token") || null,
    user: getInitialUser(),
    loading: false,
    error: null
  },
  reducers: {
    logout: (state) => {
      state.token = null;
      state.user = null;
      localStorage.removeItem("client_token");
    }
  },
  extraReducers: (builder) => {
    builder
      // login
      .addCase(login.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.access_token;
        state.user = getUserFromToken(action.payload.access_token) || action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // register
      .addCase(register.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.access_token;
        state.user = getUserFromToken(action.payload.access_token) || action.payload;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;

