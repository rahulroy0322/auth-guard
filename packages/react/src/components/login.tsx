import type { FC } from "react";
import { useGuard } from "../provider";

// biome-ignore lint/complexity/noBannedTypes: temp
type LoginPropsType = {};

const Login: FC<LoginPropsType> = () => {
	const { login, loading } = useGuard();

	return (
		<div>
			<h2>login page</h2>
			{/* biome-ignore lint/a11y/useButtonType: temp */}
			<button onClick={login} disabled={loading}>
				Go Dummy Login
			</button>
		</div>
	);
};

export { Login };
