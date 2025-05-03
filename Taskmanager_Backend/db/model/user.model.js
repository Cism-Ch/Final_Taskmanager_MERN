const { Schema, model } = require('mongoose');
const validator = require('validator');

const userSchema = new Schema({
    // Champs existants
    username: {
        type: String,
        required: [true, "Le nom d'utilisateur est requis"],
        unique: true,
        trim: true,
        minlength: [3, "Le nom d'utilisateur doit contenir au moins 3 caractères"],
        maxlength: [30, "Le nom d'utilisateur ne doit pas dépasser 30 caractères"]
    },
    email: {
        type: String,
        required: [true, "L'email est requis"],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Format d'email invalide"]
    },
    // Champs de vérification d'email
    pendingEmail: {
        type: String,
        trim: true,
        lowercase: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Format d'email invalide"],
        sparse: true
    },
    emailVerificationToken: {
        type: String,
        sparse: true
    },
    emailVerificationExpires: {
        type: Date,
        sparse: true
    },
    emailVerificationAttempts: {
        type: Number,
        default: 0
    },
    is_active: {
        type: Boolean,
        default: false,
        required: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
        trim: true
    },


    // Nouveaux champs - Informations personnelles
    firstName: {
        type: String,
        trim: true,
        maxlength: 30
    },
    lastName: {
        type: String,
        trim: true,
        maxlength: 20
    },

    dateOfBirth: { type: Date },
    gender: {
        type: String,
        enum: ['homme', 'femme', 'non_specifie'],
        default: 'non_specifie'
    },

    // Informations professionnelles
    profession: { type: String, trim: true },

    // Profil
    avatar: {
        type: String,
        default: 'defaultProfile.svg'
    },
    description: {
        type: String,
        trim: true,
        maxlength: 500
    },
    location: {
        city: { type: String, trim: true },
        country: { type: String, trim: true }
    },

    // Statut en ligne
    onlineStatus: {
        type: String,
        enum: ['en_ligne', 'absent', 'ne_pas_deranger', 'hors_ligne'],
        default: 'en_ligne'
    },
    lastActivity: {
        type: Date,
        default: Date.now
    },

    // Statistiques
    stats: {
        tasksCreated: { type: Number, default: 0 },
        tasksCompleted: { type: Number, default: 0 },
        tasksDeleted: { type: Number, default: 0 }
    },

}, {
    timestamps: true // Ajoute automatiquement createdAt et updatedAt
});

// Indices pour optimiser les performances
userSchema.index({ onlineStatus: 1 }); // Pour le filtrage par statut
userSchema.index({ sparse: true }); // Pour la recherche des emails en attente
userSchema.index({ sparse: true, expireAfterSeconds: 86400 }); // TTL index 24h
userSchema.index({ 'location.country': 1, 'location.city': 1 }); // Pour la recherche géographique
userSchema.index({ lastActivity: -1 }); // Pour le tri par dernière activité

// Middleware pre-save pour vérifier les doublons
userSchema.pre('save', async function(next) {
    // Ne pas valider pour les mises à jour d'avatar uniquement
    const modifiedPaths = this.modifiedPaths();
    if (modifiedPaths.length === 1 && modifiedPaths[0] === 'avatar') {
        return next();
    }

    // Validation du nombre maximum de tentatives de vérification
    const MAX_VERIFICATION_ATTEMPTS = 5;
    if (this.emailVerificationAttempts >= MAX_VERIFICATION_ATTEMPTS) {
        throw new Error('Nombre maximum de tentatives de vérification atteint');
    }

    // Gestion du pendingEmail
    if (this.isModified('pendingEmail')) {
        // Vérifier que pendingEmail est différent de l'email actuel
        if (this.pendingEmail === this.email) {
            throw new Error('La nouvelle adresse email doit être différente de l\'adresse actuelle');
        }
        // Générer un nouveau token et définir son expiration
        this.emailVerificationToken = require('crypto').randomBytes(32).toString('hex');
        this.emailVerificationExpires = new Date(Date.now() + 86400000); // 24 heures
        this.emailVerificationAttempts = 0;
    }

    // Valider uniquement si email ou username sont modifiés
    if (this.isModified('email') || this.isModified('username')) {
        const existingUser = await this.constructor.findOne({
            $and: [
                { _id: { $ne: this._id } },
                {
                    $or: [
                        { email: this.email?.toLowerCase() },
                        { username: this.username }
                    ]
                }
            ]
        });

        if (existingUser) {
            if (existingUser.email === this.email?.toLowerCase()) {
                throw new Error('Cet email est déjà utilisé');
            }
            throw new Error('Ce nom d\'utilisateur est déjà pris');
        }
    }
    next();
});

// Middleware pour la mise à jour
userSchema.pre('findOneAndUpdate', function(next) {
    this.options.runValidators = true;
    this.options.context = 'query';
    this.options.new = true; // Pour retourner le document mis à jour
    
    const update = this.getUpdate();
    if (update.$set) {
        // Si c'est une mise à jour d'avatar uniquement, ne pas valider les autres champs
        const updateFields = Object.keys(update.$set);
        if (updateFields.length === 1 && updateFields[0] === 'avatar') {
            this.options.runValidators = false;
        }
    }
    
    next();
});

// Middleware pour vérifier les mises à jour
userSchema.post('findOneAndUpdate', async function(doc) {
    if (!doc) {
        throw new Error('Utilisateur non trouvé');
    }
});

// Création et export du modèle
module.exports = model('user', userSchema);