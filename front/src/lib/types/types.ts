import { StuffDto, ValidUser } from "./db-types";

export type errorMessage = string;
export type SuccessResult = { success: true };
export type ErrorResult = { success: false; errorMessage: string };
export type RequestResult = SuccessResult | ErrorResult;
export type RequestResultBody<B> = (SuccessResult & {body: B}) | ErrorResult;

export function successResponse(): SuccessResult {
    return { success: true };
}

export function errorResponse(errorReason: string): ErrorResult {
    return { success: false, errorMessage: errorReason };
}

export function successResponseBody<B>(reqBody: B): RequestResultBody<B> {
    return { success: true, body: reqBody };
}


export type HTTPMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "OPTIONS" | "HEAD"; 



