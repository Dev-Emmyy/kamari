// app/[uid]/dashboard/page.jsx
"use client";

// --- React & Next.js Imports ---
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";

// --- MUI Imports ---
import { /* ... Keep necessary MUI imports ... */
    Box, useTheme, CircularProgress, Typography, ToggleButton, ToggleButtonGroup,
    TextField, Button, InputAdornment, IconButton, Paper, Skeleton, useMediaQuery,
    Snackbar, Alert // Added for error display
} from "@mui/material";

// --- Icon Imports ---
import { /* ... Keep necessary Icon imports ... */
    Edit as EditIcon, FilterList as FilterListIcon, Sort as SortIcon,
    ChevronRight as ChevronRightIcon, Check as CheckIcon, Close as CloseIcon,
    Smartphone as SmartphoneIcon
} from '@mui/icons-material';

// --- Firebase Imports ---
import { /* ... Keep necessary Firebase imports ... */ } from "firebase/auth"; // Keep auth imports
import { auth, db, storage } from "../../../lib/firebase"; // Keep config import
// Other Firebase imports only if directly used by Inventory/Sales components here
import { onAuthStateChanged, signOut } from "firebase/auth";
import { getStorage, ref, deleteObject,uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { getFirestore, collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore";


// --- Date Formatting ---
import { format } from 'date-fns';

// --- Component Imports ---
import Header from "../../components/Header";
import LoadingOverlay from "../../components/LoadingOverlay"; // *** Import the overlay ***

// --- Style Constants ---
// ... (Keep all relevant style constants) ...
const groupMaxWidth = 347.31; const groupHeight = 51.40; const groupBorderRadius = 13.89; const borderWidth = 0.5; const gradientBorder = 'linear-gradient(90deg, rgba(223, 29, 29, 0.69) 7.21%, rgba(102, 102, 102, 0.38) 27.88%, rgba(226, 185, 21, 0.55) 53.85%, rgba(226, 185, 21, 0.4) 94.71%)'; const activeBgColor = 'rgba(34, 34, 34, 1)'; const baseFontWeight = 400; const baseFontSize = '16.67px'; const fontFamily = 'Instrument Sans, sans-serif';
const cardMaxWidth = 372.29; const cardHeight = 84.42; const cardBorderRadius = '8.32px'; const cardPaddingTB = '9.38px'; const cardPaddingLR = '10.32px'; const cardBg = 'rgba(255, 255, 255, 1)'; const cardGap = '9.38px'; const invTitleFontFamily = 'Manrope, sans-serif'; const invTitleFontWeight = 600; const invTitleFontSize = '14.27px'; const invTitleColor = 'rgba(99, 102, 110, 1)'; const invDateFontFamily = 'Manrope, sans-serif'; const invDateFontWeight = 600; const invDateFontSize = '12px'; const invDateColor = 'rgba(139, 139, 139, 1)'; const invStatusBoxHeight = '20.21px'; const invStatusBoxRadius = '11.89px'; const invStatusTextFontFamily = 'Manrope, sans-serif'; const invStatusTextFontWeight = 800; const invStatusTextFontSize = '6.55px'; const invAmountFontFamily = 'Manrope, sans-serif'; const invAmountFontWeight = 600; const invAmountFontSize = '12px'; const invAmountColor = 'rgba(30, 30, 30, 1)'; const invChevronSize = '25.32px'; const invChevronColor = 'rgba(51, 54, 63, 1)'; const invImageBoxSize = '84.42px'; const invImageBorderRadius = '8px'; const stockTextFontFamily = 'Manrope, sans-serif'; const stockTextFontWeight = 600; const stockTextFontSize = '14px'; const stockTextColor = 'rgba(30, 30, 30, 1)'; const fulfillButtonWidth = '112px'; const fulfillButtonHeight = '41px'; const fulfillButtonRadius = '7px'; const fulfillButtonPadding = '12px 16px'; const fulfillButtonBg = 'rgba(34, 34, 34, 1)'; const fulfillButtonTextColor = 'rgba(255, 255, 255, 1)'; const fulfillButtonFontFamily = 'Manrope, sans-serif'; const fulfillButtonFontWeight = 600; const fulfillButtonFontSize = '12px'; const deleteButtonBg = 'rgba(216, 59, 59, 1)';
const mainButtonStyles = { mt: 1, mb: 3, borderStyle: 'none', bgcolor: "rgba(34, 34, 34, 1)", padding: "10px 12px", textTransform: "none", borderRadius: "13px", boxShadow: "0px 4px 8px 0px rgba(0, 0, 0, 0.15)", fontFamily: "'Instrument Sans', sans-serif", fontWeight: 400, fontSize: "14px", width: "369px", lineHeight: "normal", color: "#FFFFFF", height: "84px", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, '&:hover': { bgcolor: "rgba(50, 50, 50, 1)", }, '&:disabled': { bgcolor: 'rgba(0, 0, 0, 0.12)', color: 'rgba(0, 0, 0, 0.26)', boxShadow: 'none', } };


// --- Helper Functions ---
function formatDate(timestamp) { /* ... */ return format(timestamp.toDate(), 'dd/MM/yyyy'); }
function formatCurrency(amount) { /* ... */ const formatter = new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0, maximumFractionDigits: 0 }); return formatter.format(amount); }

