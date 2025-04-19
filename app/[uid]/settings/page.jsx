'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  Button,
  IconButton,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  AddCircleOutline as AddCircleOutlineIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { onAuthStateChanged, signOut, updateProfile } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from '@/lib/firebase';
import Header from '@/app/components/Header';
import { nigeriaCities } from '@/lib/nigeriaCities';

const nigeriaStates = [
  'Abia', 'Adamawa', 'AkwaIbom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno', 'CrossRiver',
  'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano',
  'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo',
  'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
];

export default function SettingsPage() {
  const { uid } = useParams();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({
    brandName: '',
    phoneNumber: '',
    city: '',
    state: '',
    logoUrl: '',
  });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openSuccessDialog, setOpenSuccessDialog] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        if (currentUser.uid !== uid) {
          router.push('/login');
          return;
        }
        setUser(currentUser);
        setProfile((prev) => ({ ...prev, logoUrl: currentUser.photoURL || '' }));
        setLogoPreviewUrl(currentUser.photoURL || '');
      } else {
        setUser(null);
        router.push('/login');
      }
    });
    return () => unsubscribe();
  }, [router, uid]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const profileRef = doc(db, `users/${uid}/profile`, 'data');
        const profileSnap = await getDoc(profileRef);
        if (profileSnap.exists()) {
          const firestoreData = profileSnap.data();
          const logoToUse = firestoreData.logoUrl || user.photoURL || '';
          setProfile((prev) => ({
            ...prev,
            ...firestoreData,
            logoUrl: logoToUse,
          }));
          if (!logoFile) {
            setLogoPreviewUrl(logoToUse);
          }
        } else {
          const initialLogo = user.photoURL || '';
          setProfile((prev) => ({ ...prev, logoUrl: initialLogo }));
          if (!logoFile) {
            setLogoPreviewUrl(initialLogo);
          }
        }
      } catch (error) {
        console.error('Fetch profile error:', error);
        alert('Failed to load profile data.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [uid, user, logoFile]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Sign out error:', error);
      alert('Failed to sign out. Please try again.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('Image is too large (max 5MB).');
        return;
      }
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditLogoClick = () => {
    fileInputRef.current?.click();
  };

  const handleSave = async () => {
    if (!user) {
      alert('Authentication error. Please log in again.');
      return;
    }
    setIsSubmitting(true);
    try {
      let updatedLogoUrl = profile.logoUrl;
      if (logoFile) {
        const safeName = logoFile.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const fileName = `${uid}_${Date.now()}_${safeName}`;
        const storageRef = ref(storage, `logos/${fileName}`);
        console.log('Uploading to:', storageRef.fullPath);
        await auth.currentUser.getIdToken(true);
        const uploadResult = await uploadBytes(storageRef, logoFile);
        updatedLogoUrl = await getDownloadURL(uploadResult.ref);
        console.log('Uploaded logo URL:', updatedLogoUrl);
      }
      const profileRef = doc(db, `users/${uid}/profile`, 'data');
      const profileDataToSave = {
        brandName: profile.brandName,
        phoneNumber: profile.phoneNumber,
        city: profile.city,
        state: profile.state,
        logoUrl: updatedLogoUrl,
      };
      console.log('Saving profile to Firestore:', profileDataToSave);
      await setDoc(profileRef, profileDataToSave, { merge: true });
      if (updatedLogoUrl && updatedLogoUrl !== user.photoURL) {
        console.log('Updating Firebase Auth photoURL...');
        await updateProfile(auth.currentUser, { photoURL: updatedLogoUrl });
        setUser((prevUser) => (prevUser ? { ...prevUser, photoURL: updatedLogoUrl } : null));
      }
      setProfile((prev) => ({ ...prev, logoUrl: updatedLogoUrl }));
      setLogoPreviewUrl(updatedLogoUrl);
      setLogoFile(null);
      setOpenSuccessDialog(true);
    } catch (error) {
      console.error('Save profile error:', error);
      alert(`Failed to update profile: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (!user) return null;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#F8F8F8' }}>
      <Header user={user} onSignOut={handleSignOut} />
      <Box component="main" sx={{ flexGrow: 1, p: 2, display: 'flex', justifyContent: 'center' }}>
        <Box
          sx={{
            maxWidth: 'min(90vw, 318px)',
            width: '100%',
            fontFamily: 'Manrope',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}
        >
          <Typography
            sx={{
              fontFamily: 'Manrope',
              fontWeight: 400,
              fontSize: '20px',
              lineHeight: '100%',
              color: '#222222',
              mb: 2,
            }}
          >
            Brand Identity Settings
          </Typography>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={handleLogoChange}
          />
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              width: '100%',
              maxWidth: '318px',
              height: '100px',
              mx: 'auto',
              mb: 2,
            }}
          >
            {logoPreviewUrl ? (
              <Box sx={{ position: 'relative', width: '100px', height: '100px' }}>
                <img
                  src={logoPreviewUrl}
                  alt="Brand Logo"
                  style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '8px',
                    objectFit: 'cover',
                  }}
                  onError={(e) => {
                    console.error('Logo image failed to load, resetting preview');
                    e.target.style.display = 'none';
                    setLogoPreviewUrl('');
                  }}
                />
                <IconButton
                  onClick={handleEditLogoClick}
                  size="small"
                  aria-label="Change Logo"
                  sx={{
                    position: 'absolute',
                    bottom: -5,
                    right: -5,
                    bgcolor: 'rgba(34, 34, 34, 0.8)',
                    color: '#fff',
                    padding: '4px',
                    '&:hover': { bgcolor: 'rgba(34, 34, 34, 1)' },
                    border: '1px solid white',
                  }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Box>
            ) : (
              <Button
                startIcon={<AddCircleOutlineIcon />}
                onClick={handleEditLogoClick}
                sx={{
                  width: '100%',
                  maxWidth: '318px',
                  height: '51px',
                  borderRadius: '13.89px',
                  border: '1px solid #000',
                  bgcolor: '#222222',
                  color: '#fff',
                  fontFamily: 'Manrope',
                  fontWeight: 400,
                  fontSize: '16.67px',
                  textTransform: 'none',
                  display: 'flex',
                  gap: '10px',
                  justifyContent: 'center',
                  alignItems: 'center',
                  '&:hover': { bgcolor: '#333' },
                }}
              >
                Add Logo from Gallery
              </Button>
            )}
          </Box>
          <TextField
            name="brandName"
            label="Brand Name"
            value={profile.brandName}
            onChange={handleInputChange}
            fullWidth
            sx={{
              mt: 2,
              width: '315px',
              height: '51px',
              '& .MuiOutlinedInput-root': {
                borderRadius: '13.89px',
                bgcolor: '#FEFEFE',
                border: '1px solid #FB6616',
                '& fieldset': { border: 'none' },
              },
              '& .MuiInputLabel-root': { fontFamily: 'Manrope', fontSize: '16px' },
            }}
          />
          <TextField
            name="phoneNumber"
            label="Phone Number"
            value={profile.phoneNumber}
            onChange={handleInputChange}
            fullWidth
            sx={{
              mt: 2,
              width: '315px',
              height: '51px',
              '& .MuiOutlinedInput-root': {
                borderRadius: '13.89px',
                bgcolor: '#FEFEFE',
                border: '1px solid #858585',
                '& fieldset': { border: 'none' },
              },
              '& .MuiInputLabel-root': { fontFamily: 'Manrope', fontSize: '16px' },
            }}
          />
          <Select
            name="state"
            value={profile.state}
            onChange={handleInputChange}
            displayEmpty
            fullWidth
            sx={{
              mt: 2,
              width: '181px',
              height: '51px',
              borderRadius: '13.89px',
              bgcolor: 'rgba(254, 254, 254, 1)',
              border: '1px solid rgba(133, 133, 133, 1)',
              '& .MuiSelect-select': { padding: '11px 29px', fontFamily: 'Manrope', fontSize: '16px' },
              '& fieldset': { border: 'none' },
            }}
          >
            <MenuItem value="" disabled>Select State</MenuItem>
            {nigeriaStates.map((state) => (
              <MenuItem key={state} value={state}>{state}</MenuItem>
            ))}
          </Select>
          <Select
            name="city"
            value={profile.city}
            onChange={handleInputChange}
            displayEmpty
            fullWidth
            disabled={!profile.state}
            sx={{
              mt: 2,
              width: '181px',
              height: '51px',
              borderRadius: '13.89px',
              bgcolor: '#FEFEFE',
              border: '1px solid #858585',
              '& .MuiSelect-select': { padding: '11px 29px', fontFamily: 'Manrope', fontSize: '16px' },
              '& fieldset': { border: 'none' },
            }}
          >
            <MenuItem value="" disabled>Select City</MenuItem>
            {profile.state &&
              nigeriaCities[profile.state]?.map((city) => (
                <MenuItem key={city} value={city}>{city}</MenuItem>
              ))}
          </Select>
          <Button
            onClick={handleSave}
            disabled={isSubmitting}
            sx={{
              mt: 2,
              width: '318px',
              height: '51px',
              borderRadius: '13.89px',
              bgcolor: '#222222',
              color: '#fff',
              fontFamily: 'Manrope',
              fontWeight: 400,
              fontSize: '16.67px',
              textTransform: 'none',
              display: 'flex',
              gap: '10px',
              justifyContent: 'center',
              alignItems: 'center',
              '&:hover': { bgcolor: '#333' },
              '&:disabled': { bgcolor: 'rgba(0,0,0,0.38)' },
            }}
          >
            {isSubmitting ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'Update Identity'}
          </Button>
          <Dialog
            open={openSuccessDialog}
            onClose={() => setOpenSuccessDialog(false)}
            fullWidth
            maxWidth="xs"
            BackdropProps={{
              style: {
                backgroundColor: "rgba(34, 34, 34,)", // Dark overlay, matches app aesthetic
              },
            }}
            TransitionProps={{ timeout: 0 }} // Instant appearance, no fade
            sx={{
              '& .MuiDialog-paper': {
                borderRadius: '13.89px',
                width: 'min(90vw, 315px)',
                bgcolor: '#FEFEFE',
                border: '1px solid #FB6616',
                fontFamily: 'Manrope',
              },
            }}
          >
            <DialogTitle
              sx={{
                fontFamily: 'Manrope',
                fontWeight: 400,
                fontSize: '20px',
                color: '#222222',
                textAlign: 'center',
              }}
            >
              Success
            </DialogTitle>
            <DialogContent>
              <Typography
                sx={{
                  fontFamily: 'Manrope',
                  fontSize: '16px',
                  color: '#222222',
                  textAlign: 'center',
                }}
              >
                Profile updated successfully!
              </Typography>
            </DialogContent>
            <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
              <Button
                onClick={() => setOpenSuccessDialog(false)}
                sx={{
                  width: '100px',
                  height: '40px',
                  borderRadius: '13.89px',
                  bgcolor: '#222222',
                  color: '#fff',
                  fontFamily: 'Manrope',
                  fontSize: '16px',
                  textTransform: 'none',
                  '&:hover': { bgcolor: '#333' },
                }}
              >
                OK
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Box>
    </Box>
  );
}