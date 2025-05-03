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

    createdAt: {
        type: Date,
        default: Date.now,
        required: true,
        expires: '3600s' // Augmenter à 1 heure
    }

})

tmpUserSchema.pre('save', async function (next) {
    if (this.isNew) {
      this.password = await hashedPassword(this.password)
      this.token = await genToken();  
    }
    next()
  })

const tmpUser = model('tmpuser', tmpUserSchema);


module.exports = tmpUser;