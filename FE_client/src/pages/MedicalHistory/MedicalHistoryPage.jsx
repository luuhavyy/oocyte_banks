import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  FormControl,
  Select,
  MenuItem,
  Chip,
  Alert,
  CircularProgress,
  RadioGroup,
  FormControlLabel,
  Radio,
  useTheme,
} from "@mui/material";
import { fetchMyProfile } from "../../features/patient/patientSlice";
import { updatePatient } from "../../api/patientApi";

export default function MedicalHistoryPage() {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { me, loading } = useSelector((s) => s.patient);
  const { user } = useSelector((s) => s.auth);

  const [formData, setFormData] = useState({
    personalHistory: {
      height: "",
      weight: "",
      bmi: "",
      bloodType: "",
      allergies: [],
      smoking: "Never",
      alcohol: "Never",
      medications: "",
    },
    treatments: {
      hormonalTherapyHistory: "No",
      fertilityTreatmentsBefore: "No",
      fertilityTreatmentType: "",
    },
    surgeries: {
      pelvicSurgeryHistory: "No",
      surgeryDetail: "",
    },
    familyHistory: {
      geneticDiseases: "No",
      familyFertilityIssues: "No",
      notes: "",
    },
  });

  const [allergyInput, setAllergyInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user && !me) dispatch(fetchMyProfile());
  }, [dispatch, user, me]);

  useEffect(() => {
    if (me?.medicalHistory) {
      setFormData(me.medicalHistory);
    }
  }, [me]);

  useEffect(() => {
    const { height, weight } = formData.personalHistory;
    if (height && weight) {
      const h = parseFloat(height) / 100;
      const w = parseFloat(weight);
      if (h > 0 && w > 0) {
        const bmi = (w / (h * h)).toFixed(1);
        setFormData((prev) => ({
          ...prev,
          personalHistory: { ...prev.personalHistory, bmi },
        }));
      }
    }
  }, [formData.personalHistory.height, formData.personalHistory.weight]);

  const handleChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
  };

  const handleAddAllergy = () => {
    if (!allergyInput.trim()) return;
    setFormData((prev) => ({
      ...prev,
      personalHistory: {
        ...prev.personalHistory,
        allergies: [...prev.personalHistory.allergies, allergyInput.trim()],
      },
    }));
    setAllergyInput("");
  };

  const handleRemoveAllergy = (index) => {
    setFormData((prev) => ({
      ...prev,
      personalHistory: {
        ...prev.personalHistory,
        allergies: prev.personalHistory.allergies.filter((_, i) => i !== index),
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await updatePatient(me.id, { medicalHistory: formData });
      await dispatch(fetchMyProfile());
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch {
      setError("Failed to save medical history");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: 400, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <CircularProgress />
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
      [theme.breakpoints.down('sm')]: {
        padding: '20px',
      },
    },
    sectionTitle: {
      fontWeight: 600,
      fontSize: '20px',
      color: theme.palette.text.primary,
      marginBottom: '4px',
    },
    // Sub-section wrapper for visual grouping
    subSection: {
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      padding: '20px',
      backgroundColor: theme.palette.background.paper,
      borderRadius: 1,
      border: `1px solid ${theme.palette.divider}`,
      [theme.breakpoints.down('sm')]: {
        padding: '16px',
        gap: '16px',
      },
    },
    subSectionTitle: {
      fontSize: '14px',
      fontWeight: 600,
      color: theme.palette.text.secondary,
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      mb: 0.5,
    },
    // Field groups using CSS Grid for better responsive control
    fieldGroupPhysical: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '16px',
      width: '100%',
      [theme.breakpoints.down('lg')]: {
        gridTemplateColumns: 'repeat(3, 1fr)',
      },
      [theme.breakpoints.down('md')]: {
        gridTemplateColumns: 'repeat(2, 1fr)',
      },
      [theme.breakpoints.down('sm')]: {
        gridTemplateColumns: '1fr',
        gap: '12px',
      },
    },
    fieldGroupLifestyle: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '16px',
      width: '100%',
      [theme.breakpoints.down('lg')]: {
        gridTemplateColumns: 'repeat(3, 1fr)',
      },
      [theme.breakpoints.down('md')]: {
        gridTemplateColumns: 'repeat(2, 1fr)',
      },
      [theme.breakpoints.down('sm')]: {
        gridTemplateColumns: '1fr',
        gap: '12px',
      },
    },
    // Field styles - simple and clean
    fieldPhysical: {
      width: '100%',
    },
    fieldLifestyle: {
      width: '100%',
    },
    fieldRadio: {
      width: 'fit-content',
      minWidth: '200px',
      [theme.breakpoints.down('sm')]: {
        width: '100%',
      },
    },
    fieldGroupRadio: {
      display: 'flex',
      gap: '24px',
      flexWrap: 'nowrap',
      [theme.breakpoints.down('sm')]: {
        flexDirection: 'column',
        gap: '16px',
      },
    },
    fieldFull: {
      width: '100%',
    },
  };

  const SectionCard = ({ title, children }) => (
    <Box sx={styles.sectionWrapper}>
      <Typography sx={styles.sectionTitle}>
        {title}
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {children}
      </Box>
    </Box>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography color="primary" variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
        Medical History
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 4 }}>
        Update your personal health information and history.
      </Typography>

      {success && <Alert severity="success" sx={{ mb: 3 }}>Saved successfully</Alert>}
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Box component="form" onSubmit={handleSubmit} sx={styles.formContainer}>
        {/* PERSONAL */}
        <SectionCard title="Personal History">
          {/* Sub-section 1: Physical Measurements */}
          <Box sx={styles.subSection}>
            <Typography sx={styles.subSectionTitle}>
              Physical Measurements
            </Typography>
            <Box sx={styles.fieldGroupPhysical}>
              <TextField
                label="Height (cm)"
                type="number"
                value={formData.personalHistory.height}
                onChange={(e) => handleChange("personalHistory", "height", e.target.value)}
                sx={styles.fieldPhysical}
              />
              <TextField
                label="Weight (kg)"
                type="number"
                value={formData.personalHistory.weight}
                onChange={(e) => handleChange("personalHistory", "weight", e.target.value)}
                sx={styles.fieldPhysical}
              />
              <TextField
                label="BMI"
                value={formData.personalHistory.bmi}
                InputProps={{ readOnly: true }}
                helperText="Auto calculated"
                sx={styles.fieldPhysical}
              />
            </Box>
          </Box>

          {/* Sub-section 2: Lifestyle & Medical Information */}
          <Box sx={styles.subSection}>
            <Typography sx={styles.subSectionTitle}>
              Lifestyle & Medical Information
            </Typography>
            <Box sx={styles.fieldGroupLifestyle}>
              <FormControl sx={styles.fieldLifestyle}>
                <Typography
                  variant="body2"
                  sx={{ mb: 1, fontWeight: 500, color: "text.secondary" }}
                >
                  Blood Type
                </Typography>
                <Select
                  value={formData.personalHistory.bloodType}
                  onChange={(e) =>
                    handleChange("personalHistory", "bloodType", e.target.value)
                  }
                  displayEmpty
                  MenuProps={{
                    disableScrollLock: true,
                  }}
                >
                  <MenuItem value="">Select Blood Type</MenuItem>
                  <MenuItem value="A+">A+</MenuItem>
                  <MenuItem value="A-">A-</MenuItem>
                  <MenuItem value="B+">B+</MenuItem>
                  <MenuItem value="B-">B-</MenuItem>
                  <MenuItem value="AB+">AB+</MenuItem>
                  <MenuItem value="AB-">AB-</MenuItem>
                  <MenuItem value="O+">O+</MenuItem>
                  <MenuItem value="O-">O-</MenuItem>
                </Select>
              </FormControl>

              <FormControl sx={styles.fieldLifestyle}>
                <Typography
                  variant="body2"
                  sx={{ mb: 1, fontWeight: 500, color: "text.secondary" }}
                >
                  Smoking Habits
                </Typography>
                <Select
                  value={formData.personalHistory.smoking}
                  onChange={(e) =>
                    handleChange("personalHistory", "smoking", e.target.value)
                  }
                  MenuProps={{
                    disableScrollLock: true,
                  }}
                >
                  <MenuItem value="Never">Never</MenuItem>
                  <MenuItem value="Occasionally">Occasionally</MenuItem>
                  <MenuItem value="Often">Often</MenuItem>
                </Select>
              </FormControl>

              <FormControl sx={styles.fieldLifestyle}>
                <Typography
                  variant="body2"
                  sx={{ mb: 1, fontWeight: 500, color: "text.secondary" }}
                >
                  Alcohol Consumption
                </Typography>
                <Select
                  value={formData.personalHistory.alcohol}
                  onChange={(e) =>
                    handleChange("personalHistory", "alcohol", e.target.value)
                  }
                  MenuProps={{
                    disableScrollLock: true,
                  }}
                >
                  <MenuItem value="Never">Never</MenuItem>
                  <MenuItem value="Occasionally">Occasionally</MenuItem>
                  <MenuItem value="Often">Often</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>

          {/* Allergies - Full width */}
          <Box sx={styles.fieldFull}>
            <Typography
              variant="body2"
              sx={{ mb: 1, fontWeight: 500, color: "text.secondary" }}
            >
              Allergies
            </Typography>
            <Box
              sx={{
                border: "1px solid #e5e7eb",
                borderRadius: 1,
                p: 2,
                minHeight: 64,
                display: "flex",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 1.2,
                "&:focus-within": {
                  borderColor: theme.palette.primary.main,
                },
              }}
            >
              {formData.personalHistory.allergies.map((allergy, index) => (
                <Chip
                  key={index}
                  label={allergy}
                  onDelete={() => handleRemoveAllergy(index)}
                  sx={{
                    backgroundColor: theme.palette.secondary.main,
                    color: theme.palette.primary.main,
                    fontWeight: 500,
                    "& .MuiChip-deleteIcon": {
                      color: theme.palette.primary.main,
                    },
                  }}
                />
              ))}

              <input
                value={allergyInput}
                onChange={(e) => setAllergyInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddAllergy();
                  }
                }}
                placeholder="Type allergy and press Enter..."
                style={{
                  border: "none",
                  outline: "none",
                  flexGrow: 1,
                  minWidth: 160,
                  fontSize: 14,
                  color: "#6b7280",
                }}
              />
            </Box>
          </Box>

          {/* Medications - Full width */}
          <Box sx={styles.fieldFull}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Current Medications"
              value={formData.personalHistory.medications}
              onChange={(e) =>
                handleChange("personalHistory", "medications", e.target.value)
              }
            />
          </Box>
        </SectionCard>

        {/* TREATMENTS */}
        <SectionCard title="Treatment History">
          <Box sx={styles.fieldGroupRadio}>
            <Box sx={styles.fieldRadio}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Hormonal Therapy History
              </Typography>
              <RadioGroup
                value={formData.treatments.hormonalTherapyHistory}
                onChange={(e) =>
                  handleChange("treatments", "hormonalTherapyHistory", e.target.value)
                }
              >
                <FormControlLabel value="Yes" control={<Radio />} label="Yes" />
                <FormControlLabel value="No" control={<Radio />} label="No" />
              </RadioGroup>
            </Box>

            <Box sx={styles.fieldRadio}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Previous Fertility Treatments
              </Typography>
              <RadioGroup
                value={formData.treatments.fertilityTreatmentsBefore}
                onChange={(e) =>
                  handleChange("treatments", "fertilityTreatmentsBefore", e.target.value)
                }
              >
                <FormControlLabel value="Yes" control={<Radio />} label="Yes" />
                <FormControlLabel value="No" control={<Radio />} label="No" />
              </RadioGroup>
            </Box>
          </Box>

          {formData.treatments.fertilityTreatmentsBefore === "Yes" && (
            <Box sx={styles.fieldFull}>
              <TextField
                fullWidth
                label="Fertility Treatment Type"
                value={formData.treatments.fertilityTreatmentType}
                onChange={(e) =>
                  handleChange("treatments", "fertilityTreatmentType", e.target.value)
                }
              />
            </Box>
          )}
        </SectionCard>

        {/* SURGERY */}
        <SectionCard title="Surgical History">
          <Box sx={styles.fieldRadio}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Pelvic Surgery History
            </Typography>
            <RadioGroup
              value={formData.surgeries.pelvicSurgeryHistory}
              onChange={(e) =>
                handleChange("surgeries", "pelvicSurgeryHistory", e.target.value)
              }
            >
              <FormControlLabel value="Yes" control={<Radio />} label="Yes" />
              <FormControlLabel value="No" control={<Radio />} label="No" />
            </RadioGroup>
          </Box>

          {formData.surgeries.pelvicSurgeryHistory === "Yes" && (
            <Box sx={styles.fieldFull}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Surgery Details"
                value={formData.surgeries.surgeryDetail}
                onChange={(e) =>
                  handleChange("surgeries", "surgeryDetail", e.target.value)
                }
              />
            </Box>
          )}
        </SectionCard>

        {/* FAMILY */}
        <SectionCard title="Family History">
          <Box sx={styles.fieldGroupRadio}>
            <Box sx={styles.fieldRadio}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Genetic Diseases
              </Typography>
              <RadioGroup
                value={formData.familyHistory.geneticDiseases}
                onChange={(e) =>
                  handleChange("familyHistory", "geneticDiseases", e.target.value)
                }
              >
                <FormControlLabel value="Yes" control={<Radio />} label="Yes" />
                <FormControlLabel value="No" control={<Radio />} label="No" />
              </RadioGroup>
            </Box>

            <Box sx={styles.fieldRadio}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Family Fertility Issues
              </Typography>
              <RadioGroup
                value={formData.familyHistory.familyFertilityIssues}
                onChange={(e) =>
                  handleChange("familyHistory", "familyFertilityIssues", e.target.value)
                }
              >
                <FormControlLabel value="Yes" control={<Radio />} label="Yes" />
                <FormControlLabel value="No" control={<Radio />} label="No" />
              </RadioGroup>
            </Box>
          </Box>

          <Box sx={styles.fieldFull}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Additional Notes"
              value={formData.familyHistory.notes}
              onChange={(e) =>
                handleChange("familyHistory", "notes", e.target.value)
              }
            />
          </Box>
        </SectionCard>

        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 4 }}>
          <Button
            type="submit"
            variant="contained"
            disabled={saving}
            sx={{ 
              px: 4, 
              py: 1.5, 
              textTransform: "none",
              backgroundColor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
              "&:hover": {
                backgroundColor: theme.palette.primary.dark,
              },
              "&:disabled": {
                backgroundColor: theme.palette.action.disabledBackground,
                color: theme.palette.action.disabled,
              },
            }}
          >
            {saving ? "Saving..." : "Save Medical History"}
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
