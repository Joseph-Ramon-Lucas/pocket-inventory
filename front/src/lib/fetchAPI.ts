import { StuffDto, ValidUser } from "./types/db-types";
import { errorResponse, HTTPMethod, RequestResultBody, successResponseBody } from "./types/types";

export default function fetchAPI(route: string, verb: HTTPMethod, body?: any, authToken?: string): RequestResultBody<StuffDto[] | ValidUser> {
    if (!route || !verb) {
        return errorResponse("Route and verb are required parameters.");
    }

    try {
        fetch(route, {
            method: verb,
            headers: {
                ...(body && { "Content-Type": "application/json" }),
                ...(authToken && { Authorization: `Bearer ${authToken}` }),
            },
            body: body ? JSON.stringify(body) : undefined,
        }).then((response) => {
            response.json().then((data) => {
                if (!response.ok) {
                    console.error("Error:", data);
                    return errorResponse(data.errorMessage || "An error occurred fetching data.");
                } else {
                    console.log("Success:", data);
                    return successResponseBody(data);
                }
        })})
        return errorResponse("Fetch request was sent, but no response was received.");
    }catch (error) {
        console.error("Fetch error:", error);
        return errorResponse("An error occurred while fetching data.");
    }
    
}