// --- Desktop Warning ---
const DesktopWarning = () => ( <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', textAlign: 'center', p: 3, bgcolor: 'background.paper' }}> <SmartphoneIcon sx={{ fontSize: 60, mb: 2, color: 'text.secondary' }} /> <Typography variant="h5" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>Mobile View Recommended</Typography> <Typography variant="body1" color="text.secondary">This application is designed for mobile use.<br />Please switch to a phone or use browser developer tools<br />to emulate a mobile screen for the intended experience.</Typography> </Box> );

// --- InventoryItemCard (Keep Definition) ---
const InventoryItemCard = ({ item, isExpanded, onExpandToggle, onDeleteItem, onFulfillItem }) => { const theme = useTheme(); const [isFulfilling, setIsFulfilling] = useState(false); const [editStockValue, setEditStockValue] = useState(String(item.stock)); useEffect(() => { if (!isExpanded) { setIsFulfilling(false); } if (!isFulfilling) { setEditStockValue(String(item.stock)); } }, [isExpanded, item.stock, isFulfilling]); const handleToggleFulfillMode = () => { if (!isFulfilling) { setEditStockValue(String(item.stock)); } setIsFulfilling(!isFulfilling); }; const handleConfirmFulfill = async () => { const newStock = Number(editStockValue); if (isNaN(newStock) || newStock < 0 || !Number.isInteger(newStock)) { alert("Please enter a valid whole number for stock (0 or more)."); return; } await onFulfillItem(item.id, newStock); setIsFulfilling(false); }; const statusText = item.stock > 0 ? 'FULFILLED' : 'OUT OF STOCK'; const statusBgColor = item.stock > 0 ? 'rgba(234, 250, 235, 1)' : 'rgba(255, 235, 235, 1)'; const statusTextColor = item.stock > 0 ? 'rgba(83, 125, 88, 1)' : 'rgba(194, 76, 76, 1)'; return ( <Paper elevation={1} sx={{ width: '100%', maxWidth: `${cardMaxWidth}px`, borderRadius: cardBorderRadius, mb: 2, overflow: 'hidden', bgcolor: cardBg, }} > <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: cardGap, p: `${cardPaddingTB} ${cardPaddingLR}`, }}> <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}> <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 0.5, mr: 1 }}> <Typography sx={{ fontFamily: invTitleFontFamily, fontWeight: invTitleFontWeight, fontSize: invTitleFontSize, color: invTitleColor, lineHeight: '1.1' }}>{item.title}</Typography> <Typography sx={{ fontFamily: invDateFontFamily, fontWeight: invDateFontWeight, fontSize: invDateFontSize, color: invDateColor, lineHeight: '1' }}>{formatDate(item.createdAt)}</Typography> <Box sx={{ width: 'auto', px: 1, height: invStatusBoxHeight, borderRadius: invStatusBoxRadius, bgcolor: statusBgColor, display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 0.5 }}> <Typography sx={{ fontFamily: invStatusTextFontFamily, fontWeight: invStatusTextFontWeight, fontSize: invStatusTextFontSize, color: statusTextColor, lineHeight: '1' }}>{statusText}</Typography> </Box> </Box> <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between', height: '100%', minHeight: `calc(${invStatusBoxHeight} + 1.5em)` }}> <IconButton onClick={() => onExpandToggle(item.id)} size="small" sx={{ color: invChevronColor, width: invChevronSize, height: invChevronSize, p: 0, mb: 1 }} aria-expanded={isExpanded} aria-label={isExpanded ? "Collapse" : "Expand"} > <ChevronRightIcon sx={{ transform: isExpanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} /> </IconButton> <Typography sx={{ fontFamily: invAmountFontFamily, fontWeight: invAmountFontWeight, fontSize: invAmountFontSize, color: invAmountColor, lineHeight: '1', textAlign: 'right', mt: 'auto' }}>{formatCurrency(item.sellingPrice)}</Typography> </Box> </Box> <Box sx={{ width: invImageBoxSize, height: invImageBoxSize, borderRadius: invImageBorderRadius, overflow: 'hidden', position: 'relative', flexShrink: 0, bgcolor: theme.palette.grey[100] }}> <Image src={item.imageUrl} alt={item.title || 'Item'} layout="fill" objectFit="cover" /> </Box> </Box> {isExpanded && ( <Box sx={{ p: `${cardPaddingTB} ${cardPaddingLR}`, pt: 1, borderTop: `1px solid ${theme.palette.divider}` }}> <Typography sx={{ mb: 1.5, textAlign: 'left', fontFamily: stockTextFontFamily, fontWeight: stockTextFontWeight, fontSize: stockTextFontSize, color: stockTextColor }}>{item.stock ?? 0} left in stock</Typography> {isFulfilling ? ( <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, pb: 1 }}> <Typography variant="caption" sx={{flexShrink: 0}}>New Qty:</Typography> <TextField type="number" value={editStockValue} onChange={(e) => setEditStockValue(e.target.value)} size="small" autoFocus InputProps={{ inputProps: { min: 0, step: 1 } }} sx={{ maxWidth: '80px', mx: 1, '.MuiInputBase-input': { textAlign: 'center' } }} onKeyDown={(e) => { if (e.key === 'Enter') handleConfirmFulfill(); }} /> <Button variant="contained" size="small" onClick={handleConfirmFulfill} sx={{ minWidth: 'auto', height: fulfillButtonHeight, borderRadius: fulfillButtonRadius, bgcolor: fulfillButtonBg, color: fulfillButtonTextColor, fontFamily: fulfillButtonFontFamily, fontWeight: fulfillButtonFontWeight, fontSize: fulfillButtonFontSize, px: 2, '&:hover': { bgcolor: 'grey.800' }, textTransform: 'none' }} > Update </Button> <IconButton size="small" onClick={handleToggleFulfillMode} aria-label="Cancel stock edit"> <CloseIcon fontSize="small"/> </IconButton> </Box> ) : ( <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1.5 }}> <Button variant="contained" size="small" onClick={handleToggleFulfillMode} sx={{ minWidth: fulfillButtonWidth, height: fulfillButtonHeight, borderRadius: fulfillButtonRadius, bgcolor: fulfillButtonBg, color: fulfillButtonTextColor, fontFamily: fulfillButtonFontFamily, fontWeight: fulfillButtonFontWeight, fontSize: fulfillButtonFontSize, px: fulfillButtonPadding, '&:hover': { bgcolor: 'grey.800' }, flex: 1, textTransform: 'none' }} > Fulfill </Button> <Button variant="contained" size="small" onClick={() => onDeleteItem(item.id, item.imageUrl)} sx={{ minWidth: fulfillButtonWidth, height: fulfillButtonHeight, borderRadius: fulfillButtonRadius, bgcolor: deleteButtonBg, color: fulfillButtonTextColor, fontFamily: fulfillButtonFontFamily, fontWeight: fulfillButtonFontWeight, fontSize: fulfillButtonFontSize, px: fulfillButtonPadding, '&:hover': { bgcolor: '#b71c1c' }, flex: 1, textTransform: 'none' }} > Delete </Button> </Box> )} </Box> )} </Paper> ); };

