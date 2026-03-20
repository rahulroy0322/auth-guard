import { LoginButton, RegisterButton, useGuard } from "@auth-guard/react";
import type { FC } from "react";
import { Button } from "ui/components/ui/button";

// TODO! plx remove "a11y": "off" as it is temp

const Auth: FC = () => {
	return (
		<div>
			<div className="flex gap-4">
				<LoginButton render={<Button variant="link">Login</Button>} />
				<RegisterButton render={<Button variant="link">Register</Button>} />
			</div>
		</div>
	);
};

const App: FC = () => {
	const { user, logout, loading } = useGuard();

	return (
		<div>
			{user ? (
				<div>
					<p>logged in as {user.name}</p>
					<button disabled={loading} onClick={logout}>
						Logout
					</button>
				</div>
			) : (
				<Auth />
			)}
		</div>
	);
};

export default App;
