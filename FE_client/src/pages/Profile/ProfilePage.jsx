import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  useTheme,
  InputAdornment,
  IconButton,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import { fetchMyProfile } from "../../features/patient/patientSlice";
import { updatePatient } from "../../api/patientApi";
import { changePasswordApi } from "../../api/authApi";

export default function ProfilePage() {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { me, loading } = useSelector((s) => s.patient);
  const { user } = useSelector((s) => s.auth);

  const [profileData, setProfileData] = useState({
    fullName: "",
    phone: "",
    address: "",
    dob: "",
  });

  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [profileError, setProfileError] = useState(null);
  const [passwordError, setPasswordError] = useState(null);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [profileErrors, setProfileErrors] = useState({});
  const [passwordErrors, setPasswordErrors] = useState({});

  useEffect(() => {
    if (user && !me) {
      dispatch(fetchMyProfile());
    }
  }, [dispatch, user, me]);

  useEffect(() => {
    if (me) {
      setProfileData({
        fullName: me.fullName || "",
        phone: me.phone || "",
        address: me.address || "",
        dob: me.dob
          ? new Date(me.dob).toISOString().split("T")[0]
          : "",
      });
    }
  }, [me]);

  const validateProfile = () => {
    const newErrors = {};
    if (!profileData.fullName) {
      newErrors.fullName = "Full name is required";
    }
    if (!profileData.phone) {
      newErrors.phone = "Phone is required";
    }
    if (!profileData.address) {
      newErrors.address = "Address is required";
    }
    if (!profileData.dob) {
      newErrors.dob = "Date of birth is required";
    }
    setProfileErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePassword = () => {
    const newErrors = {};
    if (!passwordData.oldPassword) {
      newErrors.oldPassword = "Current password is required";
    }
    if (!passwordData.newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = "Password must be at least 6 characters";
    }
    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your new password";
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    if (passwordData.oldPassword === passwordData.newPassword) {
      newErrors.newPassword = "New password must be different from current password";
    }
    setPasswordErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData({ ...profileData, [name]: value });
    if (profileErrors[name]) {
      setProfileErrors({ ...profileErrors, [name]: "" });
    }
    setProfileError(null);
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({ ...passwordData, [name]: value });
    if (passwordErrors[name]) {
      setPasswordErrors({ ...passwordErrors, [name]: "" });
    }
    setPasswordError(null);
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!validateProfile()) return;

    setSavingProfile(true);
    setProfileError(null);
    setProfileSuccess(false);

    try {
      const updateData = {
        fullName: profileData.fullName,
        phone: profileData.phone,
        address: profileData.address,
        dob: new Date(profileData.dob).toISOString(),
      };

      await updatePatient(me.id, updateData);
      await dispatch(fetchMyProfile());
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 5000);
    } catch (err) {
      setProfileError(err.response?.data?.detail || "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!validatePassword()) return;

    setChangingPassword(true);
    setPasswordError(null);
    setPasswordSuccess(false);

    try {
      await changePasswordApi({
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword,
      });
      setPasswordSuccess(true);
      setPasswordData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setTimeout(() => setPasswordSuccess(false), 5000);
    } catch (err) {
      setPasswordError(err.response?.data?.detail || "Failed to change password");
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "400px",
        }}
      >
        <CircularProgress sx={{ color: theme.palette.primary.main }} />
      </Box>
    );
  }

  // Style definitions
  const styles = {
    formContainer: {
      display: 'flex',
      flexDirection: 'column',
      gap: '32px',
    },
    sectionWrapper: {
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      padding: '24px',
      backgroundColor: '#FFFFFF',
      borderRadius: 2,
      borderLeft: `4px solid ${theme.palette.primary.main}`,
      boxShadow: theme.shadows[2],
      [theme.breakpoints.down('sm')]: {
        padding: '20px',
      },
    },
    sectionTitle: {
      fontWeight: 600,
      fontSize: '20px',
      color: theme.palette.primary.main,
      marginBottom: '4px',
    },
    fieldGroup: {
      display: 'grid',
      gridTemplateColumns: {
        xs: '1fr',
        sm: '1fr 1fr',
      },
      gap: '24px',
      width: '100%',
    },
    fieldFull: {
      width: '100%',
    },
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography
        variant="h4"
        sx={{ mb: 4, fontWeight: 600, color: theme.palette.primary.main }}
      >
        Profile Settings
      </Typography>

      <Box sx={styles.formContainer}>
        {/* Profile Information Section */}
        <Box sx={styles.sectionWrapper}>
          <Typography sx={styles.sectionTitle}>
            Personal Information
          </Typography>

          {profileSuccess && (
            <Alert severity="success" sx={{ mb: 3 }}>
              Profile updated successfully!
            </Alert>
          )}

          {profileError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {profileError}
            </Alert>
          )}

          <Box component="form" onSubmit={handleProfileSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <TextField
              fullWidth
              label="Email"
              value={me?.email || ""}
              InputProps={{ readOnly: true }}
              helperText="Email cannot be changed"
            />

            <TextField
              fullWidth
              label="Full Name"
              name="fullName"
              value={profileData.fullName}
              onChange={handleProfileChange}
              error={!!profileErrors.fullName}
              helperText={profileErrors.fullName}
              required
            />

            <Box sx={styles.fieldGroup}>
              <TextField
                fullWidth
                label="Date of Birth"
                name="dob"
                type="date"
                value={profileData.dob}
                onChange={handleProfileChange}
                error={!!profileErrors.dob}
                helperText={profileErrors.dob}
                required
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                fullWidth
                label="Phone"
                name="phone"
                value={profileData.phone}
                onChange={handleProfileChange}
                error={!!profileErrors.phone}
                helperText={profileErrors.phone}
                required
              />
            </Box>

            <TextField
              fullWidth
              label="Address"
              name="address"
              value={profileData.address}
              onChange={handleProfileChange}
              error={!!profileErrors.address}
              helperText={profileErrors.address}
              required
              multiline
              rows={3}
            />

            <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
              <Button
                type="submit"
                variant="contained"
                disabled={savingProfile}
                sx={{
                  backgroundColor: theme.palette.primary.main,
                  color: theme.palette.primary.contrastText,
                  "&:hover": { backgroundColor: theme.palette.primary.dark },
                  "&:disabled": {
                    backgroundColor: theme.palette.action.disabledBackground,
                    color: theme.palette.action.disabled,
                  },
                }}
              >
                {savingProfile ? (
                  <CircularProgress size={24} sx={{ color: theme.palette.primary.contrastText }} />
                ) : (
                  "Save Changes"
                )}
              </Button>
            </Box>
          </Box>
        </Box>

        {/* Change Password Section */}
        <Box sx={styles.sectionWrapper}>
          <Typography sx={styles.sectionTitle}>
            Change Password
          </Typography>

          {passwordSuccess && (
            <Alert severity="success" sx={{ mb: 3 }}>
              Password changed successfully!
            </Alert>
          )}

          {passwordError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {passwordError}
            </Alert>
          )}

          <Box component="form" onSubmit={handlePasswordSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <TextField
              fullWidth
              label="Current Password"
              name="oldPassword"
              type={showOldPassword ? "text" : "password"}
              value={passwordData.oldPassword}
              onChange={handlePasswordChange}
              error={!!passwordErrors.oldPassword}
              helperText={passwordErrors.oldPassword}
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowOldPassword(!showOldPassword)}
                      edge="end"
                    >
                      {showOldPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="New Password"
              name="newPassword"
              type={showNewPassword ? "text" : "password"}
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              error={!!passwordErrors.newPassword}
              helperText={passwordErrors.newPassword}
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      edge="end"
                    >
                      {showNewPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Confirm New Password"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              error={!!passwordErrors.confirmPassword}
              helperText={passwordErrors.confirmPassword}
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
              <Button
                type="submit"
                variant="contained"
                disabled={changingPassword}
                sx={{
                  backgroundColor: theme.palette.primary.main,
                  color: theme.palette.primary.contrastText,
                  "&:hover": { backgroundColor: theme.palette.primary.dark },
                  "&:disabled": {
                    backgroundColor: theme.palette.action.disabledBackground,
                    color: theme.palette.action.disabled,
                  },
                }}
              >
                {changingPassword ? (
                  <CircularProgress size={24} sx={{ color: theme.palette.primary.contrastText }} />
                ) : (
                  "Change Password"
                )}
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>
    </Container>
  );
}

