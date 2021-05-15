-- Create Customer Table
CREATE TABLE IF NOT EXISTS `customer` (
  `username` VARCHAR(255) NOT NULL,
  `first_name` VARCHAR(255) NOT NULL,
  `last_name` VARCHAR(255) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `address` VARCHAR(255) NOT NULL,
  PRIMARY KEY (username)
);

--Create Account Table 
CREATE TABLE IF NOT EXISTS `account` (
  `account_number` int  NOT NULL AUTO_INCREMENT,
  `account_name` VARCHAR(255) NOT NULL,
  `account_type` VARCHAR(255) NOT NULL,
  `balance`  FLOAT DEFAULT 0.00,
  `username` VARCHAR(255) NOT NULL,
  PRIMARY KEY (account_number),
  FOREIGN KEY (username) REFERENCES customer(username)
);

-- Customer Login
SELECT password FROM customer WHERE username = "paul";

-- Register Customer
INSERT INTO customer(username, last_name, first_name, password, address) 
VALUES ("Dehobo","Paul", "Smith", "1234", "1234 main st");

-- Create Account
INSERT INTO account(account_name, account_type, balance, username)
VALUES ('Checking', 'Checking', '10.00', (SELECT username FROM customer WHERE username = 'Dehobo'));

-- View Accounts
SELECT * FROM account WHERE username = "Dehobo";