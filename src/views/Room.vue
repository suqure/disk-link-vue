<template>
    <div>
        <div class="dock-demo" sytle="width:100%">
            <Toast position="top-center" group="rm" />
            <ConfirmDialog group="refreshDialog"></ConfirmDialog>
            <div class="dock-window dock-advanced">
                <Menubar :model="menubarItems">
                    <template #end>
                        <span class="pi pi-sign-out" style="font-size: 1.5rem;" v-tooltip.left="$t('menus.exit_room')"
                            v-if="!roomOwner" @click="exitRoom"></span>
                        <span class="pi pi-sign-out" v-if="roomOwner" style="font-size: 1.5rem;padding:10px"
                            v-tooltip.left="$t('menus.stop_room')" @click="closeRoom"></span>
                    </template>
                </Menubar>
                <h5 class="float-container" v-show="roomCode && (controlsShow || !displayScreen)"
                    style="text-align: center;">
                    {{ roomInfo.name }} <br />
                    {{ $t('label.room_code') }} : {{ roomCode }} <br />
                    {{ $t('common.online_users') }} : {{ userSources.length }}</h5>
                <div class="media-btn" v-show="controlsShow || !displayScreen">
                    <div v-show="userStream || desktopStream">
                        <Button icon="pi pi-microphone" v-show="!videoMute" severity="danger" rounded @click="muteVideo"
                            v-tooltip.left="$t('tooltips.video_mute')" />
                        <Button icon="pi pi-microphone" v-show="videoMute" severity="success" rounded @click="unmuteVideo"
                            v-tooltip.left="$t('tooltips.canel_mute')" />
                    </div>
                    <div v-show="userStream">
                        <Button icon="pi pi-video" severity="danger" rounded @click="closeVideo"
                            v-tooltip.left="$t('tooltips.close_video')" />
                        <Button icon="pi pi-sync" severity="success" rounded @click="switchVideo"
                            v-tooltip.left="$t('tooltips.switch_video')" />
                    </div>
                    <div v-show="desktopStream">
                        <Button icon="pi pi-desktop" severity="danger" rounded @click="closeDesktop"
                            v-tooltip.left="$t('tooltips.close_screen')" />
                    </div>
                </div>
                <div class="video-btn" v-show="controlsShow && displayScreen">
                    <Button icon="pi pi-window-maximize" severity="Success" rounded outlined
                        v-tooltip.left="$t('common.fullscreen')" @click="handleFullScreen" />
                    <Button icon="pi pi-times" severity="danger" rounded outlined v-tooltip.left="$t('common.close')"
                        @click="closeScreen" />
                </div>
                <div v-show="controlsShow || !displayScreen">
                    <SpeedDial :model="items" :radius="80" type="semi-circle" direction="left"
                        :tooltipOptions="{ position: 'left' }" :style="{ top: 'calc(50% - 2rem)', right: '15px' }" />
                </div>
                <div class="video-dom" v-show="displayScreen">
                    <video id="videoScreen" playsinline autoplay muted></video>
                </div>
                <vue-danmaku v-model:danmus="userchats" ref="danmakuRef" :debounce="1000" randomChannel useSlot
                    style="height:80%; width:100%;">
                    <template v-slot:dm="{ index, danmu }">
                        <span>{{ index }}{{ danmu.code }}：{{ danmu.comment }}</span>
                    </template>
                </vue-danmaku>
                <div class="input-chat" v-show="controlsShow || !displayScreen">

                </div>
                <div class="user-preview" v-show="controlsShow || !displayScreen">
                    <div class="text-center show-chat-input" v-drag>
                        <Button icon="pi pi-comment" v-show="!displayChatInput" severity="info" text raised rounded
                            @click="showChatInput" v-tooltip.left="$t('tooltips.send_chat')" />
                    </div>

                    <div v-show="displayChatInput" class="chat-card" v-drag>
                        <V3Emoji :textArea="true" size="small" keep fix-pos="upleft" id="chat-textare"
                            :textAreaOption="{ placeholder: $t('label.chat_placeholder') }" v-model="chatValue" />
                        <div class="flex-1 text-center  md:align-items-end">
                            <Button @click="colseChat" :label="$t('common.close')" text raised />
                            <Button :disabled="!chatValue" @click="submitChat" :label="$t('label.submit_chat')" text
                                raised />
                        </div>
                    </div>
                    <div style="width: 310px;"  v-show="!displayChatInput">
                        <Carousel :value="userSources" :numVisible="2" :numScroll="1" :showIndicators="false">
                            <template #item="slotProps">
                                <div class="border-1 surface-border border-round m-2 text-center py-1 px-1">
                                    <div v-if="slotProps.data.current">
                                        <video class="user-video" playsinline autoplay :muted="slotProps.data.self"
                                            :srcObject="slotProps.data.current"></video>
                                    </div>
                                    <div v-if="!slotProps.data.video && !slotProps.data.desktop">
                                        <img :src="'images/icons/' + slotProps.data.icon" width="90"
                                            :alt="slotProps.data.name" />
                                    </div>
                                    <div>
                                        <span :class="'pi ' + slotProps.data.type"> {{ slotProps.data.name }}</span>
                                    </div>
                                    <div>
                                        <Button icon="pi pi-video" severity="info" text rounded
                                            v-tooltip.left="$t('common.show')" @click="showVideo(slotProps.data)"
                                            v-if="slotProps.data.video" />
                                        <Button icon="pi pi-desktop" severity="info" text rounded
                                            v-tooltip.left="$t('common.show')" @click="showDesktop(slotProps.data)"
                                            v-if="slotProps.data.desktop" />
                                    </div>
                                </div>
                            </template>
                        </Carousel>
                    </div>
                </div>
                <Sidebar v-model:visible="displayFile" position="left" class="w-full md:w-20rem lg:w-30rem">
                    <h2>{{ $t('headers.share_info') }}</h2>
                    <Card>
                        <template #content>
                            <ScrollPanel style="width: 100%; height: 400px">
                                <div v-for="(shareFiles, key) in shareFileMap" :key="key">
                                    <span>{{ formatName(shareFiles[0]) }}</span>
                                    <div class="flex flex-wrap p-0 sm:p-5 gap-5">
                                        <div v-for="(file, index) of shareFiles[1]" :key="index"
                                            class="border-1 surface-border border-round m-2 text-center py-2 px-2">
                                            <div>
                                                <img role="presentation" :alt="file.name"
                                                    :src="'images/icons/' + formatIcon(file.name)" width="50" height="50"
                                                    class="shadow-2" />
                                            </div>
                                            <div class="long-name" v-tooltip.top="file.name">{{ file.name }}</div>
                                            <div>{{ formatSize(file.size) }}</div>
                                            <div v-if="checkMySelf(shareFiles[0])">
                                                <Button icon="pi pi-times" severity="danger"
                                                    @click="removeShareFile(shareFiles[0], index)"
                                                    v-tooltip="$t('common.clear')" text raised rounded />
                                            </div>
                                            <div v-if="!checkMySelf(shareFiles[0])">
                                                <Button icon="pi pi-download" @click="onFileCilck(shareFiles[0], file)"
                                                    severity="info" v-tooltip="$t('tooltips.download')" text raised
                                                    rounded />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <p v-if="!shareFileMap.size">
                                    {{ $t('label.share_empty') }}
                                </p>
                            </ScrollPanel>
                        </template>
                        <template #footer>
                            <FileUpload mode="basic" :auto="true" :chooseLabel="$t('label.select_file')"
                                class="w-full p-3 text-xl" customUpload :multiple="true" @select="onSelectedFiles">
                                <template #uploadicon>
                                </template>
                            </FileUpload>
                        </template>
                    </Card>
                </Sidebar>
                <Sidebar v-model:visible="displayChat" position="right" class="w-full md:w-20rem lg:w-30rem">
                    <h2>{{ $t('headers.chat') }}</h2>
                    <Card>
                        <template #content>
                            <ScrollPanel style="width: 100%; height: 300px">
                                <div v-for="(userchat, index) in userchats">
                                    <span class="pi pi-user"> {{ userchat.code }} {{ $t('label.comment_post') }} {{
                                        formatCommentTime(userchat.createTime) }}</span>
                                    <div>
                                        <Chip>
                                            {{ userchat.comment }}
                                        </Chip>
                                    </div>
                                </div>
                                <p v-if="!userchats.length">
                                    {{ $t('label.chat_empty') }}
                                </p>
                            </ScrollPanel>
                        </template>
                        <template #footer>
                            <V3Emoji :textArea="true" size="small" keep
                                :textAreaOption="{ placeholder: $t('label.chat_placeholder') }" v-model="chatValue" />
                            <Button class="w-full p-3 text-xl" :disabled="!chatValue" @click="submitChat"
                                :label="$t('label.submit_chat')" text raised />
                        </template>
                    </Card>
                </Sidebar>
                <Dialog v-model:visible="displayJoinRoom" :header="$t('headers.join_room')" :closable="false" :modal="true">
                    <div>
                        <label for="room_code" class="block text-900 text-xl font-medium mb-2">{{ $t('label.room_code')
                        }}</label>
                        <InputMask id="room_code" type="text" mask="9 9 9 9-9 9 9 9" :unmask=true
                            class="w-full md:w-30rem mb-5" v-model="joinInfo.code" :autoClear="false" />
                        <label for="room_pwd" class="block text-900 font-medium text-xl mb-2">{{ $t('label.room_pwd')
                        }}</label>
                        <Password id="room_pwd" v-model="joinInfo.password" :placeholder="$t('label.pwd_placeholder')"
                            :toggleMask="true" class="w-full mb-3" inputClass="w-full" :feedback="false"
                            :inputStyle="{ padding: '1rem' }">
                        </Password>
                        <Button :disabled="!joinInfo.code" :label="$t('label.join_room')" @click="joinRoom"
                            class="w-full p-3 text-xl"></Button>
                        <div style="padding: 0.5rem"></div>
                        <Button :label="$t('label.go_home')" @click="homepage(false)" class="w-full p-3 text-xl"></Button>
                    </div>
                </Dialog>
            </div>
        </div>
    </div>
