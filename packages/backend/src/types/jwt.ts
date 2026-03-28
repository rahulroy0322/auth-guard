type JwtConfigType = {
	expires: {
		access: number;
		refresh: number;
	};
	secret: string;
};

export type { JwtConfigType };
