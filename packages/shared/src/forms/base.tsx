import type { FC, ReactNode } from "react";
import { Card, CardContent } from "ui/components/ui/card";
import { Field, FieldGroup } from "ui/components/ui/field";
import { OAuthButtons, type OAuthProviderOptionType } from "./oauth";

type BasePropsType = {
	children: ReactNode;
	title: string;
	description: string;
	src: string;
	alt: string;
	oauthProviders?: OAuthProviderOptionType[];
};

const Base: FC<BasePropsType> = ({
	children,
	title,
	description,
	src,
	alt,
	oauthProviders,
}) => (
	<Card className="overflow-hidden p-0 ring-0">
		<CardContent className="grid p-0 md:grid-cols-2 overflow-hidden items-center">
			<FieldGroup className="p-6 md:p-8">
				<Field className="text-center">
					<h1 className="text-2xl font-bold">{title}</h1>
					<p className="text-balance text-muted-foreground">{description}</p>
				</Field>

				{children}

				<OAuthButtons providers={oauthProviders} />
			</FieldGroup>

			<figure className="hidden bg-muted md:block">
				<img src={src} alt={alt} />
			</figure>
		</CardContent>
	</Card>
);

export { Base };
