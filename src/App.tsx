import { AuthProvider } from "./features/auth/context/AuthProvider"
// import LoginPage from "./features/auth/pages/LoginPage";
import { router } from "./router"
import { RouterProvider } from "react-router"

function App() {


  return (
		
		<AuthProvider>
      <RouterProvider router={router} />
		</AuthProvider>
		
	);
}

export default App
