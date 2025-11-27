const Joi = require('joi');

exports.signupScheme = Joi.object({
    email: Joi.string()
        .min(6)
        .max(60)
        .required()
        .email(),
    password: Joi.string()
        .required()
        .pattern(
            new RegExp(
                '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$'
            )
        ),
});