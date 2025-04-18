"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    TextField,
    Button,
    Typography,
    Divider,
    Box,
    IconButton,
    InputAdornment,
    CircularProgress,
    Alert,
    Link,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    sendPasswordResetEmail,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db, googleProvider } from "../../lib/firebase";
import Image from "next/image";

// Base styles for text fields (Name, Password)
const textFieldStyles = {
    mb: 2.5,
    "& .MuiOutlinedInput-root": {
        borderRadius: "14px",
        "& .MuiOutlinedInput-notchedOutline": { border: "1px solid rgba(133, 133, 133, 1)" },
        "&:hover .MuiOutlinedInput-notchedOutline": { border: "1px solid rgba(133, 133, 133, 1)" },
        "&.Mui-focused .MuiOutlinedInput-notchedOutline": { border: "1px solid rgba(133, 133, 133, 1)" },
        "& .MuiInputBase-input": { fontFamily: "'Instrument Sans', sans-serif", fontSize: "14px", padding: "15px" },
    },
    "& .MuiInputLabel-root": { fontFamily: "'Instrument Sans', sans-serif", fontWeight: 400, fontSize: "14px", color: "rgba(66, 64, 61, 1)" },
    "& .MuiInputLabel-root.Mui-focused": { color: "rgba(66, 64, 61, 1)", fontWeight: 400, fontSize: "14px" },
};

// Specific styles for the Email field
const emailTextFieldStyles = {
    ...textFieldStyles,
    "& .MuiOutlinedInput-root": {
        ...textFieldStyles["& .MuiOutlinedInput-root"],
        "& .MuiOutlinedInput-notchedOutline": { border: "1px solid rgb(226, 185, 21)" },
        "&:hover .MuiOutlinedInput-notchedOutline": { border: "1px solid rgb(226, 185, 21)" },
        "&.Mui-focused .MuiOutlinedInput-notchedOutline": { border: "1px solid rgb(226, 185, 21)" },
    },
};

// Google Button styles
const googleButtonStyles = {
    mb: 2.5,
    border: '1px solid rgba(193, 213, 246, 1)',
    borderRadius: "15px",
    color: "rgba(31, 31, 31, 1)",
    bgcolor: "background.paper",
    textTransform: "none",
    fontFamily: "Manrope, sans-serif",
    fontWeight: 500,
    fontSize: "14px",
    lineHeight: "1",
    padding: "10px 12px",
    height: "45px",
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    '&:hover': {
        bgcolor: 'rgba(0, 0, 0, 0.03)'
    }
};

// Main Action Button styles (Sign In/Sign Up)
const mainButtonStyles = {
    mt: 1,
    mb: 3,
    borderStyle: 'none',
    bgcolor: "rgba(34, 34, 34, 1)",
    padding: "10px 12px",
    textTransform: "none",
    borderRadius: "15px",
    boxShadow: "0px 4px 8px 0px rgba(0, 0, 0, 0.15)",
    fontFamily: "'Instrument Sans', sans-serif",
    fontWeight: 400,
    fontSize: "14px",
    lineHeight: "normal",
    color: "#FFFFFF",
    height: "48px",
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    '&:hover': {
        bgcolor: "rgba(50, 50, 50, 1)",
    },
    '&:disabled': {
        bgcolor: 'rgba(0, 0, 0, 0.12)',
        color: 'rgba(0, 0, 0, 0.26)',
        boxShadow: 'none',
    }
};

