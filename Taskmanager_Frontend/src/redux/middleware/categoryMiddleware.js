import { updateAvailableCategories } from '../slices/categorySlice';

export const categoryMiddleware = store => next => action => {
    const result = next(action);
    
    // Actions qui modifient les tâches
    const taskModifyingActions = [
        'task/postTask/fulfilled',
        'task/putTask/fulfilled',
        'task/deleteTask/fulfilled',
        'task/getOwnerTasks/fulfilled'
    ];

    if (taskModifyingActions.includes(action.type)) {
        const state = store.getState();
        const tasks = state.tasks.tasks;
        // Extraire uniquement les catégories non-null et non-undefined
        const categories = [...new Set(tasks.map(task => task.category))].filter(Boolean);
        store.dispatch(updateAvailableCategories(categories));
    }

    return result;
};