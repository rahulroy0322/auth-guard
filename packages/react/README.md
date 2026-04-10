# @auth-guard/react

React client library for Auth Guard.

It ships:

- `GuardProvider` and `useGuard` for auth state, actions, and OAuth options
- auth triggers like `LoginButton` and `RegisterButton`
- authenticated UI helpers like `Show` and `ProfileButton`
- packaged styles at `@auth-guard/react/styles.css`
- DIY auth form exports from `@auth-guard/react/diy`

## Installation

```bash
npm install @auth-guard/react
```

## App setup

Wrap your app with `GuardProvider` and load the package styles once.

```tsx
import { GuardProvider, type OAuthProviderType } from "@auth-guard/react";
import "@auth-guard/react/styles.css";

const oauthProviders = [
	{ provider: "apple", disabled: true },
	{ provider: "google" },
	{ provider: "github" },
] as OAuthProviderType[];

export function App() {
	return (
		<GuardProvider
			config={{
				baseUrl: "http://localhost:8000",
				images: {
					login: "https://cdn.example.com/login.svg",
					register: "https://cdn.example.com/register.svg",
					forgot: "https://cdn.example.com/forgot.svg",
					reset: "https://cdn.example.com/reset.svg",
					verify: "https://cdn.example.com/verify.svg",
				},
			}}
			oauth={oauthProviders}
		>
			<YourRoutes />
		</GuardProvider>
	);
}
```

## UI components

### `Show`

`Show` renders children based on auth state from `useGuard()`.

```tsx
import { Show } from "@auth-guard/react";

function HeaderActions() {
	return (
		<>
			<Show when="logged-out">
				<p>Please sign in to continue.</p>
			</Show>

			<Show when="logged-in" fallback={<p>Checking session...</p>}>
				<p>You are signed in.</p>
			</Show>
		</>
	);
}
```

### `LoginButton` and `RegisterButton`

These buttons open the built-in auth flow in a modal by default. They also accept your button props like `variant`, `size`, and `className`.

```tsx
import { LoginButton, RegisterButton } from "@auth-guard/react";

function HeaderAuth() {
	return (
		<div className="flex gap-4">
			<LoginButton mode="modal" variant="link">
				Login
			</LoginButton>

			<RegisterButton mode="modal" variant="link">
				Register
			</RegisterButton>
		</div>
	);
}
```

Use `mode="page"` when you want the button styling but handle navigation yourself.

```tsx
import { Link } from "<router>";
import { LoginButton, RegisterButton } from "@auth-guard/react";

function HeaderAuth() {
	return (
		<div className="flex gap-4">
			<Show when="logged-out">
                <LoginButton mode="page" render={<Link to="/login" />}>
                    Login
                </LoginButton>
                <RegisterButton mode="page" render={<Link to="/register" />}>
                    Register
                </RegisterButton>
            </Show>
		</div>
	);
}
```

### `ProfileButton`

`ProfileButton` only renders for authenticated users. It shows the current user avatar, a dropdown menu, and the built-in account dialog with profile and security panels.

```tsx
import { ProfileButton, Show } from "@auth-guard/react";

function Header() {
	return (
		<Show when="logged-in">
			<ProfileButton />
		</Show>
	);
}
```

### Full header example

This mirrors the usage in `apps/app`.

```tsx
import {
	LoginButton,
	ProfileButton,
	RegisterButton,
	Show,
} from "@auth-guard/react";

function Header() {
	return (
		<header className="flex items-center justify-between p-2">
			<Show when="logged-out">
				<div className="flex gap-4">
					<LoginButton mode="modal" variant="link">
						Login
					</LoginButton>
					<RegisterButton mode="modal" variant="link">
						Register
					</RegisterButton>
				</div>
			</Show>

			<Show when="logged-in">
				<ProfileButton />
			</Show>
		</header>
	);
}
```

## `useGuard`

`useGuard()` gives you access to auth state and actions from the provider.

```tsx
import { useGuard } from "@auth-guard/react";

function AccountSummary() {
	const { user, loading, logout, error } = useGuard();

	if (loading) return <p>Loading...</p>;
	if (!user) return <p>Not signed in.</p>;

	return (
		<div>
			<p>{user.email}</p>
			{error ? <p>{error.message}</p> : null}
			<button onClick={logout}>Logout</button>
		</div>
	);
}
```

## DIY forms

Use the DIY exports when you want your own routes but still want the library’s auth forms.

### `LoginForm`

