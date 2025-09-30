import { Outlet } from "react-router-dom";
import { Header } from "../components/Header";
import Sidebar from "../components/Sidebar";

const MainLayout = () => {
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <div className="flex flex-1">
                <Sidebar />
                <main className="flex flex-1 p-4 bg-gray-50">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
