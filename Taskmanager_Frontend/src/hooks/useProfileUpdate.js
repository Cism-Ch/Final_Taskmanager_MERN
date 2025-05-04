import { useState, useCallback, useDeferredValue, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  updateProfile,
  updateAvatar,
  selectProfileUpdateStatus,
  selectProfileUpdateError,
  resetProfileUpdate,
  getProfile
} from '../redux/slices/authSlice';
import { validateImage, validateProfile } from '../utils/validation';

const cleanProfileData = (data, modifiedFields) => {
  const cleanedData = {};
  
  // Ne traiter que les champs modifiés
  modifiedFields.forEach(field => {
    if (field.includes('.')) {
      // Gestion des champs imbriqués (ex: location.city)
      const [parent, child] = field.split('.');
      if (!cleanedData[parent]) {
        cleanedData[parent] = {};
      }
      const value = data[parent]?.[child]?.trim();
      if (value !== undefined && value !== '') {
        cleanedData[parent][child] = value;
      }
    } else {
      // Gestion des champs simples
      const value = field === 'dateOfBirth' ? data[field] : data[field]?.trim();
      if (value !== undefined && value !== '') {
        cleanedData[field] = value;
      }
    }
  });

  return cleanedData;
};

export const useProfileUpdate = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const updateStatus = useSelector(selectProfileUpdateStatus);
  const updateError = useSelector(selectProfileUpdateError);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = useCallback(() => setIsModalOpen(true), []);
  
  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const deferredIsModalOpen = useDeferredValue(isModalOpen);

  useEffect(() => {
    if (!deferredIsModalOpen && updateStatus === 'succeeded') {
      const timer = setTimeout(() => {
        dispatch(resetProfileUpdate());
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [deferredIsModalOpen, updateStatus, dispatch]);

  const handleUpdateProfile = useCallback(async (profileData, modifiedFields) => {
    console.log('--- Début mise à jour du profil ---');
    try {
      const validationError = validateProfile(profileData, modifiedFields);
      if (validationError) {
        throw new Error(validationError);
      }

      const cleanedData = cleanProfileData(profileData, modifiedFields);
      if (Object.keys(cleanedData).length === 0) {
        return;
      }

      // console.log('Données nettoyées:', cleanedData);
      
      const [updateResult] = await Promise.all([
        dispatch(updateProfile(cleanedData)).unwrap(),
        dispatch(getProfile()).unwrap()
      ]);
      
      console.log('Mise à jour complète:', updateResult);
      
      if (window.location.pathname !== '/profile') {
        navigate('/profile');
      }
      
      closeModal();
      dispatch(resetProfileUpdate());
    } catch (err) {
      console.error('Erreur dans useProfileUpdate:', err);
      throw err;
    } finally {
      console.log('--- Fin mise à jour du profil ---');
    }
  }, [navigate,dispatch, closeModal]);

  const handleUpdateAvatar = useCallback(async (file) => {
    const validationError = await validateImage(file);
    if (validationError) {
      throw new Error(validationError);
    }

    const formData = new FormData();
    formData.append('avatar', file);

    const result = await dispatch(updateAvatar(formData)).unwrap();
    return result;
  }, [dispatch]);

  return {
    handleUpdateProfile,
    handleUpdateAvatar,
    isLoading: updateStatus === 'loading',
    error: updateError,
    status: updateStatus,
    isModalOpen,
    openModal,
    closeModal,
  };
};