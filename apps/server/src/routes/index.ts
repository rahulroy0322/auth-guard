import { authRouter } from "@auth-guard/express/auth.route";
import { Router } from "express";
import { guard } from "../auth/main";

const apiRouter: Router = Router();

apiRouter.use("/auth", authRouter(guard));

export default apiRouter;
