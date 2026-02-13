import React from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Link,
} from '@mui/material';
import { colors, authContainerStyles, authPaperStyles, linkStyles } from './authTheme';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footerText: string;
  footerLinkText: string;
  footerLinkHref: string;
  showTerms?: boolean;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({
  title,
  subtitle,
  children,
  footerText,
  footerLinkText,
  footerLinkHref,
  showTerms = false,
}) => {
  return (
    <Box sx={authContainerStyles}>
      <Container maxWidth="sm">
        <Paper elevation={0} sx={authPaperStyles}>
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 2 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                color: colors.text,
                mb: 0.5,
              }}
            >
              {title}
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: colors.secondaryText }}
            >
              {subtitle}
            </Typography>
          </Box>

          {/* Form Content */}
          {children}

          {/* Divider */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              my: 1,
            }}
          >
            <Box sx={{ flex: 1, height: '1px', backgroundColor: colors.subtleGray }} />
            <Typography
              sx={{
                px: 2,
                color: colors.secondaryText,
                fontSize: '0.8rem',
              }}
            >
              or
            </Typography>
            <Box sx={{ flex: 1, height: '1px', backgroundColor: colors.subtleGray }} />
          </Box>

          {/* Footer Link */}
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: colors.secondaryText }}>
              {footerText}{' '}
              <Link href={footerLinkHref} sx={linkStyles}>
                {footerLinkText}
              </Link>
            </Typography>
          </Box>

          {/* Terms */}
          {showTerms && (
            <Typography
              sx={{
                textAlign: 'center',
                color: colors.secondaryText,
                fontSize: '0.7rem',
                mt: 1.5,
              }}
            >
              By creating an account, you agree to our{' '}
              <Link
                href="/terms"
                sx={{
                  color: colors.primaryBlue,
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link
                href="/privacy"
                sx={{
                  color: colors.primaryBlue,
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                Privacy Policy
              </Link>
            </Typography>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default AuthLayout;
