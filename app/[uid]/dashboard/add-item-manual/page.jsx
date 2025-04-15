// app/[uid]/dashboard/add-item-manual/page.jsx
'use client';

// --- React & Next.js Imports ---
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";

// --- MUI Imports ---
import {
    Box, useTheme, CircularProgress, Typography, TextField, Button,
    InputAdornment, IconButton, Paper, useMediaQuery
} from "@mui/material";
import CloudUploadIcon from '@mui/icons-material/CloudUpload'; // Import Cloud Upload Icon
import SmartphoneIcon from '@mui/icons-material/Smartphone';

// --- Firebase Imports ---
import { onAuthStateChanged } from "firebase/auth";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, storage } from "../../../../lib/firebase"; // Adjust path

// --- Component Imports ---
import Header from "../../../components/Header"; // Adjust path

// --- Style Constants (Copied from previous manual page) ---
const inputMaxWidth = 329;
const inputHeight = 51.40;
const descHeight = 162; // Approx height for description multiline
const borderRadiusValue = '13.89px';
const inputBorderColor = 'rgba(187, 188, 191, 1)';
const inputBgColor = 'rgba(254, 254, 254, 1)';
const submitButtonWidth = 170.88; // Max width for submit button container
const submitButtonHeight = 51.40;


// --- Desktop Warning ---
const DesktopWarning = () => ( <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', textAlign: 'center', p: 3, bgcolor: 'background.paper' }}> <SmartphoneIcon sx={{ fontSize: 60, mb: 2, color: 'text.secondary' }} /> <Typography variant="h5" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>Mobile View Recommended</Typography> <Typography variant="body1" color="text.secondary">This feature is designed for mobile use.<br />Please switch to a phone or use browser developer tools<br />to emulate a mobile screen for the intended experience.</Typography> </Box> );


// ========================================================================
// --- Manual Add Item Page Component ---
// ========================================================================
export default function AddItemManualPage() {
    // --- State & Hooks ---
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const params = useParams();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const headerRef = useRef(null);

    // Form State (Manual Inputs)
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [costPrice, setCostPrice] = useState('');
    const [sellingPrice, setSellingPrice] = useState('');
    const [stock, setStock] = useState('');
    const [selectedFile, setSelectedFile] = useState(null); // For optional image
    const [previewUrl, setPreviewUrl] = useState(null); // For optional preview
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);

    // --- Auth Logic ---
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => { if (currentUser) { const routeUid = params.uid; if (routeUid && currentUser.uid !== routeUid) { router.push(`/login`); setUser(null); setLoading(false); return; } setUser(currentUser); } else { setUser(null); } setLoading(false); }); return () => unsubscribe();
     }, [router, params]);
    useEffect(() => { if (!loading && !user) router.push("/login"); }, [user, loading, router]);

    const handleSignOut = async () => { try { await signOut(auth); router.push('/login'); } catch (error) { console.error("Sign out error:", error); } };

    // --- File Handling ---
    const handleFileChange = (event) => {
        const file = event.target.files?.[0];
          if (event.target) event.target.value = null; // Reset input

        if (file && file.type.startsWith('image/')) {
            setSelectedFile(file);
            setError('');
            if (previewUrl) URL.revokeObjectURL(previewUrl); // Clean previous blob
            const objectUrl = URL.createObjectURL(file);
            setPreviewUrl(objectUrl);
        } else {
            // Don't clear existing preview if user cancels file selection
            if (file) { // Only set error if an invalid file was actually chosen
                 setSelectedFile(null);
                 if (previewUrl) URL.revokeObjectURL(previewUrl);
                 setPreviewUrl(null);
                 setError('Please select a valid image file.');
            }
             // If no file was selected (cancel), keep the current state
        }
    };

    const handleRemoveImage = () => {
        setSelectedFile(null);
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }
        setPreviewUrl(null);
        setError(''); // Clear errors when removing
    };
     // Cleanup preview URL on unmount
    useEffect(() => { let currentPreviewUrl = previewUrl; return () => { if (currentPreviewUrl) URL.revokeObjectURL(currentPreviewUrl); }; }, [previewUrl]);


    const handleUploadAreaClick = () => {
        // Trigger input only if no image is currently shown,
        // otherwise rely on the "Change" button
        if (!previewUrl) {
           fileInputRef.current?.click();
        }
    };

    const handleTriggerFileInput = () => {
        fileInputRef.current?.click(); // Specific handler for Change button
    };

    // --- Form Submission ---
    const handleCreateItem = async (event) => { // Renamed for consistency
        event.preventDefault();
        setError('');

        // Basic Validation (Title, Desc, Prices, Stock are required)
        if (!title.trim() || !description.trim() || sellingPrice === '' || costPrice === '' || stock === '') {
            setError('Please fill all required fields (Title, Description, Cost Price, Selling Price, Stock).'); return;
        }
        // Number Validation
        const numericCostPrice = Number(costPrice); const numericSellingPrice = Number(sellingPrice); const numericStock = Number(stock);
        if (isNaN(numericCostPrice) || numericCostPrice <= 0) { setError('Invalid Cost Price.'); return; }
        if (isNaN(numericSellingPrice) || numericSellingPrice <= 0) { setError('Invalid Selling Price.'); return; }
        if (isNaN(numericStock) || numericStock < 0 || !Number.isInteger(numericStock)) { setError('Invalid Stock Quantity.'); return; }
        if (!user?.uid) { setError("User authentication error."); return; }

        setIsSubmitting(true);
        console.log("--- Starting Manual Item Creation ---");

        try {
            let downloadURL = null; // Initialize imageUrl as null

            // 1. Upload Image *if* selected
            if (selectedFile) {
                console.log("Uploading image...");
                const filePath = `items/${user.uid}/${Date.now()}_${selectedFile.name}`;
                const storageRef = ref(storage, filePath);
                const uploadTask = uploadBytesResumable(storageRef, selectedFile);
                await uploadTask;
                downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                console.log("Image upload successful:", downloadURL);
            } else {
                 console.log("No image selected, skipping upload.");
            }

            // 2. Add Item Data to Firestore
            console.log("Saving item data to Firestore...");
            const itemsCollectionRef = collection(db, 'users', user.uid, 'items');
            const itemData = {
                title: title.trim(),
                description: description.trim(),
                costPrice: numericCostPrice,
                sellingPrice: numericSellingPrice,
                stock: numericStock,
                createdAt: serverTimestamp(),
                createdBy: user.uid,
                // Conditionally add imageUrl only if upload occurred
                ...(downloadURL && { imageUrl: downloadURL })
            };
            const docRef = await addDoc(itemsCollectionRef, itemData);
            console.log("--- Manual Item Creation Successful (ID:", docRef.id, ") ---");

            // 3. Navigate back to dashboard
            router.push(`/${user.uid}/dashboard`);

        } catch (error) {
            console.error("Manual item creation failed:", error);
            setError(`Error creating item: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- Render Logic ---
    if (loading) { return (<Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}><CircularProgress size={60} /></Box>); }
     if (!isMobile) { return <DesktopWarning />; }
    if (!user) { return null; } // Wait for user

    return (
        <Box sx={{  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: "center", bgcolor: '#F8F8F8', width:"100%" }}>
            {/* Use Header with default background */}
            <Header user={user} onSignOut={handleSignOut} ref={headerRef} />

                <Box component="form" onSubmit={handleCreateItem} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: "center", gap: { xs: 1.5, sm: 2 }, width: '100%', maxWidth: `${inputMaxWidth}px`, mt: 5, height: "100vh" }}>

                    {/* --- NEW Image Upload Button --- */}
                    <input type="file" ref={fileInputRef} onChange={handleFileChange}accept="image/*"style={{ display: 'none' }} />
                    <Box
                    onClick={handleUploadAreaClick} // Click triggers input only when no preview
                    sx={{
                        width: '100%',
                        minHeight: 200,
                        border: previewUrl ? `1px solid ${inputBorderColor}` : ``,
                        borderRadius: borderRadiusValue,
                        p: previewUrl ? 1 : 4, // Adjust padding based on content
                        mb: 2,
                        textAlign: 'center',
                        cursor: !previewUrl ? 'pointer' : 'default', // Pointer cursor only for upload prompt
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative', // Needed for positioning buttons if desired later
                        overflow: 'hidden', // Keep image within borders
                        transition: 'border 0.2s ease, background-color 0.2s ease', // Smooth transition
                    }}
                >
                    {previewUrl ? (
                        // --- Content when image IS selected ---
                        <>
                            <img
                                src={previewUrl}
                                alt="Preview"
                                style={{
                                    display: 'block',
                                    maxWidth: '100%', // Fill width available (respects padding)
                                    maxHeight: '250px', // Limit preview height
                                    height: 'auto', // Maintain aspect ratio
                                    objectFit: 'contain', // Ensure whole image is visible
                                }}
                            />
                            {/* Buttons BELOW the image preview */}
                            <Box sx={{ mt: 1, width: '100%', display: 'flex', justifyContent: 'center', gap: 1 }}>
                                <Button
                                    variant="text"
                                    size="small"
                                    onClick={handleTriggerFileInput} // Use specific handler for button
                                >
                                    Change
                                </Button>
                                <Button
                                    variant="text"
                                    size="small"
                                    color="error"
                                    onClick={handleRemoveImage}
                                >
                                    Remove
                                </Button>
                            </Box>
                        </>
                    ) : (
                        // --- Content when NO image is selected ---
                        <>
                            <Image
                                src="/Upload.png" // Your upload icon image
                                width={97}
                                height={97}
                                alt="Upload Icon"
                                style={{ opacity: 0.7 }} // Make icon slightly less prominent
                            />
                            <Typography variant="body1" sx={{ fontWeight: 600, fontSize: "14.27px", fontFamily: "Manrope", color: "rgba(187, 188, 191, 1)", mt: 1 }}>
                                Add image
                            </Typography>
                           </>
                    )}
                </Box>
                    {/* --- End Image Upload --- */}


                     {/* --- Manual Inputs --- */}
                    <TextField label="Title" variant="outlined" required value={title} onChange={(e) => setTitle(e.target.value)} sx={{ width: '100%', '.MuiOutlinedInput-root': { height: `${inputHeight}px`, borderRadius: borderRadiusValue, bgcolor: inputBgColor, '& .MuiInputBase-input::placeholder': { fontFamily: 'Manrope, sans-serif',fontWeight: 500,fontSize: '14.27px',lineHeight: '100%',letterSpacing: '0%',color: 'rgba(66, 64, 61, 1)',opacity: 1,},} }} />
                    <TextField label="Description" variant="outlined" required multiline rows={4} value={description} onChange={(e) => setDescription(e.target.value)} sx={{ width: '100%', '.MuiOutlinedInput-root': { borderRadius: borderRadiusValue, bgcolor: inputBgColor,'& .MuiInputBase-input::placeholder': { fontFamily: 'Manrope, sans-serif',fontWeight: 500,fontSize: '14.27px',lineHeight: '100%',letterSpacing: '0%',color: 'rgba(66, 64, 61, 1)',opacity: 1,},} }} />
                    <TextField label="Cost Price" variant="outlined" required type="number" value={costPrice} onChange={(e) => setCostPrice(e.target.value)} InputProps={{  inputProps: { min: 0.01, step: 0.01 } }} sx={{ width: '100%', '.MuiOutlinedInput-root': { height: `${inputHeight}px`, borderRadius: borderRadiusValue, bgcolor: inputBgColor, '& .MuiInputBase-input::placeholder': { fontFamily: 'Manrope, sans-serif',fontWeight: 500,fontSize: '14.27px',lineHeight: '100%',letterSpacing: '0%',color: 'rgba(66, 64, 61, 1)',opacity: 1,},} }} />
                    <TextField label="Selling Price" variant="outlined" required type="number" value={sellingPrice} onChange={(e) => setSellingPrice(e.target.value)} InputProps={{  inputProps: { min: 0.01, step: 0.01 } }} sx={{ width: '100%', '.MuiOutlinedInput-root': { height: `${inputHeight}px`, borderRadius: borderRadiusValue, bgcolor: inputBgColor, '& .MuiInputBase-input::placeholder': { fontFamily: 'Manrope, sans-serif',fontWeight: 500,fontSize: '14.27px',lineHeight: '100%',letterSpacing: '0%',color: 'rgba(66, 64, 61, 1)',opacity: 1,},} }} />
                    <TextField label="Quantity in Stock" variant="outlined" required type="number" value={stock} onChange={(e) => setStock(e.target.value)} InputProps={{ inputProps: { min: 0, step: 1 } }} sx={{ width: '100%', '.MuiOutlinedInput-root': { height: `${inputHeight}px`, borderRadius: borderRadiusValue, bgcolor: inputBgColor, '& .MuiInputBase-input::placeholder': { fontFamily: 'Manrope, sans-serif',fontWeight: 500,fontSize: '14.27px',lineHeight: '100%',letterSpacing: '0%',color: 'rgba(66, 64, 61, 1)',opacity: 1,},} }} />

                    {/* Error Display */}
                    {error && <Typography color="error" variant="body2" sx={{ mt: 1, width: '100%', textAlign: 'center' }}>{error}</Typography>}

                    {/* Submit Button */}
                    <Button type="submit" variant="contained" disabled={isSubmitting} fullWidth sx={{ mt: 2, mb: 6 ,height: `${submitButtonHeight}px`, borderRadius: borderRadiusValue, textTransform: 'none', fontSize: '16px', fontWeight: '400', bgcolor: 'rgba(34, 34, 34, 1)', color: "rgba(255, 255, 255, 1)" }}>
                         {isSubmitting ? "Creating..." : 'Create Item'}
                     </Button>
                </Box>
            </Box>
    );
}