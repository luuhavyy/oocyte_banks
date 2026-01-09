import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Alert,
  CircularProgress,
  Box,
  Typography,
  useTheme,
} from "@mui/material";
import { updateStaffAsync, fetchStaffs } from "../../features/staffs/staffSlice";
import { getStaffById } from "../../api/staffApi";

export default function StaffEditDialog({ open, onClose, staffId }) {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((s) => s.staff);

  const [staff, setStaff] = useState(null);
  const [loadingStaff, setLoadingStaff] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    role: "staff",
    status: "active",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open && staffId) {
      const loadStaff = async () => {
        try {
          setLoadingStaff(true);
          const data = await getStaffById(staffId);
          setStaff(data);
          setFormData({
            fullName: data.fullName || "",
            phone: data.phone || "",
            role: data.role || "staff",
            status: data.status || "active",
          });
        } catch (err) {
          console.error("Failed to load staff:", err);
          setStaff(null);
        } finally {
          setLoadingStaff(false);
        }
      };
      loadStaff();
    } else if (open && !staffId) {
      // Reset if dialog opens without staffId
      setStaff(null);
      setLoadingStaff(false);
    }
  }, [open, staffId]);

  const validate = () => {
    const e = {};
    if (!formData.fullName) e.fullName = "Full name is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const result = await dispatch(
      updateStaffAsync({ staffId: staffId, data: formData })
    );

    if (updateStaffAsync.fulfilled.match(result)) {
      dispatch(fetchStaffs());
      handleClose();
    }
  };

  const handleClose = () => {
    setFormData({
      fullName: "",
      phone: "",
      role: "staff",
      status: "active",
    });
    setErrors({});
    setStaff(null);
    onClose();
  };

  if (loadingStaff) {
    return (
      <Dialog
        disableScrollLock={true}
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: "0px 4px 12px rgba(194, 24, 91, 0.15)",
          },
        }}
      >
        <DialogContent>
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog
      disableScrollLock={true}
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: "0px 4px 12px rgba(194, 24, 91, 0.15)",
        },
      }}
    >
      <DialogTitle sx={{ color: theme.palette.primary.main, fontWeight: 600 }}>
        Edit Staff
      </DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        {!staff ? (
          <Alert severity="error" sx={{ mb: 3 }}>
            Staff not found
          </Alert>
        ) : (
          <Box component="form" id="edit-staff-form" onSubmit={handleSubmit}>
            <Box
              sx={{
                mb: 3,
                p: 2,
                bgcolor: theme.palette.background.default,
                borderRadius: 1,
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Email
              </Typography>
              <Typography fontWeight={500}>{staff.email}</Typography>
              <Typography variant="caption" fontStyle="italic" color="text.secondary">
                Email cannot be changed
              </Typography>
            </Box>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "1fr 1fr",
                },
                gap: 3,
              }}
            >
              <TextField
                label="Full Name"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                error={!!errors.fullName}
                helperText={errors.fullName}
                required
                fullWidth
              />

              <TextField
                label="Phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                fullWidth
              />

              <TextField
                select
                label="Role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                fullWidth
              >
                <MenuItem value="staff">Staff</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </TextField>

              <TextField
                select
                label="Status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                fullWidth
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </TextField>
            </Box>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose} sx={{ color: theme.palette.text.secondary }}>
          Cancel
        </Button>
        <Button
          type="submit"
          form="edit-staff-form"
          variant="contained"
          disabled={loading || !staff}
          sx={{
            backgroundColor: theme.palette.primary.main,
            "&:hover": { backgroundColor: theme.palette.primary.dark },
          }}
        >
          {loading ? <CircularProgress size={22} /> : "Update Staff"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

