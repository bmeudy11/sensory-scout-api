require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

//import jwt middleware to validate token
const auth = require('./middleware/auth');

//imports needed for JWT
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const port = 3002;

//middleware
app.use(cors());
app.use(express.json());

//configure DB connection
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

//create endpoint for registration
app.post('/api/auth/register', async(req, res) => {
    console.log(req.body);
    const { email, password } = req.body;

    //make sure email and password are not blank
    if(!email || !password){
        return res.status(400).json({ message: 'Please enter email and password.' });
    }

    try{
        //create a hash of the pwd
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        //insert new user into database
        const newUser = await pool.query(
            'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email', 
            [email, hash]
        );

        //user inserted successfully
        res.status(201).json({
            message: 'User created successfully.',
            user: newUser.rows[0],
        });

    }catch(err){
        console.error(err.message);
        res.status(500).send(`Error: ${err.message}`);
    }
});

//create endpoint to log in user and generate a JWT
app.post('/api/auth/login', async(req, res) => {
    const { email, password } = req.body;
    
    //confirm valid user
    try{
        //validate user
        const realUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        //was user record returned?
        if(realUser.rows.length === 0){
            return res.status(403).json({message: 'Invalid credentials.'});
        }

        //get reference to current user record
        const user = realUser.rows[0];

        //validate password hash
        const validPwd = await bcrypt.compare(password, user.password_hash);
        if(!validPwd){
            return res.status(401).json({message: 'Invalid credentials.'});
        }

        //valid pwd, create JWT
        const payload = {user: { id: user.id }};
        const token = jwt.sign(
            payload, 
            process.env.JWT_SECRET,
            {expiresIn: '1h'},   //set expiration date of token to 1 hour
        );
        
        res.json({token});
    }catch(err){
        console.error(err.message);
        res.status(500).send(`Error: ${err.message}`);
    }
});

//create endpoint to get location and avg reviews
app.get('/api/locations/:id', auth, async(req, res) => {
    const { id } = req.params;
    
    try{
        //get the location for this id
        const locationDetails = await pool.query('SELECT * FROM locations WHERE id = $1', [id]);

        //get the average ratings for the location
        const avgRatings = await pool.query(
            `SELECT AVG(noise_level) AS avg_Noise,
            AVG(light_level) AS avg_Light,
            AVG(crowd_level) AS avg_crowd
            FROM reviews WHERE location_id=$1`,
            [id]
        );

        res.json({
            details: locationDetails.rows[0],
            ratings: {
                noise: parseFloat(avgRatings.rows[0].avg_noise).toFixed(1),
                light: parseFloat(avgRatings.rows[0].avg_light).toFixed(1),
                crowd: parseFloat(avgRatings.rows[0].avg_crowd).toFixed(1),
            },
        });
    }catch(err){
        //send 500 and error message if failure
        console.error(err.message);
        res.status(500).send(`Server Error: ${err.message}`);
    }
});

//create endpoint to get location list
app.get('/api/locations', auth, async(req, res) => {
    try{
        const allLocations = await pool.query('SELECT * FROM locations ORDER BY name ASC');
        res.json(allLocations.rows);
    }catch(err){
        //send 500 and error message if failure
        console.error(err.message);
        res.status(500).send(`Server Error: ${err.message}`);
    }
});

//create endpoint to post reviews
app.post('/api/reviews', auth, async(req, res) =>{
    try{
        const {location_id, noise_level, light_level, crowd_level } = req.body;
        const newReview = await pool.query(
            'INSERT INTO reviews (location_id, noise_level, light_level, crowd_level) VALUES ($1, $2, $3, $4) RETURNING *',
            [location_id, noise_level, light_level, crowd_level]
        );
        res.status(201).json(newReview.rows[0]);
    }catch(err){
        console.error(err.message);
        res.status(500).send(`Server Error: ${err.message}`);
    }
});

//start up the express server
app.listen(port, () => {
    console.log(`server running on http://localhost:${port}`);
});