const jwt = require('jsonwebtoken');
const { User } = require('../db/model');

// Constantes pour la sécurité
const BEARER_PREFIX = 'Bearer ';
const JWT_REGEX = /^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/;
const ALLOWED_ALGORITHMS = ['HS256', 'HS384', 'HS512'];

// Vérification de la configuration
if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is not defined');
}

const authenticate = async (req, res, next) => {
    try {
        // 1. Vérification du header Authorization
        const authHeader = req.headers['authorization'];
        if (!authHeader) {
            return res.status(401).json({
                status: 401,
                message: 'Accès refusé. Le token est manquant.'
            });
        }

        // 2. Vérification du format Bearer
        if (!authHeader.startsWith(BEARER_PREFIX)) {
            return res.status(401).json({
                status: 401,
                message: 'Format de token invalide. Le format attendu est: Bearer <token>'
            });
        }

        // 3. Extraction et validation du format JWT
        const token = authHeader.slice(BEARER_PREFIX.length);
        if (!JWT_REGEX.test(token)) {
            return res.status(401).json({
                status: 401,
                message: 'Format JWT invalide'
            });
        }

        // 4. Vérification du token avec algorithmes spécifiés
        const decoded = jwt.verify(token, process.env.JWT_SECRET, {
            algorithms: ALLOWED_ALGORITHMS
        });

        // 5. Validation de la structure du token
        if (!decoded || !decoded.userId) {
            return res.status(401).json({
                status: 401,
                message: 'Structure de token invalide'
            });
        }

        // 6. Vérification de l'existence de l'utilisateur
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({
                status: 401,
                message: 'Utilisateur non trouvé'
            });
        }

        // 7. Vérification du statut du compte
        if (!user.is_active) {
            return res.status(403).json({
                status: 403,
                message: 'Compte non activé'
            });
        }

        // Ajout des logs pour le debugging
        console.log('authenticate - user._id brut:', user._id);
        console.log('authenticate - user._id.toString():', user._id.toString());
        console.log('authenticate - typeof user._id:', typeof user._id);

        // Ajout des informations de l'utilisateur à la requête
        req.user = {
            _id: user._id.toString(), // Conversion explicite en string
            email: user.email,
            name: user.name,
            role: user.role || 'user',
            is_active: user.is_active
        };

        // Ajout des headers de sécurité
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-Frame-Options', 'DENY');
        res.setHeader('X-XSS-Protection', '1; mode=block');

        next();
    } catch (error) {
        // Gestion spécifique des erreurs JWT
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                status: 401,
                message: 'Token expiré'
            });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                status: 401,
                message: 'Token invalide'
            });
        }
        if (error.name === 'NotBeforeError') {
            return res.status(401).json({
                status: 401,
                message: 'Token pas encore valide'
            });
        }

        // Log de l'erreur pour le monitoring
        console.error("Erreur d'authentification:", {
            name: error.name,
            message: error.message,
            timestamp: new Date().toISOString()
        });

        return res.status(500).json({
            status: 500,
            message: 'Erreur interne du serveur lors de l\'authentification'
        });
    }
};

module.exports = authenticate;