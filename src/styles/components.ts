import { Components, Theme } from '@mui/material/styles';

export const visualComponents: Components<Theme> = {
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      },
    },
  },
  MuiList: {
    styleOverrides: {
      root: {
        padding: '8px',
      },
    },
  },
  MuiListItem: {
    styleOverrides: {
      root: {
        borderRadius: 4,
        marginBottom: '4px',
        padding: '8px 16px',
      },
    },
  },
  MuiTypography: {
    styleOverrides: {
      h4: {
        fontSize: '1.5rem',
        fontWeight: 600,
        marginBottom: '16px',
      },
      h5: {
        fontSize: '1.25rem',
        fontWeight: 600,
        marginBottom: '16px',
      },
      h6: {
        fontSize: '1rem',
        fontWeight: 600,
        marginBottom: '16px',
      },
    },
  },
};
