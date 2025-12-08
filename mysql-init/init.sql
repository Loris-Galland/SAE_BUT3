CREATE DATABASE IF NOT EXISTS nodered;

USE nodered;

CREATE TABLE IF NOT EXISTS mqtt_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    deviceId VARCHAR(50),
    temperature FLOAT,
    humidite FLOAT,
    fumee INT,
    date VARCHAR(20),
    heure VARCHAR(20),
    latitude FLOAT,
    longitude FLOAT,
    received_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
