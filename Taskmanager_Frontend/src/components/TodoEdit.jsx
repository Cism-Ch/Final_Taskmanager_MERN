import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { putTask, deleteTask } from '../redux/slices/taskSlice';
import {
  selectAvailableCategories,
  DEFAULT_CATEGORIES
} from '../redux/slices/categorySlice';
import { notifications } from '../services/notifications';
import PropTypes from 'prop-types';
import {
  HiOutlinePencilSquare,
  HiOutlineDocumentText,
  HiOutlineTag,
  HiOutlineCalendarDays,
  HiOutlineArrowPath,
  HiOutlineXMark,
  HiOutlineCheckCircle
} from 'react-icons/hi2';

const TodoEdit = ({ isOpen, onClose, task }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(isOpen);
  const [isLoading, setIsLoading] = useState(false);
  const formRef = useRef(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    dueDate: ''
  });

  const selectedUser = useSelector(state => state.auth.user);
  const categories = useSelector(selectAvailableCategories);
  const dispatch = useDispatch();

  useEffect(() => {
    setIsDropdownOpen(isOpen);
  }, [isOpen]);

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        category: task.category || '',
        dueDate: task.dueDate || ''
      });
      setIsDropdownOpen(true);
    }
  }, [task]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (formRef.current && !formRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
        onClose?.();
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen, onClose]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: '',
      dueDate: ''
    });
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      notifications.error('Le titre est requis');
      return false;
    }
    
    if (formData.title.trim().length < 3) {
      notifications.error('Le titre doit contenir au moins 3 caractères');
      return false;
    }

    if (formData.description.trim().length > 500) {
      notifications.error('La description ne doit pas dépasser 500 caractères');
      return false;
    }

    if (formData.dueDate && new Date(formData.dueDate) < new Date()) {
      notifications.error('La date d\'échéance ne peut pas être dans le passé');
      return false;
    }

    return true;
  };

  const handleDelete = async () => {
    try {
      const confirmation = window.confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?');
      
      if (confirmation) {
        setIsLoading(true);
        await dispatch(deleteTask(task._id)).unwrap();
        notifications.success('Tâche supprimée avec succès');
        setIsDropdownOpen(false);
        onClose?.();
      } else {
        notifications.info('Suppression annulée');
      }
    } catch (error) {
      notifications.error(error.message || 'Erreur lors de la suppression');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const taskData = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      category: formData.category || DEFAULT_CATEGORIES[0],
      dueDate: formData.dueDate,
      owner: selectedUser,
      status: task.status
    };

    try {
      setIsLoading(true);
      await dispatch(putTask({ ...taskData, _id: task._id })).unwrap();
      notifications.success('Tâche modifiée avec succès');
      resetForm();
      setIsDropdownOpen(false);
      onClose?.();
    } catch (error) {
      notifications.error(error.message || 'Erreur lors de la modification');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <div className="relative" ref={formRef}>
      <button
        onClick={toggleDropdown}
        className="w-full px-4 py-2 bg-white/30 dark:bg-purple-400/70 hover:bg-white/40 dark:hover:bg-gray-600/40
          text-gray-700 dark:text-gray-200 font-medium rounded-lg
          transform transition-all duration-300 ease-in-out
          hover:shadow-lg motion-safe:hover:scale-[1.02]
          focus:outline-none focus:ring-2 focus:ring-blue-500/50
          disabled:opacity-50 disabled:cursor-not-allowed
          flex items-center justify-center gap-2"
      >
        <HiOutlinePencilSquare className="w-5 h-5" />
        <span>Modifier la tâche</span>
      </button>

      {isDropdownOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 mb-2 z-50 
          transform transition-all duration-300 ease-in-out 
          opacity-100 scale-100 origin-top"
        >
          <form onSubmit={handleSubmit}
            className="backdrop-filter backdrop-blur-lg bg-white/20 dark:bg-black/80
              border border-white/20 rounded-xl shadow-lg py-8 px-2"
          >
            <div className="space-y-4">
              {/* Titre */}
              <div className="relative">
                <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 mb-2">
                  <HiOutlineDocumentText className="w-4 h-4" />
                  <span>Titre</span>
                </label>
                <div className="relative">
                  <input
                  type="text"
                  name="title"
                  value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Titre de la tâche"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600
                      focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
                      bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white
                      placeholder:text-gray-500 dark:placeholder:text-gray-400"
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div className="relative">
                <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 mb-2">
                  <HiOutlinePencilSquare className="w-4 h-4" />
                  <span>Description</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Description de la tâche (optionnelle)"
                  rows="3"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600
                    focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
                    bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white
                    placeholder:text-gray-500 dark:placeholder:text-gray-400"
                />
              </div>

              {/* Catégorie */}
              <div className="relative">
                <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 mb-2">
                  <HiOutlineTag className="w-4 h-4" />
                  <span>Catégorie</span>
                </label>
                <div className="relative">
                  <select
                  name="category"
                  value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600
                      focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
                      bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white
                      appearance-none pr-10"
                  >
                    <option value="">Sélectionner une catégorie</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <HiOutlineTag className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Date d'échéance */}
              <div className="relative">
                <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 mb-2">
                  <HiOutlineCalendarDays className="w-4 h-4" />
                  <span>Date d&apos;échéance</span>
                </label>
                <input
                  type="datetime-local"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600
                    focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
                    bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white"
                />
              </div>

              {/* Boutons */}
              <div className="flex gap-4 flex-wrap">
                <button
                  type="submit"
                  disabled={!formData.title.trim() || isLoading}
                  className="flex-1 px-4 py-2 bg-blue-500/80 hover:bg-blue-600/80
                    text-white font-medium rounded-lg shadow-md
                    transform transition-all duration-300 ease-in-out
                    hover:shadow-lg motion-safe:hover:scale-[1.02]
                    focus:outline-none focus:ring-2 focus:ring-blue-500/50
                    disabled:opacity-50 disabled:cursor-not-allowed
                    inline-flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <HiOutlineArrowPath className="w-5 h-5 animate-spin" />
                      <span>Mise à jour...</span>
                    </>
                  ) : (
                    <>
                      <HiOutlineCheckCircle className="w-5 h-5" />
                      <span>Mettre à jour</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setIsDropdownOpen(false);
                    onClose?.();
                  }}
                  className="px-4 py-2 bg-gray-500/80 hover:bg-gray-600/80
                    text-white font-medium rounded-lg shadow-md
                    transition-all duration-300 ease-in-out
                    hover:shadow-lg motion-safe:hover:scale-[1.02]
                    focus:outline-none focus:ring-2 focus:ring-gray-500/50
                    inline-flex items-center justify-center gap-2"
                >
                  <HiOutlineXMark className="w-5 h-5" />
                  <span>Annuler</span>
                </button>
                {/* Bouton Supprimer */}
                <button
                  type="button"
                  onClick={handleDelete}
                  className="w-full mt-4 px-4 py-2 bg-red-500/80 hover:bg-red-600/80
                    text-white font-medium rounded-lg shadow-md
                    transition-all duration-300 ease-in-out
                    hover:shadow-lg motion-safe:hover:scale-[1.02]
                    focus:outline-none focus:ring-2 focus:ring-red-500/50
                    inline-flex items-center justify-center gap-2"
                >
                  <HiOutlineXMark className="w-5 h-5" />
                  <span>Supprimer</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

TodoEdit.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  task: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    category: PropTypes.string,
    dueDate: PropTypes.string,
    status: PropTypes.string,
    isImportant: PropTypes.bool,
  }).isRequired,
};

export default TodoEdit;