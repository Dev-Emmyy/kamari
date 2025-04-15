// app/page.jsx
'use client';
import { Box, Typography, Button, useMediaQuery, useTheme, } from "@mui/material";
import Image from "next/image";
import { useRouter } from 'next/navigation';
import { TfiHandPointLeft } from "react-icons/tfi";
import SmartphoneIcon from '@mui/icons-material/Smartphone';

// Main Action Button styles (Sign In/Sign Up)
const mainButtonStyles = {
    mt: 1,
    mb: 3,
    borderStyle: 'none',
    bgcolor: "rgba(34, 34, 34, 1)",
    padding: "10px 12px",
    textTransform: "none",
    borderRadius: "13px",
    boxShadow: "0px 4px 8px 0px rgba(0, 0, 0, 0.15)",
    fontFamily: "'Instrument Sans', sans-serif",
    fontWeight: 400,
    fontSize: "14px",
    width: "100%",
    lineHeight: "normal",
    color: "#FFFFFF",
    height: "48px",
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
    '&:hover': {
        bgcolor: "rgba(50, 50, 50, 1)",
    },
    '&:disabled': {
        bgcolor: 'rgba(0, 0, 0, 0.12)',
        color: 'rgba(0, 0, 0, 0.26)',
        boxShadow: 'none',
    }
};


const DesktopWarning = () => (
    <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        textAlign: 'center',
        p: 3,
        bgcolor: 'background.paper'
    }}>
        <SmartphoneIcon sx={{ fontSize: 60, mb: 2, color: 'text.secondary' }} />
        <Typography variant="h5" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
            Mobile View Recommended
        </Typography>
        <Typography variant="body1" color="text.secondary">
            This application is designed for mobile use.
            <br />
            Please switch to a phone or use browser developer tools
            <br />
            to emulate a mobile screen for the intended experience.
        </Typography>
    </Box>
);


export default function Home() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const router = useRouter();

    if (!isMobile) {
        return <DesktopWarning />; // Use the component defined above
    }

    return (
        <Box sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-start",
            minHeight: "100vh",
            width: "100%",
            overflowX: 'hidden',
            backgroundColor: 'rgb(246, 246, 246)',
        }}>
            {/* Header Row */}
            <Box sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                backgroundColor: "rgb(246, 246, 246)",
                width: '100%',
                boxSizing: 'border-box',
            }}>
                <Box sx={{pl: 2}}>
                    <Image
                        src="/logo.png"
                        alt="Kamari Logo"
                        width={108}
                        height={52}
                        priority
                        style={{ display: 'block' }}
                    />
                </Box>
                <Box>
                    <Image
                        src="/logo2.png"
                        alt="Kamari Logo 2"
                        width={140}
                        height={100}
                        priority
                        style={{ display: 'block' }}
                    />
                </Box>
            </Box>

            {/* Main Content Container */}
            <Box sx={{
                width: '100%',
                maxWidth: '400px',
                px: 2,
                boxSizing: 'border-box',
                flex: '0 0 auto'
            }}>
                {/* Hero Section */}
                <Box sx={{
                    mt: 6,
                    mb: 1,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    width: '100%',
                }}>
                    <Box sx={{ width: "60%" }}>
                        <Typography variant="h1" sx={{ 
                            fontFamily: "Manrope", 
                            fontWeight: 700, 
                            fontSize: "42px",
                            lineHeight: 1.1,
                            width: "270px",
                        }}>
                            List Products in Seconds with AI
                        </Typography>
                    </Box>
                    <Box sx={{
                        width: "40%",
                        flexShrink: 0,
                        position: 'relative',
                        height: '167px',
                        ml: -9
                    }}>
                        <Image
                            src="/hero.png"
                            fill
                            style={{ objectFit: 'contain' }}
                            alt="List icon"
                            priority
                        />
                    </Box>
                </Box>

                {/* Upload Section */}
                <Box sx={{
                    display: 'flex',
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 4,
                    width: '100%',
                }}>
                    <Box sx={{ width: "55%" }}>
                        <Typography sx={{ 
                            fontFamily: "Manrope", 
                            fontWeight: 700, 
                            fontSize: "36px", 
                            color: "rgba(215,59,59,1)",
                            lineHeight: 1,
                            width: "160px",
                        }}>
                            Upload a Picture to Begin
                        </Typography>
                    </Box>
                    <Box sx={{ 
                        width: "230px",
                        position: 'relative',
                        height: '120px',
                        mt: -15
                    }}>
                        <Image
                            src="/bag.png"
                            width={230}
                        height={120}
                            style={{  width: '100%', height: 'auto', display: 'block' }}
                            alt="Shopping bag icon"
                            priority
                        />
                    </Box>
                </Box>

                {/* Upload Button */}
                <Box sx={{ width: "100%", mb: 2 }}>
                    <Button
                        variant="contained"
                        fullWidth
                        sx={{
                            ...mainButtonStyles,
                            cursor: 'pointer'
                        }}
                        onClick={() => router.push('/login')}
                    >
                        <Image
                            src="/logos.png"
                            alt="Upload Icon"
                            width={45}
                            height={45}
                            priority
                        />
                        <Typography sx={{
                            fontFamily: "'Instrument Sans', sans-serif",
                            fontWeight: 400,
                            color: "rgba(255, 255, 255, 1)",
                            fontSize: "14px",
                            ml: 1
                        }}>
                            Upload & Let AI Work!
                        </Typography>
                        <TfiHandPointLeft style={{width: "14px", height: "14px"}}/>
                    </Button>
                </Box>
            </Box>

            {/* Yellow Info Section */}
            <Box sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                alignItems: "flex-start",
                width: '100%',
                px: 4,
                pt: 4,
                pb: 6,
                backgroundColor: "rgba(255, 205, 7, 1)",
                flexGrow: 1,
                boxSizing: 'border-box',
            }}>
                <Box>
                    <Typography sx={{ 
                        fontFamily: "Manrope", 
                        fontWeight: 700, 
                        fontSize: "20px", 
                        color: "rgba(34, 34, 34, 1)", 
                        mb: 1,
                        maxWidth: '290px'
                    }}>
                        Kamari generates product titles and descriptions for your products.
                    </Typography>
                </Box>

                <Box sx={{ 
                    width: '100%', 
                    maxWidth: '350px', 
                    mt: 4,
                    alignSelf: 'center',
                    position: 'relative',
                    height: '150px'
                }}>
                    <Image
                        src="/bottom.png"
                        alt="How it works illustration"
                        fill
                        style={{ objectFit: 'contain' }}
                        priority
                    />
                </Box>
            </Box>
        </Box>
    )
}