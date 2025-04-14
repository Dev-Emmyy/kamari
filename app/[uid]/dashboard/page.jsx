// app/page.jsx
'use client';
import { Box, Typography } from "@mui/material";
import Image from "next/image";

export default function Home() {
    return (
        <Box sx={{ 
            minHeight: '100vh', 
            position: 'relative', 
            overflow: 'hidden', 
            bgcolor: '#f8f8f8',
            '&::before': {
                content: '""',
                position: 'absolute',
                top: '-60px',      // Reduced from top
                right: '-60px',    // Reduced from right
                width: '100px',    // Much smaller circle
                height: '150px',
                borderRadius: '50%',
                background: 'linear-gradient(90deg, rgba(223,29,29,0.4) 0%, rgba(226,185,21,0.3) 100%)',
                opacity: 0.7,      // More subtle
                zIndex: 0
            }
        }}>
            {/* Header Row */}
            <Box sx={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center", 
                p: 2,
                position: 'relative', 
                zIndex: 1 
            }}>
                <Box> 
                    <Image 
                        src="/logo.png" 
                        alt="Kamari Logo" 
                        width={90}   // Smaller logo for mobile
                        height={44} 
                        priority 
                    /> 
                </Box>
            </Box>

            {/* Main Content */}
            <Box sx={{ 
                p: 2, 
                position: 'relative', 
                zIndex: 1 
            }}>
                <Typography variant="h5" gutterBottom>Welcome to Kamari</Typography>
                <Typography variant="body2">Main page content</Typography>
            </Box>
        </Box>
    )
}
