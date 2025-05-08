import { useState, Fragment, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Tab } from '@headlessui/react';
import { useSelector, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import { IconCross } from '../icons';
import { selectEmailChangeStatus, selectEmailChangeError, selectPendingEmail, selectUser } from '../../redux/slices/authSlice';
import { initiateEmailChange } from '../../redux/slices/authSlice';
import { notifications } from '../../services/notifications';
import { useProfileUpdate } from '../../hooks/useProfileUpdate';

// Fonction utilitaire pour comparer les valeurs modifiées avec les valeurs initiales
const hasValueChanged = (field, newValue, originalValue) => {
  // Obtenir les valeurs à comparer
  let newVal = field.includes('.')
    ? newValue?.[field.split('.')[0]]?.[field.split('.')[1]]
    : newValue?.[field];
  let origVal = field.includes('.')
    ? originalValue?.[field.split('.')[0]]?.[field.split('.')[1]]
    : originalValue?.[field];

  // Normaliser les valeurs pour la comparaison
  if (typeof newVal === 'string') newVal = newVal.trim();
  if (typeof origVal === 'string') origVal = origVal.trim();

  // Cas spéciaux
  if (field === 'dateOfBirth') {
    // Normaliser les dates pour la comparaison
    const newDate = newVal ? new Date(newVal).toISOString().split('T')[0] : '';
    const origDate = origVal ? new Date(origVal).toISOString().split('T')[0] : '';
    return newDate !== origDate;
  }

  // Cas où les deux valeurs sont undefined/null
  if (!newVal && !origVal) return false;
  
  // Cas où une seule valeur est undefined/null
  if (!newVal || !origVal) return true;

  // Comparaison normale
  return newVal !== origVal;
};

// Fonction de validation initiale des champs modifiés avant d'appeler validateProfile
const validateModifiedFields = (data, modifiedFields) => {
  const errors = {};
  const fieldLimits = {
    username: { min: 3, max: 30, message: 'Le nom d\'utilisateur doit contenir entre 3 et 30 caractères' },
    firstName: { max: 50, message: 'Le prénom ne doit pas dépasser 50 caractères' },
    lastName: { max: 50, message: 'Le nom ne doit pas dépasser 50 caractères' },
    description: { max: 500, message: 'La description ne doit pas dépasser 500 caractères' },
    profession: { max: 100, message: 'La profession ne doit pas dépasser 100 caractères' },
    'location.city': { max: 100, message: 'Le nom de la ville ne doit pas dépasser 100 caractères' },
    'location.country': { max: 100, message: 'Le nom du pays ne doit pas dépasser 100 caractères' }
  };

  for (const field of modifiedFields) {
    let value = field.includes('.')
      ? data[field.split('.')[0]][field.split('.')[1]]
      : data[field];

    // Vérification de base pour les champs vides ou undefined
    if (typeof value === 'string') {
      value = value.trim();
    }

    // Validation spécifique pour l'email
    if (field === 'email' && value) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        errors[field] = 'Format d\'email invalide';
        continue;
      }
    }

    // Validation des limites de longueur pour les champs texte
    const limit = fieldLimits[field];
    if (limit && value) {
      if (limit.min && value.length < limit.min) {
        errors[field] = limit.message;
      }
      if (limit.max && value.length > limit.max) {
        errors[field] = limit.message;
      }
    }

    // Validation spéciale pour la date de naissance
    if (field === 'dateOfBirth' && value) {
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        errors[field] = 'Format de date invalide';
      } else {
        const now = new Date();
        if (date > now) {
          errors[field] = 'La date ne peut pas être dans le futur';
        }
        const minAge = new Date();
        minAge.setFullYear(minAge.getFullYear() - 13);
        if (date > minAge) {
          errors[field] = 'Vous devez avoir au moins 13 ans';
        }
      }
    }
  }

  return errors;
};

