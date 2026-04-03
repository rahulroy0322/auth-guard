import type { FC } from "react";
import { AuthBaseButton, type AuthBaseButtonPropsType } from "./base.button";

type RegisterButtonPropsType = Omit<AuthBaseButtonPropsType, "defaultState">;

const RegisterButton: FC<RegisterButtonPropsType> = ({
	children = "Register",
	...props
}) => (
	<AuthBaseButton defaultState={"register"} {...props}>
		{children}
	</AuthBaseButton>
);

export type { RegisterButtonPropsType };

export { RegisterButton };
