// app/components/LoadingOverlay.jsx (Example location)
import { Box, CircularProgress, Typography } from "@mui/material";
import Image from "next/image";

const LoadingOverlay = () => (
    <Box sx={{
        position: 'fixed', // Cover the whole viewport
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        bgcolor: 'rgba(66, 64, 61, 1)', // Dark background
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1301, // High z-index to be on top
        color: 'white',
        textAlign: 'center',
        p: 2,
    }}>
        {/* Use your actual logo path */}
        <Image src="/loadLogo.png" alt="Loading Logo" width={133} height={134} style={{ marginBottom: '5px' }} />
    </Box>
);

export default LoadingOverlay;