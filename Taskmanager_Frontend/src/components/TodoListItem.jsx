import { IconCheck, IconCross } from './icons';
import { useDispatch, useSelector } from 'react-redux';
import { deleteTask, toggleTaskImportance, getTaskError, getTaskStatus, putTask } from '../redux/slices/taskSlice';
import { assignTaskToUser, selectTaskLoadingStatus } from '../redux/slices/authSlice';
import Spinner  from './spinner';
import propTypes from 'prop-types';
import { useEffect, useCallback, memo } from 'react';
import { notifications } from '../services/notifications';

const StarIcon = memo(({ filled }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor"
    className="w-5 h-5"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
  </svg>
));
StarIcon.displayName = 'StarIcon';

StarIcon.propTypes = {
  filled: propTypes.bool.isRequired
};

const AssignIcon = memo(() => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    className="w-5 h-5"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
  </svg>
));
AssignIcon.displayName = 'AssignIcon';

const EditIcon = memo(() => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    className="w-5 h-5"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
  </svg>
));
EditIcon.displayName = 'EditIcon';

const TodoListItem = memo(({ todo, onEdit, ...props }) => {
  const { _id: id, title, description, status, category, dueDate, isImportant } = todo;
  const dispatch = useDispatch();
  const taskLoadingStatus = useSelector(selectTaskLoadingStatus);
  const taskStatus = useSelector(getTaskStatus);
  const taskError = useSelector(getTaskError);

  const handleDelete = useCallback(async () => {
    try {
      if (!id) {
        notifications.error("ID de tâche invalide");
        return;
      }
      await dispatch(deleteTask(id)).unwrap();
      notifications.success("Tâche supprimée avec succès");
    } catch (error) {
      notifications.error(error.message || 'Erreur lors de la suppression');
    }
  }, [dispatch, id]);

  const toggleStatus = useCallback(async () => {
    try {
      const newStatus = status === 'pending' ? 'done' : 'pending';
      const updatedTodo = { ...todo, status: newStatus };
      await dispatch(putTask(updatedTodo)).unwrap();
      notifications.info(`Tâche marquée comme ${newStatus === 'done' ? 'terminée' : 'à faire'}`);
    } catch (error) {
      notifications.error(error.message || 'Erreur lors de la mise à jour du statut');
    }
  }, [dispatch, status, todo]);

  const toggleImportant = useCallback(async () => {
    try {
      await dispatch(toggleTaskImportance(id)).unwrap();
      notifications.info(isImportant ? 'Importance retirée' : 'Tâche marquée comme importante');
    } catch (error) {
      notifications.error(error.message || 'Erreur lors de la mise à jour de l\'importance');
    }
  }, [dispatch, id, isImportant]);

  const handleAssign = useCallback(async () => {
    try {
      await dispatch(assignTaskToUser(id)).unwrap();
      notifications.success('Tâche assignée avec succès');
    } catch (error) {
      notifications.error(error.message || 'Erreur lors de l\'assignation de la tâche');
    }
  }, [dispatch, id]);

  const handleEdit = useCallback(() => {
    if (onEdit) {
      onEdit(todo);
    }
  }, [onEdit, todo]);

  useEffect(() => {
    if (taskError && taskStatus === 'failed') {
      notifications.error(taskError);
    }
  });

  const formatDate = useCallback((date) => {
    if (!date) return '';
    const options = {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(date).toLocaleDateString('fr-FR', options);
  }, []);

  const getStatusColor = useCallback((status) => {
    switch (status) {
      case 'done':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'deleted':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    }
  }, []);

  return (
    <article
      {...props}
      className={`flex flex-col gap-2 border-b border-gray-200 p-4 pb-10 dark:border-slate-500 motion-safe:hover:scale-[1.05] transition-all duration-300 ${
        isImportant ? 'bg-amber-50/50 dark:bg-amber-900/20' : ''
      }`}
      role="listitem"
    >
      <div className="flex items-start gap-4">
        <button
          onClick={toggleStatus}
          disabled={taskLoadingStatus === 'loading'}
          type="button"
          aria-label={status === 'done' ? 'Marquer comme à faire' : 'Marquer comme terminé'}
          className={`mt-1 h-5 w-5 rounded-full flex-shrink-0 ${
            status === 'done'
              ? 'flex items-center justify-center bg-gradient-to-r from-green-500 to-green-600'
              : 'inline-block border-2 transition-all duration-700 dark:border-orange-100'
          }`}
        >
          {taskLoadingStatus === 'loading' ? (
            <Spinner size="sm" />
          ) : (
            status === 'done' && <IconCheck />
          )}
        </button>

        <div className="grow">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <button
                  onClick={toggleImportant}
                  disabled={taskLoadingStatus === 'loading'}
                  className={`text-xs transition-colors ${
                    isImportant
                      ? 'text-amber-500 hover:text-amber-600'
                      : 'text-gray-400 hover:text-amber-500'
                  }`}
                  aria-label={isImportant ? "Retirer l'importance" : "Marquer comme important"}
                >
                  <StarIcon filled={isImportant} />
                </button>
                <button
                  onClick={handleAssign}
                  disabled={taskLoadingStatus === 'loading'}
                  className="text-xs text-gray-400 hover:text-blue-500 transition-colors"
                  aria-label="S'assigner cette tâche"
                >
                  <AssignIcon />
                </button>
                <button
                  onClick={handleEdit}
                  disabled={taskLoadingStatus === 'loading'}
                  className="text-xs text-gray-400 hover:text-green-500 transition-colors"
                  aria-label="Modifier la tâche"
                >
                  <EditIcon />
                </button>
              </div>
              <h3
                className={`font-medium ${
                  status === 'done'
                    ? 'text-gray-400 line-through dark:text-gray-500'
                    : 'text-gray-700 dark:text-gray-200'
                }`}
              >
                {title}
              </h3>
            </div>
            <button
              onClick={handleDelete}
              disabled={taskLoadingStatus === 'loading'}
              className="mt-1 text-red-200 hover:text-red-600 transition-colors"
              aria-label="Supprimer la tâche"
            >
              <IconCross />
            </button>
          </div>

          {description && (
            <p
              className={`mt-1 text-sm ${
                status === 'done'
                  ? 'text-gray-400 line-through dark:text-gray-500'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              {description}
            </p>
          )}

          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
            {category && (
              <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 text-xs">
                {category}
              </span>
            )}
            {dueDate && (
              <span className={`px-2 py-1 rounded-full text-xs ${
                new Date(dueDate) < new Date() && status !== 'done'
                  ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
              }`}>
                {formatDate(dueDate)}
              </span>
            )}
            <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(status)}`}>
              {status === 'done' ? 'Terminée' : status === 'deleted' ? 'Supprimée' : 'À faire'}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
});
TodoListItem.displayName = 'TodoListItem';

TodoListItem.propTypes = {
  todo: propTypes.shape({
    _id: propTypes.string.isRequired,
    title: propTypes.string.isRequired,
    description: propTypes.string,
    status: propTypes.oneOf(['pending', 'done', 'deleted']).isRequired,
    category: propTypes.string,
    dueDate: propTypes.string,
    isImportant: propTypes.bool,
  }).isRequired,
  onEdit: propTypes.func,
};

export default TodoListItem;
