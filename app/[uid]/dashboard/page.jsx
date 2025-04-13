// app/[uid]/dashboard/page.jsx
"use client";

// --- React & Next.js Imports ---
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";

// --- MUI Imports ---
import {
    Box,
    useTheme,
    CircularProgress,
    Typography,
    ToggleButton,
    ToggleButtonGroup,
    TextField,
    Button,
    InputAdornment,
    IconButton,
    Paper,
    Skeleton,
    useMediaQuery
} from "@mui/material";

// --- Icon Imports ---
import EditIcon from '@mui/icons-material/Edit';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import SmartphoneIcon from '@mui/icons-material/Smartphone';

// --- Firebase Imports ---
import { onAuthStateChanged, signOut } from "firebase/auth";
import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
// Make sure all needed functions are imported
import { getFirestore, collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore";
// Adjust the path to your Firebase config file as needed!
import { auth, db, storage } from "../../../lib/firebase";

// --- Date Formatting ---
import { format } from 'date-fns'; // Ensure installed: npm install date-fns

// --- Component Imports ---
import Header from "../../components/Header"; // Adjust path if needed

// --- Style Constants ---
// Group Toggle Styles
const groupMaxWidth = 347.31;
const groupHeight = 51.40;
const groupBorderRadius = 13.89; // px
const borderWidth = 0.5;       // px
const gradientBorder = 'linear-gradient(90deg, rgba(223, 29, 29, 0.69) 7.21%, rgba(102, 102, 102, 0.38) 27.88%, rgba(226, 185, 21, 0.55) 53.85%, rgba(226, 185, 21, 0.4) 94.71%)';
const activeBgColor = 'rgba(209, 209, 209, 1)'; // #D1D1D1
const baseFontWeight = 400;
const baseFontSize = '16.67px';
const fontFamily = 'Instrument Sans, sans-serif';
const primaryGradientColor = 'rgba(223, 29, 29, 0.69)'; // For spinner

// Add Item Form Styles
const titleDescMaxWidth = 347.31;
const titleHeight = 51.40;
const descHeight = 162;
const inputMaxWidth = 347.31;
const inputHeight = 51.40;
const buttonWidth = 170.88;
const buttonHeight = 51.40;
const borderRadiusValue = '13.89px';
const gradientBackground = 'linear-gradient(90deg, rgba(223, 29, 29, 0.69) 7.21%, rgba(102, 102, 102, 0.38) 27.88%, rgba(226, 185, 21, 0.55) 53.85%, rgba(226, 185, 21, 0.4) 94.71%)';
const buttonGradientBorder = 'linear-gradient(90deg, #DF1D1D 7.21%, #666666 27.88%, #E2B915 53.85%, #E2B915 94.71%)';
const buttonBgColor = 'rgba(246, 246, 246, 1)';
const buttonBorderWidth = 1; // px
const titleFontWeight = 600;
const titleFontSize = '14.27px';
const aiTextFontSize = '7.78px';
const aiTextFontWeight = 700;
const inputBorderColor = 'rgba(187, 188, 191, 1)';
const inputBgColor = 'rgba(254, 254, 254, 1)';

// Inventory Card Styles (Moved outside components)
const cardMaxWidth = 372.29;
const cardHeight = 84.42; // Can be used for minHeight or skeleton height base
const cardBorderRadius = '8.32px';
const cardPaddingTB = '9.38px';
const cardPaddingLR = '10.32px';
const cardBg = 'rgba(255, 255, 255, 1)';
const cardGap = '9.38px';

const invTitleFontFamily = 'Manrope, sans-serif';
const invTitleFontWeight = 600;
const invTitleFontSize = '14.27px';
const invTitleColor = 'rgba(99, 102, 110, 1)';

const invDateFontFamily = 'Manrope, sans-serif';
const invDateFontWeight = 600;
const invDateFontSize = '12px';
const invDateColor = 'rgba(139, 139, 139, 1)';

const invStatusBoxHeight = '20.21px';
const invStatusBoxRadius = '11.89px';
const invStatusTextFontFamily = 'Manrope, sans-serif';
const invStatusTextFontWeight = 800;
const invStatusTextFontSize = '6.55px';

const invAmountFontFamily = 'Manrope, sans-serif';
const invAmountFontWeight = 600;
const invAmountFontSize = '12px';
const invAmountColor = 'rgba(30, 30, 30, 1)';

const invChevronSize = '25.32px';
const invChevronColor = 'rgba(51, 54, 63, 1)';

const invImageBoxSize = '84.42px';
const invImageBorderRadius = '8px';

const stockTextFontFamily = 'Manrope, sans-serif';
const stockTextFontWeight = 600;
const stockTextFontSize = '14px';
const stockTextColor = 'rgba(30, 30, 30, 1)';

const fulfillButtonWidth = '112px';
const fulfillButtonHeight = '41px';
const fulfillButtonRadius = '7px';
const fulfillButtonPadding = '12px 16px'; // Adjusted padding
const fulfillButtonBg = 'rgba(34, 34, 34, 1)';
const fulfillButtonTextColor = 'rgba(255, 255, 255, 1)';
const fulfillButtonFontFamily = 'Manrope, sans-serif';
const fulfillButtonFontWeight = 600;
const fulfillButtonFontSize = '12px';

const deleteButtonBg = 'rgba(216, 59, 59, 1)'; // #D83B3B


// --- Helper Functions ---
function formatDate(timestamp) {
  if (!timestamp || !timestamp.seconds) return 'N/A';
  try { return format(timestamp.toDate(), 'dd/MM/yyyy'); }
  catch (error) { console.error("Error formatting date:", error); return 'Invalid Date'; }
}
function formatCurrency(amount) {
   if (typeof amount !== 'number') return 'N/A';
   const formatter = new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0, maximumFractionDigits: 0 });
   return formatter.format(amount);
}

