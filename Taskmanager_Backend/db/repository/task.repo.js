const {Task, User} = require('../model');

const createTask = async (taskData) => {
    try {
        const task = await Task.create(taskData);
        return task;
    } catch (error) {
        throw new Error('Error creating task: ' + error.message);
    }
}

const updateTask = async (taskId, taskData) => {
    try {
        await Task.findByIdAndUpdate(taskId, taskData)
        const result = await Task.findById(taskId);
        return result;
    } catch (error) {
        throw new Error('Error updating task: ' + error.message);
    }
}

const findOneTask = async (query) => {
    try {
        const task = await Task.findOne(query);
        return task;
    } catch (error) {
        throw new Error('Error finding task: ' + error.message);
    }
}

const getOwnerTasks = async (ownerId, filters = {}) => {
    try {
        const query = { owner: ownerId, ...filters };
        const tasks = await Task.find(query);
        return tasks;
    } catch (error) {
        throw new Error('Error fetching tasks: ' + error.message);
    }
}

const getTasksByCategory = async (ownerId, category) => {
    try {
        const tasks = await Task.find({ 
            owner: ownerId,
            category: category 
        });
        return tasks;
    } catch (error) {
        throw new Error('Error fetching tasks by category: ' + error.message);
    }
}

const getTasksByStatus = async (ownerId, status) => {
    try {
        if (!ownerId || ownerId === 'null') {
            return [];
        }
        const tasks = await Task.find({
            owner: ownerId,
            status: status
        });
        return tasks;
    } catch (error) {
        throw new Error('Error fetching tasks by status: ' + error.message);
    }
}

const deleteTask = async (taskId) => {
    try {
        const result = await Task.findByIdAndDelete(taskId);
        return result;
    } catch (error) {
        throw new Error('Error deleting task: ' + error.message);
    }
}

const getTasksByDueDate = async (ownerId, startDate, endDate) => {
    try {
        const query = {
            owner: ownerId,
            dueDate: {
                $gte: startDate,
                $lte: endDate
            }
        };
        const tasks = await Task.find(query).sort({ dueDate: 1 });
        return tasks;
    } catch (error) {
        throw new Error('Error fetching tasks by due date: ' + error.message);
    }
}
// Tri alphabétique des tâches
const getTasksSortedByTitle = async (ownerId, order, { page = 1, limit = 20 } = {}) => {
    if (!['asc', 'desc'].includes(order)) {
        throw new Error('Invalid sort order');
    }
    try {
        const skip = (page - 1) * limit;
        const [tasks, total] = await Promise.all([
            Task.find({ owner: ownerId })
                .sort({ title: order === 'asc' ? 1 : -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Task.countDocuments({ owner: ownerId })
        ]);
        return {
            tasks,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        };
    } catch (error) {
        throw new Error('Error sorting tasks by title: ' + error.message);
    }
};

// Tri par date de création
const getTasksSortedByDate = async (ownerId, order, { page = 1, limit = 20 } = {}) => {
    if (!['asc', 'desc'].includes(order)) {
        throw new Error('Invalid sort order');
    }
    try {
        const skip = (page - 1) * limit;
        const [tasks, total] = await Promise.all([
            Task.find({ owner: ownerId })
                .sort({ createdAt: order === 'asc' ? 1 : -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Task.countDocuments({ owner: ownerId })
        ]);
        return {
            tasks,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        };
    } catch (error) {
        throw new Error('Error sorting tasks by date: ' + error.message);
    }
};

// Récupération des tâches importantes
const getImportantTasks = async (ownerId) => {
    try {
        return await Task.find({ 
            owner: ownerId,
            isImportant: true
        });
    } catch (error) {
        throw new Error('Error fetching important tasks: ' + error.message);
    }
}

module.exports = {
    createTask,
    updateTask,
    getOwnerTasks,
    getTasksByCategory,
    getTasksByStatus,
    getTasksByDueDate,
    deleteTask,
    getTasksSortedByTitle,
    getTasksSortedByDate,
    getImportantTasks,
    findOneTask
};