const ProfileUpdateModal = ({ isOpen, onClose }) => {
  const handleClose = () => {
    resetForm();
    onClose();
  };
  const { handleUpdateProfile, error: updateError, isLoading: isUpdateLoading } = useProfileUpdate();

  const dispatch = useDispatch();
  const currentUser = useSelector(selectUser);
  const emailChangeStatus = useSelector(selectEmailChangeStatus);
  const emailChangeError = useSelector(selectEmailChangeError);
  const pendingEmail = useSelector(selectPendingEmail);



  const getInitialFormData = useCallback(() => ({
    username: currentUser?.username ?? '',
    email: currentUser?.email ?? '',
    password: '',
    firstName: currentUser?.firstName ?? '',
    lastName: currentUser?.lastName ?? '',
    dateOfBirth: currentUser?.dateOfBirth
      ? new Date(currentUser.dateOfBirth).toISOString().split('T')[0]
      : '',
    gender: currentUser?.gender ?? 'non_specifie',
    profession: currentUser?.profession ?? '',
    description: currentUser?.description ?? '',
    location: {
      city: currentUser?.location?.city ?? '',
      country: currentUser?.location?.country ?? ''
    }
  }), [currentUser]);

  // Debug log pour vérifier l'initialisation
  useEffect(() => {
    if (currentUser) {
      console.log('État initial du formulaire:', {
        formData: getInitialFormData(),
        currentUser
      });
    }
  }, [currentUser, getInitialFormData]);



  const [formData, setFormData] = useState(getInitialFormData());
  const [modifiedFields, setModifiedFields] = useState(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Mettre à jour le formulaire quand currentUser change
  useEffect(() => {
    if (currentUser) {
      setFormData(getInitialFormData());
    }
  }, [currentUser, getInitialFormData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      const newFormData = name.includes('.')
        ? {
            ...prev,
            [name.split('.')[0]]: {
              ...(prev[name.split('.')[0]] || {}),
              [name.split('.')[1]]: value
            }
          }
        : { ...prev, [name]: value };

      // N'ajouter aux champs modifiés que si la valeur est différente de l'originale
      if (hasValueChanged(name, newFormData, currentUser)) {
        setModifiedFields(prev => {
          const newSet = new Set(prev);
          newSet.add(name);
          return newSet;
        });
      } else {
        setModifiedFields(prev => {
          const newSet = new Set(prev);
          newSet.delete(name);
          return newSet;
        });
      }

      return newFormData;
    });

    setErrors(prev => ({
      ...prev,
      [name]: '',
      submit: ''
    }));
  };

  const resetForm = () => {
    setFormData(getInitialFormData());
    setModifiedFields(new Set());
    setErrors({});
    setIsSubmitting(false);
  };


  // const handleImageChange = async (e) => {
  //   const file = e.target.files?.[0];
  //   if (!file) return;

  //   console.log('Traitement de l\'image:', {
  //     name: file.name,
  //     type: file.type,
  //     size: `${(file.size / 1024 / 1024).toFixed(2)}MB`
  //   });

  //   try {
  //     // Validation de l'image
  //     const validationError = await validateImage(file);
  //     if (validationError) {
  //       console.warn('Erreur de validation:', validationError);
  //       setErrors((prev) => ({
  //         ...prev,
  //         image: validationError,
  //       }));
  //       return;
  //     }

  //     // Créer l'aperçu avant l'envoi
  //     const reader = new FileReader();
  //     reader.onloadend = () => {
  //       console.log('Aperçu de l\'image créé');
  //       setImagePreview(reader.result);
  //     };
  //     reader.readAsDataURL(file);

  //     // Envoyer l'image au serveur
  //     console.log('Envoi de l\'image au serveur...');
  //     const result = await onUpdateAvatar(file);
  //     console.log('Réponse du serveur:', result);

  //     setErrors((prev) => ({ ...prev, image: '' }));
  //   } catch (err) {
  //     console.error('Erreur lors du traitement de l\'image:', err);
  //     setErrors((prev) => ({
  //       ...prev,
  //       image: err.message
  //     }));
  //     setImagePreview(null);
  //   }
  // };
  // const [,setIsEmailLoading] = useState(false);

  const handleSubmitError = (err) => {
    const errorMessage = err?.message || 'Une erreur est survenue';
    
    try {
      const parsedErrors = JSON.parse(errorMessage);
      if (typeof parsedErrors === 'object' && parsedErrors !== null) {
        // Ne conserver que les erreurs des champs modifiés
        const filteredErrors = {};
        Object.entries(parsedErrors).forEach(([field, message]) => {
          if (modifiedFields.has(field)) {
            filteredErrors[field] = message;
            notifications.error(`${field}: ${message}`);
          }
        });
        setErrors(filteredErrors);
      } else {
        throw new Error('Format d\'erreur invalide');
      }
    } catch {
      setErrors({ submit: errorMessage });
      notifications.error(errorMessage);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('--- Début soumission du formulaire ---');
    console.log('État actuel du formulaire:', formData);
    console.log('Champs modifiés:', Array.from(modifiedFields));
    
    setIsSubmitting(true);
    setErrors({});

    try {
      const changedData = {};
      // Construire les données modifiées avec une gestion améliorée des champs imbriqués
      const processedFields = new Set();
      modifiedFields.forEach(field => {
        if (field.includes('.')) {
          const [parent, child] = field.split('.');
          if (!changedData[parent]) {
            changedData[parent] = {};
            processedFields.add(parent); // Marquer le parent comme traité
          }
          changedData[parent][child] = formData[parent][child];
          processedFields.add(field); // Marquer le champ complet comme traité
        } else if (!processedFields.has(field)) {
          changedData[field] = formData[field];
          processedFields.add(field);
        }
      });
      
      console.log('Données à envoyer:', changedData);

      // Validation des champs modifiés
      const validationErrors = validateModifiedFields(formData, modifiedFields);
      if (Object.keys(validationErrors).length > 0) {
        console.log('Erreurs de validation:', validationErrors);
        setErrors(validationErrors);
        Object.entries(validationErrors).forEach(([field, message]) => {
          notifications.error(`${field}: ${message}`);
        });
        return;
      }

      // Gestion spéciale pour l'email
      if (modifiedFields.has('email') && formData.email && formData.email !== (currentUser?.email ?? '')) {
        console.log('Tentative de changement d\'email:', formData.email);
        await dispatch(initiateEmailChange(formData.email)).unwrap();
        console.log('Email de vérification envoyé');
        notifications.success('Vérifiez votre email pour confirmer le changement');
        return;
      }

      // Mise à jour du profil si des changements valides
      if (Object.keys(changedData).length > 0) {
        console.log('Envoi de la mise à jour du profil');
        await handleUpdateProfile(changedData, modifiedFields);
        console.log('Profil mis à jour avec succès');
        notifications.success('Profil mis à jour avec succès');
        setModifiedFields(new Set());
      }
    } catch (err) {
      console.error('Erreur lors de la soumission:', err);
      handleSubmitError(err);
    } finally {
      console.log('--- Fin de la soumission ---');
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center md:mx-3/4 lg:mx-80 my-3/5 animate-fadeIn">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-lg transition-all duration-500"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-4xl h-[90vh] bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg overflow-y-auto mx-auto transform scale-100 p-6 shadow-2xl border border-gray-200/20 dark:border-gray-700/20 transition-all duration-300 rounded-2xl animate-slideIn">
        {/* Bouton fermer */}
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-primary-400 transition-colors duration-200"
        >
          <IconCross />
        </button>

        {/* Titre */}
        <h3 className="mb-4 text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
          Modifier le profil
        </h3>
        <p className="mb-8 text-sm text-gray-500 dark:text-gray-400 bg-yellow-50/50 dark:bg-yellow-900/20 border border-yellow-200/50 dark:border-yellow-700/30 rounded-lg p-3">
          Déconnectez-vous et reconnectez-vous pour actualiser les modifications
        </p>

        {/* Message d'erreur général */}
        {(updateError || errors.submit) && (
          <div className="relative mb-6 rounded-lg bg-red-50/50 p-4 dark:bg-red-900/30 border border-red-200/50 dark:border-red-800/50 backdrop-blur-sm transform hover:scale-[1.02] transition-all duration-300">
            <div className="absolute inset-0 bg-red-500/5 dark:bg-red-400/5 rounded-lg animate-pulse"></div>
            <div className="relative">
              <p className="text-sm font-medium text-red-800 dark:text-red-200">
                {updateError || errors.submit}
              </p>
            </div>
          </div>
        )}

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Photo de profil
          <div className="text-center mb-8" role="group" aria-labelledby="profile-photo-label">
            <span id="profile-photo-label" className="sr-only">Photo de profil</span>
            <div
              className="group relative mx-auto h-28 w-28 cursor-pointer overflow-hidden rounded-full ring-4 ring-blue-500/20 dark:ring-blue-500/10"
              onClick={() => fileInputRef.current?.click()}
            >
              <img
                src={imagePreview || (currentUser?.avatar ? `${API_URL}${currentUser.avatar}` : PROFILE_IMAGES.DEFAULT)}
                alt="Photo de profil"
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm">
                <span className="text-sm font-medium text-white">Modifier la photo</span>
              </div>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageChange}
            />
            {errors.image && (
              <p className="mt-1 text-sm text-red-500">{errors.image}</p>
            )}
          </div> */}

          {/* Tabs de navigation */}
          <Tab.Group>
            <Tab.List className="flex space-x-2 rounded-xl bg-white/50 dark:bg-gray-800/50 p-1.5 mb-8 sticky top-0 z-10 shadow-lg border border-gray-200/20 dark:border-gray-700/20 text-purple-500 backdrop-blur-md transition-all duration-300 hover:shadow-xl">
              <Tab as={Fragment}>
                {({ selected }) => (
                  <button
                   role="tab"
                   className={`w-full rounded-lg py-2.5 text-sm font-medium leading-5
                     ${selected
                       ? 'bg-white dark:bg-gray-800 text-primary-600 dark:text-primary-400 shadow-lg transform scale-[1.02]'
                       : 'text-gray-600 dark:text-gray-400 hover:bg-white/30 dark:hover:bg-gray-700/30 hover:text-primary-500'
                     } transition-all duration-300`}
                  >
                    Profil
                  </button>
                )}
              </Tab>
              <Tab as={Fragment}>
                {({ selected }) => (
                  <button
                  role="tab"
                  className={`w-full rounded-lg py-2.5 text-sm font-medium leading-5
                    ${selected
                      ? 'bg-white dark:bg-gray-800 text-primary-600 dark:text-primary-400 shadow-lg transform scale-[1.02]'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-white/30 dark:hover:bg-gray-700/30 hover:text-primary-500'
                    } transition-all duration-300`}
                  >
                    Personnel
                  </button>
                )}
              </Tab>
              <Tab as={Fragment}>
                {({ selected }) => (
                  <button
                  role="tab"
                  className={`w-full rounded-lg py-2.5 text-sm font-medium leading-5
                    ${selected
                      ? 'bg-white dark:bg-gray-800 text-primary-600 dark:text-primary-400 shadow-lg transform scale-[1.02]'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-white/30 dark:hover:bg-gray-700/30 hover:text-primary-500'
                    } transition-all duration-300`}
                  >
                    Professionnel
                  </button>
                )}
              </Tab>
            </Tab.List>

            <Tab.Panels className="max-h-[60vh] overflow-y-auto pr-2 space-y-8">
              {/* Panel Profil */}
              <Tab.Panel>
                <div className="space-y-4">
                  {/* Nom d'utilisateur */}
                  <div>
                    <label className="block text-sm font-semibold bg-gradient-to-r from-gray-700 to-gray-900 dark:from-gray-200 dark:to-gray-400 bg-clip-text text-transparent">
                      Nom d&apos;utilisateur
                    </label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      disabled={isUpdateLoading}
                      className={`mt-1.5 block w-full rounded-lg border ${errors.username ? 'border-red-500' : 'border-gray-200/50 dark:border-gray-700/50'
                        } bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm px-4 py-3 text-gray-700 dark:text-gray-200 transition-all duration-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed placeholder-gray-400 dark:placeholder-gray-500 hover:border-primary-500/50 dark:hover:border-primary-400/50`}
                    />
                    {errors.username && (
                      <p className="mt-2 text-sm text-red-500 bg-red-50/30 dark:bg-red-900/20 px-3 py-1 rounded-md border border-red-100/50 dark:border-red-800/30">
                        {errors.username}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-semibold bg-gradient-to-r from-gray-700 to-gray-900 dark:from-gray-200 dark:to-gray-400 bg-clip-text text-transparent">
                      Email
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Entrez un nouvel email (optionnel)"
                        disabled={isUpdateLoading || emailChangeStatus === 'pending'}
                        className={`mt-1.5 block w-full rounded-lg border ${errors.email || emailChangeError ? 'border-red-500' : 'border-gray-200/50 dark:border-gray-700/50'
                          } bg-white/20 dark:bg-gray-800/30 px-4 py-3 text-gray-700 dark:text-gray-200 transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed placeholder-gray-400 dark:placeholder-gray-500`}
                      />
                      {emailChangeStatus === 'pending' && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        </div>
                      )}
                      {errors.email && (
                        <p className="mt-2 text-sm text-red-500 bg-red-50/30 dark:bg-red-900/20 px-3 py-1 rounded-md border border-red-100/50 dark:border-red-800/30">{errors.email}</p>
                      )}
                      {emailChangeError && (
                        <p className="mt-2 text-sm text-red-500 bg-red-50/30 dark:bg-red-900/20 px-3 py-1 rounded-md border border-red-100/50 dark:border-red-800/30">{emailChangeError}</p>
                      )}
                      {emailChangeStatus === 'pending' && pendingEmail && (
                        <div className="relative mt-2 rounded-lg bg-blue-50/30 dark:bg-blue-900/20 p-3 border border-blue-100/50 dark:border-blue-800/30 transform hover:scale-[1.02] transition-all duration-300">
                          <div className="absolute inset-0 bg-blue-500/5 dark:bg-blue-400/5 rounded-lg animate-pulse"></div>
                          <p className="relative text-sm text-blue-700 dark:text-blue-300">
                            <span className="font-medium">Un email de vérification a été envoyé à </span>
                            <span className="font-bold">{pendingEmail}</span>
                            <span className="block mt-1 text-blue-600 dark:text-blue-400">Veuillez vérifier votre boîte de réception.</span>
                          </p>
                        </div>
                      )}
                      {emailChangeStatus === 'verified' && (
                        <div className="relative mt-2 rounded-lg bg-green-50/30 dark:bg-green-900/20 p-3 border border-green-100/50 dark:border-green-800/30 transform hover:scale-[1.02] transition-all duration-300">
                          <div className="absolute inset-0 bg-green-500/5 dark:bg-green-400/5 rounded-lg animate-pulse"></div>
                          <p className="relative text-sm font-medium text-green-700 dark:text-green-300">
                            <span className="flex items-center gap-2">
                              <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              Votre email a été mis à jour avec succès !
                            </span>
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Mot de passe */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold bg-gradient-to-r from-gray-700 to-gray-900 dark:from-gray-200 dark:to-gray-400 bg-clip-text text-transparent">
                      Mot de passe (optionnel)
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400 group-hover:text-primary-500 transition-colors duration-200" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 116 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        disabled={isUpdateLoading}
                        placeholder="Laissez vide pour ne pas changer"
                        className="pl-10 mt-1.5 block w-full rounded-lg border border-gray-200/50 dark:border-gray-700/50 bg-white/30 dark:bg-gray-800/30 px-4 py-3 text-gray-700 dark:text-gray-200 transition-all duration-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 hover:border-primary-500/50 dark:hover:border-primary-400/50 backdrop-blur-sm"
                      />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                      Entrez un nouveau mot de passe uniquement si vous souhaitez le modifier
                    </p>
                  </div>
                </div>
              </Tab.Panel>

              {/* Panel Personnel */}
              <Tab.Panel>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold bg-gradient-to-r from-gray-700 to-gray-900 dark:from-gray-200 dark:to-gray-400 bg-clip-text text-transparent">
                        Prénom
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        disabled={isUpdateLoading}
                        className="mt-1.5 block w-full rounded-lg border border-gray-200/50 dark:border-gray-700/50 bg-white/30 dark:bg-gray-800/30 px-4 py-3 text-gray-700 dark:text-gray-200 transition-all duration-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 hover:border-primary-500/50 dark:hover:border-primary-400/50 backdrop-blur-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold bg-gradient-to-r from-gray-700 to-gray-900 dark:from-gray-200 dark:to-gray-400 bg-clip-text text-transparent">
                        Nom
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        disabled={isUpdateLoading}
                        className="mt-1.5 block w-full rounded-lg border border-gray-200/50 dark:border-gray-700/50 bg-white/30 dark:bg-gray-800/30 px-4 py-3 text-gray-700 dark:text-gray-200 transition-all duration-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 hover:border-primary-500/50 dark:hover:border-primary-400/50 backdrop-blur-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold bg-gradient-to-r from-gray-700 to-gray-900 dark:from-gray-200 dark:to-gray-400 bg-clip-text text-transparent">
                        Date de naissance
                      </label>
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleChange}
                        disabled={isUpdateLoading}
                        className="mt-1.5 block w-full rounded-lg border border-gray-200/50 dark:border-gray-700/50 bg-white/30 dark:bg-gray-800/30 px-4 py-3 text-gray-700 dark:text-gray-200 transition-all duration-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 hover:border-primary-500/50 dark:hover:border-primary-400/50 backdrop-blur-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold bg-gradient-to-r from-gray-700 to-gray-900 dark:from-gray-200 dark:to-gray-400 bg-clip-text text-transparent">
                        Genre
                      </label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        disabled={isUpdateLoading}
                        className="mt-1.5 block w-full rounded-lg border border-gray-200/50 dark:border-gray-700/50 bg-white/30 dark:bg-gray-800/30 px-4 py-3 text-gray-700 dark:text-gray-200 transition-all duration-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 hover:border-primary-500/50 dark:hover:border-primary-400/50 backdrop-blur-sm"
                      >
                        <option value="non_specifie">Non spécifié</option>
                        <option value="homme">Homme</option>
                        <option value="femme">Femme</option>
                        <option value="autre">Autre</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold bg-gradient-to-r from-gray-700 to-gray-900 dark:from-gray-200 dark:to-gray-400 bg-clip-text text-transparent">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      disabled={isUpdateLoading}
                      rows="3"
                      placeholder="Parlez-nous un peu de vous..."
                      className="mt-1.5 block w-full rounded-lg border border-gray-200/50 dark:border-gray-700/50 bg-white/20 dark:bg-gray-800/30 px-4 py-3 text-gray-700 dark:text-gray-200 transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold bg-gradient-to-r from-gray-700 to-gray-900 dark:from-gray-200 dark:to-gray-400 bg-clip-text text-transparent">
                        Ville
                      </label>
                      <input
                        type="text"
                        name="location.city"
                        value={formData.location.city}
                        onChange={handleChange}
                        disabled={isUpdateLoading}
                        className="mt-1.5 block w-full rounded-lg border border-gray-200/50 dark:border-gray-700/50 bg-white/30 dark:bg-gray-800/30 px-4 py-3 text-gray-700 dark:text-gray-200 transition-all duration-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 hover:border-primary-500/50 dark:hover:border-primary-400/50 backdrop-blur-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold bg-gradient-to-r from-gray-700 to-gray-900 dark:from-gray-200 dark:to-gray-400 bg-clip-text text-transparent">
                        Pays
                      </label>
                      <input
                        type="text"
                        name="location.country"
                        value={formData.location.country}
                        onChange={handleChange}
                        disabled={isUpdateLoading}
                        className="mt-1.5 block w-full rounded-lg border border-gray-200/50 dark:border-gray-700/50 bg-white/30 dark:bg-gray-800/30 px-4 py-3 text-gray-700 dark:text-gray-200 transition-all duration-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 hover:border-primary-500/50 dark:hover:border-primary-400/50 backdrop-blur-sm"
                      />
                    </div>
                  </div>
                </div>
              </Tab.Panel>

              {/* Panel Professionnel */}
              <Tab.Panel>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold bg-gradient-to-r from-gray-700 to-gray-900 dark:from-gray-200 dark:to-gray-400 bg-clip-text text-transparent">
                        Profession
                      </label>
                      <input
                        type="text"
                        name="profession"
                        value={formData.profession}
                        onChange={handleChange}
                        disabled={isUpdateLoading}
                        placeholder="Ex: Développeur Web"
                        className="mt-1.5 block w-full rounded-lg border border-gray-200/50 dark:border-gray-700/50 bg-white/30 dark:bg-gray-800/30 px-4 py-3 text-gray-700 dark:text-gray-200 transition-all duration-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 hover:border-primary-500/50 dark:hover:border-primary-400/50 backdrop-blur-sm"
                      />
                    </div>

                  </div>
                </div>
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>

          {/* Boutons d'action */}
          <div className="relative mt-8 flex flex-col-reverse sm:flex-row justify-end gap-3 bottom-0 pt-4 before:absolute before:inset-0 before:bg-gradient-to-t before:from-white/80 before:to-transparent dark:before:from-gray-900/80 before:-top-20 before:pointer-events-none">
            <div className="relative flex flex-col-reverse sm:flex-row justify-end gap-3 w-full">
            <button
              type="button"
              onClick={handleClose}
              disabled={isUpdateLoading}
              onMouseDown={(e) => {
                const button = e.currentTarget;
                const circle = document.createElement("span");
                const diameter = Math.max(button.clientWidth, button.clientHeight);
                const radius = diameter / 2;

                circle.style.width = circle.style.height = `${diameter}px`;
                circle.style.left = `${e.clientX - button.offsetLeft - radius}px`;
                circle.style.top = `${e.clientY - button.offsetTop - radius}px`;
                circle.classList.add("absolute", "rounded-full", "bg-gray-400/20", "animate-ripple", "pointer-events-none");

                const oldRipples = button.getElementsByClassName("animate-ripple");
                Array.from(oldRipples).forEach(ripple => ripple.remove());

                button.appendChild(circle);

                setTimeout(() => {
                  circle.remove();
                }, 600);
              }}
              className="group relative overflow-hidden w-full sm:w-auto px-5 py-2.5 rounded-lg bg-white/30 dark:bg-gray-800/30 border border-gray-200/50 dark:border-gray-700/50 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50 hover:border-primary-500/30 dark:hover:border-primary-400/30 active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary-400 backdrop-blur-sm"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isUpdateLoading || isSubmitting}
              onMouseDown={(e) => {
                const button = e.currentTarget;
                const circle = document.createElement("span");
                const diameter = Math.max(button.clientWidth, button.clientHeight);
                const radius = diameter / 2;

                circle.style.width = circle.style.height = `${diameter}px`;
                circle.style.left = `${e.clientX - button.offsetLeft - radius}px`;
                circle.style.top = `${e.clientY - button.offsetTop - radius}px`;
                circle.classList.add("absolute", "rounded-full", "bg-white/30", "animate-ripple", "pointer-events-none");

                // Nettoyer les anciens effets ripple
                const oldRipples = button.getElementsByClassName("animate-ripple");
                Array.from(oldRipples).forEach(ripple => ripple.remove());

                button.appendChild(circle);

                // Nettoyer l'effet après l'animation
                setTimeout(() => {
                  circle.remove();
                }, 600);
              }}
              className="group w-full sm:w-auto px-6 py-2.5 rounded-lg bg-gradient-to-r from-primary-500 to-primary-600 text-sm font-semibold text-white relative overflow-hidden transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl shadow-primary-500/25 backdrop-blur-sm before:absolute before:inset-0 before:bg-primary-400/0 hover:before:bg-primary-400/20 before:transition-colors before:duration-300 after:absolute after:inset-0 after:-z-10 after:bg-gradient-to-r after:from-primary-600/0 after:to-primary-400/0 hover:after:from-primary-600/20 hover:after:to-primary-400/20 after:transition-colors after:duration-500"
              aria-busy={isUpdateLoading || isSubmitting}
            >
              {isUpdateLoading || isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span className="animate-pulse">Enregistrement...</span>
                </span>
              ) : (
                <span className="flex items-center gap-2 group-hover:translate-x-1 group-hover:text-lime-500 transition-all duration-300">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 9l-7 7-7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Sauvegarder
                </span>
              )}
            </button>
          </div>
          </div>
        </form>
      </div>
    </div>,
    document.getElementById('modal-root')
  );
};

ProfileUpdateModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
};

export default ProfileUpdateModal;