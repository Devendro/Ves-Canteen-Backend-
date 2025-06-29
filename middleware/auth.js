const crypto = require("crypto");
const algorithm = "aes-256-cbc";
const utils = require("../middleware/utils");
const secret = crypto.createHash("sha256").update("VesitCanteen").digest(); // 32-byte key
const iv = crypto.randomBytes(16); // 16-byte IV
module.exports = {
  /**
   * Checks is password matches
   * @param {string} password - password
   * @param {Object} user - user object
   * @returns {boolean}
   */
  async checkPassword(password, user) {
    return new Promise((resolve, reject) => {
      user.comparePassword(password, (err, isMatch) => {
        if (err) {
          reject(utils.buildErrObject(422, err));
        }
        if (!isMatch) {
          resolve(false);
        }
        resolve(true);
      });
    });
  },


  /**
   * Encrypts text
   * @param {string} text - text to encrypt
   */
  encrypt(text) {
    const cipher = crypto.createCipheriv(algorithm, secret, iv);
    let crypted = cipher.update(text, "utf8", "hex");
    crypted += cipher.final("hex");
    // Include IV in output so it can be used during decryption
    return iv.toString("hex") + ":" + crypted;
  },

  /**
   * Decrypts text
   * @param {string} text - text to decrypt
   */
  decrypt(encryptedText) {
    const [ivHex, encrypted] = encryptedText.split(":");
    const ivBuffer = Buffer.from(ivHex, "hex");
    const decipher = crypto.createDecipheriv(algorithm, secret, ivBuffer);
    try {
      let dec = decipher.update(encrypted, "hex", "utf8");
      dec += decipher.final("utf8");
      return dec;
    } catch (err) {
      return err;
    }
  }
};