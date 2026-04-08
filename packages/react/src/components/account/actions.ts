import type { SessionFormatedType } from "base";
import { useCallback } from "react";
import { updateProfileSchema } from "schema";
import { get, patch, patchMultiPart } from "../../api/main";
import { useGuard } from "../../provider";

const useAccountActions = () => {
	const { config, reqWithToken } = useGuard();

	const updatePassword = useCallback(
		async (password: string) => {
			await reqWithToken((token) =>
				patch({
					base: config.baseUrl,
					url: "change-password",
					body: { password },
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}),
			);
		},
		[config.baseUrl, reqWithToken],
	);

	const fetchSessions = useCallback(async () => {
		const { sessions } = await reqWithToken((token) =>
			get<{
				sessions: SessionFormatedType[];
			}>({
				base: config.baseUrl,
				url: "sessions",
				headers: {
					Authorization: `Bearer ${token}`,
				},
			}),
		);

		return sessions;
	}, [config.baseUrl, reqWithToken]);

	const updateProfile = useCallback(
		async ({
			name,
			previousName,
			avatarFile,
		}: {
			name: string;
			previousName: string;
			avatarFile: File | null;
		}) => {
			if (avatarFile) {
				const validation = updateProfileSchema.safeParse({
					name,
					profileImage: {
						originalname: avatarFile.name,
						mimetype: avatarFile.type,
						size: avatarFile.size,
					},
				});

				if (!validation.success) {
					throw new Error(
						validation.error.issues
							.map((issue) => `"${issue.path.join(".")}" - ${issue.message}`)
							.join(", "),
					);
				}
			}

			const formData = new FormData();

			if (avatarFile) {
				formData.set("profileImage", avatarFile);
			}

			if (name !== previousName) {
				formData.set("name", name);
			}

			await reqWithToken((token) =>
				patchMultiPart({
					base: config.baseUrl,
					url: "profile",
					body: formData,
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}),
			);
		},
		[config.baseUrl, reqWithToken],
	);

	return {
		fetchSessions,
		updatePassword,
		updateProfile,
	};
};

export { useAccountActions };
