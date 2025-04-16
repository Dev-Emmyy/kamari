"use client"
import { useState } from 'react';
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
    useTheme
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete'; // Using Delete icon for removing products

// --- Helper: Currency Formatting (NGN - Naira) ---
function formatCurrency(amount) {
    if (typeof amount !== 'number' || isNaN(amount)) {
        return "₦0"; // Default or placeholder
    }
    const formatter = new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 0, // No kobo shown based on image
        maximumFractionDigits: 0,
    });
    // Intl might add NGN, replace it with ₦ if needed, though standard is often preferred
    return formatter.format(amount); //.replace('NGN', '₦');
}

// --- Mock Product Data (Simulating product selection) ---
const mockAvailableProducts = [
    { id: 'prod_001', name: 'Pink Slippers for kids', dateAdded: '10/08/2025', price: 38000, imageUrl: 'https://placehold.co/100x100/f0d0e0/333?text=Slippers1' },
    { id: 'prod_002', name: 'Blue Sandals', dateAdded: '11/08/2025', price: 25000, imageUrl: 'https://placehold.co/100x100/d0e0f0/333?text=Sandals' },
    { id: 'prod_003', name: 'Running Shoes', dateAdded: '12/08/2025', price: 45000, imageUrl: 'https://placehold.co/100x100/e0e0e0/333?text=Shoes' },
];

