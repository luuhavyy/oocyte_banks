import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { Box } from "@mui/material";
import { store } from "./app/store";
import { clientTheme } from "./theme/clientTheme";
import ClientRoutes from "./routes/ClientRoutes";
import "./styles/clientStyles.css";

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={clientTheme}>
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
            <ClientRoutes />
          </Box>
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
