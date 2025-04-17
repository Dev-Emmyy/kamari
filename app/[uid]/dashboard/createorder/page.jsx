"use client"; // Keep client directive
import { useState, useRef , useEffect} from 'react';
import {
    Box,
    Typography,
    Button,
    TextField,
    Paper,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
    IconButton,
    Divider,
    CircularProgress,
    useTheme, 
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Skeleton
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import Header from '@/app/components/Header'; // Assuming this path is correct

// --- Firestore Imports (Needed for saving order) ---
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../../../lib/firebase"; // Adjust path as needed for your firebase config

// --- Next Router (If needed for navigation after order creation) ---
import { useRouter } from 'next/navigation';

// --- Firebase Auth (If sign out is really needed HERE, but unlikely) ---
// import { signOut } from 'firebase/auth';
// import { auth } from '../../../lib/firebase';


// --- Helper: Currency Formatting (NGN - Naira) ---
function formatCurrency(amount) {
    if (typeof amount !== 'number' || isNaN(amount)) { return "₦0"; }
    const formatter = new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0, maximumFractionDigits: 0 });
    return formatter.format(amount);
};


// --- Main Create Order Form Component ---
// Assuming this component receives user via props from a page where auth is checked
export default function CreateOrderForm({ user }) { // Receive user as prop
    const theme = useTheme();
    const router = useRouter(); // Initialize router if needed for navigation
    const headerRef = useRef(null); // Keep if used by Header

    // --- State ---
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState('');
    const [submitError, setSubmitError] = useState(false);

    // *** State for Product Selection Modal ***
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [inventoryItems, setInventoryItems] = useState([]);
    const [isLoadingInventory, setIsLoadingInventory] = useState(false);
    const [errorInventory, setErrorInventory] = useState(null);


    // --- Fetch Inventory Items (for the modal) ---
    useEffect(() => {
        // --- WAIT for user prop ---
        // If user or user.uid is not yet available, do nothing this time.
        // The effect will re-run when the 'user' prop changes.
        if (!user?.uid) {
            console.log("Inventory fetch waiting for user prop...");
            // Don't set an error here, just wait. Keep loading true if it wasn't set false yet.
            // If inventoryItems is empty, the modal will show "loading" or "empty" correctly.
            // If loading was already true, let it remain true.
             if (!isLoadingInventory && inventoryItems.length === 0) {
                 setIsLoadingInventory(true); // Ensure loading is shown while waiting
             }
            return;
        }

        // --- User is available, proceed with fetching ---
        setIsLoadingInventory(true);
        setErrorInventory(null);
        console.log("Fetching inventory for user:", user.uid);

        const itemsCollectionRef = collection(db, 'users', user.uid, 'items');
        const q = query(itemsCollectionRef, orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const itemsData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                name: doc.data().title || 'Untitled Item',
                price: doc.data().sellingPrice || 0,
                imageUrl: doc.data().imageUrl || null
            }));
            console.log("Fetched Inventory:", itemsData);
            setInventoryItems(itemsData);
            setIsLoadingInventory(false); // Set loading false AFTER data is processed
        }, (error) => {
            console.error("Error fetching inventory for modal:", error);
            setErrorInventory(`Failed to load inventory: ${error.message}`);
            setIsLoadingInventory(false);
        });

        return () => unsubscribe();

    }, [user]); // Dependency array MUST include user

    const handleAddProduct = () => {
        setIsProductModalOpen(true); // Open the modal
    };

    // *** Handler for closing the modal ***
    const handleCloseProductModal = () => {
        setIsProductModalOpen(false);
    };

    // --- BEGIN MISSING HANDLER DEFINITIONS ---

    const handleAddFromContacts = async () => {
        // --- Check for Contact Picker API support ---
        const isSupported = ('select' in navigator.contacts);
    
        if (!isSupported) {
            console.warn("Contact Picker API is not supported in this browser.");
            alert("Sorry, selecting contacts directly is not supported by your browser. Please enter the details manually.");
            return;
        }
    
        // --- Properties you want to retrieve ---
        // Options: 'name', 'email', 'tel', 'address', 'icon'
        const properties = ['name', 'tel'];
        // --- Options ---
        // multiple: true if you want to allow selecting multiple contacts
        const options = { multiple: false };
    
        try {
            console.log("Opening Contact Picker...");
            // --- Call the Contact Picker API ---
            // This opens a native UI controlled by the browser/OS
            const selectedContacts = await navigator.contacts.select(properties, options);
    
            // --- Process the result ---
            if (!selectedContacts || selectedContacts.length === 0) {
                console.log("Contact Picker: No contact selected or selection cancelled.");
                return; // User didn't select anything
            }
    
            // Since options.multiple = false, we expect only one contact
            const contact = selectedContacts[0];
            console.log("Contact selected:", contact);
    
            // Extract data and update state (handle cases where data might be missing)
            let name = '';
            if (contact.name && contact.name.length > 0) {
                // .name is an array of strings (e.g., ["Given", "Family"])
                name = contact.name.join(' ');
            }
    
            let phone = '';
            if (contact.tel && contact.tel.length > 0) {
                // .tel is an array of phone numbers
                phone = contact.tel[0]; // Get the first phone number
            }
    
            // Update your form's state variables
            if (name) setCustomerName(name);
            if (phone) setCustomerPhone(phone);
    
            console.log(`Updated form with: Name=${name}, Phone=${phone}`);
    
        } catch (error) {
            // Handle potential errors
            console.error("Error using Contact Picker API:", error);
            if (error.name === 'NotAllowedError') {
                 alert("Permission to access contacts was denied or dismissed. Please grant permission if you want to use this feature.");
            } else if (error.name === "NotFoundError") {
                 alert("No contacts with the requested properties (name, phone) were found on the device.");
            }
            else {
                alert(`An error occurred while trying to access contacts: ${error.message}`);
            }
        }
    };
    
    const handleProductSelect = (productToAdd) => {
        // Check if product is already selected
        if (selectedProducts.some(p => p.id === productToAdd.id)) {
            alert(`${productToAdd.name} is already added to the order.`);
            return;
        }
        // Add the selected product to the order list
        setSelectedProducts(prevProducts => [...prevProducts, {
            // Add only necessary fields from inventory item to order item
            id: productToAdd.id,
            name: productToAdd.name,
            price: productToAdd.price,
            imageUrl: productToAdd.imageUrl,
            quantity: 1 // Default quantity, can be adjusted later if needed
        }]);
         // Optionally close modal after adding one item
        // handleCloseProductModal();
    };

    const handleRemoveProduct = (productId) => {
        setSelectedProducts(prevProducts => prevProducts.filter(p => p.id !== productId));
    };

    const handleSubmitOrder = async () => {
        setSubmitMessage('');
        setSubmitError(false);

        // Basic Validation
        if (!customerName.trim() || !customerPhone.trim()) {
            setSubmitMessage('Please enter customer Name and Phone Number.');
            setSubmitError(true);
            return;
        }
        if (selectedProducts.length === 0) {
            setSubmitMessage('Please add at least one product to the order.');
            setSubmitError(true);
            return;
        }
        // Ensure user is available before submitting
        if (!user || !user.uid) {
             setSubmitMessage('Error: User not logged in.');
             setSubmitError(true);
             return;
        }


        setIsSubmitting(true);
        console.log("Submitting Order to Firestore...");

        try {
            // Prepare data for Firestore
            const orderData = {
                customerName: customerName.trim(),
                customerPhone: customerPhone.trim(),
                products: selectedProducts.map(p => ({
                     id: p.id,
                     name: p.name,
                     price: p.price,
                     quantity: 1, // Add quantity logic if needed
                     imageUrl: p.imageUrl || null
                 })),
                totalAmount: selectedProducts.reduce((sum, p) => sum + p.price, 0),
                createdAt: serverTimestamp(),
                paymentStatus: 'unpaid',
                shippingStatus: 'unshipped',
                userId: user.uid // Link order to user
            };

            const ordersCollectionRef = collection(db, 'users', user.uid, 'orders');
            const docRef = await addDoc(ordersCollectionRef, orderData);

            console.log("Order created with ID: ", docRef.id);
            setSubmitMessage('Order created successfully!');
            setSubmitError(false);

            // Clear the form
            setCustomerName('');
            setCustomerPhone('');
            setSelectedProducts([]);

            // Optional: Navigate back after a short delay
            // setTimeout(() => {
            //     router.push(`/${user.uid}/dashboard`); // Go back to dashboard
            // }, 1000);


        } catch (e) {
            console.error("Error adding order document: ", e);
            setSubmitMessage('Failed to create order. Please try again.');
            setSubmitError(true);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Remove handleSignOut from here - it should be handled by the Header component itself
    // const handleSignOut = async () => { ... };

    // --- END MISSING HANDLER DEFINITIONS ---


    // --- Render ---
    return (
        <Box
            sx={{ /* Main container styles */
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'stretch',
                p: 2, // Padding around the form
                maxWidth: '450px', // Max width for the form container
                margin: '20px auto', // Center the form
                bgcolor: theme.palette.background.default, // Use theme background
                borderRadius: '8px',
                gap: 2, // Spacing between elements
            }}
        >
            {/* Pass user and potentially a handleSignOut from parent if Header needs it */}
            <Header user={user} /* onSignOut={handleSignOut} ??? */ ref={headerRef} />

            {/* Form Content Box */}
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 3
                }}
            >
                {/* --- Title --- */}
                <Typography
                     variant="h5" component="h1"
                     sx={{
                         width: '100%', textAlign: 'left', // Align left
                         fontWeight: 700, // Use numeric or keyword
                         mb: 1, // Adjust margin
                         color: "rgba(34, 34, 34, 1)", fontSize: "20px", fontFamily: "Manrope"
                     }}>
                    Create Order
                </Typography>

                {/* --- Customer Section --- */}
                <Button
                    fullWidth variant="contained" startIcon={<AddCircleOutlineIcon />}
                    onClick={handleAddFromContacts} // Error occurs here if definition missing
                    sx={{ /* Button styles */
                        bgcolor: 'rgba(34, 34, 34, 1)', color: '#fff', textTransform: 'none',
                        fontFamily: "Manrope", fontWeight: 400, // Corrected fontWeight
                        borderRadius: '8px', py: 1.5, fontSize: '1rem', '&:hover': { bgcolor: 'grey.800' }
                    }}
                >
                    Add Customer from Contacts
                </Button>

                <Divider sx={{ width: '80%', my: 1, fontSize: '0.9rem', color: 'text.secondary' }} > OR </Divider>

                <TextField
                    fullWidth label="Name" variant="outlined" value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    sx={{ /* TextField styles */
                       "& .MuiOutlinedInput-root": { borderRadius: "14px", "& .MuiOutlinedInput-notchedOutline": { border: "1px solid rgba(133, 133, 133, 1)" }, "&:hover .MuiOutlinedInput-notchedOutline": { border: "1px solid rgba(133, 133, 133, 1)" }, "&.Mui-focused .MuiOutlinedInput-notchedOutline": { border: "1px solid rgba(133, 133, 133, 1)" }, "& .MuiInputBase-input": { fontFamily: "'Instrument Sans', sans-serif", fontSize: "14px", padding: "15px" }, }, "& .MuiInputLabel-root": { fontFamily: "'Instrument Sans', sans-serif", fontWeight: 400, fontSize: "14px", color: "rgba(66, 64, 61, 1)" }, "& .MuiInputLabel-root.Mui-focused": { color: "rgba(66, 64, 61, 1)", fontWeight: 400, fontSize: "14px" },
                     }}
                />
                <TextField
                    fullWidth label="Phone Number" variant="outlined" type="tel" value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    sx={{ /* TextField styles */
                       "& .MuiOutlinedInput-root": { borderRadius: "14px", "& .MuiOutlinedInput-notchedOutline": { border: "1px solid rgb(226, 185, 21)" }, "&:hover .MuiOutlinedInput-notchedOutline": { border: "1px solid rgb(226, 185, 21)" }, "&.Mui-focused .MuiOutlinedInput-notchedOutline": { border: "1px solid rgb(226, 185, 21)" }, "& .MuiInputBase-input": { fontFamily: "'Instrument Sans', sans-serif", fontSize: "14px", padding: "15px" }, }, "& .MuiInputLabel-root": { fontFamily: "'Instrument Sans', sans-serif", fontWeight: 400, fontSize: "14px", color: "rgba(66, 64, 61, 1)" }, "& .MuiInputLabel-root.Mui-focused": { color: "rgba(66, 64, 61, 1)", fontWeight: 400, fontSize: "14px" },
                     }}
                />

                {/* --- Product Section --- */}
                {/* Align Add Products button to the left */}
                <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-start' }}>
                   <Button
                       // fullWidth // Remove fullWidth if aligning left
                       variant="contained" startIcon={<AddCircleOutlineIcon />}
                       onClick={handleAddProduct}
                       sx={{ /* Button styles */
                           width: "186px", // Keep specific width if desired
                           bgcolor: 'rgba(34, 34, 34, 1)', color: '#fff', textTransform: 'none',
                           fontFamily: "Manrope", fontWeight: 400, // Corrected fontWeight
                           borderRadius: '8px', py: 1.5, fontSize: '1rem', '&:hover': { bgcolor: 'grey.800' },
                           // mb: 2, mt: 2 // Keep margins if needed
                       }}
                   >
                       Add Products
                   </Button>
                </Box>


                {/* --- Selected Products List --- */}
                {selectedProducts.length > 0 && (
                   <List sx={{ width: '100%', bgcolor: 'transparent', p: 0 }}>
                       {selectedProducts.map((product, index) => (
                           <Paper key={product.id} elevation={1} sx={{ width: '100%', mb: index < selectedProducts.length - 1 ? 1.5 : 0, borderRadius: '8px', overflow: 'hidden' }}>
                               <ListItem alignItems="center" secondaryAction={ <IconButton edge="end" aria-label="remove product" onClick={() => handleRemoveProduct(product.id)} title="Remove Product"> <DeleteIcon /> </IconButton> } sx={{ py: 1.5, px: 2 }} >
                                   <ListItemAvatar sx={{ mr: 2 }}> <Avatar variant="rounded" src={product.imageUrl} alt={product.name} sx={{ width: 56, height: 56, bgcolor: 'grey.200' }} /> </ListItemAvatar>
                                   <ListItemText primary={ <Typography variant="body1" sx={{ fontWeight: 500 }}> {product.name} </Typography> } secondary={ <> <Typography component="span" variant="body2" color="text.secondary"> {product.dateAdded} </Typography> <Typography component="span" variant="body2" sx={{ display: 'block', fontWeight: 'bold', color: 'text.primary', mt: 0.5 }}> {formatCurrency(product.price)} </Typography> </> } />
                               </ListItem>
                           </Paper>
                       ))}
                   </List>
                )}
                {selectedProducts.length === 0 && ( <Typography variant="body2" color="text.secondary" sx={{ my: 2 }}> No products added yet. </Typography> )}


                {/* --- Submit Button --- */}
                <Button
                    fullWidth variant="contained" onClick={handleSubmitOrder} disabled={isSubmitting} size="large"
                    sx={{ /* Button styles */
                       bgcolor: 'rgba(34, 34, 34, 1)', color: '#fff', textTransform: 'none',
                       fontFamily: "Manrope", fontWeight: 400, // Corrected fontWeight
                       borderRadius: '8px', py: 1.5, fontSize: '1rem', '&:hover': { bgcolor: 'grey.800' }
                     }}
                >
                    {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Create Order'}
                </Button>

                {/* --- Submission Feedback --- */}
                {submitMessage && ( <Typography color={submitError ? 'error' : 'success.main'} sx={{ mt: 2, textAlign: 'center' }}> {submitMessage} </Typography> )}
            </Box>

            <Dialog
                open={isProductModalOpen}
                onClose={handleCloseProductModal}
                fullWidth
                maxWidth="xs" // Adjust based on content
                aria-labelledby="product-select-dialog-title"
            >
                <DialogTitle id="product-select-dialog-title">
                    Select Products from Inventory
                     <IconButton
                        aria-label="close"
                        onClick={handleCloseProductModal}
                        sx={{ position: 'absolute', right: 8, top: 8, color: (theme) => theme.palette.grey[500] }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers> {/* Add dividers for better spacing */}
                    {isLoadingInventory && (
                         <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                            <CircularProgress />
                         </Box>
                    )}
                    {!isLoadingInventory && errorInventory && (
                        <Typography color="error" sx={{ textAlign: 'center', p: 2 }}>{errorInventory}</Typography>
                    )}
                     {!isLoadingInventory && !errorInventory && inventoryItems.length === 0 && (
                        <Typography color="text.secondary" sx={{ textAlign: 'center', p: 2 }}>Your inventory is empty.</Typography>
                    )}
                    {!isLoadingInventory && !errorInventory && inventoryItems.length > 0 && (
                        <List dense>
                            {inventoryItems.map((item) => (
                                <ListItem
                                    key={item.id}
                                    secondaryAction={
                                        <Button
                                            size="small"
                                            variant="outlined"
                                            onClick={() => handleProductSelect(item)}
                                            // Disable if already selected? Optional
                                            disabled={selectedProducts.some(p => p.id === item.id)}
                                        >
                                            Add
                                        </Button>
                                    }
                                >
                                    <ListItemAvatar>
                                        <Avatar variant="rounded" src={item.imageUrl} sx={{ bgcolor: 'grey.200' }}/>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={item.name}
                                        secondary={formatCurrency(item.price)}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseProductModal}>Done</Button>
                </DialogActions>
            </Dialog>

        </Box>
    );
}