import { promise, type z } from "zod";
import {
	errorResponse,
	type RequestResult,
	successResponse,
	userCredentialSchema,
	type ErrorResult,
	type UserCredentials,
} from "./types";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { tokenTable, usersTable } from "./db/schema";

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
	const parseResult = userCredentialSchema.safeParse(inputData);
	if (!parseResult.success) {
		// console.log(parseResult, "this is the parse result");
		return errorResponse("Incorrect inputs when logging in");
	}
	return successResponse();
}

// // Timer Promise
// export async function PromiseTime(ms: number): Promise<void> {
//     const new Promise<void>((resolve, reject) =>
//         await setTimeout(ms))
// }

export async function checkUserInDb(
	inputData: UserCredentials,
): Promise<
	{ userId: number; username: string; password: string }[] | ErrorResult
> {
	console.log("checking the user in DB", inputData.username);

	const lookupResults = await db
		.select()
		.from(usersTable)
		.where(eq(usersTable.username, inputData.username))
		.limit(1)
		.catch((e) => {
			return errorResponse(e);
		});

	console.log("HERES THE RESULTS", lookupResults);

	return lookupResults;
}

// token functions:
// export async function deleteToken(
// 	userToken: string,
// ): Promise<{ userId: number; tokenId: string }[]> {
// 	const deletedRow = await db
// 		.delete(tokenTable)
// 		.where(eq(tokenTable.tokenId, userToken))
// 		.returning();
// }
