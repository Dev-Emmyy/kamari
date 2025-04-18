// app/[uid]/dashboard/page.jsx
"use client";

import OrderCard from '../../components/OrderCard'; 

// --- React & Next.js Imports ---
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";

// --- MUI Imports ---
import {
    Box, useTheme, CircularProgress, Typography, ToggleButton, ToggleButtonGroup,
    TextField, Button, InputAdornment, IconButton, Paper, Skeleton, useMediaQuery,
    Snackbar, Alert, Divider,
    Collapse,  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle 
} from "@mui/material";

// --- Icon Imports ---
import {
    Edit as EditIcon, FilterList as FilterListIcon, Sort as SortIcon,
    ChevronRight as ChevronRightIcon, // Keep for expansion
    Check as CheckIcon, // For stock update confirm
    Close as CloseIcon, // For stock update cancel
    Smartphone as SmartphoneIcon,
    // *** Icons for Share/Delete Actions ***
    Delete as DeleteIcon,
    Share as ShareIcon
    // Removed ToggleOn/Off icons as menu is removed
} from '@mui/icons-material';


// --- Firebase Imports ---
import { onAuthStateChanged, signOut } from "firebase/auth";
import { getStorage, ref, deleteObject,uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { getFirestore, collection, query, orderBy, onSnapshot, getDoc, doc, updateDoc, deleteDoc, increment } from "firebase/firestore";
import { auth, db, storage } from "../../../lib/firebase"; // Keep config import

// --- Date Formatting ---
import { format } from 'date-fns';

// --- Component Imports ---
import Header from "../../components/Header";
import LoadingOverlay from "../../components/LoadingOverlay";

// --- Style Constants ---
// ... (Keep all relevant style constants - NO CHANGES HERE) ...
const groupMaxWidth = 347.31; const groupHeight = 51.40; const groupBorderRadius = 13.89; const borderWidth = 0.5; const gradientBorder = 'linear-gradient(90deg, rgba(223, 29, 29, 0.69) 7.21%, rgba(102, 102, 102, 0.38) 27.88%, rgba(226, 185, 21, 0.55) 53.85%, rgba(226, 185, 21, 0.4) 94.71%)'; const activeBgColor = 'rgba(34, 34, 34, 1)'; const baseFontWeight = 400; const baseFontSize = '16.67px'; const fontFamily = 'Instrument Sans, sans-serif';
const cardMaxWidth = 372.29; const cardHeight = 84.42; const cardBorderRadius = '8.32px'; const cardPaddingTB = '9.38px'; const cardPaddingLR = '10.32px'; const cardBg = 'rgba(255, 255, 255, 1)'; const cardGap = '9.38px'; const invTitleFontFamily = 'Manrope, sans-serif'; const invTitleFontWeight = 600; const invTitleFontSize = '14.27px'; const invTitleColor = 'rgba(99, 102, 110, 1)'; const invDateFontFamily = 'Manrope, sans-serif'; const invDateFontWeight = 600; const invDateFontSize = '12px'; const invDateColor = 'rgba(139, 139, 139, 1)'; const invStatusBoxHeight = '20.21px'; const invStatusBoxRadius = '11.89px'; const invStatusTextFontFamily = 'Manrope, sans-serif'; const invStatusTextFontWeight = 800; const invStatusTextFontSize = '10px'; const invAmountFontFamily = 'Manrope, sans-serif'; const invAmountFontWeight = 600; const invAmountFontSize = '12px'; const invAmountColor = 'rgba(30, 30, 30, 1)'; const invChevronSize = '25.32px'; const invChevronColor = 'rgba(51, 54, 63, 1)'; const invImageBoxSize = '84.42px'; const invImageBorderRadius = '8px'; const stockTextFontFamily = 'Manrope, sans-serif'; const stockTextFontWeight = 600; const stockTextFontSize = '14px'; const stockTextColor = 'rgba(30, 30, 30, 1)';
const actionButtonHeight = '36px';
const mainButtonStyles = { mt: 1, mb: 3, borderStyle: 'none', bgcolor: "rgba(34, 34, 34, 1)", padding: "10px 12px", textTransform: "none", borderRadius: "13px", boxShadow: "0px 4px 8px 0px rgba(0, 0, 0, 0.15)", fontFamily: "'Instrument Sans', sans-serif", fontWeight: 400, fontSize: "14px", maxWidth: "369px", lineHeight: "normal", color: "#FFFFFF", height: "84px", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, '&:hover': { bgcolor: "rgba(50, 50, 50, 1)", }, '&:disabled': { bgcolor: 'rgba(0, 0, 0, 0.12)', color: 'rgba(0, 0, 0, 0.26)', boxShadow: 'none', width: "100%" } };


// --- Helper Functions ---
function formatDate(timestamp) { /* ... */ try { return format(timestamp.toDate(), 'dd/MM/yyyy'); } catch (e) { return "Invalid Date"; } }
function formatCurrency(amount) { /* ... */ if (typeof amount !== 'number' || isNaN(amount)) { return "N/A"; } const formatter = new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0, maximumFractionDigits: 0 }); return formatter.format(amount); }