const DesktopWarning = () => (
    <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        textAlign: 'center',
        p: 3,
        bgcolor: 'background.paper'
    }}>
        <SmartphoneIcon sx={{ fontSize: 60, mb: 2, color: 'text.secondary' }} />
        <Typography variant="h5" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
            Mobile View Recommended
        </Typography>
        <Typography variant="body1" color="text.secondary">
            This application is designed for mobile use.
            <br />
            Please switch to a phone or use browser developer tools
            <br />
            to emulate a mobile screen for the intended experience.
        </Typography>
    </Box>
);

// ========================================================================
// --- AddItemContent Sub-Component ---
// ========================================================================
const AddItemContent = ({ user, onChangeView }) => {
    const [viewStage, setViewStage] = useState('initial');
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [generatedTitle, setGeneratedTitle] = useState('');
    const [generatedDescription, setGeneratedDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [stock, setStock] = useState('');
    const [editingField, setEditingField] = useState(null); // null, 'title', or 'description'
    const [editValue, setEditValue] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingAI, setIsLoadingAI] = useState(false);
    const [error, setError] = useState('');

    const fileInputRef = useRef(null);
    const theme = useTheme();

    // Cleanup preview URL
    useEffect(() => {
        let currentPreviewUrl = previewUrl;
        return () => { if (currentPreviewUrl) URL.revokeObjectURL(currentPreviewUrl); };
    }, [previewUrl]);

    const handleUploadClick = () => fileInputRef.current?.click();

    const handleFileChange = async (event) => {
        const file = event.target.files?.[0];
        if (event.target) event.target.value = null;

        if (!file || !file.type.startsWith('image/')) {
            setError(file ? 'Please select a valid image file.' : ''); setSelectedFile(null); if (previewUrl) URL.revokeObjectURL(previewUrl); setPreviewUrl(null); return;
        }
        setSelectedFile(file); setError(''); if (previewUrl) URL.revokeObjectURL(previewUrl);
        const objectUrl = URL.createObjectURL(file); setPreviewUrl(objectUrl);

        setViewStage('loading'); setIsLoadingAI(true); console.log("Calling API...");
        const formData = new FormData(); formData.append('image', file);
        const minLoadingTimePromise = new Promise(resolve => setTimeout(resolve, 5000)); // Ensure 5s loading
        const fetchPromise = fetch('/api/analyzeimage', { method: 'POST', body: formData });

        try {
            const [response] = await Promise.all([fetchPromise, minLoadingTimePromise]);
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || `API Error: ${response.statusText}`);
            console.log("API Success:", result);
            setGeneratedTitle(result.title || `Item ${file.name.split('.')[0]}`); setGeneratedDescription(result.description || "No description.");
            setAmount(''); setStock(''); setViewStage('form');
        } catch (apiError) {
            console.error("API Call failed:", apiError); setError(`Analyze failed: ${apiError.message}`);
            setViewStage('initial'); setSelectedFile(null); setPreviewUrl(null);
        } finally { setIsLoadingAI(false); }
    };

    // --- Firebase Create Item Logic ---
    const handleCreateItem = async (event) => {
        event.preventDefault(); setError('');
        if (!selectedFile || !generatedTitle.trim() || amount === '' || stock === '') { setError('Please fill required fields.'); return; }
        const numericAmount = Number(amount); const numericStock = Number(stock);
        if (isNaN(numericAmount) || numericAmount <= 0) { setError('Invalid amount.'); return; }
        if (isNaN(numericStock) || numericStock < 0 || !Number.isInteger(numericStock)) { setError('Invalid stock quantity.'); return; }
        if (!user?.uid) { setError("User error."); return; }

        setIsSubmitting(true); console.log("--- Starting Firebase Upload & Save ---");
        try {
            const filePath = `items/${user.uid}/${Date.now()}_${selectedFile.name}`;
            const storageRef = ref(storage, filePath); const uploadTask = uploadBytesResumable(storageRef, selectedFile);
            await uploadTask;
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            const itemsCollectionRef = collection(db, 'users', user.uid, 'items');
            const itemData = { imageUrl: downloadURL, title: generatedTitle.trim(), description: generatedDescription.trim(), amount: numericAmount, stock: numericStock, createdAt: serverTimestamp(), createdBy: user.uid };
            const docRef = await addDoc(itemsCollectionRef, itemData);
            console.log("--- Item Creation Successful (ID:", docRef.id, ") ---");

            // --- CHANGE VIEW TO INVENTORY ON SUCCESS ---
            onChangeView('inventory'); // Switch view using the passed function

            // Reset local state AFTER changing view
            setViewStage('initial'); setSelectedFile(null); setPreviewUrl(null); setGeneratedTitle(''); setGeneratedDescription(''); setAmount(''); setStock('');

        } catch (error) {
            console.error("Firebase operation failed:", error); setError(`Error creating item: ${error.message}`);
        } finally { setIsSubmitting(false); }
    }; // End handleCreateItem

    // Inside AddItemContent component...

    // --- Edit State Handlers ---
    const handleEditClick = (fieldName, currentValue) => {
        setEditingField(fieldName); // Set which field is being edited
        setEditValue(currentValue); // Pre-fill the input with the current value
    };

    const handleEditChange = (event) => {
        setEditValue(event.target.value); // Update the temporary edit value
    };

    const handleEditSave = () => {
        if (editingField === 'title') {
            setGeneratedTitle(editValue.trim()); // Update the main title state
        } else if (editingField === 'description') {
            setGeneratedDescription(editValue.trim()); // Update the main description state
        }
        // Reset editing state
        setEditingField(null);
        setEditValue('');
    };

    const handleEditCancel = () => {
        // Just reset editing state without saving
        setEditingField(null);
        setEditValue('');
    };

    // --- Render Stages ---
    if (viewStage === 'loading') {
        return (
            <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                mt: 8, 
                p: 2, 
                height: '300px' 
            }}>
                <Box sx={{ 
                    position: 'relative', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                }}>
                    <CircularProgress 
                        size={80} 
                        thickness={4} 
                        sx={{ 
                            background: 'linear-gradient(90deg, rgba(223, 29, 29, 0.69) 7.21%, rgba(102, 102, 102, 0.38) 27.88%, rgba(226, 185, 21, 0.55) 53.85%, rgba(226, 185, 21, 0.4) 94.71%)',
                            borderRadius: '50%',
                            '& .MuiCircularProgress-circle': {
                                stroke: 'url(#gradient)'
                            }
                        }} 
                    />
                    {/* Gradient definition */}
                    <svg width="0" height="0">
                        <defs>
                            <linearGradient id="gradient" gradientTransform="rotate(90)">
                                <stop offset="7.21%" stopColor="rgba(223, 29, 29, 0.69)" />
                                <stop offset="27.88%" stopColor="rgba(102, 102, 102, 0.38)" />
                                <stop offset="53.85%" stopColor="rgba(226, 185, 21, 0.55)" />
                                <stop offset="94.71%" stopColor="rgba(226, 185, 21, 0.4)" />
                            </linearGradient>
                        </defs>
                    </svg>
                    {/* Centered Text */}
                    <Box sx={{ 
                        position: 'absolute', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center' 
                    }}>
                        <Typography variant="caption" sx={{ fontWeight: 'medium', color: 'text.secondary' }}>
                            Generating...
                        </Typography>
                    </Box>
                </Box>
            </Box>
        );
    }
    if (viewStage === 'form') {
        return (
             <Box component="form" onSubmit={handleCreateItem} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: { xs: 1.5, sm: 2 }, mt: 2, px: { xs: 1, sm: 0 } }}>
                 {previewUrl && ( <Box sx={{ width: '100%', maxWidth: '350px', mb: 2 }}> <img src={previewUrl} alt="Preview" style={{ display: 'block', width: '100%', height: 'auto', borderRadius: '8px' }}/> </Box> )}
                 {editingField === 'title' ? (
                     // --- EDITING TITLE ---
                     <Paper elevation={1} sx={{ width: '100%', maxWidth: `${titleDescMaxWidth}px`, p: 1, borderRadius: borderRadiusValue, display: 'flex', alignItems: 'center', gap: 1 }}>
                         <TextField
                             variant="outlined"
                             size="small"
                             fullWidth
                             autoFocus
                             value={editValue}
                             onChange={handleEditChange}
                             onKeyDown={(e) => { if (e.key === 'Enter') handleEditSave(); if (e.key === 'Escape') handleEditCancel(); }} // Optional keyboard shortcuts
                             sx={{
                                 '.MuiInputBase-root': { fontSize: titleFontSize, fontWeight: titleFontWeight }, // Match display font
                             }}
                         />
                         <IconButton onClick={handleEditSave} color="success" aria-label="Save title"><CheckIcon /></IconButton>
                         <IconButton onClick={handleEditCancel} color="error" aria-label="Cancel title edit"><CloseIcon /></IconButton>
                     </Paper>
                 ) : (
                    // --- DISPLAYING TITLE ---
                    <Paper elevation={0} sx={{ width: '100%', maxWidth: `${titleDescMaxWidth}px`, minHeight: `${titleHeight}px`, background: gradientBackground, borderRadius: borderRadiusValue, boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1 }}>
                        <Typography sx={{ fontFamily: 'Manrope, sans-serif', fontWeight: titleFontWeight, fontSize: titleFontSize, color: "rgba(51, 54, 63, 1)", mr: 1, flexGrow: 1, lineHeight: '1.2' }}>
                            {generatedTitle}
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flexShrink: 0 }}>
                             <Typography sx={{ fontFamily: 'Manrope, sans-serif', fontWeight: aiTextFontWeight, fontSize: aiTextFontSize, color: "rgba(230, 96, 96, 1)", opacity: 0.9, mb: 0.5, lineHeight: '1' }}>AI GENERATED</Typography>
                             {/* Updated onClick */}
                             <IconButton size="small" onClick={() => handleEditClick('title', generatedTitle)} sx={{ p: 0.2, color: "rgba(51, 54, 63, 1)", opacity: 0.8, '&:hover':{opacity: 1} }} aria-label="Edit title">
                                 <EditIcon sx={{ fontSize: '16px' }} />
                            </IconButton>
                         </Box>
                     </Paper>
                 )}

                 {/* --- Description Section --- */}
                 {editingField === 'description' ? (
                    // --- EDITING DESCRIPTION ---
                     <Paper elevation={1} sx={{ width: '100%', maxWidth: `${titleDescMaxWidth}px`, p: 1, borderRadius: borderRadiusValue, display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                         <TextField
                             variant="outlined"
                             size="small"
                             fullWidth
                             multiline
                             rows={4} // Adjust rows as needed
                             autoFocus
                             value={editValue}
                             onChange={handleEditChange}
                             sx={{
                                '.MuiInputBase-root': { fontSize: '14px', lineHeight: '1.4' }, // Match display font
                             }}
                         />
                         <Box sx={{display: 'flex', flexDirection: 'column', gap: 0.5}}>
                            <IconButton onClick={handleEditSave} color="success" aria-label="Save description"><CheckIcon /></IconButton>
                            <IconButton onClick={handleEditCancel} color="error" aria-label="Cancel description edit"><CloseIcon /></IconButton>
                         </Box>
                     </Paper>
                 ) : (
                    // --- DISPLAYING DESCRIPTION ---
                    <Paper elevation={0} sx={{ width: '100%', maxWidth: `${titleDescMaxWidth}px`, minHeight: `${descHeight}px`, background: gradientBackground, borderRadius: borderRadiusValue, boxSizing: 'border-box', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', p: 2 }}>
                        <Typography sx={{ fontFamily: 'Manrope, sans-serif', fontWeight: 600, fontSize: '14px', lineHeight: '1.4', color: "rgba(51, 54, 63, 1)", mr: 1, flexGrow: 1, overflowWrap: 'break-word', whiteSpace: 'pre-wrap' }}>
                            {generatedDescription}
                        </Typography>
                         <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flexShrink: 0, pt: 0.5 }}>
                             <Typography sx={{ fontFamily: 'Manrope, sans-serif', fontWeight: aiTextFontWeight, fontSize: aiTextFontSize, color: "rgba(230, 96, 96, 1)", opacity: 0.9, mb: 0.5, lineHeight: '1' }}>AI GENERATED</Typography>
                             {/* Updated onClick */}
                             <IconButton size="small" onClick={() => handleEditClick('description', generatedDescription)} sx={{ p: 0.2, color: "rgba(51, 54, 63, 1)", opacity: 0.8, '&:hover':{opacity: 1} }} aria-label="Edit description">
                                 <EditIcon sx={{ fontSize: '16px' }} />
                            </IconButton>
                         </Box>
                     </Paper>
                 )}
                 {/* Amount Input */}
                 <TextField placeholder="Amount" variant="outlined" required type="number" value={amount} onChange={(e) => setAmount(e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start">₦</InputAdornment>, inputProps: { min: 0.01, step: 0.01 } }} sx={{ width: '100%', maxWidth: `${inputMaxWidth}px`, '.MuiOutlinedInput-root': { height: `${inputHeight}px`, borderRadius: borderRadiusValue, border: `1px solid ${inputBorderColor}`, bgcolor: inputBgColor, '& fieldset': { border: 'none' }, '&:hover fieldset': { border: 'none' }, '&.Mui-focused fieldset': { border: 'none' } } }}/>
                 {/* Stock Input */}
                 <TextField placeholder="How many in stock?" variant="outlined" required type="number" value={stock} onChange={(e) => setStock(e.target.value)} InputProps={{ inputProps: { min: 0, step: 1 } }} sx={{ width: '100%', maxWidth: `${inputMaxWidth}px`, '.MuiOutlinedInput-root': { height: `${inputHeight}px`, borderRadius: borderRadiusValue, border: `1px solid ${inputBorderColor}`, bgcolor: inputBgColor, '& fieldset': { border: 'none' }, '&:hover fieldset': { border: 'none' }, '&.Mui-focused fieldset': { border: 'none' } } }}/>
                 {error && <Typography color="error" variant="body2" sx={{ mt: 1, width: '100%', maxWidth: '500px', textAlign: 'center' }}>{error}</Typography>}
                 {/* Create Button Wrapper */}
                 <Box sx={{ alignSelf: 'flex-start', mt: 3, p: `${buttonBorderWidth}px`, background: buttonGradientBorder, borderRadius: `${parseFloat(borderRadiusValue) + buttonBorderWidth}px`, maxWidth: `${buttonWidth}px`, width: '100%', boxSizing: 'border-box', display: 'flex' }}>
                     <Button type="submit" variant="contained" disabled={isSubmitting} fullWidth sx={{ height: `${buttonHeight}px`, bgcolor: buttonBgColor, color: theme.palette.text.primary, borderRadius: borderRadiusValue, border: 'none', textTransform: 'none', fontSize: '16px', fontWeight: '600', boxShadow: 'none', '&:hover': { bgcolor: theme.palette.action.hover, boxShadow: 'none' }, '&:disabled': { bgcolor: 'rgba(0, 0, 0, 0.12)' } }}>
                         {isSubmitting ? "Creating" : 'Create'}
                     </Button>
                 </Box>
                 {/* Cancel Button Removed */}
             </Box>
        );
     }
    // Default: Initial view ('initial')
    return (
         <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', mt: { xs: 10, sm: 20 }, p: 2, textAlign: 'center' }}>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} aria-hidden="true" />
            <Box onClick={handleUploadClick} sx={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3, '&:hover': { opacity: 0.8 } }} role="button" aria-label="Upload images" tabIndex={0} onKeyPress={(e) => { if (e.key === 'Enter' || e.key === ' ') handleUploadClick(); }}>
                <Image src="/upload.png" alt="" width={100} height={100} priority />
                <Typography variant="body1" color="rgba(0, 0, 0, 1)" sx={{ mt: 2, fontFamily: "Manrope, sans-serif", maxWidth: '150px' }}> Upload image </Typography>
            </Box>
            {error && <Typography color="error" variant="body2" sx={{ mt: 2 }}>{error}</Typography>}
        </Box>
    );
};

