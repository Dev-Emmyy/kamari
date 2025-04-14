// app/page.jsx
'use client';
import { Box, Typography, Button } from "@mui/material";
import Image from "next/image";
import { useRouter } from 'next/navigation'; // *** 1. Import useRouter ***
import { TfiHandPointLeft } from "react-icons/tfi";

// Main Action Button styles (Sign In/Sign Up)
const mainButtonStyles = {
    mt: 1, // Margin top after last input
    mb: 3, // Consistent spacing
    borderStyle: 'none',
    bgcolor: "rgba(34, 34, 34, 1)", // Or use theme.palette.primary.main
    padding: "10px 12px",
    textTransform: "none",
    borderRadius: "13px",
    boxShadow: "0px 4px 8px 0px rgba(0, 0, 0, 0.15)",
    fontFamily: "'Instrument Sans', sans-serif",
    fontWeight: 400,
    fontSize: "14px",
    width: "100%",
    lineHeight: "normal",
    color: "#FFFFFF", // Or theme.palette.primary.contrastText
    height: "48px",
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1, // Optional: Add some space between the icon and text in button
    '&:hover': {
        bgcolor: "rgba(50, 50, 50, 1)", // Darken slightly on hover
    },
    '&:disabled': {
        bgcolor: 'rgba(0, 0, 0, 0.12)', // Disabled style
        color: 'rgba(0, 0, 0, 0.26)',
        boxShadow: 'none',
    }
};

export default function Home() {
    const router = useRouter(); // *** 2. Initialize useRouter ***

    return (
        // Outermost container - manages overall page layout and height
        <Box sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",      // Centers direct children horizontally
            justifyContent: "flex-start", // Aligns direct children to the top
            minHeight: "100vh",       // Ensures container tries to fill viewport height
            width: "100%",            // Ensures container tries to fill viewport width
            // No background specified here, so body background might show if needed
        }}>
            {/* Header Row */}
            <Box sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                backgroundColor: "rgb(246, 246, 246)",
                width: '100%',
                boxSizing: 'border-box', // Include padding in width calculation
            }}>
                {/* Left Logo */}
                <Box sx={{ pl: 2 }}>
                    <Image
                        src="/logo.png"
                        alt="Kamari Logo"
                        width={108}
                        height={52}
                        priority
                        style={{ display: 'block' }}
                    />
                </Box>
                {/* Right Logo */}
                <Box>
                    <Image
                        src="/logo2.png"
                        alt="Kamari Logo 2"
                        width={140}
                        height={100} // Consider adjusting if aspect ratio seems off
                        priority
                        style={{ display: 'block' }}
                    />
                </Box>
            </Box>

            {/* --- Content Blocks --- */}
            {/* These blocks are centered horizontally by the parent's alignItems: "center" */}

            {/* Main Content Block 1 */}
            <Box sx={{
                mt: 6,
                // pl: 2, // Padding left might push it off-center slightly relative to others
                mb: 4,
                display: "flex",
                flexDirection: "row",
                alignItems: "flex-start",
                width: 'auto', // Let content determine width, parent centers it
            }}>
                <Box sx={{ width: "283px", ml: 6 }}>
                    <Typography variant="h1" sx={{ width: "270px", fontFamily: "Manrope", fontWeight: "700", fontSize: "42px" }}>
                        List Products in Seconds with AI
                    </Typography>
                </Box>
                <Box sx={{
                    width: "213px",
                    height: "167px",
                    ml: -9, // Negative margin might cause overlap issues, review layout needs
                    flexShrink: 0 // Prevent image box from shrinking if space is tight
                }}>
                    <Image
                        src="/hero.png"
                        width={213}
                        height={167}
                        alt="List icon"
                    />
                </Box>
            </Box>

            {/* Main Content Block 2 */}
            <Box sx={{
                display: 'flex',
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between", // Space out content within this block
                // pl: 2, // Again, padding might affect visual centering
                // pr: 4,
                mb: 4,
                width: 'auto', // Adjust width as needed or let content define it
                maxWidth: 'calc(160px + 230px + 32px)', // Example max width based on children + gap
            }}>
                <Box sx={{ mb: 2, mt: -3, ml: 2 }}>
                    <Typography sx={{ width: "160px", fontFamily: "Manrope", fontWeight: "700", fontSize: "36px", color: "rgba(215,59,59,1)" }}>
                        Upload a Picture to Begin
                    </Typography>
                </Box>
                <Box sx={{ width: "230px", mt: -15, flexShrink: 0 }}>
                    <Image
                        src="/bag.png"
                        width={230}
                        height={120}
                        alt="List icon"
                        style={{ width: '100%', height: 'auto', display: 'block' }}
                    />
                </Box>
            </Box>

            {/* Button Container Box */}
            {/* This Box is centered by the main container's alignItems: "center" */}
            <Box sx={{ width: "301px", mb: 2 }}>
                <Button
                    variant="contained"
                    fullWidth
                    sx={{
                        ...mainButtonStyles, // Apply base styles
                        cursor: 'pointer' // *** 4. Add pointer cursor ***
                    }}
                    onClick={() => router.push('/login')} // *** 3. Add onClick for navigation ***
                >
                    <Image
                        src="/logos.png" // Ensure this path is correct
                        alt="Upload Icon" // Changed Alt Text
                        width={45}
                        height={45}
                        priority
                    />
                    {/* *** 5. Corrected Typography Styles *** */}
                    <Typography sx={{
                        fontFamily: "'Instrument Sans', sans-serif", // Correct property
                        fontWeight: 400, // Correct value (unitless number)
                        color: "rgba(255, 255, 255, 1)",
                        fontSize: "14px", // Ensure this matches button style if needed
                        ml: 1 // Add some margin left if needed for spacing from icon
                    }}>
                        Upload & Let AI Work!
                    </Typography>

                    <TfiHandPointLeft style={{width: "14px", height: "14px"}}/>
                </Button>
            </Box>

            {/* Bottom Yellow Box - Stretches to fill remaining vertical space */}
            <Box sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between", // Pushes content top/bottom
                alignItems: "flex-start",       // Aligns content left (respecting padding)
                // mb: 4,                       // *** REMOVED Margin Bottom ***
                pb: 4,                         // *** ADDED Padding Bottom (optional spacing inside) ***
                width: '100%',                 // Takes full width available at its position
                pl: 4,
                pt: 4,
                backgroundColor: "rgba(255, 205, 7, 1)",
                flexGrow: 1,                   // *** Takes remaining vertical space ***
                boxSizing: 'border-box',       // Include padding in height calculation
            }}>
                {/* Top Content in Yellow Box */}
                <Box>
                    <Typography sx={{ width: "290px", fontFamily: "Manrope", fontWeight: "700", fontSize: "20px", color: "rgba(34, 34, 34, 1)", mb: 1 }}>
                        Kamari generates product titles and descriptions for your products.
                    </Typography>
                </Box>

                <Box sx={{ width: '100%', maxWidth: '350px', alignSelf: 'center', mt: 2 /* Add margin top if needed */ }}>
                    <Image
                        src="/bottom.png"
                        alt="bottomLogo"
                        width={500}  // Base width for optimization
                        height={150} // Base height for optimization
                        priority
                        style={{
                            display: 'block', // Prevent extra space
                            width: '100%',    // Responsive width
                            height: 'auto',   // Maintain aspect ratio
                            maxWidth: '350px' // Max render width
                        }}
                    />
                </Box>
            </Box>
        </Box>
    )
}