const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

//import jwt middleware to validate token
const auth = require('../../middleware/auth');

const pool = require('../../utilities/pool');

router.post('/reviews', auth, async(req, res) =>{
    try{
        const {location_id, noise_level, light_level, crowd_level, user_id } = req.body;

        const newReview = await pool.query(
            `INSERT INTO reviews (location_id, noise_level, light_level, crowd_level, user_id 
            ) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [location_id, noise_level, light_level, crowd_level, user_id]
        );
        res.status(201).json(newReview.rows[0]);
    }catch(err){
        console.error(err.message);
        res.status(500).send(`Server Error: ${err.message}`);
    }
});


module.exports = router;