// --- Main Create Order Form Component ---
export default function CreateOrderForm() {
    const theme = useTheme(); // Access theme for styling consistency

    // --- State ---
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState(''); // For success/error feedback
    const [submitError, setSubmitError] = useState(false);

    // --- Handlers ---

    // Simulate adding customer from contacts
    const handleAddFromContacts = () => {
        console.log("Simulating: Add Customer from Contacts");
        // In a real app, this would involve complex integration
        // with device contacts API (e.g., using Capacitor/Cordova or specific Web APIs)
        alert("Contact integration not implemented in this demo.");
    };

    // Simulate adding a product to the order
    const handleAddProduct = () => {
        console.log("Simulating: Add Products");
        // In a real app, this would likely open a modal or navigate
        // to a product selection screen.
        if (mockAvailableProducts.length > selectedProducts.length) {
            // Add the next available mock product that isn't already selected
            const nextProduct = mockAvailableProducts.find(p => !selectedProducts.some(sp => sp.id === p.id));
            if (nextProduct) {
                setSelectedProducts(prevProducts => [...prevProducts, nextProduct]);
            } else {
                alert("All mock products added.");
            }
        } else {
            alert("No more mock products to add.");
        }
    };

    // Remove a product from the selected list
    const handleRemoveProduct = (productId) => {
        setSelectedProducts(prevProducts => prevProducts.filter(p => p.id !== productId));
    };

    // Handle the final order creation
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

        setIsSubmitting(true);
        console.log("Submitting Order...");
        console.log("Customer Name:", customerName);
        console.log("Customer Phone:", customerPhone);
        console.log("Selected Products:", selectedProducts);

        // Simulate API Call Delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // --- Replace with actual API call (e.g., to Firebase Firestore) ---
        // try {
        //   const orderData = {
        //     customerName,
        //     customerPhone,
        //     products: selectedProducts.map(p => ({ id: p.id, name: p.name, price: p.price })), // Send relevant data
        //     createdAt: serverTimestamp(), // Use server timestamp
        //     status: 'pending',
        //   };
        //   const docRef = await addDoc(collection(db, 'orders'), orderData);
        //   console.log("Order created with ID: ", docRef.id);
        //   setSubmitMessage('Order created successfully!');
        //   setSubmitError(false);
        //   // Optionally clear the form
        //   setCustomerName('');
        //   setCustomerPhone('');
        //   setSelectedProducts([]);
        // } catch (e) {
        //   console.error("Error adding document: ", e);
        //   setSubmitMessage('Failed to create order. Please try again.');
        //   setSubmitError(true);
        // } finally {
        //   setIsSubmitting(false);
        // }
        // --- End of actual API call block ---

        // Simulation result:
        setIsSubmitting(false);
        setSubmitMessage('Order submitted successfully (Simulated)!');
        setSubmitError(false);
        // Clear form after simulated success
        setCustomerName('');
        setCustomerPhone('');
        setSelectedProducts([]);

    };

    // --- Render ---
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                p: 2, // Padding around the form
                maxWidth: '450px', // Max width for the form container
                margin: '20px auto', // Center the form
                bgcolor: theme.palette.background.default, // Use theme background
                borderRadius: '8px',
                gap: 2, // Spacing between elements
            }}
        >
            {/* --- Header --- */}
            {/* Assuming header with logo/icons is outside this specific form component */}

            {/* --- Title --- */}
            <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold', mb: 2 }}>
                Create Order
            </Typography>

            {/* --- Customer Section --- */}
            <Button
                fullWidth
                variant="contained"
                startIcon={<AddCircleOutlineIcon />}
                onClick={handleAddFromContacts}
                sx={{
                    bgcolor: 'rgba(34, 34, 34, 1)', // Dark background from image
                    color: '#fff', // White text
                    textTransform: 'none',
                    borderRadius: '8px', // Rounded corners
                    py: 1.5, // Padding vertical
                    fontSize: '1rem',
                    '&:hover': {
                        bgcolor: 'grey.800'
                    }
                }}
            >
                Add Customer from Contacts
            </Button>

            <Typography variant="overline" sx={{ color: 'text.secondary', my: 1 }}>
                OR
            </Typography>

            <TextField
                fullWidth
                label="Name"
                variant="outlined"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                sx={{
                    '& .MuiOutlinedInput-root': {
                        borderRadius: '8px', // Rounded corners for input
                    }
                }}
            />
            <TextField
                fullWidth
                label="Phone Number"
                variant="outlined"
                type="tel" // Use tel type for phone numbers
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                 sx={{
                    '& .MuiOutlinedInput-root': {
                        borderRadius: '8px', // Rounded corners for input
                    }
                }}
            />

            <Divider sx={{ width: '100%', my: 2 }} />

            {/* --- Product Section --- */}
            <Button
                fullWidth
                variant="contained"
                startIcon={<AddCircleOutlineIcon />}
                onClick={handleAddProduct}
                sx={{
                    bgcolor: 'rgba(34, 34, 34, 1)', // Dark background
                    color: '#fff', // White text
                    textTransform: 'none',
                    borderRadius: '8px',
                    py: 1.5,
                    fontSize: '1rem',
                    '&:hover': {
                        bgcolor: 'grey.800'
                    },
                    mb: 2 // Margin below add products button
                }}
            >
                Add Products
            </Button>

            {/* --- Selected Products List --- */}
            {selectedProducts.length > 0 && (
                <List sx={{ width: '100%', bgcolor: 'transparent', p: 0 }}>
                    {selectedProducts.map((product, index) => (
                        <Paper
                            key={product.id}
                            elevation={1} // Subtle shadow
                            sx={{
                                width: '100%',
                                mb: index < selectedProducts.length - 1 ? 1.5 : 0, // Margin between items
                                borderRadius: '8px', // Rounded corners for product items
                                overflow: 'hidden' // Ensure content respects border radius
                            }}
                        >
                            <ListItem
                                alignItems="center" // Align items vertically centered
                                secondaryAction={ // Place button on the right
                                    <IconButton
                                        edge="end"
                                        aria-label="remove product"
                                        onClick={() => handleRemoveProduct(product.id)}
                                        title="Remove Product"
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                }
                                sx={{ py: 1.5, px: 2 }} // Padding inside list item
                            >
                                <ListItemAvatar sx={{ mr: 2 }}>
                                    <Avatar
                                        variant="rounded" // Match image style
                                        src={product.imageUrl}
                                        alt={product.name}
                                        sx={{ width: 56, height: 56, bgcolor: 'grey.200' }} // Slightly larger avatar
                                    />
                                </ListItemAvatar>
                                <ListItemText
                                    primary={
                                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                            {product.name}
                                        </Typography>
                                    }
                                    secondary={
                                        <>
                                            <Typography component="span" variant="body2" color="text.secondary">
                                                {product.dateAdded} {/* Displaying date as in image */}
                                            </Typography>
                                            <Typography component="span" variant="body2" sx={{ display: 'block', fontWeight: 'bold', color: 'text.primary', mt: 0.5 }}>
                                                {formatCurrency(product.price)}
                                            </Typography>
                                        </>
                                    }
                                />
                                {/* Removed the '>' icon, replaced by DeleteIcon in secondaryAction */}
                            </ListItem>
                        </Paper>
                    ))}
                </List>
            )}
            {selectedProducts.length === 0 && (
                 <Typography variant="body2" color="text.secondary" sx={{ my: 2 }}>
                    No products added yet.
                 </Typography>
            )}


            {/* --- Submit Button --- */}
            <Button
                fullWidth
                variant="contained"
                onClick={handleSubmitOrder}
                disabled={isSubmitting}
                size="large" // Make button prominent
                sx={{
                    mt: 3, // Margin top before submit button
                    bgcolor: 'rgba(216, 59, 59, 1)', // Red background from image
                    color: '#fff',
                    textTransform: 'none',
                    borderRadius: '8px',
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    '&:hover': {
                        bgcolor: 'rgba(187, 49, 49, 1)' // Darker red on hover
                    },
                    '&:disabled': { // Style for disabled state
                        bgcolor: 'grey.400',
                    }
                }}
            >
                {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Create Order'}
            </Button>

            {/* --- Submission Feedback --- */}
            {submitMessage && (
                <Typography
                    color={submitError ? 'error' : 'success.main'}
                    sx={{ mt: 2, textAlign: 'center' }}
                >
                    {submitMessage}
                </Typography>
            )}

        </Box>
    );
}

// Export the component for use in your app
// export default CreateOrderForm; // Uncomment if saving as a separate file

// Example of how to use it in another component (e.g., App.js or a page)
// function App() {
//   return (
//      <CreateOrderForm />
//   );
// }
// export default App;

// For immediate preview/use if rendered directly:
// (Remove this if exporting/importing)
// const App = CreateOrderForm;
// export default App; // Make sure one default export exists