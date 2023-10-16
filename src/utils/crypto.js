import crypto from "crypto";
const algorithm = "aes-256-cbc";
const key = crypto.randomBytes(32);
const iv = crypto.randomBytes(16);

export function encryptData(text) {
   let cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
   let encrypted = cipher.update(text);
   encrypted = Buffer.concat([encrypted, cipher.final()]);
   return { 
       "encryptedData": encrypted.toString('hex'),
       "iv" : iv.toString('hex'),
       "key" : key.toString('hex') };
}

export function decryptData(text) {
   let iv = Buffer.from(text.iv, 'hex');
   let enKey = Buffer.from(text.key, 'hex');
   let encryptedText = Buffer.from(text.encryptedData, 'hex');
   let decipher = crypto.createDecipheriv(algorithm, Buffer.from(enKey), iv);
   let decrypted = decipher.update(encryptedText);
   decrypted = Buffer.concat([decrypted, decipher.final()]);
   return decrypted.toString();
}
