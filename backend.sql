--create locations table to store information about location
CREATE TABLE locations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT
);

--create reviews table to store individual reviews
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    location_id INTEGER REFERENCES locations(id),
    noise_level INTEGER NOT NULL,
    light_level INTEGER NOT NULL,
    crowd_level INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

--initial entries for prototype
INSERT INTO locations (name, address) VALUES ('Amen Street Fish and Raw Bar', '205 E. Bay Street, Charleston, SC 29401');
INSERT INTO reviews (location_id, noise_level, light_level, crowd_level) VALUES (1, 2, 3, 2);
INSERT INTO reviews (location_id, noise_level, light_level, crowd_level) VALUES (1, 1, 3, 1);
