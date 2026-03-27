import type { IncomingMessage } from "node:http";

type TokenConfigType = {
	access: (req: IncomingMessage) => string | null;
	refresh: (req: IncomingMessage) => string | null;
};

export type { TokenConfigType };
