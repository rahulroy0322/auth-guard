import type { UserType } from "base";

type SuccessType<T> = {
	success: true;
	data: T;
};

type ErrorType<E = Error> = {
	success: false;
	error: E;
};

type ResType<T> = SuccessType<T> | ErrorType<Error>;

type ReqDefType = {
	base: string;
	url: string;
	headers?: Record<string, string>;
};

type ReqGetType = ReqDefType & {
	method: "GET";
};

type ReqPostType = ReqDefType & {
	method: "POST";
	body: Record<string, unknown>;
};

type ReqParamsType = ReqGetType | ReqPostType;

const req = async <T>({
	base,
	url,
	method,
	headers,
	...props
}: ReqParamsType) => {
	const res = await fetch(`${base}/api/v1/auth/${url}`, {
		headers: {
			"content-type": "application/json",
			...(headers || {}),
		},
		credentials: "include",
		method,
		body: (props as ReqPostType).body
			? JSON.stringify((props as ReqPostType).body)
			: undefined,
	});
	const data = (await res.json()) as ResType<T>;

	if (!data.success) {
		throw data.error;
	}

	return data.data;
};

type SafeUserType = Omit<UserType, "password">;

type AuthStatusReturnType =
	| {
			authenticated: true;
			token: string;
			user: SafeUserType;
	  }
	| {
			authenticated: false;
			user: null;
	  };

const get = <T>(params: Omit<ReqGetType, "method">) =>
	req<T>({
		method: "GET",
		...params,
	});

const post = <T>(params: Omit<ReqPostType, "method">) =>
	req<T>({
		method: "POST",
		...params,
	});

type AuthResType = {
	user: SafeUserType;
};

export type { AuthResType, AuthStatusReturnType };

export { get, post };
