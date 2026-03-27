import { Router } from "express";
import type { AuthExpressReturnType } from "./types";

const authRouter = (props: AuthExpressReturnType) => {
	const authRouter: Router = Router();

	authRouter.get("/status", props.authStatus);

	authRouter.post("/register", props.register);
	authRouter.post("/login", props.login);

	authRouter.get("/refresh", props.tokenRefresh);

	authRouter.post("/start-verification", props.startVerification);
	authRouter
		.route("/verify")
		.patch(props.verifieAccount)
		.get(props.verifieAccount);

	authRouter.post("/forgot-password", props.forgotPassword);
	authRouter.patch("/reset-password", props.resetPassword);
	authRouter.patch("/change-password", props.changePassword);
	authRouter.patch("/change-name", props.changeName);

	authRouter.get("/me", props.checkAuth, props.loginRequired, props.me);

	authRouter.post("/logout", props.logout);

	return authRouter;
};

export { authRouter };