export default function AuthForm() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isGoogleProcessing, setIsGoogleProcessing] = useState(false);
    const [isEmailProcessing, setIsEmailProcessing] = useState(false);
    const [isNewUser, setIsNewUser] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const router = useRouter();

    const handleClickShowPassword = () => setShowPassword((prev) => !prev);
    const handleClickShowConfirmPassword = () => setShowConfirmPassword((prev) => !prev);

    const handleAuthError = (error) => {
        console.error("Auth error:", error);
        let message = "An unexpected error occurred. Please try again.";

        if (error.code) {
            switch (error.code) {
                case "auth/user-not-found":
                    setIsNewUser(true);
                    message = "No account found with this email. Please sign up.";
                    break;
                case "auth/wrong-password":
                    message = "Incorrect password. Please try again.";
                    break;
                case "auth/email-already-in-use":
                    setIsNewUser(false);
                    message = "Email already in use. Please sign in instead.";
                    break;
                case "auth/weak-password":
                    message = "Password should be at least 6 characters.";
                    break;
                case "auth/invalid-email":
                    message = "Please enter a valid email address.";
                    break;
                case "auth/network-request-failed":
                    message = "Network error. Please check your internet connection.";
                    break;
                case 'auth/popup-closed-by-user':
                    message = 'Google sign-in cancelled.';
                    break;
                case 'auth/cancelled-popup-request':
                case 'auth/popup-blocked':
                    message = 'Google sign-in popup was blocked or cancelled. Please allow popups for this site.';
                    break;
                default:
                   message = error.message.includes('auth/') ? error.message.split('auth/')[1].split(')')[0].replace(/-/g, ' ') : "Authentication failed. Please try again.";
                   message = message.charAt(0).toUpperCase() + message.slice(1) + '.';
            }
        } else if (error.message) {
             message = error.message;
        }
        setError(message);
    };

    const redirectToDashboard = (uid) => {
        if (!uid) {
            console.error("Redirect failed: UID is missing.");
            setError("Authentication succeeded but redirect failed. Please try logging in.");
            return;
        }
        console.log("Redirecting user:", uid);
        const redirectPath = `/${uid}/dashboard`;
        router.push(redirectPath);
    };

    const handleForgotPassword = async () => {
        if (!email) {
            setError("Please enter your email address to reset password.");
            return;
        }

        try {
            await sendPasswordResetEmail(auth, email);
            setSuccess("Password reset email sent. Please check your inbox.");
        } catch (error) {
            handleAuthError(error);
        }
    };

    const handleAuth = async () => {
        setIsEmailProcessing(true);
        setError("");
        setSuccess("");

        if (isNewUser) {
            // Sign Up
            if (!name.trim()) {
                setError("Please enter your name.");
                setIsEmailProcessing(false);
                return;
            }
            if (!email.trim() || !password.trim()) {
                setError("Please enter both email and password.");
                setIsEmailProcessing(false);
                return;
            }
            if (password !== confirmPassword) {
                setError("Passwords do not match.");
                setIsEmailProcessing(false);
                return;
            }
            if (password.length < 6) {
                setError("Password should be at least 6 characters.");
                setIsEmailProcessing(false);
                return;
            }

            try {
                const { user } = await createUserWithEmailAndPassword(auth, email, password);
                await setDoc(doc(db, "users", user.uid), {
                    name: name,
                    email: user.email,
                    createdAt: new Date().toISOString(),
                    signupMethod: "email",
                });
                setSuccess("🎉 Account created! Redirecting...");
                setTimeout(() => redirectToDashboard(user.uid), 1000);
            } catch (error) {
                handleAuthError(error);
            } finally {
                setIsEmailProcessing(false);
            }
        } else {
            // Sign In
            if (!email.trim() || !password.trim()) {
                setError("Please enter both email and password.");
                setIsEmailProcessing(false);
                return;
            }

            try {
                const { user } = await signInWithEmailAndPassword(auth, email, password);
                const userDocRef = doc(db, "users", user.uid);
                const userDoc = await getDoc(userDocRef);

                if (!userDoc.exists()) {
                    console.warn("User authenticated (email) but no Firestore doc found for UID:", user.uid);
                    await setDoc(userDocRef, {
                        email: user.email,
                        name: "User",
                        createdAt: new Date().toISOString(),
                        signupMethod: "email",
                    });
                    console.log("Created minimal Firestore doc for user:", user.uid);
                }
                setSuccess("🔑 Sign in successful! Redirecting...");
                setTimeout(() => redirectToDashboard(user.uid), 1500);
            } catch (error) {
                handleAuthError(error);
            } finally {
                setIsEmailProcessing(false);
            }
        }
    };

    const handleGoogleAuth = async () => {
        setIsGoogleProcessing(true);
        setError("");
        setSuccess("");
        try {
            const { user } = await signInWithPopup(auth, googleProvider);
            const userDocRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userDocRef);

            let userName = user.displayName || "Google User";

            if (!userDoc.exists()) {
                await setDoc(userDocRef, {
                    name: userName,
                    email: user.email,
                    createdAt: new Date().toISOString(),
                    signupMethod: "google",
                });
                setSuccess("🎉 Google sign up successful! Redirecting...");
            } else {
                setSuccess("🔑 Google sign in successful! Redirecting...");
            }
            setTimeout(() => redirectToDashboard(user.uid), 1500);
        } catch (error) {
            handleAuthError(error);
        } finally {
            setIsGoogleProcessing(false);
        }
    };

    const toggleFormType = () => {
        setIsNewUser(!isNewUser);
        setError("");
        setSuccess("");
        setName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
    };

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minHeight: { xs: '100vh', sm: '100dvh' },
                p: 2,                    
                boxSizing: 'border-box', 
                width: '100%',          
                overflowX: "hidden",  
            }}
        >
            <Box
                sx={{
                    width: "100%",    
                    maxWidth: "298px",         
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "10px", mb: { xs: 3, sm: 5 } }}>
                    <Image src="/logo.png" alt="logo" width={200} height={96} priority />
                </Box>

                <Box sx={{ width: '100%', mb: 2 }}>
                    {success && <Alert severity="success" sx={{ maxWidth: 400 }} onClose={() => setSuccess("")}>{success}</Alert>}
                    {error && <Alert severity="error" sx={{ maxWidth: 400 }} onClose={() => setError("")}>{error}</Alert>}
                </Box>

                <Button
                    variant="outlined"
                    onClick={handleGoogleAuth}
                    fullWidth
                    disabled={isGoogleProcessing || isEmailProcessing}
                    startIcon={!isGoogleProcessing ? (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="18" height="18" style={{ marginRight: '8px' }}>
                            <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.4-.1-2.7-.4-4z"/>
                            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
                            <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2.1 1.4-4.7 2.2-7.2 2.2-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
                            <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l.1-.1 6.2 5.2C41 39.2 44 34 44 24c0-1.4-.1-2.7-.4-4z"/>
                        </svg>
                    ) : null}
                    sx={googleButtonStyles}
                >
                    {isGoogleProcessing ? (
                        <CircularProgress size={24} color="inherit" />
                    ) : (
                        isNewUser ? "Sign up with Google" : "Continue with Google"
                    )}
                </Button>

                <Divider sx={{ my: 2, color: "#5f6368", fontFamily: "Manrope, sans-serif", fontWeight: 800, fontSize: 14, width: '100%' }} >
                    OR
                </Divider>

                {isNewUser && (
                    <TextField
                        label="Name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        fullWidth
                        sx={textFieldStyles}
                        required
                    />
                )}

                <TextField
                    label="Email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    fullWidth
                    sx={emailTextFieldStyles}
                    required
                />

                <TextField
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    autoComplete={isNewUser ? "new-password" : "current-password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    fullWidth
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton onClick={handleClickShowPassword} edge="end">
                                    {showPassword ? <Visibility fontSize="small"/> : <VisibilityOff fontSize="small"/>}
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                    sx={textFieldStyles}
                    required
                />

                {isNewUser && (
                    <TextField
                        label="Confirm Password"
                        type={showConfirmPassword ? "text" : "password"}
                        autoComplete="new-password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        fullWidth
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton 
                                        onClick={handleClickShowConfirmPassword} 
                                        edge="end"
                                    >
                                        {showConfirmPassword ? <Visibility fontSize="small"/> : <VisibilityOff fontSize="small"/>}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                        sx={textFieldStyles}
                        required
                    />
                )}

                {!isNewUser && (
                    <Box sx={{ width: '100%', textAlign: 'left', mb: 2 }}>
                        <Link
                            component="button"
                            variant="body2"
                            onClick={handleForgotPassword}
                            sx={{
                                fontSize: '14px',
                                color: 'rgba(66, 64, 61, 1)',
                                fontFamily: "Manrope, sans-serif",
                                fontWeight: 400,
                                textDecoration: 'none',
                            }}
                        >
                            Forgot your password?
                        </Link>
                    </Box>
                )}

                <Button
                    variant="contained"
                    onClick={handleAuth}
                    fullWidth
                    disabled={isEmailProcessing || isGoogleProcessing}
                    sx={mainButtonStyles}
                >
                    {isEmailProcessing ? (
                        <CircularProgress size={24} color="inherit" />
                    ) : isNewUser ? (
                        "Create Account"
                    ) : (
                        "Sign In"
                    )}
                </Button>

                <Typography sx={{ mt: 1, mb: 2, textAlign: 'center', color: "text.secondary", fontSize: '14px' }} >
                    {isNewUser ? "Have an account?" : "Don't have an account?"}
                    <Button
                        variant="text"
                        size="small"
                        disabled={isEmailProcessing || isGoogleProcessing}
                        onClick={toggleFormType}
                        sx={{
                            color: "primary.main",
                            fontWeight: 500,
                            fontSize: "14px",
                            textTransform: 'none',
                            p: '0 4px',
                            ml: '4px',
                            minWidth: 'auto',
                            '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' },
                        }}
                    >
                        {isNewUser ? "Sign In" : "Sign up"}
                    </Button>
                </Typography>
            </Box>
        </Box>
    );
}