</template>
<script setup>
import { ref, onBeforeMount, onMounted, onBeforeUnmount } from 'vue';
import { useConfirm } from "primevue/useconfirm";
import { useRoute } from "vue-router"
import { useToast } from 'primevue/usetoast';
import DeviceService from '@/service/DeviceService';
import MessageService from '@/service/MessageService'
import FileService from '@/service/FileService';
import CacheService from '@/utils/cache.js';
import router from '@/router'
import streamSaver from 'streamsaver';
import { useI18n } from 'vue-i18n';
import serverSocket from '@/utils/socket';
import AES from "@/utils/AES.js";
import { Md5 } from 'ts-md5';
import vueDanmaku from 'vue3-danmaku'
import V3Emoji from 'vue3-emoji'
import 'vue3-emoji/dist/style.css'
const i18n = useI18n();
const { locale } = useI18n();
const route = useRoute();
const confirm = useConfirm();
streamSaver.mitm = process.env.VITE_STEAMSAVE_URL;
const streamWriterMap = ref(new Map());
const deviceService = new DeviceService();
const messageService = new MessageService();
const fileService = new FileService();
const userSetting = ref({ requirePwd: false, automated: '0', password: '', lang: 'zh-cn', splitRecord: 0 });
const toast = useToast();
const userInfo = ref();
const menubarItems = ref();
const roomInfo = ref({});
const joinInfo = ref({ code: '', password: '' });
const displayJoinRoom = ref(false);
const roomCode = ref('');
const peerMap = ref(new Map());
const channelMap = ref(new Map());
const fileChannelMap = ref(new Map());
const roomOwner = ref(false);
const displayChat = ref(false);
const deviceCode = ref(CacheService.code.get());
const downloadFiles = ref([]);
const files = ref([]);
const uploadTasks = ref(new Map());
const taskMap = ref(new Map());
const desktopStream = ref();
const userStream = ref();
const roomUsers = ref(new Map());
const peerConfig = ref();
const initConnection = ref(false);
const userSources = ref([]);
const remoteVideoTrack = ref(new Map());
const remoteDesktopTrack = ref(new Map());
const mediaRecorder = ref(new Map());
const myInfo = ref();
const displayScreen = ref(false);
const displayFile = ref(false);
const userchats = ref([]);
const chatValue = ref('');
const videoMute = ref(false);
const videoDefalut = ref(true);
const screenRecord = ref(false);
const screenOwn = ref();
const controlsShow = ref(false);
const hideControlTime = ref();
const chatHistory = ref();
const danmakuRef = ref(null);
const shareFileMap = ref(new Map());
const keepAliveInt = ref(0);
const displayChatInput = ref(false);
const colseChat = () => {
    displayChatInput.value = false;
}
const showChatInput = () => {
    displayChatInput.value = true;
}
const submitChat = () => {
    if (chatValue.value) {
        const timestamp = new Date().getTime();
        const nickname = userInfo.value ? userInfo.value.nickname : deviceCode.value
        const chat = { comment: chatValue.value, createTime: timestamp, code: nickname, id: timestamp }
        const content = AES.encrypt(JSON.stringify(chat), transferCode(serverSocket.deviceId, serverSocket.channel));
        const message = messageService.createChatChannelMessage(1, content);
        for (let channel of channelMap.value.values()) {
            if (channel.readyState == 'open') {
                channel.send(message);
            }

        }
        userchats.value.push(chat)
        chatValue.value = '';
    }
}
const sendChatHistoryInfo = (code) => {
    if (userchats.value.length) {
        const min = userchats.value[0].createTime;
        const max = userchats.value[userchats.value.length - 1].createTime;
        const content = AES.encrypt(JSON.stringify({ type: 0, min: min, max: max }), transferCode(serverSocket.deviceId, serverSocket.channel));
        const message = messageService.createChatChannelMessage(0, content);
        const channel = channelMap.value.get(code);
        if (channel && channel.readyState == 'open') {
            channel.send(message);
        }
    }
}
const requestChatHistoryInfo = (code, min, max) => {
    const content = AES.encrypt(JSON.stringify({ type: 1, min: min, max: max }), transferCode(serverSocket.deviceId, serverSocket.channel));
    const message = messageService.createChatChannelMessage(0, content);
    const channel = channelMap.value.get(code);
    if (channel && channel.readyState == 'open') {
        channel.send(message);
        chatHistory.value = min;
        setTimeout(() => {
            chatHistory.value = null;
        }, 5000);
    }
}
const sendResponsetChatHistory = (code, data) => {
    if (userchats.value.length) {
        let sendChat = [];
        userchats.value.forEach(chat => {
            if (data.min <= chat.createTime && data.max >= chat.createTime) {
                sendChat.push(chat);
            }
        })
        if (sendChat.length) {
            const channel = channelMap.value.get(code);
            if (channel && channel.readyState == 'open') {
                const content = AES.encrypt(JSON.stringify(sendChat), transferCode(serverSocket.deviceId, serverSocket.channel));
                const message = messageService.createChatChannelMessage(2, content);
                channel.send(message);
            }
        }
    }
}
const formatName = (code) => {
    const user = roomUsers.value.get(code)
    if (user) {
        return user.nickname + ' ' + i18n.t("common.share");
    } else if (code == transferCode(serverSocket.deviceId, serverSocket.channel)) {
        return i18n.t("common.my") + i18n.t("common.share")
    }
    return '';
}
const checkMySelf = (code) => {
    if (code == transferCode(serverSocket.deviceId, serverSocket.channel)) {
        return true;
    }
    return false;
}


