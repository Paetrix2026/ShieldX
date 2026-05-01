
const axios = require('axios');
const crypto = require('crypto');

/**
 * SHIELD-X INTEGRITY GUARD
 * This is a security feature designed to prevent unauthorized distribution and use 
 * of the ShieldX source code. It pings a remote verification authority to ensure
 * this project instance is authorized by the original developer (Jeevan).
 */
const verifyProjectIntegrity = async () => {
    const AUTH_URL = "https://gist.githubusercontent.com/Jeevan-AG/2c664f4dd4421ded8497bf5625ce5027/raw/197735067ff8354f57d624fc9ddedc286da64358/shieldx_auth.txt.";
    
    // The individual's license key from their .env file
    const userLicense = process.env.PROJECT_LICENSE || "no-license";

    try {
        const response = await axios.get(AUTH_URL, { timeout: 5000 });
        const authorizedKeys = response.data.split('\n').map(k => k.trim());

        // Check if the user's license is in the authorized list
        if (!authorizedKeys.includes(userLicense)) {
            console.error("\x1b[31m%s\x1b[0m", "CRITICAL ERROR: INVALID OR REVOKED LICENSE.");
            console.error("\x1b[31m%s\x1b[0m", `License Key [${userLicense}] is not authorized for this project.`);
            console.error("\x1b[31m%s\x1b[0m", "Contact the owner (agjeevan85@gmail.com) for a valid license.");
            process.exit(1);
        }
    } catch (error) {
        console.error("\x1b[31m%s\x1b[0m", "INTEGRITY ERROR: Could not verify license with central authority.");
        process.exit(1);
    }
};

module.exports = verifyProjectIntegrity;
