import { model, Schema } from 'mongoose';
import userStatus from '../../src/utils/user-status.js';
const userSchema = new Schema({
    firstName: {
        type: String,
        required: true,
        minlength: 3,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        minlength: 3,
        trim: true
    },
    userName: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    userStatus: {
        type: String,
        enum: [userStatus.ONLINE, userStatus.OFFLINE],
        default: userStatus.OFFLINE
    },
    userImg: {
        secure_url: { type: String },
        public_id: { type: String }
    },
    mediaFolderId: {
        type: String,
        trim: true
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    role:{
        type: String,
        default:'user'
    }
}, { timestamps: true });

export default model('user', userSchema);