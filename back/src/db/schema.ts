import { and, eq } from "drizzle-orm";
import {
	integer,
	pgTable,
	pgView,
	primaryKey,
	real,
	serial,
	text,
	uuid,
} from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
	userId: serial("userid").primaryKey(),
	username: text("username").notNull(),
	password: text("password").notNull(),
});

export const stuffTable = pgTable("stuff", {
	itemId: serial("itemid").primaryKey(),
	itemName: text("itemname").notNull(),
	quantity: integer("quantity"),
	itemType: text("itemtype"),
	itemValue: real("itemvalue"),
	location: text("location"),
});

export const usersOwnStuffTable = pgTable("usersownstuff", {
	ownerId: serial("ownerid")
		.notNull()
		.references(() => usersTable.userId),
	itemId: serial("itemid")
		.notNull()
		.references(() => stuffTable.itemId),
});

export const ownersView = pgView("ownersview").as((qb) =>
	qb
		.select()
		.from(usersOwnStuffTable)
		.fullJoin(usersTable, eq(usersTable.userId, usersOwnStuffTable.ownerId))
		.fullJoin(stuffTable, eq(stuffTable.itemId, usersOwnStuffTable.itemId)),
);
export const tokenTable = pgTable("tokens", {
	sessionId: uuid("sessionid").primaryKey().defaultRandom(),
	userId: integer("userid").references(() => usersTable.userId),
});
