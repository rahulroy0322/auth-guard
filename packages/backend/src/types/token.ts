import type { IncomingMessage } from "node:http";

type TokenConfigType = {
	access: (req: IncomingMessage) => Promise<string | null>;
	refresh: (req: IncomingMessage) => Promise<string | null>;
};

export type { TokenConfigType };
