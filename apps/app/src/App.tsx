import { Login, Register, useGuard } from "@auth-guard/react";
import { type FC, useState } from "react";

// TODO! plx remove "a11y": "off" as it is temp

const Auth: FC = () => {
	const [page, setPage] = useState<"login" | "register">("login");

	return (
		<div>
			{page === "login" ? <Login /> : <Register />}

			<button
				onClick={() => {
					setPage(page === "login" ? "register" : "login");
				}}
			>
				Go To {page === "login" ? "Register" : "Login"}
			</button>
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
