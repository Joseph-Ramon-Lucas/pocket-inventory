import { Link, redirect } from "react-router-dom";
import "../App.css";
import { Button } from "@/components/ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { useState } from "react";
import axios from "axios";

export function Login() {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [errorText, setErrorText] = useState("");

	function handleSubmit(username: string, password: string) {
		// basic input checking
		if (username.length === 0 || password.length === 0) {
			setErrorText("Cannot leave blank fields!");
		} else if (
			username.length < 3 ||
			(username.length > 25 && password.length < 8) ||
			password.length > 30
		) {
			setErrorText(
				"Usernames must be between 3-25 char, and passwords 8-30 char",
			);
			return;
		} else {
			const reqBody = { username, password };

			try {
				axios
					.post("/api/account/login", reqBody, {
						withCredentials: true,
					})
					.then((response) => {
						setErrorText("");
						console.log("THIS IS THE RESPONSE", response);
					})
					.catch((err) => {
						console.error("ERRO HAPPENED,", err.response.data.errorMessage);
						setErrorText(err.response.data.errorMessage);
					});

				console.log("POSTED");
			} catch (e) {
				console.error(e);
				return;
			}
		}
	}
	return (
		<div>
			<Link to="/">
				<Button>Home 🏠</Button>
			</Link>

			<h1>Log into your Pocket Account</h1>

			<div className="textfieldContainer">
				<div className="textFields">
					<div className="inputs">
						<div>
							<Label htmlFor="username">Username</Label>
							<Input
								type="username"
								id="username"
								placeholder="username"
								onChange={(event) => {
									setUsername(event.target.value);
								}}
							/>
						</div>

						<br />
						<div>
							<Label htmlFor="password">Password</Label>
							<Input
								type="password"
								id="password"
								placeholder="password"
								onChange={(event) => {
									setPassword(event.target.value);
								}}
							/>
						</div>

						<br />
					</div>
				</div>

				<div className="errorDiv">{errorText ?? (errorText && true)}</div>
				<div className="submit">
					<Button onClick={async () => await handleSubmit(username, password)}>
						Submit
					</Button>
				</div>
			</div>

			<div className="registerSwitch">
				<br />
				<p>Don't have an account?</p>
				<Link to="/register">
					<Button>Create a Cabinet account</Button>
				</Link>
			</div>
		</div>
	);
}
