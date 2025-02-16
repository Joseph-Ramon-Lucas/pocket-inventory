import { number, z, ZodObject } from "zod";

export const userCredentialSchema = z.object({
	username: z.string().min(3).max(25),
	password: z.string().min(8).max(30),
});

export const StuffDtoSchema = z.object({
	itemId: z.number().positive(),
	itemName: z.string().nonempty(),
	quantity: z.number().positive().nullable(),
	itemType: z.string().nullable(),
	itemValue: z.number().multipleOf(0.01).nullable(),
	location: z.string().nullable(),
});
export const StuffDtoInterfaceSchema = z.object({
	itemName: z.string().nonempty(),
	quantity: z.number().positive().nullable(),
	itemType: z.string().nullable(),
	itemValue: z.number().multipleOf(0.01).nullable(),
	location: z.string().nullable(),
});

export type UserCredentials = z.infer<typeof userCredentialSchema>;
export type StuffDto = z.infer<typeof StuffDtoSchema>;
export type StuffDtoInterface = z.infer<typeof StuffDtoInterfaceSchema>;

export type errorMessage = string;

export type SuccessResult = { success: true };
export type ErrorResult = { success: false; errorMessage: string };
export type RequestResult = SuccessResult | ErrorResult;
export type RequestResultBody<B> = (SuccessResult & B) | ErrorResult;

export function successResponse(): SuccessResult {
	return { success: true };
}

export function errorResponse(errorReason: string): ErrorResult {
	return { success: false, errorMessage: errorReason };
}

export function successResponseBody<B>(reqBody: B): RequestResultBody<B> {
	return { success: true, ...reqBody };
}
