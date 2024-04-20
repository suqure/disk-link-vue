<script setup>
import { ref, onBeforeMount, onMounted, onBeforeUnmount } from 'vue';
import CacheService from '@/utils/cache.js';
import { useRoute } from "vue-router"
import { useI18n } from 'vue-i18n';
import serverSocket from '@/utils/socket'; 
import vueQr from 'vue-qr/src/packages/vue-qr.vue';
import DeviceService from '@/service/DeviceService';
import FileService from '@/service/FileService';
const deviceService = new DeviceService();
const fileService = new FileService();
const route = useRoute();
const i18n = useI18n();
const { locale } = useI18n();
const shareCode = ref();
const userInfo = ref();
const shareFile = ref();
const userSetting = ref({ requirePwd: false, automated: '0', password: '', lang: 'zh-cn', splitRecord: 0 });
const loading = ref(true)
const formatSize = (bytes) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}
const createConnection = (deviceId, channel, token) => {
    serverSocket.createConnection(deviceId, channel, token);
}
const downloadFile =(url)=>{
    location.href = url;
} 
onBeforeMount(() => {
    if (route.query && route.query.code) {
        shareCode.value = route.query.code
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
    serverSocket.addOpenEvent(socketOpenEvent);
    deviceService.getDeviceBase().then(data => {
        if (CacheService.token.get() && CacheService.username.get()) {
            createConnection(CacheService.username.get(), CacheService.device.get(), CacheService.token.get());
        } else {
            createConnection(data.deviceId, data.channel);
        }
    });
})
onMounted(() => {


})
onBeforeUnmount(() => {
    serverSocket.removeOpenEvent(socketOpenEvent);
})

const socketOpenEvent = () => {
    deviceService.getFileShare(shareCode.value).then(data => {
        if (data) {
            shareFile.value = {
                qr: process.env.VITE_SHARE_URL + "?code=" + data.code,
                path: data.fullPath,
                name: data.fileName,
                fileSize: data.fileSize,
                code: data.code,
                type: fileService.readFileFormat(data.fileName)
            }
        }
        loading.value = false;
    })

}
</script>

<template>
    <div class="surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden">
        <div class="flex flex-column align-items-center justify-content-center">
            <img :src="'images/icons/logo.png'" alt="disk link logo" class="mb-5 w-6rem flex-shrink-0" />
            <div
                style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, rgba(247, 149, 48, 0.4) 10%, rgba(247, 149, 48, 0) 30%)">
                <div class="w-full surface-card py-8 px-5 sm:px-8 flex flex-column align-items-center"
                    style="border-radius: 53px">
                    <div class="grid flex flex-column align-items-center">
                        <div v-if="!shareFile" class="flex justify-content-center align-items-center bg-orange-500 border-circle"
                            style="width: 3.2rem; height: 3.2rem">
                            <i  class="text-50 pi pi-fw pi-file text-2xl"></i> 
                        </div>
                        <img v-if="shareFile" :src="'images/icons/' + shareFile.type + '.png'" :alt="shareFile.type" width="50"
                                                v-tooltip.top="shareFile.type" />
                        <h1 v-if="shareCode" class="text-900 font-bold text-4xl lg:text-5xl mb-2">{{ shareCode }}</h1>
                        <div v-if="shareFile" style="text-align: center;">
                            <label class="block text-900 text-xl font-medium mb-2">
                                {{ $t('common.name') }} : {{ shareFile.name }}
                            </label>
                            <label class="block text-900 text-xl font-medium mb-2">
                                {{ $t('common.size') }} : {{ formatSize(shareFile.fileSize) }}
                            </label>
                            <div style="text-align: center;">
                                <vue-qr v-if="shareFile.qr" :logoSrc="'images/icons/logo.png'" :text="shareFile.qr"
                                    :size="200"></vue-qr>
                            </div>
                            <Button v-if="shareFile.type=='file'" :label="$t('common.download')"   text raised @click="downloadFile(shareFile.path)" ></Button>
                            <Button v-if="shareFile.type!='file'" :label="$t('common.preview')"   text raised @click="downloadFile(shareFile.path)" ></Button>
                        </div>
                        <div v-if="!shareFile">
                            <span class="text-600 mb-5">{{ $t('message.file_not_found') }}</span>
                        </div>
                        <h1 v-if="loading" class="text-900 font-bold text-4xl lg:text-5xl mb-2">{{ $t('common.loading') }}
                        </h1>
                        <ProgressSpinner v-if="loading" />
                        <div class="col-12 mt-5 text-center">
                            <i class="pi pi-fw pi-arrow-left text-blue-500 mr-2" style="vertical-align: center"></i>
                            <router-link to="/" class="text-blue-500">{{ $t('label.go_home') }}</router-link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>