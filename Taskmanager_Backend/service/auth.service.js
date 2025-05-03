const { UserRepo, TmpUserRepo } = require('../db/repository');
const sendEmail = require('../utilitaire/email/sendEmail');
const { Task } = require('../db/model');
const mongoose = require('mongoose');
console.log('Repositories chargés:', { UserRepo, TmpUserRepo });
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const NodeCache = require('node-cache');
// Fonctions utilitaires
const validateProfileUpdate = (data) => {
  const schema = Joi.object({
    username: Joi.string()
      .min(3)
      .max(30)
      .required()
      .messages({
        'string.min': 'Le nom d\'utilisateur doit contenir au moins {#limit} caractères',
        'string.max': 'Le nom d\'utilisateur ne doit pas dépasser {#limit} caractères',
        'any.required': 'Le nom d\'utilisateur est requis'
      }),
    avatar: Joi.string()
      .allow('')
      .optional()
      .messages({
        'string.base': 'Le chemin de l\'avatar doit être une chaîne de caractères'
      }),
    email: Joi.string()
      .email()
      .allow('',null)
      .optional()
      .default('')
      .messages({
        'string.email': 'Format d\'email invalide',
        'any.required': 'L\'email est requis'
      }),
    firstName: Joi.string()
      .max(50)
      .allow('')
      .optional()
      .messages({
        'string.max': 'Le prénom ne doit pas dépasser {#limit} caractères'
      }),
    lastName: Joi.string()
      .max(50)
      .allow('')
      .optional()
      .messages({
        'string.max': 'Le nom ne doit pas dépasser {#limit} caractères'
      }),
    dateOfBirth: Joi.date()
      .optional()
      .allow(null)
      .messages({
        'date.base': 'Format de date invalide'
      }),
    gender: Joi.string()
      .valid('homme', 'femme', 'autre', 'non_specifie')
      .default('non_specifie')
      .messages({
        'any.only': 'Genre invalide'
      }),
    profession: Joi.string()
      .max(100)
      .allow('')
      .optional()
      .messages({
        'string.max': 'La profession ne doit pas dépasser {#limit} caractères'
      }),
    job: Joi.string()
      .max(100)
      .allow('')
      .optional()
      .messages({
        'string.max': 'L\'emploi ne doit pas dépasser {#limit} caractères'
      }),
    description: Joi.string()
      .max(500)
      .allow('')
      .optional()
      .messages({
        'string.max': 'La description ne doit pas dépasser {#limit} caractères'
      }),
    location: Joi.object({
      city: Joi.string()
        .max(100)
        .allow('')
        .optional()
        .messages({
          'string.max': 'Le nom de la ville ne doit pas dépasser {#limit} caractères'
        }),
      country: Joi.string()
        .max(100)
        .allow('')
        .optional()
        .messages({
          'string.max': 'Le nom du pays ne doit pas dépasser {#limit} caractères'
        })
    }).optional()
  });

  return schema.validate(data);
};

const checkUniqueFields = async (userId, { username, email }) => {
  const existingUser = await UserRepo.findOneUser({
    $or: [
      { email, _id: { $ne: userId } },
      { username, _id: { $ne: userId } }
    ]
  });

  if (existingUser) {
    if (existingUser.email === email) {
      throw new Error('Cet email est déjà utilisé');
    }
    throw new Error('Ce nom d\'utilisateur est déjà pris');
  }
};
const Joi = require('joi');

// Initialisation du cache avec une durée de vie de 300 secondes
const statsCache = new NodeCache({ stdTTL: 300 });
const emailVerificationCache = new NodeCache({ stdTTL: 3600 }); // Cache pour les tentatives de vérification d'email

const MAX_VERIFICATION_ATTEMPTS = 3;
const EMAIL_TOKEN_EXPIRY = '1h';

