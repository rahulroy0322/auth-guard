import type { ZodError } from "zod";

const formatZodError = (e: ZodError) =>
	e.issues.reduce(
		(acc, { path, message }) => {
			const _path = path[0] as string;
			let _val = acc[_path];

			if (!_val) {
				_val = acc[_path] = [];
			}

			_val.push(message);

			return acc;
		},
		{} as Record<string, string[]>,
	);

export { formatZodError };
