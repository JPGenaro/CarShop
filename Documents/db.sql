CREATE DATABASE IF NOT EXISTS carshop_db;
USE carshop_db;

CREATE TABLE Address (
    id_address INT AUTO_INCREMENT PRIMARY KEY,
    province VARCHAR(100) NOT NULL,
    location VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    logish1 VARCHAR(255) NOT NULL,
    order_possible BOOLEAN DEFAULT TRUE,
    code VARCHAR(20)
);

CREATE TABLE Document (
    id_document INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(255),
    number VARCHAR(50) NOT NULL
);

CREATE TABLE PaymentMethod (
    id_paymentMethod INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    description VARCHAR(255)
);

CREATE TABLE Category (
    id_category INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    description VARCHAR(255)
);

CREATE TABLE Product (
    id_product INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    choice INT NOT NULL,
    category_id INT NOT NULL,
    FOREIGN KEY (category_id) REFERENCES Category(id_category)
);

CREATE TABLE User (
    id_user INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    surname VARCHAR(100) NOT NULL,
    name_user VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    birth_date DATE NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    address_id INT NOT NULL,
    document_id INT NOT NULL,
    FOREIGN KEY (address_id) REFERENCES Address(id_address),
    FOREIGN KEY (document_id) REFERENCES Document(id_document)
);

CREATE TABLE `Order` (
    id_order INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(255),
    force_date DATE NOT NULL,
    user_id INT NOT NULL,
    paymentMethod_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES User(id_user),
    FOREIGN KEY (paymentMethod_id) REFERENCES PaymentMethod(id_paymentMethod)
);

CREATE TABLE OrderProduct (
    id_orderProduct INT AUTO_INCREMENT PRIMARY KEY,
    precio_final DECIMAL(10,2) NOT NULL,
    cantidad_final INT NOT NULL,
    product_id INT NOT NULL,
    order_id INT NOT NULL,
    FOREIGN KEY (product_id) REFERENCES Product(id_product),
    FOREIGN KEY (order_id) REFERENCES `Order`(id_order)
);