import { createContext, type ReactNode, useContext, useState } from "react";

// creating sub types
type AuthState = "pending" | "authed" | "none";

type User = {
	id: number;
	username: string;
} | null;

// constructing the global type
export type GlobalAuthContextType = {
	authState: AuthState;
	user: User;
	refreshAuth: () => Promise<User>;
};

// initializing the context
const GlobalContext = createContext<GlobalAuthContextType>({
	authState: "pending",
	user: null,
	refreshAuth: async () => null,
});

// creating a way to access this context
export const useGlobalAuth = () => useContext(GlobalContext);

export function GlobalAuthProvider({ children }: { children: ReactNode }) {
	const [authState, setAuthState] = useState<AuthState>("pending");
	const [user, setuser] = useState(null);

	function refreshUser() {}
}
