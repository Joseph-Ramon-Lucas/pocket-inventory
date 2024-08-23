import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, Link, RouterProvider } from "react-router-dom";
// import "../App.css";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "./ui/Mode-Toggle";

export function Home() {
	return (
		<>
			<div>
				<h1>Pocket 👖</h1>
				<h2>Personal Inventory App</h2>

				<div className="authButtons">
					<Link to="/login">
						<Button>Log In</Button>
					</Link>
					<Link to="/register">
						<Button>Create Account</Button>
					</Link>
				</div>

				<ModeToggle />
			</div>
		</>
	);
}
