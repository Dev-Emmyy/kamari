// app/components/LoadingOverlay.jsx
import { Box, CircularProgress, Typography } from "@mui/material";
import Image from "next/image";

const LoadingOverlay = () => (
  <Box sx={{
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    bgcolor: 'rgba(66, 64, 61, 1)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1301,
    color: 'white',
  }}>
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      maxWidth: '300px', // Optional: prevents image from getting too large
      margin: '0 auto',
      textAlign: 'center',
    }}>
      {/* Logo with responsive sizing */}
      <Box sx={{
        position: 'relative',
        width: { xs: '100px', sm: '133px' }, // Responsive sizing
        height: { xs: '100px', sm: '134px' },
        mb: 2
      }}>
        <Image 
          src="/loadLogo.png" 
          alt="Loading Logo" 
          fill
          style={{
            objectFit: 'contain', // Ensures full logo visibility
          }}
          priority
        />
      </Box>
    </Box>
  </Box>
);

export default LoadingOverlay;