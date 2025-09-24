const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const pool = require('../../utilities/pool');

router.post('/register', async(req, res) => {
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

router.post('/login', async(req, res) => {
    console.log('login body: ', req.body);
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

        //console.log('user: ', user);

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
        
        res.json({
            user: user.id, token});
    }catch(err){
        console.error(err.message);
        res.status(500).send(`Error: ${err.message}`);
    }
});

module.exports = router;