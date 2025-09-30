import { IconButton, Menu, MenuItem, Tooltip } from "@mui/material";
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import { useState } from "react";
import { handleErrorResponse } from "../utils/handleResponse";
import { useAuth } from "../context/AuthContext";

export function Header() {
    const { logout, user } = useAuth();
    const [anchorEl, setAnchorEl] = useState(null);

    const handleOpenMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleCloseMenu = () => {
        setAnchorEl(null);
    }

    const handleLogout = async () => {
        try {
            const result = await logout();
            if (result.success) {
                handleCloseMenu();
            } else {
                return handleErrorResponse(result.message)
            }
            return window.location.href = "/tracker";
        } catch (error) {
            return handleErrorResponse(error?.response?.data?.message || error?.message || "Failed to Logout")
        }
    }
    return (
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center space-x-3">
                        <span className="text-2xl">💰</span>
                        <h1 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent">
                            Finance Tracker
                        </h1>
                    </div>

                    <div className="flex items-center space-x-2">
                        <span className="text-xl font-semibold">Welcome <span className="text-purple-400">{user?.name} !</span></span>
                        <Tooltip title="Profile">
                            <IconButton onClick={handleOpenMenu} className="!bg-black text-white">
                                <PersonIcon color="white" sx={{ fontSize: 20, color: "white" }} />
                            </IconButton>
                        </Tooltip>
                    </div>
                </div>

            </div>
            <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleCloseMenu}
            >
                <MenuItem onClick={handleLogout}>
                    <LogoutIcon fontSize="small" /> <span className="ml-1"> Logout</span>
                </MenuItem>
            </Menu>
        </header>
    );
}