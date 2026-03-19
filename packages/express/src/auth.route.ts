import { Router } from "express";
import type { AuthExpressReturnType } from "./types";

const authRouter = (props: AuthExpressReturnType) => {
	const authRouter: Router = Router();

	authRouter.post("/register", props.register);

	authRouter.post("/login", props.login);

	authRouter.post("/refresh", props.tokenRefresh);

	return authRouter;
};

export { authRouter };
