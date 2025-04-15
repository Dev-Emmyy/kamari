// ./components/Header.jsx (adjust path as needed)
"use client";
import React, { useState } from "react";
import {
    AppBar,
    Toolbar,
    IconButton,
    Box,
    Typography,
    Avatar,
    Menu,
    MenuItem,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from "@mui/material";
import { IoIosNotificationsOutline} from "react-icons/io";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";
import { useRouter } from "next/navigation";
import Image from "next/image";

// Removed 'onMenuClick' from props
// Added 'onSignOut' to props if it wasn't explicitly passed before but needed for logout
const Header = React.forwardRef(({ user, onSignOut, backgroundColor = 'rgb(246, 246, 246)', activeColor  =  "rgba(51, 54, 63, 1)" }, ref) => {
    // Removed searchQuery state and searchRef
    const [profileAnchorEl, setProfileAnchorEl] = useState(null);
    const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
    const router = useRouter();

    // Removed handleSearchChange function

    const getUserInitials = () => {
        const name = user?.displayName;
        const email = user?.email;
        if (name) {
            return name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase();
        } else if (email) {
            return email.split("@")[0].slice(0, 2).toUpperCase();
        }
        return "U"; // Fallback initial
    };

    // Profile menu handlers
    const handleProfileClick = (event) => {
        setProfileAnchorEl(event.currentTarget);
    };
    const handleProfileClose = () => {
        setProfileAnchorEl(null);
    };

    // Logout dialog handlers
    const handleLogoutClick = () => {
        setLogoutDialogOpen(true);
        handleProfileClose();
    };
    const handleLogoutCancel = () => {
        setLogoutDialogOpen(false);
    };

    // Updated logout confirmation
    const handleLogoutConfirm = async () => {
        setLogoutDialogOpen(false);
        if (onSignOut) {
           try {
               await onSignOut(); // Call the sign-out function passed from parent
           } catch (error) {
                console.error("Sign out error:", error);
                // Optionally show an error message to the user
           }
        } else {
            console.warn("onSignOut function not provided to Header component.");
        }
        router.push("/login"); // Redirect after sign-out attempt
    };

    // Profile settings navigation
    const handleProfileSettings = () => {
        // Ensure UID is available if needed, otherwise adjust path
        if (user?.uid) {
           router.push(`/${user.uid}/settings`);
        } else {
           console.error("User UID not available for settings navigation");
           // Maybe redirect to a generic settings page or handle error
        }
        handleProfileClose();
    };

    return (
        <AppBar
            position="sticky" // Use sticky to keep it at the top
            ref={ref}
            tabIndex={-1} // Can remove tabIndex if focus management isn't needed here
            sx={{
                bgcolor: backgroundColor,
                boxShadow: "none", // Adjusted shadow alpha
                width: "100%",
                mb: "20px",
                top: 0, // Ensure it sticks to the top
                zIndex: (theme) => theme.zIndex.appBar, // Ensure proper layering
            }}
        >
            <Toolbar
                sx={{
                    padding: { xs: "0 12px", sm: "0 16px" }, // Adjusted padding for mobile
                    minHeight: { xs: "56px", sm: "56px" }, // Consistent mobile height
                    display: "flex",
                    alignItems: "center", // Vertically align items
                    justifyContent: "space-between", // Pushes left and right groups apart
                    gap: "8px",
                }}
            >
                {/* Left Side: Icon + Brand Name */}
                <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Image src="/logo.png" alt="logo" width={108} height={52} />
                </Box>

                {/* Right Side: Icons & User Avatar */}
                <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 0.5, sm: 1 } }}> {/* Reduced gap slightly on xs */}
                    <IconButton
                       size="medium"
                       aria-label="notifications"
                       sx={{ color: 'text.primary' }} // Use theme color
                    >
                        <IoIosNotificationsOutline
                            style={{
                                width: 24,
                                height: 24,
                                color: activeColor,
                            }}
                        />
                    </IconButton>

                    {/* User Avatar and Menu */}
                    {user ? (
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                // Removed padding/border for cleaner look if menu is indicator
                                cursor: "pointer",
                            }}
                            onClick={handleProfileClick} // Open dropdown on click
                            aria-controls={profileAnchorEl ? 'profile-menu' : undefined}
                            aria-haspopup="true"
                            aria-expanded={profileAnchorEl ? 'true' : undefined}
                        >
                            <Avatar
                                src={user.photoURL || undefined}
                                alt={user.displayName || 'User Avatar'}
                                sx={{
                                    width: { xs: 32, sm: 36 }, // Slightly smaller on xs
                                    height: { xs: 32, sm: 36 },
                                    bgcolor: user.photoURL ? "transparent" : "rgba(51, 54, 63, 1)", // Example fallback color
                                    fontSize: "14px", // Adjusted font size for initials
                                    border: '1px solid lightgrey' // Optional subtle border
                                }}
                            >
                                {!user.photoURL && getUserInitials()}
                            </Avatar>
                        </Box>
                    ) : (
                        // Optionally show a Login button if user is not logged in
                        null
                    )}
                </Box>
            </Toolbar>

            {/* Profile Dropdown Menu */}
            <Menu
                id="profile-menu" // Added ID for accessibility
                anchorEl={profileAnchorEl}
                open={Boolean(profileAnchorEl)}
                onClose={handleProfileClose}
                disableScrollLock={true}
                PaperProps={{
                    sx: {
                        borderRadius: "8px",
                        boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.15)", // Slightly softer shadow
                        minWidth: "160px", // Adjusted width
                        overflow: "visible",
                        mt: 1, // Margin top from anchor
                    },
                }}
                MenuListProps={{
                    sx: { padding: "4px 0" }, // Add some vertical padding
                     'aria-labelledby': 'avatar-button', // Assume avatar box acts as button
                }}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
            >
                <MenuItem
                    onClick={handleProfileSettings}
                    sx={{
                        fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif", // Standard font
                        fontSize: "14px",
                        color: "text.primary",
                        padding: "8px 16px",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px", // Consistent gap
                        "&:hover": { backgroundColor: "action.hover" }, // Use theme hover color
                    }}
                >
                    <PersonIcon sx={{ fontSize: "20px", color: "text.secondary" }} />
                    Profile
                </MenuItem>
                <MenuItem
                    onClick={handleLogoutClick}
                    sx={{
                        fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
                        fontSize: "14px",
                        color: "error.main", // Use theme error color
                        padding: "8px 16px",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        "&:hover": { backgroundColor: "rgba(211, 47, 47, 0.08)" }, // Error hover bg
                    }}
                >
                    <LogoutIcon sx={{ fontSize: "20px", color: "error.main" }} />
                    Logout
                </MenuItem>
            </Menu>

            {/* Logout Confirmation Dialog */}
            <Dialog
                open={logoutDialogOpen}
                onClose={handleLogoutCancel}
                disableScrollLock={true}
                PaperProps={{
                    sx: {
                        borderRadius: "10px",
                        p: { xs: 2, sm: 3 }, // Responsive padding
                        width: "auto", // Auto width based on content
                        minWidth: '280px', // Ensure min width on small screens
                        maxWidth: "calc(100vw - 32px)", // Ensure it doesn't touch edges
                        boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.15)",
                        // Removed fixed positioning, Dialog handles centering
                    },
                }}
                // sx={{ backdropFilter: "blur(1px)" }} // Keep if desired
            >
                <DialogTitle
                    sx={{
                        fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
                        fontSize: { xs: "18px", sm: "20px" },
                        fontWeight: 600, // Slightly less bold
                        color: "text.primary",
                        textAlign: "center",
                        p: "0 0 10px 0",
                    }}
                >
                    Confirm Logout
                </DialogTitle>
                <DialogContent sx={{ p: "10px 0" }}>
                    <Typography
                        sx={{
                            fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
                            fontSize: "16px",
                            color: "text.secondary",
                            textAlign: "center",
                        }}
                    >
                        Are you sure you want to log out?
                    </Typography>
                </DialogContent>
                <DialogActions
                    sx={{
                        display: "flex",
                        justifyContent: "center", // Keep centered buttons
                        gap: "16px", // Consistent gap
                        p: "16px 0 0 0", // Padding top only
                    }}
                >
                    <Button
                        onClick={handleLogoutCancel}
                        variant="outlined" // Outlined style for cancel
                        sx={{
                            fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
                            fontSize: "14px",
                            textTransform: "none",
                            padding: "6px 16px", // Adjusted padding
                            borderRadius: "8px",
                            // Color and hover handled by variant="outlined"
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleLogoutConfirm}
                        variant="contained" // Contained style for confirm
                        color="error" // Use error color
                        sx={{
                            fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
                            fontSize: "14px",
                            textTransform: "none",
                            padding: "6px 16px",
                            borderRadius: "8px",
                            // BgColor and hover handled by variant="contained" color="error"
                        }}
                    >
                        Logout
                    </Button>
                </DialogActions>
            </Dialog>
        </AppBar>
    );
});

Header.displayName = "Header";
export default Header;