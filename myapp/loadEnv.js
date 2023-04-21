const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const nodeEnv = process.env.NODE_ENV || 'development';
const envFile = `.env.${nodeEnv}`;
const outputEnvFile = '.env';

const mergeEnvFiles = (baseEnv, newEnv) => {
    const baseEnvConfig = dotenv.parse(fs.readFileSync(baseEnv));
    const newEnvConfig = dotenv.parse(fs.readFileSync(newEnv));
    const mergedEnvConfig = { ...baseEnvConfig, ...newEnvConfig };
    return Object.entries(mergedEnvConfig).map(([key, value]) => `${key}=${value}`).join('\n');
};

if (fs.existsSync(path.join(__dirname, "../", envFile))) {
    const updatedEnvContent = mergeEnvFiles(path.join(__dirname, "../", outputEnvFile), path.join(__dirname, "../", envFile));
    fs.writeFileSync(path.join(__dirname, "../", outputEnvFile), updatedEnvContent);
} else {
    console.error(`Environment file not found: ${envFile}`);
    process.exit(1);
}