// ========================================================================
// --- InventoryItemCard Sub-Component (With Layout & Fulfill Edit) ---
// ========================================================================
const InventoryItemCard = ({ item, isExpanded, onExpandToggle, onDeleteItem, onFulfillItem }) => {
    const theme = useTheme();
    const [isFulfilling, setIsFulfilling] = useState(false);
    const [editStockValue, setEditStockValue] = useState(String(item.stock));

    // Reset edit mode when the card collapses or stock changes externally
    useEffect(() => {
        if (!isExpanded) {
            setIsFulfilling(false);
        }
        // Keep edit value in sync only if NOT currently editing
        if (!isFulfilling) {
            setEditStockValue(String(item.stock));
        }
    }, [isExpanded, item.stock, isFulfilling]);

    // Toggle the fulfill input visibility
    const handleToggleFulfillMode = () => {
        if (!isFulfilling) {
            // Entering edit mode: reset edit value to current stock
            setEditStockValue(String(item.stock));
        }
        setIsFulfilling(!isFulfilling); // Toggle the mode
    };

    // Handle confirming the stock update
    const handleConfirmFulfill = async () => {
        const newStock = Number(editStockValue); // Convert input string to number
        if (isNaN(newStock) || newStock < 0 || !Number.isInteger(newStock)) {
            alert("Please enter a valid whole number for stock (0 or more).");
            return;
        }
        await onFulfillItem(item.id, newStock); // Call parent function to update Firestore
        setIsFulfilling(false); // Exit edit mode after update attempt
    };
    

    // Determine status text and colors based on stock
    const statusText = item.stock > 0 ? 'FULFILLED' : 'OUT OF STOCK';
    const statusBgColor = item.stock > 0 ? 'rgba(234, 250, 235, 1)' : 'rgba(255, 235, 235, 1)';
    const statusTextColor = item.stock > 0 ? 'rgba(83, 125, 88, 1)' : 'rgba(194, 76, 76, 1)';

    return (
        <Paper
            elevation={1} // Use slight elevation
            sx={{
                width: '100%',
                maxWidth: `${cardMaxWidth}px`,
                borderRadius: cardBorderRadius,
                mb: 2,
                overflow: 'hidden',
                bgcolor: cardBg,
            }}
        >
            {/* Main Card Content Area */}
            <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: cardGap,
                p: `${cardPaddingTB} ${cardPaddingLR}`, // Use defined padding
            }}>
                {/* Left Side: Main info + Chevron/Amount Column */}
                <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' /* Align columns top */ }}>
                    {/* Col 1: Title, Date, Status */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 0.5, mr: 1 /* Space between cols */ }}>
                        <Typography sx={{ fontFamily: invTitleFontFamily, fontWeight: invTitleFontWeight, fontSize: invTitleFontSize, color: invTitleColor, lineHeight: '1.1' }}>
                            {item.title}
                        </Typography>
                        <Typography sx={{ fontFamily: invDateFontFamily, fontWeight: invDateFontWeight, fontSize: invDateFontSize, color: invDateColor, lineHeight: '1' }}>
                            {formatDate(item.createdAt)}
                        </Typography>
                        <Box sx={{ width: 'auto', px: 1, height: invStatusBoxHeight, borderRadius: invStatusBoxRadius, bgcolor: statusBgColor, display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 0.5 }}>
                            <Typography sx={{ fontFamily: invStatusTextFontFamily, fontWeight: invStatusTextFontWeight, fontSize: invStatusTextFontSize, color: statusTextColor, lineHeight: '1' }}>
                                {statusText}
                            </Typography>
                        </Box>
                    </Box>

                     {/* Col 2: Chevron (Top) + Amount (Bottom) - Aligned Right */}
                     <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between', height: '100%', minHeight: `calc(${invStatusBoxHeight} + 1.5em)` /* Approx height match */ }}>
                         <IconButton
                             onClick={() => onExpandToggle(item.id)}
                             size="small"
                             sx={{ color: invChevronColor, width: invChevronSize, height: invChevronSize, p: 0, mb: 1 }}
                             aria-expanded={isExpanded}
                             aria-label={isExpanded ? "Collapse item details" : "Expand item details"}
                         >
                             <ChevronRightIcon sx={{ transform: isExpanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
                         </IconButton>
                         <Typography sx={{ fontFamily: invAmountFontFamily, fontWeight: invAmountFontWeight, fontSize: invAmountFontSize, color: invAmountColor, lineHeight: '1', textAlign: 'right', mt: 'auto' /* Push amount down */ }}>
                            {formatCurrency(item.amount)}
                         </Typography>
                     </Box>
                </Box>

                {/* Right Side Image */}
                <Box sx={{
                    width: invImageBoxSize, height: invImageBoxSize,
                    borderRadius: invImageBorderRadius,
                    overflow: 'hidden', position: 'relative',
                    flexShrink: 0, bgcolor: theme.palette.grey[100] // Lighter placeholder
                }}>
                    <Image src={item.imageUrl} alt={item.title || 'Item'} layout="fill" objectFit="cover" />
                </Box>
            </Box>

            {/* Expanded Section */}
            {isExpanded && (
            <Box sx={{ p: `${cardPaddingTB} ${cardPaddingLR}`, pt: 1, borderTop: `1px solid ${theme.palette.divider}` }}>
                {/* Stock Count - Align Left */}
                <Typography sx={{
                    mb: 1.5,
                    textAlign: 'left', // <--- ALIGN LEFT
                    fontFamily: stockTextFontFamily,
                    fontWeight: stockTextFontWeight,
                    fontSize: stockTextFontSize,
                    color: stockTextColor
                }}>
                    {item.stock ?? 0} left in stock
                </Typography>

                {/* Conditional Fulfill Edit/Buttons */}
                {isFulfilling ? (
                    // View when editing stock
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, pb: 1 }}>
                    <Typography variant="caption" sx={{flexShrink: 0}}>New Qty:</Typography>
                        <TextField
                            type="number"
                            value={editStockValue}
                            onChange={(e) => setEditStockValue(e.target.value)}
                            size="small"
                            autoFocus
                            InputProps={{ inputProps: { min: 0, step: 1 } }}
                            sx={{ maxWidth: '80px', mx: 1, '.MuiInputBase-input': { textAlign: 'center' } }}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleConfirmFulfill(); }}
                        />
                        {/* Update Button - Reusing "Fulfill" Style */}
                        <Button
                            variant="contained"
                            size="small"
                            onClick={handleConfirmFulfill}
                            sx={{
                                // Reuse fulfill button styles if desired, or create specific 'update' styles
                                minWidth: 'auto', // Allow shrinking
                                height: fulfillButtonHeight, // Use defined height
                                borderRadius: fulfillButtonRadius,
                                bgcolor: fulfillButtonBg, // Black background
                                color: fulfillButtonTextColor,
                                fontFamily: fulfillButtonFontFamily,
                                fontWeight: fulfillButtonFontWeight,
                                fontSize: fulfillButtonFontSize,
                                px: 2, // Use reasonable padding
                                '&:hover': { bgcolor: 'grey.800' },
                                textTransform: 'none'
                            }}
                        >
                            Update {/* Changed text */}
                        </Button>
                        {/* Cancel Edit Button */}
                        <IconButton size="small" onClick={handleToggleFulfillMode} aria-label="Cancel stock edit">
                            <CloseIcon fontSize="small"/>
                        </IconButton>
                    </Box>
                ) : (
                    // View with initial Fulfill/Delete buttons
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1.5 }}>
                        {/* Fulfill Button (triggers edit mode) */}
                        <Button
                            variant="contained"
                            size="small"
                            onClick={handleToggleFulfillMode} // Trigger edit mode
                            // disabled={item.stock <= 0} // Decide if fulfilling 0 stock makes sense
                            sx={{
                                minWidth: fulfillButtonWidth, // Apply styles
                                height: fulfillButtonHeight,
                                borderRadius: fulfillButtonRadius,
                                bgcolor: fulfillButtonBg,
                                color: fulfillButtonTextColor,
                                fontFamily: fulfillButtonFontFamily,
                                fontWeight: fulfillButtonFontWeight,
                                fontSize: fulfillButtonFontSize,
                                px: fulfillButtonPadding, // Use the specified (large) padding
                                '&:hover': { bgcolor: 'grey.800' },
                                flex: 1,
                                textTransform: 'none'
                            }}
                        >
                            Fulfill
                        </Button>
                        {/* Delete Button */}
                        <Button
                            variant="contained"
                            size="small"
                            onClick={() => onDeleteItem(item.id, item.imageUrl)}
                            sx={{
                                minWidth: fulfillButtonWidth, // Apply styles (same width as fulfill?)
                                height: fulfillButtonHeight,
                                borderRadius: fulfillButtonRadius,
                                bgcolor: deleteButtonBg, // Specific delete background
                                color: fulfillButtonTextColor, // Assume white text works
                                fontFamily: fulfillButtonFontFamily,
                                fontWeight: fulfillButtonFontWeight,
                                fontSize: fulfillButtonFontSize,
                                px: fulfillButtonPadding, // Use the specified (large) padding
                                '&:hover': { bgcolor: '#b71c1c' }, // Darker red
                                flex: 1,
                                textTransform: 'none'
                            }}
                        >
                            Delete
                        </Button>
                    </Box>
                )}
            </Box>
        )}
        </Paper>
    );
}; // End InventoryItemCard


