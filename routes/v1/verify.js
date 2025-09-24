require('dotenv').config();
const express = require('express');
const router = express.Router();

//strategy for recaptcha
const { GoogleRecaptchaV2Strategy } = require('../../interfaces/recaptchaStrategies');

router.post('/verify', async(req, res) =>{
    const { captchaValue } = req.body;
    console.log('captchaValue: ', captchaValue);

    //instantiate reCaptcha strategy
    const captchaVerifier = new GoogleRecaptchaV2Strategy();

    try{
        //use strategy to validate token
        const isCaptchaValid = await captchaVerifier.verify(captchaValue);
        console.log('isCaptchValid: ', isCaptchaValid);

        if (!isCaptchaValid) {
            return res.status(400).json({ msg: 'CAPTCHA verification failed.' });
        }

        return res.status(200).json({isCaptchaValid});

    }catch(err){
        console.log('strategy error: ', err);
        return res.status(400).json({ msg: 'CAPTCHA verification failed.' });
    }
});

module.exports = router;