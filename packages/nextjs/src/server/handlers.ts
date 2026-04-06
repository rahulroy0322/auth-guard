import type { IncomingMessage } from "node:http";
import { AuthServerError } from "@auth-guard/backend/error";
import type { AuthReturnType } from "@auth-guard/backend/types/main";
import { genReqId } from "@auth-guard/backend/utils/request-id";
import type { ProviderType } from "base";
import { cookies, headers } from "next/headers";
import { type NextRequest, NextResponse, userAgent } from "next/server";
import {
	loginSchema,
	registerSchema,
	resetPasswordSchema,
	verifySchema,
} from "schema";
import { provider, providerCallback } from "./regex";
import type { HandlerType, ResType } from "./types";

const options = {
	sameSite: "strict",
	secure: true,
	httpOnly: true,
	path: "/",
} as const;

const cookie = {
	refresh: "auth-token",
	authState: "auth-oauth-state",
	authVerifier: "auth-oauth-verifier",
};

const jwt = {
	refresh: 60 * 60 * 24 * 7,
};

const getDeviceId = async () => {
	const cookieStore = await cookies();

	let deviceId = cookieStore.get("deviceId")?.value;
	if (!deviceId) {
		deviceId = genReqId();
		cookieStore.set("deviceId", deviceId, {
			...options,
		});
	}
	return deviceId;
};
const getDeviceInfo = async () => {
	const ua = userAgent({
		headers: await headers(),
	});

	const deviceId = await getDeviceId();

	return {
		deviceId,
		deviceName: ua.os.name || "Unknown",
		deviceType: ua.browser.name || "Unknown",
	};
};

const setAuthCookie = async (refreshToken: string) => {
	const cookieStore = await cookies();

	cookieStore.set(cookie.refresh, refreshToken, {
		...options,
		expires: new Date(Date.now() + 1000 * jwt.refresh),
	});
};
const clearAuthCookie = async () => {
	const cookieStore = await cookies();
	cookieStore.delete(cookie.refresh);
};

const setOAuthStateCookie = async ({
	codeVerifier,
	state,
}: {
	codeVerifier: string;
	state: string;
}) => {
	const cookieStore = await cookies();
	const expires = new Date(Date.now() + 1000 * 60 * 5);
	cookieStore.set(cookie.authVerifier, codeVerifier, {
		...options,
		sameSite: "lax",
		expires,
	});
	cookieStore.set(cookie.authState, state, {
		...options,
		sameSite: "lax",
		expires,
	});
};
const clearOAuthStateCookie = async () => {
	const cookieStore = await cookies();
	cookieStore.delete(cookie.authVerifier);
	cookieStore.delete(cookie.authState);
};

const extractAccessToken = async () => {
	const _headers = await headers();
	return (
		_headers.get("authorization") ||
		_headers.get("Authorization") ||
		_headers.get("token") ||
		null
	);
};
const extractRefreshToken = async () => {
	const cookieStore = await cookies();

	const token: string | null = cookieStore.get(cookie.refresh)?.value || null;

	if (!token) {
		return null;
	}

	return `Bearer ${token}`;
};

const register: HandlerType = async (coreApi, req) => {
	const data = registerSchema.parse((await req.json()) || {});

	const { id } = await coreApi.register(data);

	return NextResponse.json(
		{
			success: true,
			data: {
				id,
				message: "Token is send",
			},
		} satisfies ResType,
		{
			status: 201,
		},
	);
};
const login: HandlerType = async (coreApi, req) => {
	const data = loginSchema.parse((await req.json()) || {});

	const {
		token: { access, refresh },
		user,
	} = await coreApi.login({
		...data,
		...(await getDeviceInfo()),
	});

	await setAuthCookie(refresh);

	return NextResponse.json(
		{
			success: true,
			data: {
				user,
				token: access,
			},
		} satisfies ResType,
		{
			status: 200,
		},
	);
};
const startVerification: HandlerType = async (coreApi, req) => {
	const data = loginSchema
		.pick({
			email: true,
		})
		.parse((await req.json()) || {});

	const { id } = await coreApi.startVerification(data);

	return NextResponse.json(
		{
			success: true,
			data: {
				id,
				message: "Token is send",
			},
		} satisfies ResType,
		{
			status: 200,
		},
	);
};
const verifieAccount: HandlerType = async (coreApi, req) => {
	const data = verifySchema.parse({
		...req.nextUrl.searchParams,
		...(await req.json()),
	});

	const {
		token: { access, refresh },
		user,
	} = await coreApi.verifieAccount({
		...data,
		...(await getDeviceInfo()),
	});

	await setAuthCookie(refresh);

	return NextResponse.json(
		{
			success: true,
			data: {
				user,
				token: access,
			},
		} satisfies ResType,
		{
			status: 200,
		},
	);
};

const tokenRefresh: HandlerType = async (coreApi, req) => {
	const {
		token: { access, refresh },
	} = await coreApi.tokenRefresh(req as unknown as IncomingMessage);

	if (refresh) {
		await setAuthCookie(refresh);
	}

	return NextResponse.json(
		{
			success: true,
			data: {
				token: access,
			},
		} satisfies ResType,
		{
			status: 200,
		},
	);
};

