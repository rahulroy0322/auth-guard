import type { FC } from "react";
import { DialogTrigger } from "ui/components/ui/dialog";
import { AuthBaseButton } from "./base.button";

// biome-ignore lint/complexity/noBannedTypes: temp
type LoginButtonPropsType = Parameters<typeof DialogTrigger>[0];

const LoginButton: FC<LoginButtonPropsType> = ({
	children = "Login",
	...props
}) => (
	<AuthBaseButton defaultState={"login"}>
		<DialogTrigger {...props}>{children}</DialogTrigger>
	</AuthBaseButton>
);

export { LoginButton };
