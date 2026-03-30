import { z } from "zod";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

const ACCEPTED_IMAGE_TYPES = [
	"image/jpeg",
	"image/jpg",
	"image/png",
	"image/webp",
	"image/gif",
	"image/svg+xml",
] as const;

const updateProfileSchema = z.object({
	profileImage: z
		.object({
			originalname: z.string(),
			mimetype: z.enum(ACCEPTED_IMAGE_TYPES),
			size: z.number().max(MAX_FILE_SIZE, "File size must be less than 2MB"),
		})
		.optional(),
	name: z.string().optional(),
});

type UpdateProfileSchemaType = z.infer<typeof updateProfileSchema>;

export type { UpdateProfileSchemaType };

export { ACCEPTED_IMAGE_TYPES, MAX_FILE_SIZE, updateProfileSchema };
