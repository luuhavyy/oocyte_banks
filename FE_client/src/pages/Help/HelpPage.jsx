import { Box, Container, Typography, Card, CardContent, Accordion, AccordionSummary, AccordionDetails, Grid, Stepper, Step, StepLabel, useTheme } from "@mui/material";
import { useSelector } from "react-redux";
import { getSubroleFromToken } from "../../utils/jwtUtils";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import FavoriteIcon from "@mui/icons-material/Favorite";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import SecurityIcon from "@mui/icons-material/Security";
import HelpIcon from "@mui/icons-material/Help";
import FamilyRestroomIcon from "@mui/icons-material/FamilyRestroom";
import PsychologyIcon from "@mui/icons-material/Psychology";

export default function HelpPage() {
  const theme = useTheme();
  const { user, token } = useSelector((s) => s.auth);
  const userSubrole = user?.subrole || getSubroleFromToken(token);
  const isDonor = userSubrole === "donor";

  const donorEligibility = [
    {
      icon: <CheckCircleIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />,
      title: "Age Requirement",
      description: "Women between 21-35 years old are eligible. This age range ensures optimal egg quality and donor safety.",
    },
    {
      icon: <LocalHospitalIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />,
      title: "Health Status",
      description: "Must be in good general health with no significant medical conditions. Comprehensive medical screening required.",
    },
    {
      icon: <FavoriteIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />,
      title: "Regular Cycles",
      description: "Candidates should have regular, predictable menstrual cycles indicating healthy reproductive function.",
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />,
      title: "No Genetic Disorders",
      description: "No known genetic disorders or significant family history that could affect egg quality or recipient health.",
    },
  ];

  const recipientEligibility = [
    {
      icon: <CheckCircleIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />,
      title: "Medical Evaluation",
      description: "Complete medical assessment to determine eligibility and ensure safe egg donation process.",
    },
    {
      icon: <FamilyRestroomIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />,
      title: "Family Planning",
      description: "Recipients should be ready for the emotional and physical commitment of building a family through egg donation.",
    },
    {
      icon: <PsychologyIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />,
      title: "Counseling Support",
      description: "Psychological counseling available to help navigate the emotional aspects of using donor eggs.",
    },
    {
      icon: <LocalHospitalIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />,
      title: "Partner Screening",
      description: "If applicable, partner screening may be required to ensure overall reproductive health and compatibility.",
    },
  ];

  const donorProcessSteps = [
    {
      step: 1,
      title: "Initial Registration",
      description: "Create your account and complete your profile with basic personal information. This is the first step in your journey to help build families.",
    },
    {
      step: 2,
      title: "Medical History Review",
      description: "Complete a detailed medical history form covering personal health, treatments, surgeries, and family medical background. Our team reviews this information carefully.",
    },
    {
      step: 3,
      title: "Medical Screening",
      description: "Undergo comprehensive medical and psychological evaluations, including blood tests, genetic screening, and counseling sessions to ensure your safety and eligibility.",
    },
    {
      step: 4,
      title: "Hormonal Stimulation",
      description: "If approved, you'll receive carefully monitored hormonal medications to stimulate egg production. Regular monitoring appointments ensure your safety throughout this process.",
    },
    {
      step: 5,
      title: "Egg Retrieval",
      description: "The egg retrieval procedure is performed under sedation by experienced fertility specialists. The process typically takes 20-30 minutes and is minimally invasive.",
    },
    {
      step: 6,
      title: "Recovery & Follow-up",
      description: "After retrieval, you'll receive post-procedure care instructions and follow-up appointments. Most donors resume normal activities within 1-2 days.",
    },
  ];

  const recipientProcessSteps = [
    {
      step: 1,
      title: "Initial Consultation",
      description: "Meet with our fertility specialists to discuss your options, understand the process, and determine if egg donation is right for you.",
    },
    {
      step: 2,
      title: "Medical Evaluation",
      description: "Complete comprehensive medical and fertility assessments to ensure you're a good candidate for egg donation treatment.",
    },
    {
      step: 3,
      title: "Donor Selection",
      description: "Review donor profiles and select a compatible donor. Our team provides detailed information to help you make an informed decision.",
    },
    {
      step: 4,
      title: "Synchronization & Preparation",
      description: "Your cycle will be synchronized with the donor's cycle. You'll receive medications to prepare your uterus for embryo transfer.",
    },
    {
      step: 5,
      title: "Fertilization & Transfer",
      description: "Donor eggs are fertilized and embryos are transferred to your uterus. The procedure is minimally invasive and typically painless.",
    },
    {
      step: 6,
      title: "Pregnancy Testing & Support",
      description: "After transfer, you'll undergo pregnancy testing and receive ongoing support throughout your pregnancy journey.",
    },
  ];

  const donorFaqs = [
    {
      question: "What are the eligibility requirements to become an egg donor?",
      answer: "To become an egg donor, you must be between 21-35 years old, in good general health, have regular menstrual cycles, and have no significant genetic disorders or family history of genetic conditions. All candidates undergo thorough medical and psychological screening.",
    },
    {
      question: "How long does the entire egg donation process take?",
      answer: "The complete process typically takes 4-6 weeks from initial registration through medical screening, hormonal stimulation, and egg retrieval. The actual time commitment varies based on your cycle and our scheduling.",
    },
    {
      question: "Is egg donation painful or dangerous?",
      answer: "Egg donation is a well-established medical procedure with minimal risks when performed by qualified professionals. The retrieval is done under sedation, so you won't feel pain during the procedure. Some donors experience mild discomfort similar to menstrual cramps afterward, which typically resolves within 1-2 days.",
    },
    {
      question: "Will donating eggs affect my future fertility?",
      answer: "No, egg donation does not affect your future fertility. Women are born with hundreds of thousands of eggs, and only a small number are retrieved during donation. Your body naturally produces new eggs each cycle, and the donation process does not deplete your egg supply.",
    },
    {
      question: "How is my privacy protected during the donation process?",
      answer: "We maintain strict confidentiality protocols. Your personal information is protected and only accessible to authorized medical staff. All medical records are securely stored, and your identity is kept confidential from recipients unless you choose otherwise.",
    },
    {
      question: "What compensation do egg donors receive?",
      answer: "Egg donors receive fair compensation for their time, commitment, and the physical demands of the process. Compensation amounts vary and are discussed during the initial consultation. All compensation is provided in accordance with medical and legal guidelines.",
    },
    {
      question: "Can I donate eggs more than once?",
      answer: "Yes, many donors choose to donate multiple times. However, each donation requires a new medical screening to ensure continued eligibility and safety. There are typically recommended intervals between donations to allow your body to recover fully.",
    },
    {
      question: "What happens to my eggs after retrieval?",
      answer: "After retrieval, your eggs are immediately evaluated using advanced AI technology to assess quality. Healthy eggs can be frozen for future use or matched with recipients. The eggs are handled with the utmost care and stored in state-of-the-art facilities.",
    },
    {
      question: "Do I need to take time off work for the donation process?",
      answer: "Most donors can continue their normal activities during the stimulation phase, though you'll need to attend monitoring appointments. You'll need 1-2 days off for the retrieval procedure and immediate recovery. We work with you to schedule appointments that fit your schedule.",
    },
    {
      question: "What support is available during the donation process?",
      answer: "Our team provides comprehensive support throughout your journey. You'll have access to medical professionals, counselors, and a dedicated coordinator who will guide you through each step, answer your questions, and ensure your comfort and safety.",
    },
  ];

  const recipientFaqs = [
    {
      question: "Who can benefit from egg donation?",
      answer: "Egg donation is suitable for women who cannot use their own eggs due to age, medical conditions, genetic disorders, or previous unsuccessful fertility treatments. It's also an option for same-sex couples and single individuals wanting to build a family.",
    },
    {
      question: "How do I select an egg donor?",
      answer: "You'll have access to detailed donor profiles including medical history, physical characteristics, education, and personal information. Our team helps you find a compatible donor based on your preferences and medical requirements.",
    },
    {
      question: "What is the success rate of egg donation?",
      answer: "Egg donation typically has higher success rates than using your own eggs, especially for women over 40. Success rates vary based on individual circumstances, but our advanced AI evaluation ensures only high-quality eggs are used.",
    },
    {
      question: "How long does the egg donation process take for recipients?",
      answer: "The process typically takes 2-3 months from donor selection through embryo transfer. This includes donor screening, cycle synchronization, fertilization, and transfer. Timing may vary based on individual circumstances.",
    },
    {
      question: "Will the child be genetically related to me?",
      answer: "The child will be genetically related to the donor and your partner (if applicable), but not to you. However, you will carry and give birth to the child, creating a strong biological and emotional bond through pregnancy.",
    },
    {
      question: "What are the costs involved in egg donation?",
      answer: "Costs include donor compensation, medical procedures, medications, and facility fees. We provide transparent pricing and work with you to understand all costs upfront. Some insurance plans may cover portions of the treatment.",
    },
    {
      question: "Is egg donation safe for recipients?",
      answer: "Yes, egg donation is a well-established and safe procedure. All donors undergo rigorous medical and genetic screening. The transfer procedure is minimally invasive with minimal risks when performed by experienced specialists.",
    },
    {
      question: "Can I use frozen donor eggs?",
      answer: "Yes, we offer both fresh and frozen donor eggs. Frozen eggs provide more flexibility in timing and donor selection. Our advanced freezing techniques ensure high success rates comparable to fresh eggs.",
    },
    {
      question: "What support is available during the process?",
      answer: "Our team provides comprehensive support including medical care, counseling services, and emotional support throughout your journey. We're here to answer questions and guide you through every step.",
    },
    {
      question: "What happens if the first attempt is unsuccessful?",
      answer: "If the first transfer is unsuccessful, we'll discuss options including additional attempts with the same or different donor. Many recipients achieve success on subsequent attempts, and we're committed to supporting you throughout your journey.",
    },
  ];

  const eligibilityCriteria = isDonor ? donorEligibility : recipientEligibility;
  const processSteps = isDonor ? donorProcessSteps : recipientProcessSteps;
  const faqs = isDonor ? donorFaqs : recipientFaqs;
  const pageTitle = isDonor ? "Donor Help & Support" : "Recipient Help & Support";
  const pageSubtitle = isDonor
    ? "Find answers to common questions and learn about the egg donation process. We're here to support you every step of the way."
    : "Find answers to common questions about receiving donor eggs and building your family. We're here to support you throughout your journey.";
  const processTitle = isDonor ? "The Donation Process" : "The Recipient Process";

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "100%",
        backgroundColor: theme.palette.background.default,
        overflowX: "hidden",
        py: { xs: 4, md: 6 },
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ textAlign: "center", mb: 6 }}>
          <Typography
            variant="h3"
            sx={{
              mb: 2,
              fontWeight: 700,
              color: theme.palette.primary.main,
              fontSize: { xs: "32px", md: "40px" },
            }}
          >
            {pageTitle}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              maxWidth: 700,
              mx: "auto",
              fontSize: { xs: "16px", md: "18px" },
              color: theme.palette.text.secondary,
              lineHeight: 1.7,
            }}
          >
            {pageSubtitle}
          </Typography>
        </Box>

        <Box sx={{ mb: 8 }}>
          <Typography
            variant="h4"
            sx={{
              mb: 4,
              textAlign: "center",
              fontWeight: 600,
              color: theme.palette.primary.main,
              fontSize: { xs: "28px", md: "32px" },
            }}
          >
            Eligibility Requirements
          </Typography>
          <Grid container spacing={4} sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: 4 }}>
            {eligibilityCriteria.map((criterion, index) => (
              <Grid item key={index} sx={{ width: "100%" }} md={6} xs={12} sm={6} lg={6}>
                <Card
                  sx={{
                    width: "100%",
                    height: "100%",
                    minHeight: 220,
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: 2,
                    boxShadow: theme.shadows[2],
                    border: `1px solid ${theme.palette.divider}`,
                    transition: "transform 0.3s, box-shadow 0.3s",
                    "&:hover": {
                      transform: "translateY(-8px)",
                      boxShadow: theme.shadows[4],
                    },
                  }}
                >
                  <CardContent
                    sx={{
                      p: 3,
                      textAlign: "center",
                      display: "flex",
                      flexDirection: "column",
                      flexGrow: 1,
                    }}
                  >
                    <Box sx={{ mb: 1 }}>{criterion.icon}</Box>
                    <Typography
                      variant="h6"
                      sx={{ mb: 1, fontWeight: 600, color: theme.palette.text.primary }}
                    >
                      {criterion.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: theme.palette.text.secondary, lineHeight: 1.7, flexGrow: 1 }}
                    >
                      {criterion.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Box sx={{ mb: 8, backgroundColor: theme.palette.background.paper, p: { xs: 3, md: 6 }, borderRadius: 2 }}>
          <Typography
            variant="h4"
            sx={{
              mb: 4,
              textAlign: "center",
              fontWeight: 600,
              color: theme.palette.primary.main,
              fontSize: { xs: "28px", md: "32px" },
            }}
          >
            {processTitle}
          </Typography>
          <Stepper
            orientation="vertical"
            sx={{
              maxWidth: 800,
              mx: "auto",
              "& .MuiStepLabel-root .Mui-completed": {
                color: theme.palette.primary.main,
              },
              "& .MuiStepLabel-label.Mui-completed.MuiStepLabel-alternativeLabel": {
                color: theme.palette.primary.main,
              },
              "& .MuiStepLabel-root .Mui-active": {
                color: theme.palette.primary.light,
              },
              "& .MuiStepLabel-label.Mui-active.MuiStepLabel-alternativeLabel": {
                color: theme.palette.primary.main,
              },
              "& .MuiStepLabel-root .Mui-active .MuiStepIcon-text": {
                fill: theme.palette.primary.main,
              },
              "& .MuiStepConnector-line": {
                borderColor: theme.palette.primary.light,
              },
            }}
          >
            {processSteps.map((step) => (
              <Step key={step.step}>
                <StepLabel
                  StepIconComponent={() => (
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        bgcolor: theme.palette.primary.light,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: theme.palette.primary.main,
                        fontWeight: 600,
                        fontSize: "18px",
                      }}
                    >
                      {step.step}
                    </Box>
                  )}
                >
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, color: theme.palette.text.primary, ml: 2 }}
                  >
                    {step.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: theme.palette.text.secondary, ml: 2, lineHeight: 1.7 }}
                  >
                    {step.description}
                  </Typography>
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        <Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4, justifyContent: "center" }}>
            <HelpIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />
            <Typography
              variant="h4"
              sx={{
                fontWeight: 600,
                color: theme.palette.primary.main,
                fontSize: { xs: "28px", md: "32px" },
              }}
            >
              Frequently Asked Questions
            </Typography>
          </Box>
          <Box sx={{ maxWidth: 900, mx: "auto" }}>
            {faqs.map((faq, index) => (
              <Accordion
                key={index}
                sx={{
                  mb: 2,
                  borderRadius: 2,
                  boxShadow: theme.shadows[1],
                  border: `1px solid ${theme.palette.divider}`,
                  "&:before": { display: "none" },
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon sx={{ color: theme.palette.primary.main }} />}
                  aria-controls={`panel${index}-content`}
                  id={`panel${index}-header`}
                >
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 500, color: theme.palette.text.primary }}
                  >
                    {faq.question}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography
                    variant="body1"
                    sx={{ color: theme.palette.text.secondary, lineHeight: 1.7 }}
                  >
                    {faq.answer}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        </Box>

        <Box
          sx={{
            mt: 8,
            textAlign: "center",
            p: { xs: 4, md: 6 },
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            borderRadius: 2,
            color: theme.palette.primary.contrastText,
          }}
        >
          <Typography
            variant="h5"
            sx={{ mb: 2, fontWeight: 600, color: theme.palette.primary.contrastText }}
          >
            Still Have Questions?
          </Typography>
          <Typography
            variant="body1"
            sx={{ mb: 3, color: theme.palette.primary.light, maxWidth: 600, mx: "auto" }}
          >
            Our support team is here to help. Contact us for personalized
            assistance with any questions or concerns about the {isDonor ? "egg donation" : "egg recipient"} process.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
