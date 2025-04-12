// ./components/Header.jsx (adjust path as needed)
"use client";
import React, { useState, useRef } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  InputBase,
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
import Image from "next/image";
import NotificationsIcon from "@mui/icons-material/Notifications";
import MenuIcon from "@mui/icons-material/Menu";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout"; 
import debounce from "lodash/debounce";
import { useRouter } from "next/navigation";

// Added 'user' and 'onSignOut' to props
const Header = React.forwardRef(({ onMenuClick, user, onSignOut }, ref) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [profileAnchorEl, setProfileAnchorEl] = useState(null);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const searchRef = useRef(null);
  const router = useRouter();

  // Debounced search handler (unchanged)
  const handleSearchChange = debounce((value) => {
    setSearchQuery(value);
  }, 300);

  // Updated function to use the Firebase user prop
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
        // Use first two letters of email before @ if no name
        return email.split("@")[0].slice(0, 2).toUpperCase();
    }
    return "U"; // Fallback initial
  };

  // Profile menu handlers (unchanged)
  const handleProfileClick = (event) => {
    setProfileAnchorEl(event.currentTarget);
  };
  const handleProfileClose = () => {
    setProfileAnchorEl(null);
  };

  // Logout dialog handlers (unchanged opening/cancel)
  const handleLogoutClick = () => {
    setLogoutDialogOpen(true);
    handleProfileClose();
  };
  const handleLogoutCancel = () => {
    setLogoutDialogOpen(false);
  };

  // Updated logout confirmation to call the passed onSignOut function
  const handleLogoutConfirm = async () => {
      setLogoutDialogOpen(false);
      router.push("/login"); // Manually redirect to /login
    };

  // Profile settings navigation (unchanged)
  const handleProfileSettings = () => {
    router.push(`/${uid}/settings`); // Adjust path if needed
    handleProfileClose();
  };

  return (
    <AppBar
      position="static"
      ref={ref}
      tabIndex={0} // Keep for focus management
      sx={{
        backgroundColor: "#fff",
        boxShadow: "0px 4px 10px 0px #C2C2C240",
        width: "100%",
      }}
    >
      <Toolbar 
        sx={{
            padding: { xs: "8px 16px", sm: "16px" },
            minHeight: { xs: "56px", sm: "64px" },
            display: "flex",
            justifyContent: "space-between",
            gap: "8px", }}>
        {/* Search Section with Hamburger */}
        <Box 
            sx={{  
                flex: 1,
                display: "flex",
                alignItems: "center",
                gap: 2,
                maxWidth: { xs: "100%", sm: "400px" },
                }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={onMenuClick}
            sx={{ display: { sm: "none" }, color: "#0E4F90", padding: "8px" }}
          >
            <MenuIcon />
          </IconButton>
          <Box 
            ref={searchRef}
            sx={{
                display: "flex",
                alignItems: "center",
                width: "100%",
                height: "45px",
                padding: "0 16px",
                gap: "12px",
                borderRadius: "10px",
                border: "1px solid #C2C2C2",
                position: "relative",
            }}
            >
            <Image src="/icons/search.png" alt="search" width={20} height={20} />
            <InputBase
              placeholder="Search by shops, id, name..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              sx={{
                flex: 1,
                fontFamily: "Product Sans",
                fontSize: { xs: "14px", sm: "16px" },
                fontWeight: 400,
                lineHeight: "22.4px",
                letterSpacing: "0.2px",
                color: "#828282",
                "& input": {
                "&::placeholder": {
                    opacity: 1,
                    fontSize: { xs: "14px", sm: "16px" },
                },
                },
            }}
            />
          </Box>
        </Box>

        {/* User Info & Icons */}
        <Box sx={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <IconButton size="medium">
            <NotificationsIcon
                sx={{ color: "#010309", fontSize: { xs: "20px", sm: "24px" } }}
            />
          </IconButton>

          {/* Use the passed 'user' prop to conditionally render */}
          {user ? (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "4px 12px",
                borderRadius: "20px",
                backgroundColor: "#F0F4F7",
                "&:hover": { backgroundColor: "#E0E8ED" },
                cursor: "pointer",
            }}
            onClick={handleProfileClick} // Open dropdown on click
            >
              <Avatar
                // Use photoURL from Firebase user object
                src={user.photoURL || undefined} // Use undefined if null/empty
                sx={{ width: 32, height: 32, bgcolor: user.photoURL ? "transparent" : "#0E4F90" }} // Use theme color?
              >
                {/* Display initials if no photoURL */}
                {!user.photoURL && getUserInitials()}
              </Avatar>
              <Typography
                variant="body2"
                sx={{
                    display: { xs: "none", sm: "block" },
                    color: "#0E4F90",
                    fontWeight: 500,
                    fontFamily: "Product Sans",
                }}
                >
                {/* Use displayName or fallback to email */}
                {user.displayName || user.email?.split("@")[0] || "User"}
              </Typography>
            </Box>
          ) : (
             null
          )}
        </Box>

        {/* Profile Dropdown Menu (references updated user info logic implicitly) */}
        <Menu
            anchorEl={profileAnchorEl}
            open={Boolean(profileAnchorEl)}
            onClose={handleProfileClose}
            disableScrollLock={true} 
            PaperProps={{
                sx: {
                    borderRadius: "8px",
                    boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.1)",
                    width: "150px",
                    overflow: "visible",
                },
            }}
            MenuListProps={{
                sx: {
                    padding: "0",
                },
            }}
            anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
            }}
            transformOrigin={{
                vertical: "top",
                horizontal: "right",
            }}
        >
            <MenuItem
            onClick={handleProfileSettings}
            sx={{
                fontFamily: "Product Sans",
                fontSize: "14px",
                color: "#333",
                padding: "6px 16px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                "&:hover": { backgroundColor: "#F0F4F7" },
            }}
            >
            <PersonIcon sx={{ fontSize: "18px", color: "#333" }} />
            Profile
            </MenuItem>
            <MenuItem
            onClick={handleLogoutClick}
            sx={{
                fontFamily: "Product Sans",
                fontSize: "14px",
                color: "#D32F2F",
                padding: "6px 16px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                "&:hover": { backgroundColor: "#FFE5E5" },
            }}
            >
            <LogoutIcon sx={{ fontSize: "18px", color: "#D32F2F" }} />
            Logout
            </MenuItem>
        </Menu>

        {/* Logout Confirmation Dialog (references updated handleLogoutConfirm) */}
        <Dialog
            open={logoutDialogOpen}
            onClose={handleLogoutCancel}
            disableScrollLock={true} // Prevents scrollbar and layout shift
            PaperProps={{
            sx: {
                borderRadius: "10px",
                padding: "20px",
                width: "400px",
                maxWidth: "90vw",
                boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.15)", // Consistent shadow
                position: "fixed", // Ensures it stays centered as an overlay
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)", // Centers the dialog
            },
            }}
            sx={{
            backdropFilter: "blur(2px)", // Optional: Adds a subtle blur to the background
            backgroundColor: "rgba(0, 0, 0, 0.5)", // Darkens the background slightly
            }}
        >
            <DialogTitle
            sx={{
                fontFamily: "Product Sans",
                fontSize: "20px",
                fontWeight: 700,
                color: "#333",
                textAlign: "center",
                padding: "0 0 10px 0", // Reduce extra padding
            }}
            >
            Confirm Logout
            </DialogTitle>
            <DialogContent
            sx={{
                padding: "10px 0", // Tighten spacing
            }}
            >
            <Typography
                sx={{
                fontFamily: "Product Sans",
                fontSize: "16px",
                color: "#5A5D66",
                textAlign: "center",
                }}
            >
                Are you sure you want to log out?
            </Typography>
            </DialogContent>
            <DialogActions
            sx={{
                display: "flex",
                justifyContent: "center",
                gap: "20px",
                padding: "10px 0",
            }}
            >
            <Button
                onClick={handleLogoutCancel}
                sx={{
                fontFamily: "Product Sans",
                fontSize: "14px",
                color: "#0E4F90",
                textTransform: "none",
                padding: "8px 20px",
                borderRadius: "8px",
                "&:hover": { backgroundColor: "#E0E8ED" },
                }}
            >
                Cancel
            </Button>
            <Button
                onClick={handleLogoutConfirm}
                sx={{
                fontFamily: "Product Sans",
                fontSize: "14px",
                color: "#fff",
                backgroundColor: "#D32F2F",
                textTransform: "none",
                padding: "8px 20px",
                borderRadius: "8px",
                "&:hover": { backgroundColor: "#B71C1C" },
                }}
            >
                Logout
            </Button>
            </DialogActions>
        </Dialog>
        </Toolbar>
    </AppBar>
    );
});

Header.displayName = "Header";
export default Header;