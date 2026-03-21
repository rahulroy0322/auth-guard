import type { FC } from "react";
import { DialogTrigger } from "ui/components/ui/dialog";
import { AuthBaseButton } from "./base.button";

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