// --- Desktop Warning ---
const DesktopWarning = () => ( <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', textAlign: 'center', p: 3, bgcolor: 'background.paper' }}> <SmartphoneIcon sx={{ fontSize: 60, mb: 2, color: 'text.secondary' }} /> <Typography variant="h5" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>Mobile View Recommended</Typography> <Typography variant="body1" color="text.secondary">This application is designed for mobile use.<br />Please switch to a phone or use browser developer tools<br />to emulate a mobile screen for the intended experience.</Typography> </Box> );


// ========================================================================
// --- MODIFIED InventoryItemCard Component (Clickable Badge + Expanded Actions) ---
// ========================================================================
const InventoryItemCard = ({ item, isExpanded, onExpandToggle, onDeleteItem, onFulfillItem, onUpdateStatus }) => { // Added onUpdateStatus prop
    const theme = useTheme();
    // State for managing stock update UI ("Fulfill" mode)
    const [isFulfilling, setIsFulfilling] = useState(false);
    const [editStockValue, setEditStockValue] = useState(String(item.stock ?? 0));

    // Reset fulfilling state if card is collapsed or stock changes externally
    useEffect(() => {
        if (!isExpanded) {
            setIsFulfilling(false);
        }
        if (!isFulfilling) {
            setEditStockValue(String(item.stock ?? 0));
        }
    }, [isExpanded, item.stock, isFulfilling]);


    // Status badge logic based on item.status field
    const currentStatus = item.status || 'unavailable'; // Default if status field missing
    const statusText = currentStatus === 'available' ? 'AVAILABLE' : 'UNAVAILABLE';
    const statusBgColor = currentStatus === 'available' ? 'rgba(234, 250, 235, 1)' : 'rgba(234, 250, 235, 1)';
    const statusTextColor = currentStatus === 'available' ? 'rgba(83, 125, 88, 1)' : 'rgba(226, 185, 21, 1)';

    // --- Handlers ---
    const handleShare = () => {
        const message = `Check out this item: *${item.title}* - Status: ${statusText} (${item.stock ?? 0} in stock). Price: ${formatCurrency(item.sellingPrice)}`;
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
        window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    };

    const handleToggleFulfillMode = () => {
        if (!isFulfilling) {
            setEditStockValue(String(item.stock ?? 0));
        }
        setIsFulfilling(!isFulfilling);
    };

    const handleConfirmFulfill = async () => {
        const newStock = Number(editStockValue);
        if (isNaN(newStock) || newStock < 0 || !Number.isInteger(newStock)) {
            alert("Please enter a valid whole number for stock (0 or more).");
            return;
        }
        await onFulfillItem(item.id, newStock); // Update stock
        setIsFulfilling(false);
    };

    // *** Handler for clicking the status badge ***
    const handleBadgeClick = () => {
        const newStatus = currentStatus === 'available' ? 'unavailable' : 'available';
        onUpdateStatus(item.id, newStatus); // Call prop to update status in Firestore
    };

    return (
        <Paper elevation={1} sx={{ width: '100%', maxWidth: `${cardMaxWidth}px`, borderRadius: cardBorderRadius, mb: 2, overflow: 'hidden', bgcolor: cardBg, }} >
            {/* --- Top Section (Visible Always) --- */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: cardGap, p: `${cardPaddingTB} ${cardPaddingLR}`, }}>
                <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    {/* Item Info */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 0.5, mr: 1 }}>
                        <Typography sx={{ fontFamily: invTitleFontFamily, fontWeight: invTitleFontWeight, fontSize: invTitleFontSize, color: invTitleColor, lineHeight: '1.2', wordBreak: 'break-word' }}>
                            {item.title || 'Untitled Item'}
                        </Typography>
                        <Typography sx={{ fontFamily: invDateFontFamily, fontWeight: invDateFontWeight, fontSize: invDateFontSize, color: invDateColor, lineHeight: '1' }}>
                            {item.createdAt ? formatDate(item.createdAt) : 'No date'}
                        </Typography>

                        {/* --- Clickable Status Badge (uses item.status) --- */}
                        <Box
                            onClick={handleBadgeClick} // Call handler to toggle status
                            title={`Click to set ${currentStatus === 'available' ? 'Unavailable' : 'Available'}`} // Add tooltip
                            sx={{
                                width: 'auto', px: 1.5,
                                height: invStatusBoxHeight, borderRadius: invStatusBoxRadius, bgcolor: statusBgColor, display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 0.5, cursor: 'pointer', '&:hover': { opacity: 0.8 }
                            }}>
                            <Typography sx={{ fontFamily: invStatusTextFontFamily, fontWeight: invStatusTextFontWeight, fontSize: invStatusTextFontSize, color: statusTextColor, lineHeight: '1' }}>
                                {statusText} {/* Shows AVAILABLE/UNAVAILABLE */}
                            </Typography>
                        </Box>
                        {/* --- End Clickable Status Badge --- */}
                    </Box>

                    {/* Price & Expand Icon */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between', height: '100%', minHeight: `calc(${invStatusBoxHeight} + 1.5em)` }}>
                        <IconButton
                           onClick={() => onExpandToggle(item.id)} // Toggles expansion for actions
                           size="small" sx={{ color: invChevronColor, width: invChevronSize, height: invChevronSize, p: 0, mb: 1 }}
                           aria-expanded={isExpanded}
                           aria-label={isExpanded ? "Collapse Actions" : "Expand Actions"}
                           title={isExpanded ? "Hide actions" : "Show actions"}
                        >
                            <ChevronRightIcon sx={{ transform: isExpanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
                        </IconButton>
                        <Typography sx={{ fontFamily: invAmountFontFamily, fontWeight: invAmountFontWeight, fontSize: invAmountFontSize, color: invAmountColor, lineHeight: '1', textAlign: 'right', mt: 'auto' }}>
                            {formatCurrency(item.sellingPrice)}
                        </Typography>
                    </Box>
                </Box>
                {/* Image */}
                <Box sx={{ width: invImageBoxSize, height: invImageBoxSize, borderRadius: invImageBorderRadius, overflow: 'hidden', position: 'relative', flexShrink: 0, bgcolor: theme.palette.grey[100] }}>
                    {item.imageUrl ? (
                         <Image src={item.imageUrl} alt={item.title || 'Item'} layout="fill" objectFit="cover" />
                    ) : (
                        <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: theme.palette.grey[200] }}>
                            <Typography variant="caption" color="textSecondary">No Image</Typography>
                        </Box>
                    )}
                </Box>
            </Box>

            {/* --- Collapsible Section for Stock Count & Actions (Kept from previous version) --- */}
            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                 <Box sx={{ p: `${cardPaddingTB} ${cardPaddingLR}`, pt: 1, pb: 1, borderTop: `1px solid ${theme.palette.divider}` }}>
                    {/* Stock Info Display */}
                    <Typography sx={{ mb: 1.5, textAlign: 'left', fontFamily: stockTextFontFamily, fontWeight: stockTextFontWeight, fontSize: stockTextFontSize, color: stockTextColor }}>
                         {item.stock ?? 0} left in stock
                    </Typography>
                    {/* Description is intentionally removed */}

                    {/* --- Actions Area --- */}
                    {isFulfilling ? (
                        // Stock Update UI
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                            <Typography variant="caption" sx={{ flexShrink: 0 }}>New Qty:</Typography>
                            <TextField type="number" value={editStockValue} onChange={(e) => setEditStockValue(e.target.value)} size="small" autoFocus InputProps={{ inputProps: { min: 0, step: 1 } }} sx={{ maxWidth: '70px', '.MuiInputBase-input': { textAlign: 'center', p: '8px 5px' }, flexGrow: 1 }} onKeyDown={(e) => { if (e.key === 'Enter') handleConfirmFulfill(); }} />
                            <IconButton size="small" onClick={handleConfirmFulfill} color="primary" title="Confirm Stock Update"><CheckIcon fontSize="small"/></IconButton>
                            <IconButton size="small" onClick={handleToggleFulfillMode} aria-label="Cancel stock edit" title="Cancel"><CloseIcon fontSize="small"/></IconButton>
                        </Box>
                    ) : (
                        // Initial Action Buttons: Fulfill, Share, Delete
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 0.3 }}>
                            <Button variant="contained" size="small" onClick={handleToggleFulfillMode} sx={{ textTransform: 'none', height: actionButtonHeight, fontSize: '12px', flexBasis: '25%', bgcolor: 'rgba(34, 34, 34, 1)', color: '#fff', '&:hover': {bgcolor: 'grey.800'} }}>Update</Button>
                            <Button
                                aria-label="Share with customer"
                                onClick={handleShare}
                                size="medium" // Keep size prop
                                title="Share via WhatsApp"
                                sx={{
                                    display: "flex",
                                    alignItems: "center", // Corrected typo
                                    justifyContent: 'center', // Center content
                                    gap: "1px", // Space between icon and text
                                    textTransform: 'none',
                                    height: actionButtonHeight,
                                    bgcolor: 'rgba(34, 34, 34, 1)', // Dark background
                                    color: '#fff', // White text
                                    '&:hover': {bgcolor: 'grey.800'}, // Hover color
                                    width: "165px", // Fixed width as requested
                                    flexShrink: 0, // Prevent shrinking if container is tight
                                    px: 1 // Add padding if needed
                                }}
                            >
                                {/* Ensure /add.png is in your public folder */}
                                {/* If /add.png is black, this filter makes it white */}
                                <Image src="/add.png" width={20} height={20} alt="" style={{ filter: 'brightness(0) invert(1)' }}/>
                                <Typography sx={{fontSize: '12px', color: 'inherit', fontFamily: "Manrope", fontWeight: 600 , ml: "1px"}}>
                                    Share with customer
                                </Typography>
                            </Button>
                            <Button
                                aria-label="delete item"
                                onClick={() => onDeleteItem(item.id, item.imageUrl)}
                                // color="error" // Removed
                                size="medium" // Keep size, affects base styles
                                title="Delete Item"
                                sx={{
                                    width: "44px", // User specified width
                                    height: "41px", // User specified height
                                    minWidth: "44px", // Prevent MUI default min-width
                                    bgcolor: 'rgba(216, 59, 59, 1)', // User specified red background
                                    borderRadius: "7px", // User specified border-radius
                                    p: 0, // Remove default padding to center icon precisely
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0, // Prevent shrinking in flex layout
                                    '&:hover': {
                                        bgcolor: 'rgba(187, 49, 49, 1)' // Darker red on hover (example)
                                    }
                                }}
                            >
                                {/* Ensure /trash.png exists in public folder */}
                                {/* Filter makes a dark icon white */}
                                <Image src="/trash.png" width={20} height={20} alt="" style={{ filter: 'brightness(0) invert(1)' }}/>
                            </Button>
                        </Box>
                    )}
                     {/* --- End Actions Area --- */}
                 </Box>
            </Collapse>
             {/* --- End Collapsible Section --- */}

        </Paper>
    );
};


