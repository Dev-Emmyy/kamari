// Suggested new file: /app/components/OrderCard.jsx
"use client";

import React from 'react';
import { Box, Typography, Paper, Avatar, IconButton, useTheme } from '@mui/material';
import { format } from 'date-fns'; // For date formatting
import Image from 'next/image'; // Use Next.js Image for optimization

// --- Helper: Currency Formatting ---
function formatCurrency(amount) {
    if (typeof amount !== 'number' || isNaN(amount)) { return "₦0"; }
    const formatter = new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0, maximumFractionDigits: 0 });
    return formatter.format(amount);
}

// --- Helper: Date Formatting ---
function formatDate(timestamp) {
    try {
        // Assuming timestamp is a Firebase Timestamp object
        return format(timestamp.toDate(), 'dd/MM/yyyy');
    } catch (e) {
        // Fallback for invalid date/timestamp
        return "Invalid Date";
    }
}

// --- Style Constants (Copied from InventoryItemCard for consistency, adjust as needed) ---
const cardBorderRadius = '8.32px';
const cardPaddingTB = '9.38px';
const cardPaddingLR = '10.32px';
const cardBg = 'rgba(255, 255, 255, 1)';
const cardGap = '9.38px';
const orderTitleFontFamily = 'Manrope, sans-serif';
const orderTitleFontWeight = 600;
const orderTitleFontSize = '14.27px';
const orderTitleColor = 'rgba(99, 102, 110, 1)'; // Adjust color if needed
const orderDateFontFamily = 'Manrope, sans-serif';
const orderDateFontWeight = 600;
const orderDateFontSize = '12px';
const orderDateColor = 'rgba(139, 139, 139, 1)';
const orderStatusBoxHeight = '20.21px'; // Re-use status box styles
const orderStatusBoxRadius = '11.89px';
const orderStatusTextFontFamily = 'Manrope, sans-serif';
const orderStatusTextFontWeight = 800;
const orderStatusTextFontSize = '6.55px';
const orderAmountFontFamily = 'Manrope, sans-serif';
const orderAmountFontWeight = 600;
const orderAmountFontSize = '12px';
const orderAmountColor = 'rgba(30, 30, 30, 1)';
const orderImageBoxSize = '56px'; // Slightly smaller image based on Figma
const orderImageBorderRadius = '8px';


