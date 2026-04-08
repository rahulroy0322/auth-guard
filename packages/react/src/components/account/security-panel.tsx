import { RiShieldCheckFill } from "@remixicon/react";
import { useAppForm } from "form";
import { type FC, useState } from "react";
import { type UpdatePasswordSchemaType, updatePasswordSchema } from "schema";
import { Button } from "ui/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "ui/components/ui/card";
import {
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "ui/components/ui/dialog";
import { Separator } from "ui/components/ui/separator";
import { TabsContent } from "ui/components/ui/tabs";
import { useGuard } from "../../provider";
import { showAuthError } from "../shared/error";
import { useAccountActions } from "./actions";
import { SessionList } from "./session-list";

type UpdatePasswordCardPropsType = {
	onClose: () => void;
};

const UpdatePasswordCard: FC<UpdatePasswordCardPropsType> = ({ onClose }) => {
	const { fetching } = useGuard();
	const { updatePassword } = useAccountActions();
	const [submitting, setSubmitting] = useState(false);

	const { AppField, handleSubmit } = useAppForm({
		defaultValues: {
			password: "",
			confirm: "",
		} satisfies UpdatePasswordSchemaType as UpdatePasswordSchemaType,
		validators: {
			onSubmit: updatePasswordSchema,
		},
		onSubmit: async ({ value }) => {
			setSubmitting(true);

			try {
				await updatePassword(value.password);
				onClose();
			} catch (error) {
				showAuthError(error, "PasswordUpdateError");
			} finally {
				setSubmitting(false);
			}
		},
	});

	return (
		<form
			className="col-span-2"
			onSubmit={(event) => {
				event.preventDefault();
				handleSubmit();
			}}
		>
			<Card className="p-4 shadow-lg">
				<CardHeader className="p-0 pb-3">
					<CardTitle className="text-sm">Update password</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3 p-0">
					<AppField name="password">
						{({ Password }) => <Password label="New Password" />}
					</AppField>
					<AppField name="confirm">
						{({ Password }) => <Password label="Confirm Password" />}
					</AppField>
				</CardContent>
				<CardFooter className="justify-end gap-2">
					<Button type="submit" disabled={submitting || fetching}>
						Save
					</Button>
					<Button
						type="button"
						variant="outline"
						disabled={submitting || fetching}
						onClick={onClose}
					>
						Cancel
					</Button>
				</CardFooter>
			</Card>
		</form>
	);
};

const SecurityPanel: FC = () => {
	const [editingPassword, setEditingPassword] = useState(false);

	return (
		<TabsContent value="security">
			<DialogHeader className="p-2">
				<DialogTitle className="flex items-center gap-1">
					<RiShieldCheckFill size={20} className="size-4" />
					Security
				</DialogTitle>
				<DialogDescription>
					Manage your password and active sessions in one place.
				</DialogDescription>
			</DialogHeader>
			<Separator />
			<div className="grid grid-cols-3 p-2 py-4">
				<b>Password</b>
				{editingPassword ? (
					<UpdatePasswordCard
						onClose={() => {
							setEditingPassword(false);
						}}
					/>
				) : (
					<>
						<span>{"*".repeat(8)}</span>
						<Button
							variant="outline"
							onClick={() => {
								setEditingPassword(true);
							}}
						>
							Update password
						</Button>
					</>
				)}
			</div>
			<Separator />
			<div className="grid grid-cols-3 p-2 py-4">
				<b>Active devices</b>
				<div className="col-span-2 max-h-60 overflow-auto p-1">
					<SessionList />
				</div>
			</div>
			<Separator />
			<div className="grid grid-cols-3 p-2 py-4">
				<b>Delete account</b>
				<div className="col-span-2 flex items-center justify-between gap-4 rounded-md border border-dashed p-4">
					<p className="text-sm text-muted-foreground">
						Account deletion is not wired to an endpoint yet.
					</p>
					<Button variant="destructive" disabled>
						Unavailable
					</Button>
				</div>
			</div>
		</TabsContent>
	);
};

export { SecurityPanel };
