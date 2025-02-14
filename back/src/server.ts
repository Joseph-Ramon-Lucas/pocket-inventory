import express, {
	type Express,
	type Request,
	type Response,
	json,
} from "express";
import bcrypt from "bcrypt";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { stuffTable, usersTable } from "./db/schema";
import {
	errorMessage,
	errorResponse,
	successResponse,
	successResponseBody,
	userCredentialSchema,
	type RequestResult,
	type UserCredentials,
	type StuffDto,
	StuffDtoSchema,
} from "./types";

// salts for password
const saltRounds = 10;

const app: Express = express();
const port = 3000;

//make every route public
app.use(express.static("public"));
//parse req.body in json
app.use(json());

function verifyCredentialLength(inputData: UserCredentials): RequestResult {
	const parseResult = userCredentialSchema.safeParse(inputData);
	if (!parseResult.success) {
		// console.log(parseResult, "this is the parse result");
		return errorResponse("Incorrect inputs when logging in");
	}
	return successResponse();
}

function verifyStuffBody(inputData: StuffDto): RequestResult {
	const parseResult = StuffDtoSchema.safeParse(inputData);
	if (!parseResult.success) {
		return errorResponse("Improper Stuff Body");
	}
	return successResponse();
}

app.get("/api/", (req: Request, res: Response) => {
	console.log("oi");

	return res.status(200).json({ welcomeText: "Welcome to the Inventory App" });
});
//user authentication
app.post("/api/account/register", async (req: Request, res: Response) => {
	// check if body is empty
	console.log("HERE IS THE REQ BODY", req.body);

	// if (Object.keys(req.body).length < 2) {
	// 	return res
	// 		.status(400)
	// 		.json({ error: "request body missing username and password fields" });
	// }

	// check if user input meets requirement
	const inputData: UserCredentials = req.body;
	const verifyCheck = verifyCredentialLength(inputData);

	if (!verifyCheck.success) {
		return res
			.status(400)
			.json(
				errorResponse(
					"Usernames must be between 3-25 char, and passwords 8-30 char",
				),
			);
	}

	console.log("reqbody:", req.body);

	const salt = bcrypt.genSaltSync(saltRounds);
	const hashWord = bcrypt.hashSync(inputData.password, saltRounds);

	console.log("hash", hashWord);

	try {
		// check if this user already exists
		const lookupResults = await db
			.select()
			.from(usersTable)
			.where(eq(usersTable.username, inputData.username))
			.limit(1)
			.catch((e) => {
				return res.status(500).json(errorResponse(e));
			});

		// determine it's an array to use length method
		if (Array.isArray(lookupResults) && lookupResults.length > 0) {
			return res
				.status(400)
				.json(
					errorResponse(`Username ${inputData.username} is already in use`),
				);
		}

		// store new user
		const insertResults = await db
			.insert(usersTable)
			.values({ username: inputData.username, password: hashWord })
			.returning({ userId: usersTable.userId })
			.catch((err) => {
				console.error(err);
				return res.status(500).json(errorResponse(err));
			});
		return res.status(201).json(successResponseBody(insertResults));
	} catch (e) {
		console.error(e);
		res.status(500).json(e);
		return;
	}
});

app.post("/api/account/login", async (req: Request, res: Response) => {
	// reject empty bodies
	if (Object.values(req.body).length < 1) {
		return res
			.status(400)
			.json(errorResponse("Cannot login with empty request body"));
	}

	const inputData: UserCredentials = req.body;
	const verifyCheck = verifyCredentialLength(inputData);

	if (!verifyCheck.success) {
		return res
			.status(400)
			.json(
				errorResponse(
					"Usernames must be between 3-25 char, and passwords 8-30 char",
				),
			);
	}

	// check if username exists
	try {
		await db
			.select()
			.from(usersTable)
			.where(eq(usersTable.username, inputData.username))
			.limit(1)
			.then(async (results) => {
				// username doesn't exist
				if (results.length < 1 || results == null) {
					return res
						.status(400)
						.json(
							errorResponse(`Username, ${inputData.username} doesn't exist!`),
						);
				}
				console.log("selection results=", results);
				const storedPassword: string = results[0].password;

				// compare hash & password
				const match = await bcrypt.compare(inputData.password, storedPassword);
				// wrong password --> don't tell them that for security

				if (!match) {
					return res
						.status(400)
						.json(errorResponse("Incorrect Username or Password"));
				}

				// authenticate user

				return res.status(200).send("it works!");
			})
			.catch((err) => {
				return res.status(500).json(err);
			});
	} catch (e) {
		console.error(e);

		res.status(500).json(e);
		return;
	}
});

app.get("/search", (req: Request, res: Response) => {
	const q = JSON.stringify(req.query.something);

	console.log(q);

	res.status(200);
	res.send(`searching for ${q}`);
});

// get all stuff in DB
app.get("/api/stuff", async (req: Request, res: Response) => {
	const username = req.body;
	console.log("username", username);

	try {
		const stuff = await db.select().from(stuffTable);
		if (stuff.length < 1 || stuff === null) {
			return res.status(404).json(errorResponse("Data not found"));
		}
		return res.status(200).json(successResponseBody(stuff));
	} catch (error) {
		console.error(error);
		return res.status(500).json(errorResponse(JSON.stringify(error)));
	}
});
// get specific item in DB
app.get("/api/stuff/:itemId", async (req: Request, res: Response) => {
	try {
		const itemId: number = Number.parseInt(req.params.itemId);
		const stuff = await db
			.select()
			.from(stuffTable)
			.where(eq(stuffTable.itemId, itemId))
			.limit(1);
		if (stuff.length < 1 || stuff === null) {
			return res.status(404).json(errorResponse("Data not found"));
		}
		return res.status(200).json(successResponseBody(stuff));
	} catch (error) {
		console.error(error);
		return res.status(500).json(errorResponse(JSON.stringify(error)));
	}
});

// add an item to DB
app.post("/api/stuff", async (req: Request, res: Response) => {
	try {
		const itemToAdd = req.body;
		console.log(itemToAdd);

		if (itemToAdd.length < 1 || itemToAdd.itemName === null) {
			return res
				.status(400)
				.json(errorResponse("Body missing itemId or itemName"));
		}
		// check for duplicate item Name
		const result = await db
			.select()
			.from(stuffTable)
			.where(eq(stuffTable.itemName, itemToAdd.itemName));

		console.log("RESULT:", result, "length:", result.length);
		if (result.length > 0) {
			return res
				.status(409)
				.json(errorResponse(`Item Name ${itemToAdd.itemName} already exists`));
		}
		// insert into db
		await db.insert(stuffTable).values(itemToAdd);
		return res.status(201).json(successResponse);
	} catch (error) {
		console.error(error);
		return res.status(500).json(errorResponse(JSON.stringify(error)));
	}
});

// delete item in db
app.delete("/api/stuff/:itemId", async (req: Request, res: Response) => {
	try {
		const itemToDelete: number = Number.parseInt(req.params.itemId);
		const result = await db
			.delete(stuffTable)
			.where(eq(stuffTable.itemId, itemToDelete))
			.returning();
		if (result.length < 1) {
			return res
				.status(404)
				.json(errorResponse(`Cannot find item id ${itemToDelete} to delete`));
		}
		return res.status(204).json(successResponse());
	} catch (error) {
		console.error(error);
		return res.status(500).json(errorResponse(JSON.stringify(error)));
	}
});

app.listen(port, () => {
	console.log(`[server]: Server is running at http://localhost:${port}`);
});
