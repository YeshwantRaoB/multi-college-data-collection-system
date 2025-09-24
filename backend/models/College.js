const mongoose = require('mongoose');

const collegeSchema = new mongoose.Schema({
    collegeCode: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    collegeName: {
        type: String,
        required: true,
        trim: true
    },
    district: {
        type: String,
        required: true,
        trim: true
    },
    taluk: {
        type: String,
        required: true,
        trim: true
    },
    designation: {
        type: String,
        required: true,
        trim: true
    },
    group: {
        type: String,
        required: true,
        trim: true
    },
    branch: {
        type: String,
        required: true,
        trim: true
    },
    sanctioned: {
        type: Number,
        required: true,
        min: 0
    },
    working: {
        type: Number,
        required: true,
        min: 0
    },
    vacant: {
        type: Number,
        required: true,
        min: 0
    },
    deputation: {
        type: Number,
        required: true,
        min: 0
    },
    remarks: {
        type: String,
        trim: true
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Calculate vacant positions before saving
collegeSchema.pre('save', function(next) {
    this.vacant = this.sanctioned - this.working;
    next();
});

module.exports = mongoose.model('College', collegeSchema);