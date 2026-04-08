import type { FC } from "react";
import { AuthBaseButton, type AuthBaseButtonPropsType } from "./base.button";

type LoginButtonPropsType = Omit<AuthBaseButtonPropsType, "defaultState">;

const LoginButton: FC<LoginButtonPropsType> = ({
	children = "Login",
	...props
}) => (
	<AuthBaseButton defaultState={"login"} {...props}>
		{children}
	</AuthBaseButton>
);

export type { LoginButtonPropsType };

export { LoginButton };
