const { Schema, model } = require('mongoose');

const taskSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    status: {
        type: String,
        enum: ['pending', 'done', 'deleted'],
        default: 'pending',
    },
    category: {
        type: String,
        enum: ['Personal', 'Work', 'Shopping', 'Travel', 'School', 'Home', 'Other', 'default'],
        default: 'Personal',
        required: true
    },
    dueDate: {
        type: Date,
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "user",
        required: false,
    },
    // Nouveau champ pour marquer les tâches importantes
    isImportant: {
        type: Boolean,
        default: false,
    }
}, {
    timestamps: true
});

// Indices pour optimiser les performances
taskSchema.index({ owner: 1, status: 1 }); // Pour filtrer les tâches par utilisateur et statut
taskSchema.index({ dueDate: 1 }); // Pour trier par date d'échéance
taskSchema.index({ category: 1 }); // Pour filtrer par catégorie
taskSchema.index({ isImportant: 1 }); // Pour filtrer les tâches importantes
taskSchema.index({ title: 1, owner: 1 }); // Pour le tri par titre
taskSchema.index({ createdAt: 1, owner: 1 }); // Pour le tri par date

const Task = model('task', taskSchema);

module.exports = Task;