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

    // Signin schema: validate incoming login requests
    exports.signinScheme = Joi.object({
        email: Joi.string().min(6).max(60).required().email(),
        password: Joi.string().min(8).required(),
    });

    // Reset password schema: validate old and new password
    exports.resetPasswordScheme = Joi.object({
        oldPassword: Joi.string().required(),
        newPassword: Joi.string()
            .required()
            .pattern(
                new RegExp(
                    '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$'
                )
            )
            .messages({
                'string.pattern.base': 'New password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character'
            }),
    });