import { Router } from "express";
import type { AuthExpressReturnType } from "./types";

const authRouter = (props: AuthExpressReturnType) => {
	const authRouter: Router = Router();

	authRouter.post("/register", props.register);

	authRouter.post("/login", props.login);

	authRouter.post("/refresh", props.tokenRefresh);

	authRouter.post("/start-verification", props.startVerification);
	authRouter.post("/verify", props.verifieAccount);

	authRouter.get("/me", props.checkAuth, props.loginRequired, props.me);

	authRouter.post("/logout", props.logout);

	return authRouter;
};

export { authRouter };
