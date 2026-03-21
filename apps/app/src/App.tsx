import { LoginButton, RegisterButton } from "@auth-guard/react";
import type { FC } from "react";
import { Button } from "ui/components/ui/button";
import { ProfileButton } from "./profile";

// TODO! plx remove "a11y": "off" as it is temp

const Header: FC = () => {
	return (
		<header className="flex items-center justify-between p-4">
			<div className="flex gap-4">
				<LoginButton render={<Button variant="link">Login</Button>} />
				<RegisterButton render={<Button variant="link">Register</Button>} />
			</div>

			<ProfileButton />
		</header>
	);
};

const App: FC = () => {
	return (
		<div>
			<Header />
		</div>
	);
};

export default App;
