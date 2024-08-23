import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import { Home } from "./components/Home.tsx";
import { ErrorPage } from "./components/ErrorPage.tsx";
import { Login } from "./components/Login.tsx";
import { CreateAccount } from "./components/CreateAccount.tsx";
import { ThemeProvider } from "./components/ui/theme-provider.tsx";
import Dashboard from "./components/Dashboard.tsx";

const router = createBrowserRouter([
	{
		path: "/",
		element: <Home />,
	},
	{
		path: "*",
		element: <ErrorPage />,
	},
	{
		path: "/login",
		element: <Login />,
	},
	{
		path: "/register",
		element: <CreateAccount />,
	},
	{
		path: "/dashboard",
		element: <Dashboard />,
	},
]);

// biome-ignore lint/style/noNonNullAssertion: <explanation>
ReactDOM.createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
			<RouterProvider router={router} />
		</ThemeProvider>
	</React.StrictMode>,
);
