import { useEffect, useState } from "react";
// import "../App.css";
import { Button } from "@/components/ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Link, redirect } from "react-router-dom";
import axios from "axios";

export function CreateAccount() {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [retypePassword, setRetypePassword] = useState("");
	const [errorText, setErrorText] = useState("");
	const [matching, setMatching] = useState(false);

	// password checking
	useEffect(() => {
		console.log(password, retypePassword);
		if (password !== retypePassword) {
			setErrorText("Passwords do not match!!");
			setMatching(false);
		} else {
			setErrorText("");
			setMatching(true);
		}
	}, [password, retypePassword]);

	async function handleSubmit(username: string, password: string) {
		const postBody = { username: username, password: password };
		console.log("postbody:", postBody);

		try {
			const postResult = await axios.post("/api/account/register", postBody);
			if (postResult) {
				console.log("we got it");
				setErrorText("");

				// return redirect("/dashBoard");
			} else {
				return redirect("/api/account/login");
			}
		} catch (e) {
			console.error(e);
			return;
		}
	}

	return (
		<div>
			<Link to="/">
				<Button>Home 🏠</Button>
			</Link>
			<h1>Create your Cabinet Account</h1>
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
						<div>
							<Label htmlFor="retypePassword">Retype Password</Label>
							<Input
								type="password"
								id="retypePassword"
								placeholder="Retype your password"
								onChange={(event) => {
									setRetypePassword(event.target.value);
								}}
							/>
						</div>
					</div>
				</div>
				<div className="errorDiv">{errorText ?? (errorText && true)}</div>
				<div className="submit">
					<Button
						onClick={async () => {
							console.log(matching);

							if (matching && username) {
								await handleSubmit(username, password);
							} else if (username.length < 1) {
								setErrorText("Cannot create an account with empty username");
							} else {
								setErrorText("Cannot create an account until passwords match");
								return;
							}
						}}
					>
						Submit
					</Button>
				</div>
			</div>

			<div className="registerSwitch">
				<br />
				<p>Already Have an account?</p>
				<Link to="/login">
					<Button>Log In with existing account</Button>
				</Link>
			</div>
		</div>
	);
}
