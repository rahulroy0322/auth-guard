import { eq, isNull } from "drizzle-orm";

import type { PgColumn } from "drizzle-orm/pg-core";

const checkNull = ({ key, data }: { key: PgColumn; data: string }) => {
	if (!data) {
		return isNull(key);
	}
	return eq(key, data);
};

export { checkNull };