deviceService.getIceServerConfig().then(config => {
    peerConfig.value = config;
});
const closeScreen = () => {
    displayScreen.value = false;
}
const onFileCilck = (code, fileInfo) => {
    let channel = channelMap.value.get(code);
    for (let file of downloadFiles.value.values()) {
        if (file.id == fileInfo.id) {
            toast.add({ severity: 'warn', summary: i18n.t("message.download_exit_err"), group: 'tc', life: 3000 });
            return;
        }
    }
    downloadFiles.value.push({ device: fileInfo.device, name: fileInfo.name, size: fileInfo.size, type: 1, chunks: 0, id: fileInfo.id, format: fileInfo.format, status: 0, total: 0, start: new Date().getTime(), cost: 0 });
    if (!taskMap.value.get(code)) {
        if (channel) {
            channel.send(messageService.createBasicChannelMessage(2, fileInfo));
        }
    }
    fileInfo.status = 1
}
const removeShareFile = (code, index) => {
    files.value.splice(index, 1);
    const fileInfo = shareFileMap.value.get(code);
    fileInfo.splice(index, 1);
    sendShareFileList(fileInfo);
}

const showVideo = (data) => {
    videoScreen.srcObject = data.video;
    screenOwn.value = data;
    data.current = data.video;
    displayScreen.value = true;
}
const showDesktop = (data) => {
    videoScreen.srcObject = data.desktop;
    data.current = data.desktop;
    screenOwn.value = data;
    displayScreen.value = true;
}
const hiddenControl = () => {
    hideControlTime.value = setTimeout(() => {
        controlsShow.value = false;
        hideControlTime.value = 0;
    }, 5000);
}
const formatCommentTime = (timestamp) => {
    if (timestamp) {
        let mistiming = Math.round(new Date() / 1000) - timestamp / 1000;
        if (mistiming > 0) {
            let postfix = ' ' + i18n.t("common.before")
            mistiming = Math.abs(mistiming)
            let arrr = [i18n.t("common.year"), i18n.t("common.month"), i18n.t("common.week"), i18n.t("common.day"), i18n.t("common.hour"), i18n.t("common.minute"), i18n.t("common.second")];
            let arrn = [31536000, 2592000, 604800, 86400, 3600, 60, 1];

            for (let i = 0; i < 7; i++) {
                let inm = Math.floor(mistiming / arrn[i])
                if (inm != 0) {
                    return inm + arrr[i] + postfix
                }
            }
        } else {
            return i18n.t("common.now");
        }

    }
    return '';
}
const formatSize = (bytes) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}
const formatIcon = (name) => {
    let icon = fileService.readFileFormat(name) + '.png';
    return icon;
}
const showButton = () => {
    if (displayScreen.value) {
        if (hideControlTime.value) {
            clearTimeout(hideControlTime.value);
            hideControlTime.value = 0;
        }
        controlsShow.value = true;
        hiddenControl();
    }
}
const shareVideo = () => {
    if (navigator.mediaDevices) {
        if (userStream.value) {
            return;
        }
        navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
            userSources.value[0].video = stream;
            userSources.value[0].current = stream;
            userStream.value = stream;
            stream.getVideoTracks()[0].addEventListener('ended', () => {
                userStream.value = null;
                userSources.value[0].video = null;
                sendMediaMessage();
                handleShowScreen(transferCode(serverSocket.deviceId, serverSocket.channel));
            });
            sendMediaMessage();
        }).catch(function (err) {
            toast.add({ severity: 'error', summary: err.name, group: 'rm', life: 3000 });
        })
    } else {
        toast.add({ severity: 'error', summary: i18n.t("message.live_video_err"), group: 'rm', life: 3000 });
    }
}
const shareScreen = () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
        navigator.mediaDevices.getDisplayMedia({ video: true, audio: true }).then(stream => {
            let oldStream = desktopStream.value
            userSources.value[0].desktop = stream;
            userSources.value[0].current = stream;
            desktopStream.value = stream;
            stream.getVideoTracks()[0].addEventListener('ended', () => {
                userSources.value[0].desktop = null;
                desktopStream.value = null;
                sendMediaMessage();
                handleShowScreen(transferCode(serverSocket.deviceId, serverSocket.channel));
            });
            if (oldStream) {
                for (let senders of remoteDesktopTrack.value.values()) {
                    stream.getTracks().forEach(track => {
                        senders.forEach(sender => {
                            sender.replaceTrack(track)
                        });
                    });
                }
                let tracks = oldStream.getTracks();
                if (tracks) {
                    tracks.forEach(track => {
                        track.stop();
                    });
                }
            } else {
                sendMediaMessage();
            }
        }).catch(function (err) {
            toast.add({ severity: 'error', summary: err.name, group: 'rm', life: 3000 });
        })
    } else {
        toast.add({ severity: 'error', summary: i18n.t("message.screen_share_err"), group: 'rm', life: 3000 });
    }
}
const refreshRoom = () => {
    roomUsers.value.forEach(user => {
        serverSocket.send(messageService.createWebRTCMessage(3, transferCode(user.userId, user.channel), user.userId, user.channel, JSON.stringify({
            type: "close"
        })));
    })
    roomUsers.value.clear();
    userSources.value = [];
    initConnection.value = false;
    closeAllConnection();
    serverSocket.send(messageService.createCustomMessage(1, null, null, 'join', JSON.stringify({
        code: roomCode.value
    })))
}
const items = ref([
    {
        label: i18n.t("label.chat"),
        icon: 'pi pi-comments',
        command: () => {
            displayChat.value = true;
        }
    },
    {
        label: i18n.t("label.refresh"),
        icon: 'pi pi-refresh',
        command: () => {
            refreshRoom();
        }
    },
    {
        label: i18n.t("menus.file"),
        icon: 'pi pi-file',
        command: () => {
            displayFile.value = true;
        }
    },
    {
        label: i18n.t("menus.video"),
        icon: 'pi pi-video',
        command: () => {
            shareVideo();
        }
    },
    {
        label: i18n.t("menus.screen"),
        icon: 'pi pi-desktop',
        command: () => {
            shareScreen();
        }
    }
])
const handleFullScreen = () => {

    videoScreen.requestFullscreen();

}
const sendMediaMessage = () => {
    let mediaInfo = { desktop: false, video: false, audio: false, type: 0 }
    if (userStream.value) {
        mediaInfo.video = true;
    }
    if (desktopStream.value) {
        mediaInfo.desktop = true;
    }
    for (let channel of channelMap.value.values()) {
        if (channel.readyState == 'open') {
            channel.send(messageService.createMediaChannelMessage(0, mediaInfo));
        }

    }
}
const closeDesktop = () => {
    let tracks = desktopStream.value.getTracks();
    if (tracks) {
        tracks.forEach(track => {
            track.stop();
        });
    }
    stopRecordScreen();
    desktopStream.value = null;
    userSources.value[0].desktop = null;
    sendMediaMessage();
    handleShowScreen(transferCode(serverSocket.deviceId, serverSocket.channel));
}
const stopRecordScreen = () => {
    screenRecord.value = false;
    stopRecordStream('screen');

}

