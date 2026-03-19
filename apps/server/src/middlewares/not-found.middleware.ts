import type { RequestHandler } from "express";
import { NotFoundError } from "../error/app.error";

const notFoundMiddleware: RequestHandler = (req) => {
	throw new NotFoundError(`route not found : "${req.url}"!`);
};

export { notFoundMiddleware };
