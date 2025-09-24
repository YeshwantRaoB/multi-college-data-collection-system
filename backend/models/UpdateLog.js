const mongoose = require('mongoose');

const updateLogSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    collegeCode: {
        type: String,
        required: true
    },
    fieldChanged: {
        type: String,
        required: true
    },
    oldValue: {
        type: String,
        required: true
    },
    newValue: {
        type: String,
        required: true
    },
    ipAddress: {
        type: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('UpdateLog', updateLogSchema);