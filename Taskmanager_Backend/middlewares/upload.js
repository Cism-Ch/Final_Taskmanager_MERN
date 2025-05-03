const multer = require('multer');
const path = require('path');

// Chemin absolu pour le dossier d'upload
const uploadDir = path.join(__dirname, '..', 'public', 'uploads', 'profiles');

// Configuration du stockage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Création du dossier s'il n'existe pas
        const fs = require('fs');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        console.log('Dossier de destination:', uploadDir);
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const userId = req.user?._id || 'unknown';
        const timestamp = Date.now();
        const ext = path.extname(file.originalname).toLowerCase();
        const newFilename = `profile-${userId}-${timestamp}${ext}`;
        
        console.log('Génération du nom de fichier:', {
            originalName: file.originalname,
            newFilename: newFilename,
            userId: userId,
            timestamp: timestamp
        });
        
        cb(null, newFilename);
    }
});

// Filtre pour les types de fichiers
const fileFilter = (req, file, cb) => {
    console.log('Vérification du type de fichier:', {
        mimetype: file.mimetype,
        originalName: file.originalname,
        size: file.size
    });

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
        console.log('Type de fichier accepté');
        cb(null, true);
    } else {
        console.log('Type de fichier rejeté');
        cb(new Error('Format de fichier non supporté. Utilisez JPG, PNG ou WebP'), false);
    }
};

// Configuration de multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // Limite de 5MB
    }
});

module.exports = upload;