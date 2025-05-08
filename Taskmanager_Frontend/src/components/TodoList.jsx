import TodoListItem from './TodoListItem';
import TodoCreate from './TodoCreate';
import TodoEdit from './TodoEdit';
import propTypes from 'prop-types';
import { memo, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getFilteredTasks, getTaskStatus, getTaskError, getOwnerTasks } from '../redux/slices/taskSlice';
import { selectUser } from '../redux/slices/authSlice';
import Spinner from './spinner';

const TodoList = ({ tasks = [] }) => {
  const [taskToEdit, setTaskToEdit] = useState(null);
  const dispatch = useDispatch();
  const userTasks = useSelector(getFilteredTasks);
  const status = useSelector(getTaskStatus);
  const error = useSelector(getTaskError);
  const user = useSelector(selectUser);

  useEffect(() => {
    if (user && user._id) {
      dispatch(getOwnerTasks(user._id));
    }
  }, [dispatch, user]);

  // Trier les tâches par date d'échéance
  const sortedTasks = useMemo(() => {
    if (!tasks && !userTasks) return [];
    // Utiliser un Set pour éviter les doublons basés sur _id
    const taskMap = new Map();
    [...tasks, ...(userTasks || [])].forEach(task => {
      if (task && task._id) {
        taskMap.set(task._id, task);
      }
    });
    const uniqueTasks = Array.from(taskMap.values());
    return uniqueTasks.sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate) - new Date(b.dueDate);
    });
  }, [tasks, userTasks]);

  if (status === 'loading') {
    return (
      <div className="m-12 p-6 rounded-xl bg-white transition-all duration-700 dark:bg-black/80 overflow-auto h-80">
        <div className="flex justify-center items-center h-full" role="status" aria-label="Chargement des tâches">
          <Spinner />
          <span className="sr-only">Chargement des tâches en cours...</span>
        </div>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="m-12 p-6 rounded-xl bg-white dark:bg-black/80 overflow-auto max-h-80">
        <div className="flex justify-center items-center h-full" role="alert">
          <span className="text-red-500 font-medium">
            Une erreur est survenue : {error}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="sm:m-2 md:m-12 sm:pb-40 xs:p-2 sm:p-4 md:p-8 md:pb-60 rounded-xl border border-orange-500/80 bg-white dark:bg-black/50 backdrop-blur-lg overflow-auto max-h-screen">
      <div className="relative z-10 grid sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-4 xs:px-4 sm:px-4 md:px-6 lg:px-7 xl:px-6 md:pt-1 pt-6 mx-2">
        <div className="transition-all duration-300 ease-in-out transform hover:scale-102 ">
          <TodoCreate isOpen={false} />
        </div>
        {taskToEdit && (
          <div className="transition-all duration-300 ease-in-out transform hover:scale-102">
            <TodoEdit
              isOpen={true}
              task={taskToEdit}
              onClose={() => setTaskToEdit(null)}
            />
          </div>
        )}
      </div>
      {sortedTasks.length === 0 ? (
        <div className="flex justify-center items-center h-full" role="status">
          <span className="text-gray-900 dark:text-gray-100" aria-label="Aucune tâche">
            Aucune tâche trouvée
          </span>
        </div>
      ) : (
        <div className="relative z-1 bg-white/5 dark:bg-black/60 rounded-2xl dark:text-gray-100 shadow-lg mt-6 mb-6 p-4" role="list" aria-label="Liste des tâches">
          {sortedTasks.map((todo) => (
            <TodoListItem
              todo={todo}
              key={todo._id}
              onEdit={setTaskToEdit}
            />
          ))}
        </div>
      )}
    </div>
  );
};

TodoList.propTypes = {
  tasks: propTypes.arrayOf(
    propTypes.shape({
      _id: propTypes.string.isRequired,
      title: propTypes.string.isRequired,
      description: propTypes.string,
      status: propTypes.oneOf(['pending', 'done']).isRequired,
      category: propTypes.string,
      dueDate: propTypes.string,
      isImportant: propTypes.bool,
    })
  ),
};

// Optimisation des re-rendus avec memo
export default memo(TodoList);
