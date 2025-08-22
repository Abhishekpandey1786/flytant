const mongoose = require('mongoose');

const CampaignSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    budget: {
        type: Number,
        required: true,
        min: 0
    },
    platforms: {
        type: [String],
        default: []
    },
    requiredNiche: {
        type: [String],
        default: []
    },
    cta: {
        type: String,
        trim: true
    },
    endDate: {
        type: Date,
        required: true
    },
    imagePath: {
        type: String
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    applicants: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            status: {
                type: String,
                enum: ['pending', 'accepted', 'rejected'],
                default: 'pending'
            },
            appliedAt: {
                type: Date,
                default: Date.now
            }
        }
    ]
});

module.exports = mongoose.model('Campaign', CampaignSchema);