import type { FC, ReactNode } from "react";
import { useGuard } from "./provider";

type ShowPropsType = {
	when: "logged-in" | "logged-out";
	fallback?: ReactNode;
	children: ReactNode;
};

const Show: FC<ShowPropsType> = ({ children, when, fallback = null }) => {
	const { user, loading } = useGuard();

	if (loading) {
		return fallback;
	}

	if (when === "logged-out") {
		if (user) {
			return null;
		}
		return children;
	}

	if (!user) {
		return fallback;
	}

	return children;
};

export { Show };