// ========================================================================
// --- InventoryContent Sub-Component (Handles Fetching & Display) ---
// ========================================================================
const InventoryContent = ({ user }) => {
    const [items, setItems] = useState([]);
    const [isLoadingInventory, setIsLoadingInventory] = useState(true);
    const [errorInventory, setErrorInventory] = useState(null);
    const [expandedItemId, setExpandedItemId] = useState(null);
    const theme = useTheme();

    // Fetch inventory items
    useEffect(() => {
        if (!user?.uid) { setIsLoadingInventory(false); setErrorInventory("User not identified."); return; }
        setIsLoadingInventory(true); setErrorInventory(null);
        const itemsCollectionRef = collection(db, 'users', user.uid, 'items');
        const q = query(itemsCollectionRef, orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const itemsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setItems(itemsData); setIsLoadingInventory(false);
        }, (error) => {
            console.error("Error fetching inventory:", error);
            setErrorInventory(`Failed to load inventory: ${error.message}`); setIsLoadingInventory(false);
        });
        return () => unsubscribe();
    }, [user]);

    const handleExpandToggle = (itemId) => setExpandedItemId(prevId => (prevId === itemId ? null : itemId));

    // Delete Item Logic
    const handleDeleteItem = async (itemId, imageUrl) => {
        if (!user?.uid || !itemId) return;
        if (!window.confirm(`Delete this item permanently?`)) return;
        try {
            const itemDocRef = doc(db, 'users', user.uid, 'items', itemId);
            await deleteDoc(itemDocRef);
            if (expandedItemId === itemId) setExpandedItemId(null);
            console.warn(`Storage deletion for ${imageUrl} skipped. Implement using refFromURL or stored filePath.`);
            // Add Storage deletion here if implemented
        } catch (error) { console.error("Error deleting item:", error); alert(`Failed to delete item: ${error.message}`); }
    };

    // Fulfill Item Logic (Update Stock in Firestore)
    const handleFulfillItem = async (itemId, newStock) => {
        if (!user?.uid || typeof newStock !== 'number' || newStock < 0 || !Number.isInteger(newStock)) {
            alert("Invalid stock value."); return;
        }
        console.log(`Updating stock for item ${itemId} to ${newStock}`);
        const itemDocRef = doc(db, 'users', user.uid, 'items', itemId);
        try {
            await updateDoc(itemDocRef, { stock: newStock });
            console.log(`Stock updated for item ${itemId}`);
            // Optionally show success message
        } catch (error) { console.error("Error updating stock:", error); alert(`Failed to update stock: ${error.message}`); }
    };

    const handleFilter = () => alert('Filter not implemented.');
    const handleSort = () => alert('Sort not implemented.');

    return (
        <Box>
            {/* Filter and Sort Row */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, px: { xs: 0, sm: 1 } }}>
                <Button size="small" startIcon={<FilterListIcon />} onClick={handleFilter} sx={{ textTransform: 'none', color: 'text.secondary' }}>Filter</Button>
                <Button size="small" startIcon={<SortIcon />} onClick={handleSort} sx={{ textTransform: 'none', color: 'text.secondary' }}>Sort</Button>
            </Box>
            {/* Inventory List */}
            <Box>
                {isLoadingInventory && (
                     <Box sx={{width: '100%', maxWidth: `${cardMaxWidth}px`, margin: '0 auto'}}>
                        {[...Array(3)].map((_, index) => (
                            // Use cardHeight and cardBorderRadius constants (defined globally now)
                            <Skeleton key={index} variant="rounded" width="100%" height={cardHeight + 60} /* Approx expanded height? */ sx={{ mb: 2, borderRadius: cardBorderRadius }} />
                        ))}
                     </Box>
                )}
                {!isLoadingInventory && errorInventory && (<Typography color="error" sx={{ textAlign: 'center', mt: 4 }}>{errorInventory}</Typography>)}
                {!isLoadingInventory && !errorInventory && items.length === 0 && (<Typography color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>Inventory is empty.</Typography>)}
                {!isLoadingInventory && !errorInventory && items.length > 0 && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        {items.map((item) => (
                            <InventoryItemCard
                                key={item.id}
                                item={item}
                                isExpanded={expandedItemId === item.id}
                                onExpandToggle={handleExpandToggle}
                                onDeleteItem={handleDeleteItem}
                                onFulfillItem={handleFulfillItem} // Pass the actual update handler
                            />
                        ))}
                    </Box>
                )}
            </Box>
        </Box>
    );
}; // End InventoryContent


