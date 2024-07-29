import express, {
	type Express,
	type Request,
	type Response,
	json,
} from "express";
import bcrypt from "bcrypt";
import { db } from "./db";
import { and, eq } from "drizzle-orm";
import {
	ownersView,
	stuffTable,
	usersOwnStuffTable,
	usersTable,
	tokenTable,
} from "./db/schema";

import {
	errorResponse,
	successResponse,
	successResponseBody,
	type RequestResult,
	type UserCredentials,
	type StuffDto,
	type StuffDtoInsert,
	type RequestResultBody,
	type ValidUser,
	StuffDtoInsertSchema,
} from "./types";
import {
	verifyCredentialLength,
	verifyStuffBodyInsert,
	verifyUsername,
} from "./utils";
import { isValid, z } from "zod";
import { checkUserInDb } from "./utils";
import { uuid } from "drizzle-orm/pg-core";

// salts for password
const saltRounds = 10;

const app: Express = express();
const port = 3000;

//make every route public
app.use(express.static("public"));
//parse req.body in json
app.use(json());

app.get("/api/", (req: Request, res: Response) => {
	console.log("oi");

	return res.status(200).json({ welcomeText: "Welcome to the Inventory App" });
});
//user authentication
app.post("/api/account/register", async (req: Request, res: Response) => {
	// check if body is empty
	console.log("HERE IS THE REQ BODY", req.body);

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
		const lookupResults = await checkUserInDb(inputData).catch((e) => {
			console.error("issue fetching user from db", e);
			return res.status(500).json(e);
		});

		console.log(lookupResults, "LOOKUP");

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
		const lookupResults = await checkUserInDb(inputData).catch((e) => {
			console.error("issue fetching user from db", e);
			return res.status(500).json(e);
		});

		// if username doesn't exist
		if (Array.isArray(lookupResults) && lookupResults.length < 1) {
			return res
				.status(400)
				.json(errorResponse(`Username, ${inputData.username} doesn't exist!`));
		}
		if (Array.isArray(lookupResults) && lookupResults.length > 0) {
			console.log("selection results=", lookupResults);
			const storedPassword: string = lookupResults[0].password;
			// compare hash & password
			const match = await bcrypt.compare(inputData.password, storedPassword);
			// wrong password --> don't tell them that for security

			if (!match) {
				return res
					.status(400)
					.json(errorResponse("Incorrect Username or Password"));
			}

			// authenticate user
			// token table
			await db
				.insert(tokenTable)
				.values({
					userId: lookupResults[0].userId,
				})
				.catch((e) => {
					console.error("issue fetching user from db", e);
					return res.status(500).json(e);
				});
			return res.status(200).send("it works!");
		}
	} catch (e) {
		console.error(e);

		res.status(500).json(e);
		return;
	}
});

// reauthenticate when logged in
app.post("/api/auth", async (req: Request, res: Response) => {});

app.get("/search", (req: Request, res: Response) => {
	const q = JSON.stringify(req.query.something);

	console.log(q);

	res.status(200);
	res.send(`searching for ${q}`);
});

