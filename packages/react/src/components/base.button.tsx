import { type FC, type ReactNode, useEffect } from "react";
import { Button } from "ui/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "ui/components/ui/dialog";
import { useGuard } from "../provider";
import { AuthFlowContent } from "./flow/content";
import { type AuthPathType, usePath } from "./provider";
import { showAuthError } from "./shared/error";

type AuthBaseButtonPropsType = {
	children: ReactNode;
	defaultState: AuthPathType;
	mode?: "modal" | "page";
} & Parameters<typeof Button>[0];

const AuthModalBaseButton: FC<Omit<AuthBaseButtonPropsType, "mode">> = ({
	defaultState,
	children,
	...props
}) => {
	const { error } = useGuard();
	const { setPath } = usePath();

	useEffect(() => {
		if (!error) {
			return;
		}

		showAuthError(error);
	}, [error]);

	return (
		<Dialog>
			<DialogTrigger
				render={<Button {...props} />}
				onClick={(event) => {
					props.onClick?.(event);
					setPath(defaultState);
				}}
			>
				{children}
			</DialogTrigger>
			<DialogContent
				className="max-w-sm p-0 md:max-w-4xl"
				showCloseButton={false}
			>
				<AuthFlowContent />
			</DialogContent>
		</Dialog>
	);
};

const AuthBaseButton: FC<AuthBaseButtonPropsType> = ({
	mode = "modal",
	defaultState,
	...props
}) => {
	if (mode === "page") {
		return <Button {...props} />;
	}

	return <AuthModalBaseButton defaultState={defaultState} {...props} />;
};

export type { AuthBaseButtonPropsType };

export { AuthBaseButton };