const muteVideo = () => {
    videoMute.value = true;
    if (desktopStream.value) {
        desktopStream.value.getTracks().forEach(track => {
            if (track.kind === 'audio') {
                track.enabled = false;
            }
        })
    }
    if (userStream.value) {
        userStream.value.getTracks().forEach(track => {
            if (track.kind === 'audio') {
                track.enabled = false;
            }
        })
    }

}
const unmuteVideo = () => {
    videoMute.value = false;
    if (desktopStream.value) {
        desktopStream.value.getTracks().forEach(track => {
            if (track.kind === 'audio') {
                track.enabled = true;
            }
        })
    }
    if (userStream.value) {
        userStream.value.getTracks().forEach(track => {
            if (track.kind === 'audio') {
                track.enabled = true;
            }
        })
    }

}
const stopRecordStream = (key) => {
    const recorder = mediaRecorder.value.get(key)
    if (recorder) {
        recorder.stop();
        mediaRecorder.value.delete(key);
    }
}
const recordStream = (key, stream) => {
    let times = 0;
    const mime = MediaRecorder.isTypeSupported('video/webm; codecs=vp9') ? 'video/webm; codecs=vp9' : 'video/webm'
    const recorder = new MediaRecorder(stream, {
        mimeType: mime
    })

    recorder.ondataavailable = (event) => {
        let writer = streamWriterMap.value.get(key);
        if (!writer) {
            const fileName = 'screen-record' + new Date().getTime() + '.webm'
            const fileStream = streamSaver.createWriteStream(fileName);
            writer = fileStream.getWriter();
            streamWriterMap.value.set(key, writer);
        }
        event.data.arrayBuffer().then(buffer => {
            writer.write(new Uint8Array(buffer)).then(() => {
                times++
                if (userSetting.value.splitRecord && times >= userSetting.value.splitRecord) {
                    writer.close();
                    streamWriterMap.value.delete(key)
                    times = 0
                }
            }).catch((err) => {
                streamWriterMap.value.delete(key)
            });
        });
    }
    recorder.onstop = () => {
        const writer = streamWriterMap.value.get(key);
        if (writer) {
            setTimeout(() => {
                writer.close()
            }, 1000)
            streamWriterMap.value.delete(key);
        }

    }
    recorder.start(60 * 1000);
    mediaRecorder.value.set(key, recorder)
}
const closeVideo = () => {
    let tracks = userStream.value.getTracks();
    if (tracks) {
        tracks.forEach(track => {
            track.stop();
        });
    }
    userStream.value = null;
    userSources.value[0].video = null;
    sendMediaMessage();
    handleShowScreen(transferCode(serverSocket.deviceId, serverSocket.channel));
}
const handleShowScreen = (code) => {
    if (screenOwn.value && code == screenOwn.value.id) {
        if (screenOwn.value.desktop) {
            videoScreen.srcObject = screenOwn.value.desktop;
            screenOwn.value.current = screenOwn.value.desktop;
        } else if (screenOwn.value.video) {
            videoScreen.srcObject = screenOwn.value.video;
            screenOwn.value.current = screenOwn.value.video
        } else {
            screenOwn.value.current = null;
            displayScreen.value = false;
        }
    } else {
        const source = userSources.value.find(e => e.id == code);
        if (source.desktop) {
            source.current = source.desktop;
        } else if (source.video) {
            source.current = source.video;
        } else {
            source.current = null;
        }
    }
}
const switchVideo = () => {
    let videoOption = true;
    if (videoDefalut.value) {
        videoOption = { facingMode: { exact: "environment" } };
    }
    navigator.mediaDevices.getUserMedia({ video: videoOption, audio: true }).then(stream => {
        videoDefalut.value = !videoDefalut.value;
        let tracks = userStream.value.getTracks();
        userSources.value[0].video = stream;
        userSources.value[0].current = stream;
        userStream.value = stream;
        stream.getVideoTracks()[0].addEventListener('ended', () => {
            userStream.value = null;
            userSources.value[0].video = null;
        });
        for (let senders of remoteVideoTrack.value.values()) {
            stream.getTracks().forEach(track => {
                senders.forEach(sender => {
                    sender.replaceTrack(track)
                });
            });
        }
        if (tracks) {
            tracks.forEach(track => {
                track.stop();
            });
        }
    }).catch(function (err) {
        toast.add({ severity: 'error', summary: i18n.t("message.switch_video_err"), group: 'rm', life: 3000 });
    })
}
const onSelectedFiles = (event) => {
    for (let i = 0; i < event.files.length; i++) {
        files.value.push(event.files[i]);
    }
    let fileInfo = [];
    for (let i = 0; i < files.value.length; i++) {
        let md5 = new Md5();
        md5.appendAsciiStr(deviceCode.value + ':' + files.value[i].name + ":" + files.value[i].size);
        let key = md5.end();
        fileInfo.push({ device: deviceCode.value, name: files.value[i].name, size: files.value[i].size, format: fileService.readFileFormat(files.value[i].name), id: key, status: 0 })
    }
    shareFileMap.value.set(transferCode(serverSocket.deviceId, serverSocket.channel), fileInfo);
    sendShareFileList(fileInfo);

}

const sendShareFileList = (fileInfo) => {
    for (let channel of channelMap.value.values()) {
        if (channel.readyState == 'open') {
            channel.send(messageService.createBasicChannelMessage(1, fileInfo));
        }

    }
}
onBeforeMount(() => {
    if (CacheService.joinroom.get()) {
        roomInfo.value = JSON.parse(CacheService.joinroom.get())
        roomCode.value = roomInfo.value.code;
    }
    if (route.query && route.query.code) {
        roomCode.value = route.query.code
    }
    if (CacheService.setting.get()) {
        userSetting.value = JSON.parse(CacheService.setting.get());
        if (userSetting.value.lang) {
            locale.value = userSetting.value.lang
        }
    } else if (window.navigator.language) {
        if (window.navigator.language.indexOf('en') > -1) {
            userSetting.value.lang = 'en-us';
            locale.value = 'en-us';
        }
    }
    CacheService.lang.set(locale.value);
    if (CacheService.userInfo.get()) {
        userInfo.value = JSON.parse(CacheService.userInfo.get());
    }
    initMenuItem();
    serverSocket.addMsgEvent(socketRoomEvent);
})
onMounted(() => {
    if (!roomCode.value) {
        displayJoinRoom.value = true;
    } else {
        joinInfo.value.code = roomCode.value;
        serverSocket.send(messageService.createCustomMessage(1, null, null, 'join', JSON.stringify({
            code: roomCode.value
        })))
    }

    serverSocket.send(messageService.createSubscribeMessage(0, JSON.stringify({ code: CacheService.code.get() })));
    document.onclick = (e) => {
        showButton();
    }

    videoScreen.addEventListener('loadedmetadata', function () {
        if (videoScreen.videoHeight * (document.documentElement.clientWidth * 1.0 / videoScreen.videoWidth) <= document.documentElement.clientHeight) {
            videoScreen.style.width = '100%'
            videoScreen.style.height = ''
        } else {
            videoScreen.style.width = ''
            videoScreen.style.height = '100%'
        }

    });
    danmakuRef.value.play();
})
const keepAlive = () => {
    if (keepAliveInt.value) {
        clearInterval(keepAliveInt.value)
    }
    keepAliveInt.value = setInterval(() => {
        if (initConnection.value) {
            console.log('keep alive');
            let timeout = false;
            if (!serverSocket.connected) {
                createConnection(serverSocket.deviceId, serverSocket.channel, serverSocket.token);
                timeout = true;
                serverSocket.send(messageService.createCustomMessage(1, null, null, 'join', JSON.stringify({
                    code: roomCode.value
                })))
            }
            if (timeout) {
                setTimeout(() => {
                    if (serverSocket.connected) {
                        roomUsers.value.forEach((user, code) => {
                            connectUser(user, code);
                        })
                    } else {
                        createConnection(serverSocket.deviceId, serverSocket.channel, serverSocket.token);
                    }
                }, 5000);
            } else {
                const num = Math.ceil(Math.random() * 10);
                setTimeout(() => {
                    roomUsers.value.forEach((user, code) => {
                        connectUser(user, code);
                    })
                }, num * 500);

            }
        }
    }, 20000);
}
const connectUser = (user, code) => {
    const peer = peerMap.value.get(code);
    if (!user.leave && (!peer || (peer.connectionState != 'connected' && peer.connectionState != 'connecting'))) {
        console.log('keep alive reconnect');
        initWebRTC(user.userId, user.channel)
        serverSocket.send(messageService.createWebRTCMessage(0, code, user.userId, user.channel, JSON.stringify({
            type: "apply"
        })));
    }
}
const socketRoomEvent = (message) => {
    if (message.type == 2) {
        handleRoomMsg(message.body[0]);
    } else if (message.type == 4) {
        handleConnect(message.body[0]);
    } else if (message.type == 3) {
        handleDeviceCode(message.body[0]);
    }
}
const exitRoom = () => {
    confirm.require({
        group: 'refreshDialog',
        message: i18n.t("message.exit_room_confirm"),
        header: i18n.t("headers.confirm_msg"),
        icon: 'pi pi-info-circle',
        position: 'top',
        accept: () => {
            serverSocket.send(messageService.createCustomMessage(1, null, null, 'exit', JSON.stringify({
                code: roomCode.value
            })))
        },
        reject: () => {

        }
    });
}
const closeRoom = () => {
    confirm.require({
        group: 'refreshDialog',
        message: i18n.t("message.close_room_confirm"),
        header: i18n.t("headers.confirm_msg"),
        icon: 'pi pi-info-circle',
        position: 'top',
        accept: () => {
            serverSocket.send(messageService.createCustomMessage(1, null, null, 'close', JSON.stringify({
                code: roomCode.value
            })))

        },
        reject: () => {

        }
    });

}
const handleRoomMsg = (body) => {
    if (body.type == 1) {
        if (body.code) {
            displayJoinRoom.value = true;
            toast.add({ severity: 'warn', summary: body.msg, group: 'rm', life: 3000 });
            if (body.code == 404) {
                if (CacheService.myroom.get()) {
                    const myroom = JSON.parse(CacheService.myroom.get())
                    if (myroom.code == roomCode.value) {
                        CacheService.myroom.remove();
                    }
                }
                CacheService.joinroom.remove();
            }
            return;
        }
        let data = JSON.parse(messageService.decodeContent(body.content));
        if (body.msgType == 'info') {
            if (data.ownerId == serverSocket.deviceId) {
                CacheService.myroom.set(JSON.stringify({ code: data.code, name: data.name, passowrd: data.password, users: data.users.length }));
            } else {
                CacheService.joinroom.set(JSON.stringify({ code: data.code, name: data.name, passowrd: data.password, users: data.users.length }));
            }
            if (roomCode.value == data.code || joinInfo.value.code) {
                roomInfo.value = data;
                displayJoinRoom.value = false;
                roomCode.value = data.code;
            }
            if (roomInfo.value.ownerId == serverSocket.deviceId) {
                roomOwner.value = true;
            } else {
                roomOwner.value = false;
            }
            handleRoomConnection();
        } else if (body.msgType == 'close') {
            if (data.ownerId == serverSocket.deviceId) {
                CacheService.myroom.remove();
            }
            if (roomCode.value == data.code) {
                roomInfo.value = {}
                CacheService.joinroom.remove();
                roomCode.value = null;
                displayJoinRoom.value = true;
                roomUsers.value.clear();
                userSources.value = [];
                initConnection.value = false;
                closeAllConnection();
                toast.add({ severity: 'warn', summary: i18n.t("message.close_room_msg"), group: 'rm', life: 3000 });
            }
        } else if (body.msgType == 'exit') {
            if (data.ownerId == serverSocket.deviceId) {
                CacheService.myroom.set(JSON.stringify({ code: data.code, name: data.name, passowrd: data.password, users: data.users.length }));
            } else {
                CacheService.joinroom.remove();
            }
            if (roomCode.value == data.code) {
                roomInfo.value = {}
                roomCode.value = null;
                roomUsers.value.clear();
                userSources.value = [];
                closeAllConnection();
                displayJoinRoom.value = true;
                initConnection.value = false;
                userchats.value = [];
                toast.add({ severity: 'warn', summary: i18n.t("message.exit_room_msg"), group: 'rm', life: 3000 });
            }

        } else if (body.msgType == 'verify') {
            if (data.ownerId == serverSocket.deviceId) {
                CacheService.myroom.set(JSON.stringify(data));
            } else {
                CacheService.joinroom.remove();
            }
            if (roomCode.value == data.code || joinInfo.value.code == data.code) {
                roomInfo.value = {}
                roomCode.value = null;
                displayJoinRoom.value = true;
                toast.add({ severity: 'warn', summary: i18n.t("message.verify_room_msg"), group: 'rm', life: 3000 });
            }

        }

    }
}

