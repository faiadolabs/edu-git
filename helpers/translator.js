/* *
 * require I18n with capital I as constructor
 */
const { I18n } = require('i18n')
const path = require('path');

/**
 * create a new instance with it's configuration
 */
const i18n = new I18n({
  locales: ['en', 'es'],
  directory: path.join(__dirname, '../i18n'),
  objectNotation: true
})

// Detectar el idioma del sistema
const systemLang = process.env.LANG || 'en';
const langCode = systemLang.split('_')[0]; // Extraer el código de idioma (por ejemplo, 'es' de 'es_ES.UTF-8')

// Establecer el idioma en función del entorno
i18n.setLocale(langCode);

module.exports = i18n;