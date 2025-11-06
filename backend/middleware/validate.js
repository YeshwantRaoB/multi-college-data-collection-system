const Joi = require('joi');

const collegeCreateSchema = Joi.object({
    collegeCode: Joi.string().trim().required(),
    collegeName: Joi.string().trim().required(),
    district: Joi.string().trim().required(),
    taluk: Joi.string().trim().required(),
    designation: Joi.string().trim().required(),
    group: Joi.string().trim().required(),
    branch: Joi.string().trim().required(),
    sanctioned: Joi.number().integer().min(0).required(),
    working: Joi.number().integer().min(0).optional().default(0),
    deputation: Joi.number().integer().min(0).optional().default(0),
    deputationToCollegeCode: Joi.string().trim().allow('', null).optional(),
    remarks: Joi.string().trim().allow('', null).optional()
});

const collegeUpdateSchema = Joi.object({
    collegeName: Joi.string().trim().optional(),
    district: Joi.string().trim().optional(),
    taluk: Joi.string().trim().optional(),
    designation: Joi.string().trim().optional(),
    group: Joi.string().trim().optional(),
    branch: Joi.string().trim().optional(),
    sanctioned: Joi.number().integer().min(0).optional(),
    working: Joi.number().integer().min(0).optional(),
    deputation: Joi.number().integer().min(0).optional(),
    deputationToCollegeCode: Joi.string().trim().allow('', null).optional(),
    remarks: Joi.string().trim().allow('', null).optional()
}).min(1); // require at least one field when updating

function validateBody(schema) {
    return (req, res, next) => {
        const options = { abortEarly: false, stripUnknown: true, convert: true };
        const { error, value } = schema.validate(req.body, options);
        if (error) {
            return res.status(400).json({
                message: 'Validation error',
                details: error.details.map(d => ({ message: d.message, path: d.path }))
            });
        }
        req.body = value;
        next();
    };
}

module.exports = {
    validateBody,
    schemas: {
        collegeCreate: collegeCreateSchema,
        collegeUpdate: collegeUpdateSchema
    }
};
