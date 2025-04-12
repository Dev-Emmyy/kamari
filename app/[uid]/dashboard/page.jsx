// app/dashboard/page.jsx 
"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import {
  Box,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Typography,
} from "@mui/material";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../../../lib/firebase";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";

export default function Dashboard() {


  // Firebase Auth State
  const [user, setUser] = useState(null); // Store Firebase user object
  const [loading, setLoading] = useState(true); // Combined loading state

  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const headerRef = useRef(null); // Keep for drawer focus management

  // Removed isInitialLoading state and its useEffect

  // Effect to listen for Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser); // Set user to null if not logged in, or user object if logged in
      setLoading(false); // Set loading to false once auth state is determined
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []); // Run only once on mount

  // Effect to redirect if user is not authenticated (after loading)
  useEffect(() => {
    // Only redirect if loading is complete and there's no user
    if (!loading && !user) {
      // Redirect to your sign-in page (ensure path is correct)
      router.push("/login"); // Or "/login" based on your auth form route
    }
  }, [user, loading, router]);

  const handleDrawerToggle = () => {
    const newMobileOpen = !mobileOpen;
    setMobileOpen(newMobileOpen);
    if (!newMobileOpen && headerRef.current) {
      headerRef.current.focus();
    }
  };

  // Handle Firebase sign out
  const handleSignOut = async () => {
      try {
          await signOut(auth);
          // No need to manually push, the onAuthStateChanged listener
          // will detect the user is null, and the redirect effect will trigger.
          console.log("User signed out successfully");
      } catch (error) {
          console.error("Sign out error:", error);
          // Optionally show an error message to the user
      }
  };

  // Show loading spinner while Firebase checks auth state
  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: "#F8F8F8", // Or your theme's background
        }}
      >
        <CircularProgress sx={{ color: "#0E4F90" }} size={60} /> {/* Use theme color? theme.palette.primary.main */}
      </Box>
    );
  }

  if (!user) {
      return null;
  }


  // Render dashboard only if loading is false and user exists
  return (
    <Box sx={{
      display: 'flex',
      width: '100%',
      minHeight: '100vh',
      backgroundColor: '#F8F8F8', // Consider theme.palette.background.default
    }}>
      {/* Sidebar */}
      <Sidebar
        mobileOpen={mobileOpen}
        onDrawerToggle={handleDrawerToggle}
        // Pass sign out function to Sidebar if the button is there
        // onSignOut={handleSignOut}
        sx={{ display: { xs: "none", sm: "block" } }}
      />

      {/* Main Content Area */}
      <Box sx={{
        flexGrow: 1,
        display: 'flex',
        justifyContent: 'center',
        width: 'calc(100% - 240px)', // Adjust '240px' if sidebar width changes
        [theme.breakpoints.down('sm')]: {
          width: '100%', // Full width on mobile
        },
      }}>
        {/* Content Container */}
        <Box sx={{
          width: '100%',
          maxWidth: '1600px',
          p: 3,
        }}>
          {/* Header */}
          <Header
            ref={headerRef}
            onMenuClick={isMobile ? handleDrawerToggle : undefined}
            tabIndex={0}
            // Pass user info and sign out function if needed in Header
            user={user}
            onSignOut={handleSignOut}
          />


          {/* Overview Title Example */}
           <Box sx={{ mt: 3 }}> {/* Add some margin top */}
               <Typography
                 sx={{
                     fontFamily: 'Manrope',
                     fontSize: '24px',
                     fontWeight: 600,
                     lineHeight: '100%',
                     color: '#0E4F90', // Consider theme.palette.primary.main or text.primary
                     textAlign: 'left',
                     marginBottom: '20px', // Keep margin bottom
                 }}>
                 Overview
               </Typography>
           </Box>

        </Box>
      </Box>
    </Box>
  );
}