const register = async (userData) => {
    try {
        // Validation du schéma avec Joi
        const schema = Joi.object({
            name: Joi.string()
                .min(3)
                .max(30)
                .required()
                .messages({
                    'string.min': 'Le nom doit contenir au moins {#limit} caractères',
                    'string.max': 'Le nom ne doit pas dépasser {#limit} caractères',
                    'any.required': 'Le nom est requis'
                }),
            email: Joi.string()
                .email()
                .required()
                .messages({
                    'string.email': 'Format d\'email invalide',
                    'any.required': 'L\'email est requis'
                }),
            password: Joi.string()
                .min(8)
                .required()
                .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
                .messages({
                    'string.min': 'Le mot de passe doit contenir au moins {#limit} caractères',
                    'string.pattern.base': 'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre',
                    'any.required': 'Le mot de passe est requis'
                })
        });

        const { error } = schema.validate(userData);
        if (error) {
            console.warn('Validation error:', error.details[0].message);
            return {
                status: 422,
                message: error.details[0].message,
                data: null
            };
        }

        const { email } = userData;

        // Vérifier si l'utilisateur existe déjà
        const isExisting = await existingUser(email);
        if (isExisting) {
            return {
                status: 422,
                message: 'Un compte existe déjà avec cet email',
                data: null
            };
        }

        // Vérifier si une demande est en cours
        const existingTmpUser = await TmpUserRepo.findTmpUserByEmail(email);
        if (existingTmpUser) {
            return {
                status: 422,
                message: 'Une demande de création de compte est déjà en cours',
                data: null
            };
        }

        // Créer l'utilisateur temporaire
        const user = await TmpUserRepo.createTmpUser(userData);

        // Générer le lien d'activation
        const link = `${process.env.CLIENT_URL}/#${process.env.ACTIVATION_PATH}?token=${user.token}&id=${user._id}`;
        const payload = { name: user.name, link };
        
        // Envoyer l'email de vérification
        await sendEmail(
            user.email,
            "Vérification et activation de compte",
            payload,
            "./template/emailVerification.handlebars"
        );

        return {
            status: 200,
            message: 'Un email de vérification a été envoyé',
            data: null
        };
    } catch (error) {
        console.error('Erreur register:', error);
        return {
            status: 500,
            message: 'Erreur lors de la création du compte',
            data: null,
            error: error.message
        };
    }
};

