import { extname, join } from "node:path";
import { cwd } from "node:process";
import { genReqId } from "@auth-guard/backend/utils/request-id";
import { Router } from "express";
import multer from "multer";
import { ACCEPTED_IMAGE_TYPES, MAX_FILE_SIZE } from "schema";
import type { AuthExpressReturnType, ProviderType } from "./types";

type FileType = {
	originalname: string;
	mimetype: string;
};

type OptionsType = {
	fileName: (file: FileType) => string;
	destination: string;
};

const authRouter = <T extends ProviderType>(
	props: AuthExpressReturnType<T>,
	options: Partial<OptionsType> = {},
) => {
	if (!options.fileName || typeof options.fileName !== "function") {
		options.fileName = (file) =>
			`${genReqId()}-${Date.now()}${extname(file.originalname)}`;
	}

	if (!options.destination) {
		options.destination = join(cwd(), "./uploads/avatar");
	}

	const storage = multer.diskStorage({
		filename: (_, file, cb) =>
			cb(null, (options as OptionsType).fileName(file)),
		destination: options.destination,
	});

	const upload = multer({
		storage,
		limits: { fileSize: MAX_FILE_SIZE },
		fileFilter(_req, file, cb) {
			if (
				(ACCEPTED_IMAGE_TYPES as unknown as string[]).includes(file.mimetype)
			) {
				cb(null, true);
			} else {
				cb(new Error("Invalid file type. Only images are allowed."));
			}
		},
	});

	const authRouter: Router = Router();

	authRouter.get("/oauth/:provider", props.oAuthStart);
	authRouter.get("/oauth/callback/:provider", props.loginWithProvider);

	authRouter.get("/status", props.authStatus);

	authRouter.post("/register", props.register);
	authRouter.post("/login", props.login);

	authRouter.get("/refresh", props.tokenRefresh);

	authRouter.post("/start-verification", props.startVerification);
	authRouter
		.route("/verify")
		.patch(props.verifyAccount)
		.get(props.verifyAccount);

	authRouter.post("/forgot-password", props.forgotPassword);
	authRouter.patch("/reset-password", props.resetPassword);
	authRouter.patch("/change-password", props.changePassword);
	authRouter.patch(
		"/profile",
		upload.single("profileImage"),
		props.updateProfile,
	);
	authRouter.patch("/remove-avatar", props.removeAvatar);

	authRouter.get("/me", props.checkAuth, props.loginRequired, props.me);

	authRouter.post("/logout", props.logout);

	authRouter.get("/sessions", props.getSessions);

	return authRouter;
};

export { authRouter };
