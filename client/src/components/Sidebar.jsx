import { lazy, useState } from "react";
import {
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    IconButton,
    Toolbar,
    Divider,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AddIcon from "@mui/icons-material/Add";
import AssessmentIcon from "@mui/icons-material/Assessment";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ListIcon from '@mui/icons-material/List';
import { useNavigate } from "react-router-dom";
import AddTransaction from "../components/AddTransaction";

const drawerWidth = 200;
const headerHeight = 64;

const Sidebar = () => {
    const [open, setOpen] = useState(false);
    const [showDialog, setShowDialog] = useState(false);
    const navigate = useNavigate();
    const toggleDrawer = () => setOpen(!open);

    const menuItems = [
        { label: "Dashboard", icon: <DashboardIcon />, navigateTo: "dashboard" },
        { label: "Transactions", icon: <ListIcon />, navigateTo: "transactions" },
        { label: "Add Transaction", icon: <AddIcon />, navigateTo: "" },
        { label: "Reports", icon: <AssessmentIcon />, navigateTo: "reports" },
    ];

    return (
        <div className="flex">
            <Drawer
                variant="permanent"
                open={open}
                sx={{
                    width: open ? drawerWidth : 60,
                    flexShrink: 0,
                    "& .MuiDrawer-paper": {
                        width: open ? drawerWidth : 60,
                        transition: "width 0.5s",
                        overflowX: "hidden",
                        marginTop: `${headerHeight}px`,
                        height: `calc(100% - ${headerHeight}px)`,
                    },
                }}
            >
                {/* Toggle button inside Drawer */}
                <Toolbar sx={{ justifyContent: open ? "flex-end" : "center" }}>
                    <IconButton onClick={toggleDrawer}>
                        {open ? <ChevronLeftIcon /> : <MenuIcon />}
                    </IconButton>
                </Toolbar>

                <Divider />

                {/* Menu List */}
                <List>
                    {menuItems.map((item, index) => (
                        <ListItem key={index} disablePadding sx={{ display: "block" }}>
                            <ListItemButton
                                sx={{
                                    minHeight: 48,
                                    justifyContent: open ? "initial" : "center",
                                    px: 2.5,
                                }}
                                onClick={() => {
                                    if (item.navigateTo) {
                                        navigate(item.navigateTo);
                                    } else if (item.label === "Add Transaction") {
                                        setShowDialog(true);
                                    }
                                }}

                            >
                                <ListItemIcon
                                    sx={{
                                        minWidth: 0,
                                        mr: open ? 2 : "auto",
                                        justifyContent: "center",
                                    }}
                                >
                                    {item.icon}
                                </ListItemIcon>
                                {/* Labels only when open */}
                                {open && <ListItemText primary={item.label} />}
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            </Drawer>
            {showDialog &&
                <AddTransaction open={showDialog} onClose={() => setShowDialog(false)} />
            }
        </div>
    );
};

export default Sidebar;