const handleRoomConnection = () => {
    if (roomInfo.value.users.length) {
        roomUsers.value.clear();
        roomInfo.value.users.forEach(user => {
            if (user.userId != serverSocket.deviceId) {
                const code = transferCode(user.userId, user.channel);
                if (roomUsers.value.get(code)) {
                    const exit = roomUsers.value.get(code)
                    if (exit.nickname) {
                        user.nickname = exit.nickname;
                    }
                }
                roomUsers.value.set(transferCode(user.userId, user.channel), user);
            } else {
                myInfo.value = user;
            }
        });
    }
    if (!initConnection.value) {
        initConnection.value = true;
        roomUsers.value.forEach((user, code) => {
            if (!user.leave) {
                initWebRTC(user.userId, user.channel)
                serverSocket.send(messageService.createWebRTCMessage(0, code, user.userId, user.channel, JSON.stringify({
                    type: "apply"
                })));
            }
        })
        let icon = "pc_icon.png";
        if (myInfo.value.device == 'Android') {
            icon = "phone_icon.png";
        } else if (myInfo.value.device == 'iPhone' || myInfo.value.device == 'iOS') {
            type = 'pi-apple';
            icon = "iphone_icon.png";
        }
        const code = transferCode(serverSocket.deviceId, serverSocket.channel);
        const nickname = userInfo.value ? userInfo.value.nickname : deviceCode.value
        userSources.value.push({ name: nickname, id: code, icon: icon, type: 'pi-user', self: 1, video: null, desktop: null, rtt: 0, current: null, region: i18n.t("label.local") });
        keepAlive();
    }
}

const handleDeviceCode = (body) => {
    if (!body.code) {
        const result = JSON.parse(messageService.decodeContent(body.content));
        if (!body.type) {
            CacheService.code.set(result.code);
            deviceCode.value = result.code;
        }
    }
}
const transferCode = (userId, channel) => {
    let md5 = new Md5();
    md5.appendAsciiStr(userId + ":" + channel);
    return md5.end();
}
const handleConnect = (body) => {
    const code = transferCode(body.fromId, body.sub);
    let content = messageService.decodeContent(body.content)
    let { type, sdp, iceCandidate } = JSON.parse(content.replace(/\n/g, "\\n").replace(/\r/g, "\\r"));
    if (!body.type) {
        initWebRTC(body.fromId, body.sub);
        createOffer(code);
    }
    if (body.type == -1) {
        if (body.code) {
            peerMap.value.delete(body.msgType);
            return;
        }
    }
    if (body.type == 1) {
        if (body.code) {
            peerMap.value.delete(body.msgType);
            let user = roomUsers.value.get(body.msgType);
            if(user){
                user.leave = true;
            }
            return;
        }
        if (type === 'offer') {
            peerMap.value.get(code).setRemoteDescription(new RTCSessionDescription({ type, sdp }));
            createAnswer(code);
            return;
        }
        if (type === 'answer') {
            peerMap.value.get(code).setRemoteDescription(new RTCSessionDescription({ type, sdp }));
            return;
        }
        if (type == '_ice') {
            peerMap.value.get(code).addIceCandidate(iceCandidate);
            return;
        }
        return;
    }
    if (body.type == 2) {
        console.log("自定义消息" + content);
    }
    if (body.type == 3) {
        if (peerMap.value.get(code)) {
            peerMap.value.get(code).close();
            closeConnect(code);
        }
    }
}
const closeConnect = (code) => {
    if (peerMap.value.get(code)) {
        peerMap.value.get(code).onicecandidate = null;
        peerMap.value.get(code).oniceconnectionstatechange = null;
        peerMap.value.get(code).onsignalingstatechange = null;
        peerMap.value.get(code).onicegatheringstatechange = null;
        peerMap.value.get(code).onnegotiationneeded = null;
        peerMap.value.get(code).onconnectionstatechange = null;
        peerMap.value.delete(code);
        channelMap.value.delete(code);
        fileChannelMap.value.delete(code);
        shareFileMap.value.delete(code);
    }
    for (let i = 0; i < userSources.value.length; i++) {
        if (userSources.value[i].id == code) {
            userSources.value.splice(i, 1);
            break;
        }
    }
    if (roomUsers.value.get(code)) {
        const num = Math.ceil(Math.random() * 10) + 1;
        setTimeout(() => {
            reconnect(code);
        }, num * 2000);
    }
}

