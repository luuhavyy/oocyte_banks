import { Box, Typography, useTheme } from "@mui/material";

export default function ClientFooter() {
  const theme = useTheme();
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        width: "100%",
        py: 2,
        px: { xs: 2, sm: 3 },
        backgroundColor: theme.palette.background.default,
        mt: "0",
      }}
    >
      <Typography
        variant="body2"
        align="center"
        sx={{
          color: theme.palette.text.secondary,
          fontSize: "0.875rem",
        }}
      >
        © {currentYear} CRADLE Egg Bank. All rights reserved.
      </Typography>
    </Box>
  );
}

