import { encodeClientMessage as encodeMsg } from '../proto/ClientMessage.js';
import { decodeServerMessage as decodeMsg } from '../proto/ServerMessage.js';
const decoder = new TextDecoder('utf-8');
export default class MessageService {
    createHeartbeatMessage(content) {
        let body = { type: 1 };
        if (content) {
            body.content = this.encodeContent(content);
        }
        let heartbeat = {
            type: 2,
            biz: 'HEARTBEAT',
            cid: new Date().getTime() + '',
            timestamp: new Date().getTime(),
            body: [body]
        };
        return encodeMsg(heartbeat);
    }
    createSubscribeMessage(type, content) {
        let body = { type: type };
        if (content) {
            body.content = this.encodeContent(content);
        }
        let message = {
            type: 4,
            biz: 'SUBSCRIBE',
            cid: new Date().getTime() + '',
            timestamp: new Date().getTime(),
            body: [body]
        };
        return encodeMsg(message);
    }
    createWebRTCMessage(type,code, userId, sub, content) {
        let body = { type: type,msgType:code, toId: userId, content: this.encodeContent(content) };
        if (sub) {
            body.sub = sub;
        }
        let message = {
            type: 5,
            biz: 'WEBRTC',
            cid: new Date().getTime() + '',
            timestamp: new Date().getTime(),
            body: [body]
        };
        return encodeMsg(message);
    }
    createCustomMessage(type,traceId,toId,msgType,content) {
        let body = { type: type };
        if(toId){
            body.toId = toId;
        }
        if(msgType){
            body.msgType =msgType;
        }
        if (content) {
            body.content = this.encodeContent(content);
        }
        let custom = {
            type: 3,
            biz: 'CUSTOM',
            cid: new Date().getTime() + '',
            timestamp: new Date().getTime(),
            body: [body]
        };
        if(traceId){
            custom.traceId = traceId
        }
        return encodeMsg(custom);
    }
    decodeMessage(data) {
        return decodeMsg(data);
    }
    encodeContent(s) {
        if (!s) {
            return null;
        }
        var i = s.length;
        var n = 0;
        var ba = new Array();
        for (var j = 0; j < i; ) {
            var c = s.codePointAt(j);
            if (c < 128) {
                ba[n++] = c;
                j++;
            } else if (c > 127 && c < 2048) {
                ba[n++] = (c >> 6) | 192;
                ba[n++] = (c & 63) | 128;
                j++;
            } else if (c > 2047 && c < 65536) {
                ba[n++] = (c >> 12) | 224;
                ba[n++] = ((c >> 6) & 63) | 128;
                ba[n++] = (c & 63) | 128;
                j++;
            } else {
                ba[n++] = (c >> 18) | 240;
                ba[n++] = ((c >> 12) & 63) | 128;
                ba[n++] = ((c >> 6) & 63) | 128;
                ba[n++] = (c & 63) | 128;
                j += 2;
            }
        }
        return ba;
    }
    decodeContent(data) {
        return decoder.decode(data);
    }
    createBasicChannelMessage(type,data){
        return JSON.stringify({type:0,data:{type:type,data:data}}) 
    }
    createFileChannelMessage(type,data){
        return  JSON.stringify({type:1,data:{type:type,data:data}})
    }
    createDirChannelMessage(type,data){
        return  JSON.stringify({type:2,data:{type:type,data:data}})
    }
    createMediaChannelMessage(type,data){
        return  JSON.stringify({type:3,data:{type:type,data:data}})
    }
    createChatChannelMessage(type,data){
        return  JSON.stringify({type:4,data:{type:type,data:data}})
    }
    ceateChatMessage(message){
        return  JSON.stringify({model:'chatglm2',messages:[{role: 'user', content: message}],stream:true})
    }
}
