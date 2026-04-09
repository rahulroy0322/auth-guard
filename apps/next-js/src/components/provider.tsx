"use client";
import { GuardProvider } from "@auth-guard/nextjs";
import type { FC, ReactNode } from "react";
import { ENV } from "@/config/env.config";

type MainProviderPropsType = {
	children: ReactNode;
};

const MainProvider: FC<MainProviderPropsType> = ({ children }) => (
	<GuardProvider
		config={{
			baseUrl: ENV.NEXT_PUBLIC_API_URL,
			images: {
				forgot: "https://cdn.undraw.co/illustration/forgot-password_nttj.svg",
				login: "https://cdn.undraw.co/illustration/login_weas.svg",
				register: "https://cdn.undraw.co/illustration/onboarding_dcq2.svg",
				reset: "https://cdn.undraw.co/illustration/forgot-password_nttj.svg",
				verify: "https://cdn.undraw.co/illustration/verify-data_k0y1.svg",
			},
		}}
		oauth={[
			{
				provider: "google",
			},
			{
				provider: "github",
			},
		]}
	>
		{children}
	</GuardProvider>
);

export default MainProvider;