// --- InventoryContent (MODIFIED BUTTON LOGIC) ---
const InventoryContent = ({ user, onGenerateWithAiClick }) => {
    const [items, setItems] = useState([]);
    const [isLoadingInventory, setIsLoadingInventory] = useState(true);
    const [errorInventory, setErrorInventory] = useState(null);
    const [expandedItemId, setExpandedItemId] = useState(null);
    const theme = useTheme();
    const router = useRouter();

    useEffect(() => { /* ... fetch logic same ... */
        if (!user?.uid) { setIsLoadingInventory(false); setErrorInventory("User not identified."); return; } setIsLoadingInventory(true); setErrorInventory(null); const itemsCollectionRef = collection(db, 'users', user.uid, 'items'); const q = query(itemsCollectionRef, orderBy('createdAt', 'desc')); const unsubscribe = onSnapshot(q, (querySnapshot) => { const itemsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })); setItems(itemsData); setIsLoadingInventory(false); }, (error) => { console.error("Error fetching inventory:", error); setErrorInventory(`Failed to load inventory: ${error.message}`); setIsLoadingInventory(false); }); return () => unsubscribe();
    }, [user]);

    const handleExpandToggle = (itemId) => setExpandedItemId(prevId => (prevId === itemId ? null : itemId));
    const handleDeleteItem = async (itemId, imageUrl) => { /* ... delete logic same ... */
        if (!user?.uid || !itemId) return; if (!window.confirm(`Delete this item permanently?`)) return; try { const itemDocRef = doc(db, 'users', user.uid, 'items', itemId); await deleteDoc(itemDocRef); if (imageUrl) { try { const storageRef = ref(storage, imageUrl); await deleteObject(storageRef); } catch (storageError) { console.error("Error deleting storage object:", storageError); } } if (expandedItemId === itemId) setExpandedItemId(null); } catch (error) { console.error("Error deleting item:", error); alert(`Failed to delete item: ${error.message}`); }
     };
    const handleFulfillItem = async (itemId, newStock) => { /* ... fulfill logic same ... */
         if (!user?.uid || typeof newStock !== 'number' || newStock < 0 || !Number.isInteger(newStock)) { alert("Invalid stock value."); return; } const itemDocRef = doc(db, 'users', user.uid, 'items', itemId); try { await updateDoc(itemDocRef, { stock: newStock }); } catch (error) { console.error("Error updating stock:", error); alert(`Failed to update stock: ${error.message}`); }
     };
    const handleFilter = () => alert('Filter not implemented.');
    const handleSort = () => alert('Sort not implemented.');

    // --- *** Trigger AI File Input (Passed from Parent Dashboard) *** ---

    // --- Navigation Handler for Manual Add ---
    const handleNavigateToAddItemManual = () => {
        if (user?.uid) router.push(`/${user.uid}/dashboard/add-item-manual`);
        else console.error("Cannot navigate: User UID missing.");
    };

    return (
        <Box>
            {/* --- UPDATED Two-Part Button --- */}
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mx: 'auto' }}>
                <Box sx={{ ...mainButtonStyles, p: 0, cursor: 'default', justifyContent: 'center', '&:hover': { bgcolor: "rgba(34, 34, 34, 1)" } }} >
                    {/* Clickable Area 1: Generate with AI (Triggers prop function) */}
                    <Box onClick={onGenerateWithAiClick} sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', p: 1, flex: 1, justifyContent: 'center', height: '100%' }}>
                        <Image src="/capture.png" alt="Generate with AI Icon" width={61} height={61} priority style={{ flexShrink: 0 }} />
                        <Typography sx={{ fontFamily: "Manrope", fontWeight: 600, color: "rgba(251, 102, 22, 1)", fontSize: "12px", width: "84px", textAlign: "flex-start", flexShrink: 0 }}> Generate item with AI </Typography>
                    </Box>
                    {/* Separator */}
                    <Box sx={{ width: '2px', height: '45px', bgcolor: 'rgba(246, 246, 246, 0.5)',flexShrink: 0 }} />
                    {/* Clickable Area 2: Create Manually */}
                    <Box onClick={handleNavigateToAddItemManual} sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', p: 1, flex: 1, justifyContent: 'center', height: '100%' }}>
                        <Typography sx={{ fontFamily: "Manrope", fontWeight: 700, color: "rgba(246, 246, 246, 1)", fontSize: "12px", width: "96px", textAlign: "center", flexShrink: 0 }}> Create item without image </Typography>
                    </Box>
                </Box>
            </Box>

            {/* Filter and Sort Row */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, px: { xs: 0, sm: 1 }, maxWidth: `${cardMaxWidth}px`, mx: 'auto' }}>
                 <Button size="small" startIcon={<FilterListIcon />} onClick={handleFilter} sx={{ textTransform: 'none', color: 'text.secondary' }}>Filter</Button>
                 <Button size="small" startIcon={<SortIcon />} onClick={handleSort} sx={{ textTransform: 'none', color: 'text.secondary' }}>Sort</Button>
             </Box>
            {/* Inventory List */}
            <Box>
                {/* ... Loading/Error/Empty/List rendering ... */}
                {isLoadingInventory && ( <Box sx={{width: '100%', maxWidth: `${cardMaxWidth}px`, margin: '0 auto'}}> {[...Array(3)].map((_, index) => ( <Skeleton key={index} variant="rounded" width="100%" height={cardHeight + 60} sx={{ mb: 2, borderRadius: cardBorderRadius }} /> ))} </Box> )} {!isLoadingInventory && errorInventory && (<Typography color="error" sx={{ textAlign: 'center', mt: 4 }}>{errorInventory}</Typography>)} {!isLoadingInventory && !errorInventory && items.length === 0 && (<Typography color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>Inventory is empty. Add an item!</Typography>)} {!isLoadingInventory && !errorInventory && items.length > 0 && ( <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}> {items.map((item) => ( <InventoryItemCard key={item.id} item={item} isExpanded={expandedItemId === item.id} onExpandToggle={handleExpandToggle} onDeleteItem={handleDeleteItem} onFulfillItem={handleFulfillItem} /> ))} </Box> )}
            </Box>
        </Box>
    );
};

