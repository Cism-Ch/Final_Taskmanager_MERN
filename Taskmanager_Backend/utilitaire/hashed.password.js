
const bcrypt = require("bcryptjs");
const bcryptSalt = process.env.BCRYPT_SALT;
 
const hashedPwd = async (password) =>  {
    const hash = await bcrypt.hash(password, Number(bcryptSalt));
    return hash;
}

module.exports = hashedPwd
