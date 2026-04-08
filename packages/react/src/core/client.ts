import type { Dispatch, SetStateAction } from "react";
import { get } from "../api/main";
import type { GuardContextType } from "../provider.types";
import { isError } from "../provider.utils";
import { type AuthStateSettersType, syncAuthResult } from "./state";

type WithFetchingStateType = <T>(
	operation: () => Promise<T>,
	onError?: (error: Error) => Promise<void> | void,
) => Promise<T>;

type CreateAuthClientParamsType = Pick<
	AuthStateSettersType,
	"setError" | "setToken" | "setUser"
> & {
	baseUrl: string;
	setFetching: Dispatch<SetStateAction<boolean>>;
	token: GuardContextType["token"];
	withFetchingState: WithFetchingStateType;
};

const createAuthClient = ({
	baseUrl,
	setError,
	setFetching,
	setToken,
	setUser,
	token,
	withFetchingState,
}: CreateAuthClientParamsType) => {
	const refreshToken: GuardContextType["refreshToken"] = async () => {
		return withFetchingState(async () => {
			const { token: nextToken } = await get<{
				token: string;
			}>({
				base: baseUrl,
				url: "refresh",
			});

			setToken(nextToken);

			return {
				token: nextToken,
			};
		});
	};

	const reqWithToken: GuardContextType["reqWithToken"] = async (callback) => {
		setFetching(true);
		setError(null);

		try {
			let currentToken = token;

			if (!currentToken) {
				currentToken = (await refreshToken()).token;
			}

			const data = await callback(currentToken);
			return syncAuthResult(data, {
				setToken,
				setUser,
			});
		} catch (caughtError) {
			if (!isError(caughtError) || caughtError.name !== "AuthExpiredError") {
				throw caughtError;
			}

			const { token: nextToken } = await refreshToken();
			const data = await callback(nextToken);

			return syncAuthResult(data, {
				setToken,
				setUser,
			});
		} finally {
			setFetching(false);
		}
	};

	return {
		refreshToken,
		reqWithToken,
	};
};

export { createAuthClient };