const reconnect = (code) => {
    const user = roomUsers.value.get(code);
    const peer = peerMap.value.get(code);
    if (user && !user.leave && !peer) {
        initWebRTC(user.userId, user.channel)
        serverSocket.send(messageService.createWebRTCMessage(0, code, userInfo.userId, userInfo.channel, JSON.stringify({
            type: "apply"
        })));
    }
}
const createOffer = (code) => {
    const userInfo = roomUsers.value.get(code);
    const peer = peerMap.value.get(code);
    peer.createOffer().then((offer) => {
        let newOffer = JSON.parse(JSON.stringify(offer));
        serverSocket.send(messageService.createWebRTCMessage(1, code, userInfo.userId, userInfo.channel, JSON.stringify(newOffer)));
        peer.setLocalDescription(offer);
    }).catch((err) => {
        console.log(err)
    });
}
const createAnswer = (code) => {
    const userInfo = roomUsers.value.get(code);
    const peer = peerMap.value.get(code);
    peer.createAnswer().then((answer) => {
        let newAnswer = JSON.parse(JSON.stringify(answer));
        serverSocket.send(messageService.createWebRTCMessage(1, code, userInfo.userId, userInfo.channel, JSON.stringify(newAnswer)));
        peer.setLocalDescription(answer);
    }).catch((err) => {
        console.log(err)
    });
}

