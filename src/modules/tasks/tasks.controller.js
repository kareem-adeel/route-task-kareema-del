import Tasks from '../../../DB/models/tasks.model.js';
import { paginationFunction } from '../../utils/pagination.js';

// --------------- add task api --------------- //


export const addTask = async (req, res, next) => {
    
    const {
        title,
        TextBody,
        ListBody,
        accessSpecifier
    } = req.body;

    const { categoryId } = req.query;

    
    const { _id } = req.authUser;
    
    const newTaskData = {
        title,
        TextBody,
        ListBody,
        categoryId,
        accessSpecifier,
        createdBy: _id
    };

    
    const newTask = await Tasks.create(newTaskData);

    
    if (!newTask) {
        return next(new Error('Failed to create task', { cause: 500 }));
    }

    
    res.status(201).json({
        success: true,
        message: 'Task created successfully',
        data: newTask
    });
}


// ---------------update task api--------------- //



export const updateTask = async (req, res, next) => {
    
    const {
        newTitle,
        newTextBody,
        newListBody,
        newAccessSpecifier
    } = req.body;

    const { taskId } = req.query;
    
    const { _id } = req.authUser;

    
    const updatedTask = await Tasks.findOneAndUpdate(
        { _id: taskId, createdBy: _id },
        {
            title: newTitle,
            TextBody: newTextBody,
            ListBody: newListBody,
            accessSpecifier: newAccessSpecifier
        },
        {new:true}
    );
    
    if(!updatedTask){
        return next(new Error(`task not found`,{cause:404}));
    }
    
    return res.status(200).json({
        success:true,
        message:"task updated successfully",
        data:updatedTask
    })
}

//--------------- delete task api---------------//



export const deleteTask = async (req, res, next) => {
    const { taskId } = req.query;
    const { _id } = req.authUser;
    const deletedTask = await Tasks.findOneAndDelete({ _id: taskId, createdBy: _id });
    if (!deletedTask) {
        return next(new Error('Failed to delete task', { cause: 404 }));
    }
    res.status(200).json({
        success: true,
        message: 'Task deleted successfully',
        data: deletedTask
    });
}

// --------------- get all public tasks api----------------- //



export const getAllPublicTasks = async (req, res, next) => {
    const {page,size} = req.query;
    const {limit,skip} = paginationFunction({page,size})
    const publicTasks = await Tasks.find({ accessSpecifier: 'public' }).limit(limit).skip(skip);
    if (!publicTasks.length) {
        return next(new Error('No tasks found', { cause: 404 }));
    }
    res.status(200).json({
        success: true,
        message: 'tasks fetched successfully',
        data: publicTasks
    });
}

//-------------------- get private tasks for the creator api------------------ //


export const getPrivateTasks = async (req, res, next) => {
    
    const { _id } = req.authUser;
    
    const privatTasks = await Tasks.find({
        accessSpecifier: 'private',
        createdBy: _id
    });
    
    if (!privatTasks.length) {
        return next(new Error('No tasks found', { cause: 404 }));
    }
    
    res.status(200).json({
        success: true,
        message: 'tasks fetched successfully',
        data: privatTasks
    });
}