// --- SalesOrderContent Placeholder ---
const SalesOrderContent = ({ user }) => { return ( <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '40vh' }}> <Typography variant="h6" color="text.secondary"> Sales / Order View - Coming Soon! </Typography> </Box> ); };


// ========================================================================
// --- Main Dashboard Page Component (MODIFIED FOR NEW AI FLOW) ---
// ========================================================================
export default function Dashboard() {
    // --- State & Hooks ---
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeView, setActiveView] = useState('inventory');
    const router = useRouter();
    const params = useParams();
    const theme = useTheme();
    const headerRef = useRef(null);
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const activeTextColorCalculated = theme.palette.getContrastText(activeBgColor);
    const inactiveTextColor = theme.palette.text.secondary;

    // --- *** NEW STATE FOR AI FLOW *** ---
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [aiError, setAiError] = useState(null);
    const aiFileInputRef = useRef(null); // Ref for hidden file input

    // --- Auth Logic ---
    useEffect(() => { /* ... standard auth check ... */
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => { if (currentUser) { const routeUid = params.uid; if (routeUid && currentUser.uid !== routeUid) { router.push(`/login`); setUser(null); setLoading(false); return; } setUser(currentUser); } else { setUser(null); } setLoading(false); }); return () => unsubscribe();
     }, [router, params]);
    useEffect(() => { if (!loading && !user) router.push("/login"); }, [user, loading, router]);
    const handleSignOut = async () => { /* ... standard signout ... */ try { await signOut(auth); router.push('/login'); } catch (error) { console.error("Sign out error:", error); } };

    // --- View Toggle Handler ---
    const handleViewChange = (event, newView) => { if (newView !== null) setActiveView(newView); };

    // --- *** NEW AI FLOW HANDLERS *** ---

    // 1. Trigger hidden file input
    const handleGenerateWithAiClick = () => {
        // Clear previous errors before opening file picker
        setAiError(null);
        aiFileInputRef.current?.click();
    };

    // 2. Handle file selection, call API, navigate on success
    const handleAiFileSelected = async (event) => {
        const file = event.target.files?.[0];
        const currentInput = event.target; // Capture target for reset

        if (currentInput) currentInput.value = null; // Reset file input immediately

        let tempPreviewUrl = null; // To store blob URL for cleanup

        if (!file || !file.type.startsWith('image/')) {
            setAiError(file ? 'Please select a valid image file.' : null); // Show error only if a file was selected
            return;
        }

        try {
            setAiError(null);
            setIsAiLoading(true); // Show loading overlay

            const storage = getStorage();
        const filePath = `ai_uploads/${user.uid}/${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
        const storageRef = ref(storage, filePath);
        
        // Set metadata for the upload
        const metadata = {
            contentType: file.type,
            customMetadata: {
                'uploadedBy': user.uid,
                'purpose': 'ai_processing'
            }
        };

        const uploadTask = uploadBytesResumable(storageRef, file, metadata);

        // Wait for upload to complete
        await uploadTask;
        
        // Get permanent download URL
        const firebaseImageUrl = await getDownloadURL(uploadTask.snapshot.ref);

            console.log("Calling API for AI generation (from Dashboard)...");
            const formData = new FormData(); formData.append('image', file);
            const minLoadingTimePromise = new Promise(resolve => setTimeout(resolve, 3000)); // Min 3s loading
            const fetchPromise = fetch('/api/analyzeimage', { method: 'POST', body: formData });

            const [response] = await Promise.all([fetchPromise, minLoadingTimePromise]);
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || `API Error: ${response.statusText}`);
            }

            console.log("API Success:", result);
            const { title = `Item ${file.name.split('.')[0]}`, description = "No description provided." } = result;

            // Navigate to add-item page WITH data
            const queryParams = new URLSearchParams({
                title: title,
                description: description,
                preview: firebaseImageUrl
            }).toString();

            // IMPORTANT: Clean up blob URL *after* navigation setup, but before potential errors might prevent cleanup
            // This is tricky. Ideally, cleanup happens on the receiving page or when component unmounts.
            // For now, we won't revoke it here immediately. The browser might revoke it eventually.

            setIsAiLoading(false); // Hide loading overlay BEFORE navigating
            router.push(`/${user.uid}/dashboard/add-item?${queryParams}`);

        } catch (apiError) {
            console.error("AI Generation failed:", apiError);
            setAiError(`AI Generation failed: ${apiError.message}`);
            setIsAiLoading(false); // Hide loading overlay on error
            if (tempPreviewUrl) {
                URL.revokeObjectURL(tempPreviewUrl); // Clean up blob URL on error
            }
        }
    };


    // --- Render Logic ---
    if (loading) { /* ... */ return (<Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}><CircularProgress size={60} /></Box>); }
    if (!user) { return null; }
     if (!isMobile) { return <DesktopWarning />; }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#F8F8F8' }}>
            {/* --- *** Conditionally render loading overlay *** --- */}
            {isAiLoading && <LoadingOverlay />}

            <Header user={user} onSignOut={handleSignOut} ref={headerRef} />

             {/* Hidden File Input for AI */}
             <input
                ref={aiFileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAiFileSelected}
                style={{ display: 'none' }}
                aria-hidden="true"
            />

            <Box component="main" sx={{ flexGrow: 1, width: '100%', opacity: isAiLoading ? 0.5 : 1 /* Optional: Dim background when loading */ }}>
                {/* Toggle Group */}
                <Box sx={{ p: `${borderWidth}px`, background: gradientBorder, borderRadius: `${groupBorderRadius + borderWidth}px`, maxWidth: `${groupMaxWidth}px`, width: 'calc(100% - 32px)', margin: { xs: '16px auto', sm: '24px auto' }, boxSizing: 'border-box' }}>
                    <ToggleButtonGroup value={activeView} exclusive onChange={handleViewChange} aria-label="Dashboard view selection" fullWidth sx={{ display: 'flex', borderRadius: `${groupBorderRadius}px`, overflow: 'hidden', bgcolor: 'background.paper' }}>
                        <ToggleButton value="inventory" aria-label="inventory" disableRipple sx={{ flexGrow: 1, height: `${groupHeight}px`, textTransform: 'none', fontFamily: fontFamily, fontSize: baseFontSize, fontWeight: baseFontWeight, lineHeight: '100%', letterSpacing: '0%', border: 'none', borderRadius: 0, color: activeView === 'inventory' ? activeTextColorCalculated : inactiveTextColor, bgcolor: activeView === 'inventory' ? activeBgColor : 'transparent', '&:hover': { bgcolor: activeView !== 'inventory' ? theme.palette.action.hover : activeBgColor }, '&.Mui-selected': { color: activeTextColorCalculated, bgcolor: activeBgColor, '&:hover': { bgcolor: activeBgColor } } }}> Inventory </ToggleButton>
                        <ToggleButton value="salesOrder" aria-label="sales order" disableRipple sx={{ flexGrow: 1, height: `${groupHeight}px`, textTransform: 'none', fontFamily: fontFamily, fontSize: baseFontSize, fontWeight: baseFontWeight, lineHeight: '100%', letterSpacing: '0%', border: 'none', borderRadius: 0, color: activeView === 'salesOrder' ? activeTextColorCalculated : inactiveTextColor, bgcolor: activeView === 'salesOrder' ? activeBgColor : 'transparent', '&:hover': { bgcolor: activeView !== 'salesOrder' ? theme.palette.action.hover : activeBgColor }, '&.Mui-selected': { color: activeTextColorCalculated, bgcolor: activeBgColor, '&:hover': { bgcolor: activeBgColor } } }}> Sales/Order </ToggleButton>
                    </ToggleButtonGroup>
                </Box>

                {/* Error Display Area (e.g., using Snackbar) */}
                 <Snackbar
                    open={!!aiError}
                    autoHideDuration={6000}
                    onClose={() => setAiError(null)}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                >
                    <Alert onClose={() => setAiError(null)} severity="error" sx={{ width: '100%' }}>
                        {aiError}
                    </Alert>
                </Snackbar>


                {/* Dynamic Content Area */}
                <Box sx={{ p: { xs: 2, sm: 3 }, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {/* Pass the AI trigger function down to InventoryContent */}
                    {activeView === 'inventory' && <InventoryContent user={user} onGenerateWithAiClick={handleGenerateWithAiClick} />}
                    {activeView === 'salesOrder' && <SalesOrderContent user={user} />}
                </Box>
            </Box>
        </Box>
    );
}