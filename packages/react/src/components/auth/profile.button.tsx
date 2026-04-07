import {
	RiComputerLine,
	RiDeleteBin2Line,
	RiLoader2Line,
	RiLogoutBoxRLine,
	RiSettings2Line,
	RiShieldCheckFill,
	RiSmartphoneLine,
	RiUser2Line,
	RiWindowsLine,
} from "@remixicon/react";
import type { SessionFormatedType } from "base";
import { useAppForm } from "form";
import {
	type FC,
	type ReactNode,
	Suspense,
	use,
	useCallback,
	useEffect,
	useState,
} from "react";
import {
	type UpdatePasswordSchemaType,
	updatePasswordSchema,
	updateProfileSchema,
} from "schema";
import { Avatar } from "ui/components/avatar";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "ui/components/ui/alert-dialog";
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
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "ui/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuTrigger,
} from "ui/components/ui/dropdown-menu";
import { Field, FieldContent, FieldLabel } from "ui/components/ui/field";
import { Input } from "ui/components/ui/input";
import { Separator } from "ui/components/ui/separator";
import { toast } from "ui/components/ui/sonner";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "ui/components/ui/tabs";
import { cn } from "ui/lib/utils";
import { get, patch, patchMultiPart } from "../../api/main";
import { useGuard } from "../../provider";
import { ProfileAvatar } from "./avatar";

type UpdatePasswordPropsType = {
	closeModal: () => void;
};

const UpdatePassword: FC<UpdatePasswordPropsType> = ({ closeModal }) => {
	const { reqWithToken, fetching, config } = useGuard();
	const [updating, setUpdating] = useState(false);

	const handleUpdatePassword = async ({
		password,
	}: Pick<UpdatePasswordSchemaType, "password">) => {
		setUpdating(true);
		try {
			await reqWithToken(async (token) =>
				patch({
					base: config.baseUrl,
					url: "change-password",
					body: { password },
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}),
			);
			closeModal();
		} catch (error) {
			console.error("Failed to update password:", error);
			toast.error((error as Error).name, {
				description: (error as Error).message,
			});
		} finally {
			setUpdating(false);
		}
	};

	const { AppField, handleSubmit: submit } = useAppForm({
		defaultValues: {
			password: "",
			confirm: "",
		} satisfies UpdatePasswordSchemaType as UpdatePasswordSchemaType,
		validators: {
			onSubmit: updatePasswordSchema,
		},
		onSubmit: ({ value }) => {
			handleUpdatePassword(value);
		},
	});

	return (
		<form
			className="col-span-2"
			onSubmit={(e) => {
				e.preventDefault();
				submit();
			}}
		>
			<Card className="p-4 shadow-lg">
				<CardHeader className="p-0 pb-3">
					<CardTitle className="text-sm">Update Password</CardTitle>
				</CardHeader>
				<CardContent className="p-0 space-y-3">
					<AppField name="password">
						{({ Password }) => <Password label="New Password" />}
					</AppField>
					<AppField name="confirm">
						{({ Password }) => <Password label="Confirm Password" />}
					</AppField>
				</CardContent>
				<CardFooter className="flex items-center gap-2 justify-end">
					<Button type="submit" disabled={updating || fetching}>
						Save
					</Button>
					<Button
						type="button"
						onClick={closeModal}
						variant="outline"
						disabled={updating || fetching}
					>
						Cancel
					</Button>
				</CardFooter>
			</Card>
		</form>
	);
};

type DevicePropsType = SessionFormatedType;

const { format } = Intl.DateTimeFormat(undefined, {
	dateStyle: "medium",
});

const check = (str: string, init: string) =>
	str.toLowerCase().startsWith(init.toLowerCase());

const getIcon = (device: string) => {
	if (check(device, "win")) {
		return RiWindowsLine;
	}

	if (check(device, "and")) {
		return RiSmartphoneLine;
	}

	return RiComputerLine;
};

const Device: FC<DevicePropsType> = ({
	createdAt,
	deviceType,
	deviceName,
	isActive,
	currentDevice,
}) => {
	const Icon = getIcon(deviceType);

	return (
		<div
			className={cn("outline p-1 relative", {
				"opacity-70": !isActive,
			})}
		>
			<Icon
				className={cn("size-5", {
					"text-primary": currentDevice,
				})}
			/>
			<h2>
				<b>{deviceName}</b>
				{currentDevice ? (
					<span className="ml-2 capitalize">This Device</span>
				) : null}
			</h2>
			<h3>
				{deviceType}
				<span className="ml-2">200.0.0</span>
			</h3>
			<time dateTime={createdAt}>{format(new Date(createdAt))}</time>
			<Button
				size={"icon-sm"}
				variant={"destructive"}
				className="absolute right-2 bottom-2"
			>
				<RiDeleteBin2Line />
			</Button>
		</div>
	);
};

type SessionsImplPropsType = {
	promise: Promise<DevicePropsType[]>;
};