const OrderCard = ({ order, onUpdatePaymentStatus, onUpdateShippingStatus }) => {
    const theme = useTheme();

    // --- Determine Status Display ---
    const paymentStatus = order.paymentStatus || 'unpaid'; // Default
    const shippingStatus = order.shippingStatus || 'unshipped'; // Default

    const paymentStatusText = paymentStatus === 'paid' ? 'Paid' : 'Unpaid';
    const paymentStatusBgColor = paymentStatus === 'paid' ? 'rgba(234, 250, 235, 1)' : 'rgba(255, 235, 235, 1)'; // Green / Red
    const paymentStatusTextColor = paymentStatus === 'paid' ? 'rgba(83, 125, 88, 1)' : 'rgba(194, 76, 76, 1)'; // Dark Green / Dark Red

    const shippingStatusText = shippingStatus === 'shipped' ? 'Shipped' : 'Unshipped';
    const shippingStatusBgColor = shippingStatus === 'shipped' ? 'rgba(234, 250, 235, 1)' : 'rgba(255, 245, 230, 1)'; // Green / Orangeish
    const shippingStatusTextColor = shippingStatus === 'shipped' ? 'rgba(83, 125, 88, 1)' : 'rgba(180, 120, 20, 1)'; // Dark Green / Dark Orangeish

    // --- Handlers for Clicking Badges ---
    const handlePaymentBadgeClick = () => {
        const newStatus = paymentStatus === 'paid' ? 'unpaid' : 'paid';
        onUpdatePaymentStatus(order.id, newStatus);
    };

    const handleShippingBadgeClick = () => {
        const newStatus = shippingStatus === 'shipped' ? 'unshipped' : 'shipped';
        onUpdateShippingStatus(order.id, newStatus);
    };

    // Determine what to display as the primary identifier
    // Using first product name as placeholder, or customer name if available
    const orderDisplayTitle = order.customerName || order.products?.[0]?.name || `Order #${order.id.substring(0, 5)}`;
    const firstProductImage = order.products?.[0]?.imageUrl || 'https://placehold.co/100x100/cccccc/333?text=?';
    const productCount = order.products?.length || 0;

    return (
        <Paper
            elevation={1}
            sx={{
                width: '100%',
                maxWidth: '372.29px', // Match inventory card width
                borderRadius: cardBorderRadius,
                mb: 2,
                overflow: 'hidden',
                bgcolor: cardBg,
            }}
        >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: cardGap, p: `${cardPaddingTB} ${cardPaddingLR}` }}>
                {/* Left Side: Details & Status Badges */}
                <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 0.8, mr: 1 }}>
                    <Typography sx={{ fontFamily: orderTitleFontFamily, fontWeight: orderTitleFontWeight, fontSize: orderTitleFontSize, color: orderTitleColor, lineHeight: '1.2', wordBreak: 'break-word' }}>
                        {orderDisplayTitle}
                    </Typography>
                    <Typography sx={{ fontFamily: orderDateFontFamily, fontWeight: orderDateFontWeight, fontSize: orderDateFontSize, color: orderDateColor, lineHeight: '1' }}>
                        {order.createdAt ? formatDate(order.createdAt) : 'No date'}
                    </Typography>
                    <Typography sx={{ fontFamily: orderAmountFontFamily, fontWeight: orderAmountFontWeight, fontSize: orderAmountFontSize, color: orderAmountColor, lineHeight: '1', mt: 0.5 }}>
                        {formatCurrency(order.totalAmount)}
                    </Typography>

                    {/* Status Badges Row */}
                    <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                        {/* Payment Status Badge */}
                        <Box
                            onClick={handlePaymentBadgeClick}
                            title={`Click to mark as ${paymentStatus === 'paid' ? 'Unpaid' : 'Paid'}`}
                            sx={{
                                width: 'auto', px: 1.5, height: orderStatusBoxHeight, borderRadius: orderStatusBoxRadius, bgcolor: paymentStatusBgColor, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', '&:hover': { opacity: 0.8 }
                            }}>
                            <Typography sx={{ fontFamily: orderStatusTextFontFamily, fontWeight: orderStatusTextFontWeight, fontSize: orderStatusTextFontSize, color: paymentStatusTextColor, lineHeight: '1' }}>
                                {paymentStatusText}
                            </Typography>
                        </Box>
                         {/* Shipping Status Badge */}
                         <Box
                            onClick={handleShippingBadgeClick}
                            title={`Click to mark as ${shippingStatus === 'shipped' ? 'Unshipped' : 'Shipped'}`}
                            sx={{
                                width: 'auto', px: 1.5, height: orderStatusBoxHeight, borderRadius: orderStatusBoxRadius, bgcolor: shippingStatusBgColor, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', '&:hover': { opacity: 0.8 }
                            }}>
                            <Typography sx={{ fontFamily: orderStatusTextFontFamily, fontWeight: orderStatusTextFontWeight, fontSize: orderStatusTextFontSize, color: shippingStatusTextColor, lineHeight: '1' }}>
                                {shippingStatusText}
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                {/* Right Side: Image with Count Badge */}
                <Box sx={{ position: 'relative', width: orderImageBoxSize, height: orderImageBoxSize, flexShrink: 0 }}>
                     <Avatar
                        variant="rounded"
                        src={firstProductImage}
                        alt={orderDisplayTitle}
                        sx={{ width: '100%', height: '100%', borderRadius: orderImageBorderRadius, bgcolor: 'grey.200' }}
                    />
                     {/* Show count badge if more than 1 product */}
                    {productCount > 1 && (
                        <Box sx={{
                            position: 'absolute',
                            top: -5,
                            right: -5,
                            bgcolor: 'error.main', // Or your theme's notification color
                            color: 'white',
                            borderRadius: '50%',
                            width: 20,
                            height: 20,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '10px',
                            fontWeight: 'bold',
                            boxShadow: 1,
                        }}>
                            +{productCount}
                        </Box>
                    )}
                </Box>
            </Box>
            {/* No Collapsible section needed based on Figma for the order card itself */}
        </Paper>
    );
};

export default OrderCard;