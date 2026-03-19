import type { FC } from "react";
import { useGuard } from "../provider";

type RegisterPropsType = {
	// TODO!
};

const Register: FC<RegisterPropsType> = () => {
	const { register, loading } = useGuard();

	return (
		<div>
			<h2>Register page</h2>
			<button onClick={register} disabled={loading}>
				Go Dummy Login
			</button>
		</div>
	);
};

export { Register };
