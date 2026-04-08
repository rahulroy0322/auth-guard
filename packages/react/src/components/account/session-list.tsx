import {
	RiComputerLine,
	RiLoader2Line,
	RiSmartphoneLine,
	RiWindowsLine,
} from "@remixicon/react";
import type { SessionFormatedType } from "base";
import { type FC, useEffect, useState } from "react";
import { Button } from "ui/components/ui/button";
import { cn } from "ui/lib/utils";
import { showAuthError } from "../shared/error";
import { useAccountActions } from "./actions";

type DeviceCardPropsType = SessionFormatedType;

const { format } = Intl.DateTimeFormat(undefined, {
	dateStyle: "medium",
});

const getDeviceIcon = (deviceType: string) => {
	const lowerType = deviceType.toLowerCase();

	// Windows devices
	if (lowerType.startsWith("win")) {
		return RiWindowsLine;
	}

	// macOS devices
	if (lowerType.startsWith("mac") || lowerType.includes("os x")) {
		return RiComputerLine; // Macs are computers
	}

	// Linux devices
	if (lowerType.startsWith("lin")) {
		return RiComputerLine;
	}

	// Android devices
	if (lowerType.startsWith("and")) {
		return RiSmartphoneLine;
	}

	// iOS devices
	if (lowerType.startsWith("iphone") || lowerType.startsWith("ipad")) {
		return RiSmartphoneLine;
	}

	// Chrome OS devices
	if (lowerType.startsWith("cros")) {
		return RiComputerLine;
	}

	// Xbox devices
	if (lowerType.startsWith("xbox")) {
		return RiComputerLine;
	}

	// Playstation devices
	if (lowerType.startsWith("playstation")) {
		return RiComputerLine;
	}

	// Default to computer icon
	return RiComputerLine;
};

const DeviceCard: FC<DeviceCardPropsType> = ({
	createdAt,
	currentDevice,
	deviceName,
	deviceType,
	isActive,
}) => {
	const Icon = getDeviceIcon(deviceType);

	return (
		<div
			className={cn("relative space-y-1 rounded-md border p-3", {
				"opacity-70": !isActive,
			})}
		>
			<div className="flex items-center gap-2">
				<Icon
					className={cn("size-5", {
						"text-primary": currentDevice,
					})}
				/>
				<div>
					<h3 className="font-medium">{deviceName}</h3>
					<p className="text-sm text-muted-foreground">{deviceType}</p>
				</div>
			</div>
			<time
				className="block text-sm text-muted-foreground"
				dateTime={createdAt}
			>
				{format(new Date(createdAt))}
			</time>
			{currentDevice ? (
				<span className="text-xs font-medium uppercase tracking-wide text-primary">
					This device
				</span>
			) : null}
			<Button
				size="sm"
				variant="destructive"
				disabled
				className="mt-2"
				aria-label={`Sign out ${deviceName}`}
			>
				Sign out device
			</Button>
		</div>
	);
};

const SessionList: FC = () => {
	const { fetchSessions } = useAccountActions();
	const [sessions, setSessions] = useState<SessionFormatedType[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		let active = true;

		const loadSessions = async () => {
			setLoading(true);

			try {
				const nextSessions = await fetchSessions();

				if (active) {
					setSessions(nextSessions);
				}
			} catch (error) {
				if (active) {
					showAuthError(error, "SessionError");
					setSessions([]);
				}
			} finally {
				if (active) {
					setLoading(false);
				}
			}
		};

		loadSessions();

		return () => {
			active = false;
		};
	}, [fetchSessions]);

	if (loading) {
		return (
			<div className="flex min-h-24 items-center justify-center">
				<RiLoader2Line className="size-7 animate-spin" />
			</div>
		);
	}

	if (sessions.length === 0) {
		return (
			<p className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
				No active sessions found.
			</p>
		);
	}

	return (
		<div className="space-y-2">
			{sessions.map((session) => (
				<DeviceCard {...session} key={session.id} />
			))}
		</div>
	);
};

export { SessionList };
