require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const port = 3002;

app.use(cors());
app.use(express.json());



app.listen(port, () => {
    console.log(`server running on http://localhost:${port}`);
});