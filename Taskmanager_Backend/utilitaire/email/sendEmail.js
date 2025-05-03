const Mailjet = require('node-mailjet');
const handlebars = require("handlebars");
const fs = require("fs");
const path = require("path");

/**
 * Configure et retourne une instance Mailjet
 * @returns {Object} Instance Mailjet configurée
 * @throws {Error} Si les variables d'environnement ne sont pas configurées
 */
const configureMailjet = () => {
  if (!process.env.MJ_APIKEY_PUBLIC || !process.env.MJ_APIKEY_PRIVATE) {
    throw new Error("Configuration Mailjet manquante. Veuillez définir MJ_APIKEY_PUBLIC et MJ_APIKEY_PRIVATE dans vos variables d'environnement.");
  }

  return Mailjet.apiConnect(
    process.env.MJ_APIKEY_PUBLIC,
    process.env.MJ_APIKEY_PRIVATE
  );
};

/**
 * Vérifie la validité des paramètres d'entrée
 * @param {string} email - Adresse email du destinataire
 * @param {string} subject - Sujet de l'email
 * @param {Object} payload - Données pour le template
 * @param {string} template - Chemin vers le template
 * @throws {Error} Si les paramètres sont invalides
 */
const validateParams = (email, subject, payload, template) => {
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    throw new Error("Adresse email invalide");
  }
  if (!subject || typeof subject !== 'string') {
    throw new Error("Sujet de l'email requis");
  }
  if (!payload || typeof payload !== 'object') {
    throw new Error("Payload invalide pour le template");
  }
  if (!template || typeof template !== 'string') {
    throw new Error("Chemin du template invalide");
  }
};

/**
 * Envoie un email via Mailjet en utilisant un template Handlebars
 * @param {string} email - Adresse email du destinataire
 * @param {string} subject - Sujet de l'email
 * @param {Object} payload - Données pour le template
 * @param {string} template - Chemin vers le template
 * @returns {Promise<Object>} Résultat de l'envoi
 */
const sendEmail = async (email, subject, payload, template) => {
  try {
    // Validation des paramètres
    validateParams(email, subject, payload, template);

    // Configuration de Mailjet
    const mailjet = configureMailjet();

    // Lecture et compilation du template
    const templatePath = path.join(__dirname, template);
    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template non trouvé: ${template}`);
    }

    const source = fs.readFileSync(templatePath, "utf8");
    const compiledTemplate = handlebars.compile(source);
    const htmlContent = compiledTemplate(payload);

    // Préparation de l'email
    const messageData = {
      Messages: [
        {
          From: {
            Email: process.env.MJ_SENDER_EMAIL || 'your-sender@domain.com',
            Name: process.env.MJ_SENDER_NAME || 'Your Sender Name'
          },
          To: [{
            Email: email
          }],
          Subject: subject,
          HTMLPart: htmlContent
        }
      ]
    };

    // Envoi de l'email
    const response = await mailjet.post('send', { version: 'v3.1' }).request(messageData);
    
    return {
      success: true,
      messageId: response.body.Messages[0].To[0].MessageID,
      status: 'sent'
    };

  } catch (error) {
    // Gestion détaillée des erreurs
    let errorMessage = "Erreur lors de l'envoi de l'email";
    let errorType = "UNKNOWN_ERROR";

    if (error.statusCode === 401) {
      errorType = "AUTH_ERROR";
      errorMessage = "Erreur d'authentification Mailjet";
    } else if (error.statusCode === 429) {
      errorType = "RATE_LIMIT_ERROR";
      errorMessage = "Limite de taux d'envoi dépassée";
    } else if (error.message.includes("Template")) {
      errorType = "TEMPLATE_ERROR";
      errorMessage = error.message;
    } else if (error.message.includes("email invalide")) {
      errorType = "VALIDATION_ERROR";
      errorMessage = error.message;
    }

    console.error(`[${errorType}] ${errorMessage}:`, error);

    return {
      success: false,
      error: {
        type: errorType,
        message: errorMessage,
        details: error.message
      }
    };
  }
};

module.exports = sendEmail;
