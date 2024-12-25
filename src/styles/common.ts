import { Components, Theme } from '@mui/material/styles';

export const commonComponents: Components<Theme> = {
  MuiButton: {
    styleOverrides: {
      root: {
        textTransform: 'none',
        borderRadius: 4,
        padding: '8px 16px',
      },
    },
    defaultProps: {
      size: 'small',
    },
  },
  MuiTextField: {
    defaultProps: {
      size: 'small',
      margin: 'dense',
    },
    styleOverrides: {
      root: {
        marginBottom: '8px',
        '& .MuiOutlinedInput-root': {
          borderRadius: 4,
        },
      },
    },
  },
  MuiFormControl: {
    defaultProps: {
      size: 'small',
      margin: 'dense',
    },
    styleOverrides: {
      root: {
        marginBottom: '8px',
      },
    },
  },
};
