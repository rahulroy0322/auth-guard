# @auth-guard/mail

Mail utilities for Auth Guard built on top of `nodemailer` and `ejs`.

This package helps you create a mail sender for common auth flows:

- email verification
- forgot password
- registration welcome flow

## Installation

```bash
npm install @auth-guard/mail
```

## Quick Start

```ts
import { initMail } from "@auth-guard/mail";

const sendAuthMail = initMail({
	host: "smtp.example.com",
	port: 587,
	secure: false,
	auth: {
		user: "no-reply@example.com",
		pass: "your-password",
	},
	brandName: "Auth Guard",
	primaryColor: "#3f7ba8",
	from: "Auth Guard <no-reply@example.com>",
});

await sendAuthMail({
	type: "verification",
	email: "user@example.com",
	code: "482913",
});
```

## API

### `initMail(options)`

Creates and returns an async function that sends auth-related emails.

```ts
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
```

#### Options

- `host`: SMTP host
- `port`: SMTP port
- `secure`: Whether the transport uses TLS
- `auth.user`: SMTP username
- `auth.pass`: SMTP password
- `brandName`: Optional brand label shown in the email, defaults to `Auth Guard`
- `primaryColor`: Optional accent color for the template, defaults to `#3f7ba8`
- `from`: Optional sender address. If omitted, it falls back to `Support <auth.user>`

### Returned sender

`initMail` returns:

```ts
type SendMail = (props: {
	type: "verification" | "forgot" | "register";
	code: string;
	email: string;
}) => Promise<SentMessageInfo>;
```

#### Supported email types

- `verification`: Sends a verification code email
- `forgot`: Sends a password reset code email
- `register`: Sends a welcome email with verification code

## Notes

- The package re-exports `nodemailer`, so you can also import shared Nodemailer types from `@auth-guard/mail`.
- Templates are rendered with `ejs`.
- The generated email HTML is minified before sending.

## License

[MIT](https://github.com/rahulroy0322/auth-guard/tree/main?tab=MIT-1-ov-file)
