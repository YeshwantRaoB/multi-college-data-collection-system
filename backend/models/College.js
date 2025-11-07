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
        required: false,  // Auto-calculated, not required on input
        min: 0,
        default: 0  // Default to 0, will be recalculated in pre-save hook
    },
    deputation: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    deputationToCollegeCode: {
        type: String,
        trim: true
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
    this.vacant = Math.max(0, (this.sanctioned || 0) - (this.working || 0) - (this.deputation || 0));
    next();
});

// Ensure vacant is recalculated when using findOneAndUpdate
collegeSchema.pre('findOneAndUpdate', async function(next) {
    try {
        const update = this.getUpdate() || {};
        const $set = update.$set || {};
        // Fetch current doc to compute final numbers
        const doc = await this.model.findOne(this.getQuery()).lean();
        if (!doc) return next();

        const sanctioned = ('sanctioned' in $set) ? Number($set.sanctioned) : Number(doc.sanctioned || 0);
        const working = ('working' in $set) ? Number($set.working) : Number(doc.working || 0);
        const deputation = ('deputation' in $set) ? Number($set.deputation) : Number(doc.deputation || 0);

        const computedVacant = Math.max(0, sanctioned - working - deputation);

        if (!update.$set) update.$set = {};
        update.$set.vacant = computedVacant;
        update.$set.lastUpdated = new Date();

        this.setUpdate(update);
        next();
    } catch (err) {
        next(err);
    }
});

module.exports = mongoose.model('College', collegeSchema);