const Activate = async (payload) => {
    const { token, userId } = payload;
    console.log('Activation - Début du processus:', { userId, token });

    try {
        // Vérification des paramètres
        if (!token || !userId) {
            console.warn('Activation - Paramètres manquants:', { token, userId });
            return {
                status: 400,
                isOk: false,
                message: "Token et ID requis pour l'activation",
                data: null
            };
        }

        // Trouver l'utilisateur temporaire
        console.log('Activation - Recherche utilisateur temporaire:', userId);
        const tmpUser = await TmpUserRepo.findTmpUser(userId);
        
        if (!tmpUser) {
            console.warn('Activation - Utilisateur temporaire non trouvé:', userId);
            return {
                status: 401,
                isOk: false,
                message: "Token d'activation invalide ou expiré",
                data: null
            };
        }

        console.log('Activation - Utilisateur temporaire trouvé:', {
            email: tmpUser.email,
            name: tmpUser.name,
            createdAt: tmpUser.createdAt
        });

        // Vérifier le token
        if (tmpUser.token !== token) {
            console.warn('Activation - Token invalide:', {
                provided: token,
                expected: tmpUser.token
            });
            return {
                status: 401,
                isOk: false,
                message: "Token d'activation invalide",
                data: null
            };
        }

        // Vérifier si l'utilisateur existe déjà
        const existingUser = await UserRepo.findOneUser({ email: tmpUser.email });
        if (existingUser) {
            console.warn('Activation - Email déjà utilisé:', tmpUser.email);
            return {
                status: 409,
                isOk: false,
                message: "Un compte existe déjà avec cet email",
                data: null
            };
        }

        // Validation des données avant création
        const userDataSchema = Joi.object({
            username: Joi.string().required().min(3).max(30),
            email: Joi.string().required().email(),
            password: Joi.string().required(),
            firstName: Joi.string().allow('', null),
            lastName: Joi.string().allow('', null),
            avatar: Joi.string().allow('', null),
            dateOfBirth: Joi.date().allow(null),
            gender: Joi.string().valid('homme', 'femme', 'autre', 'non_specifie').default('non_specifie'),
            profession: Joi.string().allow('', null),
            description: Joi.string().allow('', null)
        });

        // Préparer les données complètes de l'utilisateur
        const userData = {
            username: tmpUser.name,
            email: tmpUser.email,
            password: tmpUser.password,
            firstName: tmpUser.firstName || '',
            lastName: tmpUser.lastName || '',
            avatar: tmpUser.avatar || '',
            dateOfBirth: tmpUser.dateOfBirth || null,
            gender: tmpUser.gender || 'non_specifie',
            profession: tmpUser.profession || '',
            description: tmpUser.description || '',
            is_active: true,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        // Valider les données
        const { error } = userDataSchema.validate(userData);
        if (error) {
            console.error('Activation - Erreur de validation:', error.details[0].message);
            throw new Error(`Données utilisateur invalides: ${error.details[0].message}`);
        }

        console.log('Activation - Données utilisateur validées:', {
            username: userData.username,
            email: userData.email,
            hasOptionalFields: {
                firstName: !!userData.firstName,
                lastName: !!userData.lastName,
                avatar: !!userData.avatar,
                dateOfBirth: !!userData.dateOfBirth,
                profession: !!userData.profession
            }
        });

        // Créer l'utilisateur permanent
        // Tentative de création de l'utilisateur avec gestion des erreurs détaillée
        console.log('Activation - Tentative de création utilisateur:', {
            email: userData.email,
            username: userData.username,
            timestamp: new Date().toISOString()
        });

        let newUser;
        try {
            newUser = await UserRepo.createUser(userData);
            
            if (!newUser) {
                console.error('Activation - Échec création utilisateur: résultat null');
                throw new Error("Échec de la création de l'utilisateur permanent");
            }

            console.log('Activation - Utilisateur créé avec succès:', {
                id: newUser._id,
                email: newUser.email,
                username: newUser.username,
                hasProfile: !!newUser.firstName || !!newUser.lastName,
                timestamp: new Date().toISOString()
            });

            // Envoyer un email de bienvenue
            await sendEmail(
                newUser.email,
                "Bienvenue sur TaskManager",
                { name: newUser.username },
                "./template/welcome.handlebars"
            );

        } catch (createError) {
            console.error('Activation - Erreur création utilisateur:', {
                error: createError.message,
                code: createError.code,
                timestamp: new Date().toISOString()
            });

            // Gestion spécifique des erreurs MongoDB
            if (createError.code === 11000) {
                throw new Error('Un utilisateur avec cet email ou ce nom existe déjà');
            }

            throw new Error(`Erreur lors de la création de l'utilisateur: ${createError.message}`);
        }

        // Supprimer l'utilisateur temporaire
        console.log('Activation - Suppression utilisateur temporaire:', userId);
        await TmpUserRepo.deleteTmpUser(userId);

        return {
            status: 200,
            isOk: true,
            message: "Compte activé avec succès",
            data: {
                _id: newUser._id,
                username: newUser.username,
                email: newUser.email,
                is_active: newUser.is_active
            }
        };

    } catch (error) {
        console.error('Activation - Erreur:', error);
        return {
            status: 500,
            isOk: false,
            message: "Erreur lors de l'activation du compte",
            error: error.message,
            data: null
        };
    }
};

const login = async ({email, password}, req = {}) => {
    // 1. Log détaillé de la requête entrante
    console.log('Login - Tentative de connexion:', {
        timestamp: new Date().toISOString(),
        email,
        ip: req.ip || 'non disponible',
        userAgent: req?.headers?.['user-agent'] || 'non disponible',
        method: req.method || 'non disponible',
        endpoint: '/api/auth/login'
    });

    const SECRET = process.env.JWT_SECRET;
    const expiresIn = process.env.TOKEN_EXPIRES_IN || '24h';

    // 2. Log des vérifications de sécurité
    console.log('Login - Vérification configuration:', {
        hasJwtSecret: !!SECRET,
        expiresIn,
        timestamp: new Date().toISOString()
    });

    if (!SECRET) {
        throw new Error('Configuration de sécurité manquante');
    }

    try {
        const connectingUser = await UserRepo.findOneUser({email});
            
            // 3. Log des étapes critiques
            if(!connectingUser) {
                // Log des tentatives suspectes
                console.warn('Login - Échec authentification:', {
                    reason: 'USER_NOT_FOUND',
                    email,
                    timestamp: new Date().toISOString(),
                    attempt: 'user_lookup'
                });
                // Délai constant pour éviter les timing attacks
                await bcrypt.hash('dummy', 10);
                return {
                    status: 401,
                    message: 'Identifiants invalides', 
                    data: null
                };
            }

            console.log('Login - Utilisateur trouvé:', {
                userId: connectingUser._id,
                email: connectingUser.email,
                timestamp: new Date().toISOString()
            });

        const isPasswordValid = await bcrypt.compare(password, connectingUser.password);
        
        if (!isPasswordValid) {
            // Log des tentatives suspectes
            console.warn('Login - Échec authentification:', {
                reason: 'INVALID_PASSWORD',
                userId: connectingUser._id,
                timestamp: new Date().toISOString(),
                attempt: 'password_validation'
            });
            return { 
                status: 401, 
                message: 'Identifiants invalides',  
                data: null 
            };
        }
        
        // Log du succès de l'authentification
        console.log('Login - Authentification réussie:', {
            userId: connectingUser._id,
            timestamp: new Date().toISOString()
        });

        const tokenPayload = {
            userId: connectingUser._id,
            role: connectingUser.role || 'user'
        };

        // Génération du token d'accès avec algorithme spécifié
        const accessToken = jwt.sign(
            tokenPayload, 
            SECRET, 
            {
                expiresIn,
                algorithm: 'HS256'
            }
        );

        // Génération du refresh token avec algorithme spécifié
        const refreshToken = jwt.sign(
            tokenPayload, 
            SECRET, 
            {
                expiresIn: '7d',
                algorithm: 'HS256'
            }
        );

        // Retourner uniquement les données nécessaires
        const {password: _, __v, is_active, ...userInfo} = connectingUser.toJSON();

        return {
            status: 200,  
            message: 'Authentification réussie', 
            data: {
                user: userInfo, 
                accessToken, 
                refreshToken
            }
        };

    } catch (error) {
        return { 
            status: 500, 
            message: 'Erreur lors de l\'authentification', 
            data: null 
        };
    }
};

const getUserTasks = async (userId) => {
    try {
        console.log('Récupération des tâches pour userId:', userId);
        const tasks = await Task.find({ owner: new mongoose.Types.ObjectId(userId) })
            .select('-__v')
            .sort({ createdAt: -1 });
            
        return tasks;
    } catch (error) {
        throw new Error('Erreur lors de la récupération des tâches');
    }
};

const updateUserTask = async (userId, taskId, updates) => {
    try {
        console.log('Recherche de la tâche:', { taskId, userId });
        const task = await Task.findOne({
            _id: new mongoose.Types.ObjectId(taskId),
            owner: new mongoose.Types.ObjectId(userId)
        });

        if (!task) {
            throw new Error('Tâche non trouvée ou accès non autorisé');
        }
        
        // Mise à jour sécurisée des champs autorisés uniquement
        const allowedUpdates = ['title', 'description', 'status', 'priority'];
        const sanitizedUpdates = Object.keys(updates)
            .filter(key => allowedUpdates.includes(key))
            .reduce((obj, key) => {
                obj[key] = updates[key];
                return obj;
            }, {});

        Object.assign(task, sanitizedUpdates);
        const updatedTask = await task.save();
        
        return updatedTask;
    } catch (error) {
        throw new Error('Erreur lors de la mise à jour de la tâche');
    }
};

// Méthodes utilitaires pour la recherche d'utilisateurs
const findUserByEmail = async (email) => {
    return await UserRepo.findOneUser({email});
};

const existingUser = async (email) => {
    const user = await findUserByEmail(email);
    return !!user;
};

const findUserById = async (userId) => {
    return await UserRepo.findOneUser({_id: userId});
};

const initiateEmailChange = async (userId, newEmail) => {
  try {
    const user = await findUserById(userId);
    if (!user) {
      return {
        status: 404,
        message: 'Utilisateur non trouvé',
        data: null
      };
    }

    if (user.email === newEmail) {
      return {
        status: 400,
        message: 'La nouvelle adresse email est identique à l\'actuelle',
        data: null
      };
    }

    // Vérifier si l'email est déjà utilisé
    const existingUser = await findUserByEmail(newEmail);
    if (existingUser) {
      return {
        status: 400,
        message: 'Cette adresse email est déjà utilisée',
        data: null
      };
    }

    // Générer un token de vérification
    const token = jwt.sign(
      { userId, newEmail },
      process.env.JWT_SECRET,
      { expiresIn: EMAIL_TOKEN_EXPIRY }
    );

    // Stocker les informations de vérification
    user.pendingEmail = newEmail;
    user.emailVerificationToken = token;
    try {
        console.log('Sauvegarde des modifications utilisateur:', userId);
        await user.save();
        console.log('Modifications sauvegardées avec succès');
    } catch (saveError) {
        console.error('Erreur lors de la sauvegarde:', saveError);
        throw saveError;
    }

    // Réinitialiser le compteur de tentatives
    emailVerificationCache.set(`${userId}_attempts`, 0);

    // Envoyer l'email de vérification
    const link = `${process.env.CLIENT_URL}/verify-email?token=${token}`;
    await sendEmail(
      newEmail,
      "Vérification de votre nouvelle adresse email",
      { name: user.username, link },
      "./template/emailVerification.handlebars"
    );

    return {
      status: 200,
      message: 'Email de vérification envoyé',
      data: null
    };
  } catch (error) {
    return {
      status: 500,
      message: 'Erreur lors de l\'initialisation du changement d\'email',
      data: null
    };
  }
};

const updateUserProfile = async (userId, userData) => {
  try {
    // Validation des données
    const { error } = validateProfileUpdate(userData);
    if (error) {
      throw new Error(error.details[0].message);
    }

    const user = await findUserById(userId);
    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    // Si l'email est modifié, initier le processus de vérification
    if (userData.email && userData.email !== user.email) {
      const emailChangeResult = await initiateEmailChange(userId, userData.email);
      if (emailChangeResult.status !== 200) {
        throw new Error(emailChangeResult.message);
      }
      // Supprimer l'email des données à mettre à jour
      delete userData.email;
    }

    // Vérification unicité username
    if (userData.username) {
      await checkUniqueFields(userId, { username: userData.username });
    }

    // Mise à jour du profil
    console.log('Mise à jour du profil pour userId:', userId);
    console.log('Données de mise à jour:', userData);

    const updatedUser = await UserRepo.updateUser(userId, {
        ...userData,
        updatedAt: new Date()
    });

    console.log('Profil mis à jour:', updatedUser);

    const { password, __v, ...userFields } = updatedUser.toJSON();
    return {
      success: true,
      data: userFields
    };

  } catch (error) {
    throw new Error(`Erreur mise à jour profil: ${error.message}`);
  }
};

const verifyEmailUpdate = async (token) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const { userId, newEmail } = decoded;

        const user = await findUserById(userId);
        
        if (!user || user.emailVerificationToken !== token) {
            return {
                status: 400,
                message: 'Token de vérification invalide ou expiré',
                data: null
            };
        }

        // Vérifier le nombre de tentatives
        const attempts = emailVerificationCache.get(`${userId}_attempts`) || 0;
        if (attempts >= MAX_VERIFICATION_ATTEMPTS) {
            return {
                status: 429,
                message: 'Nombre maximum de tentatives atteint. Veuillez réinitier le processus.',
                data: null
            };
        }

        emailVerificationCache.set(`${userId}_attempts`, attempts + 1);

        if (user.pendingEmail !== newEmail) {
            return {
                status: 400,
                message: 'Email en attente ne correspond pas',
                data: null
            };
        }

        // Mettre à jour l'email et supprimer les champs temporaires
        user.email = user.pendingEmail;
        user.pendingEmail = undefined;
        user.emailVerificationToken = undefined;
        
        await user.save();

        // Nettoyer le cache des tentatives
        emailVerificationCache.del(`${userId}_attempts`);

        // Envoyer un email de confirmation
        await sendEmail(
            user.email,
            "Confirmation de changement d'adresse email",
            {
                name: user.username,
                message: "Votre adresse email a été mise à jour avec succès."
            },
            "./template/welcome.handlebars"
        );

        return {
            status: 200,
            message: 'Adresse email mise à jour avec succès',
            data: {
                email: user.email
            }
        };
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return {
                status: 400,
                message: 'Token de vérification invalide',
                data: null
            };
        }
        
        if (error.name === 'TokenExpiredError') {
            return {
                status: 400,
                message: 'Le token de vérification a expiré',
                data: null
            };
        }

        return {
            status: 500,
            message: 'Erreur lors de la vérification de l\'email',
            data: null
        };
    }
};

