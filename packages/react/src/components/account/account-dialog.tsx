import {
	RiLogoutBoxRLine,
	RiSettings2Line,
	RiShieldCheckFill,
	RiUser2Line,
} from "@remixicon/react";
import type { FC, ReactNode } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "ui/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "ui/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuTrigger,
} from "ui/components/ui/dropdown-menu";
import { Separator } from "ui/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "ui/components/ui/tabs";
import { useGuard } from "../../provider";
import { ProfileAvatar } from "../avatar";
import { ProfilePanel } from "./profile-panel";
import { SecurityPanel } from "./security-panel";

type AccountDialogPropsType = {
	children: ReactNode;
};

const AccountDialog: FC<AccountDialogPropsType> = ({ children }) => (
	<Dialog>
		{children}
		<DialogContent
			className="max-w-sm p-0 md:max-w-4xl"
			showCloseButton={false}
		>
			<Card>
				<CardHeader>
					<CardTitle>Account</CardTitle>
					<CardDescription>Manage your account info.</CardDescription>
				</CardHeader>
				<CardContent>
					<Tabs defaultValue="profile">
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
						<ProfilePanel />
						<SecurityPanel />
					</Tabs>
				</CardContent>
			</Card>
		</DialogContent>
	</Dialog>
);

const ProfileButton: FC = () => {
	const { config, loading, logout, user } = useGuard();

	if (loading || !user) {
		return null;
	}

	return (
		<AccountDialog>
			<DropdownMenu>
				<DropdownMenuTrigger>
					<ProfileAvatar baseUrl={config.baseUrl} user={user} />
				</DropdownMenuTrigger>
				<DropdownMenuContent className="min-w-80 p-0">
					<DropdownMenuGroup className="*:rounded-none *:p-2">
						<DropdownMenuItem className="bg-transparent!">
							<ProfileAvatar baseUrl={config.baseUrl} user={user} />
							<div>
								<h2 className="font-bold">{user.name}</h2>
								<DropdownMenuLabel className="p-0 text-left">
									{user.email}
								</DropdownMenuLabel>
							</div>
						</DropdownMenuItem>
					</DropdownMenuGroup>
					<Separator />
					<DropdownMenuGroup className="*:cursor-pointer *:rounded-none *:p-2">
						<DropdownMenuItem
							nativeButton
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
					<DropdownMenuGroup className="*:rounded-none *:p-2">
						<DropdownMenuItem>
							<p className="w-full text-center leading-6 tracking-wider">
								Secured by <b>Auth Guard</b>
							</p>
						</DropdownMenuItem>
					</DropdownMenuGroup>
				</DropdownMenuContent>
			</DropdownMenu>
		</AccountDialog>
	);
};

export { AccountDialog, ProfileButton };
