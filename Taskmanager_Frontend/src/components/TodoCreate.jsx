import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { postTask } from '../redux/slices/taskSlice';
import {
  selectAvailableCategories,
  DEFAULT_CATEGORIES
} from '../redux/slices/categorySlice';

const TodoCreate = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    dueDate: ''
  });

  const selectedUser = useSelector(state => state.auth.user);
  const categories = useSelector(selectAvailableCategories);
  const dispatch = useDispatch();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    const taskData = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      category: formData.category || DEFAULT_CATEGORIES[0],
      dueDate: formData.dueDate,
      owner: selectedUser,
      status: 'pending'
    };

    dispatch(postTask(taskData));
    setFormData({
      title: '',
      description: '',
      category: '',
      dueDate: ''
    });
  };

  return (
    <div className="mt-8 mb-8">
      <form onSubmit={handleSubmit}
        className="backdrop-filter backdrop-blur-lg bg-white/25 dark:bg-gray-800/25 border border-gray-300/80 rounded-xl shadow-lg hover:shadow-xl motion-safe:transition-all motion-reduce:transition-none duration-300 p-6">
        <div className="space-y-4">
          {/* Titre */}
          <div>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Titre de la tâche"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600
                focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400
                bg-white dark:bg-gray-900/80 text-gray-900 dark:text-white
                placeholder:text-gray-400 dark:placeholder:text-gray-300
                motion-safe:transition-all motion-reduce:transition-none duration-300"
              required
            />
          </div>

          {/* Description */}
          <div>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Description (optionnelle)"
              rows="3"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600
                focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400
                bg-white dark:bg-gray-900/80 text-gray-900 dark:text-white
                placeholder:text-gray-400 dark:placeholder:text-gray-300
                motion-safe:transition-all motion-reduce:transition-none duration-300"
            />
          </div>

          {/* Catégorie */}
          <div>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600
                focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400
                bg-white dark:bg-gray-900/80 text-gray-900 dark:text-white
                motion-safe:transition-all motion-reduce:transition-none duration-300"
            >
              <option value="">Sélectionner une catégorie</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Date d'échéance */}
          <div>
            <input
              type="datetime-local"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleInputChange}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400
                bg-white dark:bg-gray-900/80 text-gray-900 dark:text-white
                transition-all duration-700"
            />
          </div>

          {/* Bouton de soumission */}
          <button
            type="submit"
            className="w-full px-4 py-2 bg-orange-500 hover:bg-purple-400 
              text-white font-semibold rounded-lg shadow-md
              transition-all duration-300 ease-in-out
              disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!formData.title.trim()}
          >
            Créer la tâche
          </button>
        </div>
      </form>
    </div>
  );
};

export default TodoCreate;
