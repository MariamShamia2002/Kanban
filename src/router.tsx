import { createBrowserRouter, Navigate } from "react-router";
import AppLayout from "@/layout/AppLayout";
import ProtectedRoute from "@/components/shared/ProtectedRoute";
// import ApplicationsPage from "@/pages/ApplicationsPage";
// import EditApplicationPage from "@/pages/EditApplicationPage";
import LoginPage from "@/features/auth/pages/LoginPage";
import BoardsListPage from "@/features/board/pages/BoardsListPage";
import BoardPage from "@/features/board/pages/BoardPage";

export const router = createBrowserRouter([
  // Public 
  {
    path: "/login",
    element: <LoginPage />,
  },

  // Protected 
  // ProtectedRoute renders <Outlet /> when authenticated, or redirects to /login.
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          {
            path: "/boards",
            element: <BoardsListPage />,
          },
          {
            path: "/boards/:boardId",
            element: <BoardPage />,
          },
        ],
      },
    ],
  },

  //Root & catch-all redirects 
  
  { path: "/",
    element: <Navigate to="/boards" replace />,
  },
  {
    path: "*",
    element: <Navigate to="/boards" replace />,
  },
]);