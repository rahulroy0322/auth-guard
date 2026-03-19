import { compare, hash } from "bcrypt";

const hashPassword = (data: string) => hash(data, 10);

const validPassword = ({ current, hash }: { hash: string; current: string }) =>
	compare(current, hash);

export { hashPassword, validPassword };
