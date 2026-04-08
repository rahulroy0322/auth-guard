import { toast } from "ui/components/ui/sonner";

const getErrorDetails = (error: unknown) => {
	if (
		error instanceof Error ||
		(error &&
			typeof error === "object" &&
			"name" in error &&
			"message" in error)
	) {
		return {
			title: error.name as string,
			description: error.message as string,
		};
	}

	return {
		title: "AuthError",
		description: "Something went wrong. Please try again.",
	};
};

const showAuthError = (error: unknown, fallbackTitle?: string) => {
	const { title, description } = getErrorDetails(error);

	toast.error(fallbackTitle ?? title, {
		description,
	});
};

export { getErrorDetails, showAuthError };
