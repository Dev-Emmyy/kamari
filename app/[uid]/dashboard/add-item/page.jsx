// app/[uid]/dashboard/add-item/page.jsx
'use client';

// --- React & Next.js Imports ---
import { useRouter, useParams, useSearchParams } from "next/navigation"; // *** Added useSearchParams ***
import { useEffect, useState, useRef } from "react";
import Image from "next/image";

// --- MUI Imports ---
import { /* ... Keep necessary MUI imports ... */
    Box, useTheme, CircularProgress, Typography, TextField, Button, InputAdornment, IconButton, Paper, useMediaQuery, Alert
} from "@mui/material";
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate'; // For file input trigger

// --- Icon Imports ---
import { /* ... Keep necessary Icon imports ... */
    Edit as EditIcon, Check as CheckIcon, Close as CloseIcon, Smartphone as SmartphoneIcon
} from '@mui/icons-material';

// --- Firebase Imports ---
import { onAuthStateChanged } from "firebase/auth";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, storage } from "../../../../lib/firebase"; // Adjust path

// --- Component Imports ---
import Header from "../../../components/Header"; // Adjust path

// --- Style Constants (Copied relevant styles) ---
// ... (Keep relevant AddItemForm Styles constants) ...
const titleDescMaxWidth = 347.31; 
const titleHeight = 51.40; 
const descHeight = 162; 
const inputMaxWidth = 347.31; 
const inputHeight = 51.40; 
const buttonHeight = 51.40; 
const borderRadiusValue = '13.89px'; 
const borderRaidusColor =  "3px solid rgba(251, 102, 22, 1)" ;
const gradientBackground = 'rgba(30, 30, 30, 1)'; 
const buttonGradientBorder = 'rgba(30, 30, 30, 1)'; 
const buttonBgColor = 'rgba(246, 246, 246, 1)'; 
const buttonBorderWidth = 1; 
const titleFontWeight = 600; 
const titleFontSize = '14.27px'; 
const aiTextFontSize = '7.78px'; 
const aiTextFontWeight = 700; 
const inputBorderColor = 'rgba(187, 188, 191, 1)'; 
const inputBgColor = 'rgba(254, 254, 254, 1)';


