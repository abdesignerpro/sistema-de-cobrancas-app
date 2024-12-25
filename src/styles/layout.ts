import { Components, Theme } from '@mui/material/styles';

export const layoutComponents: Components<Theme> = {
  MuiContainer: {
    styleOverrides: {
      root: {
        padding: '16px !important',
      },
    },
  },
  MuiDrawer: {
    styleOverrides: {
      paper: {
        borderRight: 'none',
        boxShadow: '2px 0 4px rgba(0,0,0,0.1)',
        width: '200px !important',
      },
    },
  },
  MuiGrid: {
    defaultProps: {
      spacing: 2,
    },
    styleOverrides: {
      root: {
        marginTop: '0 !important',
        width: '100% !important',
      },
      item: {
        paddingTop: '8px !important',
        paddingLeft: '8px !important',
      },
    },
  },
};
