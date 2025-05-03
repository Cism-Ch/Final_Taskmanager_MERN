const {TaskRepo} = require('../db/repository');
const {Task} = require('../db/model');
const verifyTaskOwnership = async (taskId, userId) => {
    const task = await Task.findById(taskId).lean();
    if (!task) {
        throw new Error('Task not found');
    }
    if (task.owner.toString() !== userId.toString()) {
        throw new Error('Unauthorized');
    }
    return task;
};

const postTask = async (req, res) => {
    try {
        const taskData = req.body;
        if (!taskData.title) {
            return res.status(400).json({ message: 'Le titre est requis' });
        }
        const task = await TaskRepo.createTask(taskData);
        res.status(201).json(task);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const updateTask = async (req, res) => {
    try {
        const taskId = req.params.id;
        const taskData = req.body;
        
        if (taskData.status && !['pending', 'done'].includes(taskData.status)) {
            return res.status(400).json({ message: 'Status invalide' });
        }

        const updatedTask = await TaskRepo.updateTask(taskId, taskData);
        res.status(200).json(updatedTask);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getOwnerTasks = async (req, res) => {
    try {
        const ownerId = req.params.id;
        const { status, category } = req.query;
        const filters = {};

        if (status) filters.status = status;
        if (category) filters.category = category;

        const tasks = await TaskRepo.getOwnerTasks(ownerId, filters);
        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getTasksByCategory = async (req, res) => {
    try {
        const ownerId = req.params.id;
        const category = req.params.category;
        const tasks = await TaskRepo.getTasksByCategory(ownerId, category);
        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getTasksByStatus = async (req, res) => {
    try {
        const ownerId = req.params.id;
        const status = req.params.status;
        
        // Validation de l'ownerId
        if (!ownerId || ownerId === 'null') {
            return res.status(400).json({ message: 'Owner ID invalide' });
        }
        
        if (!['pending', 'done'].includes(status)) {
            return res.status(400).json({ message: 'Status invalide' });
        }
        const tasks = await TaskRepo.getTasksByStatus(ownerId, status);
        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getTasksByDueDate = async (req, res) => {
    try {
        const ownerId = req.params.id;
        const { startDate, endDate } = req.query;
        
        if (!startDate || !endDate) {
            return res.status(400).json({ message: 'Les dates de début et de fin sont requises' });
        }

        const tasks = await TaskRepo.getTasksByDueDate(
            ownerId,
            new Date(startDate),
            new Date(endDate)
        );
        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const deleteManyTasks = async (req, res) => {
    try {
        const {ids} = req.body;
        const deleted = await Task.deleteMany({ _id: { $in: ids } });
        const result = {...deleted, ids};
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const deleteTask = async (req, res) => {
    try {
        const taskId = req.params.id;
        const result = await TaskRepo.deleteTask(taskId);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// Nouvelle méthode pour basculer l'importance d'une tâche
const toggleTaskImportance = async (req, res) => {
    try {
        const taskId = req.params.id;
        
        // Récupérer la tâche actuelle
        const task = await TaskRepo.findOneTask({ _id: taskId });
        if (!task) {
            return res.status(404).json({ message: 'Tâche non trouvée' });
        }

        // Vérifier que l'utilisateur est propriétaire de la tâche
        if (task.owner && task.owner.toString() !== req.user._id) {
            return res.status(403).json({ message: 'Non autorisé' });
        }

        // Basculer l'importance et mettre à jour
        const updatedTask = await TaskRepo.updateTask(taskId, {
            isImportant: !task.isImportant
        });

        res.status(200).json(updatedTask);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
// Méthodes pour la gestion des catégories, statuts et dates d'échéance
const updateCategory = async (req, res) => {
    try {
        const taskId = req.params.id;
        const { category } = req.body;

        if (!category) {
            return res.status(400).json({ message: 'La catégorie est requise' });
        }

        const updatedTask = await TaskRepo.updateTask(taskId, { category });
        res.status(200).json(updatedTask);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateStatus = async (req, res) => {
    try {
        const taskId = req.params.id;
        const { status } = req.body;

        if (!status || !['pending', 'done'].includes(status)) {
            return res.status(400).json({ message: 'Statut invalide' });
        }

        const updatedTask = await TaskRepo.updateTask(taskId, { status });
        res.status(200).json(updatedTask);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateDueDate = async (req, res) => {
    try {
        const taskId = req.params.id;
        const { dueDate } = req.body;

        if (!dueDate) {
            return res.status(400).json({ message: 'La date d\'échéance est requise' });
        }

        const updatedTask = await TaskRepo.updateTask(taskId, { dueDate: new Date(dueDate) });
        res.status(200).json(updatedTask);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getImportantTasks = async (req, res) => {
    try {
        const ownerId = req.params.id;
        const tasks = await TaskRepo.getImportantTasks(ownerId);
        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const getTasksSortedByTitle = async (req, res) => {
    try {
        const { id: ownerId, order } = req.params;
        const { page, limit } = req.query;
        
        // Vérifier que l'utilisateur accède à ses propres tâches
        if (ownerId !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Unauthorized' });
        }
        
        const result = await TaskRepo.getTasksSortedByTitle(ownerId, order, { page, limit });
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getTasksSortedByDate = async (req, res) => {
    try {
        const { id: ownerId, order } = req.params;
        const { page, limit } = req.query;
        
        // Vérifier que l'utilisateur accède à ses propres tâches
        if (ownerId !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Unauthorized' });
        }
        
        const result = await TaskRepo.getTasksSortedByDate(ownerId, order, { page, limit });
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    postTask,
    updateTask,
    getOwnerTasks,
    getTasksByCategory,
    getTasksByStatus,
    getTasksByDueDate,
    deleteManyTasks,
    deleteTask,
    toggleTaskImportance,
    updateCategory,
    updateStatus,
    updateDueDate,
    getImportantTasks,
    getTasksSortedByTitle,
    getTasksSortedByDate
};