// --- Desktop Warning ---
const DesktopWarning = () => ( <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', textAlign: 'center', p: 3, bgcolor: 'background.paper' }}> <SmartphoneIcon sx={{ fontSize: 60, mb: 2, color: 'text.secondary' }} /> <Typography variant="h5" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>Mobile View Recommended</Typography> <Typography variant="body1" color="text.secondary">This feature is designed for mobile use.<br />Please switch to a phone or use browser developer tools<br />to emulate a mobile screen for the intended experience.</Typography> </Box> );

// ========================================================================
// --- AddItemContent Component (MODIFIED FOR NEW FLOW) ---
// Receives initial data via props, handles OWN file selection for final upload
// ========================================================================
const AddItemContent = ({ user, router, initialData }) => {
    const [selectedFile, setSelectedFile] = useState(null); // For new file uploads
    const [previewUrl, setPreviewUrl] = useState(initialData?.preview || null); // Preview from initialData or new file
    const [generatedTitle, setGeneratedTitle] = useState(initialData?.title || '');
    const [generatedDescription, setGeneratedDescription] = useState(initialData?.description || '');
    const [costPrice, setCostPrice] = useState('');
    const [sellingPrice, setSellingPrice] = useState('');
    const [stock, setStock] = useState('');
    const [editingField, setEditingField] = useState(null);
    const [editValue, setEditValue] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [fileSelectError, setFileSelectError] = useState('');
    const fileInputRef = useRef(null);
    const theme = useTheme();
  
    // Cleanup preview URL (only for new files, not initialData.preview)
    useEffect(() => {
      return () => {
        if (previewUrl && previewUrl !== initialData?.preview) {
          URL.revokeObjectURL(previewUrl);
        }
      };
    }, [previewUrl, initialData?.preview]);
  
    const handleCreateItem = async (event) => {
      event.preventDefault();
      setError('');
      setFileSelectError('');
  
      // Validate fields (image is valid if either selectedFile or initialData.preview exists)
      if (!selectedFile && !initialData?.preview) {
        setFileSelectError('Please select an image.');
        return;
      }
      if (!generatedTitle.trim()) {
        setError('Please provide a title.');
        return;
      }
      if (!generatedDescription.trim()) {
        setError('Please provide a description.');
        return;
      }
      if (costPrice === '') {
        setError('Please enter a cost price.');
        return;
      }
      if (sellingPrice === '') {
        setError('Please enter a selling price.');
        return;
      }
      if (stock === '') {
        setError('Please enter the stock quantity.');
        return;
      }
  
      const numericCostPrice = Number(costPrice);
      const numericSellingPrice = Number(sellingPrice);
      const numericStock = Number(stock);
  
      if (isNaN(numericCostPrice) || numericCostPrice <= 0) {
        setError('Invalid Cost Price.');
        return;
      }
      if (isNaN(numericSellingPrice) || numericSellingPrice <= 0) {
        setError('Invalid Selling Price.');
        return;
      }
      if (isNaN(numericStock) || numericStock < 0 || !Number.isInteger(numericStock)) {
        setError('Invalid stock quantity.');
        return;
      }
      if (!user?.uid) {
        setError('User authentication error.');
        return;
      }
  
      setIsSubmitting(true);
      console.log('--- Starting Firebase Save (Add Item Page) ---');
      try {
        let imageUrl = initialData?.preview; // Default to existing preview URL
  
        // If a new file is selected, upload it
        if (selectedFile) {
          const filePath = `items/${user.uid}/${Date.now()}_${selectedFile.name}`;
          const storageRef = ref(storage, filePath);
          const uploadTask = uploadBytesResumable(storageRef, selectedFile);
          await uploadTask;
          imageUrl = await getDownloadURL(uploadTask.snapshot.ref);
        }
  
        // Save to Firestore
        const itemsCollectionRef = collection(db, 'users', user.uid, 'items');
        const itemData = {
          imageUrl, // Use either new upload URL or initialData.preview
          title: generatedTitle.trim(),
          description: generatedDescription.trim(),
          costPrice: numericCostPrice,
          sellingPrice: numericSellingPrice,
          stock: numericStock,
          createdAt: serverTimestamp(),
          createdBy: user.uid,
        };
        const docRef = await addDoc(itemsCollectionRef, itemData);
        console.log('--- Item Creation Successful (ID:', docRef.id, ') ---');
  
        router.push(`/${user.uid}/dashboard`);
      } catch (error) {
        console.error('Firebase operation failed:', error);
        setError(`Error creating item: ${error.message}`);
      } finally {
        setIsSubmitting(false);
      }
    };
  
    const handleEditClick = (fieldName, currentValue) => {
      setEditingField(fieldName);
      setEditValue(currentValue);
    };
  
    const handleEditChange = (event) => {
      setEditValue(event.target.value);
    };
  
    const handleEditSave = () => {
      if (editingField === 'title') setGeneratedTitle(editValue.trim());
      else if (editingField === 'description') setGeneratedDescription(editValue.trim());
      setEditingField(null);
      setEditValue('');
    };
  
    const handleEditCancel = () => {
      setEditingField(null);
      setEditValue('');
    };
  
    return (
      <Box
        component="form"
        onSubmit={handleCreateItem}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          gap: { xs: 1.5, sm: 2 },
          mt: 2,
          px: { xs: 1, sm: 0 },
          width: '100%',
          maxWidth: `${Math.max(titleDescMaxWidth, inputMaxWidth)}px`,
        }}
      >
        {/* Image Preview and Optional File Input */}
        <Box sx={{ width: '100%', mb: 2 }}>
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Preview"
              style={{ display: 'block', width: '100%', height: 'auto', borderRadius: '8px' }}
            />
          ) : (
            <Typography variant="body2" color="text.secondary">
              No image selected
            </Typography>
          )}
          {fileSelectError && (
            <Typography color="error" variant="body2" sx={{ mt: 1 }}>
              {fileSelectError}
            </Typography>
          )}
        </Box>
  
        {/* Title */}
        {editingField === 'title' ? (
          <Paper
            elevation={1}
            sx={{
              width: '100%',
              maxWidth: `${titleDescMaxWidth}px`,
              p: 1,
              borderRadius: borderRadiusValue,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <TextField
              variant="outlined"
              size="small"
              fullWidth
              autoFocus
              value={editValue}
              onChange={handleEditChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleEditSave();
                if (e.key === 'Escape') handleEditCancel();
              }}
              sx={{ '.MuiInputBase-root': { fontSize: titleFontSize, fontWeight: titleFontWeight } }}
            />
            <IconButton onClick={handleEditSave} color="success" aria-label="Save title">
              <CheckIcon />
            </IconButton>
            <IconButton onClick={handleEditCancel} color="error" aria-label="Cancel title edit">
              <CloseIcon />
            </IconButton>
          </Paper>
        ) : (
          <Paper
            elevation={0}
            sx={{
              width: '100%',
              maxWidth: `${titleDescMaxWidth}px`,
              minHeight: `${titleHeight}px`,
              background: gradientBackground,
              borderRadius: borderRadiusValue,
              border: borderRaidusColor,
              boxSizing: 'border-box',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              px: 2,
              py: 1,
            }}
          >
            <Typography
              sx={{
                fontFamily: 'Manrope, sans-serif',
                fontWeight: titleFontWeight,
                fontSize: titleFontSize,
                color: 'rgba(246, 246, 246, 1)',
                mr: 1,
                flexGrow: 1,
                lineHeight: '1.2',
              }}
            >
              {generatedTitle || 'Enter Title'}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flexShrink: 0 }}>
              <Typography
                sx={{
                  fontFamily: 'Manrope, sans-serif',
                  fontWeight: aiTextFontWeight,
                  fontSize: aiTextFontSize,
                  color: 'rgba(230, 96, 96, 1)',
                  opacity: 0.9,
                  mb: 0.5,
                  lineHeight: '1',
                }}
              >
                AI GENERATED
              </Typography>
              <IconButton
                size="small"
                onClick={() => handleEditClick('title', generatedTitle)}
                sx={{ p: 0.2, color: 'rgba(246, 246, 246, 1)', opacity: 0.8, '&:hover': { opacity: 1 } }}
                aria-label="Edit title"
              >
                <EditIcon sx={{ fontSize: '16px' }} />
              </IconButton>
            </Box>
          </Paper>
        )}
  
        {/* Description */}
        {editingField === 'description' ? (
          <Paper
            elevation={1}
            sx={{
              width: '100%',
              p: 1,
              borderRadius: borderRadiusValue,
              display: 'flex',
              alignItems: 'flex-start',
              gap: 1,
            }}
          >
            <TextField
              variant="outlined"
              size="small"
              fullWidth
              multiline
              rows={4}
              autoFocus
              value={editValue}
              onChange={handleEditChange}
              sx={{ '.MuiInputBase-root': { fontSize: '14px', lineHeight: '1.4' } }}
            />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <IconButton onClick={handleEditSave} color="success">
                <CheckIcon />
              </IconButton>
              <IconButton onClick={handleEditCancel} color="error">
                <CloseIcon />
              </IconButton>
            </Box>
          </Paper>
        ) : (
          <Paper
            elevation={0}
            sx={{
              width: '100%',
              minHeight: `${descHeight}px`,
              background: gradientBackground,
              borderRadius: borderRadiusValue,
              border: borderRaidusColor,
              boxSizing: 'border-box',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              p: 2,
            }}
          >
            <Typography
              sx={{
                fontFamily: 'Manrope, sans-serif',
                fontWeight: 600,
                fontSize: '14px',
                lineHeight: '1.4',
                color: 'rgba(246, 246, 246, 1)',
                mr: 1,
                flexGrow: 1,
                overflowWrap: 'break-word',
                whiteSpace: 'pre-wrap',
              }}
            >
              {generatedDescription || 'Enter Description'}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flexShrink: 0, pt: 0.5 }}>
              <Typography
                sx={{
                  fontFamily: 'Manrope, sans-serif',
                  fontWeight: aiTextFontWeight,
                  fontSize: aiTextFontSize,
                  color: 'rgba(230, 96, 96, 1)',
                  opacity: 0.9,
                  mb: 0.5,
                  lineHeight: '1',
                }}
              >
                AI GENERATED
              </Typography>
              <IconButton
                size="small"
                onClick={() => handleEditClick('description', generatedDescription)}
                sx={{ p: 0.2, color: 'rgba(246, 246, 246, 1)', opacity: 0.8, '&:hover': { opacity: 1 } }}
              >
                <EditIcon sx={{ fontSize: '16px' }} />
              </IconButton>
            </Box>
          </Paper>
        )}
  
        {/* Cost Price */}
        <TextField
          placeholder="Cost Price"
          variant="outlined"
          required
          type="number"
          value={costPrice}
          onChange={(e) => setCostPrice(e.target.value)}
          InputProps={{
            inputProps: {
              min: 0.01,
              step: 0.01,
            },
          }}
          sx={{
            width: '100%',
            '.MuiOutlinedInput-root': {
              height: `${inputHeight}px`,
              borderRadius: borderRadiusValue,
              border: `1px solid ${inputBorderColor}`,
              bgcolor: inputBgColor,
              '& fieldset': { border: 'none' },
              '&:hover fieldset': { border: 'none' },
              '&.Mui-focused fieldset': { border: 'none' },
              '& .MuiInputBase-input::placeholder': {
                fontFamily: 'Manrope, sans-serif',
                fontWeight: 500,
                fontSize: '14.27px',
                lineHeight: '100%',
                letterSpacing: '0%',
                color: 'rgba(66, 64, 61, 1)',
                opacity: 1,
              },
            },
          }}
        />
  
        {/* Selling Price */}
        <TextField
          placeholder="Selling Price"
          variant="outlined"
          required
          type="number"
          value={sellingPrice}
          onChange={(e) => setSellingPrice(e.target.value)}
          InputProps={{
            inputProps: {
              min: 0.01,
              step: 0.01,
            },
          }}
          sx={{
            width: '100%',
            '.MuiOutlinedInput-root': {
              height: `${inputHeight}px`,
              borderRadius: borderRadiusValue,
              border: `1px solid ${inputBorderColor}`,
              bgcolor: inputBgColor,
              '& fieldset': { border: 'none' },
              '&:hover fieldset': { border: 'none' },
              '&.Mui-focused fieldset': { border: 'none' },
              '& .MuiInputBase-input::placeholder': {
                fontFamily: 'Manrope, sans-serif',
                fontWeight: 500,
                fontSize: '14.27px',
                lineHeight: '100%',
                letterSpacing: '0%',
                color: 'rgba(66, 64, 61, 1)',
                opacity: 1,
              },
            },
          }}
        />
  
        {/* Stock */}
        <TextField
          placeholder="Quantity in Stock"
          variant="outlined"
          required
          type="number"
          value={stock}
          onChange={(e) => {
            const value = e.target.value;
            if (value === '' || /^[0-9]+$/.test(value)) {
              setStock(value);
            }
          }}
          InputProps={{
            inputProps: {
              min: 0,
              step: 1,
            },
          }}
          sx={{
            width: '100%',
            '.MuiOutlinedInput-root': {
              height: `${inputHeight}px`,
              borderRadius: borderRadiusValue,
              border: `1px solid ${inputBorderColor}`,
              bgcolor: inputBgColor,
              '& fieldset': { border: 'none' },
              '&:hover fieldset': { border: 'none' },
              '&.Mui-focused fieldset': { border: 'none' },
              '& .MuiInputBase-input::placeholder': {
                fontFamily: 'Manrope, sans-serif',
                fontWeight: 500,
                fontSize: '14.27px',
                lineHeight: '100%',
                letterSpacing: '0%',
                color: 'rgba(66, 64, 61, 1)',
                opacity: 1,
              },
            },
          }}
        />
  
        {/* Error Message */}
        {error && (
          <Typography color="error" variant="body2" sx={{ mt: 1, width: '100%', textAlign: 'center' }}>
            {error}
          </Typography>
        )}
  
        {/* Submit Button */}
        <Box
          sx={{
            mt: 3,
            mb: 5,
            p: `${buttonBorderWidth}px`,
            background: buttonGradientBorder,
            border: borderRaidusColor,
            borderRadius: `${parseFloat(borderRadiusValue) + buttonBorderWidth}px`,
            width: '100%',
            mx: 'auto',
            boxSizing: 'border-box',
            display: 'flex',
          }}
        >
          <Button
            type="submit"
            disabled={
              isSubmitting ||
              (!selectedFile && !initialData?.preview) ||
              !generatedTitle.trim() ||
              !generatedDescription.trim() ||
              costPrice === '' ||
              sellingPrice === '' ||
              stock === ''
            }
            variant="contained"
            fullWidth
            sx={{
              height: `${buttonHeight}px`,
              bgcolor: 'rgba(34, 34, 34, 1)',
              color: 'rgba(255, 255, 255, 1) !important',
              borderRadius: borderRadiusValue,
              border: 'none',
              textTransform: 'none',
              fontSize: '16px',
              fontWeight: '600',
              boxShadow: 'none',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pr: { xs: 6, sm: 7 },
              pl: { xs: 2, sm: 3 },
              '&:hover': {
                bgcolor: 'rgba(50, 50, 50, 1)',
                boxShadow: 'none',
              },
              '&:disabled': {
                bgcolor: 'rgba(0, 0, 0, 0.12)',
                color: 'rgba(0, 0, 0, 0.26)',
                boxShadow: 'none',
              },
            }}
          >
            {isSubmitting ? 'Applying...' : 'Accept'}
            <Box
              sx={{
                position: 'absolute',
                left: theme.spacing(2),
                top: '50%',
                transform: 'translateY(-50%)',
                display: 'flex',
                alignItems: 'center',
                lineHeight: 0,
              }}
            >
              <Image src="/loadLogo.png" alt="Logo" width={45} height={45} />
            </Box>
          </Button>
        </Box>
      </Box>
    );
  };