```tsx
import { Link } from "<router>";
import { useGuard } from "@auth-guard/react";
import { LoginForm } from "@auth-guard/react/diy";

function LoginRoute() {
	const { login, fetching, oauthProviders, config } = useGuard();

	return (
		<LoginForm
			appName={config.appName}
			src={config.images.login}
			nativeButton={false}
			render={<Link to="/register" />}
			forgotPasswordProps={{
				nativeButton: false,
				render: <Link to="/forgot-password" />,
			}}
			handleSubmit={login}
			pending={fetching}
			oauthProviders={oauthProviders}
		/>
	);
}
```

### `RegisterForm`

```tsx
import { Link } from "<router>";
import { useGuard } from "@auth-guard/react";
import { RegisterForm } from "@auth-guard/react/diy";

function RegisterRoute() {
	const { register, fetching, oauthProviders, config } =
		useGuard();

	return (
		<RegisterForm
			appName={config.appName}
			src={config.images.register}
			nativeButton={false}
			render={<Link to="/login" />}
			handleSubmit={register}
			pending={fetching}
			oauthProviders={oauthProviders}
		/>
	);
}
```

### `VerifyForm`

```tsx
import { Link, Navigate, navigate } from "<router>";
import { useGuard } from "@auth-guard/react";
import { VerifyForm } from "@auth-guard/react/diy";

function VerifyRoute() {
    const { verification, verifyAccount, startVerification, clearVerification, fetching, config } = useGuard();

    if (!verification) {
        return <Navigate to="/login" />;
    }

    return (
        <VerifyForm
            src={config.images.verify}
            email={verification.email}
            handleSubmit={verifyAccount}
            handleResend={async () => {
                await startVerification(verification.email);
            }}
            handleBack={() => {
                clearVerification();
                navigate({
                    to: "/login",
                });
            }}
            pending={fetching}
        />
    );
}
```

### `ResetPasswordForm`

```tsx
import { Link, Navigate, navigate } from "<router>";
import { useGuard } from "@auth-guard/react";
import { ResetPasswordForm } from "@auth-guard/react/diy";

function ResetPasswordRoute() {
    const { fetching, config, resetPassword } = useGuard();

    const search = new URLSearchParams(window.location.search);
    const id = search.get("id");
    const email = search.get("email") ?? undefined;

    if (!id) {
        return <Navigate to="/forgot-password" />;
    }

    return (
        <ResetPasswordForm
            src={config.images.reset}
            nativeButton={false}
            render={<Link to="/login" />}
            email={email}
            handleSubmit={async ({ code, password }) => {
                await resetPassword({
                    id,
                    code,
                    password,
                });
                navigate({
                    to: "/",
                });
            }}
            pending={fetching}
        />
    );
}
```

### `ForgotPasswordForm`

```tsx
import { Link, navigate } from "<router>";
import { useGuard } from "@auth-guard/react";
import { ForgotPasswordForm } from "@auth-guard/react/diy";

function ForgotPasswordRoute() {
    const { forgotPassword, fetching, config } = useGuard();

    return (
        <ForgotPasswordForm
            src={config.images.forgot}
            nativeButton={false}
            render={<Link to="/login" />}
            handleSubmit={async ({ email }) => {
                const { id } = await forgotPassword(email);
                navigate({
                    to: "/reset-password",
                    search: {
                        email,
                        id,
                    },
                });
            }}
            pending={fetching}
        />
    );
}
```

### `OAuth`

```tsx
import { navigate, useParams } from "<router>";
import { useGuard, type ProviderType } from "@auth-guard/react";
import { useEffect } from "react";

function OAuthCallbackRoute() {
    const { finishOAuth } = useGuard();
    const { provider } = useParams();

    useEffect(() => {
        const controller = new AbortController();
        const search = new URLSearchParams(window.location.search);
        const code = search.get("code");
        const state = search.get("state");

        if (!code || !state) {
            navigate({
                to: "/login",
            });
            return () => {
                controller.abort();
            };
        }
        const login = async () => {
            try {
                await finishOAuth(
                    provider as ProviderType,
                    {
                        code,
                        state,
                    },
                    controller.signal,
                );
                navigate({
                    to: "/",
                });
            } catch (e) {
                console.error(e);

                navigate({
                    to: "/login",
                });
            }
        };

        login();

        return () => {
            controller.abort();
        };
    }, [finishOAuth, provider]);

    return (
        <div className="min-h-80 flex items-center justify-center p-6 text-center">
            <p className="text-sm text-muted-foreground">Finishing sign in...</p>
        </div>
    );
}
```

## Exports

- `@auth-guard/react`
- `@auth-guard/react/diy`
- `@auth-guard/react/styles.css`

## License

[MIT](https://github.com/rahulroy0322/auth-guard/tree/main?tab=MIT-1-ov-file)
