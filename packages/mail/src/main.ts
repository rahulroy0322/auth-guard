import { render } from "ejs";
import { createTransport, type SentMessageInfo } from "nodemailer";
import { authEmailTemplate } from "./ejs/main";

type SendMailPropsType = {
	type: "verification" | "forgot" | "register";
	code: string;
	email: string;
};

type EmailTemplateProps = {
	code: string;
	heading: string;
	preheader: string;
	eyebrow: string;
	helperText: string;
	brandName: string;
	primaryColor: string;
};

type InitMailOptions = {
	brandName?: string;
	primaryColor?: string;
	from?: string;
	host: string;
	port: number;
	secure: boolean;
	auth: {
		user: string;
		pass: string;
	};
};

const emailTemplate = authEmailTemplate;
const minifyHtml = (html: string) =>
	html
		.replace(/>\s+</g, "><")
		.replace(/\s{2,}/g, " ")
		.trim();

const getEmailContent = (
	{ code, type }: SendMailPropsType,
	brandName: string,
	primaryColor: string,
) => {
	const contentByType: Record<SendMailPropsType["type"], EmailTemplateProps> = {
		verification: {
			brandName,
			code,
			primaryColor,
			heading: "Verify your email address",
			preheader: "Use your verification code to finish securing your account.",
			eyebrow: "Account Security",
			helperText:
				"Enter this code in the app to verify your email address and activate your account.",
		},
		forgot: {
			brandName,
			code,
			primaryColor,
			heading: "Reset your password",
			preheader: "Use this verification code to reset your password safely.",
			eyebrow: "Password Reset",
			helperText:
				"Enter this code in the app to confirm the password reset request and choose a new password.",
		},
		register: {
			brandName,
			code,
			primaryColor,
			heading: `Welcome to ${brandName}`,
			preheader:
				"Your welcome code is ready. Verify your account to get started.",
			eyebrow: "Welcome",
			helperText:
				"Enter this code in the app to complete your signup and unlock your new account.",
		},
	};

	const subjectByType: Record<SendMailPropsType["type"], string> = {
		verification: "Verify your email",
		forgot: "Reset your password",
		register: `Welcome to ${brandName} - Verify your email`,
	};

	const templateProps = contentByType[type];

	return {
		subject: subjectByType[type],
		html: minifyHtml(
			render(emailTemplate, templateProps, { rmWhitespace: true }),
		),
	};
};

const initMail = ({
	brandName = "Auth Guard",
	primaryColor = "#3f7ba8",
	from,
	...props
}: InitMailOptions) => {
	if (!from) {
		from = `Support <${props.auth.user}>`;
	}
	const transporter = createTransport(props);

	const sendMail = (props: {
		to: string | string[];
		cc?: string | string[];
		subject: string;
		html: string;
	}) =>
		transporter.sendMail({
			from,
			...props,
		});

	return async (props: SendMailPropsType): Promise<SentMessageInfo> => {
		const { html, subject } = getEmailContent(props, brandName, primaryColor);

		return await sendMail({
			to: props.email,
			subject,
			html,
		});
	};
};

export * from "nodemailer";
export { initMail };
