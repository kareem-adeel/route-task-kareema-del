import { Schema, model } from 'mongoose';
import { catType } from '../../src/utils/category-types.js';

const categorySchema = new Schema({
    categoryType: {
        type: String,
        required: true,
        enum:[catType.TODO,catType.INPROGRESS,catType.DONE],
        default:catType.TODO
    },
    name:String,
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true ,
    toJSON:{virtuals: true},
    toObject:{virtuals: true}

}
);


// virtual populate for tasks model
categorySchema.virtual('Tasks',{
    ref:'task',
    localField: '_id',
    foreignField: 'categoryId'
})

export default model('category', categorySchema);