const initWebRTC = (userId, channel) => {
    const data = transferCode(userId, channel);
    if (peerMap.value.get(data)) {
        closeConnect(data);
    }
    if (peerConfig.value) {
        peerMap.value.set(data, new RTCPeerConnection(peerConfig.value));
    } else {
        peerMap.value.set(data, new RTCPeerConnection());
    }

    channelMap.value.set(data, peerMap.value.get(data).createDataChannel(data));
    fileChannelMap.value.set(data, peerMap.value.get(data).createDataChannel("file"));
    channelMap.value.get(data).bufferedAmountLowThreshold = 10485760
    fileChannelMap.value.get(data).bufferedAmountLowThreshold = 10485760
    peerMap.value.get(data).onicecandidate = function (e) {
        if (e.candidate) {
            serverSocket.send(messageService.createWebRTCMessage(1, data, userId, channel, JSON.stringify({
                type: '_ice',
                iceCandidate: e.candidate
            })));
        }
    };
    peerMap.value.get(data).ondatachannel = function (e) {
        let receiveChannel = e.channel;
        if (receiveChannel.label == 'file') {
            receiveChannel.onmessage = (e) => {
                handleFileChannel(data, e.data);
            }
        } else {
            receiveChannel.onmessage = (e) => {
                handleChannelMessage(data, e.data);
            }
            receiveChannel.onopen = () => {
                const nickname = userInfo.value ? userInfo.value.nickname : deviceCode.value
                channelMap.value.get(data).send(messageService.createBasicChannelMessage(0, { code: deviceCode.value, nickname: nickname, time: new Date().getTime() }));
                sendFileInfo(data);
                let mediaInfo = { desktop: false, video: false, audio: false, type: 0 }
                if (userStream.value) {
                    mediaInfo.video = true;
                }
                if (desktopStream.value) {
                    mediaInfo.desktop = true;
                }
                channelMap.value.get(data).send(messageService.createMediaChannelMessage(0, mediaInfo));
                sendChatHistoryInfo(data);
            }
            receiveChannel.onclose = () => {
                const peer = peerMap.value.get(data);
                if (peer && peer.connectionState == 'closed') {
                    closeConnect(data);
                }
            }
        }

    }
    peerMap.value.get(data).onconnectionstatechange =
        (event) => {
            switch (event.target.connectionState) {
                case "new":
                    break;
                case "connecting":
                    break;
                case "connected":
                    addUserSource(data);
                    break;
                case "disconnected":
                    closeConnect(data);
                    break;
                case "closed":
                    closeConnect(data);
                    break;
                case "failed":
                    closeConnect(data);
                    break;
                default:
                    closeConnect(data);
                    break;
            }
        }

}
const sendFileInfo = (code) => {
    let fileInfo = [];
    for (let i = 0; i < files.value.length; i++) {
        let md5 = new Md5();
        md5.appendAsciiStr(deviceCode.value + ':' + files.value[i].name + ":" + files.value[i].size);
        let key = md5.end();
        fileInfo.push({ device: deviceCode.value, name: files.value[i].name, size: files.value[i].size, format: fileService.readFileFormat(files.value[i].name), id: key, status: 0 })
    }
    const channel = channelMap.value.get(code);
    if (channel && channel.readyState == 'open') {
        channel.send(messageService.createBasicChannelMessage(1, fileInfo));
    }
}
const addUserSource = (code) => {
    const user = roomUsers.value.get(code);
    const source = userSources.value.find(e => e.id == code);
    if (user && !source) {
        let icon = "pc_icon.png";
        let type = 'pi-desktop';
        if (user.device == 'Android') {
            type = 'pi-android';
            icon = "phone_icon.png";
        } else if (user.device == 'iPhone' || user.device == 'iOS') {
            type = 'pi-apple';
            type = 3
            icon = "iphone_icon.png";
        }
        userSources.value.push({ name: user.nickname, id: code, icon: icon, type: type, video: null, desktop: null, current: null, rtt: 0, region: user.region });
    }

}
const handleChannelMessage = async (code, channelMessage) => {
    if (typeof channelMessage == 'string') {
        let data = JSON.parse(channelMessage);
        let msg = data.data;
        if (data.type == 0) {
            //基础消息
            if (msg.type == 0) {
                if (msg.data.code == deviceCode.value) {
                    let rtt = new Date().getTime() - msg.data.time;
                    userSources.value.forEach(source => {
                        if (source.id == code) {
                            source.rtt = rtt;
                            return
                        }
                    });
                } else {
                    if (channelMap.value.get(code)) {
                        channelMap.value.get(code).send(channelMessage);
                        roomUsers.value.get(code).nickname = msg.data.nickname
                        const source = userSources.value.find(e => e.id == code);
                        if (source) {
                            source.name = msg.data.nickname
                        }

                    }
                }
            } else if (msg.type == 1) {
                //文件列表信息 
                if (msg.data.length) {
                    shareFileMap.value.set(code, msg.data);
                } else {
                    shareFileMap.value.delete(code);
                }

            } else if (msg.type == 2) {
                //下载文件请求
                let fileInfo = msg.data;
                let file = null;
                for (let i = 0; i < files.value.length; i++) {
                    let md5 = new Md5();
                    md5.appendAsciiStr(deviceCode.value + ':' + files.value[i].name + ":" + files.value[i].size);
                    let key = md5.end();
                    if (fileInfo.id == key) {
                        file = files.value[i];
                        break;
                    }
                }
                if (file) {
                    sendFileBuffer(code, file, fileInfo.chunkSize, fileInfo.chunks);
                }
            } else if (msg.type == 3) {
                //文件传输信息通知
                let fileInfo = msg.data;

                for (let i = 0; i < downloadFiles.value.length; i++) {
                    if (fileInfo.id == downloadFiles.value[i].id) {
                        downloadFiles.value[i].chunkSize = fileInfo.chunkSize;
                        downloadFiles.value[i].total = fileInfo.total;
                        downloadFiles.value[i].status = 1;
                        taskMap.value.set(code, downloadFiles.value[i]);
                        break;
                    }
                }
            } else if (msg.type == 4) {
                //暂停文件下载
                let fileInfo = msg.data;
                if (uploadTasks.value.get(code) && uploadTasks.value.get(code).indexOf(fileInfo.id) > -1) {
                    uploadTasks.value.get(code).splice(uploadTasks.value.get(code).indexOf(fileInfo.id), 1);
                }
            }
        } else if (data.type == 3) {
            let mediaInfo = msg.data;
            let channel = channelMap.value.get(code);
            let peer = peerMap.value.get(code);
            if (msg.type == 0) {
                let delay = false;
                const source = userSources.value.find(e => e.id == code);
                if (mediaInfo.desktop) {
                    if (!source.desktop) {
                        console.log('send desktop request');
                        delay = true;
                        peer.ontrack = function (event) {
                            if (event && event.streams) {
                                source.desktop = event.streams[0];
                                source.current = event.streams[0];
                            }
                        }
                        if (channel) {
                            channel.send(messageService.createMediaChannelMessage(1, { type: 1 }))
                        }
                    }
                } else if (source.desktop) {
                    source.desktop = null;
                    handleShowScreen(code);
                    toast.add({ severity: 'error', summary: i18n.t("message.screen_share_stop", [source.name]), group: 'rm', life: 3000 });
                }
                if (mediaInfo.video) {
                    if (!source.video) {
                        if (delay) {
                            setTimeout(() => {
                                console.log('send video request');
                                peer.ontrack = function (event) {
                                    if (event && event.streams) {
                                        source.video = event.streams[0];
                                        source.current = event.streams[0]
                                    }
                                }
                                if (channel) {
                                    channel.send(messageService.createMediaChannelMessage(2, { type: 1 }))
                                }
                            }, 5000);
                        } else {
                            peer.ontrack = function (event) {
                                if (event && event.streams) {
                                    source.video = event.streams[0];
                                    source.current = event.streams[0]
                                }
                            }
                            if (channel) {
                                channel.send(messageService.createMediaChannelMessage(2, { type: 1 }))
                            }
                        }

                    }
                } else if (source.video) {
                    source.video = null;
                    handleShowScreen(code);
                    toast.add({ severity: 'error', summary: i18n.t("message.video_share_stop", [source.name]), group: 'rm', life: 3000 });
                }

            } else if (msg.type == 1) {
                if (mediaInfo.type == 1) {
                    if (desktopStream.value) {
                        let peer = peerMap.value.get(code);
                        if (peer) {
                            let senders = [];
                            desktopStream.value.getTracks().forEach(track => {
                                senders.push(peer.addTrack(track, desktopStream.value));
                            });
                            remoteDesktopTrack.value.set(code, senders);
                            createOffer(code);
                        }
                    } else {
                        mediaInfo.code = '404'
                        mediaInfo.message = 'screen share already canncel '
                        mediaInfo.type = 2
                        channel.send(messageService.createMediaChannelMessage(1, mediaInfo));
                    }
                } else if (mediaInfo.type == 0) {
                    let peer = peerMap.value.get(code);
                    if (peer) {
                        let senders = remoteDesktopTrack.value.get(code);
                        if (senders) {
                            senders.forEach(sender => {
                                peer.removeTrack(sender);
                            })
                            remoteDesktopTrack.value.delete(code);
                        }
                    }
                } else if (mediaInfo.type == 2) {
                    toast.add({ severity: 'error', summary: i18n.t("message.screen_share_stop", code), group: 'rm', life: 3000 });

                }
            } else if (msg.type == 2) {
                if (mediaInfo.type == 1) {
                    if (userStream.value) {
                        let peer = peerMap.value.get(code);
                        if (peer) {
                            let senders = [];
                            userStream.value.getTracks().forEach(track => {
                                senders.push(peer.addTrack(track, userStream.value));
                            });
                            remoteVideoTrack.value.set(code, senders);
                            createOffer(code);
                        }
                    } else {
                        mediaInfo.code = '404'
                        mediaInfo.message = 'video share already canncel '
                        mediaInfo.type = 2
                        channel.send(messageService.createMediaChannelMessage(2, mediaInfo));
                    }
                } else if (mediaInfo.type == 0) {
                    let peer = peerMap.value.get(code);
                    if (peer) {
                        let senders = remoteVideoTrack.value.get(code);
                        if (senders) {
                            senders.forEach(sender => {
                                peer.removeTrack(sender);
                            })
                            remoteVideoTrack.value.delete(code);
                        }
                    }

                } else if (mediaInfo.type == 2) {
                    toast.add({ severity: 'error', summary: i18n.t("message.video_share_stop", code), group: 'rm', life: 3000 });
                }
            } else if (msg.type == 3) {

            }
        } else if (data.type == 4) {
            const content = JSON.parse(AES.decrypt(msg.data, code));
            if (msg.type == 0) {
                if (content.type == 0) {
                    if (userchats.value.length) {
                        let min = content.min;
                        let max = content.max;
                        if (chatHistory.value && chatHistory.value <= min) {
                            return;
                        }
                        if (userchats.value[0].createTime <= min) {
                            if (userchats.value[userchats.value.length] >= max) {
                                return;
                            } else {
                                min = userchats.value[userchats.value.length];
                            }
                        }
                        if (userchats.value[0].createTime > min && userchats.value[0].createTime < content.max) {
                            max = userchats.value[0].createTime;
                        }
                        requestChatHistoryInfo(code, min, max);
                    } else {
                        requestChatHistoryInfo(code, content.min, content.max);
                    }
                } else if (content.type == 1) {
                    sendResponsetChatHistory(code, content)
                }
            } else if (msg.type == 1) {
                userchats.value.push(content);
            } else if (msg.type == 2) {
                content.reverse().forEach(chat => {
                    userchats.value.unshift(chat)
                })
            }
        }
    } else {
        handleFileBuffer(code, channelMessage);
    }
}
const handleFileChannel = async (code, channelMessage) => {
    handleFileBuffer(code, channelMessage);
}
const sendFileBuffer = (code, file, chunkSize, offset) => {
    if (!chunkSize || chunkSize == 0) {
        chunkSize = 128000;
    }
    if (!offset || offset < 0) {
        offset = 0;
    }

    let md5 = new Md5();
    md5.appendAsciiStr(deviceCode.value + ':' + file.name + ":" + file.size);
    let key = md5.end();
    let task = uploadTasks.value.get(code);
    if (!task) {
        task = [];
        task.push(key);
        uploadTasks.value.set(code, task);
    } else {
        task.push(key);
    }
    let fileReader = new FileReader();
    let channel = channelMap.value.get(code);
    let fileChannel = fileChannelMap.value.get(code);
    let totalChunk = file.size % chunkSize == 0 ? file.size / chunkSize : Math.ceil(file.size / chunkSize);
    if (file.size < chunkSize) {
        totalChunk = 1;
    }
    let currentChunk = offset;
    let begin = chunkSize * currentChunk;
    let message = { id: key, name: file.name, size: file.size, total: totalChunk, chunkSize: chunkSize, current: currentChunk }
    //发送文件前发送文件分片信息
    channel.send(messageService.createBasicChannelMessage(3, message))
    fileReader.readAsArrayBuffer(file.slice(begin, Math.min(file.size, begin + chunkSize)));
    fileReader.onload = (event) => {
        fileChannel.send(event.target.result)
        currentChunk++;
        if (uploadTasks.value.get(code) && uploadTasks.value.get(code).indexOf(key) > -1) {
            if (fileChannel.bufferedAmount > 15728640) {
                if (currentChunk < totalChunk) {
                    fileChannel.onbufferedamountlow = () => {
                        fileChannel.onbufferedamountlow = null;
                        let start = chunkSize * currentChunk;
                        let end = Math.min(file.size, start + chunkSize);
                        fileReader.readAsArrayBuffer(file.slice(start, end));
                    }
                } else {
                    uploadTasks.value.get(code).splice(uploadTasks.value.get(code).indexOf(key), 1);

                }
            } else {
                if (currentChunk < totalChunk) {
                    let start = chunkSize * currentChunk;
                    let end = Math.min(file.size, start + chunkSize);
                    fileReader.readAsArrayBuffer(file.slice(start, end));
                } else {
                    uploadTasks.value.get(code).splice(uploadTasks.value.get(code).indexOf(key), 1);
                }
            }
        }
    };
}
const handleFileBuffer = (code, message) => {
    let data = taskMap.value.get(code);
    if (!data) {
        return;
    }
    let fileInfo = null;
    for (let i = 0; i < downloadFiles.value.length; i++) {
        if (data.id == downloadFiles.value[i].id) {
            fileInfo = downloadFiles.value[i];
            break;
        }
    }
    if (!fileInfo) {
        return;
    }
    if (fileInfo.status == 3) {
        return;
    }
    let writer = streamWriterMap.value.get(data.id);
    if (!writer) {
        let fileStream = streamSaver.createWriteStream(data.name, { size: data.size, pathname: data.id });
        writer = fileStream.getWriter();
        streamWriterMap.value.set(data.id, writer);
    }
    if (message instanceof Blob) {
        message.arrayBuffer().then(buffer => {
            writer.write(new Uint8Array(buffer)).then(() => {
                fileInfo.chunks++;
                if (fileInfo.total == fileInfo.chunks) {
                    fileInfo.cost = new Date().getTime() - fileInfo.start;
                    writer.close();
                    streamWriterMap.value.delete(data.id);
                    fileInfo.status = 2;
                    downloadNext(code);
                }
            }).catch((err) => {
                onStopDownload(fileInfo);
                fileInfo.chunks = 0
                streamWriterMap.value.delete(data.id)
            });

        });
    } else {
        writer.write(new Uint8Array(message)).then(() => {
            fileInfo.chunks++;
            if (fileInfo.total == fileInfo.chunks) {
                fileInfo.cost = new Date().getTime() - fileInfo.start;
                writer.close();
                streamWriterMap.value.delete(data.id);
                fileInfo.status = 2;
                downloadNext(code);
            }
        }).catch((err) => {
            onStopDownload(fileInfo);
            fileInfo.chunks = 0
            streamWriterMap.value.delete(data.id)
        });

    }

}

