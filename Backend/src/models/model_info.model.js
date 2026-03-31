import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema(
    {
        ModelName: {
            type: String,
            required: true,
        },
        Won: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

const chatModel = mongoose.model('Chat', chatSchema);

export default chatModel;