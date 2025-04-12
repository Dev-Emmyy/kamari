// src/theme.ts
'use client';

import { Manrope } from 'next/font/google'; // Import Manrope
import { createTheme } from '@mui/material/styles';

// Initialize Manrope with desired weights and subsets
const manrope = Manrope({
  // Include weights you plan to use. 600 & 800 were specified.
  // Adding common ones like 400, 500, 700 is often useful too.
  weight: ['400', '500', '600', '700', '800'],
  subsets: ['latin'],
  display: 'swap', // Ensures text is visible while font loads
});

// Define custom colors from your list
const customColors = {
    errorRed: 'rgba(216, 59, 59, 1)',
    darkText: 'rgba(30, 30, 30, 1)', // Using the slightly darker grey for primary text
    mediumGrey: 'rgba(99, 102, 110, 1)',
    successGreen: 'rgba(83, 125, 88, 1)',
    successLightGreenBg: 'rgba(234, 250, 235, 1)',
    almostBlack: 'rgba(34, 34, 34, 1)'
};

const theme = createTheme({
  // === PALETTE ===
  palette: {
    mode: 'light', // Or 'dark' based on your preference
    primary: {
      // You haven't specified a primary brand color.
      // Using the dark text color as a placeholder. Replace with your actual brand color.
      main: customColors.darkText,
    },
    secondary: {
      // You haven't specified a secondary brand color.
      // Using the medium grey as a placeholder. Replace as needed.
      main: customColors.mediumGrey,
    },
    error: {
      main: customColors.errorRed,
    },
    success: {
      main: customColors.successGreen,
      light: customColors.successLightGreenBg, // Good for backgrounds on success alerts/elements
    },
    text: {
      primary: customColors.darkText,
      secondary: customColors.mediumGrey,
    },
    background: {
       // Default background colors, customize if needed
       default: '#ffffff', // White background
       paper: '#ffffff',   // Background for elements like Card, Paper
    },
    // You can add more custom colors if needed, e.g.,
    // custom: {
    //   almostBlack: customColors.almostBlack,
    // }
  },

  // === TYPOGRAPHY ===
  typography: {
    // Set the default font family to Manrope
    fontFamily: manrope.style.fontFamily,

    // --- Define specific variants based on your examples ---

    // Example: Matching "font-weight: 600; font-size: 20px;"
    // This could be h5 or h6 depending on your semantic structure
    h5: {
      fontFamily: manrope.style.fontFamily,
      fontWeight: 600,
      fontSize: '20px', // You can use 'rem' units too, e.g., '1.25rem'
      lineHeight: '120%', // '100%' can be very tight, adjust as needed
      letterSpacing: '0%',
    },

    // Example: Matching "font-weight: 800; font-size: 18px;"
    // This could be h6 or subtitle1
    h6: {
      fontFamily: manrope.style.fontFamily,
      fontWeight: 800,
      fontSize: '18px', // Approx 1.125rem
      lineHeight: '120%',
      letterSpacing: '0%',
    },

     // Example: Matching "font-weight: 600; font-size: 14px;"
     // This could be subtitle2 or body1 if used frequently
    subtitle2: {
        fontFamily: manrope.style.fontFamily,
        fontWeight: 600,
        fontSize: '14px', // Approx 0.875rem
        lineHeight: '120%',
        letterSpacing: '0%',
    },

    // Define standard body text styles
    body1: {
        fontFamily: manrope.style.fontFamily,
        fontWeight: 400, // Default body text is often regular weight
        fontSize: '16px', // Standard body size (adjust if needed, e.g., to 14px)
        lineHeight: '150%', // Common line height for readability
    },
    body2: {
        fontFamily: manrope.style.fontFamily,
        fontWeight: 400,
        fontSize: '14px',
        lineHeight: '143%',
    },

    // Define button text style if needed (often inherits but can be customized)
    button: {
        fontFamily: manrope.style.fontFamily,
        fontWeight: 600, // Buttons often use a bolder weight
        textTransform: 'none', // Override default ALL CAPS if desired
    }

    // Add other variants (h1, h2, h3, h4, caption, overline) if you need to customize them
  },

  // === COMPONENTS (Optional Overrides) ===
  // You can customize default props and styles for specific MUI components here
  // components: {
  //   MuiButton: {
  //     defaultProps: {
  //       disableElevation: true, // Example: Make buttons flat by default
  //     },
  //     styleOverrides: {
  //       root: { // Style applied to the root element
  //         borderRadius: '8px', // Example: Default border radius for buttons
  //       }
  //     }
  //   },
  //   MuiTextField: {
  //      styleOverrides: {
  //          root: {
  //             // Example: Apply consistent styling to text fields
  //          }
  //      }
  //   }
  // }
});

export default theme;