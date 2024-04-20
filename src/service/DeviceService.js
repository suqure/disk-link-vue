import CacheService from '../utils/cache.js';
import { fetchEventSource } from '@microsoft/fetch-event-source';
export default class DeviceService {
    getDeviceBase() {
        if (CacheService.deviceId.get()) {
            return Promise.resolve({ deviceId: CacheService.deviceId.get(), channel: CacheService.channel.get() });
        } else {
            let deviceInfo = {
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                agent: window.navigator.userAgent,
                platform: window.navigator.platform,
                screen: window.devicePixelRatio,
                screen: window.devicePixelRatio,
                lang: window.navigator.language,
                charset: document.characterSet,
                toch: window.navigator.maxTouchPoints
            };
            if (window.navigator.connection) {
                deviceInfo['network'] = window.navigator.connection.effectiveType;
            }
            return fetch('/api/device', {
                headers: {
                    'device-info': JSON.stringify(deviceInfo)
                }
            })
                .then((response) => {
                    return response.json();
                })
                .then((res) => {
                    if (res.code == 200) {
                        CacheService.deviceId.set(res.data.deviceId);
                        CacheService.channel.set(res.data.channel);
                    }
                    return { deviceId: CacheService.deviceId.get(), channel: CacheService.channel.get() };
                });
        }
    }
    sendFeebackInfo(data) {
        return fetch('/api/feeback', {
            headers: {
                username: CacheService.username.get() || CacheService.deviceId.get(),
                lang: CacheService.lang.get() || window.navigator.language
            },
            method: 'POST',
            body: data
        }).then((response) => {
            return response.json();
        });
    }
    sendVerifyCode(data) {
        return fetch('/api/emailVerify', {
            headers: {
                username: CacheService.username.get() || CacheService.deviceId.get(),
                lang: CacheService.lang.get() || window.navigator.language
            },
            method: 'POST',
            body: data
        }).then((response) => {
            return response.json();
        });
    }
    verify(data) {
        return fetch('/api/verify', {
            headers: {
                username: CacheService.username.get() || CacheService.deviceId.get(),
                lang: CacheService.lang.get() || window.navigator.language
            },
            method: 'POST',
            body: data
        }).then((response) => {
            return response.json();
        });
    }
    login(data) {
        return fetch('/api/login', {
            headers: {
                username: CacheService.deviceId.get(),
                lang: CacheService.lang.get() || window.navigator.language
            },
            method: 'POST',
            body: data
        }).then((response) => {
            return response.json();
        });
    }
    signup(data) {
        return fetch('/api/signup', {
            headers: {
                username: CacheService.username.get() || CacheService.deviceId.get(),
                lang: CacheService.lang.get() || window.navigator.language
            },
            method: 'POST',
            body: data
        }).then((response) => {
            return response.json();
        });
    }
    resetPwd(data) {
        return fetch('/api/resetPassword', {
            headers: {
                username: CacheService.username.get() || CacheService.deviceId.get(),
                lang: CacheService.lang.get() || window.navigator.language
            },
            method: 'POST',
            body: data
        }).then((response) => {
            return response.json();
        });
    }
    userComment(data) {
        return fetch('/api/userComment', {
            headers: {
                username: CacheService.deviceId.get(),
                lang: CacheService.lang.get() || window.navigator.language
            },
            method: 'POST',
            body: data
        }).then((response) => {
            return response.json();
        });
    }
    showComment(data) {
        return fetch('/api/showComment', {
            headers: {
                username: CacheService.username.get() || CacheService.deviceId.get(),
                lang: CacheService.lang.get() || window.navigator.language
            },
            method: 'POST',
            body: data
        }).then((response) => {
            return response.json();
        });
    }
    updateUser(data) {
        return fetch('/api/updateInfo', {
            headers: {
                username: CacheService.username.get() || CacheService.deviceId.get(),
                token: CacheService.token.get() || 'none',
                lang: CacheService.lang.get() || window.navigator.language
            },
            method: 'POST',
            body: data
        }).then((response) => {
            return response.json();
        });
    }
    getIceServerConfig() {
        if (CacheService.username.get() && CacheService.token.get()) {
            return fetch('/api/iceServer', {
                headers: {
                    username: CacheService.username.get(),
                    token: CacheService.token.get()
                }
            })
                .then((response) => {
                    return response.json();
                })
                .then((res) => {
                    if (res.code == 200) {
                        return res.data;
                    }
                    return { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
                });
        } else {
            return fetch('/api/iceServer', {
                headers: {
                    username: CacheService.deviceId.get()
                }
            })
                .then((response) => {
                    return response.json();
                })
                .then((res) => {
                    if (res.code == 200) {
                        return res.data;
                    }
                    return { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
                });
        }
    }
    getFileToken(name) {
        if (CacheService.username.get() && CacheService.token.get()) {
            return fetch('/api/fileToken', {
                headers: {
                    username: CacheService.username.get(),
                    token: CacheService.token.get(),
                    fileName: name
                }
            })
                .then((response) => {
                    return response.json();
                })
                .then((res) => {
                    if (res.code == 200) {
                        return res.data;
                    }
                    return null;
                });
        } else {
            return fetch('/api/fileToken', {
                headers: {
                    username: CacheService.deviceId.get()
                }
            })
                .then((response) => {
                    return response.json();
                })
                .then((res) => {
                    if (res.code == 200) {
                        return res.data;
                    }
                    return null;
                });
        }
    }
    fileShare(data) {
        if (CacheService.username.get() && CacheService.token.get()) {
            return fetch('/api/fileShare', {
                headers: {
                    username: CacheService.username.get(),
                    token: CacheService.token.get()
                },
                method: 'POST',
                body: data
            })
                .then((response) => {
                    return response.json();
                })
                .then((res) => {
                    if (res.code == 200) {
                        return res.data;
                    }
                    return null;
                });
        } else {
            return fetch('/api/fileShare', {
                headers: {
                    username: CacheService.deviceId.get()
                },
                method: 'POST',
                body: data
            })
                .then((response) => {
                    return response.json();
                })
                .then((res) => {
                    if (res.code == 200) {
                        return res.data;
                    }
                    return null;
                });
        }
    }
    getFileShare(data) {
        if (CacheService.username.get() && CacheService.token.get()) {
            return fetch('/api/fileInfo', {
                headers: {
                    username: CacheService.username.get(),
                    token: CacheService.token.get(),
                    code: data
                },
                method: 'POST'
            })
                .then((response) => {
                    return response.json();
                })
                .then((res) => {
                    if (res.code == 200) {
                        return res.data;
                    }
                    return null;
                });
        } else {
            return fetch('/api/fileInfo', {
                headers: {
                    username: CacheService.deviceId.get(),
                    code: data
                },
                method: 'POST'
            })
                .then((response) => {
                    return response.json();
                })
                .then((res) => {
                    if (res.code == 200) {
                        return res.data;
                    }
                    return null;
                });
        }
    }
    getTrackerList() {
        const defalutTracker = ['wss://tracker.webtorrent.dev', 'wss://peertube2.cpy.re/tracker/socket'];
        if (CacheService.trackers.get()) {
            if (CacheService.tracker.get()) {
                let str = CacheService.trackers.get();
                str = str.split(',').filter((s) => s && s.trim());
                return Promise.resolve(str);
            }
        }
        if (CacheService.trackerServer.get()) {
            return fetch(CacheService.trackerServer.get())
                .then((response) => {
                    return response.text();
                })
                .then((data) => {
                    if (data) {
                        let str = data;
                        if (data.indexOf('http') == -1 && data.indexOf('udp') == -1 && data.indexOf('ws') == -1) {
                            return defalutTracker;
                        }
                        if (data.indexOf(',') == -1) {
                            str = data.replace(/\n|\r\n/g, ',');
                        }
                        CacheService.trackers.set(str);
                        str = str.split(',').filter((s) => s && s.trim());
                        CacheService.tracker.remember(1, new Date(new Date().getTime() + 24 * 60 * 60 * 1000));
                        return str;
                    }
                    return defalutTracker;
                });
        } else {
            return Promise.resolve(defalutTracker);
        }
    }
    streamMessage(data, cb,cc,ce) {
        return fetchEventSource( '/api/aiChat', {
            headers: {
                username: CacheService.username.get(),
                token: CacheService.token.get()
            },
            method: 'POST',
            body: data,
            onmessage(msg) { 
                cb(msg.data);
            },
            onclose() {
                console.log('close');
                if(cc){
                    cc()
                }
            },
            onerror(err) {
                console.log(err);
                if(ce){
                    ce(err)
                }
            }
        });
    }
    aiChat(data) {
        return fetch('/api/aiChat', {
            headers: {
                username: CacheService.username.get(),
                token: CacheService.token.get()
            },
            method: 'POST',
            body: data
        }).then((response) => {
            return response.json();
        });
    }
}
