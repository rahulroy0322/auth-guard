import {
	RiLogoutBoxRLine,
	RiSettings2Line,
	RiShieldCheckFill,
	RiUser2Line,
} from "@remixicon/react";
import type { FC, ReactNode } from "react";
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
import { Separator } from "ui/components/ui/separator";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "ui/components/ui/tabs";
import { useGuard } from "../provider";


// biome-ignore lint/complexity/noBannedTypes: temp
type SecurityPropsType = {};

const Security: FC<SecurityPropsType> = () => (
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
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction variant="destructive">
							Continue
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	</TabsContent>
);

// biome-ignore lint/complexity/noBannedTypes: temp
type ProfilePropsType = {};

const Profile: FC<ProfilePropsType> = () => (
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
			<div className="flex items-center">
				<Avatar name={"Jhon Dow"} src={"/user.png"} />
				<span>Jhon Dow</span>
			</div>
			<Button variant="outline">Update profile</Button>
		</div>

		<Separator />

		<div className="grid grid-cols-3 p-2 py-4">
			<b>Email addresses</b>
			<div className="col-span-2">
				<p>jhon@dow.com</p>
				<p>jhon@dow.com</p>
			</div>
		</div>
	</TabsContent>
);

type UserManagemantPropsType = {
	children: ReactNode;
};

const UserManagemant: FC<UserManagemantPropsType> = ({ children }) => {
	return (
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
};

// biome-ignore lint/complexity/noBannedTypes: temp
type ProfileButtonPropsType = {};

const ProfileButton: FC<ProfileButtonPropsType> = () => {
	const { user, loading } = useGuard();

	if (loading || !user) {
		return null;
	}

	return (
		<UserManagemant>
			<DropdownMenu>
				<DropdownMenuTrigger>
					<Avatar
						src={user.avatar?.src}
						name={user.name.at(0)?.toUpperCase()}
					/>
				</DropdownMenuTrigger>
				<DropdownMenuContent className="min-w-80 p-0">
					<DropdownMenuGroup className="*:p-2 *:rounded-none">
						<DropdownMenuItem className="bg-transparent!">
							<Avatar
								src={user.avatar?.src}
								name={user.name.at(0)?.toUpperCase()}
							/>
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
						<DropdownMenuItem>
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