const loginRequired = async <T extends ProviderType>(
	coreApi: AuthReturnType<T>,
	req: NextRequest,
) => await coreApi.loginRequired(req as unknown as IncomingMessage);

const me: HandlerType = async (coreApi, req) => {
	const { user } = await loginRequired(coreApi, req);

	return NextResponse.json(
		{
			success: true,
			data: {
				user,
			},
		} satisfies ResType,
		{
			status: 200,
		},
	);
};
const logout: HandlerType = async (coreApi, req) => {
	if ((await extractAccessToken()) || (await extractRefreshToken())) {
		await coreApi.logout(req as unknown as IncomingMessage);
	}

	await clearAuthCookie();

	return NextResponse.json(
		{
			success: true,
			data: {
				message: "Logged Out Succesfully",
			},
		} satisfies ResType,
		{
			status: 200,
		},
	);
};

const forgotPassword: HandlerType = async (coreApi, req) => {
	const data = loginSchema
		.pick({
			email: true,
		})
		.parse((await req.json()) || {});

	const { id } = await coreApi.forgotPassword(data);

	return NextResponse.json(
		{
			success: true,
			data: {
				id,
				message: "Token is send",
			},
		} satisfies ResType,
		{
			status: 200,
		},
	);
};

const resetPassword: HandlerType = async (coreApi, req) => {
	const data = resetPasswordSchema.parse({
		...req.nextUrl.searchParams,
		...(await req.json()),
	});

	const {
		token: { access, refresh },
		user,
	} = await coreApi.resetPassword({
		...data,
		...(await getDeviceInfo()),
	});

	await setAuthCookie(refresh);

	return NextResponse.json(
		{
			success: true,
			data: {
				user,
				token: access,
			},
		} satisfies ResType,
		{
			status: 200,
		},
	);
};

const changePassword: HandlerType = async (coreApi, req) => {
	const data = loginSchema
		.pick({
			password: true,
		})
		.parse((await req.json()) || {});

	const {
		token: { access, refresh },
		user,
	} = await coreApi.changePassword(req as unknown as IncomingMessage, {
		password: data.password,
		...(await getDeviceInfo()),
	});

	await setAuthCookie(refresh);

	return NextResponse.json(
		{
			success: true,
			data: {
				user,
				token: access,
			},
		} satisfies ResType,
		{
			status: 200,
		},
	);
};

const updateProfile: HandlerType = () => {
	throw new AuthServerError("not implemented");
};

const authStatus: HandlerType = async (coreApi, req) => {
	const status = await coreApi.authStatus(req as unknown as IncomingMessage);

	let data: ResType = {
		success: true,
		data: {
			authenticated: false,
			user: null,
		},
	};

	if (status.user) {
		if (status.token.refresh) {
			await setAuthCookie(status.token.refresh);
		}

		data = {
			success: true,
			data: {
				authenticated: true,
				token: status.token.access,
				user: status.user,
			},
		};
	}

	return NextResponse.json(data, {
		status: 200,
	});
};

const removeAvatar: HandlerType = async (coreApi, req) => {
	const { user } = await coreApi.removeAvatar(
		req as unknown as IncomingMessage,
	);

	return NextResponse.json({
		success: true,
		data: {
			user,
		},
	} satisfies ResType);
};

const oAuthStart: HandlerType = async <T extends ProviderType>(
	coreApi: AuthReturnType<T>,
	req: NextRequest,
) => {
	const [, _provider] = provider.exec(req.url) || [];

	const { url, state, codeVerifier } = coreApi.oAuthStart(_provider as T);

	await setOAuthStateCookie({
		state,
		codeVerifier,
	});

	return NextResponse.json({
		success: true,
		data: {
			url,
		},
	} satisfies ResType);
};

const loginWithProvider: HandlerType = async <T extends ProviderType>(
	coreApi: AuthReturnType<T>,
	req: NextRequest,
) => {
	const cookieStore = await cookies();

	const codeVerifier = cookieStore.get(cookie.authVerifier)?.value;
	const state = cookieStore.get(cookie.authState)?.value;

	if (typeof state !== "string" || typeof codeVerifier !== "string") {
		throw new AuthServerError(
			"OAuth flow failed: missing state or verifier cookie.",
		);
	}

	const [, provider] = providerCallback.exec(req.nextUrl.toString()) || [];

	const code = req.nextUrl.searchParams.get("code") as string,
		queryState = req.nextUrl.searchParams.get("state") as string;

	const {
		token: { refresh },
	} = await coreApi.loginWithProvider(
		{
			code,
			state: queryState,
		},
		{
			provider: provider as T,
			state,
			codeVerifier,
			...(await getDeviceInfo()),
		},
	);

	await clearOAuthStateCookie();
	await setAuthCookie(refresh);

	return NextResponse.redirect(req.nextUrl.origin);
};

export {
	authStatus,
	changePassword,
	extractAccessToken,
	extractRefreshToken,
	forgotPassword,
	login,
	loginRequired,
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
};
