import CryptoJS from 'crypto-js';

export default {
  //加密
  encrypt(word, key) {
    if (key) {
      return CryptoJS.AES.encrypt(word, key).toString();
    } else {
      throw new Error("加密未传入密匙!");
      return false;
    }
  },
  //解密
  decrypt(word, key) {
    if (key) {
      return CryptoJS.AES.decrypt(word, key).toString(CryptoJS.enc.Utf8);
    } else {
      throw new Error("解密未传入密匙!");
      return false;
    }
  },
  //随机生成指定数量的16进制key
  generatekey(num) {
    let library = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let key = "";
    for (var i = 0; i < num; i++) {
      let randomPoz = Math.floor(Math.random() * library.length);
      key += library.substring(randomPoz, randomPoz + 1);
    }
    return key;
  }
}