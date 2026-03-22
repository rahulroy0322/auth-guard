import { Router } from "express";
import type { AuthExpressReturnType } from "./types";

const authRouter = (props: AuthExpressReturnType) => {
	const authRouter: Router = Router();

	authRouter.post("/register", props.register);

	authRouter.post("/login", props.login);

	authRouter.post("/refresh", props.tokenRefresh);

	authRouter.get("/me", props.checkAuth, props.loginRequired, props.me);

	return authRouter;
};

export { authRouter };
