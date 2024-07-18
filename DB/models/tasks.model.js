import { Schema, model } from 'mongoose';
import taskAccessSpecifiers from '../../src/utils/task.access-specifier.js';

const taskSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    TextBody:String,
    ListBody:[String],
    accessSpecifier: {
        type: String,
        enum: [taskAccessSpecifiers.PRIVATE, taskAccessSpecifiers.PUBLIC],
        default: taskAccessSpecifiers.PUBLIC
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    categoryId: {
        type: Schema.Types.ObjectId,
        ref: 'Category'
    }
}, { timestamps: true });

export default model('task', taskSchema);