const getProfile = async (userId) => {
    try {
        console.log('Récupération du profil pour userId:', userId);
        const user = await UserRepo.findOneUser({ _id: userId });
        
        if (!user) {
            return {
                status: 404,
                message: 'Utilisateur non trouvé',
                data: null
            };
        }

        // Exclure les données sensibles
        const { password, __v, ...userProfile } = user.toJSON();
        
        console.log('Profil récupéré avec succès');
        return {
            status: 200,
            message: 'Profil récupéré avec succès',
            data: userProfile
        };
    } catch (error) {
        console.error('Erreur getProfile:', error);
        return {
            status: 500,
            message: 'Erreur lors de la récupération du profil',
            data: null
        };
    }
};

const getUserStats = async (userId) => {
    // Validation de l'userId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return {
            status: 400,
            message: 'Format d\'identifiant utilisateur invalide',
            data: null
        };
    }

    // Vérification du cache
    const cacheKey = `stats_${userId}`;
    const cachedStats = statsCache.get(cacheKey);
    if (cachedStats) {
        return {
            status: 200,
            message: 'Statistiques récupérées depuis le cache',
            data: cachedStats
        };
    }

    try {
        // Utilisation d'une seule requête avec agrégation et timeout
        const [stats] = await Task.aggregate([
            { $match: { owner: userId } },
            {
                $group: {
                    _id: null,
                    totalTasks: { $sum: 1 },
                    completedTasks: {
                        $sum: {
                            $cond: [{ $eq: ["$status", "completed"] }, 1, 0]
                        }
                    },
                    pendingTasks: {
                        $sum: {
                            $cond: [{ $eq: ["$status", "pending"] }, 1, 0]
                        }
                    },
                    importantTasks: {
                        $sum: {
                            $cond: [{ $eq: ["$isImportant", true] }, 1, 0]
                        }
                    }
                }
            }
        ]).option({ maxTimeMS: 5000 });

        const result = stats || { 
            totalTasks: 0, 
            completedTasks: 0, 
            pendingTasks: 0,
            importantTasks: 0
        };

        const completionRate = result.totalTasks > 0
            ? Math.round((result.completedTasks / result.totalTasks) * 100)
            : 0;

        const statsData = {
            totalTasks: result.totalTasks,
            completedTasks: result.completedTasks,
            pendingTasks: result.pendingTasks,
            importantTasks: result.importantTasks,
            completionRate
        };

        // Mise en cache des résultats
        statsCache.set(cacheKey, statsData);

        return {
            status: 200,
            message: 'Statistiques récupérées avec succès',
            data: statsData
        };
    } catch (error) {
        console.error('Erreur getUserStats:', error);
        
        // Différenciation des erreurs MongoDB
        if (error.name === 'MongoServerError') {
            return {
                status: 503,
                message: 'Service de base de données temporairement indisponible',
                data: null
            };
        }

        return {
            status: 500,
            message: 'Erreur lors de la récupération des statistiques',
            data: null
        };
    }
};

