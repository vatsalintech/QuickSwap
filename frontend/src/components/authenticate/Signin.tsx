import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  InputAdornment,
  IconButton,
  Link,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import AuthLayout from './AuthLayout';
import { colors, textFieldStyles, authButtonStyles } from './authTheme';

interface SignInFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface SignInFormErrors {
  email?: string;
  password?: string;
}

const Signin: React.FC = () => {
  const [formData, setFormData] = useState<SignInFormData>({
    email: '',
    password: '',
    rememberMe: false,
  });

  const [errors, setErrors] = useState<SignInFormErrors>({});
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (field: keyof SignInFormData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = field === 'rememberMe' ? event.target.checked : event.target.value;
    setFormData({ ...formData, [field]: value });
    if (errors[field as keyof SignInFormErrors]) {
      setErrors({ ...errors, [field]: undefined });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: SignInFormErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (validateForm()) {
      console.log('Sign in submitted:', formData);
      // Handle sign in logic here
    }
  };

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to your QuickSwap account"
      footerText="Don't have an account?"
      footerLinkText="Sign Up"
      footerLinkHref="/signup"
    >
      <Box component="form" onSubmit={handleSubmit}>
        {/* Email */}
        <TextField
          fullWidth
          label="Email Address"
          type="email"
          value={formData.email}
          onChange={handleInputChange('email')}
          error={!!errors.email}
          helperText={errors.email}
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <EmailOutlinedIcon sx={{ color: colors.secondaryText, fontSize: '1.2rem' }} />
              </InputAdornment>
            ),
          }}
          sx={{ ...textFieldStyles, mb: 1.5 }}
        />

        {/* Password */}
        <TextField
          fullWidth
          label="Password"
          type={showPassword ? 'text' : 'password'}
          value={formData.password}
          onChange={handleInputChange('password')}
          error={!!errors.password}
          helperText={errors.password}
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LockOutlinedIcon sx={{ color: colors.secondaryText, fontSize: '1.2rem' }} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                  size="small"
                  sx={{ color: colors.secondaryText }}
                >
                  {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{ ...textFieldStyles, mb: 1 }}
        />

        {/* Remember Me & Forgot Password Row */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
          }}
        >
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.rememberMe}
                onChange={handleInputChange('rememberMe')}
                size="small"
                sx={{
                  color: colors.borders,
                  '&.Mui-checked': {
                    color: colors.primaryBlue,
                  },
                }}
              />
            }
            label="Remember me"
            sx={{
              '& .MuiFormControlLabel-label': {
                fontSize: '0.85rem',
                color: colors.secondaryText,
              },
            }}
          />
          <Link
            href="/forgot-password"
            sx={{
              color: colors.primaryBlue,
              textDecoration: 'none',
              fontSize: '0.85rem',
              fontWeight: 500,
              '&:hover': {
                textDecoration: 'underline',
              },
            }}
          >
            Forgot Password?
          </Link>
        </Box>

        {/* Submit Button */}
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ ...authButtonStyles, mb: 1.5 }}
        >
          Sign In
        </Button>
      </Box>
    </AuthLayout>
  );
};

export default Signin;
