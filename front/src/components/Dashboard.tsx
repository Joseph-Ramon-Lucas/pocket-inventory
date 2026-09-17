/** biome-ignore-all lint/correctness/useExhaustiveDependencies: <removes functionality> */
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CardBox } from "./ui/CardBox";
import { Button } from "./ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import fetchAPI from "@/lib/fetchAPI";
import { useEffect } from "react";
import { StuffDto } from "@/lib/types/db-types";

const API_URL =
	import.meta.env.VITE_DEVELOPMENT_API_URL || "/api";

export default function Dashboard() {
	let inventoryList: StuffDto[] = new Array<StuffDto>();
	async function fetchStuff() {
		try {
			const username = "joe";
			const result = await fetchAPI(
				API_URL + `/stuff?username=${username}`,
				"GET",
			);
			if (!result.success) {
				console.error("Error fetching stuff:", result.errorMessage);
				return;
			}
			return result;
		} catch (error) {
			console.error("Error fetching stuff:", error);
		}
	}

	useEffect(() => {
		fetchStuff()
			.then((result) => {
				if (result?.success) {
					console.log("Fetched stuff:", result.body);
					inventoryList = result.body as StuffDto[];
				}
			})
			.catch((error) => {
				console.error("Error in fetchStuff:", error);
			});
	}, []);

	return (
		<div>
			<h1>Stuff Dashboard</h1>
			<div className="textfieldContainer">
				{/* dropdown to select category */}
				<DropdownMenu>
					<DropdownMenuTrigger>Stuff from</DropdownMenuTrigger>
					<DropdownMenuContent>
						<DropdownMenuLabel>My Account</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<DropdownMenuItem>Profile</DropdownMenuItem>
						<DropdownMenuItem>Billing</DropdownMenuItem>
						<DropdownMenuItem>Team</DropdownMenuItem>
						<DropdownMenuItem>Subscription</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
				<CardBox />
				{/* this button opens a dialog */}
				<Button className="addCardButton" onClick={() => {}}>
					+
				</Button>
			</div>
		</div>
	);
}
