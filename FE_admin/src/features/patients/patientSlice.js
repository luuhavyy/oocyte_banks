import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getPatientList, getPatientById, updatePatient, deletePatient } from "../../api/patientApi";

export const fetchPatients = createAsyncThunk("adminPatient/list", async (_, thunkAPI) => {
  try {
    return await getPatientList();
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.detail || "Failed to fetch patients");
  }
});

export const fetchPatientById = createAsyncThunk("adminPatient/detail", async (id, thunkAPI) => {
  try {
    return await getPatientById(id);
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.detail || "Failed to fetch patient");
  }
});

export const createPatientAsync = createAsyncThunk("adminPatient/create", async (data, thunkAPI) => {
  try {
    return await createPatient(data);
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.detail || "Failed to create patient");
  }
});

export const updatePatientAsync = createAsyncThunk("adminPatient/update", async ({ id, data }, thunkAPI) => {
  try {
    return await updatePatient(id, data);
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.detail || "Failed to update patient");
  }
});

export const deletePatientAsync = createAsyncThunk("adminPatient/delete", async (id, thunkAPI) => {
  try {
    await deletePatient(id);
    return id;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.detail || "Failed to delete patient");
  }
});

const patientSlice = createSlice({
  name: "adminPatient",
  initialState: { 
    list: [], 
    current: null,
    loading: false, 
    error: null 
  },
  reducers: {
    clearCurrent: (state) => {
      state.current = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPatients.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchPatients.fulfilled, (s, a) => {
        s.loading = false;
        s.list = a.payload;
      })
      .addCase(fetchPatients.rejected, (s, a) => { 
        s.loading = false; 
        s.error = a.payload;
      })
      .addCase(fetchPatientById.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchPatientById.fulfilled, (s, a) => {
        s.loading = false;
        s.current = a.payload;
      })
      .addCase(fetchPatientById.rejected, (s, a) => { 
        s.loading = false; 
        s.error = a.payload;
      })
      .addCase(createPatientAsync.pending, (s) => { s.loading = true; })
      .addCase(createPatientAsync.fulfilled, (s, a) => {
        s.loading = false;
        s.list.push(a.payload);
      })
      .addCase(createPatientAsync.rejected, (s, a) => { 
        s.loading = false; 
        s.error = a.payload;
      })
      .addCase(updatePatientAsync.pending, (s) => { s.loading = true; })
      .addCase(updatePatientAsync.fulfilled, (s, a) => {
        s.loading = false;
        const index = s.list.findIndex(item => item.id === a.payload.id);
        if (index !== -1) s.list[index] = a.payload;
        if (s.current?.id === a.payload.id) s.current = a.payload;
      })
      .addCase(updatePatientAsync.rejected, (s, a) => { 
        s.loading = false; 
        s.error = a.payload;
      })
      .addCase(deletePatientAsync.pending, (s) => { s.loading = true; })
      .addCase(deletePatientAsync.fulfilled, (s, a) => {
        s.loading = false;
        s.list = s.list.filter(item => item.id !== a.payload);
        if (s.current?.id === a.payload) s.current = null;
      })
      .addCase(deletePatientAsync.rejected, (s, a) => { 
        s.loading = false; 
        s.error = a.payload;
      });
  }
});

export const { clearCurrent } = patientSlice.actions;
export default patientSlice.reducer;

