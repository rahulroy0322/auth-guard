type SuccessType = {
	success: true;
	data: Record<string, unknown>;
};

type ErrorType<E = Error> = {
	success: false;
	error: E;
};

type ResType<E = Error> = SuccessType | ErrorType<E>;

export type { ErrorType, ResType, SuccessType };
