import cookieParser from "cookie-parser";
import cors from "cors";
import express, { type Express, json, urlencoded } from "express";
import ENV from "./config/env.config";
import { errorMiddleware } from "./middlewares/error.middleware";
import { notFoundMiddleware } from "./middlewares/not-found.middleware";
import apiRouter from "./routes";

const app: Express = express();

app.use(
	cors({
		origin: ENV.FRONTEND_URLS,
		credentials: true,
	}),
);
app.use(cookieParser());
app.use(
	express.static('uploads')
)

app.use(json());
app.use(
	urlencoded({
		extended: true,
	}),
);

// // req-> info
// app.use(requestInfoMiddleware);

// api routes
app.use("/api/v1", apiRouter);

// middlewares
app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
