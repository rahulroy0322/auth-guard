import type { FC } from "react";
import { useGuard } from "../provider";

type LoginPropsType = {
	// TODO!
};

const Login: FC<LoginPropsType> = () => {
	const { login, loading } = useGuard();

	return (
		<div>
			<h2>login page</h2>
			<button onClick={login} disabled={loading}>
				Go Dummy Login
			</button>
		</div>
	);
};

export { Login };
