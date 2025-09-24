require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const port = 3002;

//middleware
app.use(cors());
app.use(express.json());

const indexRoutes = require('./routes/v1/index');
app.use('/api/v1', indexRoutes);

app.get('/health', async(req, res)=> {
    console.log('health requested.', new Date());
    res.status(200).json({msg: `We good at ${new Date()}`});
});

//start up the express server
app.listen(port, () => {
    console.log(`server running on http://localhost:${port}`);
});