CREATE TABLE `brand` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  PRIMARY KEY (`id`)
); 
INSERT INTO `brand` VALUES (1,'Lenova'),(2,'ASUS');

CREATE TABLE `category` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  PRIMARY KEY (`id`)
);
INSERT INTO `category` VALUES (1,'Komputer'),(2,'Proqram');

CREATE TABLE `contract` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `number` varchar(20) NOT NULL,
  `date` date NOT NULL,
  `type` varchar(200) NOT NULL,
  `company_name` varchar(200) NOT NULL,
  `comment` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id`)
);
INSERT INTO `contract` VALUES (1,'Proqam satışı','123','2020-12-23','Satış','Firs Soft','');

CREATE TABLE `kontragent` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `phone_number` varchar(50) NOT NULL,
  `tin` varchar(200) NOT NULL,
  `address` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id`)
);
INSERT INTO `kontragent` VALUES (2,'Proqam satışı','0551234567','voen','Baku');

CREATE TABLE `orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `date` DATE,
  `amount` decimal(10,0) NOT NULL,
  PRIMARY KEY (`id`)
);
INSERT INTO `orders` VALUES (1,'2023-12-26',800);

CREATE TABLE `price` (
  `id` int NOT NULL AUTO_INCREMENT,
  `price` decimal(10,0) NOT NULL,
  `date` DATE,
  PRIMARY KEY (`id`)
);
INSERT INTO `price` VALUES (1,2000,'2023-12-26'),(2,2500,'2023-12-26');

CREATE TABLE `routes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `date` datetime NOT NULL,
  `address` varchar(500) NOT NULL,
  PRIMARY KEY (`id`)
);
INSERT INTO `routes` VALUES (1,'2020-12-23','Baku');

CREATE TABLE `casse_orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `kontragentId` int DEFAULT NULL,
  `amount` decimal(10,0) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `kontragentId` (`kontragentId`),
  CONSTRAINT `casse_orders_ibfk_1` FOREIGN KEY (`kontragentId`) REFERENCES `kontragent` (`id`)
);
INSERT INTO `casse_orders` VALUES (1,'2023-12-26',2,2000);

CREATE TABLE `documents` (
  `id` int NOT NULL AUTO_INCREMENT,
  `type` varchar(20) NOT NULL,
  `name` varchar(100) NOT NULL,
  `nomenklaturaId` int DEFAULT NULL,
  `quanity` int NOT NULL,
  `price` decimal(10,0) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `nomenklaturaId` (`nomenklaturaId`),
);
INSERT INTO `documents` VALUES (1,'Satış','Komputer satışı',1,2,2000);


CREATE TABLE `nomenklatura` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `type` varchar(200) NOT NULL,
  `categoryId` int DEFAULT NULL,
  `brandId` int DEFAULT NULL,
  `priceId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `categoryId` (`categoryId`),
  KEY `brandId` (`brandId`),
  KEY `priceId` (`priceId`),
  CONSTRAINT `nomenklatura_ibfk_1` FOREIGN KEY (`categoryId`) REFERENCES `category` (`id`),
  CONSTRAINT `nomenklatura_ibfk_2` FOREIGN KEY (`brandId`) REFERENCES `brand` (`id`),
  CONSTRAINT `nomenklatura_ibfk_3` FOREIGN KEY (`priceId`) REFERENCES `price` (`id`)
);
INSERT INTO `nomenklatura` VALUES (1,'Proqram satışı','Satış',2,1,2),(2,'Komputer satışı','Alış',1,2,1);


CREATE TABLE `invoice` (
  `id` int NOT NULL AUTO_INCREMENT,
  `date` date NOT NULL,
  `number` varchar(255) NOT NULL,
  `customer` varchar(255) NOT NULL,
  CONSTRAINT `documents_ibfk_1` FOREIGN KEY (`nomenklaturaId`) REFERENCES `nomenklatura` (`id`)
  `product_name` varchar(255) NOT NULL DEFAULT '',
  `quantity` int NOT NULL,
  `price` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`)
);
INSERT INTO `invoice` VALUES (1,'2024-01-18','3','Me','Computer',2,2000.00);
