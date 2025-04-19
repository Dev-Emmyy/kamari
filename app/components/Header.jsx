'use client';
import React, { useState } from 'react';
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
} from '@mui/material';
import { IoIosNotificationsOutline } from 'react-icons/io';
import { Person as PersonIcon, Logout as LogoutIcon } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const Header = React.forwardRef(({ user, onSignOut, backgroundColor = '#F6F6F6', activeColor = '#33363F' }, ref) => {
  const [profileAnchorEl, setProfileAnchorEl] = useState(null);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const router = useRouter();

  const getUserInitials = () => {
    const name = user?.displayName;
    const email = user?.email;
    if (name) {
      return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();
    } else if (email) {
      return email.split('@')[0].slice(0, 2).toUpperCase();
    }
    return 'U';
  };

  const handleProfileClick = (event) => {
    setProfileAnchorEl(event.currentTarget);
  };

  const handleProfileClose = () => {
    setProfileAnchorEl(null);
  };

  const handleLogoutClick = () => {
    setLogoutDialogOpen(true);
    handleProfileClose();
  };

  const handleLogoutCancel = () => {
    setLogoutDialogOpen(false);
  };

  const handleLogoutConfirm = async () => {
    setLogoutDialogOpen(false);
    try {
      if (onSignOut) {
        await onSignOut();
      }
      router.push('/login');
    } catch (error) {
      console.error('Sign out error:', error);
      alert('Failed to sign out. Please try again.');
    }
  };

  const handleProfileSettings = () => {
    if (user?.uid) {
      router.push(`/${user.uid}/settings`);
    } else {
      console.error('User UID not available');
      alert('User not found. Please log in again.');
      router.push('/login');
    }
    handleProfileClose();
  };

  return (
    <AppBar
      position="sticky"
      ref={ref}
      sx={{
        bgcolor: backgroundColor,
        boxShadow: 'none',
        width: '100%',
        mb: '20px',
        top: 0,
        zIndex: (theme) => theme.zIndex.appBar,
      }}
    >
      <Toolbar
        sx={{
          padding: { xs: '0 12px', sm: '0 16px' },
          minHeight: { xs: '56px', sm: '56px' },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Image src="/logo.png" alt="Kamari Logo" width={108} height={52} />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 } }}>
          <IconButton
            size="medium"
            aria-label="notifications"
            sx={{ color: 'text.primary' }}
          >
            <IoIosNotificationsOutline
              style={{ width: 24, height: 24, color: activeColor }}
            />
          </IconButton>

          {user ? (
            <Box
              onClick={handleProfileClick}
              sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
              aria-controls={profileAnchorEl ? 'profile-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={profileAnchorEl ? 'true' : undefined}
            >
              <Avatar
                src={user.photoURL || undefined}
                alt={user.displayName || 'User Avatar'}
                sx={{
                  width: { xs: 32, sm: 36 },
                  height: { xs: 32, sm: 36 },
                  bgcolor: user.photoURL ? 'transparent' : '#33363F',
                  fontSize: '14px',
                  fontFamily: 'Manrope',
                  border: '1px solid lightgrey',
                }}
                imgProps={{ onError: () => console.error('Avatar image failed to load') }}
              >
                {!user.photoURL && getUserInitials()}
              </Avatar>
            </Box>
          ) : (
            <Button
              onClick={() => router.push('/login')}
              sx={{ fontFamily: 'Manrope', textTransform: 'none', color: '#FB6616' }}
            >
              Login
            </Button>
          )}
        </Box>
      </Toolbar>

      <Menu
        id="profile-menu"
        anchorEl={profileAnchorEl}
        open={Boolean(profileAnchorEl)}
        onClose={handleProfileClose}
        disableScrollLock
        PaperProps={{
          sx: {
            width: '369px',
            height: '121px',
            borderRadius: '8.87px',
            bgcolor: '#F6F6F6',
            pt: '24px',
            pr: '21px',
            pb: '24px',
            pl: '21px',
            display: 'flex',
            flexDirection: 'column',
            gap: '3px',
            boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.15)',
            mt: 1,
          },
        }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem
          onClick={handleProfileSettings}
          sx={{
            fontFamily: 'Manrope',
            fontWeight: 600,
            fontSize: '12px',
            lineHeight: '100%',
            color: '#63666E',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' },
          }}
        >
          <PersonIcon sx={{ fontSize: '20px', color: '#63666E' }} />
          Account Settings
        </MenuItem>
        <MenuItem
          onClick={handleLogoutClick}
          sx={{
            fontFamily: 'Manrope',
            fontWeight: 600,
            fontSize: '12px',
            lineHeight: '100%',
            color: '#63666E',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' },
          }}
        >
          <LogoutIcon sx={{ fontSize: '20px', color: '#63666E' }} />
          Logout
        </MenuItem>
      </Menu>

      <Dialog
        open={logoutDialogOpen}
        onClose={handleLogoutCancel}
        disableScrollLock
        PaperProps={{
          sx: {
            borderRadius: '10px',
            p: { xs: 2, sm: 3 },
            width: 'auto',
            minWidth: '280px',
            maxWidth: 'calc(100vw - 32px)',
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
          },
        }}
      >
        <DialogTitle
          sx={{
            fontFamily: 'Manrope',
            fontSize: { xs: '18px', sm: '20px' },
            fontWeight: 600,
            color: '#222222',
            textAlign: 'center',
            p: '0 0 10px 0',
          }}
        >
          Confirm Logout
        </DialogTitle>
        <DialogContent sx={{ p: '10px 0' }}>
          <Typography
            sx={{
              fontFamily: 'Manrope',
              fontSize: '16px',
              color: '#63666E',
              textAlign: 'center',
            }}
          >
            Are you sure you want to log out?
          </Typography>
        </DialogContent>
        <DialogActions
          sx={{
            display: 'flex',
            justifyContent: 'center',
            gap: '16px',
            p: '16px 0 0 0',
          }}
        >
          <Button
            onClick={handleLogoutCancel}
            variant="outlined"
            sx={{
              fontFamily: 'Manrope',
              fontSize: '14px',
              textTransform: 'none',
              padding: '6px 16px',
              borderRadius: '8px',
              color: '#222222',
              borderColor: '#858585',
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleLogoutConfirm}
            variant="contained"
            sx={{
              fontFamily: 'Manrope',
              fontSize: '14px',
              textTransform: 'none',
              padding: '6px 16px',
              borderRadius: '8px',
              bgcolor: '#FB6616',
              '&:hover': { bgcolor: '#E65A14' },
            }}
          >
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </AppBar>
  );
});

Header.displayName = 'Header';
export default Header;
