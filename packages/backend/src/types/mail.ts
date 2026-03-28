import type { CodeType } from "./code";

type MailConfigType = {
	sendMail: (code: CodeType) => Promise<void>;
};

export type { MailConfigType };
