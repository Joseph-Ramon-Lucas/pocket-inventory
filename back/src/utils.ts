import type { z } from "zod";
import {
	errorResponse,
	type RequestResult,
	type RequestResultBody,
	type StuffDtoInsert,
	StuffDtoInsertSchema,
	successResponse,
	successResponseBody,
	type UserCredentials,
	userCredentialSchema,
	type ValidUser,
	type ErrorResult,
} from "./types";
import { eq } from "drizzle-orm";
import { db } from "./db";

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
	const parseResult: z.SafeParseReturnType<UserCredentials, UserCredentials> =
		userCredentialSchema.safeParse(inputData);
	if (!parseResult.success) {
		const zodErrors: string = "".concat(...parseError(parseResult.error));
		console.log(zodErrors);
		return errorResponse(zodErrors);
	}
	return successResponse();
}

export function verifyStuffBodyInsert(
	inputData: StuffDtoInsert,
): RequestResult {
	const parseResult: z.SafeParseReturnType<StuffDtoInsert, StuffDtoInsert> =
		StuffDtoInsertSchema.safeParse(inputData);
	if (!parseResult.success) {
		const zodErrors: string = "".concat(...parseError(parseResult.error));
		console.log(zodErrors);

		return errorResponse(zodErrors);
	}
	return successResponse();
}

export async function verifyUsername(
	username: string,
): Promise<RequestResultBody<ValidUser[]>> {
	const validUser: ValidUser[] | null = await db
		.select({
			userId: usersTable.userId,
			username: usersTable.username,
		})
		.from(usersTable)
		.where(eq(usersTable.username, username))
		.limit(1);
	if (validUser.length < 1) {
		return errorResponse(`Can't find user ${username}`);
	}
	return successResponseBody(validUser);
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
	const lookupResults = await db
		.select()
		.from(usersTable)
		.where(eq(usersTable.username, inputData.username))
		.limit(1)
		.catch((e) => {
			return errorResponse(e);
		});
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
