"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  TextField,
  Button,
  // FormControlLabel, // Removed as Terms checkbox is gone
  Typography,
  Divider,
  Box,
  // Checkbox, // Removed as Terms checkbox is gone
  IconButton,
  InputAdornment,
  CircularProgress,
  Alert,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  // updateProfile // Import if you want to update auth profile name too
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db, googleProvider } from "../../lib/firebase"; // Ensure path is correct
import Image from "next/image";

export default function AuthForm() {
  // State Updates: Added name, removed confirmPassword and termsAccepted
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isGoogleProcessing, setIsGoogleProcessing] = useState(false);
  const [isEmailProcessing, setIsEmailProcessing] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false); // Toggle between Sign In and Sign Up
  const [showPassword, setShowPassword] = useState(false);
  // Removed showConfirmPassword state

  const router = useRouter();

  const handleClickShowPassword = () => setShowPassword((prev) => !prev);
  // Removed handleClickShowConfirmPassword handler

  const handleAuthError = (error) => {
    console.error("Auth error:", error);
    let message = "An unexpected error occurred. Please try again."; // Default message

    // Specific error messages - Removed password mismatch error
    if (error.code) {
      switch (error.code) {
        case "auth/user-not-found":
          setIsNewUser(true); // Suggest signing up if user not found during sign in attempt
          message = "No account found with this email. Please sign up.";
          break;
        case "auth/wrong-password":
          message = "Incorrect password. Please try again.";
          break;
        case "auth/email-already-in-use":
          setIsNewUser(false); // Suggest signing in if email exists during signup attempt
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
           message = error.message || "Authentication failed. Please try again.";
      }
    } else if (error.message) {
         message = error.message;
    }
      setError(message); // Set the final error message
  };

  // Generic redirection function after successful auth
  const redirectToDashboard = (uid) => {
     if (!uid) { // Basic check
        console.error("Redirect failed: UID is missing.");
        setError("Authentication succeeded but redirect failed. Please try logging in.");
        return;
     }
    console.log("Redirecting user:", uid); // Keep for debugging
    const redirectPath = `/${uid}/dashboard`;
    router.push(redirectPath);
  };

  // Handles Email/Password Sign Up or Sign In
  const handleAuth = async () => {
    setIsEmailProcessing(true);
    setError("");
    setSuccess("");

    // --- Sign Up Logic ---
    if (isNewUser) {
      // Removed terms check
      // Removed password mismatch check

      // Add validation for name
      if (!name.trim()) {
          setError("Please enter your name.");
          setIsEmailProcessing(false);
          return;
      }
      // Basic email/password validation still useful
       if (!email.trim() || !password.trim()) {
           setError("Please enter both email and password.");
           setIsEmailProcessing(false);
           return;
       }


      try {
        const { user } = await createUserWithEmailAndPassword(auth, email, password);

        // Optional: Update Firebase Auth profile display name
        // await updateProfile(user, { displayName: name });

        // Create user document in Firestore with name
        await setDoc(doc(db, "users", user.uid), {
          name: name, // Save the name from state
          email: user.email,
          createdAt: new Date().toISOString(),
          signupMethod: "email",
        });
        setSuccess("🎉 Account created successfully! Redirecting...");
        setTimeout(() => redirectToDashboard(user.uid), 1000);

      } catch (error) {
        handleAuthError(error);
      } finally {
        setIsEmailProcessing(false);
      }
    }
    // --- Sign In Logic --- (Formerly Login)
    else {
      try {
        const { user } = await signInWithEmailAndPassword(auth, email, password);
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
            console.warn("User authenticated (email) but no data found in Firestore for UID:", user.uid);
             await setDoc(userDocRef, {
                email: user.email,
                // Potentially try to get name if available from auth user, though often null for email
                // name: user.displayName || "User",
                createdAt: new Date().toISOString(),
                signupMethod: "email",
             });
             console.log("Created minimal Firestore doc for user:", user.uid);
        }

        // Changed success message text
        setSuccess("🔑 Sign in successful! Redirecting...");
        setTimeout(() => redirectToDashboard(user.uid), 1500);

      } catch (error) {
        handleAuthError(error);
      } finally {
        setIsEmailProcessing(false);
      }
    }
  };

  // Handles Google Sign In / Sign Up
  const handleGoogleAuth = async () => {
    setIsGoogleProcessing(true);
    setError("");
    setSuccess("");

    try {
      const { user } = await signInWithPopup(auth, googleProvider);
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      let userName = user.displayName || "Google User"; // Get name from Google profile

      if (!userDoc.exists()) {
        // New user via Google
        await setDoc(userDocRef, {
          name: userName,
          email: user.email,
          createdAt: new Date().toISOString(),
          signupMethod: "google",
        });
        setSuccess("🎉 Google signup successful! Redirecting...");
      } else {
        // Existing user via Google
        const userData = userDoc.data();
        userName = userData.name || userName;
        console.log("Existing Google user signed in:", user.uid);
        // Optional: Update name if it changed in Google profile? (Consider importing updateDoc)
        // if (userData.name !== userName && user.displayName) {
        //    await updateDoc(userDocRef, { name: user.displayName });
        // }

        // Changed success message text
        setSuccess("🔑 Google sign in successful! Redirecting...");
      }

      setTimeout(() => redirectToDashboard(user.uid), 1500);

    } catch (error) {
        handleAuthError(error);
    } finally {
      setIsGoogleProcessing(false);
    }
  };


  // --- STYLES ---
  const textFieldStyles = {
     mb: 3,
     "& .MuiOutlinedInput-root": {
       borderRadius: "13.89px",
       "& .MuiOutlinedInput-notchedOutline": { border: "1px solid rgba(133, 133, 133, 1)" },
       "&:hover .MuiOutlinedInput-notchedOutline": { border: "1px solid rgba(133, 133, 133, 1)" },
       "&.Mui-focused .MuiOutlinedInput-notchedOutline": { border: "1px solid rgba(133, 133, 133, 1)" },
       "& .MuiInputBase-input": { fontFamily: "'Instrument Sans', sans-serif", fontSize: "14px", padding: "15px" },
     },
     "& .MuiInputLabel-root": { fontFamily: "'Instrument Sans', sans-serif", fontWeight: 400, fontSize: "14px", color: "rgba(66, 64, 61, 1)" },
     "& .MuiInputLabel-root.Mui-focused": { color: "rgba(66, 64, 61, 1)", fontWeight: 400, fontSize: "14px" },
  };


    const emailTextFieldStyles = { // Renamed for clarity
    mb: 3,
     "& .MuiOutlinedInput-root": {
       borderRadius: "13.89px",
       "& .MuiOutlinedInput-notchedOutline": { border: "1px solid rgb(226, 185, 21)" },
       "&:hover .MuiOutlinedInput-notchedOutline": { border: "1px solid rgb(226, 185, 21)" },
       "&.Mui-focused .MuiOutlinedInput-notchedOutline": { border: "1px solid rgb(226, 185, 21)" },
       "& .MuiInputBase-input": { fontFamily: "'Instrument Sans', sans-serif", fontSize: "14px", padding: "15px" },
     },
     "& .MuiInputLabel-root": { fontFamily: "'Instrument Sans', sans-serif", fontWeight: 400, fontSize: "14px", color: "rgba(66, 64, 61, 1)" },
     "& .MuiInputLabel-root.Mui-focused": { color: "rgba(66, 64, 61, 1)", fontWeight: 400, fontSize: "14px" },
    };

  const googleButtonStyles = {
        mb: 3,
        borderColor: "1px solid rgba(193, 213, 246, 1)",
        borderRadius: "15px",
        color: "rgba(31, 31, 31, 1)",
        width: "390px",
        bgcolor: "rgba(255, 255, 255, 1)",
        textTransform: "none",
        fontFamily: "Manrope", // Google often uses Roboto
        fontWeight: 500,
        fontSize: "14px",
        lineHeight: "100%",
        letterSpacing: "0%",
        padding: "10px 12px",
        height: "45px",
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
  };

  const mainButtonStyles = {
         mb: 7,
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
         letterSpacing: "0%",
         color: "#FFFFFF",
         width: "390px",
         height: "48px",
         display: 'flex',
         alignItems: 'center',
         justifyContent: 'center'
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        fontFamily: "'Instrument Sans', sans-serif",
        p: 2,
      }}
    >
      {/* Logo and Title */}
      <Box sx={{ display: "flex", flexDirection: "column" ,alignItems: "center", justifyContent: "center", gap: "15px", mb: 7 }}>
        <Image src="/logo.png" alt="logo" width={106} height={16} />
         <Box sx={{width: "74px"}}>
             <Typography
               sx={{ fontFamily: 'Instrument Sans', fontWeight: 400, fontSize: '10px', lineHeight: '100%', letterSpacing: '0%' ,  background: 'linear-gradient(90deg, rgba(223, 29, 29, 0.69) 7.21%, rgba(102, 102, 102, 0.38) 27.88%, rgba(226, 185, 21, 0.55) 53.85%, rgba(226, 185, 21, 0.4) 94.71%)',WebkitBackgroundClip: 'text',backgroundClip: 'text',color: 'transparent',}}>
                 INVENTORY MANAGEMENT SYSTEM
             </Typography>
         </Box>
      </Box>

      {/* Form Container */}
      <Box sx={{ width: "100%", maxWidth: 400 }}>
        {/* Alerts */}
        {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess("")}>{success}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}

        {/* Google Button */}
        <Button
            variant="outlined"
            onClick={handleGoogleAuth}
            fullWidth
            disabled={isGoogleProcessing || isEmailProcessing} // Disable if any process is running
            startIcon={!isGoogleProcessing ? ( // Show icon only when not processing this button
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="18" height="18" >
                    {/* SVG paths... */}
                      <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                      <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                      <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                      <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
                </svg>
            ) : null}
            sx={googleButtonStyles}
        >
            {/* Show spinner OR dynamic text */}
            {isGoogleProcessing ? (
                <CircularProgress size={24} color="inherit" />
            ) : (
                isNewUser ? "Sign up with Google" : "Continue with Google"
            )}
        </Button>

        {/* Divider */}
         <Divider sx={{ my: 2, color: "#5f6368", fontFamily: "Manrope", fontWeight: 800, fontSize: 14, lineHeight: "normal", letterSpacing: "0%" }} >
          OR
        </Divider>

        {/* --- Conditional Fields --- */}

        {/* Signup Only Fields */}
        {isNewUser && (
          <>
            {/* Name Field (Added) */}
            <TextField
                label="Name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                fullWidth
                sx={textFieldStyles} // Use common styles
            />
          </>
        )}

        {/* Email Field (Common to both) */}
        <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            sx={emailTextFieldStyles}
        />

        {/* Password Field (Common to both) */}
        <TextField
          label="Password"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={handleClickShowPassword} edge="end" aria-label="toggle password visibility" >
                  {showPassword ? <Visibility /> : <VisibilityOff />}
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={textFieldStyles} // Use common styles
        />



        {/* Main Action Button (Email/Password) */}
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
            "Create Account" // Or "Sign Up" if preferred
          ) : (
            "Sign In" // Changed from "Log In"
          )}
        </Button>

        {/* Toggle Sign up/Sign In */}
        <Typography sx={{ mb: 4,textAlign: 'center', color: "rgba(139, 139, 139, 1)" }} >
          {/* Changed text */}
          {isNewUser ? "Have an account?" : "Don't have an account?"}
          <Button
            variant="text"
            size="small"
            disabled={isEmailProcessing || isGoogleProcessing}
            // Clear fields and errors when toggling
            onClick={() => {
                setIsNewUser(!isNewUser);
                setError("");
                setSuccess("");
                // Clear input fields - Added name, removed confirmPassword/terms
                setName('');
                setEmail('');
                setPassword('');
             }}
            sx={{ color: "rgba(62, 169, 211, 1)", fontWeight: 400, fontSize: "14px" ,textTransform: 'none', p: '0 4px', minWidth: 'auto', '&:hover': { bgcolor: 'transparent' },textDecoration: 'underline' }}
          >
            {/* Changed text */}
            {isNewUser ? "Sign In" : "Sign up"}
          </Button>
        </Typography>
      </Box>
    </Box>
  );
}