import { type FC, type ReactNode, useState } from "react";
import { LoginForm, RegisterForm } from "shared";
import { Dialog, DialogContent } from "ui/components/ui/dialog";
import { Tabs, TabsContent } from "ui/components/ui/tabs";

type AuthBaseButtonPropsType = {
	children: ReactNode;
	defaultState: AuthStatesType;
};

type AuthStatesType = "register" | "login";

const AuthBaseButton: FC<AuthBaseButtonPropsType> = ({
	children,
	defaultState,
}) => {
	const [current, setCurrent] = useState<AuthStatesType>(defaultState);

	return (
		<Dialog>
			{children}
			<DialogContent
				className="max-w-sm md:max-w-4xl p-0"
				showCloseButton={false}
			>
				<Tabs value={current}>
					<TabsContent value="login">
						<LoginForm
							onClick={() => {
								setCurrent("register");
							}}
						/>
					</TabsContent>
					<TabsContent value="register">
						<RegisterForm
							onClick={() => {
								setCurrent("login");
							}}
						/>
					</TabsContent>
				</Tabs>
			</DialogContent>
		</Dialog>
	);
};

export { AuthBaseButton };