// ========================================================================
// --- MODIFIED InventoryContent Component (Handlers Updated) ---
// ========================================================================
const InventoryContent = ({ user, onGenerateWithAiClick }) => {
    const [items, setItems] = useState([]);
    const [isLoadingInventory, setIsLoadingInventory] = useState(true);
    const [errorInventory, setErrorInventory] = useState(null);
    const [expandedItemId, setExpandedItemId] = useState(null);
    const theme = useTheme();
    const router = useRouter();

    useEffect(() => { // Fetch logic needs BOTH 'stock' and 'status'
        if (!user?.uid) { setIsLoadingInventory(false); setErrorInventory("User not identified."); return; }
        setIsLoadingInventory(true); setErrorInventory(null);
        const itemsCollectionRef = collection(db, 'users', user.uid, 'items');
        const q = query(itemsCollectionRef, orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const itemsData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                // Provide defaults if fields are missing in Firestore
                status: doc.data().status || 'unavailable',
                stock: doc.data().stock ?? 0
            }));
            setItems(itemsData);
            setIsLoadingInventory(false);
        }, (error) => {
            console.error("Error fetching inventory:", error);
            setErrorInventory(`Failed to load inventory: ${error.message}`);
            setIsLoadingInventory(false);
        });
        return () => unsubscribe();
    }, [user]);

    // Handler for expansion
    const handleExpandToggle = (itemId) => setExpandedItemId(prevId => (prevId === itemId ? null : itemId));

    // Handler for deleting
    const handleDeleteItem = async (itemId, imageUrl) => { /* ... delete logic same ... */
        if (!user?.uid || !itemId) return;
        if (!window.confirm(`Delete this item permanently?`)) return;
        try {
            const itemDocRef = doc(db, 'users', user.uid, 'items', itemId);
            await deleteDoc(itemDocRef);
            console.log("Item document deleted from Firestore.");
            if (imageUrl) { /* ... image deletion logic ... */
                try {
                    let storageRef;
                    if (imageUrl.startsWith('gs://') || imageUrl.startsWith('http')) {
                         storageRef = ref(storage, imageUrl);
                         await deleteObject(storageRef);
                         console.log("Image deleted from Storage:", imageUrl);
                    } else { console.warn("Skipping image deletion, invalid URL format:", imageUrl) }
                } catch (storageError) {
                    if (storageError.code === 'storage/object-not-found') { console.warn("Image not found in Storage:", imageUrl); }
                    else { console.error("Error deleting storage object:", storageError); }
                }
            }
             if (expandedItemId === itemId) setExpandedItemId(null);
        } catch (error) {
            console.error("Error deleting item:", error);
            alert(`Failed to delete item: ${error.message}`);
        }
      };

    // Handler for FULFILLING (Updating STOCK)
    const handleFulfillItem = async (itemId, newStock) => {
        if (!user?.uid || typeof newStock !== 'number' || newStock < 0 || !Number.isInteger(newStock)) {
             alert("Invalid stock value.");
             return;
        }
        console.log(`Updating item ${itemId} stock to ${newStock}`);
        const itemDocRef = doc(db, 'users', user.uid, 'items', itemId);
        try {
            await updateDoc(itemDocRef, {
                stock: newStock // Update the stock field
            });
            console.log(`Successfully updated stock for item ${itemId}`);
            // UI updates via onSnapshot
        } catch (error) {
            console.error("Error updating stock:", error);
            alert(`Failed to update stock: ${error.message}`);
        }
      };

    // **** Handler for Updating STATUS (from badge click) ****
    const handleUpdateStatus = async (itemId, newStatus) => {
        if (!user?.uid || !itemId || (newStatus !== 'available' && newStatus !== 'unavailable')) {
             console.error("Invalid status update parameters.");
             return;
        }
        console.log(`Updating item ${itemId} status to ${newStatus}`);
        const itemDocRef = doc(db, 'users', user.uid, 'items', itemId);
        try {
            await updateDoc(itemDocRef, {
                status: newStatus // Update the status field
            });
            console.log(`Successfully updated status for item ${itemId}`);
             // UI updates via onSnapshot
        } catch (error) {
            console.error("Error updating status:", error);
            alert(`Failed to update status: ${error.message}`);
        }
      };

    const handleFilter = () => alert('Filter not implemented.');
    const handleSort = () => alert('Sort not implemented.');
    const handleNavigateToAddItemManual = () => { if (user?.uid) router.push(`/${user.uid}/dashboard/add-item-manual`); else console.error("Cannot navigate: User UID missing."); };

    return (
        <Box sx={{display: 'flex', flexDirection : "column" ,justifyContent: 'center', alignItems: 'center', mx: 'auto' , width: "100%"}}>
            {/* --- Two-Part Button (No changes) --- */}
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mx: 'auto' , width: "100%"}}>
                 <Box sx={{ ...mainButtonStyles, p: 0, cursor: 'default', justifyContent: 'center', '&:hover': { bgcolor: "rgba(34, 34, 34, 1)" },width: "100%", margin: { xs: '16px auto', sm: '24px auto' }, }} >
                    <Box onClick={onGenerateWithAiClick} sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', p: 1, flex: 1, justifyContent: 'center', height: '100%' }}><Image src="/capture.png" alt="Generate with AI Icon" width={61} height={61} priority style={{ flexShrink: 0 }} /><Typography sx={{ fontFamily: "Manrope", fontWeight: 600, color: "rgba(251, 102, 22, 1)", fontSize: "12px", width: "84px", textAlign: "flex-start", flexShrink: 0 }}> Generate item with AI </Typography></Box>
                    <Box sx={{ width: '2px', height: '45px', bgcolor: 'rgba(246, 246, 246, 0.5)',flexShrink: 0 }} />
                    <Box onClick={handleNavigateToAddItemManual} sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', p: 1, flex: 1, justifyContent: 'center', height: '100%' }}><Typography sx={{ fontFamily: "Manrope", fontWeight: 700, color: "rgba(246, 246, 246, 1)", fontSize: "12px", width: "96px", textAlign: "center", flexShrink: 0 }}> Create item without image </Typography></Box>
                 </Box>
            </Box>

            {/* Filter and Sort Row (No changes) */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, width: '100%', maxWidth: '372.29px', px: { xs: 0, sm: 1 } }}>
                <Button size="small" startIcon={<FilterListIcon />} onClick={handleFilter} sx={{ textTransform: 'none', color: 'text.secondary' }}>Filter</Button>
                <Button size="small" startIcon={<SortIcon />} onClick={handleSort} sx={{ textTransform: 'none', color: 'text.secondary' }}>Sort</Button>
            </Box>

            {/* Inventory List */}
            <Box>
                {/* Loading/Error/Empty States */}
                {isLoadingInventory && ( <Box sx={{width: '100%', maxWidth: `${cardMaxWidth}px`, margin: '0 auto'}}> {[...Array(3)].map((_, index) => ( <Skeleton key={index} variant="rounded" width="100%" height={cardHeight + 60} sx={{ mb: 2, borderRadius: cardBorderRadius }} /> ))} </Box> )}
                {!isLoadingInventory && errorInventory && (<Typography color="error" sx={{ textAlign: 'center', mt: 4 }}>{errorInventory}</Typography>)}
                {!isLoadingInventory && !errorInventory && items.length === 0 && (<Typography color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>Inventory is empty. Add an item!</Typography>)}

                {/* Item List Rendering */}
                {!isLoadingInventory && !errorInventory && items.length > 0 && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        {items.map((item) => (
                            <InventoryItemCard
                                key={item.id}
                                item={item}
                                isExpanded={expandedItemId === item.id}
                                onExpandToggle={handleExpandToggle}
                                onDeleteItem={handleDeleteItem}
                                onFulfillItem={handleFulfillItem} // For stock update
                                onUpdateStatus={handleUpdateStatus} // For badge click status toggle
                            />
                        ))}
                    </Box>
                )}
            </Box>
        </Box>
    );
};


