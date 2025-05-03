import { deleteManyTask, getCompleted } from '../redux/slices/taskSlice';
import { useDispatch, useSelector } from 'react-redux';
import { useCallback, useMemo } from 'react';
import propTypes from 'prop-types';


const TodoComputed = ({ itemsLeft }) => {
  const dispatch = useDispatch();

  // Utilise le sélecteur mémorisé
  const completed_tasks = useSelector(getCompleted);

  // Mémorise la liste des IDs pour éviter des recalculs inutiles
  const completed_ids = useMemo(() => {
    return completed_tasks.map((item) => item._id);
  }, [completed_tasks]);

  // Mémorise le callback pour éviter des re-rendus inutiles du bouton
  const clearCompletedTodos = useCallback(() => {
    dispatch(deleteManyTask({ids: [...completed_ids]}));
  }, [dispatch, completed_ids]);

  return (
    <section className="flex flex-col sm:flex-row justify-between items-center gap-4 backdrop-filter backdrop-blur-md bg-white/20 dark:bg-gray-800/30 border border-white/20 rounded-xl shadow-lg hover:shadow-xl p-4 mt-8 text-sm transition-all duration-300 mx-2 sm:mx-4 lg:mx-6">
      <span className="text-gray-600 dark:text-gray-200 font-medium transition-all duration-300">
        {itemsLeft} {itemsLeft > 1 ? 'tasks' : 'task'} pending
      </span>
      <button onClick={clearCompletedTodos}
        className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 font-medium transition-all duration-300">
        Clear Completed Task
      </button>
    </section>
  );
};

TodoComputed.propTypes = {
  itemsLeft: propTypes.number.isRequired
};

export default TodoComputed;
