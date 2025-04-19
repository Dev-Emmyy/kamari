"use client";

import React, { useState } from 'react';
import { Box, Typography, Paper, Avatar, IconButton, useTheme, Menu, MenuItem } from '@mui/material';
import { format } from 'date-fns';
import Collapse from '@mui/material/Collapse';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { FaChevronDown } from 'react-icons/fa';
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

// --- Style Constants (Aligned with InventoryItemCard for consistency) ---
const cardMaxWidth = 600;
const cardBorderRadius = '8px';
const cardPaddingTB = '12px';
const cardPaddingLR = '16px';
const cardBg = '#fff';
const cardGap = 2;
const orderTitleFontFamily = 'Manrope, sans-serif';
const orderTitleFontWeight = 600;
const orderTitleFontSize = '15px';
const orderTitleColor = 'rgba(99, 102, 110, 1)';
const orderDateFontFamily = 'Manrope, sans-serif';
const orderDateFontWeight = 600;
const orderDateFontSize = '12px';
const orderDateColor = 'rgba(139, 139, 139, 1)';
const orderStatusBoxHeight = '24px';
const orderStatusBoxRadius = '12px';
const orderStatusTextFontFamily = 'Manrope, sans-serif';
const orderStatusTextFontWeight = 800;
const orderStatusTextFontSize = '10px';
const orderAmountFontFamily = 'Manrope, sans-serif';
const orderAmountFontWeight = 800;
const orderAmountFontSize = '18px';
const orderAmountColor = 'rgba(111, 197, 175, 1)';
const orderImageBoxSize = '64px';
const orderImageBorderRadius = '4px';
const customerTextFontFamily = 'Manrope, sans-serif';
const customerTextFontWeight = 600;
const customerTextFontSize = '12px';
const customerTextColor = 'rgba(30, 30, 30, 1)';

