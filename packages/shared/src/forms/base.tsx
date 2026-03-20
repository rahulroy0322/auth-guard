import { RiAppleLine, RiGithubLine, RiGoogleLine } from "@remixicon/react";
import type { FC, ReactNode } from "react";
import { Button } from "ui/components/ui/button";
import { Card, CardContent } from "ui/components/ui/card";
import { Field, FieldGroup, FieldSeparator } from "ui/components/ui/field";

type BasePropsType = {
	children: ReactNode;
	title: string;
	description: string;
	src: string;
	alt: string;
};

const Base: FC<BasePropsType> = ({
	children,
	title,
	description,
	src,
	alt,
}) => (
	<Card className="overflow-hidden p-0 ring-0">
		<CardContent className="grid p-0 md:grid-cols-2 overflow-hidden items-center">
			<FieldGroup className="p-6 md:p-8">
				<Field className="text-center">
					<h1 className="text-2xl font-bold">{title}</h1>
					<p className="text-balance text-muted-foreground">{description}</p>
				</Field>

				{children}

				<FieldSeparator>Or continue with</FieldSeparator>

				<Field>
					<Button disabled>
						<RiAppleLine />
						<span>Login with Apple</span>
					</Button>
				</Field>
				<Field>
					<Button>
						<RiGoogleLine />
						<span>Login with Google</span>
					</Button>
				</Field>
				<Field>
					<Button>
						<RiGithubLine />
						<span>Login with Github</span>
					</Button>
				</Field>
			</FieldGroup>

			<figure className="hidden bg-muted md:block">
				<img src={src} alt={alt} />
			</figure>
		</CardContent>
	</Card>
);

export { Base };
