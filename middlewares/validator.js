const Joi = required('joi');

exports.signupScheme = Joi.object({
        email: Joi.string()
        .min(6)
        .max(60)
        .required()
        .email({
            tlds: {
                allow: ['com', 'net']
            },
            password: Joi.string()
            .require()
            .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$'))
            // .message()
        })
})