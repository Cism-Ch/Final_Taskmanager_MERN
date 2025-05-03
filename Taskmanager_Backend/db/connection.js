const mongoose = require('mongoose');

// Configuration des événements mongoose
mongoose.connection.on('connected', () => {
  console.log('MongoDB connecté avec succès');
});

mongoose.connection.on('error', (err) => {
  console.error('Erreur de connexion MongoDB:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB déconnecté');
});

// Gestion de l'arrêt propre
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('Connexion MongoDB fermée suite à l\'arrêt de l\'application');
  process.exit(0);
});

// Fonction de connexion
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.DB_URL, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
    });

    console.log('Base de données connectée:', conn.connection.name);
    return conn;
  } catch (err) {
    console.error('Erreur de connexion à MongoDB:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB();