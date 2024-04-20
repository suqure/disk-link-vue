import MessageService from '@/service/MessageService';
const messageService = new MessageService();
const serverSocket = {
    websocket: null,
    connected: false,
    deviceId: null,
    channel: null,
    token: null,
    heartbeat: null,
    msgEvents:  new Map(),
    openEvents: new Map(),
    reconnect: null,
    messageQueue:[],
    createConnection: (deviceId, channel, token) => {
        if(serverSocket.websocket&&serverSocket.connected){
           if(serverSocket.deviceId==deviceId&&serverSocket.channel==channel){
                if(token&&serverSocket.token&&serverSocket.token==token){
                     return serverSocket.websocket
                }else if(!token||!serverSocket.token){
                    return serverSocket.websocket
                }
            }
            serverSocket.closeConnect();
        }
        serverSocket.deviceId = deviceId;
        serverSocket.channel = channel;
        if (token) {
            serverSocket.token = token;
            serverSocket.websocket = new WebSocket(process.env.VITE_WEBSOCKET_URL + process.env.VITE_AUTH_PATH + deviceId + '/' + channel, token);
        } else {
            serverSocket.websocket = new WebSocket(process.env.VITE_WEBSOCKET_URL + process.env.VITE_ANONYMOUS_PATH + deviceId + '/' + channel);
        }
        serverSocket.websocket.onopen = (event) => {
            console.log('server connected');
            serverSocket.connected = true;
            serverSocket.heartbeat = setInterval(() => {
                if (serverSocket.connected) {
                    serverSocket.websocket.send(messageService.createHeartbeatMessage('heartbeat')); 
                }else{
                    clearInterval(serverSocket.heartbeat);
                }
            }, 10000);
            if(serverSocket.openEvents){
                serverSocket.openEvents.forEach(f => {
                    f(event);
                });
            }
            if(serverSocket.messageQueue.length){
                serverSocket.messageQueue.forEach(message=>{
                    serverSocket.websocket.send(message);
                }) 
                serverSocket.messageQueue = [];
            }
        };
        serverSocket.websocket.onmessage = (event) => {
            let data = event.data;
            data.arrayBuffer().then((buffer) => {
                const message = messageService.decodeMessage(new Uint8Array(buffer));
                if(serverSocket.msgEvents){
                    serverSocket.msgEvents.forEach(f => {
                        f(message);
                    });
                }
            });
        };
        serverSocket.websocket.onclose = () => {
            console.log('server disconnected');
            clearInterval(serverSocket.heartbeat);
            serverSocket.connected = false;
        };
        if (!serverSocket.reconnect) {
            serverSocket.reconnect = setInterval(() => {
                if (serverSocket.websocket.readyState != WebSocket.OPEN) {
                    console.log('server reconnected');
                    serverSocket.createConnection(serverSocket.deviceId, serverSocket.channel, serverSocket.token);
                }
            }, 30000);
        }
        return serverSocket.websocket;
    },
    closeConnect:()=>{ 
        clearInterval(serverSocket.reconnect);
        serverSocket.websocket.close();
        serverSocket.reconnect = null;
        serverSocket.websocket = null;
        serverSocket.connected = false;
    },
    addOpenEvent:(f)=>{
        if(typeof f =='function'){
            serverSocket.openEvents.set(f.name,f) 
        }
    },
    addMsgEvent:(f)=>{
        if(typeof f =='function'){
            serverSocket.msgEvents.set(f.name,f) 
        }
    },
    clearEvents:()=>{
        serverSocket.openEvents =  []
        serverSocket.msgEvents =  []
    },
    removeMsgEvent:(f)=>{
        if(typeof f =='function'){
            serverSocket.msgEvents.delete(f.name) 
        } 
    },
    removeOpenEvent:(f)=>{
        if(typeof f =='function'){
            serverSocket.openEvents.delete(f.name) 
        } 
    },
    send:(message)=>{ 
        if(serverSocket.websocket&&serverSocket.websocket.readyState == WebSocket.OPEN){
            serverSocket.websocket.send(message);
        }else{
            serverSocket.messageQueue.push(message);
        }
         
    }
};

export default serverSocket;
