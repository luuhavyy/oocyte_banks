import { createTheme } from '@mui/material/styles';

/**
 * Material UI Admin Theme Configuration
 * Modern, clean design with soft pink accents
 * Font: Inter (modern, professional)
 */
export const adminTheme = createTheme({
  palette: {
    primary: {
      main: '#C2185B',      // Pink dark - Primary brand color
      buttonmain: '#d41b65ff', 
      light: '#FFB6C1',      // Pink pastel light
      darkLight: '#ffc2d1',
      dark: '#AD1457',
      bright: '#FF6B9D',	
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#FFE5F0',     // Very light pink
      light: '#FFF0F7',    // Almost white pink
      dark: '#FFB3D1',      // Light pink
      contrastText: '#FF6B9D',
    },
    tertiary: {
      main: '#fce7f3',     // Very light pink
      light: '#fff5f9',    // Almost white pink
      dark: '#f9e1f0',      // Light pink
      contrastText: '#C2185B',
    },
    error: {
      main: '#FF6B6B',     // Soft red
      light: '#FFE5E5',
      dark: '#E85A5A',
      contrastText: '#FFFFFF',
    },
    warning: {
      main: '#FFB84D',     // Soft orange
      light: '#FFF4E5',
      dark: '#E8A53D',
      contrastText: '#FFFFFF',
    },
    info: {
      main: '#6B9DFF',      // Soft blue
      light: '#E5F0FF',
      dark: '#5A8AE8',
      contrastText: '#FFFFFF',
    },
    success: {
      main: '#d4f5d8',     // pastel light green
      light: '#e5ffea',
      dark: '#b2e1a3',
      contrastText: '#2d6a10', // dark green text
    },
    background: {
      default: '#FFF0F7',    // Pure white background
      paper: '#FFFFFF',      // White cards
    },
    text: {
      primary: '#1A1A1A',    // Almost black - better readability
      secondary: '#666666',  // Medium gray
      disabled: '#CCCCCC',   // Light gray
    },
    divider: '#f8e4ea',      // Very light pink divider
    action: {
      active: '#FF6B9D',
      hover: 'rgba(255, 107, 157, 0.06)', // Very subtle hover
      selected: '#FFE5F0',
      disabled: '#E0E0E0',
      disabledBackground: 'rgba(0, 0, 0, 0.04)',
    },
  },
  
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
    // Headings - Clean, modern
    h1: {
      fontSize: '48px',
      fontWeight: 700,
      lineHeight: 1.1,
      letterSpacing: '-0.02em',
      color: '#1A1A1A',
    },
    h2: {
      fontSize: '40px',
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '-0.01em',
      color: '#1A1A1A',
    },
    h3: {
      fontSize: '32px',
      fontWeight: 600,
      lineHeight: 1.3,
      letterSpacing: '-0.01em',
      color: '#1A1A1A',
    },
    h4: {
      fontSize: '28px',
      fontWeight: 600,
      lineHeight: 1.4,
      letterSpacing: '0',
      color: '#1A1A1A',
    },
    h5: {
      fontSize: '24px',
      fontWeight: 600,
      lineHeight: 1.5,
      letterSpacing: '0',
      color: '#1A1A1A',
    },
    h6: {
      fontSize: '20px',
      fontWeight: 600,
      lineHeight: 1.5,
      letterSpacing: '0',
      color: '#1A1A1A',
    },
    // Subtitles
    subtitle1: {
      fontSize: '16px',
      fontWeight: 500,
      lineHeight: 1.6,
      letterSpacing: '0',
      color: '#666666',
    },
    subtitle2: {
      fontSize: '14px',
      fontWeight: 500,
      lineHeight: 1.5,
      letterSpacing: '0',
      color: '#666666',
    },
    // Body
    body1: {
      fontSize: '16px',
      fontWeight: 400,
      lineHeight: 1.6,
      letterSpacing: '0',
      color: '#1A1A1A',
    },
    body2: {
      fontSize: '14px',
      fontWeight: 400,
      lineHeight: 1.5,
      letterSpacing: '0',
      color: '#666666',
    },
    // Other
    button: {
      fontSize: '15px',
      fontWeight: 500,
      lineHeight: 1.5,
      letterSpacing: '0',
      textTransform: 'none',
    },
    caption: {
      fontSize: '12px',
      fontWeight: 400,
      lineHeight: 1.5,
      letterSpacing: '0',
      color: '#666666',
    },
    overline: {
      fontSize: '11px',
      fontWeight: 600,
      lineHeight: 1.5,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      color: '#FF6B9D',
    },
  },
  
  spacing: 8,
  
  shape: {
    borderRadius: 8, // Smaller, cleaner radius
  },
  
  shadows: [
    'none',
    // Subtle shadows
    '0px 1px 2px rgba(194, 24, 91, 0.1)',
    '0px 4px 12px rgba(194, 24, 91, 0.1)',
    '0px 4px 8px rgba(194, 24, 91, 0.1)',
    '0px 8px 24px rgba(194, 24, 91, 0.15)',
    '0px 16px 32px rgba(194, 24, 91, 0.15)',
  ],

  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
  
  components: {
    // AppBar
    MuiAppBar: {
      styleOverrides: {
        root: {
          height: 64,
          backgroundColor: '#FFFFFF',
          boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.04)',
          borderBottom: '1px solid #F0F0F0',
          width: '100%',
          maxWidth: '100%',
          margin: 0,
          padding: 0,
          left: 0,
          right: 0,
          borderRadius: 0,
        },
      },
    },
    
    // Drawer
    MuiDrawer: {
      styleOverrides: {
        paper: {
          width: 280,
          backgroundColor: '#FFFFFF',
          borderRight: '1px solid #F0F0F0',
          borderRadius: 0,
        },
      },
    },
    
    // List Item
    MuiListItem: {
      styleOverrides: {
        root: {
          minHeight: 48,
          padding: '8px 16px',
          borderRadius: 8,
          margin: '2px 8px',
          '&.Mui-selected': {
            backgroundColor: '#FFE5F0',
            color: '#FF6B9D',
            fontWeight: 500,
            '&:hover': {
              backgroundColor: '#FFE5F0',
            },
          },
          '&:hover': {
            backgroundColor: '#FFF0F7',
          },
        },
      },
    },
    
    // List Item Icon
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          minWidth: 40,
          color: 'inherit',
        },
      },
    },
    
    // List Item Text
    MuiListItemText: {
      styleOverrides: {
        primary: {
          fontSize: '15px',
          fontWeight: 'inherit',
        },
      },
    },
    
    // Card
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          borderRadius: 8,
          boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.06)',
          border: 'none',
        },
      },
    },
    
    // Button
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 20px',
          textTransform: 'none',
          fontWeight: 500,
          fontSize: '15px',
          letterSpacing: '0',
        },
        contained: {
          backgroundColor: '#FF6B9D',
          color: '#FFFFFF',
          boxShadow: 'none',
          '&:hover': {
            backgroundColor: '#E85A8A',
            boxShadow: '0px 2px 4px rgba(255, 107, 157, 0.3)',
          },
        },
        outlined: {
          borderColor: '#FF6B9D',
          color: '#FF6B9D',
          borderWidth: '1px',
          '&:hover': {
            borderColor: '#E85A8A',
            backgroundColor: '#FFE5F0',
            borderWidth: '1px',
          },
        },
      },
    },
    
    // Paper
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          borderRadius: 8,
        },
      },
    },
    
    // Chip
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 500,
        },
      },
    },
    
    // Table
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            fontWeight: 600,
            color: '#1A1A1A',
            backgroundColor: '#FAFAFA',
          },
        },
      },
    },
  },
});

export default adminTheme;
