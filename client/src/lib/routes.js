import { lazy } from "react";

const Dashboard = lazy(() => import("../pages/Dashboard"));
const Transactions = lazy(() => import("../pages/Transactions"));
const Reports = lazy(() => import("../pages/Reports"));

const routes = [
    {
        path: "/dashboard",
        isProtected: true,
        component: Dashboard,
    },
    {
        path: "/transactions",
        isProtected: true,
        component: Transactions,
    },
    {
        path: "/reports",
        isProtected: true,
        component: Reports,
    },
]

export default routes;