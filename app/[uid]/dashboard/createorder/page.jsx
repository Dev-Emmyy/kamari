"use client";
import { useState, useEffect, useRef } from 'react';
import {
    Box, Typography, Button, TextField, Paper, List, ListItem, ListItemText,
    ListItemAvatar, Avatar, IconButton, Divider, CircularProgress, useTheme,
    Dialog, DialogTitle, DialogContent, DialogActions, Skeleton
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import Header from '@/app/components/Header';
import { useRouter } from 'next/navigation';
import { db, auth } from '../../../../lib/firebase';
import { collection, query, orderBy, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import Image from "next/image";

// Currency formatting helper
function formatCurrency(amount) {
    if (typeof amount !== 'number' || isNaN(amount)) return "₦0";
    const formatter = new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0, maximumFractionDigits: 0 });
    return formatter.format(amount);
}

export default function CreateOrderForm() {
    const theme = useTheme();
    const router = useRouter();
    const headerRef = useRef(null);

    // State
    const [user, setUser] = useState(null); // Store authenticated user
    const [authLoading, setAuthLoading] = useState(true); // Track auth initialization
    const [authError, setAuthError] = useState(null); // Track auth errors
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState('');
    const [submitError, setSubmitError] = useState(false);
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [inventoryItems, setInventoryItems] = useState([]);
    const [isLoadingInventory, setIsLoadingInventory] = useState(false);
    const [errorInventory, setErrorInventory] = useState(null);

    // Set up auth state listener
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            console.log("[Auth State] User state changed:", currentUser ? currentUser.uid : null);
            setUser(currentUser);
            setAuthLoading(false);
            if (!currentUser) {
                setAuthError("Please sign in to create an order.");
            } else {
                setAuthError(null);
            }
        }, (error) => {
            console.error("[Auth State] Error:", error);
            setAuthLoading(false);
            setAuthError(error.message);
            setUser(null);
        });

        return () => unsubscribe(); // Clean up listener on unmount
    }, []);

    // Fetch inventory items when user is authenticated
    useEffect(() => {
        if (authLoading) {
            console.log("[Inventory Fetch Effect] Waiting for auth state...");
            setIsLoadingInventory(true);
            return;
        }

        if (!user?.uid) {
            console.log("[Inventory Fetch Effect] No user authenticated.");
            setIsLoadingInventory(false);
            setErrorInventory("Please sign in to view inventory.");
            setInventoryItems([]);
            return;
        }

        const fetchInventoryData = async () => {
            setIsLoadingInventory(true);
            setErrorInventory(null);
            console.log("[Inventory Fetch] Fetching for user:", user.uid);

            try {
                const itemsCollectionRef = collection(db, 'users', user.uid, 'items');
                const q = query(itemsCollectionRef, orderBy('createdAt', 'desc'));
                const querySnapshot = await getDocs(q);
                console.log(`[Inventory Fetch] Found ${querySnapshot.size} documents.`);

                const itemsData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    name: doc.data().title || 'Untitled Item',
                    price: doc.data().sellingPrice || 0,
                    imageUrl: doc.data().imageUrl || null,
                }));

                console.log("[Inventory Fetch] Fetched items:", itemsData);
                setInventoryItems(itemsData);
                setErrorInventory(null);
            } catch (error) {
                console.error("[Inventory Fetch] Firestore error:", error);
                setErrorInventory(`Failed to load inventory: ${error.message}`);
                setInventoryItems([]);
            } finally {
                setIsLoadingInventory(false);
            }
        };

        fetchInventoryData();
    }, [user, authLoading]);

    // Handlers
    const handleAddProduct = () => {
        console.log("[Add Product] Opening product modal");
        setIsProductModalOpen(true);
    };

    const handleCloseProductModal = () => {
        setIsProductModalOpen(false);
    };

    const handleAddFromContacts = async () => {
        console.log("[AddFromContacts] Checking Contact Picker API support...");
        const isSupported = 'contacts' in navigator && 'select' in navigator.contacts;
        if (!isSupported) {
            console.log("[AddFromContacts] Contact Picker API not supported.");
            alert("Contact Picker API is not supported on this browser or device. Please enter details manually.");
            return;
        }
    
        // Check for HTTPS
        if (window.location.protocol !== 'https:') {
            console.log("[AddFromContacts] HTTPS required for Contact Picker API.");
            alert("Contact Picker API requires HTTPS. Please test on a deployed site or enable HTTPS locally.");
            return;
        }
    
        const properties = ['name', 'tel'];
        const options = { multiple: false };
    
        try {
            console.log("[AddFromContacts] Requesting contacts...");
            const selectedContacts = await navigator.contacts.select(properties, options);
            console.log("[AddFromContacts] Selected contacts:", selectedContacts);
    
            if (!selectedContacts || selectedContacts.length === 0) {
                console.log("[AddFromContacts] No contacts selected.");
                alert("No contact selected. Please try again or enter details manually.");
                return;
            }
    
            const contact = selectedContacts[0];
            const name = contact.name?.join(' ') || '';
            const phone = contact.tel?.[0] || '';
            console.log("[AddFromContacts] Parsed contact:", { name, phone });
    
            if (!name && !phone) {
                console.log("[AddFromContacts] Contact has no name or phone.");
                alert("Selected contact has no name or phone number. Please select another contact.");
                return;
            }
    
            setCustomerName(name);
            setCustomerPhone(phone);
            console.log("[AddFromContacts] Updated form with:", { customerName: name, customerPhone: phone });
        } catch (error) {
            console.error("[AddFromContacts] Contact Picker error:", error);
            alert(`Failed to fetch contacts: ${error.message}. Please try again or enter details manually.`);
        }
    };

    const handleProductSelect = (productToAdd) => {
        if (selectedProducts.some(p => p.id === productToAdd.id)) {
            alert(`${productToAdd.name} is already added.`);
            return;
        }
        setSelectedProducts(prev => [...prev, {
            id: productToAdd.id,
            name: productToAdd.name,
            price: productToAdd.price,
            imageUrl: productToAdd.imageUrl,
            quantity: 1,
        }]);
    };

    const handleRemoveProduct = (productId) => {
        setSelectedProducts(prev => prev.filter(p => p.id !== productId));
    };

    const handleSubmitOrder = async () => {
        setSubmitMessage('');
        setSubmitError(false);

        if (!customerName.trim() || !customerPhone.trim()) {
            setSubmitMessage('Please enter customer Name and Phone Number.');
            setSubmitError(true);
            return;
        }
        if (selectedProducts.length === 0) {
            setSubmitMessage('Please add at least one product.');
            setSubmitError(true);
            return;
        }
        if (!user?.uid) {
            setSubmitMessage('Error: User not authenticated.');
            setSubmitError(true);
            return;
        }

        setIsSubmitting(true);
        try {
            const orderData = {
                customerName: customerName.trim(),
                customerPhone: customerPhone.trim(),
                products: selectedProducts.map(p => ({
                    id: p.id,
                    name: p.name,
                    price: p.price,
                    quantity: p.quantity,
                    imageUrl: p.imageUrl || null,
                })),
                totalAmount: selectedProducts.reduce((sum, p) => sum + p.price, 0),
                createdAt: serverTimestamp(),
                paymentStatus: 'unpaid',
                shippingStatus: 'unshipped',
                userId: user.uid,
            };

            const ordersCollectionRef = collection(db, 'users', user.uid, 'orders');
            await addDoc(ordersCollectionRef, orderData);
            setSubmitMessage('Order created successfully!');
            setSubmitError(false);

            setCustomerName('');
            setCustomerPhone('');
            setSelectedProducts([]);
        } catch (error) {
            console.error("Error creating order:", error);
            setSubmitMessage('Failed to create order. Please try again.');
            setSubmitError(true);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Render
    if (authLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
    if (authError) return <Typography color="error" sx={{ textAlign: 'center', mt: 4 }}>Auth Error: {authError}</Typography>;
    if (!user) return <Typography sx={{ textAlign: 'center', mt: 4 }}>Please sign in to create an order.</Typography>;

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', p: 2, maxWidth: '450px', margin: '20px auto', bgcolor: '#F8F8F8', borderRadius: '8px', gap: 2 }}>
            <Header user={user} ref={headerRef} />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, color: "rgba(34, 34, 34, 1)", fontSize: "20px", fontFamily: "Manrope" }}>Create Order</Typography>
                <Button fullWidth variant="contained" startIcon={<AddCircleOutlineIcon />} onClick={handleAddFromContacts} sx={{ bgcolor: 'rgba(34, 34, 34, 1)', color: '#fff', textTransform: 'none', fontFamily: "Manrope", fontWeight: 400, borderRadius: '8px', py: 1.5, fontSize: '1rem', '&:hover': { bgcolor: 'grey.800' } }}>
                    Add Customer from Contacts
                </Button>
                <Divider sx={{ my: 2, color: "#5f6368", fontFamily: "Manrope, sans-serif", fontWeight: 800, fontSize: 14, width: '100%' }} >
                    OR
                </Divider>
                <TextField fullWidth label="Name" variant="outlined" value={customerName} onChange={(e) => setCustomerName(e.target.value)} sx={{ "& .MuiOutlinedInput-root": { borderRadius: "14px", "& .MuiOutlinedInput-notchedOutline": { border: "1px solid rgba(133, 133, 133, 1)" }, "&:hover .MuiOutlinedInput-notchedOutline": { border: "1px solid rgba(133, 133, 133, 1)" }, "&.Mui-focused .MuiOutlinedInput-notchedOutline": { border: "1px solid rgba(133, 133, 133, 1)" }, "& .MuiInputBase-input": { fontFamily: "'Instrument Sans', sans-serif", fontSize: "14px", padding: "15px" } }, "& .MuiInputLabel-root": { fontFamily: "'Instrument Sans', sans-serif", fontWeight: 400, fontSize: "14px", color: "rgba(66, 64, 61, 1)" }, "& .MuiInputLabel-root.Mui-focused": { color: "rgba(66, 64, 61, 1)", fontWeight: 400, fontSize: "14px" } }} />
                <TextField fullWidth label="Phone Number" variant="outlined" type="tel" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} sx={{ "& .MuiOutlinedInput-root": { borderRadius: "14px", "& .MuiOutlinedInput-notchedOutline": { border: "1px solid rgb(226, 185, 21)" }, "&:hover .MuiOutlinedInput-notchedOutline": { border: "1px solid rgb(226, 185, 21)" }, "&.Mui-focused .MuiOutlinedInput-notchedOutline": { border: "1px solid rgb(226, 185, 21)" }, "& .MuiInputBase-input": { fontFamily: "'Instrument Sans', sans-serif", fontSize: "14px", padding: "15px" } }, "& .MuiInputLabel-root": { fontFamily: "'Instrument Sans', sans-serif", fontWeight: 400, fontSize: "14px", color: "rgba(66, 64, 61, 1)" }, "& .MuiInputLabel-root.Mui-focused": { color: "rgba(66, 64, 61, 1)", fontWeight: 400, fontSize: "14px" } }} />
                <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-start' }}>
                    <Button variant="contained" startIcon={<AddCircleOutlineIcon />} onClick={handleAddProduct} sx={{ width: "186px", bgcolor: 'rgba(34, 34, 34, 1)', color: '#fff', textTransform: 'none', fontFamily: "Manrope", fontWeight: 400, borderRadius: '8px', py: 1.5, fontSize: '1rem', '&:hover': { bgcolor: 'grey.800' } }}>
                        Add Products
                    </Button>
                </Box>
                {selectedProducts.length > 0 && (
                    <List sx={{ width: '100%', bgcolor: 'transparent', p: 0 }}>
                        {selectedProducts.map((product, index) => (
                            <Paper key={product.id} elevation={1} sx={{ width: '100%', mb: index < selectedProducts.length - 1 ? 1.5 : 0, borderRadius: '8px', overflow: 'hidden' }}>
                                <ListItem alignItems="center" secondaryAction={<IconButton edge="end" onClick={() => handleRemoveProduct(product.id)} sx={{
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
                                }}><Image src="/trash.png" width={20} height={20} alt="" style={{ filter: 'brightness(0) invert(1)' }}/></IconButton>} sx={{ py: 1.5, px: 2 }}>
                                    <ListItemAvatar sx={{ mr: 2 }}><Avatar variant="rounded" src={product.imageUrl} alt={product.name} sx={{ width: 56, height: 56, bgcolor: 'grey.200' }} /></ListItemAvatar>
                                    <ListItemText primary={<Typography variant="body1" sx={{ fontWeight: 500, fontFamily : "Manrope" }}>{product.name}</Typography>} secondary={<Typography component="span" variant="body2" sx={{ display: 'block', fontWeight: 'bold', color: 'text.primary', mt: 0.5, fontFamily : "Manrope" }}>{formatCurrency(product.price)}</Typography>} />
                                </ListItem>
                            </Paper>
                        ))}
                    </List>
                )}
                {selectedProducts.length === 0 && <Typography variant="body2" color="text.secondary" sx={{ my: 2 }}>No products added yet.</Typography>}
                <Button fullWidth variant="contained" onClick={handleSubmitOrder} disabled={isSubmitting} size="large" sx={{ bgcolor: 'rgba(34, 34, 34, 1)', color: '#fff', textTransform: 'none', fontFamily: "Manrope", fontWeight: 400, borderRadius: '8px', py: 1.5, fontSize: '1rem', '&:hover': { bgcolor: 'grey.800' } }}>
                    {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Create Order'}
                </Button>
                {submitMessage && <Typography color={submitError ? 'error' : 'success.main'} sx={{ mt: 2, textAlign: 'center' }}>{submitMessage}</Typography>}
            </Box>
            <Dialog open={isProductModalOpen} onClose={handleCloseProductModal} fullWidth maxWidth="xs">
            <Dialog
                open={isProductModalOpen}
                onClose={handleCloseProductModal}
                fullWidth
                maxWidth="xs"
                sx={{
                    '& .MuiDialog-paper': {
                        borderRadius: '12px',
                        maxWidth: '90%', // Ensure modal fits small screens
                        margin: '16px',
                        fontFamily: 'Manrope',
                        color: 'rgba(34, 34, 34, 1)',
                    },
                }}
            >
                <DialogTitle
                    sx={{
                        fontFamily: 'Manrope',
                        fontSize: '18px',
                        fontWeight: 700,
                        color: 'rgba(34, 34, 34, 1)',
                        padding: '16px',
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}
                >
                    Select Products
                    <IconButton
                        aria-label="close"
                        onClick={handleCloseProductModal}
                        sx={{
                            position: 'absolute',
                            right: 8,
                            top: 8,
                            color: theme.palette.grey[500],
                            padding: '8px',
                            '& svg': {
                                fontSize: '24px', // Larger for touch
                            },
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent
                    dividers
                    sx={{
                        padding: '16px',
                        fontFamily: 'Manrope',
                        color: 'rgba(34, 34, 34, 1)',
                    }}
                >
                    {console.log("[Modal State] Current state:", { isLoadingInventory, errorInventory, inventoryItems })}
                    {isLoadingInventory && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', padding: '24px' }}>
                            <CircularProgress size={32} />
                        </Box>
                    )}
                    {!isLoadingInventory && errorInventory && (
                        <Typography
                            sx={{
                                fontFamily: 'Manrope',
                                fontSize: '14px',
                                fontWeight: 400,
                                color: theme.palette.error.main,
                                textAlign: 'center',
                                padding: '16px',
                            }}
                        >
                            {errorInventory}
                        </Typography>
                    )}
                    {!isLoadingInventory && !errorInventory && inventoryItems.length === 0 && (
                        <Typography
                            sx={{
                                fontFamily: 'Manrope',
                                fontSize: '14px',
                                fontWeight: 400,
                                color: 'rgba(34, 34, 34, 1)',
                                textAlign: 'center',
                                padding: '16px',
                            }}
                        >
                            Your inventory is empty.
                        </Typography>
                    )}
                    {!isLoadingInventory && !errorInventory && inventoryItems.length > 0 && (
                        <List
                            dense
                            sx={{
                                padding: 0,
                                '& .MuiListItem-root': {
                                    padding: '8px 0',
                                    alignItems: 'center',
                                },
                            }}
                        >
                            {inventoryItems.map((item) => (
                                <ListItem
                                    key={item.id}
                                    secondaryAction={
                                        <Button
                                            size="small"
                                            variant="outlined"
                                            onClick={() => handleProductSelect(item)}
                                            disabled={selectedProducts.some(p => p.id === item.id)}
                                            sx={{
                                                fontFamily: 'Manrope',
                                                fontSize: '14px',
                                                fontWeight: 500,
                                                color: 'rgba(34, 34, 34, 1)',
                                                borderColor: 'rgba(34, 34, 34, 1)',
                                                borderRadius: '8px',
                                                padding: '4px 12px',
                                                textTransform: 'none',
                                                minWidth: '64px',
                                                '&:hover': {
                                                    backgroundColor: 'rgba(34, 34, 34, 0.05)',
                                                    borderColor: 'rgba(34, 34, 34, 1)',
                                                },
                                                '&.Mui-disabled': {
                                                    color: 'rgba(34, 34, 34, 0.5)',
                                                    borderColor: 'rgba(34, 34, 34, 0.5)',
                                                    opacity: 0.6,
                                                },
                                            }}
                                        >
                                            Add
                                        </Button>
                                    }
                                    sx={{
                                        borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
                                        '&:last-child': {
                                            borderBottom: 'none',
                                        },
                                    }}
                                >
                                    <ListItemAvatar>
                                        <Avatar
                                            variant="rounded"
                                            src={item.imageUrl}
                                            sx={{
                                                width: 40,
                                                height: 40,
                                                bgcolor: 'grey.200',
                                                marginRight: '12px',
                                            }}
                                        />
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={
                                            <Typography
                                                sx={{
                                                    fontFamily: 'Manrope',
                                                    fontSize: '16px',
                                                    fontWeight: 500,
                                                    color: 'rgba(34, 34, 34, 1)',
                                                    maxWidth: '100px',
                                                    textOverflow: 'ellipsis',
                                                    overflow: 'hidden',
                                                    whiteSpace: 'nowrap',
                                                }}
                                            >
                                                {item.name}
                                            </Typography>
                                        }
                                        secondary={
                                            <Typography
                                                sx={{
                                                    fontFamily: 'Manrope',
                                                    fontSize: '14px',
                                                    fontWeight: 400,
                                                    color: 'rgba(34, 34, 34, 1)',
                                                }}
                                            >
                                                {formatCurrency(item.price)}
                                            </Typography>
                                        }
                                    />
                                </ListItem>
                            ))}
                        </List>
                    )}
                </DialogContent>
                <DialogActions
                    sx={{
                        padding: '8px 16px',
                        fontFamily: 'Manrope',
                    }}
                >
                    <Button
                        onClick={handleCloseProductModal}
                        fullWidth
                        variant="contained"
                        sx={{
                            fontFamily: 'Manrope',
                            fontSize: '16px',
                            fontWeight: 500,
                            color: '#fff',
                            backgroundColor: 'rgba(34, 34, 34, 1)',
                            borderRadius: '8px',
                            padding: '8px 16px',
                            textTransform: 'none',
                            '&:hover': {
                                backgroundColor: 'rgba(34, 34, 34, 0.9)',
                            },
                        }}
                    >
                        Done
                    </Button>
                </DialogActions>
            </Dialog>
            </Dialog>
        </Box>
    );
}