const path = require("path");
const dotenv = require("dotenv");

// Load backend-local .env first, then fallback to project root .env
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

module.exports = process.env;
