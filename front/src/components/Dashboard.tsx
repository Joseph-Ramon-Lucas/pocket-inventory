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

export default function Dashboard() {
	return (
		<div>
			<h1>Stuff</h1>
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
