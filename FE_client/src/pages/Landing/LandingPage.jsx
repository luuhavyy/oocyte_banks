import { Box, Typography, Button, Container, Card, CardContent, Stepper, Step, StepLabel, Accordion, AccordionSummary, AccordionDetails, Grid, useTheme } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FamilyRestroomIcon from "@mui/icons-material/FamilyRestroom";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

export default function LandingPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { token } = useSelector((s) => s.auth);

  useEffect(() => {
    if (token) {
      navigate("/home", { replace: true });
    }
  }, [token, navigate]);
  
  const steps = [
    "Register & Create Profile",
    "Complete Medical History",
    "Schedule Appointment",
    "Egg Retrieval Process",
    "AI Evaluation & Results"
  ];

  const faqs = [
    {
      question: "What is egg donation?",
      answer: "Egg donation is a process where a healthy woman donates her eggs to help another woman or couple have a child. It's a generous act that gives hope to families struggling with infertility."
    },
    {
      question: "Who can become an egg donor?",
      answer: "Healthy women between the ages of 21-35, with no significant medical history, can apply to become egg donors. All candidates undergo thorough medical and psychological screening to ensure safety."
    },
    {
      question: "Is egg donation safe?",
      answer: "Yes, egg donation is a well-established medical procedure with minimal risks when performed by qualified professionals. All donors receive comprehensive medical care and monitoring throughout the process."
    },
    {
      question: "What happens after egg retrieval?",
      answer: "After retrieval, eggs are evaluated using advanced AI technology to determine quality. Healthy eggs can be frozen for future use or matched with recipients, giving families the chance to have children."
    },
    {
      question: "How long does the process take?",
      answer: "The entire process typically takes 4-6 weeks, from initial registration through medical screening, stimulation, and retrieval. Our team guides you through every step."
    },
    {
      question: "Will my information be kept confidential?",
      answer: "Absolutely. We maintain strict confidentiality protocols. Your personal information is protected, and all medical records are securely stored and only accessible to authorized medical staff."
    }
  ];

  return (
    <Box 
      sx={{ 
        width: "100%", 
        maxWidth: "100%", 
        overflowX: "hidden",
        margin: 0,
        padding: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
      }}
    >
      {/* Hero Section */}
      <Box
        sx={{
          width: "100%",
          maxWidth: "100%",
          minHeight: { xs: "70vh", md: "80vh" },
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          px: { xs: 3, sm: 4, md: 6 },
          py: { xs: 6, md: 10 },
          background: `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.secondary.light} 100%)`,
          margin: 0,
        }}
      >
        <Typography 
          variant="h2" 
          sx={{ 
            mb: 3,
            maxWidth: "900px",
            fontWeight: 700,
            color: theme.palette.primary.main,
            fontSize: { xs: "32px", sm: "48px", md: "56px" },
            lineHeight: 1.2,
          }}
        >
          CRADLE Egg Bank
        </Typography>
        
        <Typography 
          variant="h4" 
          sx={{ 
            mb: 4,
            maxWidth: "800px",
            fontWeight: 500,
            color: theme.palette.text.primary,
            fontSize: { xs: "20px", sm: "28px", md: "32px" },
            lineHeight: 1.4,
          }}
        >
          Building Families, One Egg at a Time
        </Typography>

        <Typography 
          variant="body1" 
          sx={{ 
            maxWidth: 700, 
            mx: "auto", 
            mb: 5,
            fontSize: { xs: "16px", md: "18px" },
            lineHeight: 1.7,
            color: theme.palette.text.secondary,
            width: "100%",
            textAlign: "center",
          }}
        >
          Our platform connects generous egg donors with hopeful recipients, 
          using advanced AI technology to ensure the highest quality standards. 
          Every connection brings someone closer to the dream of starting a family.
        </Typography>

        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", justifyContent: "center" }}>
          <Button 
            variant="contained" 
            onClick={() => navigate("/register")}
            size="large"
            sx={{ 
              px: 5,
              py: 1.8,
              fontSize: "16px",
              fontWeight: 600,
              backgroundColor: theme.palette.primary.buttonmain,
                '&:hover': { backgroundColor: theme.palette.primary.buttonlight },
            }}
          >
            Get Started
          </Button>
          <Button 
            variant="outlined" 
            color="primary" 
            onClick={() => navigate("/login")}
            size="large"
            sx={{ 
              px: 5,
              py: 1.8,
              fontSize: "16px",
              fontWeight: 600,
              borderColor: '#C2185B',
                color: '#C2185B',
            }}
          >
            Login
          </Button>
        </Box>
      </Box>

      {/* Info Cards Section */}
      <Box
        sx={{
          width: "100%",
          maxWidth: "100%",
          py: { xs: 6, md: 10 },
          px: { xs: 3, sm: 4, md: 6 },
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Container 
          maxWidth="lg" 
          sx={{ 
            width: "100%",
            maxWidth: "100%",
            margin: "0 auto",
          }}
        >
          <Typography 
            variant="h3" 
            sx={{ 
              textAlign: "center", 
              mb: 6,
              fontWeight: 600,
              color: theme.palette.primary.main,
              fontSize: { xs: "28px", md: "40px" },
            }}
          >
            Why Choose CRADLE Egg Bank?
          </Typography>

        <Grid container sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 4 }} spacing={4}>
          <Grid item xs={12} md={4}>
            <Card 
              sx={{ 
                height: "100%",
                borderRadius: 2,
                boxShadow: "0px 4px 12px rgba(194, 24, 91, 0.1)",
                border: `1px solid ${theme.palette.divider}`,
                transition: "transform 0.3s, box-shadow 0.3s",
                "&:hover": {
                  transform: "translateY(-8px)",
                  boxShadow: "0px 8px 24px rgba(194, 24, 91, 0.15)",
                }
              }}
            >
              <CardContent sx={{ p: 4, textAlign: "center" }}>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    backgroundColor: theme.palette.secondary.light,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mx: "auto",
                    mb: 3,
                  }}
                >
                  <FavoriteIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />
                </Box>
                <Typography variant="h5" sx={{ mb: 2, fontWeight: 600, color: theme.palette.text.primary }}>
                  For Donors
                </Typography>
                <Typography variant="body1" sx={{ color: theme.palette.text.secondary, lineHeight: 1.7 }}>
                  Make a meaningful difference in someone's life. Our comprehensive care ensures 
                  your safety and comfort throughout the donation process, with full medical 
                  support and fair compensation.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card 
              sx={{ 
                height: "100%",
                borderRadius: 2,
                boxShadow: "0px 4px 12px rgba(194, 24, 91, 0.1)",
                border: `1px solid ${theme.palette.divider}`,
                transition: "transform 0.3s, box-shadow 0.3s",
                "&:hover": {
                  transform: "translateY(-8px)",
                  boxShadow: "0px 8px 24px rgba(194, 24, 91, 0.15)",
                }
              }}
            >
              <CardContent sx={{ p: 4, textAlign: "center" }}>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    backgroundColor: theme.palette.secondary.light,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mx: "auto",
                    mb: 3,
                  }}
                >
                  <FamilyRestroomIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />
                </Box>
                <Typography variant="h5" sx={{ mb: 2, fontWeight: 600, color: theme.palette.text.primary }}>
                  For Recipients
                </Typography>
                <Typography variant="body1" sx={{ color: theme.palette.text.secondary, lineHeight: 1.7 }}>
                  Your journey to parenthood starts here. We use advanced AI technology to 
                  evaluate egg quality, ensuring the best possible outcomes for building 
                  your family.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card 
              sx={{ 
                height: "100%",
                borderRadius: 2,
                boxShadow: "0px 4px 12px rgba(194, 24, 91, 0.1)",
                border: `1px solid ${theme.palette.divider}`,
                transition: "transform 0.3s, box-shadow 0.3s",
                "&:hover": {
                  transform: "translateY(-8px)",
                  boxShadow: "0px 8px 24px rgba(194, 24, 91, 0.15)",
                }
              }}
            >
              <CardContent sx={{ p: 4, textAlign: "center" }}>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    backgroundColor: theme.palette.secondary.light,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mx: "auto",
                    mb: 3,
                  }}
                >
                  <LocalHospitalIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />
                </Box>
                <Typography variant="h5" sx={{ mb: 2, fontWeight: 600, color: theme.palette.text.primary }}>
                  Advanced Technology
                </Typography>
                <Typography variant="body1" sx={{ color: theme.palette.text.secondary, lineHeight: 1.7 }}>
                  Our AI-powered evaluation system provides accurate, real-time assessment 
                  of egg quality, giving you confidence and transparency throughout 
                  your journey.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        </Container>
      </Box>

      {/* How It Works Section */}
      <Box sx={{ backgroundColor: theme.palette.background.paper, py: { xs: 6, md: 10 }, width: "100%", maxWidth: "100%", overflowX: "hidden", display: "flex", justifyContent: "center" }}>
        <Container 
          maxWidth="lg" 
          sx={{ 
            px: { xs: 3, sm: 4, md: 6 },
            width: "100%",
            maxWidth: "100%",
            margin: "0 auto",
          }}
        >
          <Typography 
            variant="h3" 
            sx={{ 
              textAlign: "center", 
              mb: 6,
              fontWeight: 600,
              color: theme.palette.primary.main,
              fontSize: { xs: "28px", md: "40px" },
            }}
          >
            How It Works
          </Typography>

          <Stepper 
            orientation="vertical" 
            sx={{ 
              "& .MuiStepLabel-root": {
                "& .MuiStepLabel-label": {
                  fontSize: "16px",
                  fontWeight: 500,
                  color: theme.palette.text.primary,
                }
              },
              "& .MuiStepIcon-root": {
                color: theme.palette.primary.light,
                "&.Mui-active": {
                  color: theme.palette.primary.main,
                },
                "&.Mui-completed": {
                  color: theme.palette.primary.main,
                },
                fontSize: "32px",
              },
              "& .MuiStepConnector-line": {
                borderColor: theme.palette.primary.light,
                borderWidth: 2,
              }
            }}
          >
            {steps.map((label, index) => (
              <Step key={label} active={true} completed={index < steps.length}>
                <StepLabel 
                  StepIconComponent={() => (
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        backgroundColor: index < steps.length ? theme.palette.primary.main : theme.palette.secondary.main,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: theme.palette.primary.contrastText,
                        fontWeight: 600,
                        fontSize: "18px",
                      }}
                    >
                      {index + 1}
                    </Box>
                  )}
                >
                  {label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Container>
      </Box>

      {/* FAQ Section */}
      <Box sx={{ backgroundColor: theme.palette.background.default, py: { xs: 6, md: 10 }, width: "100%", maxWidth: "100%", overflowX: "hidden", display: "flex", justifyContent: "center" }}>
        <Container 
          maxWidth="md" 
          sx={{ 
            px: { xs: 3, sm: 4, md: 6 },
            width: "100%",
            maxWidth: "100%",
            margin: "0 auto",
          }}
        >
          <Typography 
            variant="h3" 
            sx={{ 
              textAlign: "center", 
              mb: 6,
              fontWeight: 600,
              color: theme.palette.primary.main,
              fontSize: { xs: "28px", md: "40px" },
            }}
          >
            Frequently Asked Questions
          </Typography>

          <Box sx={{ width: "100%" }}>
            {faqs.map((faq, index) => (
              <Accordion
                key={index}
                sx={{
                  mb: 2,
                  borderRadius: 2,
                  boxShadow: "0px 2px 8px rgba(194, 24, 91, 0.08)",
                  border: `1px solid ${theme.palette.divider}`,
                  "&:before": {
                    display: "none",
                  },
                  "&.Mui-expanded": {
                    margin: "16px 0",
                  }
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon sx={{ color: theme.palette.primary.main }} />}
                  sx={{
                    "& .MuiAccordionSummary-content": {
                      my: 2,
                    }
                  }}
                >
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 500,
                      color: theme.palette.text.primary,
                      fontSize: "16px",
                    }}
                  >
                    {faq.question}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      color: theme.palette.text.secondary,
                      lineHeight: 1.7,
                      fontSize: "15px",
                    }}
                  >
                    {faq.answer}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          backgroundColor: theme.palette.primary.main,
          py: { xs: 8, md: 12 },
          textAlign: "center",
          width: "100%",
          maxWidth: "100%",
          overflowX: "hidden",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Container 
          maxWidth="md" 
          sx={{ 
            px: { xs: 3, sm: 4, md: 6 },
            width: "100%",
            maxWidth: "100%",
            margin: "0 auto",
          }}
        >
          <Typography 
            variant="h3" 
            sx={{ 
              mb: 3,
              fontWeight: 600,
              fontSize: { xs: "28px", md: "40px" },
              color: theme.palette.primary.contrastText,
            }}
          >
            Ready to Start Your Journey?
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              mb: 5,
              fontSize: { xs: "16px", md: "18px" },
              opacity: 0.95,
              maxWidth: "600px",
              mx: "auto",
              lineHeight: 1.7,
              color: theme.palette.primary.contrastText,
            }}
          >
            Whether you're looking to donate or receive, our compassionate team is here 
            to guide you through every step. Join hundreds of families who have found 
            hope through CRADLE Egg Bank.
          </Typography>
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", justifyContent: "center" }}>
            <Button 
              variant="contained" 
              onClick={() => navigate("/register")}
              size="large"
              sx={{ 
                px: 5,
                py: 1.8,
                fontSize: "16px",
                fontWeight: 600,
                backgroundColor: theme.palette.background.paper,
                color: theme.palette.primary.main,
                "&:hover": {
                  backgroundColor: theme.palette.secondary.light,
                }
              }}
            >
              Get Started Today
            </Button>
            <Button 
              variant="outlined" 
              onClick={() => navigate("/login")}
              size="large"
              sx={{ 
                px: 5,
                py: 1.8,
                fontSize: "16px",
                fontWeight: 600,
                borderColor: theme.palette.primary.contrastText,
                color: theme.palette.primary.contrastText,
                "&:hover": {
                  borderColor: theme.palette.divider,
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                }
              }}
            >
              Already Have an Account?
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
