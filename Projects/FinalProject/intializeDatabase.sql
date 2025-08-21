CREATE DATABASE paymentapp;
USE paymentapp;

CREATE TABLE genGroups(
    groupID integer PRIMARY KEY AUTO_INCREMENT,
    group_name VARCHAR(255) NOT NULL,
    total_amount DECIMAL(10, 2),
    approval_status BOOLEAN DEFAULT FALSE,
    adminID INT,
    status ENUM('active', 'completed', 'archived') DEFAULT 'active'
);

CREATE TABLE Users(
    UID integer PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(255) NOT NULL,
    approval_status BOOLEAN DEFAULT FALSE,
    groupID INT,
    FOREIGN KEY (groupID) REFERENCES genGroups(groupID) ON DELETE SET NULL
);

CREATE TABLE NFCCards(
    id integer PRIMARY KEY AUTO_INCREMENT,
    nfcCardId VARCHAR(255) UNIQUE NOT NULL,
    groupID INT NOT NULL,
    cardNumber VARCHAR(16) NOT NULL,
    cvv VARCHAR(3) NOT NULL,
    expiryDate VARCHAR(5) NOT NULL,
    totalAmount DECIMAL(10, 2) NOT NULL,
    status ENUM('active', 'used', 'expired') DEFAULT 'active',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    usedAt DATETIME NULL,
    transactionId VARCHAR(255) NULL,
    FOREIGN KEY (groupID) REFERENCES genGroups(groupID) ON DELETE CASCADE
);