// ========================================================================
// --- Main Dashboard Page Component ---
// ========================================================================
export default function Dashboard() {
    // --- State & Hooks ---
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeView, setActiveView] = useState('addItem');
    const router = useRouter();
    const params = useParams();
    const theme = useTheme();
    const headerRef = useRef(null);
    const activeTextColor = theme.palette.getContrastText(activeBgColor);
    const inactiveTextColor = theme.palette.text.secondary;
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    // --- Auth Logic ---
     useEffect(() => { /* ... Auth listener ... */
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
             if (currentUser) {
                const routeUid = params.uid;
                if (routeUid && currentUser.uid !== routeUid) { router.push(`/login`); setUser(null); setLoading(false); return; }
                setUser(currentUser);
            } else { setUser(null); }
            setLoading(false);
        });
        return () => unsubscribe();
    }, [router, params]);
     useEffect(() => { if (!loading && !user) router.push("/login"); }, [user, loading, router]);
    const handleSignOut = async () => { try { await signOut(auth); } catch (error) { console.error("Sign out error:", error); } };

    // --- View Toggle Handler ---
    const handleViewChange = (event, newView) => { if (newView !== null) setActiveView(newView); };

    // --- Render Logic ---
    if (loading) { return (<Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}><CircularProgress size={60} /></Box>); }
    if (!user) { return null; }

    if (!isMobile) {
        return <DesktopWarning />; // Use the component defined above
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#F8F8F8' }}>
            <Header user={user} onSignOut={handleSignOut} ref={headerRef} />
            <Box component="main" sx={{ flexGrow: 1, width: '100%' }}>
                {/* Toggle Group Wrapper */}
                <Box sx={{ p: `${borderWidth}px`, background: gradientBorder, borderRadius: `${groupBorderRadius + borderWidth}px`, maxWidth: `${groupMaxWidth}px`, width: 'calc(100% - 32px)', margin: { xs: '16px auto', sm: '24px auto' }, boxSizing: 'border-box' }}>
                    <ToggleButtonGroup value={activeView} exclusive onChange={handleViewChange} aria-label="View selection" fullWidth sx={{ display: 'flex', borderRadius: `${groupBorderRadius}px`, overflow: 'hidden', bgcolor: 'background.paper' }}>
                        <ToggleButton value="inventory" aria-label="inventory" disableRipple sx={{ flexGrow: 1, height: `${groupHeight}px`, textTransform: 'none', fontFamily: fontFamily, fontSize: baseFontSize, fontWeight: baseFontWeight, lineHeight: '100%', letterSpacing: '0%', border: 'none', borderRadius: 0, color: activeView === 'inventory' ? activeTextColor : inactiveTextColor, bgcolor: activeView === 'inventory' ? activeBgColor : 'transparent', '&:hover': { bgcolor: activeView !== 'inventory' ? theme.palette.action.hover : activeBgColor }, '&.Mui-selected': { color: activeTextColor, bgcolor: activeBgColor, '&:hover': { bgcolor: activeBgColor } } }}> Inventory </ToggleButton>
                        <ToggleButton value="addItem" aria-label="add item" disableRipple sx={{ flexGrow: 1, height: `${groupHeight}px`, textTransform: 'none', fontFamily: fontFamily, fontSize: baseFontSize, fontWeight: baseFontWeight, lineHeight: '100%', letterSpacing: '0%', border: 'none', borderRadius: 0, color: activeView === 'addItem' ? activeTextColor : inactiveTextColor, bgcolor: activeView === 'addItem' ? activeBgColor : 'transparent', '&:hover': { bgcolor: activeView !== 'addItem' ? theme.palette.action.hover : activeBgColor }, '&.Mui-selected': { color: activeTextColor, bgcolor: activeBgColor, '&:hover': { bgcolor: activeBgColor } } }}> Add Item </ToggleButton>
                    </ToggleButtonGroup>
                </Box>
                {/* Dynamic Content Area */}
                <Box sx={{ p: { xs: 2, sm: 3 } }}>
                    {/* Pass necessary props down */}
                    {activeView === 'addItem' && <AddItemContent user={user} onChangeView={setActiveView} />}
                    {activeView === 'inventory' && <InventoryContent user={user} />}
                </Box>
            </Box>
        </Box>
    );
}