// ----------------------------------------------------------------------

export default function TextField() {
  return {
    MuiInputBase: {
      styleOverrides: {
        root: {
          height: 44
        },
        multiline: {
          height: 'auto',
        }
      }
    },
    MuiAutocomplete: {
      styleOverrides: {
        input: {
          marginTop: -6
        },
        tag: {
          marginTop: -3
        }
      }
    },
    MuiFormLabel: { 
      styleOverrides: {
        root: {
          lineHeight: '0.9em',
          height: 22
        },
      }
    }
  };
}
