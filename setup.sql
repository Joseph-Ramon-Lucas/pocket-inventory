DROP DATABASE IF EXISTS InventoryDb;

CREATE DATABASE InventoryDb;

\c inventorydb;

CREATE TABLE users (
    userId INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    username TEXT NOT NULL,
    password TEXT NOT NULL
);

CREATE TABLE tokens (
    tokenId UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    userId INT NOT NULL,
    FOREIGN KEY (userId) REFERENCES users(userId)

);



CREATE TABLE stuff (
    itemId INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    itemName VARCHAR(128) NOT NULL,
    quantity FLOAT,
    itemType TEXT,
    itemValue FLOAT,
    location TEXT
);

CREATE TABLE usersOwnStuff(
    ownerId INT NOT NULL,
    itemId INT NOT NULL,
    CONSTRAINT PK_userOwnsStuff PRIMARY KEY (
        ownerId,
        itemId
    ),
    FOREIGN KEY (ownerId) REFERENCES users(userId),
    FOREIGN KEY (itemId) REFERENCES stuff(itemId)
);

insert into users (username, password) values('joe', '1234');
insert into stuff (itemName, quantity, itemType, itemValue, location) values('phone', 1, 'electronics', 1300.99, 'with me');
insert into stuff (itemName) values('watch');
insert into stuff (itemName, quantity, itemType, itemValue, location) values('eggs', 12, 'food', 3, 'joe fridge');
insert into stuff (itemName, quantity, itemType, itemValue, location) values('chicken breast', 4, 'food', 3, 'johanna fridge');
insert into usersOwnStuff(ownerId, itemId) values(1, 1);
insert into usersOwnStuff(ownerId, itemId) values(1, 2);

insert into users (username, password) values('johanna', 'jojo4');
insert into usersOwnStuff(ownerId, itemId) values(2, 3);
insert into usersOwnStuff(ownerId, itemId) values(1, 3);
insert into usersOwnStuff(ownerId, itemId) values(1, 4);


-- select username,itemname from usersOwnStuff join users on users.userId = ownerid join stuff on stuff.itemId=usersOwnStuff.itemId;


-- select * from stuff join usersownstuff on usersownstuff.itemid = stuff.itemid join users on users.userid =usersownstuff.ownerid where users.username='joe';