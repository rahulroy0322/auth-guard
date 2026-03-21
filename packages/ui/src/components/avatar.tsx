import type { FC } from "react";
import { cn } from "ui/lib/utils";
import { Avatar as Av, AvatarFallback, AvatarImage } from "./ui/avatar";

type AvatarPropsType = {
	src: string | undefined;
	name: string | undefined;
} & Parameters<typeof Av>[0];

const Avatar: FC<AvatarPropsType> = ({ src, name, className, ...props }) => (
	<Av {...props} className={cn("size-6", className)}>
		<AvatarImage src={src} />
		<AvatarFallback>{name?.at(0)?.toUpperCase()}</AvatarFallback>
	</Av>
);

export { Avatar };
