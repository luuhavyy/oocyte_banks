import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { TextField, Button, Box, Typography, Alert, MenuItem, useTheme } from "@mui/material";
import { register } from "../../features/auth/authSlice";

export default function RegisterPage() {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector(s => s.auth);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    role: "donor",
    dob: "",
    phone: "",
    address: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      dob: new Date(formData.dob).toISOString(),
    };
    const result = await dispatch(register(submitData));
    if (register.fulfilled.match(result)) {
      navigate("/home");
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "calc(100vh - 70px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: { xs: 3, sm: 4 },
        py: { xs: 4, md: 6 },
        margin: 0,
        maxWidth: "100%",
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: "600px",
        }}
      >
        <Typography 
          variant="h4" 
          sx={{ 
            mb: 4, 
            textAlign: "center",
            fontWeight: 600,
            color: "#4A4A4A",
          }}
        >
          Register
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="Password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          required
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="Full Name"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          required
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          select
          label="Role"
          name="role"
          value={formData.role}
          onChange={handleChange}
          required
          sx={{ mb: 2 }}
        >
          <MenuItem value="donor">Donor</MenuItem>
          <MenuItem value="recipient">Recipient</MenuItem>
        </TextField>
        <TextField
          fullWidth
          label="Date of Birth"
          name="dob"
          type="date"
          value={formData.dob}
          onChange={handleChange}
          required
          InputLabelProps={{ shrink: true }}
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="Phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          required
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="Address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          required
          sx={{ mb: 2 }}
        />
        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={loading}
          sx={{
            py: 1.5,
            fontSize: "16px",
            mt: 1,
            backgroundColor: theme.palette.primary.buttonmain,
                '&:hover': { backgroundColor: theme.palette.primary.buttonlight },
          }}
        >
          {loading ? "Registering..." : "Register"}
        </Button>
      </Box>
      </Box>
    </Box>
  );
}

