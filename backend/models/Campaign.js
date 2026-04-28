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

    // --- 🔥 APPROVAL SYSTEM FIELDS (IMPORTANT) ---
    approvalStatus: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending' // Default pending rahega jab brand create karega
    },
    isActive: {
        type: Boolean,
        default: false // Jab admin approve karega, tabhi true hoga
    },
    // ----------------------------------------------

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