const SessionsImpl: FC<SessionsImplPropsType> = ({ promise }) => {
	const sessions = use(promise);

	return sessions.map((session) => <Device {...session} key={session.id} />);
};

const Sessions: FC = () => {
	const { config, reqWithToken } = useGuard();

	const fetchSessions = useCallback(async () => {
		try {
			const { sessions } = await reqWithToken(async (token) =>
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
		} catch (error) {
			console.error("Failed to fetch sessions:", error);
			toast.error((error as Error).name, {
				description: (error as Error).message,
			});

			return [];
		}
	}, [config.baseUrl, reqWithToken]);

	return (
		<Suspense
			fallback={
				<RiLoader2Line className="animate-spin animation-duration-[2.5s] size-8" />
			}
		>
			<SessionsImpl promise={fetchSessions()} />
		</Suspense>
	);
};

const Security: FC = () => {
	const { user, loading } = useGuard();
	const [isEditing, setIsEditing] = useState(false);

	if (!user) {
		throw new Error("some event doesn't handled properly! for <Security>");
	}

	const closeModal = () => {
		setIsEditing(false);
	};

	return (
		<TabsContent value="security">
			<DialogHeader className="p-2">
				<DialogTitle className="flex items-center gap-1">
					<RiShieldCheckFill size={20} className="size-4" />
					Security
				</DialogTitle>
				<DialogDescription>
					Manage your account security in one place.
				</DialogDescription>
			</DialogHeader>
			<Separator />

			<div className="grid grid-cols-3 p-2 py-4">
				<b>Password</b>

				{isEditing ? (
					<UpdatePassword closeModal={closeModal} />
				) : (
					<>
						<span>{"*".repeat(8)}</span>

						<Button
							variant="outline"
							onClick={() => setIsEditing((prev) => !prev)}
						>
							Update Password
						</Button>
					</>
				)}
			</div>

			<Separator />

			<div className="grid grid-cols-3 p-2 py-4">
				<b>Active devices</b>

				<div className="col-span-2 p-1 max-h-40 overflow-auto space-y-2">
					<Sessions />
				</div>
			</div>

			<Separator />

			<div className="grid grid-cols-3 p-2 py-4">
				<b>Delete account</b>
				<AlertDialog>
					<AlertDialogTrigger render={<Button variant="destructive" />}>
						Delete account
					</AlertDialogTrigger>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
							<AlertDialogDescription>
								This action cannot be undone. This will permanently delete your
								account from our servers.
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel disabled={loading} variant={"default"}>
								Cancel
							</AlertDialogCancel>
							<AlertDialogAction variant="destructive" disabled={loading}>
								Continue
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			</div>
		</TabsContent>
	);
};

type UpdateProfilePropsType = {
	name: string;
	url: string | null;
	closeModal: () => void;
};

const UpdateProfile: FC<UpdateProfilePropsType> = ({
	name: prevName,
	url,
	closeModal,
}) => {
	const { reqWithToken, fetching, config } = useGuard();
	const [name, setName] = useState(prevName);
	const [avatarFile, setAvatarFile] = useState<File | null>(null);
	const [fileUrl, setFileUrl] = useState(url || "");

	useEffect(() => {
		if (avatarFile) {
			const objectUrl = URL.createObjectURL(avatarFile);
			setFileUrl(objectUrl);

			return () => URL.revokeObjectURL(objectUrl);
		}
		setFileUrl(url || "");

		return () => {};
	}, [avatarFile, url]);

	const handleSave = async () => {
		if (avatarFile) {
			if (!(avatarFile instanceof File)) {
				toast.error("Invalid Avatar");
				return;
			}

			const { success, error } = updateProfileSchema.safeParse({
				name,
				profileImage: {
					originalname: avatarFile.name,
					mimetype: avatarFile.type,
					size: avatarFile.size,
				},
			});

			if (!success) {
				toast.error(error.name, {
					description: error.issues
						.map((val) => `"${val.path.join(".")}"-${val.message}`)
						.join(","),
				});
				return;
			}
		}

		const formData = new FormData();

		if (avatarFile) {
			formData.set("profileImage", avatarFile);
		}
		if (name !== prevName) {
			formData.set("name", name);
		}

		try {
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
			toast.success("Profile Updated Succesfully");
			closeModal();
		} catch (error) {
			console.error("Failed to update profile:", error);
			toast.error((error as Error).name, {
				description: (error as Error).message,
			});
		}
	};

	return (
		<Card className="p-4 shadow-lg col-span-2">
			<CardHeader className="p-0 pb-3">
				<CardTitle className="text-sm">Edit Profile</CardTitle>
				<CardDescription>Update your name and avatar</CardDescription>
			</CardHeader>
			<CardContent className="p-0 space-y-3">
				<Field className="grid grid-cols-3">
					<FieldContent>
						<FieldLabel>
							<Avatar name={name} src={fileUrl} />
						</FieldLabel>
					</FieldContent>
					<Button
						disabled={fetching}
						variant={"outline"}
						nativeButton={false}
						render={
							<label>
								Upload
								<input
									type="file"
									accept="image/*"
									hidden
									onChange={(e) => {
										setAvatarFile(e.target.files?.[0] ?? null);
									}}
								/>
							</label>
						}
					/>
					<Button
						variant="destructive"
						disabled={!avatarFile}
						onClick={() => setAvatarFile(null)}
					>
						Remove
					</Button>
				</Field>
				<Field>
					<FieldContent>
						<FieldLabel>Name</FieldLabel>
					</FieldContent>
					<Input
						onChange={(e) => {
							setName(e.target.value);
						}}
						value={name}
						disabled={fetching}
					/>
				</Field>
			</CardContent>
			<CardFooter className="flex items-center gap-2 justify-end">
				<Button
					onClick={handleSave}
					disabled={fetching || (prevName === name && !avatarFile) || !name}
				>
					Save
				</Button>
				<Button onClick={closeModal} disabled={fetching} variant="outline">
					Cancel
				</Button>
			</CardFooter>
		</Card>
	);
};

const Profile: FC = () => {
	const { user, config } = useGuard();
	const [isEditing, setIsEditing] = useState(false);

	if (!user) {
		throw new Error("some event doesn't handled properly! for <Profile>");
	}

	const closeModal = () => {
		setIsEditing(false);
	};

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

				{isEditing ? (
					<UpdateProfile
						name={user.name}
						url={user.avatar?.src ?? null}
						closeModal={closeModal}
					/>
				) : (
					<>
						<div className="flex items-center">
							<ProfileAvatar baseUrl={config.baseUrl} user={user} />
							<span>{user.name}</span>
						</div>
						<Button
							variant="outline"
							onClick={() => setIsEditing((prev) => !prev)}
						>
							Update profile
						</Button>
					</>
				)}
			</div>

			<Separator />

			<div className="grid grid-cols-3 p-2 py-4">
				<b>Email addresses</b>
				<div className="col-span-2">
					<p>{user.email}</p>
				</div>
			</div>
		</TabsContent>
	);
};

