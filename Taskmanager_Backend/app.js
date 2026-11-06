const createError = require('http-errors');
const express = require('express');
const path = require('path');
const fs = require('fs');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
require("dotenv").config();

// Middleware personnalisé pour le logging des erreurs
const errorLogger = (err, req, res, next) => {
  console.error('Erreur:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    headers: req.headers
  });
  next(err);
};

require('./db/connection')

var taskRouter = require('./routes/task.route');
var authRouter = require('./routes/auth.route');
var userRouter = require('./routes/user.route');
var app = express();

// // view engine setup (désactivé car l'API renvoie uniquement du JSON)
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'jade');

const corsOptions = {
  origin: process.env.CLIENT_URL,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  credentials: true,
  maxAge: 86400,
  optionsSuccessStatus: 200
};

// Appliquer CORS avant tout autre middleware
app.use(cors(corsOptions));

// Log détaillé des requêtes pour le débogage
app.use((req, res, next) => {
  console.group('Requête entrante');
  console.log({
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    origin: req.headers.origin,
    authorization: req.headers.authorization ? 'Présent' : 'Absent',
    contentType: req.headers['content-type'],
    query: req.query,
    body: req.method !== 'GET' ? req.body : undefined
  });
  console.groupEnd();

  // Log de la réponse
  const oldSend = res.send;
  res.send = function(data) {
    console.group('Réponse sortante');
    console.log({
      statusCode: res.statusCode,
      headers: res.getHeaders(),
      timestamp: new Date().toISOString()
    });
    console.groupEnd();
    oldSend.apply(res, arguments);
  };

  next();
});

// Middleware pour déboguer les requêtes CORS
app.use((req, res, next) => {
  console.log('Requête reçue:', {
    method: req.method,
    url: req.url,
    origin: req.headers.origin,
    authorization: req.headers.authorization ? 'Present' : 'Absent'
  });
  next();
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Configuration des fichiers statiques avec options spécifiques pour les uploads
const staticOptions = {
    maxAge: '1y',
    etag: true,
    lastModified: true,
    setHeaders: (res, path) => {
        if (path.includes('/uploads/')) {
            res.setHeader('Cache-Control', 'public, max-age=31536000');
            res.setHeader('Access-Control-Allow-Origin', process.env.CLIENT_URL);
        }
    }
};

// Configuration des chemins pour les fichiers statiques
const uploadsPath = path.join(__dirname, 'public', 'uploads');
const publicPath = path.join(__dirname, 'public');

// Créer les répertoires s'ils n'existent pas
if (!fs.existsSync(uploadsPath)) {
    console.log('Création du répertoire uploads:', uploadsPath);
    fs.mkdirSync(uploadsPath, { recursive: true });
}

// Servir les fichiers statiques
app.use('/uploads', (req, res, next) => {
    console.log('Accès fichier statique:', {
        url: req.url,
        fullPath: path.join(uploadsPath, req.url),
        method: req.method,
        origin: req.headers.origin
    });
    next();
}, express.static(uploadsPath, staticOptions));

app.use(express.static(publicPath));

app.use('/tasks', taskRouter);
app.use('/auth', authRouter);
app.use('/users', userRouter);

//
app.get('/', (req, res) => {
  res.status(200).json({ 
    message: 'Taskmanager API is running',
    status: 'ok',
    version: '1.0.0' 
  });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

    // Middleware de logging des erreurs
    app.use(errorLogger);

    // Gestionnaire d'erreurs
    app.use(function(err, req, res, next) {
      // En mode développement, on envoie plus de détails
      const error = req.app.get('env') === 'development'
        ? { message: err.message, stack: err.stack }
        : { message: 'Erreur serveur' };

  // On envoie une réponse JSON au lieu de render
  res.status(err.status || 500).json({
    success: false,
    error
  });
});

module.exports = app;
