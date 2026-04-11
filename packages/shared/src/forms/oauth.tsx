import type { ProviderType } from "@auth-guard/types";
import { RiAppleLine, RiGithubLine, RiGoogleLine } from "@remixicon/react";
import type { ComponentType, FC } from "react";
import { Button } from "ui/components/ui/button";
import { Field, FieldSeparator } from "ui/components/ui/field";

type OAuthProviderOptionType = {
	provider: ProviderType;
	label?: string;
	disabled?: boolean;
	onClick: () => void;
};

type OAuthButtonsPropsType = {
	providers?: OAuthProviderOptionType[];
};

const PROVIDER_CONFIG: Record<
	ProviderType | "apple",
	// ! TODO move to <ProviderType>,
	{
		icon: ComponentType;
		label: string;
	}
> = {
	apple: {
		icon: RiAppleLine,
		label: "Login with Apple",
	},
	google: {
		icon: RiGoogleLine,
		label: "Login with Google",
	},
	github: {
		icon: RiGithubLine,
		label: "Login with Github",
	},
};

const OAuthButtons: FC<OAuthButtonsPropsType> = ({ providers = [] }) => {
	if (!providers.length) {
		return null;
	}

	return (
		<>
			<FieldSeparator>Or continue with</FieldSeparator>

			{providers.map(({ provider, label, disabled, onClick }) => {
				const config = PROVIDER_CONFIG[provider];
				const Icon = config.icon;

				return (
					<Field key={provider}>
						<Button type="button" disabled={disabled} onClick={onClick}>
							<Icon />
							<span>{label ?? config.label}</span>
						</Button>
					</Field>
				);
			})}
		</>
	);
};

export type { OAuthButtonsPropsType, OAuthProviderOptionType };

export { OAuthButtons };
