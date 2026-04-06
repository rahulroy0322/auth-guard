import { init } from "@auth-guard/backend";
import { AuthError } from "@auth-guard/backend/error";
import type { ProviderType } from "base";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
	authStatus,
	changePassword,
	extractAccessToken,
	extractRefreshToken,
	forgotPassword,
	login,
	loginWithProvider,
	logout,
	me,
	oAuthStart,
	register,
	removeAvatar,
	resetPassword,
	startVerification,
	tokenRefresh,
	updateProfile,
	verifieAccount,
} from "./handlers";
import { provider, providerCallback } from "./regex";
import type { HandleAuthPropsType, HandlerType } from "./types";

type RouteType = {
	methods: readonly string[];
	pattern: RegExp;
	handler: HandlerType;
};

const routes = [
	{
		methods: ["GET"],
		pattern: providerCallback,
		handler: loginWithProvider,
	},
	{
		methods: ["GET"],
		pattern: provider,
		handler: oAuthStart,
	},
	{
		methods: ["GET"],
		pattern: /\/status\/?$/,
		handler: authStatus,
	},
	{
		methods: ["POST"],
		pattern: /\/register\/?$/,
		handler: register,
	},
	{
		methods: ["POST"],
		pattern: /\/login\/?$/,
		handler: login,
	},
	{
		methods: ["GET"],
		pattern: /\/refresh\/?$/,
		handler: tokenRefresh,
	},
	{
		methods: ["POST"],
		pattern: /\/start-verification\/?$/,
		handler: startVerification,
	},
	{
		methods: ["GET", "PATCH"],
		pattern: /\/verify\/?$/,
		handler: verifieAccount,
	},
	{
		methods: ["POST"],
		pattern: /\/forgot-password\/?$/,
		handler: forgotPassword,
	},
	{
		methods: ["PATCH"],
		pattern: /\/reset-password\/?$/,
		handler: resetPassword,
	},
	{
		methods: ["PATCH"],
		pattern: /\/change-password\/?$/,
		handler: changePassword,
	},
	{
		methods: ["PATCH"],
		pattern: /\/profile\/?$/,
		handler: updateProfile,
	},
	{
		methods: ["PATCH"],
		pattern: /\/remove-avatar\/?$/,
		handler: removeAvatar,
	},
	{
		methods: ["GET"],
		pattern: /\/me\/?$/,
		handler: me,
	},
	{
		methods: ["POST"],
		pattern: /\/logout\/?$/,
		handler: logout,
	},
] as const satisfies RouteType[];

const findAuthRoute = (pathname: string, method: string) =>
	routes.find(
		(route) =>
			route.pattern.test(pathname) &&
			(route.methods as unknown as string[]).includes(method),
	);

const methodNotAllowed = () =>
	NextResponse.json(
		{
			success: false,
			message: "Method Not Allowed",
		},
		{
			status: 405,
		},
	);

const getError = (e: unknown): AuthError => {
	if (e instanceof AuthError) {
		return {
			name: e.name,
			message: e.message,
			status: e.status,
		};
	}

	if (e instanceof Error) {
		return {
			name: e.name,
			message: e.message,
			status: 500,
		};
	}

	console.error("Unknown Error: ", e);

	return {
		name: "Unknown Error",
		message: "Internal Server Error",
		status: 500,
	};
};

const handleAuth = <T extends ProviderType>(props: HandleAuthPropsType<T>) => {
	const coreApi = init({
		...props,
		jwt: {
			expires: {
				access: 60 * 15,
				refresh: 60 * 60 * 24 * 7,
			},
			secret: props.jwtSecret,
		},
		extractToken: {
			access: extractAccessToken,
			refresh: extractRefreshToken,
		},
	});

	return async (req: NextRequest) => {
		const route = findAuthRoute(req.nextUrl.pathname, req.method);

		if (!route) {
			return methodNotAllowed();
		}

		try {
			return await route.handler(coreApi, req);
		} catch (e) {
			const { status, ...error } = getError(e);

			return NextResponse.json(
				{
					success: false,
					error,
				},
				{
					status,
				},
			);
		}
	};
};

const auth = handleAuth;

export * from "./types";
export { auth, handleAuth };
