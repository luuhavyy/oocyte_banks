import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { store } from "./app/store";
import { adminTheme } from "./theme/adminTheme";
import AdminRoutes from "./routes/AdminRoutes";
import "./styles/adminStyles.css";

import { Box } from "@mui/material";

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={adminTheme}>
        <CssBaseline />
        <BrowserRouter>
          <Box
            sx={{
              width: "100%",
              maxWidth: "100%",
              minHeight: "100vh",
              backgroundColor: "#FFFFFF",
              overflowX: "hidden",
              margin: 0,
              padding: 0,
              left: 0,
              right: 0,
            }}
          >
            <AdminRoutes />
          </Box>
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
