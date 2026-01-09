import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getMyInfo, updatePatient } from "../../api/patientApi";

export const fetchMyProfile = createAsyncThunk("patient/me", async (_, thunkAPI) => {
  try {
    return await getMyInfo();
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.detail || "Failed to fetch profile");
  }
});

const patientSlice = createSlice({
  name: "patient",
  initialState: { me: null, loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyProfile.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchMyProfile.fulfilled, (s, a) => {
        s.loading = false;
        s.me = a.payload;
      })
      .addCase(fetchMyProfile.rejected, (s, a) => { 
        s.loading = false; 
        s.error = a.payload;
      });
  }
});

export default patientSlice.reducer;

