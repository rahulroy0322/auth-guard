import { type SignOptions, sign, verify } from "jsonwebtoken";
import type { TokenType } from "../types";

const signToken = (data: TokenType, secret: string, options: SignOptions) =>
	sign(data, secret, options);

const verifyToken = <T extends TokenType>(data: string, secret: string) =>
	verify(data, secret) as T & {
		iat: number;
		exp: number;
	};

export type { TokenType };

export { signToken, verifyToken };
