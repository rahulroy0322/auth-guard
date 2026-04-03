type BrandingType = {
	src: string;
	appName: string | undefined;
};

type BrandingOnlySrcType = Pick<BrandingType, "src">;

export type { BrandingOnlySrcType, BrandingType };
