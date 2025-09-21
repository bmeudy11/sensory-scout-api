const axios = require('axios');

// The "Strategy" Interface (conceptual in JavaScript)
class ICaptchaStrategy {
    async verify(token) {
        throw new Error("Verify method not implemented.");
    }
}

// A "Concrete Strategy" for Google reCAPTCHA v2
class GoogleRecaptchaV2Strategy extends ICaptchaStrategy {
    async verify(token) {
        const response = await axios.post(
            `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_KEY}&response=${token}`
        );
        console.log('strategy response: ', response.data);
        return response.data;
    }
}

module.exports = { GoogleRecaptchaV2Strategy };
