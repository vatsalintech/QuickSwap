// Color theme from colors.txt - Shared auth theme
export const colors = {
  primaryBlue: '#2563EB',
  accentOrange: '#F97316',
  background: '#F9FAFB',
  text: '#111827',
  subtleGray: '#E5E7EB',
  success: '#22C55E',
  successLight: '#DCFCE7',
  error: '#EF4444',
  errorLight: '#FEE2E2',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  info: '#3B82F6',
  infoLight: '#DBEAFE',
  secondaryText: '#6B7280',
  borders: '#D1D5DB',
  sectionBg: '#F3F4F6',
};

export const textFieldStyles = {
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: colors.borders,
    },
    '&:hover fieldset': {
      borderColor: colors.primaryBlue,
    },
    '&.Mui-focused fieldset': {
      borderColor: colors.primaryBlue,
    },
    '&.Mui-error fieldset': {
      borderColor: colors.error,
    },
  },
  '& .MuiInputLabel-root': {
    color: colors.secondaryText,
    '&.Mui-focused': {
      color: colors.primaryBlue,
    },
    '&.Mui-error': {
      color: colors.error,
    },
  },
  '& .MuiFormHelperText-root': {
    color: colors.error,
    margin: '2px 0 0 0',
  },
};

export const authButtonStyles = {
  py: 1,
  backgroundColor: colors.primaryBlue,
  color: '#FFFFFF',
  fontWeight: 600,
  fontSize: '0.9rem',
  textTransform: 'none' as const,
  borderRadius: 1.5,
  boxShadow: 'none',
  '&:hover': {
    backgroundColor: '#1D4ED8',
    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
  },
};

export const authContainerStyles = {
  height: '100vh',
  backgroundColor: colors.background,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
};

export const authPaperStyles = {
  px: 3,
  py: 2.5,
  borderRadius: 3,
  border: `1px solid ${colors.borders}`,
  backgroundColor: '#FFFFFF',
};

export const linkStyles = {
  color: colors.primaryBlue,
  textDecoration: 'none',
  fontWeight: 600,
  '&:hover': {
    textDecoration: 'underline',
  },
};
