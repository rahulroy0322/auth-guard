import {
	RiLogoutBoxRLine,
	RiSettings2Line,
	RiShieldCheckFill,
	RiUser2Line,
} from "@remixicon/react";
import { type FC, type ReactNode, useMemo, useState } from "react";
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
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "ui/components/ui/tabs";
import { cn } from "ui/lib/utils";
import { useGuard } from "../provider";

const Security: FC = () => {
	const { user, loading } = useGuard();

	if (!user) {
		throw new Error("some event dosn't handled properly! for <Security>");
	}

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
				<span>{"*".repeat(8)}</span>
				<Button variant="outline">Update Password</Button>
			</div>

			<Separator />

			<div className="grid grid-cols-3 p-2 py-4">
				<b>Active devices</b>
				<span className="bg-destructive/10 text-destructive hover:bg-destructive/20 p-1 col-span-2">
					TODO Coming soon
				</span>
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

type UploadProfilePropsType = {
	name: string;
	url: string | null;
	closeModel: () => void;
};

const UploadProfile: FC<UploadProfilePropsType> = ({
	name: prevName,
	url,
	closeModel,
}) => {
	const [name, setName] = useState(prevName);
	const [avatarFile, setAvatarFile] = useState<File | null>(null);

	const fileUrl = useMemo(() => {
		if (!avatarFile) {
			return url || "";
		}
		return URL.createObjectURL(avatarFile);
	}, [avatarFile, url]);

	const handleSave = () => {
		closeModel();
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
							<Avatar name={prevName} src={fileUrl} />
						</FieldLabel>
					</FieldContent>
					<Button
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
						// TODO!
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
					/>
				</Field>
			</CardContent>
			<CardFooter className="flex items-center gap-2 justify-end">
				<Button
					onClick={handleSave}
					disabled={(prevName === name && !avatarFile) || !name}
				>
					Save
				</Button>
				<Button onClick={closeModel} variant="outline">
					Cancel
				</Button>
			</CardFooter>
		</Card>
	);
};

const Profile: FC = () => {
	const { user } = useGuard();
	const [isEditing, setIsEditing] = useState(false);

	if (!user) {
		throw new Error("some event dosn't handled properly! for <Profile>");
	}

	const closeModel = () => {
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
					<UploadProfile
						name={user.name}
						url={user.avatar?.src ?? null}
						closeModel={closeModel}
					/>
				) : (
					<>
						<div className={cn("flex items-center")}>
							<Avatar src={user.avatar?.src} name={user.name} />
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
	const { user, loading, logout } = useGuard();

	if (loading || !user) {
		return null;
	}

	return (
		<UserManagemant>
			<DropdownMenu>
				<DropdownMenuTrigger>
					<Avatar src={user.avatar?.src} name={user.name} />
				</DropdownMenuTrigger>
				<DropdownMenuContent className="min-w-80 p-0">
					<DropdownMenuGroup className="*:p-2 *:rounded-none">
						<DropdownMenuItem className="bg-transparent!">
							<Avatar src={user.avatar?.src} name={user.name} />
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
