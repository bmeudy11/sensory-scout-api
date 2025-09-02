require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

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

//create endpoint to get location and details
app.get('/api/locations/:id', async(req, res) => {
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

//start up the express server
app.listen(port, () => {
    console.log(`server running on http://localhost:${port}`);
});