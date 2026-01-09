import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { 
  TextField, 
  Button, 
  Box, 
  Typography, 
  Alert, 
  Link,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  useTheme,
} from "@mui/material";
import { login } from "../../features/auth/authSlice";
import { forgotPasswordApi } from "../../api/authApi";

export default function LoginPage() {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector(s => s.auth);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [forgotPasswordError, setForgotPasswordError] = useState(null);
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(login(formData));
    if (login.fulfilled.match(result)) {
      navigate("/home");
    }
  };

  const handleForgotPasswordClick = () => {
    setForgotPasswordOpen(true);
    setForgotPasswordEmail("");
    setForgotPasswordError(null);
    setForgotPasswordSuccess(false);
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!forgotPasswordEmail) {
      setForgotPasswordError("Please enter your email address");
      return;
    }

    setForgotPasswordLoading(true);
    setForgotPasswordError(null);
    setForgotPasswordSuccess(false);

    try {
      await forgotPasswordApi(forgotPasswordEmail);
      setForgotPasswordSuccess(true);
    } catch (err) {
      setForgotPasswordError(err.response?.data?.detail || "Failed to send reset email. Please try again.");
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  const handleCloseForgotPassword = () => {
    setForgotPasswordOpen(false);
    setForgotPasswordEmail("");
    setForgotPasswordError(null);
    setForgotPasswordSuccess(false);
  };

  return (
    <>
      <Box
        sx={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: { xs: 3, sm: 4 },
          py: { xs: 4, md: 8 },
          margin: 0,
          maxWidth: "100%",
        }}
      >
        <Box
          sx={{
            width: "100%",
            maxWidth: "500px",
          }}
        >
          <Typography 
            variant="h4" 
            sx={{ 
              mb: 4, 
              textAlign: "center",
              fontWeight: 600,
              color: theme.palette.text.primary,
            }}
          >
            Login
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
              sx={{ mb: 3 }}
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
            <Box sx={{ mb: 3, textAlign: "right" }}>
              <Link
                component="button"
                type="button"
                onClick={handleForgotPasswordClick}
                sx={{
                  color: theme.palette.primary.main,
                  textDecoration: "none",
                  cursor: "pointer",
                  fontSize: "14px",
                  "&:hover": {
                    textDecoration: "underline",
                  },
                }}
              >
                Forgot Password?
              </Link>
            </Box>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{
                py: 1.5,
                fontSize: "16px",
                backgroundColor: theme.palette.primary.main,
                "&:hover": { backgroundColor: theme.palette.primary.dark },
              }}
            >
              {loading ? "Logging in..." : "Login"}
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Forgot Password Dialog */}
      <Dialog
        disableScrollLock={true}
        open={forgotPasswordOpen}
        onClose={handleCloseForgotPassword}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: theme.shadows[4],
          },
        }}
      >
        <DialogTitle sx={{ color: theme.palette.primary.main, fontWeight: 600 }}>
          Reset Password
        </DialogTitle>
        <DialogContent>
          {forgotPasswordSuccess ? (
            <Alert severity="success" sx={{ mb: 2 }}>
              Password reset email has been sent to {forgotPasswordEmail}. Please check your inbox and follow the instructions to reset your password.
            </Alert>
          ) : (
            <>
              <Typography variant="body2" sx={{ mb: 3, color: theme.palette.text.secondary }}>
                Enter your email address and we'll send you a link to reset your password.
              </Typography>
              {forgotPasswordError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {forgotPasswordError}
                </Alert>
              )}
              <Box component="form" onSubmit={handleForgotPasswordSubmit}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={forgotPasswordEmail}
                  onChange={(e) => setForgotPasswordEmail(e.target.value)}
                  required
                  disabled={forgotPasswordLoading}
                  sx={{ mb: 2 }}
                />
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          {forgotPasswordSuccess ? (
            <Button
              onClick={handleCloseForgotPassword}
              variant="contained"
              sx={{
                backgroundColor: theme.palette.primary.main,
                "&:hover": { backgroundColor: theme.palette.primary.dark },
              }}
            >
              Close
            </Button>
          ) : (
            <>
              <Button
                onClick={handleCloseForgotPassword}
                sx={{ color: theme.palette.text.secondary }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleForgotPasswordSubmit}
                variant="contained"
                disabled={forgotPasswordLoading || !forgotPasswordEmail}
                sx={{
                  backgroundColor: theme.palette.primary.main,
                  "&:hover": { backgroundColor: theme.palette.primary.dark },
                }}
              >
                {forgotPasswordLoading ? (
                  <CircularProgress size={24} sx={{ color: theme.palette.primary.contrastText }} />
                ) : (
                  "Send Reset Link"
                )}
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
}
