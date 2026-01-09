import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getStaffList, createStaff, updateStaff, deleteStaff } from "../../api/staffApi";

export const fetchStaffs = createAsyncThunk("staff/list", async (_, thunkAPI) => {
  try {
    return await getStaffList();
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.detail || "Failed to fetch staffs");
  }
});

export const createStaffAsync = createAsyncThunk("staff/create", async (data, thunkAPI) => {
  try {
    return await createStaff(data);
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.detail || "Failed to create staff");
  }
});

export const updateStaffAsync = createAsyncThunk("staff/update", async ({ staffId, data }, thunkAPI) => {
  try {
    return await updateStaff(staffId, data);
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.detail || "Failed to update staff");
  }
});

export const deleteStaffAsync = createAsyncThunk("staff/delete", async (staffId, thunkAPI) => {
  try {
    await deleteStaff(staffId);
    return staffId;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.detail || "Failed to delete staff");
  }
});

const staffSlice = createSlice({
  name: "staff",
  initialState: { 
    list: [], 
    loading: false, 
    error: null 
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchStaffs.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchStaffs.fulfilled, (s, a) => {
        s.loading = false;
        s.list = a.payload;
      })
      .addCase(fetchStaffs.rejected, (s, a) => { 
        s.loading = false; 
        s.error = a.payload;
      })
      .addCase(createStaffAsync.pending, (s) => { s.loading = true; })
      .addCase(createStaffAsync.fulfilled, (s, a) => {
        s.loading = false;
        s.list.push(a.payload);
      })
      .addCase(createStaffAsync.rejected, (s, a) => { 
        s.loading = false; 
        s.error = a.payload;
      })
      .addCase(updateStaffAsync.pending, (s) => { s.loading = true; })
      .addCase(updateStaffAsync.fulfilled, (s, a) => {
        s.loading = false;
        const index = s.list.findIndex(item => item.staffId === a.payload.staffId);
        if (index !== -1) s.list[index] = a.payload;
      })
      .addCase(updateStaffAsync.rejected, (s, a) => { 
        s.loading = false; 
        s.error = a.payload;
      })
      .addCase(deleteStaffAsync.pending, (s) => { s.loading = true; })
      .addCase(deleteStaffAsync.fulfilled, (s, a) => {
        s.loading = false;
        s.list = s.list.filter(item => item.staffId !== a.payload);
      })
      .addCase(deleteStaffAsync.rejected, (s, a) => { 
        s.loading = false; 
        s.error = a.payload;
      });
  }
});

export default staffSlice.reducer;

