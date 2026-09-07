const appConfig = require("./app.config");
const dbConfig = require("./db.config");
const aiConfig = require("./ai.config");

/**
 * Validates configuration at server startup.
 * Throws an error in production if critical variables are missing.
 */
function validateConfig() {
  const errors = [...(appConfig.missing || []), ...(dbConfig.missing || [])];
  const warnings = [...(appConfig.warnings || []), ...(dbConfig.warnings || [])];

  if (warnings.length > 0) {
    warnings.forEach((warn) => console.warn(`⚠️  [Config Warning] ${warn}`));
  }

  if (errors.length > 0) {
    errors.forEach((err) => console.error(`❌ [Config Error] ${err}`));
    if (appConfig.isProduction) {
      throw new Error(`Server failed to start due to ${errors.length} missing configuration variable(s).`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

module.exports = {
  appConfig,
  dbConfig,
  aiConfig,
  validateConfig,
};
