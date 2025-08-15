import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#FF85A1', // 귀여운 핑크
      light: '#FFA5B9',
      dark: '#FF6B88',
    },
    secondary: {
      main: '#85C1E9', // 부드러운 하늘색
      light: '#AED6F1',
      dark: '#5DADE2',
    },
    warning: {
      main: '#FFD93D', // 밝은 노란색
      light: '#FFE169',
      dark: '#FFC300',
    },
    error: {
      main: '#FF6B6B', // 부드러운 빨간색
      light: '#FF8585',
      dark: '#FF5252',
    },
    background: {
      default: '#FFF5F7',
      paper: '#FFFFFF',
    },
  },
  typography: {
    fontFamily: [
      'Pretendard',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h4: {
      fontWeight: 700,
    },
    h5: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 12,
          fontWeight: 600,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(45deg, #FF85A1 30%, #FF9EBA 90%)',
        },
        containedSecondary: {
          background: 'linear-gradient(45deg, #85C1E9 30%, #AED6F1 90%)',
        },
        containedWarning: {
          background: 'linear-gradient(45deg, #FFD93D 30%, #FFE169 90%)',
          color: '#444444',
        },
        containedError: {
          background: 'linear-gradient(45deg, #FF6B6B 30%, #FF8585 90%)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 600,
        },
      },
    },
  },
}); 