const OrderCard = ({ order, onUpdatePaymentStatus, onUpdateShippingStatus }) => {
    const theme = useTheme();
    const [isExpanded, setIsExpanded] = useState(false);
    const [paymentMenuAnchor, setPaymentMenuAnchor] = useState(null);
    const [shippingMenuAnchor, setShippingMenuAnchor] = useState(null);

    // --- Determine Status Display ---
    const paymentStatus = order.paymentStatus || 'unpaid';
    const paymentStatusText = paymentStatus === 'paid' ? 'paid' : 'unpaid';
    const paymentStatusBgColor = 'rgba(234, 250, 235, 1)';
    const paymentStatusTextColor = 'rgba(83, 125, 88, 1)';

    const shippingStatus = order.shippingStatus || 'unshipped';
    const shippingStatusText = shippingStatus === 'shipped' ? 'shipped' : 'unshipped';
    const shippingStatusBgColor = 'rgba(234, 250, 235, 1)';
    const shippingStatusTextColor = 'rgba(83, 125, 88, 1)';

    // --- Handlers ---
    const handleExpandToggle = () => {
        setIsExpanded(!isExpanded);
    };

    const handlePaymentMenuOpen = (event) => {
        setPaymentMenuAnchor(event.currentTarget);
    };

    const handlePaymentMenuClose = () => {
        setPaymentMenuAnchor(null);
    };

    const handleShippingMenuOpen = (event) => {
        setShippingMenuAnchor(event.currentTarget);
    };

    const handleShippingMenuClose = () => {
        setShippingMenuAnchor(null);
    };

    const handlePaymentMenuSelect = (newStatus) => {
        onUpdatePaymentStatus(order.id, newStatus);
        handlePaymentMenuClose();
    };

    const handleShippingMenuSelect = (newStatus) => {
        onUpdateShippingStatus(order.id, newStatus);
        handleShippingMenuClose();
    };

    // Determine display title and image from the first product
    const orderDisplayTitle = order.products?.[0]?.name || 'Untitled Item';
    const firstProductImage = order.products?.[0]?.imageUrl || 'https://placehold.co/100x100/cccccc/333?text=?';

    return (
        <Paper
            elevation={1}
            sx={{
                width: '100%',
                maxWidth: `${cardMaxWidth}px`,
                borderRadius: cardBorderRadius,
                mb: 2,
                overflow: 'hidden',
                bgcolor: cardBg,
            }}
        >
            {/* --- Top Section (Visible Always) --- */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: cardGap, p: `${cardPaddingTB} ${cardPaddingLR}` }}>
                <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    {/* Order Info */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 0.5, mr: 1 }}>
                        <Typography sx={{ fontFamily: orderTitleFontFamily, fontWeight: orderTitleFontWeight, fontSize: orderTitleFontSize, color: orderTitleColor, lineHeight: '1.2', wordBreak: 'break-word' }}>
                            {orderDisplayTitle}
                        </Typography>
                        <Typography sx={{ fontFamily: orderDateFontFamily, fontWeight: orderDateFontWeight, fontSize: orderDateFontSize, color: orderDateColor, lineHeight: '1' }}>
                            {order.createdAt ? formatDate(order.createdAt) : 'No date'}
                        </Typography>

                        {/* Payment Status Badge with Dropdown */}
                        <Box sx={{ position: 'relative' }}>
                            <Box
                                onClick={handlePaymentMenuOpen}
                                title={`Click to toggle payment status`}
                                sx={{
                                    width: '104px',
                                    px: 1.5,
                                    pr: 3, // Extra padding to accommodate the icon
                                    height: orderStatusBoxHeight,
                                    borderRadius: orderStatusBoxRadius,
                                    bgcolor: paymentStatusBgColor,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    cursor: 'pointer',
                                    '&:hover': { opacity: 0.8 }
                                }}
                            >
                                <Typography sx={{ fontFamily: orderStatusTextFontFamily, fontWeight: orderStatusTextFontWeight, fontSize: orderStatusTextFontSize, color: paymentStatusTextColor, lineHeight: '1' }}>
                                    {paymentStatusText}
                                </Typography>
                                <FaChevronDown style={{ color: paymentStatusTextColor, fontSize: '12px', marginLeft: '4px' }} />
                            </Box>
                            <Menu
                                anchorEl={paymentMenuAnchor}
                                open={Boolean(paymentMenuAnchor)}
                                onClose={handlePaymentMenuClose}
                                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                                transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                                PaperProps={{
                                    sx: {
                                        backgroundColor: 'transparent',
                                        boxShadow: 'none',
                                        mt: 0.5,
                                    }
                                }}
                            >
                                <MenuItem
                                    onClick={() => handlePaymentMenuSelect(paymentStatus === 'paid' ? 'unpaid' : 'paid')}
                                    sx={{
                                        backgroundColor: paymentStatusBgColor,
                                        color: paymentStatusTextColor,
                                        fontFamily: orderStatusTextFontFamily,
                                        fontWeight: orderStatusTextFontWeight,
                                        fontSize: orderStatusTextFontSize,
                                        px: 1.5,
                                        py: 0.75,
                                        borderRadius: orderStatusBoxRadius,
                                        minHeight: orderStatusBoxHeight,
                                        '&:hover': { opacity: 0.8 }
                                    }}
                                >
                                    {paymentStatus === 'paid' ? 'unpaid' : 'paid'}
                                </MenuItem>
                            </Menu>
                        </Box>
                    </Box>

                    {/* Amount & Expand Icon */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between', height: '100%', minHeight: `calc(${orderStatusBoxHeight} + 1.5em)` }}>
                        <IconButton
                            onClick={handleExpandToggle}
                            size="small"
                            sx={{ color: orderTitleColor, width: '24px', height: '24px', p: 0, mb: 1 }}
                            aria-expanded={isExpanded}
                            aria-label={isExpanded ? "Collapse Details" : "Expand Details"}
                            title={isExpanded ? "Hide details" : "Show details"}
                        >
                            <ChevronRightIcon sx={{ transform: isExpanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
                        </IconButton>
                        <Typography sx={{ fontFamily: orderAmountFontFamily, fontWeight: orderAmountFontWeight, fontSize: orderAmountFontSize, color: orderAmountColor, lineHeight: '1', textAlign: 'right', mt: 'auto' }}>
                            {formatCurrency(order.totalAmount)}
                        </Typography>
                    </Box>
                </Box>

                {/* Image */}
                <Box sx={{ width: orderImageBoxSize, height: orderImageBoxSize, borderRadius: orderImageBorderRadius, overflow: 'hidden', position: 'relative', flexShrink: 0, bgcolor: theme.palette.grey[100] }}>
                    <Avatar
                        variant="rounded"
                        src={firstProductImage}
                        alt={orderDisplayTitle}
                        sx={{ width: '100%', height: '100%', borderRadius: orderImageBorderRadius, bgcolor: 'grey.200' }}
                    />
                </Box>
            </Box>

            {/* --- Collapsible Section --- */}
            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                <Box sx={{ p: `${cardPaddingTB} ${cardPaddingLR}`, pt: 1, pb: 1, borderTop: `1px solid ${theme.palette.divider}` }}>
                    {/* Customer Info */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                        <Avatar
                            sx={{ width: 24, height: 24, bgcolor: 'grey.200' }}
                            alt={order.customerName || 'Customer'}
                            src={order.customerImage || 'https://placehold.co/24x24/cccccc/333?text=C'}
                        />
                        <Typography sx={{ fontFamily: customerTextFontFamily, fontWeight: customerTextFontWeight, fontSize: customerTextFontSize, color: customerTextColor }}>
                            {order.customerName || 'Unknown Customer'}
                        </Typography>
                    </Box>

                    {/* Payment Status Badges */}
                    <Box sx={{ display: 'flex', flexDirection: "column", gap: 1, alignItems: "flex-start", mb: 1.5 }}>
                        <Box sx={{ position: 'relative' }}>
                            <Box
                                onClick={handlePaymentMenuOpen}
                                title={`Click to toggle payment status`}
                                sx={{
                                    width: '104px',
                                    px: 1.5,
                                    pr: 3, // Extra padding to accommodate the icon
                                    height: orderStatusBoxHeight,
                                    borderRadius: orderStatusBoxRadius,
                                    bgcolor: paymentStatusBgColor,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    cursor: 'pointer',
                                    '&:hover': { opacity: 0.8 }
                                }}
                            >
                                <Typography sx={{ fontFamily: orderStatusTextFontFamily, fontWeight: orderStatusTextFontWeight, fontSize: orderStatusTextFontSize, color: paymentStatusTextColor, lineHeight: '1' }}>
                                    {paymentStatusText}
                                </Typography>
                                <FaChevronDown style={{ color: paymentStatusTextColor, fontSize: '12px', marginLeft: '4px' }} />
                            </Box>
                            <Menu
                                anchorEl={paymentMenuAnchor}
                                open={Boolean(paymentMenuAnchor)}
                                onClose={handlePaymentMenuClose}
                                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                                transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                                PaperProps={{
                                    sx: {
                                        backgroundColor: 'transparent',
                                        boxShadow: 'none',
                                        mt: 0.5,
                                    }
                                }}
                            >
                                <MenuItem
                                    onClick={() => handlePaymentMenuSelect(paymentStatus === 'paid' ? 'unpaid' : 'paid')}
                                    sx={{
                                        backgroundColor: paymentStatusBgColor,
                                        color: paymentStatusTextColor,
                                        fontFamily: orderStatusTextFontFamily,
                                        fontWeight: orderStatusTextFontWeight,
                                        fontSize: orderStatusTextFontSize,
                                        px: 1.5,
                                        py: 0.75,
                                        borderRadius: orderStatusBoxRadius,
                                        minHeight: orderStatusBoxHeight,
                                        '&:hover': { opacity: 0.8 }
                                    }}
                                >
                                    {paymentStatus === 'paid' ? 'unpaid' : 'paid'}
                                </MenuItem>
                            </Menu>
                        </Box>
                    </Box>

                    {/* Shipping Status Badges */}
                    <Box sx={{ display: 'flex', flexDirection: "column", gap: 1, alignItems: "flex-start" }}>
                        <Box sx={{ position: 'relative' }}>
                            <Box
                                onClick={handleShippingMenuOpen}
                                title={`Click to toggle shipping status`}
                                sx={{
                                    width: '104px',
                                    px: 1.5,
                                    pr: 3, // Extra padding to accommodate the icon
                                    height: orderStatusBoxHeight,
                                    borderRadius: orderStatusBoxRadius,
                                    bgcolor: shippingStatusBgColor,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    cursor: 'pointer',
                                    '&:hover': { opacity: 0.8 }
                                }}
                            >
                                <Typography sx={{ fontFamily: orderStatusTextFontFamily, fontWeight: orderStatusTextFontWeight, fontSize: orderStatusTextFontSize, color: shippingStatusTextColor, lineHeight: '1' }}>
                                    {shippingStatusText}
                                </Typography>
                                <FaChevronDown style={{ color: shippingStatusTextColor, fontSize: '12px', marginLeft: '4px' }} />
                            </Box>
                            <Menu
                                anchorEl={shippingMenuAnchor}
                                open={Boolean(shippingMenuAnchor)}
                                onClose={handleShippingMenuClose}
                                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                                transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                                PaperProps={{
                                    sx: {
                                        backgroundColor: 'transparent',
                                        boxShadow: 'none',
                                        mt: 0.5,
                                    }
                                }}
                            >
                                <MenuItem
                                    onClick={() => handleShippingMenuSelect(shippingStatus === 'shipped' ? 'unshipped' : 'shipped')}
                                    sx={{
                                        backgroundColor: shippingStatusBgColor,
                                        color: shippingStatusTextColor,
                                        fontFamily: orderStatusTextFontFamily,
                                        fontWeight: orderStatusTextFontWeight,
                                        fontSize: orderStatusTextFontSize,
                                        px: 1.5,
                                        py: 0.75,
                                        borderRadius: orderStatusBoxRadius,
                                        minHeight: orderStatusBoxHeight,
                                        '&:hover': { opacity: 0.8 }
                                    }}
                                >
                                    {shippingStatus === 'shipped' ? 'unshipped' : 'shipped'}
                                </MenuItem>
                            </Menu>
                        </Box>
                    </Box>
                </Box>
            </Collapse>
        </Paper>
    );
};

export default OrderCard;