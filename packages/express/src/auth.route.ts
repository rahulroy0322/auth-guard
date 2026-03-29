import { extname, join } from 'node:path'
import { Router } from "express";
import type { AuthExpressReturnType } from "./types";
import multer from 'multer';
import { cwd } from 'node:process';
import { ACCEPTED_IMAGE_TYPES, MAX_FILE_SIZE } from "schema"

type FileType = {
	originalname: string
	mimetype: string
}

type OptionsType = {
	fileName: (file: FileType) => string
	destination: string
}

const authRouter = (props: AuthExpressReturnType, options: Partial<OptionsType> = {}) => {
	if (!options.fileName || typeof options.fileName !== 'function') {
		options.fileName = (file) => `${file.originalname}-${Date.now()}${extname(file.originalname)}`
	}

	if (!options.destination) {
		options.destination = join(cwd(), "./uploads/avatar")
	}

	const storage = multer.diskStorage({
		filename: (_, file, cb) => cb(null, (options as OptionsType).fileName(file)),
		destination: options.destination,
	});

	const upload = multer({
		storage,
		limits: { fileSize: MAX_FILE_SIZE },
		fileFilter(_req, file, cb) {
			if ((ACCEPTED_IMAGE_TYPES as unknown as string[]).includes(file.mimetype)) {
				cb(null, true);
			} else {
				cb(new Error("Invalid file type. Only images are allowed."));
			}
		},
	});

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
	authRouter.patch("/profile", upload.single('profileImage'), props.updateProfile);
	authRouter.patch("/remove-avatar", props.removeAvatar);

	authRouter.get("/me", props.checkAuth, props.loginRequired, props.me);

	authRouter.post("/logout", props.logout);

	return authRouter;
};

export { authRouter };
