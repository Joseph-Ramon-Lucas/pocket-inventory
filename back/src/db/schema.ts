import { serial, text } from "drizzle-orm/pg-core";
import { pgTable } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
	userId: serial("userid").primaryKey(),
	username: text("username").notNull(),
	password: text("password").notNull(),
});

export const stuffTable = pgTable("stuff", {
	itemId: serial("itemid").primaryKey(),
	itemName: text("itemname").notNull(),
	quantity: serial("quantity"),
	itemType: text("itemtype"),
	itemValue: text("itemvalue"),
	location: text("location"),
});
