const { Schema, model } = require('mongoose');
const validator = require('validator');
const genToken = require('../../utilitaire/gen.token');
const hashedPassword = require('../../utilitaire/hashed.password');

const tmpUserSchema = new Schema({
    name: { type: String, required: true, trim: true },

    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid')
            }
        }
    },
    active: { type: Boolean, default: false },
    token: { type: String },

    password: { type: String, required: true, minlength: 8, trim: true },
    cpassword: {
        type: String,
        required: function() {
            return this.isNew; // requis uniquement lors de la création
        },
        trim: true
    },

    createdAt: {
        type: Date,
        default: Date.now,
        required: true,
        expires: '3600s' // Augmenter à 1 heure
    }

})

// Valider que cpassword correspond à password uniquement pour les nouveaux documents
tmpUserSchema.pre('validate', function(next) {
    // Valider uniquement si c'est un nouveau document ou si cpassword a été modifié
    if (this.isNew || this.isModified('cpassword')) {
        if (this.password !== this.cpassword) {
            this.invalidate('cpassword', 'Les mots de passe ne correspondent pas');
            return next(new Error('Les mots de passe ne correspondent pas'));
        }
    }
    next();
});

// Hash le mot de passe et génère le token avant l'enregistrement
tmpUserSchema.pre('save', async function (next) {
    if (this.isNew) {
        // Hash le password
        this.password = await hashedPassword(this.password);
        // Génère le token
        this.token = await genToken();
        // Supprime le cpassword avant l'enregistrement
        this.cpassword = undefined;
    }
    next();
});

const tmpUser = model('tmpuser', tmpUserSchema);


module.exports = tmpUser;