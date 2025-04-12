"use client";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { IoMdAddCircleOutline } from "react-icons/io";
import { MdOutlineInventory2 } from "react-icons/md";
import { RiSettingsLine } from "react-icons/ri";
import Link from "next/link";

export default function Sidebar() {


  const sidebarContent = (
    <Box
      sx={{
        width: 200,
        backgroundColor: "#fff",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Box sx={{ marginBottom: "20px", marginTop: "20px" }}>
        <Image src="/logo.png" alt="logo" width={106} height={16} />
      </Box>
      <List
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          padding: "0px",
          width: "100%",
        }}
      >
        {/* Dashboard */}
        <ListItem
          component={Link}
          href={`/${uid}/dashboard`}
          sx={{
            height: "35px",
            padding: "0px 17px",
            gap: "15px",
            borderRadius: "5px",
            display: "flex",
            alignItems: "center",
            ...(isActive(`/${uid}/dashboard`) && {
              backgroundColor: "#E6F0F4",
              borderLeft: "3px solid rgba(99, 102, 110, 1)",
            }),
          }}
        >
          <IoMdAddCircleOutline
            sx={{
              fontSize: "16px",
              color: isActive(`/${uid}/dashboard`) ? "rgba(99, 102, 110, 1)" : "#828282",
            }}
          />
          <ListItemText
            primary="Add Product"
            sx={{
              "& .MuiListItemText-primary": {
                fontFamily: "Manrope",
                fontSize: "14px",
                fontWeight: "400",
                lineHeight: "100%",
                textAlign: "left",
                color: isActive(`/${uid}/dashboard`) ? "rgba(99, 102, 110, 1)" : "#828282",
              },
            }}
          />
        </ListItem>

        {/* Shops - Fixed Parent ListItem */}
        <ListItem
          component={Link}
          href={`/${uid}/inventory`}
          sx={{
            height: "35px",
            padding: "0px 17px",
            gap: "15px",
            borderRadius: "5px",
            display: "flex",
            alignItems: "center",
            ...(isActive(`/${uid}/inventory`) && {
              backgroundColor: "#E6F0F4",
              borderLeft: "3px solid rgba(99, 102, 110, 1)",
            }),
          }}
        >
          <MdOutlineInventory2
            sx={{
              fontSize: "16px",
              color: isActive(`/${uid}/inventory`) ? "rgba(99, 102, 110, 1)" : "#828282",
            }}
          />
          <ListItemText
            primary="Inventory"
            sx={{
              "& .MuiListItemText-primary": {
                fontFamily: "Manrope",
                fontSize: "14px",
                fontWeight: "400",
                lineHeight: "100%",
                textAlign: "left",
                color: isActive(`/${uid}/inventory`) ? "rgba(99, 102, 110, 1)" : "#828282",
              },
            }}
          />
        </ListItem>

        {/* Finance */}
        <ListItem
          component={Link}
          href={`/${uid}/settings`}
          sx={{
            height: "35px",
            padding: "0px 17px",
            gap: "15px",
            borderRadius: "5px",
            display: "flex",
            alignItems: "center",
            ...(isActive(`/${uid}/settings`) && {
              backgroundColor: "#E6F0F4",
              borderLeft: "3px solid rgba(99, 102, 110, 1)",
            }),
          }}
        >
          <RiSettingsLine
            sx={{
              fontSize: "16px",
              color: isActive(`/${uid}/settings`) ? "rgba(99, 102, 110, 1)" : "#828282",
            }}
          />
          <ListItemText
            primary="Settings"
            sx={{
              "& .MuiListItemText-primary": {
                fontFamily: "Manrope",
                fontSize: "14px",
                fontWeight: "400",
                lineHeight: "100%",
                textAlign: "left",
                color: isActive(`/${uid}/settings`) ? "rgba(99, 102, 110, 1)" : "#828282",
              },
            }}
          />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <>
      {/* Desktop permanent drawer */}
      <Drawer
        variant="permanent"
        sx={{
          width: 200,
          boxShadow: "none",
          display: { xs: "none", sm: "block" },
        }}
      >
        {sidebarContent}
      </Drawer>

      {/* Mobile temporary drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: "block", sm: "none" },
          "& .MuiDrawer-paper": { width: 200 },
        }}
      >
        {sidebarContent}
      </Drawer>
    </>
  );
}