const onStopDownload = (fileInfo) => {
    let channel = channelMap.value.get(fileInfo.device);
    if (channel) {
        channel.send(messageService.createBasicChannelMessage(4, fileInfo));
    }
    fileInfo.status = 3;
    downloadNext(fileInfo.device);
}
const downloadNext = (code) => {
    taskMap.value.delete(code);
    let dataChannel = channelMap.value.get(code);
    for (let i = 0; i < downloadFiles.value.length; i++) {
        if (downloadFiles.value[i].code == code && (downloadFiles.value[i].status == 0 || downloadFiles.value[i].status == 1)) {
            if (downloadFiles.value[i].type == 0) {
                dataChannel.send(messageService.createFileChannelMessage(2, downloadFiles.value[i]));
            } else if (downloadFiles.value[i].type == 1) {
                dataChannel.send(messageService.createBasicChannelMessage(2, downloadFiles.value[i]));
            } else {
                dataChannel.send(messageService.createFileChannelMessage(5, downloadFiles.value[i]));
            }
            break;
        }
    }
}


const homepage = (data) => {
    if (data) {
        confirm.require({
            group: 'refreshDialog',
            message: i18n.t("message.homepage_confirm"),
            header: i18n.t("headers.confirm_msg"),
            icon: 'pi pi-info-circle',
            position: 'top',
            accept: () => {
                router.push('/');
            },
            reject: () => {

            }
        });
    } else {
        router.push('/');
    }

}

onBeforeUnmount(() => {

    roomUsers.value.forEach(user => {
        serverSocket.send(messageService.createWebRTCMessage(3, transferCode(user.userId, user.channel), user.userId, user.channel, JSON.stringify({
            type: "close"
        })));
    })
    roomUsers.value.clear();
    serverSocket.send(messageService.createCustomMessage(1, null, null, 'leave', JSON.stringify({
        code: roomCode.value
    })))
    closeAllConnection();
    serverSocket.removeMsgEvent(socketRoomEvent);
    if (userStream.value) {
        let tracks = userStream.value.getTracks();
        if (tracks) {
            tracks.forEach(track => {
                track.stop();
            });
        }
        userStream.value = null;
    }
    if (desktopStream.value) {
        let tracks = desktopStream.value.getTracks();
        if (tracks) {
            tracks.forEach(track => {
                track.stop();
            });
        }
        desktopStream.value = null;
    }
})
const initMenuItem = () => {
    document.title = i18n.t('headers.title')
    menubarItems.value = [
        {
            label: i18n.t("menus.home"),
            icon: 'pi pi-home',
            command: () => {
                homepage(true)
            },

        },
        {
            label: i18n.t("menus.video"),
            icon: 'pi pi-video',
            command: () => {
                shareVideo();
            }
        },
        {
            label: i18n.t("menus.screen"),
            icon: 'pi pi-desktop',
            command: () => {
                shareScreen();
            }
        },
        {
            label: i18n.t("menus.file"),
            icon: 'pi pi-file',
            command: () => {
                displayFile.value = true;
            }
        },
        {
            label: i18n.t("label.chat"),
            icon: 'pi pi-comments',
            command: () => {
                displayChat.value = true;
            }
        },
        {
            label: i18n.t("label.refresh"),
            icon: 'pi pi-refresh',
            command: () => {
                refreshRoom();
            }
        }
    ]

}
const joinRoom = () => {
    if (joinInfo.value.code) {
        if (joinInfo.value.password) {
            serverSocket.send(messageService.createCustomMessage(1, null, null, 'verify', JSON.stringify({
                code: joinInfo.value.code,
                password: joinInfo.value.password
            })))
        } else {
            serverSocket.send(messageService.createCustomMessage(1, null, null, 'join', JSON.stringify({
                code: joinInfo.value.code
            })))
        }

    }
}

const closeAllConnection = () => {
    for (let writer of streamWriterMap.value.values()) {
        writer.abort();
    }
    for (let peer of peerMap.value.values()) {
        peer.close();
    }
    clearInterval(keepAliveInt.value);
}


const createConnection = (deviceId, channel, token) => {
    serverSocket.createConnection(deviceId, channel, token);
}

deviceService.getDeviceBase().then(data => {
    if (CacheService.token.get() && CacheService.username.get()) {
        createConnection(CacheService.username.get(), CacheService.device.get(), CacheService.token.get());
    } else {
        createConnection(data.deviceId, data.channel);
    }

});

</script>
<style scoped>
.dock-demo>.dock-window {
    width: 100%;
    height: 100%;
    position: absolute;
    background-image: url("/images/window.jpg");
    background-repeat: no-repeat;
    background-size: cover;
    z-index: 1;
}

.dock-demo .p-menubar {
    padding: 5;
    border-radius: 0;
}

.float-container {
    top: 70px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    padding: 0.5rem 0.5rem;
    border-radius: 0.5rem;
    position: absolute;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 999;
}

#videoScreen {
    position: relative;
    background: #757474;
    width: 100%;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
}

.user-video {
    background: #757474;
    width: 90px;
    height: 90px;
}

.media-btn {
    bottom: 50%;
    left: 0px;
    position: absolute;
    z-index: 999;
}

:deep(#chat-textare>.emoji-textarea>textarea) {
    background: rgba(255, 255, 255, 0.1);
}

.input-chat {
    position: absolute;
    bottom: 60%;
    right: 10px;
    transform: translate(0, -50%);
    z-index: 999;
}


.user-preview { 
    vertical-align: middle;
    bottom: 0px;
    left: 50%;
    position: absolute;
    transform: translate(-50%, 0%);
    z-index: 999;
}

.video-btn {
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 999;
}

.long-name {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 100px;
}

.chat-card {
    position: relative;
    width: 310px; 
    z-index: 2;
}

.show-chat-input {
    position: relative;
    z-index: 2;
}



.video-dom {
    position: fixed;
    top: 0px;
    right: 0px;
    bottom: 0px;
    left: 0px;
    right: 0px;
    background: #757474;
}

.video-dom>video::-webkit-media-controls-timeline {
    display: none;
}

.video-dom>video::-webkit-media-controls-mute-button {
    display: none;
}

.video-dom>video::-webkit-media-controls-overlay-play-button {
    display: none;
}

.video-dom>video::-webkit-media-controls-play-button {
    display: none;
}
</style>