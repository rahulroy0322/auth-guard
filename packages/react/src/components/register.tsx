import type { FC } from "react";
import { useGuard } from "../provider";

// biome-ignore lint/complexity/noBannedTypes: temp
type RegisterPropsType = {};

const Register: FC<RegisterPropsType> = () => {
	const { register, loading } = useGuard();

	return (
		<div>
			<h2>Register page</h2>
			{/* biome-ignore lint/a11y/useButtonType: temp */}
			<button onClick={register} disabled={loading}>
				Go Dummy Login
			</button>
		</div>
	);
};

export { Register };