type UserManagemantPropsType = {
	children: ReactNode;
};

const UserManagemant: FC<UserManagemantPropsType> = ({ children }) => (
	<Dialog>
		{children}
		<DialogContent
			className="max-w-sm md:max-w-4xl p-0"
			showCloseButton={false}
		>
			<Card>
				<CardHeader>
					<CardTitle>Account</CardTitle>
					<CardDescription>Manage your account info.</CardDescription>
				</CardHeader>
				<CardContent>
					<Tabs>
						<TabsList className="w-full">
							<TabsTrigger value="profile">
								<RiUser2Line size={20} />
								Profile
							</TabsTrigger>
							<TabsTrigger value="security">
								<RiShieldCheckFill size={20} />
								Security
							</TabsTrigger>
						</TabsList>
						<Security />
						<Profile />
					</Tabs>
				</CardContent>
			</Card>
		</DialogContent>
	</Dialog>
);

const ProfileButton: FC = () => {
	const { user, loading, logout, config } = useGuard();

	if (loading || !user) {
		return null;
	}

	return (
		<UserManagemant>
			<DropdownMenu>
				<DropdownMenuTrigger>
					<ProfileAvatar baseUrl={config.baseUrl} user={user} />
				</DropdownMenuTrigger>
				<DropdownMenuContent className="min-w-80 p-0">
					<DropdownMenuGroup className="*:p-2 *:rounded-none">
						<DropdownMenuItem className="bg-transparent!">
							<ProfileAvatar baseUrl={config.baseUrl} user={user} />
							<div>
								<h2 className="font-bold">{user.name}</h2>
								<DropdownMenuLabel className="text-left p-0">
									{user.email}
								</DropdownMenuLabel>
							</div>
						</DropdownMenuItem>
					</DropdownMenuGroup>
					<Separator />
					<DropdownMenuGroup className="*:p-2 *:rounded-none *:cursor-pointer">
						<DropdownMenuItem
							nativeButton={true}
							render={<DialogTrigger className="w-full" />}
						>
							<RiSettings2Line size={20} />
							<span>Manage account</span>
						</DropdownMenuItem>
						<Separator className="p-0!" />
						<DropdownMenuItem onClick={logout}>
							<RiLogoutBoxRLine size={20} />
							<span>Log out</span>
						</DropdownMenuItem>
					</DropdownMenuGroup>
					<Separator />
					<DropdownMenuGroup className="*:p-2 *:rounded-none">
						<DropdownMenuItem>
							<p className="w-full leading-6 tracking-wider text-center">
								Secured by <b>Auth Guard</b>
							</p>
						</DropdownMenuItem>
					</DropdownMenuGroup>
				</DropdownMenuContent>
			</DropdownMenu>
		</UserManagemant>
	);
};

export { ProfileButton };
