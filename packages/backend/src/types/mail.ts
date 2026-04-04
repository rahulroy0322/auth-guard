import type { CodeType } from "./code";

type SendMailPropsType = {
	email: string;
} & {
	type: "verification" | "forgot" | "register";
	code: CodeType;
};

type MailConfigType = {
	sendMail: (props: SendMailPropsType) => Promise<void>;
};

export type { MailConfigType, SendMailPropsType };
