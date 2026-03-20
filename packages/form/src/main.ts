import { createFormHook, createFormHookContexts } from "@tanstack/react-form";
import { FormInput } from "./ui/input";
import { FormPasswordInput } from "./ui/password";

const { fieldContext, formContext, useFieldContext } = createFormHookContexts();

const { useAppForm } = createFormHook({
	fieldComponents: {
		Input: FormInput,
		Password: FormPasswordInput,
	},
	formComponents: {},
	fieldContext,
	formContext,
});

export { useAppForm, useFieldContext };
