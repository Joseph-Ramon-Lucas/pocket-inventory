import { integer, primaryKey, real, serial, text } from "drizzle-orm/pg-core";
import { pgTable } from "drizzle-orm/pg-core";

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

// export const usersOwnStuffTable = pgTable(
// 	"usersOwnStuff",
// 	{
// 		ownerId: serial("ownerid").notNull(),
// 		itemId: serial("itemid").notNull(),
// 	},
// 	(table) => [primaryKey({ columns: [table.ownerId, table.itemId] })],
// );
// Drizzle composite primary keys have a bug stopping them from working
