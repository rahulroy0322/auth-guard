type CacheKeysType = "token" | "code" | "user" | "avatar";
type CacheKeyType = `${CacheKeysType}:${string}`;

type CacheConfigType = {
	set: (key: CacheKeyType, value: string, seconds: number) => Promise<void>;
	get: (key: CacheKeyType) => Promise<string | null>;
	remove: (key: CacheKeyType) => Promise<void>;
};

export type { CacheConfigType, CacheKeysType, CacheKeyType };
