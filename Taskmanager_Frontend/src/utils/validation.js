// Validation du mot de passe
export const validatePassword = (password) => {
  if (!password) {
    return 'Le mot de passe est requis';
  }

  if (password.length < 8) {
    return 'Le mot de passe doit contenir au moins 8 caractères';
  }

  // Vérification de la complexité du mot de passe
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  if (!hasUpperCase) {
    return 'Le mot de passe doit contenir au moins une majuscule';
  }
  if (!hasLowerCase) {
    return 'Le mot de passe doit contenir au moins une minuscule';
  }
  if (!hasNumbers) {
    return 'Le mot de passe doit contenir au moins un chiffre';
  }
  if (!hasSpecialChars) {
    return 'Le mot de passe doit contenir au moins un caractère spécial';
  }

  return null;
};

// Validation de la confirmation du mot de passe
export const validatePasswordConfirmation = (password, confirmation) => {
  if (!confirmation) {
    return 'La confirmation du mot de passe est requise';
  }

  if (password !== confirmation) {
    return 'Les mots de passe ne correspondent pas';
  }

  return null;
};

export const validateProfile = (data, modifiedFields) => {
  // Convertir modifiedFields en Set s'il ne l'est pas déjà
  const fieldsToValidate = modifiedFields instanceof Set ? modifiedFields : new Set(modifiedFields);

  // Ne valider que les champs modifiés
  if (fieldsToValidate.has('username')) {
    const username = data.username;
    if (!username?.trim()) {
      return 'Le nom d\'utilisateur est requis';
    }
    if (username.length < 3 || username.length > 30) {
      return 'Le nom d\'utilisateur doit contenir entre 3 et 30 caractères';
    }
  }

  // Email regex simplifiée mais robuste
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  // Validation de l'email seulement s'il est modifié
  if (fieldsToValidate.has('email') && data.email !== undefined) {
    const email = data.email;
    const normalizedEmail = email.trim().toLowerCase();

    // Si l'email est vide après le trim, on ne fait pas de validation
    if (normalizedEmail === '') {
      return null;
    }

    // Vérification de la longueur (RFC 5321)
    if (normalizedEmail.length > 254) {
      return 'L\'email ne doit pas dépasser 254 caractères';
    }

    // Vérification de la partie locale
    const [localPart] = normalizedEmail.split('@');
    if (localPart.length > 64) {
      return 'La partie locale de l\'email ne doit pas dépasser 64 caractères';
    }

    // Validation du format
    if (!emailRegex.test(normalizedEmail)) {
      // Vérifications spécifiques pour des messages d'erreur plus précis
      if (normalizedEmail.indexOf('@') === -1) {
        return 'L\'email doit contenir un @';
      }
      if (normalizedEmail.split('@').length > 2) {
        return 'L\'email ne peut contenir qu\'un seul @';
      }
      if (/\.{2,}/.test(normalizedEmail)) {
        return 'L\'email ne peut pas contenir des points consécutifs';
      }
      if (/[A-Z]/.test(email)) {
        return 'L\'email ne doit contenir que des caractères minuscules';
      }
      return 'Format d\'email invalide';
    }

    // Vérification des domaines interdits
    const blockedDomains = ['tempmail.com', 'throwawaymail.com'];
    const domain = normalizedEmail.split('@')[1];
    if (blockedDomains.includes(domain)) {
      return 'Les adresses email temporaires ne sont pas autorisées';
    }
  }

  // Validation des champs optionnels
  if (fieldsToValidate.has('firstName') && data.firstName?.trim()?.length > 50) {
    return 'Le prénom ne doit pas dépasser 50 caractères';
  }

  if (fieldsToValidate.has('lastName') && data.lastName?.trim()?.length > 50) {
    return 'Le nom ne doit pas dépasser 50 caractères';
  }

  if (fieldsToValidate.has('dateOfBirth') && data.dateOfBirth) {
    const date = new Date(data.dateOfBirth);
    if (isNaN(date.getTime())) {
      return 'Format de date de naissance invalide';
    }
    if (date > new Date()) {
      return 'La date de naissance ne peut pas être dans le futur';
    }
    const minAge = new Date();
    minAge.setFullYear(minAge.getFullYear() - 13);
    if (date > minAge) {
      return 'Vous devez avoir au moins 13 ans';
    }
  }

  if (fieldsToValidate.has('description') && data.description?.trim()?.length > 500) {
    return 'La description ne doit pas dépasser 500 caractères';
  }

  if (fieldsToValidate.has('profession') && data.profession?.trim()?.length > 100) {
    return 'La profession ne doit pas dépasser 100 caractères';
  }

  // Validation de la location et de ses sous-champs
  if (fieldsToValidate.has('location.city') && data.location?.city?.trim()?.length > 100) {
    return 'Le nom de la ville ne doit pas dépasser 100 caractères';
  }

  if (fieldsToValidate.has('location.country') && data.location?.country?.trim()?.length > 100) {
    return 'Le nom du pays ne doit pas dépasser 100 caractères';
  }

  return null;
};

export const validateImage = async (file) => {
  if (!file) {
    return 'Aucun fichier sélectionné';
  }

  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return 'L\'image ne doit pas dépasser 5MB';
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return 'Format d\'image non supporté. Utilisez JPG, PNG ou WebP';
  }

  // Vérification des dimensions
  try {
    const dimensions = await getImageDimensions(file);
    if (dimensions.width > 3840 || dimensions.height > 2160) {
      return 'Les dimensions de l\'image ne doivent pas dépasser 3840x2160 pixels (4K)';
    }
  } catch (err) {
    return 'Impossible de vérifier les dimensions de l\'image';
  }

  return null;
};

const getImageDimensions = (file) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    img.src = URL.createObjectURL(file);
  });
};