// get all stuff in DB
app.get("/api/stuff", async (req: Request, res: Response) => {
	try {
		const username: string = req.query.username as string;
		console.log("username", username);

		if (!username) {
			return res
				.status(400)
				.json(errorResponse("Must provide a username as a query"));
		}
		// validate
		const validUser: RequestResultBody<ValidUser[]> =
			await verifyUsername(username);
		if (!validUser.success) {
			return res.status(404).json(errorResponse(validUser.errorMessage));
		}

		const stuff: StuffDto[] = (await db
			.select({
				itemId: stuffTable.itemId,
				itemName: stuffTable.itemName,
				quantity: stuffTable.quantity,
				itemType: stuffTable.itemType,
				itemValue: stuffTable.itemValue,
				location: stuffTable.location,
			})
			.from(usersOwnStuffTable)
			.innerJoin(usersTable, eq(usersTable.userId, usersOwnStuffTable.ownerId))
			.innerJoin(stuffTable, eq(stuffTable.itemId, usersOwnStuffTable.itemId))
			.where(eq(usersTable.username, username))) as StuffDto[];

		if (stuff.length < 1) {
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
		const username: string = req.query.username as string;
		const itemIdToGet: number = Number.parseInt(req.params.itemId);
		console.log("username", username);

		if (!username) {
			return res
				.status(400)
				.json(errorResponse("Must provide a username as a query"));
		}
		if (!itemIdToGet) {
			return res
				.status(400)
				.json(errorResponse("Must provide an itemId as parameter to the url"));
		}

		// validate
		const validUser: RequestResultBody<ValidUser[]> =
			await verifyUsername(username);
		if (!validUser.success) {
			return res.status(404).json(errorResponse(validUser.errorMessage));
		}

		const stuff: StuffDto[] = (await db
			.select({
				itemId: stuffTable.itemId,
				itemName: stuffTable.itemName,
				quantity: stuffTable.quantity,
				itemType: stuffTable.itemType,
				itemValue: stuffTable.itemValue,
				location: stuffTable.location,
			})
			.from(usersOwnStuffTable)
			.innerJoin(usersTable, eq(usersTable.userId, usersOwnStuffTable.ownerId))
			.innerJoin(stuffTable, eq(stuffTable.itemId, usersOwnStuffTable.itemId))
			.where(
				and(
					eq(usersTable.username, username),
					eq(stuffTable.itemId, itemIdToGet),
				),
			)
			.limit(1)) as StuffDto[];
		if (stuff.length < 1) {
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
		const username: string = req.query.username as string;
		const idIdToAdd: StuffDtoInsert = req.body;
		console.log("username", username);
		console.log(idIdToAdd);

		if (!username) {
			return res
				.status(400)
				.json(errorResponse("Must provide a username as a query"));
		}
		if (idIdToAdd.itemName === null) {
			return res.status(400).json(errorResponse("Body missing itemName"));
		}

		// validate
		const validUser: RequestResultBody<ValidUser[]> =
			await verifyUsername(username);
		if (!validUser.success) {
			return res.status(404).json(errorResponse(validUser.errorMessage));
		}
		const verifyCheck: RequestResult = verifyStuffBodyInsert(idIdToAdd);
		if (!verifyCheck.success) {
			return res
				.status(400)
				.json(errorResponse(JSON.stringify(verifyCheck.errorMessage)));
		}
		// check for duplicate item Name
		const dupCheck: {
			itemId: number | null;
		}[] = await db
			.select({
				itemId: usersOwnStuffTable.itemId,
			})
			.from(stuffTable)
			.innerJoin(
				usersOwnStuffTable,
				eq(stuffTable.itemId, usersOwnStuffTable.itemId),
			)
			.where(
				and(
					eq(usersOwnStuffTable.ownerId, validUser[0].userId),
					eq(stuffTable.itemName, idIdToAdd.itemName),
				),
			);

		console.log("RESULT:", dupCheck, "length:", dupCheck.length);
		if (dupCheck.length > 0) {
			return res
				.status(409)
				.json(errorResponse(`Item Name ${idIdToAdd.itemName} already exists`));
		}

		// insert item into db
		const insertedItem: StuffDto[] = await db
			.insert(stuffTable)
			.values(idIdToAdd)
			.returning();
		console.log("INSERTED", insertedItem);
		const junctionToInsert: { ownerId: number; itemId: number } = {
			ownerId: validUser[0].userId,
			itemId: insertedItem[0].itemId,
		};

		// update junction table with new item
		await db.insert(usersOwnStuffTable).values(junctionToInsert);

		return res.status(201).json(successResponse());
	} catch (error) {
		console.error(error);
		return res.status(500).json(errorResponse(JSON.stringify(error)));
	}
});

// delete item in db
app.delete("/api/stuff/:itemId", async (req: Request, res: Response) => {
	try {
		const username: string = req.query.username as string;
		const itemIdToDelete: number = Number.parseInt(req.params.itemId);

		console.log("username", username);
		if (!username) {
			return res
				.status(400)
				.json(errorResponse("Must provide a username as a query"));
		}
		if (!itemIdToDelete) {
			return res
				.status(400)
				.json(errorResponse("Must provide an itemId as parameter to the url"));
		}
		// validate
		const validUser: RequestResultBody<ValidUser[]> =
			await verifyUsername(username);
		if (!validUser.success) {
			return res.status(404).json(errorResponse(validUser.errorMessage));
		}

		//remove from junction
		await db
			.delete(usersOwnStuffTable)
			.where(
				and(
					eq(usersOwnStuffTable.itemId, itemIdToDelete),
					eq(usersOwnStuffTable.ownerId, validUser[0].userId),
				),
			);
		//remove from stuff
		const result: StuffDto[] = await db
			.delete(stuffTable)
			.where(eq(stuffTable.itemId, itemIdToDelete))
			.returning();
		if (result.length < 1) {
			return res
				.status(404)
				.json(errorResponse(`Cannot find item id ${itemIdToDelete} to delete`));
		}
		return res.status(204).json(successResponse());
	} catch (error) {
		console.error(error);
		return res.status(500).json(errorResponse(JSON.stringify(error)));
	}
});

// edit whole item
app.put("/api/stuff/:itemId", async (req: Request, res: Response) => {
	try {
		const username: string = req.query.username as string;
		const itemIdToEdit: number = Number.parseInt(req.params.itemId);

		console.log("username", username);
		if (!username) {
			return res
				.status(400)
				.json(errorResponse("Must provide a username as a query"));
		}
		if (!itemIdToEdit) {
			return res
				.status(400)
				.json(errorResponse("Must provide an itemId as parameter to the url"));
		}
		// validation
		const validUser: RequestResultBody<ValidUser[]> =
			await verifyUsername(username);
		if (!validUser.success) {
			return res.status(404).json(errorResponse(validUser.errorMessage));
		}
		const verifyCheck: RequestResult = verifyStuffBodyInsert(req.body);
		if (!verifyCheck.success) {
			return res
				.status(400)
				.json(errorResponse(JSON.stringify(verifyCheck.errorMessage)));
		}

		const result: StuffDto[] = await db
			.update(stuffTable)
			.set(req.body)
			.from(usersOwnStuffTable)
			.innerJoin(usersTable, eq(usersOwnStuffTable.ownerId, usersTable.userId))
			.where(
				and(
					eq(usersOwnStuffTable.itemId, stuffTable.itemId),
					eq(usersTable.username, username),
					eq(stuffTable.itemId, itemIdToEdit),
				),
			)
			.returning({
				itemId: stuffTable.itemId,
				itemName: stuffTable.itemName,
				quantity: stuffTable.quantity,
				itemType: stuffTable.itemType,
				itemValue: stuffTable.itemValue,
				location: stuffTable.location,
			});

		if (result.length < 1) {
			return res.status(404).json(errorResponse("Data not found"));
		}
		return res.status(201).json(successResponseBody(result));
	} catch (error) {
		console.error(error);
		return res.status(500).json(errorResponse(JSON.stringify(error)));
	}
});

app.listen(port, () => {
	console.log(`[server]: Server is running at http://localhost:${port}`);
});
