const jwt = require('jsonwebtoken');

function auth(req, res, next){
    //find the token in the auth header in the req
    const token = req.header('Authorization')?.replace('Bearer ', '');

    //see if token exists, then validate
    if(!token){
        res.status(401).json({message: 'Invalid authentication (no token).'});
    }

    try{
        //decode jwt
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

        //add user to payload and pass on
        req.user = decodedToken.user;

        //move to next middleware
        next();
    }catch(err){
        console.log(`decode fail: ${err.message}`);
        res.status(401).json({message: 'Invalid authentication.'});
    }
}

module.exports = auth;