import Cookies from 'js-cookie';

const KeyPrefix = 'Finelink-'; // 键前缀
// 缓存的键
const cookieKeys = ['token','username','nickname','device','email','avatar','userInfo','tracker','myroom','joinroom','sharefile']; // 保存在cookie中的键
const localStorageKeys = ['deviceId', 'channel','code','tips','setting','lang','trackerServer','trackers']; // 保存在localStorage中的键
const keys = [...cookieKeys, ...localStorageKeys];

// 操作
const operation = {
  get() {
    const key = `${KeyPrefix}${this.key}`;
    if (cookieKeys.indexOf(this.key) !== -1) {
      return Cookies.get(key);
    }
    return window.localStorage.getItem(key);
  },
  set(value) {
    const key = `${KeyPrefix}${this.key}`;
    if (cookieKeys.indexOf(this.key) !== -1) {
      if (process.env.VITE_DOMAIN) {
        Cookies.set(key, value, {domain: process.env.VITE_DOMAIN});
      } else {
        Cookies.set(key, value);
      }
    } else {
      window.localStorage.setItem(key, value);
    }
  },
  remember(value,expire){
    const key = `${KeyPrefix}${this.key}`;
    if(!expire){
      expire = new Date(new Date().getTime()+7*24*60*60*1000);
    }  
    if (cookieKeys.indexOf(this.key) !== -1) {
      if (process.env.VITE_DOMAIN) {
        Cookies.set(key, value, {domain: process.env.VITE_DOMAIN,expires:expire });
      } else {
        Cookies.set(key, value,{expires: expire});
      }
    }  
  },
  remove() {
    const key = `${KeyPrefix}${this.key}`;
    if (cookieKeys.indexOf(this.key) !== -1) {
      if (process.env.VITE_DOMAIN) {
        Cookies.remove(key, {domain: process.env.VITE_DOMAIN});
      } else {
        Cookies.remove(key);
      }
    } else {
      window.localStorage.removeItem(key);
    }
  }
};


const CacheService = {};

keys.forEach(key => {
  CacheService[key] = {
    key,
    ...operation
  };
});

export default CacheService;
