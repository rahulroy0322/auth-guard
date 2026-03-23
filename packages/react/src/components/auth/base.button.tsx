import type { FC, ReactNode } from "react";
// import { LoginForm, RegisterForm } from "shared";
import { Dialog, DialogContent } from "ui/components/ui/dialog";

type AuthBaseButtonPropsType = {
	children: ReactNode;
	defaultState: AuthStatesType;
};

// TODO!

type AuthStatesType = "register" | "login";

const AuthBaseButton: FC<AuthBaseButtonPropsType> = ({
	children,
	// defaultState,
}) => {
	// const [current, setCurrent] = useState<AuthStatesType>(defaultState);

	return (
		<Dialog>
			{children}
			<DialogContent
				className="max-w-sm md:max-w-4xl p-0"
				showCloseButton={false}
			>
				{/* {current === "login" ? (
					<LoginForm
						onClick={() => {
							setCurrent("register");
						}}
					/>
				) : (
					<RegisterForm
						onClick={() => {
							setCurrent("login");
						}}
					/>
				)} */}
			</DialogContent>
		</Dialog>
	);
};

export { AuthBaseButton };
