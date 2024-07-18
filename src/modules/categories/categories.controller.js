// files imports
import Category from '../../../DB/models/category.model.js';
import Tasks from '../../../DB/models/tasks.model.js';


//--------------- add category api--------------- //


export const addCategory = async (req, res, next) => {
    const { categoryType, name } = req.body;
    const { _id } = req.authUser;
    const isCategoryExist = await Category.findOne({ categoryType, owner: _id });
    if (isCategoryExist) {
        return next(new Error(`Category with type "${categoryType}" already exist`, { cause: 409 }));
    }
    if (categoryType !== 'To Do' && categoryType !== 'In Progress' && categoryType !== 'Done') {
        return next(new Error(`category type should be To Do ,In Progress or Done`, { cause: 400 }));
    }
    const newCategoryData = {
        categoryType,
        name,
        owner: _id
    };
    const newCategory = await Category.create(newCategoryData);
    if (!newCategory) {
        return next(new Error('Failed to create category', { cause: 500 }));
    }
    res.status(201).json({
        success: true,
        message: 'Category created successfully',
        data: newCategory
    });
}

// --------------- update category api --------------- //


export const updateCategory = async (req, res, next) => {
    const { newName } = req.body;
    const { categoryId } = req.params;
    const { _id } = req.authUser;
    const category = await Category.findOneAndUpdate({
        _id: categoryId,
        owner: _id
    }, {
        name: newName
    }, { new: true });
    if (!category) {
        return next(new Error('Category not found', { cause: 404 }));
    }
    res.status(200).json({
        success: true,
        message: 'Category updated successfully',
        data: category
    });

}

//--------------- delete category api--------------- //

export const deleteCategory = async (req, res, next) => {
    const { categoryId } = req.params;
    const { _id } = req.authUser;
    const category = await Category.findOneAndDelete({ _id: categoryId, owner: _id });
    const deleteRelatedTasks = await Tasks.deleteMany({ categoryId });
    if (!deleteRelatedTasks) {
        return next(new Error('Failed to delete related tasks', { cause: 500 }));
    }
    if (!category) {
        return next(new Error('Category not found', { cause: 404 }));
    }
    
    res.status(200).json({
        success: true,
        message: 'category deleted successfully',
        data: category
    });
}

// --------------- get all categories with related tasks for a specific user api --------------- //


export const getAllCategories = async (req, res, next) => {
    
    const { _id } = req.authUser;
    
    const allCategories = await Category.find({ owner: _id }).populate([{
        path: 'Tasks'
    }]);

    
    if (!allCategories.length) {
        return next(new Error('No categories found', { cause: 404 }));
    }
    
    res.status(200).json({
        success: true,
        message: 'categories fetched successfully',
        data: allCategories
    });
}

// --------------- get category name api--------------- //


export const getCategoryByName = async (req, res, next) => {
    const {name} = req.body;
    const findCategory = await Category.findOne({ name })

    if (!findCategory) {
        return next(new Error('category Not found', { cause: 404 }));
    }
    
    res.status(200).json({
        success: true,
        message: 'categories fetched successfully',
        data: findCategory
    });
}