// ========================================================================
// --- Add Item Page Component (Uses Modified AddItemContent) ---
// ========================================================================
export default function AddItemPage() {
    // --- State & Hooks ---
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams(); // *** Hook to read query params ***
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const headerRef = useRef(null);

    // --- Extract Initial Data from Query Params ---
    const initialData = {
        title: searchParams.get('title') || '',
        description: searchParams.get('description') || '',
        preview: searchParams.get('preview') || null, // Get preview URL
    };

    // --- Auth Logic ---
    useEffect(() => { /* ... standard auth check ... */
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => { if (currentUser) { const routeUid = params.uid; if (routeUid && currentUser.uid !== routeUid) { router.push(`/login`); setUser(null); setLoading(false); return; } setUser(currentUser); } else { setUser(null); } setLoading(false); }); return () => unsubscribe();
    }, [router, params]);
    useEffect(() => { if (!loading && !user) router.push("/login"); }, [user, loading, router]);

    const handleSignOut = async () => { /* ... */ try { await signOut(auth); router.push('/login'); } catch (error) { console.error("Sign out error:", error); } };

    // --- Render Logic ---
    if (loading) { /* ... */ return (<Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}><CircularProgress size={60} /></Box>); }
     if (!isMobile) { return <DesktopWarning />; }
    if (!user) { return null; }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'rgba(66, 64, 61, 1)', justifyContent: 'center', alignItems: 'center' }}>
            <Header user={user} onSignOut={handleSignOut} ref={headerRef} backgroundColor = 'rgba(66, 64, 61, 1)' activeColor  =  "rgba(255, 255, 255, 1)"/>
            <Box component="main" sx={{ flexGrow: 1, width: '100%', p: { xs: 1, sm: 2 }, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {/* Pass user, router, and initialData from query params */}
                <AddItemContent user={user} router={router} initialData={initialData} />
            </Box>
        </Box>
    );
}