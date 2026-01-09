import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function PublicHeader() {
  const navigate = useNavigate();

  return (
    <AppBar 
      position="fixed" 
      elevation={0}
      sx={{ 
        width: "100%",
        maxWidth: "100%",
        overflow: "hidden",
        left: 0,
        right: 0,
        top: 0,
        zIndex: 1100,
        margin: 0,
        padding: 0,
        backgroundColor: "#FFFFFF",
      }}
    >
      <Toolbar 
        sx={{ 
          display: "flex", 
          justifyContent: "space-between", 
          px: { xs: 2, sm: 3 },
          width: "100%",
          maxWidth: "100%",
          overflow: "hidden",
          margin: 0,
          minHeight: "70px !important",
        }}
      >
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 600, 
            color: '#FF6B9D',
            cursor: 'pointer'
          }}
          onClick={() => navigate("/")}
        >
          CRADLE Egg Bank
        </Typography>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button 
            variant="text" 
            onClick={() => navigate("/register")}
            sx={{ color: '#C2185B', fontWeight: 500 }}
          >
            Register
          </Button>
          <Button 
            variant="contained" 
            onClick={() => navigate("/login")}
            sx={{ 
              backgroundColor: '#C2185B',
              '&:hover': { backgroundColor: '#E85A8A' }
            }}
          >
            Login
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

