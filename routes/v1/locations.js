const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

//import jwt middleware to validate token
const auth = require('../../middleware/auth');

const pool = require('../../utilities/pool');

router.get('/locations/:id', auth, async(req, res) => {
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
router.get('/locations', auth, async(req, res) => {
    try{
        const allLocations = await pool.query('SELECT * FROM locations ORDER BY name ASC');
        res.json(allLocations.rows);
    }catch(err){
        //send 500 and error message if failure
        console.error(err.message);
        res.status(500).send(`Server Error: ${err.message}`);
    }
});

module.exports = router;