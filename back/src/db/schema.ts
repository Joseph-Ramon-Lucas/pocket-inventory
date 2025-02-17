import {
	integer,
	pgTable,
	primaryKey,
	real,
	serial,
	text,
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
// Drizzle composite primary keys have a bug stopping them from working