// --- SalesOrderContent Placeholder (No changes) ---
const SalesOrderContent = ({ user }) => {
    const [orders, setOrders] = useState([]);
    const [isLoadingOrders, setIsLoadingOrders] = useState(true);
    const [errorOrders, setErrorOrders] = useState(null);
    const theme = useTheme();
    const router = useRouter(); // Assuming useRouter is imported above

    // --- Fetch Orders ---
    useEffect(() => {
        if (!user?.uid) {
            setIsLoadingOrders(false);
            setErrorOrders("User not identified.");
            return;
        }
        setIsLoadingOrders(true);
        setErrorOrders(null);

        const ordersCollectionRef = collection(db, 'users', user.uid, 'orders'); // Path to orders subcollection
        const q = query(ordersCollectionRef, orderBy('createdAt', 'desc')); // Order by creation date

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const ordersData = querySnapshot.docs.map(doc => ({
                id: doc.id, // Firestore document ID is the order ID
                ...doc.data(),
            }));
            setOrders(ordersData);
            setIsLoadingOrders(false);
        }, (error) => {
            console.error("Error fetching orders:", error);
            setErrorOrders(`Failed to load orders: ${error.message}`);
            setIsLoadingOrders(false);
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, [user]); // Re-run if user changes

    // --- Handlers ---
    const handleCreateOrder = () => {
        if (user?.uid) {
            router.push(`/${user.uid}/dashboard/createorder`);
        } else {
            console.error("Cannot navigate: User UID missing.");
        }
    };

    const handleFilter = () => alert('Order Filter not implemented.');
    const handleSort = () => alert('Order Sort not implemented.');

    const handleUpdatePaymentStatus = async (orderId, newStatus) => {
         if (!user?.uid || !orderId) return;
         console.log(`Updating Order ${orderId} payment status to ${newStatus}`);
         const orderDocRef = doc(db, 'users', user.uid, 'orders', orderId);
         try {
            await updateDoc(orderDocRef, { paymentStatus: newStatus });
            // UI updates via onSnapshot listener
         } catch (error) {
            console.error("Error updating payment status:", error);
            alert(`Failed to update payment status: ${error.message}`);
         }
    };

     const handleUpdateShippingStatus = async (orderId, newStatus) => {
        if (!user?.uid || !orderId) return;
         console.log(`Updating Order ${orderId} shipping status to ${newStatus}`);
         const orderDocRef = doc(db, 'users', user.uid, 'orders', orderId);
         try {
            await updateDoc(orderDocRef, { shippingStatus: newStatus });
             // UI updates via onSnapshot listener
         } catch (error) {
            console.error("Error updating shipping status:", error);
            alert(`Failed to update shipping status: ${error.message}`);
         }
    };

    // --- Render ---
    return (
        <Box sx={{width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>

             {/* --- Sales Summary Section (Placeholder Data) --- */}
             <Paper elevation={2} sx={{ py: 2, mb: 3, width: '100%', maxWidth: '369px', borderRadius: '12px', border: "none", boxShadow : "none", backgrounColor: "rgba(255, 255, 255, 1)" }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
                    <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="caption" sx={{fontWeight : 400, fontFamily : "Manrope", color : "rgba(133, 133, 133, 1)", fontSize : "14px"}}>Sales (Last 30 Days)</Typography>
                        <Typography variant="h6" sx={{ fontWeight: '700', fontFamily : "Manrope", color : "rgba(111, 197, 175, 1)", fontSize : "20px" }}>₦305,450</Typography>
                        {/* Add trend icon if needed */}
                    </Box>
                    <Divider orientation="vertical" flexItem sx={{borderRightWidth: '2px',}} />
                    <Box sx={{ textAlign: 'center', }}>
                        <Typography variant="caption" sx={{fontWeight : 400, fontFamily : "Manrope", color : "rgba(133, 133, 133, 1)", fontSize : "14px"}}>Gross Profit</Typography>
                        <Typography variant="h6" sx={{ fontWeight: '700', fontFamily : "Manrope", color : "rgba(111, 197, 175, 1)", fontSize : "20px" }}>₦102,000</Typography>
                    </Box>
                </Box>
            </Paper>

            {/* --- Create Order Button --- */}
            <Box sx={{
                display: 'flex',
                justifyContent: 'flex-start', // Align button to the left within this wrapper
                width: '100%',
                maxWidth: '372.29px', // Match width of other centered elements
                mb: 2 // Keep margin bottom on the wrapper
            }}>
                <Button
                    variant="contained"
                    onClick={handleCreateOrder} // Or handleCreateForm
                    startIcon={<Image src="/box.png" width={20} height={20} alt="" />}
                    sx={{
                        // Removed width: '100%'
                        // Keep maxWidth or set a fixed width if preferred
                        maxWidth: '186px', // As per original sx
                        // Or fixed width: width: '186px',
                        bgcolor: 'rgba(34, 34, 34, 1)',
                        color: '#fff',
                        textTransform: 'none',
                        borderRadius: '8px',
                        py: 1.2,
                        px: 3,
                        fontSize: '16px',
                        fontFamily: "Manrope",
                        '&:hover': { bgcolor: 'grey.800' },
                        // Removed mb: 2 (moved to wrapper Box)
                    }}
                >
                    Create Order
                </Button>
            </Box>

    
             {/* --- Filter and Sort Row --- */}
             <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, width: '100%', maxWidth: '372.29px', px: { xs: 0, sm: 1 } }}>
                <Button size="small" startIcon={<FilterListIcon />} onClick={handleFilter} sx={{ textTransform: 'none', color: 'text.secondary' }}>Filter</Button>
                <Button size="small" startIcon={<SortIcon />} onClick={handleSort} sx={{ textTransform: 'none', color: 'text.secondary' }}>Sort</Button>
            </Box>

            {/* --- Orders List --- */}
            <Box sx={{width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                {isLoadingOrders && (
                    // Use Skeleton similar to Inventory loading
                    <Box sx={{width: '100%', maxWidth: '372.29px', margin: '0 auto'}}>
                        {[...Array(3)].map((_, index) => (
                            <Skeleton key={index} variant="rounded" width="100%" height={100} sx={{ mb: 2, borderRadius: cardBorderRadius }} />
                        ))}
                    </Box>
                )}
                {!isLoadingOrders && errorOrders && (
                    <Typography color="error" sx={{ textAlign: 'center', mt: 4 }}>
                        {errorOrders}
                    </Typography>
                )}
                {!isLoadingOrders && !errorOrders && orders.length === 0 && (
                    <Typography color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
                        You haven't created any orders yet.
                    </Typography>
                )}
                {!isLoadingOrders && !errorOrders && orders.length > 0 && (
                    orders.map((order) => (
                        <OrderCard
                            key={order.id}
                            order={order}
                            onUpdatePaymentStatus={handleUpdatePaymentStatus}
                            onUpdateShippingStatus={handleUpdateShippingStatus}
                        />
                    ))
                )}
            </Box>

        </Box>
    );
};

// ========================================================================
// --- Main Dashboard Page Component (No relevant changes needed here) ---
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
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [aiError, setAiError] = useState(null);
    const aiFileInputRef = useRef(null);
    const [showUpgradeAlert, setShowUpgradeAlert] = useState(false);
    const [isCheckingUsage, setIsCheckingUsage] = useState(false); 

    // --- Auth Logic (No changes) ---
    useEffect(() => { /* ... */ const unsubscribe = onAuthStateChanged(auth, (currentUser) => { if (currentUser) { const routeUid = params.uid; if (routeUid && currentUser.uid !== routeUid) { router.push(`/login`); setUser(null); setLoading(false); return; } setUser(currentUser); } else { setUser(null); } setLoading(false); }); return () => unsubscribe(); }, [router, params]);
    useEffect(() => { if (!loading && !user) router.push("/login"); }, [user, loading, router]);
    const handleSignOut = async () => { /* ... */ try { await signOut(auth); router.push('/login'); } catch (error) { console.error("Sign out error:", error); } };

    // --- View Toggle Handler (No changes) ---
    const handleViewChange = (event, newView) => { if (newView !== null) setActiveView(newView); };

    // --- AI Flow Handlers (No changes) ---
    const handleGenerateWithAiClick = () => { setAiError(null);  checkUsageAndTriggerUpload(); };
    const checkUsageAndTriggerUpload = async () => {
        if (!user) {
            console.error("User not logged in.");
            // You might want to prompt login here
            return;
        }
    
        setIsCheckingUsage(true); // Start loading indicator for check
        const userId = user.uid;
        const userDocRef = doc(db, "users", userId);
    
        try {
            const userDocSnap = await getDoc(userDocRef);
            let currentCount = 0;
            let currentLevel = "free";
    
            if (userDocSnap.exists()) {
                const data = userDocSnap.data();
                currentCount = data.aiUsageCount || 0;
                currentLevel = data.accessLevel || "free";
            } else {
                console.log("User document doesn't exist, treating as free user with 0 count.");
                // Optional: Create doc here if needed, or rely on first write to create it
                // await setDoc(userDocRef, { aiUsageCount: 0, accessLevel: "free" });
            }
    
            console.log(`User: ${userId}, Access Level: ${currentLevel}, Usage Count: ${currentCount}`);
    
            const freeLimit = 7;
    
            if (currentLevel === "paid" || (currentLevel === "free" && currentCount < freeLimit)) {
                // User is allowed to proceed (either paid or free within limit)
                console.log("Usage check passed. Triggering file input.");
                aiFileInputRef.current?.click(); // <-- Trigger the actual file input click
            } else {
                // Free user limit reached
                console.log("Free user limit reached.");
                setShowUpgradeAlert(true); // Show the upgrade prompt
            }
        } catch (error) {
            console.error("Error checking user usage:", error);
            setAiError("Could not verify usage limits. Please try again."); // Show error to user
        } finally {
            setIsCheckingUsage(false); // Stop loading indicator for check
        }
    };
    // Paste this inside your Dashboard component, replacing the previous handleAiFileSelected

const handleAiFileSelected = async (event) => {
    const file = event.target.files?.[0];
    const currentInput = event.target;
    if (currentInput) currentInput.value = null; // Clear file input

    if (!file || !file.type.startsWith('image/')) {
        setAiError(file ? 'Please select a valid image file.' : null);
        return;
    }

    if (!user) { // Re-check user just in case
         console.error("User became logged out during file selection?");
         setAiError("Authentication error. Please log in again.");
         return;
    }
    const userId = user.uid;
    const userDocRef = doc(db, "users", userId); // Need ref again for increment

    // Assume usage check was passed if this function is called

    try {
        setAiError(null);
        setIsAiLoading(true); // Start AI processing overlay

        // --- Corrected Upload Path ---
        const filePath = `ai_uploads/${user.uid}/${Date.now()}_${file.name.replace(/\s+/g, '_')}`; // <-- USE BACKTICKS HERE

        console.log("Attempting upload for user UID:", user.uid);
        console.log("Target Storage Path:", filePath); // Verify this log looks correct now

        // --- Upload Logic ---
        const storageInstance = getStorage();
        const storageRefInstance = ref(storageInstance, filePath);
        const metadata = { contentType: file.type, customMetadata: { 'uploadedBy': user.uid, 'purpose': 'ai_processing' } };
        const uploadTask = uploadBytesResumable(storageRefInstance, file, metadata);
        await uploadTask; // Wait for upload to complete
        const firebaseImageUrl = await getDownloadURL(uploadTask.snapshot.ref);
        // --- End Upload Logic ---

        // --- API Call Logic ---
        const formData = new FormData();
        formData.append('image', file); // Sending the raw file
        const minLoadingTimePromise = new Promise(resolve => setTimeout(resolve, 2000)); // Keep min loading time
        const fetchPromise = fetch('/api/analyzeimage', { method: 'POST', body: formData });

        // Wait for both API and minimum time
        const [response] = await Promise.all([fetchPromise, minLoadingTimePromise]);
        const result = await response.json();

        if (!response.ok) {
            // Attempt to delete the uploaded image if API call failed
            try {
                await deleteObject(storageRefInstance);
                console.log("Deleted uploaded image due to API failure:", filePath);
            } catch (deleteError) {
                console.error("Failed to delete image after API error:", deleteError);
            }
            throw new Error(result.error || `API Error: ${response.statusText}`);
        }
        // --- End API Call Logic ---

        // --- Increment Firestore Count on Success (IF USER WAS FREE) ---
        // Re-fetch the level just before incrementing to be safe
        const userDocSnap = await getDoc(userDocRef);
        const currentLevel = userDocSnap.exists() ? (userDocSnap.data().accessLevel || "free") : "free";

        if (currentLevel === "free") {
            try {
                 await updateDoc(userDocRef, {
                     aiUsageCount: increment(1)
                 });
                 console.log("Incremented free usage count after successful analysis.");
            } catch(incrementError) {
                 console.error("Failed to increment usage count, but analysis succeeded:", incrementError);
                 // Decide how critical this is - maybe log it? The user got the analysis.
            }
        }
        // --- End Increment Logic ---

        // --- Corrected Navigation Logic ---
        const { title = `Item ${file.name.split('.')[0]}`, description = "No description provided." } = result;
        const queryParams = new URLSearchParams({ title: title, description: description, preview: firebaseImageUrl }).toString();

        setIsAiLoading(false); // Stop AI overlay *before* navigating

        // Ensure this uses BACKTICKS and correct variables
        router.push(`/${user.uid}/dashboard/add-item?${queryParams}`); // <-- USE BACKTICKS HERE
        // --- End Navigation Logic ---

    } catch (error) { // Catch errors from upload, API call, or increment check
        console.error("AI Generation or Upload failed:", error);
        setAiError(`Operation failed: ${error.message}`);
        setIsAiLoading(false); // Stop overlay on error
    }
};

    // --- Render Logic ---
    if (loading) { return (<Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}><CircularProgress size={60} /></Box>); }
    if (!user) { return null; }
     if (!isMobile) { return <DesktopWarning />; }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#F8F8F8', }}>
            {isAiLoading && <LoadingOverlay />}
            <Header user={user} onSignOut={handleSignOut} ref={headerRef} />
            <input ref={aiFileInputRef} type="file" accept="image/*" onChange={handleAiFileSelected} style={{ display: 'none' }} aria-hidden="true" />
            <Box component="main" sx={{ flexGrow: 1, width: '100%', opacity: isAiLoading ? 0.5 : 1 }}>
                {/* Toggle Group */}
                <Box sx={{ p: `${borderWidth}px`, background: gradientBorder, borderRadius: `${groupBorderRadius + borderWidth}px`, maxWidth: `${groupMaxWidth}px`, width: 'calc(100% - 32px)', margin: { xs: '16px auto', sm: '24px auto' }, boxSizing: 'border-box' }}>
                    <ToggleButtonGroup value={activeView} exclusive onChange={handleViewChange} aria-label="Dashboard view selection" fullWidth sx={{ display: 'flex', borderRadius: `${groupBorderRadius}px`, overflow: 'hidden', bgcolor: 'background.paper' }}>
                        <ToggleButton value="inventory" aria-label="inventory" disableRipple sx={{ flexGrow: 1, height: `${groupHeight}px`, textTransform: 'none', fontFamily: fontFamily, fontSize: baseFontSize, fontWeight: baseFontWeight, lineHeight: '100%', letterSpacing: '0%', border: 'none', borderRadius: 0, color: activeView === 'inventory' ? activeTextColorCalculated : inactiveTextColor, bgcolor: activeView === 'inventory' ? activeBgColor : 'transparent', '&:hover': { bgcolor: activeView !== 'inventory' ? theme.palette.action.hover : activeBgColor }, '&.Mui-selected': { color: activeTextColorCalculated, bgcolor: activeBgColor, '&:hover': { bgcolor: activeBgColor } } }}> Inventory </ToggleButton>
                        <ToggleButton value="salesOrder" aria-label="sales order" disableRipple sx={{ flexGrow: 1, height: `${groupHeight}px`, textTransform: 'none', fontFamily: fontFamily, fontSize: baseFontSize, fontWeight: baseFontWeight, lineHeight: '100%', letterSpacing: '0%', border: 'none', borderRadius: 0, color: activeView === 'salesOrder' ? activeTextColorCalculated : inactiveTextColor, bgcolor: activeView === 'salesOrder' ? activeBgColor : 'transparent', '&:hover': { bgcolor: activeView !== 'salesOrder' ? theme.palette.action.hover : activeBgColor }, '&.Mui-selected': { color: activeTextColorCalculated, bgcolor: activeBgColor, '&:hover': { bgcolor: activeBgColor } } }}> Sales/Order </ToggleButton>
                    </ToggleButtonGroup>
                </Box>
                {isCheckingUsage && <LoadingOverlay text="Checking usage limits..." />}

                {/* Upgrade Alert Dialog */}
                <Dialog
                    open={showUpgradeAlert}
                    onClose={() => setShowUpgradeAlert(false)}
                    aria-labelledby="upgrade-dialog-title"
                    aria-describedby="upgrade-dialog-description"
                    fullWidth
                    maxWidth="xs"
                    BackdropProps={{
                        style: {
                            backgroundColor: 'rgba(34, 34, 34,)', // Dark overlay, matches app aesthetic
                        },
                    }}
                    TransitionProps={{ timeout: 0 }} // Instant appearance, no fade
                    sx={{
                        '& .MuiDialog-paper': {
                            borderRadius: '12px',
                            maxWidth: 'min(90vw, 400px)',
                            margin: '16px',
                            fontFamily: 'Manrope',
                            color: 'rgba(34, 34, 34, 1)',
                            boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
                        },
                    }}
                >
                    <DialogTitle
                        id="upgrade-dialog-title"
                        sx={{
                            fontFamily: 'Manrope',
                            fontSize: '18px',
                            fontWeight: 700,
                            color: 'rgba(34, 34, 34, 1)',
                            padding: '16px 24px',
                            textAlign: 'center',
                        }}
                    >
                        Upgrade for Unlimited Access
                    </DialogTitle>
                    <DialogContent sx={{ padding: '0 24px 16px' }}>
                        <DialogContentText
                            id="upgrade-dialog-description"
                            sx={{
                                fontFamily: 'Manrope',
                                fontSize: '14px',
                                fontWeight: 400,
                                color: 'rgba(34, 34, 34, 1)',
                                textAlign: 'center',
                                lineHeight: 1.5,
                            }}
                        >
                            You’ve reached the free limit of 5 image analyses. Subscribe for ₦5,000 to unlock unlimited AI image analysis with Gemini.
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions
                        sx={{
                            padding: '8px 24px 16px',
                            display: 'flex',
                            gap: 2,
                            justifyContent: 'center',
                        }}
                    >
                        <Button
                            onClick={() => setShowUpgradeAlert(false)}
                            sx={{
                                fontFamily: 'Manrope',
                                fontSize: '14px',
                                fontWeight: 500,
                                color: 'rgba(34, 34, 34, 1)',
                                textTransform: 'none',
                                padding: '8px 16px',
                                borderRadius: '8px',
                                minWidth: '100px',
                                backgroundColor: 'rgba(0, 0, 0, 0.05)',
                                '&:hover': {
                                    backgroundColor: 'rgba(0, 0, 0, 0.1)',
                                },
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={() => {
                                setShowUpgradeAlert(false);
                                router.push(`/${user?.uid}/dashboard/upgrade`);
                            }}
                            sx={{
                                fontFamily: 'Manrope',
                                fontSize: '14px',
                                fontWeight: 500,
                                color: '#fff',
                                textTransform: 'none',
                                padding: '8px 16px',
                                borderRadius: '8px',
                                minWidth: '100px',
                                backgroundColor: 'rgba(34, 34, 34, 1)',
                                '&:hover': {
                                    backgroundColor: 'rgba(34, 34, 34, 0.9)',
                                },
                            }}
                            autoFocus
                        >
                            Upgrade
                        </Button>
                    </DialogActions>
                </Dialog>
                {/* Error Display */}
                <Snackbar open={!!aiError} autoHideDuration={6000} onClose={() => setAiError(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} >
                    <Alert onClose={() => setAiError(null)} severity="error" sx={{ width: '100%' }}> {aiError} </Alert>
                </Snackbar>
                {/* Dynamic Content */}
                <Box sx={{ p: { xs: 2, sm: 3 }, pb: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {activeView === 'inventory' && <InventoryContent user={user} onGenerateWithAiClick={handleGenerateWithAiClick} />}
                    {activeView === 'salesOrder' && <SalesOrderContent user={user} />}
                </Box>
            </Box>
        </Box>
    );
}