const crypto = require("crypto");
const bcrypt = require("bcryptjs");
 
const genToken = async () =>  {
    let resetToken = crypto.randomBytes(32).toString("hex");
    const hash = await bcrypt.hash(resetToken, Number(process.env.BCRYPT_SALT));
    return hash;
}

module.exports = genToken