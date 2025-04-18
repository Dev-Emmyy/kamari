
"use client";

// --- React & Next.js Imports ---
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";

// --- MUI Imports ---
import {
    Box, useTheme, CircularProgress, Typography, Button, Paper, Alert, IconButton
} from "@mui/material";
import { ArrowBack as ArrowBackIcon, Lock as LockIcon } from '@mui/icons-material';

// --- Firebase Imports ---
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../../../lib/firebase"; // Adjust path as necessary

// --- Utility Functions ---
const formatCurrency = (amount) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);

// --- Style Constants ---
const UPGRADE_PRICE_NGN = 5000; // ₦5,000 one-time payment

// ========================================================================
// --- Upgrade Page Component ---
// ========================================================================
export default function UpgradePage() {
    // --- State & Hooks ---
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isPaying, setIsPaying] = useState(false);
    const router = useRouter();
    const params = useParams();
    const theme = useTheme();

    // --- Auth Logic ---
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                const routeUid = params.uid;
                if (routeUid && currentUser.uid !== routeUid) {
                    console.error("Mismatched UID!");
                    router.push(`/login`);
                    setUser(null);
                    setLoading(false);
                    return;
                }
                setUser(currentUser);
            } else {
                setUser(null);
                router.push("/login");
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, [router, params]);

    // --- Handlers ---
    const handleBack = () => {
        router.back();
    };

    const handlePaystackSuccess = (reference) => {
        console.log("Paystack Success (Frontend Ack):", reference);
        setIsPaying(false);
        alert("Payment submitted! Access will be updated shortly after verification.");
        router.push(`/${user?.uid}/dashboard`);
    };

    const handlePaystackClose = () => {
        console.log("Paystack modal closed by user.");
        setIsPaying(false);
    };

    // --- Render Logic ---
    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
                <CircularProgress size={60} />
            </Box>
        );
    }

    if (!user) {
        return null;
    }

    const userEmail = user.email || "default_email@example.com";

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: "center" , alignItems: "center" ,minHeight: '100vh', bgcolor: '#F8F8F8', overflowX: 'hidden', width: "100%" }}>
            {/* Header */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    bgcolor: '#fff',
                    p: '12px 16px',
                    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
                    position: 'sticky',
                    top: 0,
                    zIndex: 1100,
                    minWidth: '369px',
                    maxWidth: 'min(90vw, 369px)',
                    width: '100%',
                }}
            >
                <IconButton onClick={handleBack} aria-label="Go back" sx={{ p: 1 }}>
                    <ArrowBackIcon sx={{ color: 'rgba(34, 34, 34, 1)' }} />
                </IconButton>
                <Typography
                    variant="h6"
                    sx={{
                        flexGrow: 1,
                        textAlign: 'center',
                        fontFamily: 'Manrope',
                        fontSize: '18px',
                        fontWeight: 700,
                        color: 'rgba(34, 34, 34, 1)',
                        mr: '40px',
                    }}
                >
                    Upgrade Your Account
                </Typography>
            </Box>

            {/* Main Content */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    width: '100%',
                    p: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Paper
                    elevation={3}
                    sx={{
                        p: 4,
                        minWidth: '369px',
                        maxWidth: 'min(90vw, 369px)',
                        width: '100%',
                        textAlign: 'center',
                        borderRadius: '12px',
                        bgcolor: '#fff',
                        boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
                        boxSizing: 'border-box',
                    }}
                >
                    <Image src="/logo.png" alt="Kamari Logo" width={80} height={40} style={{ margin: '0 auto 16px' }} />
                    <Typography
                        variant="h5"
                        sx={{
                            fontFamily: 'Manrope',
                            fontSize: '20px',
                            fontWeight: 700,
                            color: 'rgba(34, 34, 34, 1)',
                            mb: 2,
                            wordBreak: 'break-word',
                        }}
                    >
                        Unlock Unlimited AI Analysis
                    </Typography>
                    <Typography
                        variant="body1"
                        sx={{
                            fontFamily: 'Manrope',
                            fontSize: 'clamp(14px, 4vw, 16px)',
                            fontWeight: 400,
                            color: 'rgba(34, 34, 34, 1)',
                            mb: 3,
                            lineHeight: 1.5,
                            wordBreak: 'break-word',
                        }}
                    >
                        Get unlimited access to generate product titles and descriptions with Gemini AI for a one-time payment.
                    </Typography>
                    <Typography
                        variant="h4"
                        sx={{
                            fontFamily: 'Manrope',
                            fontSize: '24px',
                            fontWeight: 700,
                            color: 'rgba(34, 34, 34, 1)',
                            mb: 4,
                            wordBreak: 'break-word',
                        }}
                    >
                        {formatCurrency(UPGRADE_PRICE_NGN)}
                    </Typography>

                    {error && (
                        <Alert
                            severity="error"
                            sx={{
                                mb: 2,
                                fontFamily: 'Manrope',
                                fontSize: '14px',
                                borderRadius: '12px',
                            }}
                        >
                            {error}
                        </Alert>
                    )}

                    {/* Paystack Button Area */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Button
                            onClick={() => {
                                setIsPaying(true);
                                console.log("Paystack button clicked - Integration needed!");
                                setTimeout(() => {
                                    setIsPaying(false);
                                    alert("Paystack Integration Needed!");
                                }, 1000);
                            }}
                            disabled={isPaying}
                            sx={{
                                fontFamily: 'Manrope',
                                fontSize: '14px',
                                fontWeight: 500,
                                color: '#fff',
                                textTransform: 'none',
                                padding: '12px 16px',
                                borderRadius: '8px',
                                backgroundColor: 'rgba(34, 34, 34, 1)',
                                width: '100%',
                                '&:hover': {
                                    backgroundColor: 'rgba(34, 34, 34, 0.9)',
                                },
                                '&:disabled': {
                                    backgroundColor: 'rgba(34, 34, 34, 0.5)',
                                    color: '#fff',
                                },
                            }}
                        >
                            {isPaying ? (
                                <CircularProgress size={24} color="inherit" />
                            ) : (
                                `Pay ${formatCurrency(UPGRADE_PRICE_NGN)} Securely`
                            )}
                        </Button>
                        <Typography
                            variant="caption"
                            sx={{
                                fontFamily: 'Manrope',
                                fontSize: '12px',
                                color: 'rgba(34, 34, 34, 1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 1,
                            }}
                        >
                            <LockIcon sx={{ fontSize: '14px' }} />
                            Secured by Paystack
                        </Typography>
                    </Box>
                </Paper>
            </Box>

            {isPaying && (
                <Box
                    sx={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        bgcolor: 'rgba(34, 34, 34, 0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1200,
                    }}
                >
                    <CircularProgress size={60} color="inherit" />
                    <Typography
                        sx={{
                            fontFamily: 'Manrope',
                            fontSize: '16px',
                            color: '#fff',
                            ml: 2,
                        }}
                    >
                        Processing payment...
                    </Typography>
                </Box>
            )}
        </Box>
    );
}