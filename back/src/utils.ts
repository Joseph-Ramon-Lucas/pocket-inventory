import { promise, SafeParseError, type z } from "zod";
import {
	errorResponse,
	type RequestResult,
	type StuffDtoInterface,
	StuffDtoInterfaceSchema,
	successResponse,
	type UserCredentials,
	userCredentialSchema,
} from "./types";

// if parsing fails, will return a list of string error messages
export function parseError(zodError: z.ZodError): string[] {
	// extract form and field errors
	const { formErrors, fieldErrors } = zodError.flatten();
	// return a list
	return [
		// expand all from formErrors
		...formErrors,
		// expand and map all field errors to strings
		...Object.entries(fieldErrors).map(
			([property, message]) => `"${property}": ${message}`,
		),
	];
}

export function verifyCredentialLength(
	inputData: UserCredentials,
): RequestResult {
	const parseResult: z.SafeParseReturnType<UserCredentials, UserCredentials> =
		userCredentialSchema.safeParse(inputData);
	if (!parseResult.success) {
		const zodErrors: string = "".concat(...parseError(parseResult.error));
		console.log(zodErrors);
		return errorResponse(zodErrors);
	}
	return successResponse();
}

export function verifyStuffBodyInterface(
	inputData: StuffDtoInterface,
): RequestResult {
	const parseResult: z.SafeParseReturnType<
		StuffDtoInterface,
		StuffDtoInterface
	> = StuffDtoInterfaceSchema.safeParse(inputData);
	if (!parseResult.success) {
		const zodErrors: string = "".concat(...parseError(parseResult.error));
		console.log(zodErrors);

		return errorResponse(zodErrors);
	}
	return successResponse();
}

// // Timer Promise
// export async function PromiseTime(ms: number): Promise<void> {
//     const new Promise<void>((resolve, reject) =>
//         await setTimeout(ms))
// }