const updateUserStatus = async (userId, updates) => {
    try {
        // Vérifier les paramètres
        if (!userId || !updates) {
            throw new Error('Paramètres manquants pour la mise à jour du statut');
        }

        // Log pour debug
        console.log('Updating user status:', { userId, updates });

        // Valider et filtrer les champs à mettre à jour
        const validFields = ['username', 'email', 'location', 'profession'];
        // Vérifier et nettoyer les données de mise à jour
        console.log('Données de mise à jour brutes:', updates);
        const filteredUpdates = Object.entries(updates)
            .filter(([key]) => validFields.includes(key))
            .reduce((obj, [key, value]) => {
                obj[key] = value;
                return obj;
            }, {});
        console.log('Données de mise à jour filtrées:', filteredUpdates);

        // Vérifier qu'il reste des champs à mettre à jour
        if (Object.keys(filteredUpdates).length === 0) {
            throw new Error('Aucun champ valide à mettre à jour');
        }

        // Effectuer la mise à jour
        const updatedUser = await UserRepo.updateUser(
            userId,
            filteredUpdates
        );

        if (!updatedUser) {
            throw new Error('Utilisateur non trouvé');
        }

        return {
            success: true,
            user: updatedUser
        };

    } catch (error) {
        console.error('Error in updateUserStatus:', error);
        throw error;
    }
};

module.exports = {
    findUserByEmail,
    findUserById,
    getProfile,
    register,
    Activate,
    login,
    getUserTasks,
    updateUserTask,
    updateUserProfile,
    getUserStats,
    verifyEmailUpdate,
    validateProfileUpdate,
    checkUniqueFields,
    initiateEmailChange,
    updateUserStatus
};