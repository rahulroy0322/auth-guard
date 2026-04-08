import { RiUser2Line } from "@remixicon/react";
import { type FC, useEffect, useState } from "react";
import { Avatar } from "ui/components/avatar";
import { Button } from "ui/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "ui/components/ui/card";
import {
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "ui/components/ui/dialog";
import { Field, FieldContent, FieldLabel } from "ui/components/ui/field";
import { Input } from "ui/components/ui/input";
import { Separator } from "ui/components/ui/separator";
import { TabsContent } from "ui/components/ui/tabs";
import { useGuard } from "../../provider";
import { ProfileAvatar } from "../avatar";
import { showAuthError } from "../shared/error";
import { useAccountActions } from "./actions";

type EditProfileCardPropsType = {
	name: string;
	avatarUrl: string | null;
	onClose: () => void;
};

const EditProfileCard: FC<EditProfileCardPropsType> = ({
	name: initialName,
	avatarUrl,
	onClose,
}) => {
	const { fetching } = useGuard();
	const { updateProfile } = useAccountActions();
	const [name, setName] = useState(initialName);
	const [avatarFile, setAvatarFile] = useState<File | null>(null);
	const [previewUrl, setPreviewUrl] = useState(avatarUrl ?? "");

	useEffect(() => {
		if (!avatarFile) {
			setPreviewUrl(avatarUrl ?? "");
			return;
		}

		const objectUrl = URL.createObjectURL(avatarFile);
		setPreviewUrl(objectUrl);

		return () => {
			URL.revokeObjectURL(objectUrl);
		};
	}, [avatarFile, avatarUrl]);

	return (
		<Card className="col-span-2 p-4 shadow-lg">
			<CardHeader className="p-0 pb-3">
				<CardTitle className="text-sm">Edit profile</CardTitle>
				<CardDescription>Update your name and avatar.</CardDescription>
			</CardHeader>
			<CardContent className="space-y-3 p-0">
				<Field className="grid grid-cols-3 gap-2">
					<FieldContent>
						<FieldLabel>
							<Avatar name={name} src={previewUrl} />
						</FieldLabel>
					</FieldContent>
					<Button
						disabled={fetching}
						variant="outline"
						nativeButton={false}
						render={
							<label>
								Upload
								<input
									type="file"
									accept="image/*"
									hidden
									onChange={(event) => {
										setAvatarFile(event.target.files?.[0] ?? null);
									}}
								/>
							</label>
						}
					/>
					<Button
						variant="destructive"
						disabled={!avatarFile}
						onClick={() => {
							setAvatarFile(null);
						}}
					>
						Remove
					</Button>
				</Field>
				<Field>
					<FieldContent>
						<FieldLabel>Name</FieldLabel>
					</FieldContent>
					<Input
						value={name}
						disabled={fetching}
						onChange={(event) => {
							setName(event.target.value);
						}}
					/>
				</Field>
			</CardContent>
			<CardFooter className="justify-end gap-2">
				<Button
					disabled={fetching || (!avatarFile && name === initialName) || !name}
					onClick={async () => {
						try {
							await updateProfile({
								name,
								previousName: initialName,
								avatarFile,
							});
							onClose();
						} catch (error) {
							showAuthError(error, "ProfileUpdateError");
						}
					}}
				>
					Save
				</Button>
				<Button variant="outline" disabled={fetching} onClick={onClose}>
					Cancel
				</Button>
			</CardFooter>
		</Card>
	);
};

const ProfilePanel: FC = () => {
	const { config, user } = useGuard();
	const [editing, setEditing] = useState(false);

	if (!user) {
		return null;
	}

	return (
		<TabsContent value="profile">
			<DialogHeader className="p-2">
				<DialogTitle className="flex items-center gap-1">
					<RiUser2Line className="size-4" size={20} />
					Profile
				</DialogTitle>
				<DialogDescription>Manage your profile in one place.</DialogDescription>
			</DialogHeader>
			<Separator />
			<div className="grid grid-cols-3 p-2 py-4">
				<b>Profile</b>
				{editing ? (
					<EditProfileCard
						name={user.name}
						avatarUrl={user.avatar?.src ?? null}
						onClose={() => {
							setEditing(false);
						}}
					/>
				) : (
					<>
						<div className="flex items-center gap-2">
							<ProfileAvatar baseUrl={config.baseUrl} user={user} />
							<span>{user.name}</span>
						</div>
						<Button
							variant="outline"
							onClick={() => {
								setEditing(true);
							}}
						>
							Update profile
						</Button>
					</>
				)}
			</div>
			<Separator />
			<div className="grid grid-cols-3 p-2 py-4">
				<b>Email address</b>
				<div className="col-span-2">
					<p>{user.email}</p>
				</div>
			</div>
		</TabsContent>
	);
};

export { ProfilePanel };
