<template>
    <div>
        <div class="dock-demo" sytle="width:100%">
            <Toast position="top-center" group="tc" />
            <ConfirmDialog group="recDialog"></ConfirmDialog>
            <ConfirmDialog group="refreshDialog"></ConfirmDialog>
            <div class="dock-window dock-advanced">
                <Menubar :model="menubarItems">
                    <template #end>
                        <span class="pi pi-th-large" style="font-size: 1.5rem;" id="install"
                            v-tooltip.left="$t('menus.install')" v-if="installApp" @click="installDestop"></span>
                        <span class="pi pi-user" style="font-size: 1.5rem;padding:10px" id="accountInfo"
                            v-tooltip.left="$t('menus.account')" @click="accountAction"></span>
                        <span class="pi pi-question-circle" style="font-size: 1.5rem" @click="toggle" id="helpInfo"
                            v-tooltip.left="$t('tooltips.help')" aria-controls="overlay_menu"></span>
                        <Menu ref="helpMenu" id="overlay_menu" :model="helpItems" :popup="true" />
                        <Menu ref="acountMenu" id="overlay_menu" :model="accountItems" :popup="true" />
                    </template>
                </Menubar>
                <div class="user-chat" v-show="channelMap.size">
                    <div class="text-center show-chat-input" v-drag v-show="!displayChatInput">
                        <Button icon="pi pi-comments" severity="info" :badge="unreadChat" text raised rounded
                            @click="showChatInput" v-tooltip.left="$t('label.chat')" />
                    </div>
                    <div v-show="displayChatInput" class="chat-card">
                        <TabView>
                            <TabPanel v-for="(channels, code) in channelMap" :key="code" :header="channels[0]">
                                <ScrollPanel style="width: 100%; height: 300px">
                                    <div v-for="(userchat, index) in chatMap.get(channels[0])">
                                        <div class="my-chat" v-if="deviceCode == userchat.code">
                                            <Chip>
                                                {{ userchat.comment }}
                                            </Chip>
                                        </div>
                                        <div v-if="deviceCode != userchat.code">
                                            <Chip>
                                                {{ userchat.comment }}
                                            </Chip>
                                        </div>
                                    </div>
                                </ScrollPanel>
                                <V3Emoji :textArea="true" size="small" keep fix-pos="upleft" id="chat-textare"
                                    :textAreaOption="{ placeholder: $t('label.chat_placeholder') }" v-model="chatValue" />
                                <div class="flex-1 text-center  md:align-items-end">
                                    <Button :disabled="!chatValue" class="w-full p-3 text-xl"
                                        @click="submitChat(channels[0])" :label="$t('label.submit_chat')" text raised />
                                </div>
                            </TabPanel>
                        </TabView>
                        <Button @click="colseChat" class="w-full p-3 text-xl" :label="$t('common.close')" text raised />
                    </div>
                </div>
                <div class="user-chat" v-show="displayAiChat">
                    <Card>
                        <template #subtitle>{{ $t('label.ai_chat') }} </template>
                        <template #content>
                            <div class="chat-card">
                                <ScrollPanel style="width: 100%; height: 300px">
                                    <div v-for="(chat, index) in aiChats" style="width:96%">
                                        <div class="my-chat" v-if="0 == chat.type">
                                            <Chip icon="pi pi-prime">
                                                {{ chat.comment }}
                                            </Chip>
                                            <Avatar icon="pi pi-user" style="background-color: #2196F3; color: #ffffff"
                                                shape="circle" />
                                        </div>
                                        <div v-if="1 == chat.type">
                                            <Avatar :image="'images/icons/logo.png'" shape="circle" />
                                            <Chip icon="pi pi-prime">
                                                {{ chat.comment }}
                                            </Chip>
                                            <ProgressSpinner v-if="aiworking && !chat.comment"
                                                style="width: 30px; height: 30px" strokeWidth="8"
                                                fill="var(--surface-ground)" animationDuration=".5s"
                                                aria-label="Custom ProgressSpinner" />
                                        </div>
                                    </div>
                                </ScrollPanel>
                                <V3Emoji :textArea="true" size="small" keep fix-pos="upleft" id="chat-textare"
                                    :textAreaOption="{ placeholder: $t('label.chat_placeholder') }" v-model="aiChatValue" />
                                <Button :disabled="!aiChatValue" class="w-full p-3 text-xl" @click="submitAiChat"
                                    :label="$t('label.submit_chat')" text raised />
                                <Button @click="colseAiChat" class="w-full p-3 text-xl" :label="$t('common.close')" text
                                    raised />
                            </div>
                        </template>
                    </Card>
                </div>

                <div class="ai-chat">
                    <div class="text-center show-chat-input" v-drag v-show="!displayAiChat && userInfo">
                        <Button icon="pi pi-comments" severity="info" text raised rounded @click="showAiChat"
                            v-tooltip.left="$t('label.ai_chat')" />
                    </div>
                </div>
                <Dock :model="items">
                    <template #item="{ item }">
                        <a href="#" class="p-dock-link" :id="item.id" v-tooltip.top="item.label"
                            @click="onDockItemClick($event, item)">
                            <img :alt="item.label" :src="item.icon" style="width: 100%" />
                        </a>
                    </template>
                </Dock>

                <div id="videoDiv">
                    <div class="video-card" v-drag>
                        <i class="pi pi-times-circle" id="closeDestopSource" v-tooltip.top="$t('tooltips.stop_screen')"
                            @click="closeDesktop" v-show="displayDesktop" style="font-size: 1.5rem;color: red"></i>
                        <i class="pi pi-microphone" id="muteDestopSource" v-tooltip.top="$t('tooltips.video_mute')"
                            @click="muteScreen" v-show="displayDesktop && !screenMute"
                            style="font-size: 1.5rem;color: red"></i>
                        <i class="pi pi-microphone" id="unmuteDestopSource" v-tooltip.top="$t('tooltips.canel_mute')"
                            @click="unmuteScreen" v-show="displayDesktop && screenMute"
                            style="font-size: 1.5rem;color: green"></i>
                        <i class="pi pi-stop-circle" id="recordDestopSource" v-tooltip.top="$t('tooltips.record_screen')"
                            @click="recordScreen" v-show="displayDesktop && !screenRecord"
                            style="font-size: 1.5rem;color: green"></i>
                        <i class="pi pi-stop-circle" id="stopRecordDestopSource" v-tooltip.top="$t('tooltips.stop_record')"
                            @click="stopRecordScreen" v-show="displayDesktop && screenRecord"
                            style="font-size: 1.5rem;color: red"></i>
                        <video id="desktopSource" playsinline autoplay muted v-show="displayDesktop"></video>
                        <label style="font-size: 1.5rem;padding:10px;" v-show="displayDesktop">{{
                            $t('label.view_user', [remoteDesktopTrack.size || 0]) }}</label>
                    </div>
                    <div class="video-card" v-drag>
                        <i class="pi pi-times-circle" id="closeUserSource" v-tooltip.top="$t('tooltips.stop_video')"
                            @click="closeVideo" v-show="displayVideo" style="font-size: 1.5rem;color: red"></i>
                        <i class="pi pi-sync" id="switchUserSource" v-tooltip.top="$t('tooltips.switch_video')"
                            @click="switchVideo" v-show="displayVideo" style="font-size: 1.5rem;color: green"></i>
                        <i class="pi pi-microphone" id="muteUserSource" v-tooltip.top="$t('tooltips.video_mute')"
                            @click="muteVideo" v-show="displayVideo && !videoMute" style="font-size: 1.5rem;color: red"></i>
                        <i class="pi pi-microphone" id="unmuteUserSource" v-tooltip.top="$t('tooltips.canel_mute')"
                            @click="unmuteVideo" v-show="displayVideo && videoMute"
                            style="font-size: 1.5rem;color: green"></i>
                        <video id="userSource" playsinline autoplay muted v-show="displayVideo" @dblclick="handleScreen"
                            v-tooltip.top="$t('tooltips.fullscreen')"> </video>
                        <label style="font-size: 1.5rem;padding:10px" v-show="displayVideo">{{
                            $t('label.view_user', [remoteVideoTrack.size || 0]) }}</label>
                    </div>
                </div>
                <div id="remoteDiv">
                    <div class="video-card" v-drag>
                        <i class="pi pi-times-circle" id="closeRemoteDestop" v-tooltip.top="$t('tooltips.close_screen')"
                            @click="closeRemoteDesktop" v-show="displayRemoteDesktop"
                            style="font-size: 1.5rem;color: red"></i>
                        <i class="pi pi-stop-circle" id="recordRemoteDesktop" v-tooltip.top="$t('tooltips.record_screen')"
                            @click="recordRemoteScreen" v-show="displayRemoteDesktop && !screenRemoteRecord"
                            style="font-size: 1.5rem;color: green"></i>
                        <i class="pi pi-stop-circle" id="stopRecordRemoteDesktop" v-tooltip.top="$t('tooltips.stop_record')"
                            @click="stopRecordRemoteScreen" v-show="displayRemoteDesktop && screenRemoteRecord"
                            style="font-size: 1.5rem;color: red"></i>
                        <video id="remoteDesktop" playsinline autoplay v-show="displayRemoteDesktop"
                            @dblclick="handleScreen" v-tooltip.top="$t('tooltips.fullscreen')"></video>
                    </div>
                    <div class="video-card" v-drag>
                        <i class="pi pi-times-circle" id="closeRemoteSource" v-tooltip.top="$t('tooltips.close_video')"
                            @click="closeRemoteVideo" v-show="displayRemoteVideo" style="font-size: 1.5rem;color: red"></i>
                        <i class="pi pi-stop-circle" id="recordRemoteSource" v-tooltip.top="$t('tooltips.record_screen')"
                            @click="recordRemoteVideo" v-show="displayRemoteVideo && !videoRemoteRecord"
                            style="font-size: 1.5rem;color: green"></i>
                        <i class="pi pi-stop-circle" id="stopRecordRemoteSource" v-tooltip.top="$t('tooltips.stop_record')"
                            @click="stopRecordRemoteVideo" v-show="displayRemoteVideo && videoRemoteRecord"
                            style="font-size: 1.5rem;color: red"></i>
                        <video id="remoteVideo" playsinline autoplay v-show="displayRemoteVideo" @dblclick="handleScreen"
                            v-tooltip.top="$t('tooltips.fullscreen')"></video>
                    </div>
                </div>
                <div class="video-play" v-drag>
                    <i class="pi pi-times-circle" id="closeTorrentSource" v-tooltip.top="$t('common.close')"
                        @click="closeTorrentVideo" v-show="displayTorrentVideo" style="font-size: 2.5rem;color: red"></i>
                    <video id="torrentVideo" playsinline controls autoplay v-show="displayTorrentVideo"
                        @dblclick="handleScreen" v-tooltip.top="$t('tooltips.fullscreen')"></video>
                </div>
                <Sidebar v-model:visible="displayComment" position="right" class="w-full md:w-20rem lg:w-30rem">
                    <h2>{{ $t('headers.comment') }}</h2>
                    <Card>
                        <template #title> {{ $t('label.comment_title') }} </template>
                        <template #subtitle>{{ $t('label.comment_subtitle') }} </template>
                        <template #content>
                            <ScrollPanel style="width: 100%; height: 300px">
                                <div class="mb-3 font-bold text-2xl" style="text-align: center;" v-show="commentMore">
                                    <Chip :label="$t('common.more')" icon="pi pi-chevron-up" @click="showMoreComment" />
                                </div>
                                <div v-for="(usercomment, index) in usercomments">
                                    <span class="pi pi-user"> {{ usercomment.code }} {{ $t('label.comment_post') }} {{
                                        formatCommentTime(usercomment.createTime) }}</span>
                                    <div>
                                        <Chip>
                                            {{ usercomment.comment }}
                                        </Chip>
                                    </div>
                                </div>
                                <p v-if="!usercomments.length">
                                    {{ $t('label.comment_empty') }}
                                </p>
                            </ScrollPanel>
                        </template>
                        <template #footer>
                            <Textarea v-model="commentValue" :placeholder="$t('label.comment_placeholder')"
                                inputClass="w-full" class="w-full p-3"></Textarea>
                            <Button class="w-full p-3 text-xl" :disabled="!commentValue" @click="submitComment"
                                :label="$t('label.submit_comment')" text raised />
                        </template>
                    </Card>
                </Sidebar>

                <Button icon="pi pi-envelope" id="userComentBtn" severity="info" rounded @click="showUserComment"
                    :badge="commentBadge" v-tooltip.left="$t('headers.comment')" />
                <Dialog v-model:visible="displayAbout" :header="$t('headers.about')" :modal="true">
                    <Card style="width: 25em">
                        <template #header>
                            <img alt="user header" :src="'images/icons/logo.png'" />
                        </template>
                        <template #title> {{ $t('label.about_title') }} </template>
                        <template #subtitle> {{ $t('label.about_subtitle') }} </template>
                        <template #content>
                            <p>
                                {{ $t('message.about_p1') }}
                            </p>
                            <p>
                                {{ $t('message.about_p2') }}
                            </p>
                        </template>
                    </Card>
                </Dialog>
                <Dialog v-model:visible="displayTorrent" :header="$t('headers.torrent')" :modal="true"
                    :style="{ width: '100vw' }">
                    <div class="formgroup-inline">
                        <span class="p-float-label">
                            <InputText id="torrentUrl" style="width:50vw" v-model="magnetUri" />
                            <label for="torrentUrl">{{ $t('label.torrent_placeholder') }}</label>
                        </span>
                        <span style="margin-left: 5px;">
                            <Button :label="$t('common.add')" @click="onLoadTorrent" text raised />
                        </span>
                        <FileUpload mode="basic" :auto="true" customUpload :chooseLabel="$t('common.seed')"
                            @select="openTorrent($event)" accept="*.torrent">
                            <template #uploadicon>
                                <div></div>
                            </template>
                        </FileUpload>
                    </div>
                    <DataView :value="torrentList" layout="list" :paginator="true" :rows="9">
                        <template #list="slotProps">
                            <div class="col-12">
                                <div class="flex flex-column md:flex-row align-items-center p-3 w-full">
                                    <div class="flex-1 text-center md:text-left">
                                        <div class="font-bold text-2xl" v-if="slotProps.data.totalSize">{{
                                            slotProps.data.name }}</div>
                                        <div class="mb-3" v-if="!slotProps.data.totalSize">{{ slotProps.data.id }}</div>
                                        <div class="flex align-items-center">
                                            <span class="font-semibold" v-if="slotProps.data.totalSize">{{
                                                formatSize(slotProps.data.totalSize) }}</span>
                                        </div>
                                        <i class="pi pi-spin pi-spinner" v-if="!slotProps.data.totalSize"
                                            style="font-size: 1.5rem"></i>
                                    </div>
                                    <div
                                        class="flex flex-row md:flex-column justify-content-between w-full md:w-auto align-items-center md:align-items-end mt-5 md:mt-0">
                                        <Button :label="$t('common.remove')" text raised
                                            @click="onDeleteTorrentClick(slotProps.data)"></Button>

                                    </div>
                                </div>
                                <DataTable :value="slotProps.data.files" v-show="slotProps.data.files.length > 0">
                                    <Column field="name" :header="$t('common.name')">
                                        <template #body="{ data }">
                                            <img :src="'images/icons/' + data.format + '.png'" :alt="data.format" width="30"
                                                v-tooltip.top="data.format" />
                                            {{ data.name }}
                                        </template>
                                    </Column>
                                    <Column field="size" :header="$t('common.size')">
                                        <template #body="{ data }">
                                            {{ formatSize(data.size) }}
                                        </template>
                                    </Column>
                                    <Column field="action" :header="$t('common.opt')">
                                        <template #body="{ data }">
                                            <Button icon="pi pi-cloud-download" text raised rounded aria-label="download"
                                                v-tooltip="$t('tooltips.download')"
                                                @click="onTorrentDownload(slotProps.data.id, data)" />
                                            <Button icon="pi pi-play" text raised rounded aria-label="play"
                                                v-tooltip="$t('common.play')" v-if="checkVideoType(data)"
                                                @click="onVideoPlay(slotProps.data.id, data)" />
                                        </template>
                                    </Column>
                                </DataTable>
                            </div>
                        </template>
                    </DataView>
                </Dialog>
                <Dialog v-model:visible="displayCreateRoom" :header="$t('headers.createRoom')" :modal="true">
                    <div v-show="!roomInfo.code">
                        <label for="room_name" class="block text-900 text-xl font-medium mb-2">{{ $t('label.room_name')
                        }}</label>
                        <InputText id="room_name" type="text" :placeholder="$t('label.room_name_placeholder')"
                            class="w-full md:w-30rem mb-5" style="padding: 1rem" v-model="roomInfo.name" />
                        <label for="room_auth" class="block text-900 text-xl font-medium mb-2">{{ $t('label.room_auth')
                        }}</label>
                        <InputSwitch id="room_auth" v-model="roomInfo.auth"
                            v-tooltip.right="$t('label.room_auth_placeholder')" />
                        <div v-show="roomInfo.auth">
                            <label for="room_pwd" class="block text-900 font-medium text-xl mb-2">{{
                                $t('label.room_pwd')
                            }}</label>
                            <Password id="room_pwd" v-model="roomInfo.password" :placeholder="$t('label.pwd_placeholder')"
                                :toggleMask="true" class="w-full mb-3" inputClass="w-full"
                                :inputStyle="{ padding: '1rem' }">
                            </Password>
                        </div>
                        <Button :label="$t('label.new')" @click="createRoom" class="w-full p-3 text-xl"
                            :disabled="(roomInfo.auth && !roomInfo.password) || !roomInfo.name"></Button>
                    </div>
                    <div v-show="roomInfo.code">
                        <div style="text-align: center;">
                            <vue-qr v-if="roomInfo.qr" :logoSrc="'images/icons/logo.png'" :text="roomInfo.qr"
                                :size="200"></vue-qr>
                        </div>
                        <div style="text-align: center;">
                            <Button icon="pi pi-times" severity="danger" text rounded @click="closeRoom"
                                v-tooltip="$t('label.close_room')" />
                        </div>
                        <label class="block text-900 text-xl font-medium mb-2">{{ $t('label.room_code') }} : {{
                            roomInfo.code }}
                        </label>
                        <label class="block text-900 text-xl font-medium mb-2">{{ $t('label.room_name') }} : {{
                            roomInfo.name }}</label>
                        <div v-show="roomInfo.password">
                            <label class="block text-900 text-xl font-medium mb-2">{{ $t('label.room_pwd') }} : {{
                                roomInfo.password }}</label>
                        </div>
                        <label class="block text-900 text-xl font-medium mb-2">{{ $t('label.room_users') }} : {{
                            roomInfo.users }}</label>
                        <label class="block text-900 text-xl font-medium mb-2">{{ $t('label.room_url') }} : {{
                            roomInfo.qr }}
                        </label>
                        <Button :label="$t('label.join_room')" @click="openRoom" class="w-full p-3 text-xl"></Button>
                    </div>
                </Dialog>
                <Dialog v-model:visible="displaySignUp" :header="$t('headers.sign_up')" :modal="true">
                    <div>
                        <label for="user_account" class="block text-900 text-xl font-medium mb-2">{{ $t('label.account')
                        }}</label>
                        <InputText id="user_account" type="text" :placeholder="$t('label.account_placeholder')"
                            class="w-full md:w-30rem mb-5" style="padding: 1rem" v-model="signUpForm.username" />
                        <label for="nickname" class="block text-900 text-xl font-medium mb-2">{{ $t('label.nickname')
                        }}</label>
                        <InputText id="nickname" type="text" :placeholder="$t('label.nickname_placeholder')"
                            class="w-full md:w-30rem mb-5" style="padding: 1rem" v-model="signUpForm.nickname" />
                        <label for="pwd" class="block text-900 font-medium text-xl mb-2">{{ $t('label.password')
                        }}</label>
                        <Password id="pwd" v-model="signUpForm.password" :placeholder="$t('label.pwd_placeholder')"
                            :toggleMask="true" class="w-full mb-3" inputClass="w-full" :inputStyle="{ padding: '1rem' }">
                        </Password>
                        <label for="regEmail" class="block text-900 text-xl font-medium mb-2">{{ $t('label.email')
                        }}</label>
                        <AutoComplete id="regEmail" type="text" :placeholder="$t('label.email_placehodler')"
                            @complete="emailComplete" :suggestions="emailItems" inputClass="w-full md:w-30rem mb-5"
                            :inputStyle="{ padding: '1rem' }" v-model="signUpForm.email" />
                        <label for="regCode" class="block text-900 font-medium text-xl mb-2">{{
                            $t('label.verify_code') }}</label>
                        <div class="flex align-items-center justify-content-between mb-5 gap-5">
                            <InputText id="regCode" :placeholder="$t('label.verify_placeholder')" v-model="signUpForm.code"
                                class=" mb-3" inputClass="w-full" :inputStyle="{ padding: '1rem' }"></InputText>
                            <span v-if="state.signdown > 0">{{ $t('label.resend_tips', [state.signdown]) }}</span>
                            <Button :label="$t('label.send_verify')" :disabled="state.signdown || !signUpForm.email"
                                @click="sendSignUpCode"></Button>
                        </div>
                        <Button :label="$t('label.sign_up')" @click="userSignUp" class="w-full p-3 text-xl"
                            :disabled="!signUpForm.email || !signUpForm.username || !signUpForm.password || !signUpForm.code"></Button>
                    </div>
                </Dialog>
                <Dialog v-model:visible="displayUserInfo" :header="$t('headers.user_info')" :modal="true">
                    <label class="block text-900 text-xl font-medium mb-2">{{ $t('label.account') }} : {{ userInfo.username
                    }}</label>
                    <label class="block text-900 text-xl font-medium mb-2">{{ $t('label.nickname') }} :
                        <i class="pi pi-file-edit" v-show="!editUser" style="padding: 1rem;color: green"
                            @click="startEditUser"> {{ userInfo.nickname }}</i>
                        <InputText v-show="editUser" type="text" :placeholder="$t('label.nickname_placeholder')"
                            v-model="editInfo.nickname" />
                        <i class="pi pi-check" v-show="editUser" style="padding: 1rem;color: green"
                            @click="saveEditUser"></i>
                    </label>
                    <label class="block text-900 text-xl font-medium mb-2">{{ $t('label.email') }} : {{ userInfo.email
                    }}</label>
                    <label class="block text-900 text-xl font-medium mb-2">{{ $t('label.sign_up_time') }} : {{
                        formatTimestamp(userInfo.createTime) }}</label>
                </Dialog>
                <Dialog v-model:visible="displayReset" :header="$t('headers.reset_pwd')" :modal="true">
                    <AutoComplete id="userEmail" type="text" :placeholder="$t('label.email_placehodler')"
                        @complete="emailComplete" :suggestions="emailItems" inputClass="w-full md:w-30rem mb-5"
                        :inputStyle="{ padding: '1rem' }" v-model="resetForm.email" />
                    <label for="resetpwd" class="block text-900 font-medium text-xl mb-2">{{ $t('label.new_pwd')
                    }}</label>
                    <Password id="resetpwd" v-model="resetForm.password" :placeholder="$t('label.pwd_placeholder')"
                        :toggleMask="true" class="w-full mb-3" inputClass="w-full" :inputStyle="{ padding: '1rem' }"
                        :feedback="false"></Password>
                    <label for="resetCode" class="block text-900 font-medium text-xl mb-2">{{
                        $t('label.verify_code') }}</label>
                    <div class="flex align-items-center justify-content-between mb-5 gap-5">
                        <InputText id="resetCode" :placeholder="$t('label.verify_placeholder')" v-model="resetForm.code"
                            class=" mb-3" inputClass="w-full" :inputStyle="{ padding: '1rem' }"></InputText>
                        <span v-if="state.resetdown > 0">{{ $t('label.resend_tips', [state.resetdown]) }}</span>
                        <Button :label="$t('label.send_verify')" :disabled="state.resetdown || !resetForm.email"
                            @click="sendResetCode"></Button>
                    </div>
                    <Button :label="$t('label.reset_pwd')" @click="resetPassword"
                        :disabled="!resetForm.email || !resetForm.password || !resetForm.code"
                        class="w-full p-3 text-xl"></Button>
                </Dialog>
                <Dialog v-model:visible="displaySignIn" :header="$t('headers.sign_in')" :modal="true">
                    <TabView v-model:activeIndex="loginForm.type">
                        <TabPanel :header="$t('label.account_login')">
                            <div>
                                <label for="username" class="block text-900 text-xl font-medium mb-2">{{ $t('label.account')
                                }}</label>
                                <InputText id="username" type="text" :placeholder="$t('label.account_placeholder')"
                                    class="w-full md:w-30rem mb-5" style="padding: 1rem" v-model="loginForm.username" />
                                <label for="userpwd" class="block text-900 font-medium text-xl mb-2">{{ $t('label.password')
                                }}</label>
                                <Password id="userpwd" v-model="loginForm.password"
                                    :placeholder="$t('label.pwd_placeholder')" :toggleMask="true" class="w-full mb-3"
                                    inputClass="w-full" :inputStyle="{ padding: '1rem' }" :feedback="false"></Password>

                                <div class="flex align-items-center justify-content-between mb-5 gap-5">
                                    <div class="flex align-items-center">
                                        <Checkbox v-model="loginForm.checked" id="rememberme1" binary class="mr-2">
                                        </Checkbox>
                                        <label for="rememberme1">{{ $t('label.remember') }}</label>
                                    </div>
                                    <a class="font-medium no-underline ml-2 text-right cursor-pointer" @click="showResetPwd"
                                        style="color: var(--primary-color)">{{ $t('label.forget_pwd') }}</a>
                                </div>
                                <Button :label="$t('label.sign_in')" @click="userSignIn"
                                    :disabled="!loginForm.username || !loginForm.password"
                                    class="w-full p-3 text-xl"></Button>
                            </div>
                        </TabPanel>
                        <TabPanel :header="$t('label.email_login')">
                            <div>
                                <label for="userEmail" class="block text-900 text-xl font-medium mb-2">{{ $t('label.email')
                                }}</label>
                                <AutoComplete id="userEmail" type="text" :placeholder="$t('label.email_placehodler')"
                                    @complete="emailComplete" :suggestions="emailItems" inputClass="w-full md:w-30rem mb-5"
                                    :inputStyle="{ padding: '1rem' }" v-model="loginForm.email" />

                                <label for="verifyCode" class="block text-900 font-medium text-xl mb-2">{{
                                    $t('label.verify_code') }}</label>
                                <div class="flex align-items-center justify-content-between mb-5 gap-5">
                                    <InputText id="verifyCode" :placeholder="$t('label.verify_placeholder')"
                                        v-model="loginForm.code" class=" mb-3" inputClass="w-full"
                                        :inputStyle="{ padding: '1rem' }"></InputText>
                                    <span v-if="state.countdown > 0">{{ $t('label.resend_tips', [state.countdown]) }}</span>
                                    <Button :label="$t('label.send_verify')" :disabled="state.countdown || !loginForm.email"
                                        @click="sendSignInCode"></Button>

                                </div>
                                <div class="flex align-items-center justify-content-between mb-5 gap-5">
                                    <div class="flex align-items-center">
                                        <Checkbox v-model="loginForm.checked" id="rememberme2" binary class="mr-2">
                                        </Checkbox>
                                        <label for="rememberme2">{{ $t('label.remember') }}</label>
                                    </div>
                                </div>
                                <Button :label="$t('label.sign_in')" @click="userSignIn"
                                    :disabled="!loginForm.email || !loginForm.code" class="w-full p-3 text-xl"></Button>
                            </div>
                        </TabPanel>
                    </TabView>
                </Dialog>
                <Dialog v-model:visible="displayFeeback" :header="$t('headers.feeback_info')" :modal="true"
                    :style="{ width: '100vw' }">
                    <div class="col-12 md:col-12">
                        <h5>{{ $t('label.feeback_email') }}</h5>
                        <AutoComplete :placeholder="$t('label.email_placehodler')" :suggestions="emailItems"
                            @complete="emailComplete" :inputStyle="{ width: '50vw' }" v-model="feebackInfo.email" />
                        <h5>{{ $t('label.feeback_title') }}</h5>
                        <InputText type="text" :style="{ width: '80vw' }" v-model="feebackInfo.title" />
                        <h5>{{ $t('label.feeback_content') }}</h5>
                        <Textarea :placeholder="$t('label.content_placehoder')" :autoResize="true" rows="4" cols="60"
                            :style="{ width: '80vw' }" v-model="feebackInfo.content" />
                    </div>
                    <template #footer>
                        <Button :label="$t('label.feeback_cancel')" icon="pi pi-times" class="p-button-text"
                            @click="cancelFeeback" />
                        <Button :label="$t('label.feeback_submit')" icon="pi pi-check" class="p-button-text"
                            @click="sendFeeback" />
                    </template>
                </Dialog>
                <Dialog v-model:visible="displayDir" :header="$t('headers.dir_info')" :modal="true"
                    :style="{ width: '100vw' }">
                    <Panel :header="$t('label.dir_header', [dirData.device])">
                        <Breadcrumb :model="dirBread">
                        </Breadcrumb>
                        <div class="flex flex-wrap p-0 sm:p-5 gap-5">
                            <div v-for="(file, index) of dirData.children" :key="file.id" @dblclick="onDirCilck(file)"
                                class="card m-0 px-6 flex flex-column border-1 surface-border align-items-center gap-3">
                                <div v-if="file.type == 0">
                                    <img role="presentation" :alt="file.name" :src="'images/icons/dir.png'" width="50"
                                        height="50" class="shadow-2" />
                                </div>
                                <div v-if="file.type == 1">
                                    <img role="presentation" :alt="file.name" :src="'images/icons/' + formatIcon(file.name)"
                                        width="50" height="50" class="shadow-2" />
                                </div>
                                <span class="font-semibold">{{ file.name }}</span>
                                <div v-if="file.type == 1">{{ formatSize(file.size) }}</div>
                            </div>
                        </div>
                    </Panel>
                </Dialog>
                <Dialog v-model:visible="displayShare" :header="$t('headers.share_info')" :style="{ width: '100vw' }">
                    <TabView>
                        <TabPanel :header="$t('common.local_share')">
                            <div class="formgroup-inline">
                                <span style="margin: 5px;">
                                    <FileUpload mode="basic" :auto="true" :chooseLabel="$t('label.select_file')"
                                        customUpload :multiple="true" @select="onSelectedFiles">
                                        <template #uploadicon>
                                        </template>
                                    </FileUpload>
                                </span>
                            </div>
                            <DataTable :value="files">
                                <Column field="name" :header="$t('common.name')">
                                    <template #body="{ data }">
                                        <img :src="'images/icons/' + formatIcon(data.name)" width="30" />
                                        <span style="margin-left: 0.5em; vertical-align: middle" class="image-text">{{
                                            data.name }}</span>
                                    </template>
                                </Column>
                                <Column field="size" :header="$t('common.size')">
                                    <template #body="{ data }">
                                        {{ formatSize(data.size) }}
                                    </template>
                                </Column>
                                <Column field="action" :header="$t('common.opt')">
                                    <template #body="{ data, index }">
                                        <Button icon="pi pi-trash" @click="onRemoveTemplatingFile(index)" text raised
                                            rounded aria-label="clear" v-tooltip="$t('common.clear')" />
                                    </template>
                                </Column>
                            </DataTable>
                        </TabPanel>
                        <TabPanel :header="$t('common.cloud_share')" v-if="userInfo">
                            <div class="formgroup-inline" v-show="!cloudShare.name">
                                <span style="margin: 5px;">
                                    <FileUpload mode="basic" :auto="true" :chooseLabel="$t('common.share_file')"
                                        customUpload @select="cloudeShareFile">
                                        <template #uploadicon>
                                        </template>
                                    </FileUpload>
                                </span>
                            </div>
                            <div class="col-12" v-show="cloudShare.name">
                                <div class="flex flex-column md:flex-row align-items-center p-3 w-full">
                                    <vue-qr v-if="cloudShare.qr" :logoSrc="'images/icons/logo.png'" :text="cloudShare.qr"
                                        :size="200"></vue-qr>
                                    <div class="flex-1 text-center md:text-left">
                                        <div class="font-bold text-xl">
                                            <label class="block text-900 text-xl font-medium mb-2">
                                                {{ $t('common.name') }} : {{ cloudShare.name }}
                                            </label>
                                        </div>
                                        <div class="mb-3" v-show="cloudShare.qr">
                                            <label class="block text-900 text-xl font-medium mb-2">
                                                {{ $t('label.share_url') }} : {{ cloudShare.qr }}
                                            </label>
                                        </div>
                                        <div class="mb-3" v-show="!cloudShare.code">
                                            <label class="block text-900 text-xl font-medium mb-2">
                                                {{ $t('label.share_code') }} : {{ cloudShare.code }}
                                            </label>
                                        </div>
                                        <div class="mb-3">
                                            <label class="block text-900 text-xl font-medium mb-2">
                                                {{ $t('common.size') }} : {{ formatSize(cloudShare.fileSize) }}
                                            </label>
                                        </div>
                                        <div v-show="!cloudShare.code" :style="{ width: '50vw' }">
                                            <ProgressBar :value="cloudShare.percent"></ProgressBar>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </TabPanel>
                    </TabView>
                </Dialog>
                <Dialog v-model:visible="displayFinder" :header="$t('headers.device_info')" :style="{ width: '100vw' }">
                    <div class="mb-3 font-bold text-2xl" style="text-align: center;">
                        <span class="text-800" style="text-align: center;">{{ $t('common.deviceCode') }} : {{ deviceCode
                        }}</span>
                        <Button icon="pi pi-refresh" @click="onRefreshCode" severity="danger" text rounded
                            v-tooltip.top="$t('tooltips.change_code')" />
                    </div>
                    <TabView>
                        <TabPanel :header="$t('label.my_device')" v-if="userInfo">
                            <DataView :value="myList" layout="list" :paginator="true" :rows="9">
                                <template #list="slotProps">
                                    <div class="col-12">
                                        <div class="flex flex-column md:flex-row align-items-center p-3 w-full">
                                            <img :src="'images/icons/' + slotProps.data.icon" :alt="slotProps.data.name"
                                                class="my-4 md:my-0 w-9 md:w-10rem shadow-2 mr-5" />
                                            <div class="flex-1 text-center md:text-left">
                                                <div class="font-bold text-2xl">{{ slotProps.data.name }}</div>
                                                <div class="mb-3">{{ slotProps.data.device }}</div>
                                                <span class="font-semibold" v-show="slotProps.data.online == 0">{{
                                                    $t('common.offline') }}</span>
                                                <span class="font-semibold" v-show="slotProps.data.online == 1">{{
                                                    $t('common.online') }}</span>
                                                <div class="flex align-items-center">
                                                    <span class="font-semibold" v-show="slotProps.data.status == 1">{{
                                                        slotProps.data.rtt }}</span>
                                                </div>
                                                <i class="pi pi-spin pi-spinner" v-show="slotProps.data.status == 2"
                                                    style="font-size: 1.5rem"></i>
                                                <i class="pi pi-video" @dblclick="onShowRemoteVideo(slotProps.data)"
                                                    v-tooltip.top="$t('tooltips.share_video')"
                                                    v-show="slotProps.data.status == 1 && slotProps.data.video == 1"
                                                    style="font-size: 1.5rem"></i>
                                                <i class="pi pi-desktop" @dblclick="onShowRemoteDesktop(slotProps.data)"
                                                    v-tooltip.top="$t('tooltips.share_screen')"
                                                    v-show="slotProps.data.status == 1 && slotProps.data.screen == 1"
                                                    style="font-size: 1.5rem"></i>
                                                <span class="pi pi-check-circle" v-show="slotProps.data.status == 1"
                                                    style="color: green">{{ $t('common.connected') }}</span>
                                                <Password v-show="slotProps.data.status == 3"
                                                    :placeholder="$t('label.auth_placeholder')"
                                                    v-model="slotProps.data.password" toggleMask :feedback="false" />
                                            </div>
                                            <div
                                                class="flex flex-row md:flex-column justify-content-between w-full md:w-auto align-items-center md:align-items-end mt-5 md:mt-0">
                                                <Button :label="$t('common.connect')" v-show="slotProps.data.status == 0"
                                                    text raised @click="onConnectClick(slotProps.data)"
                                                    :disabled="slotProps.data.online == 0"></Button>
                                                <Button :label="$t('common.dir')" v-show="slotProps.data.status == 1" text
                                                    raised @click="onOpenDirClick(slotProps.data)"></Button>
                                                <Button :label="$t('common.auth')" v-show="slotProps.data.status == 3" text
                                                    raised @click="onAuthClick(slotProps.data)"
                                                    :disabled="slotProps.data.online == 0"></Button>
                                                <Button :label="$t('common.disconnect')" v-show="slotProps.data.status == 1"
                                                    text raised @click="onDisconnectClick(slotProps.data)"></Button>
                                                <FileUpload mode="basic" v-show="slotProps.data.status == 1" :auto="true"
                                                    customUpload :chooseLabel="$t('common.send')"
                                                    @select="onSendFile($event, slotProps.data)">
                                                    <template #uploadicon>
                                                        <div></div>
                                                    </template>
                                                </FileUpload>
                                            </div>
                                        </div>
                                        <DataTable :value="slotProps.data.files"
                                            v-show="slotProps.data.status == 1 && slotProps.data.files.length > 0">
                                            <Column field="name" :header="$t('common.name')">
                                                <template #body="{ data }">
                                                    <img :src="'images/icons/' + data.format + '.png'" :alt="data.format"
                                                        width="30" v-tooltip.top="data.format" />
                                                    {{ data.name }}
                                                </template>
                                            </Column>
                                            <Column field="size" :header="$t('common.size')">
                                                <template #body="{ data }">
                                                    {{ formatSize(data.size) }}
                                                </template>
                                            </Column>
                                            <Column field="action" :header="$t('common.opt')">
                                                <template #body="{ data }">
                                                    <Button icon="pi pi-cloud-download" text raised rounded
                                                        aria-label="download" v-show="data.status == 0"
                                                        v-tooltip="$t('tooltips.download')"
                                                        @click="onFileDownload(slotProps.data.id, data)" />
                                                    <i class="pi pi-spin pi-spinner" v-show="data.status == 1"
                                                        style="font-size: 1.5rem"></i>
                                                </template>
                                            </Column>
                                        </DataTable>
                                    </div>
                                </template>
                            </DataView>
                        </TabPanel>
                        <TabPanel :header="$t('label.local_device')">
                            <DataView :value="localList" layout="list" :paginator="true" :rows="9">
                                <template #list="slotProps">
                                    <div class="col-12">
                                        <div class="flex flex-column md:flex-row align-items-center p-3 w-full">
                                            <img :src="'images/icons/' + slotProps.data.icon" :alt="slotProps.data.name"
                                                class="my-4 md:my-0 w-9 md:w-10rem shadow-2 mr-5" />
                                            <div class="flex-1 text-center md:text-left">
                                                <div class="font-bold text-2xl">{{ slotProps.data.name }}</div>
                                                <div class="mb-3">{{ slotProps.data.device }}</div>
                                                <span class="font-semibold" v-show="slotProps.data.online == 0">{{
                                                    $t('common.offline') }}</span>
                                                <span class="font-semibold" v-show="slotProps.data.online == 1">{{
                                                    $t('common.online') }}</span>
                                                <div class="flex align-items-center">
                                                    <span class="font-semibold" v-show="slotProps.data.status == 1">{{
                                                        slotProps.data.rtt }}</span>
                                                </div>
                                                <i class="pi pi-spin pi-spinner" v-show="slotProps.data.status == 2"
                                                    style="font-size: 1.5rem"></i>
                                                <i class="pi pi-video" @dblclick="onShowRemoteVideo(slotProps.data)"
                                                    v-tooltip.top="$t('tooltips.share_video')"
                                                    v-show="slotProps.data.status == 1 && slotProps.data.video == 1"
                                                    style="font-size: 1.5rem"></i>
                                                <i class="pi pi-desktop" @dblclick="onShowRemoteDesktop(slotProps.data)"
                                                    v-tooltip.top="$t('tooltips.share_screen')"
                                                    v-show="slotProps.data.status == 1 && slotProps.data.screen == 1"
                                                    style="font-size: 1.5rem"></i>
                                                <span class="pi pi-check-circle" v-show="slotProps.data.status == 1"
                                                    style="color: green">{{ $t('common.connected') }}</span>
                                                <Password v-show="slotProps.data.status == 3"
                                                    :placeholder="$t('label.auth_placeholder')"
                                                    v-model="slotProps.data.password" toggleMask :feedback="false" />
                                            </div>
                                            <div
                                                class="flex flex-row md:flex-column justify-content-between w-full md:w-auto align-items-center md:align-items-end mt-5 md:mt-0">
                                                <Button :label="$t('common.connect')" v-show="slotProps.data.status == 0"
                                                    text raised @click="onConnectClick(slotProps.data)"
                                                    :disabled="slotProps.data.online == 0"></Button>
                                                <Button :label="$t('common.dir')" v-show="slotProps.data.status == 1" text
                                                    raised @click="onOpenDirClick(slotProps.data)"></Button>
                                                <Button :label="$t('common.auth')" v-show="slotProps.data.status == 3" text
                                                    raised @click="onAuthClick(slotProps.data)"
                                                    :disabled="slotProps.data.online == 0"></Button>
                                                <Button :label="$t('common.disconnect')" v-show="slotProps.data.status == 1"
                                                    text raised @click="onDisconnectClick(slotProps.data)"></Button>
                                                <FileUpload mode="basic" v-show="slotProps.data.status == 1" :auto="true"
                                                    customUpload :chooseLabel="$t('common.send')"
                                                    @select="onSendFile($event, slotProps.data)">
                                                    <template #uploadicon>
                                                        <div></div>
                                                    </template>
                                                </FileUpload>
                                            </div>
                                        </div>
                                        <DataTable :value="slotProps.data.files"
                                            v-show="slotProps.data.status == 1 && slotProps.data.files.length > 0">
                                            <Column field="name" :header="$t('common.name')">
                                                <template #body="{ data }">
                                                    <img :src="'images/icons/' + data.format + '.png'" :alt="data.format"
                                                        width="30" v-tooltip.top="data.format" />
                                                    {{ data.name }}
                                                </template>
                                            </Column>
                                            <Column field="size" :header="$t('common.size')">
                                                <template #body="{ data }">
                                                    {{ formatSize(data.size) }}
                                                </template>
                                            </Column>
                                            <Column field="action" :header="$t('common.opt')">
                                                <template #body="{ data }">
                                                    <Button icon="pi pi-cloud-download" text raised rounded
                                                        aria-label="download" v-show="data.status == 0"
                                                        v-tooltip="$t('tooltips.download')"
                                                        @click="onFileDownload(slotProps.data.id, data)" />
                                                    <i class="pi pi-spin pi-spinner" v-show="data.status == 1"
                                                        style="font-size: 1.5rem"></i>
                                                </template>
                                            </Column>
                                        </DataTable>
                                    </div>
                                </template>
                            </DataView>
                        </TabPanel>
                        <TabPanel :header="$t('label.subscribe_device')">
                            <DataView :value="deviceList" layout="list" :paginator="true" :rows="9">
                                <template #header>
                                    <div class="grid grid-nogutter">
                                        <div class="formgroup-inline">
                                            <span class="p-float-label">
                                                <InputMask id="deviceId" v-model="inputCode" mask="* * * * * *" :unmask=true
                                                    style="width:150px" :autoClear="false" />
                                                <label for="deviceId">{{ $t('label.code_placeholder') }}</label>
                                            </span>
                                            <span style="margin-left: 10px;">
                                                <Button :label="$t('common.add')" @click="onAddDeviceClick" text raised />
                                            </span>
                                        </div>
                                    </div>
                                </template>
                                <template #list="slotProps">
                                    <div class="col-12">
                                        <div class="flex flex-column md:flex-row align-items-center p-3 w-full">
                                            <img :src="'images/icons/' + slotProps.data.icon" :alt="slotProps.data.name"
                                                class="my-4 md:my-0 w-9 md:w-10rem shadow-2 mr-5" />
                                            <div class="flex-1 text-center md:text-left">
                                                <div class="font-bold text-2xl">{{ slotProps.data.name }}</div>
                                                <div class="mb-3">{{ slotProps.data.device }}</div>
                                                <span class="font-semibold" v-show="slotProps.data.online == 0">{{
                                                    $t('common.offline') }}</span>
                                                <span class="font-semibold" v-show="slotProps.data.online == 1">{{
                                                    $t('common.online') }}</span>
                                                <div class="flex align-items-center">
                                                    <span class="font-semibold" v-show="slotProps.data.status == 1">{{
                                                        slotProps.data.rtt }}</span>
                                                </div>
                                                <i class="pi pi-spin pi-spinner" v-show="slotProps.data.status == 2"
                                                    style="font-size: 1.5rem"></i>
                                                <i class="pi pi-video" @dblclick="onShowRemoteVideo(slotProps.data)"
                                                    v-tooltip.top="$t('tooltips.share_video')"
                                                    v-show="slotProps.data.status == 1 && slotProps.data.video == 1"
                                                    style="font-size: 1.5rem"></i>
                                                <i class="pi pi-desktop" @dblclick="onShowRemoteDesktop(slotProps.data)"
                                                    v-tooltip.top="$t('tooltips.share_screen')"
                                                    v-show="slotProps.data.status == 1 && slotProps.data.screen == 1"
                                                    style="font-size: 1.5rem"></i>
                                                <span class="pi pi-check-circle" v-show="slotProps.data.status == 1"
                                                    style="color: green">{{ $t('common.disconnect') }}</span>
                                                <form>
                                                    <Password v-show="slotProps.data.status == 3"
                                                        :placeholder="$t('label.auth_placeholder')"
                                                        v-model="slotProps.data.password" toggleMask :feedback="false" />
                                                </form>
                                            </div>

                                            <div
                                                class="flex flex-row md:flex-column justify-content-between w-full md:w-auto align-items-center md:align-items-end mt-5 md:mt-0">
                                                <Button :label="$t('common.connect')" v-show="slotProps.data.status == 0"
                                                    text raised @click="onConnectClick(slotProps.data)"
                                                    :disabled="slotProps.data.online == 0"></Button>
                                                <Button :label="$t('common.dir')" v-show="slotProps.data.status == 1" text
                                                    raised @click="onOpenDirClick(slotProps.data)"></Button>
                                                <Button :label="$t('common.auth')" v-show="slotProps.data.status == 3" text
                                                    raised @click="onAuthClick(slotProps.data)"
                                                    :disabled="slotProps.data.online == 0"></Button>
                                                <Button :label="$t('common.disconnect')" v-show="slotProps.data.status == 1"
                                                    text raised @click="onDisconnectClick(slotProps.data)"></Button>
                                                <Button :label="$t('common.remove')" text raised
                                                    v-show="slotProps.data.status == 0"
                                                    @click="onDeleteDeviceClick(slotProps.data)"></Button>
                                                <FileUpload mode="basic" v-show="slotProps.data.status == 1" :auto="true"
                                                    customUpload :chooseLabel="$t('common.send')"
                                                    @select="onSendFile($event, slotProps.data)">
                                                    <template #uploadicon>
                                                        <div></div>
                                                    </template>
                                                </FileUpload>
                                            </div>
                                        </div>
                                        <DataTable :value="slotProps.data.files"
                                            v-show="slotProps.data.status == 1 && slotProps.data.files.length > 0">
                                            <Column field="name" header="$t('common.name')">
                                                <template #body="{ data }">
                                                    <img :src="'images/icons/' + data.format + '.png'" :alt="data.format"
                                                        width="30" v-tooltip.top="data.format" />
                                                    <span style="margin-left: 0.5em; vertical-align: middle"
                                                        class="image-text">{{ data.name }}</span>
                                                </template>
                                            </Column>
                                            <Column field="size" :header="$t('common.size')">
                                                <template #body="{ data }">
                                                    {{ formatSize(data.size) }}
                                                </template>
                                            </Column>
                                            <Column field="action" :header="$t('common.opt')">
                                                <template #body="{ data }">
                                                    <Button icon="pi pi-cloud-download" text raised rounded
                                                        aria-label="download" v-show="data.status == 0"
                                                        v-tooltip="$t('tooltips.download')"
                                                        @click="onFileDownload(slotProps.data.id, data)" />
                                                    <i class="pi pi-spin pi-spinner" v-show="data.status == 1"
                                                        style="font-size: 1.5rem"></i>
                                                </template>
                                            </Column>
                                        </DataTable>
                                    </div>
                                </template>
                            </DataView>
                        </TabPanel>
                    </TabView>
                </Dialog>
                <Dialog v-model:visible="displayDownload" :header="$t('headers.transfer_info')" :style="{ width: '100vw' }">
                    <TabView>
                        <TabPanel :header="$t('headers.download_info')">
                            <DataView :value="downloadFiles" layout="list" :paginator="true" :rows="9">
                                <template #list="slotProps">
                                    <div class="col-12">
                                        <div class="flex flex-column md:flex-row align-items-center p-3 w-full">
                                            <img :src="'images/icons/' + slotProps.data.format + '.png'"
                                                :alt="slotProps.data.name"
                                                class="my-4 md:my-0 w-9 md:w-10rem shadow-2 mr-5" />
                                            <div class="flex-1 text-center md:text-left">
                                                <div class="font-bold text-xl">{{ $t('common.device') }}：{{
                                                    slotProps.data.device }}</div>
                                                <div class="mb-3"></div>
                                                <div class="mb-3">{{ $t('common.name') }}：{{ slotProps.data.name }}</div>
                                                <div class="mb-3">{{ $t('common.size') }}：{{ formatSize(slotProps.data.size)
                                                }} </div>
                                                <div :style="{ width: '50vw' }">
                                                    <ProgressBar :value="calculateProgress(slotProps.data)"></ProgressBar>
                                                </div>
                                            </div>
                                            <div
                                                class="flex flex-row md:flex-column justify-content-between w-full md:w-auto align-items-center md:align-items-end mt-5 md:mt-0">
                                                <Button icon="pi pi-stop-circle" text raised rounded aria-label="stop"
                                                    v-tooltip="$t('common.pause')"
                                                    v-show="slotProps.data.status == 1 || slotProps.data.status == 0"
                                                    @click="onStopDownload(slotProps.data)" />
                                                <Button icon="pi pi-replay" text raised rounded aria-label="resume"
                                                    v-tooltip="$t('common.resume')" v-show="slotProps.data.status == 3"
                                                    @click="onResumeDownload(slotProps.data)" />
                                                <Button icon="pi pi-trash" @click="onClearDownloadRecord(slotProps.data)"
                                                    text raised rounded aria-label="clear" v-tooltip="$t('common.clear')"
                                                    v-show="slotProps.data.status == 2 || slotProps.data.status == 3" />
                                            </div>
                                        </div>
                                    </div>
                                </template>
                            </DataView>
                        </TabPanel>
                        <TabPanel :header="$t('headers.upload_info')">
                            <DataView :value="uploadFiles" layout="list" :paginator="true" :rows="9">
                                <template #list="slotProps">
                                    <div class="col-12">
                                        <div class="flex flex-column md:flex-row align-items-center p-3 w-full">
                                            <img :src="'images/icons/' + slotProps.data.format + '.png'"
                                                :alt="slotProps.data.name"
                                                class="my-4 md:my-0 w-9 md:w-10rem shadow-2 mr-5" />
                                            <div class="flex-1 text-center md:text-left">
                                                <div class="font-bold text-xl">{{ $t('common.device') }}：{{
                                                    slotProps.data.device }}</div>
                                                <div class="mb-3"></div>
                                                <div class="mb-3">{{ $t('common.name') }}：{{ slotProps.data.name }}</div>
                                                <div class="mb-3">{{ $t('common.size') }}：{{ formatSize(slotProps.data.size)
                                                }} </div>
                                                <div :style="{ width: '50vw' }">
                                                    <ProgressBar :value="calculateProgress(slotProps.data)"></ProgressBar>
                                                </div>
                                            </div>
                                            <div
                                                class="flex flex-row md:flex-column justify-content-between w-full md:w-auto align-items-center md:align-items-end mt-5 md:mt-0">
                                                <Button icon="pi pi-trash"
                                                    @click="onClearUploadRecord(slotProps.data, index)" text raised rounded
                                                    aria-label="clear" v-tooltip="$t('common.clear')"
                                                    v-show="slotProps.data.status == 1 || slotProps.data.status == 0 || slotProps.data.status == -1" />
                                            </div>
                                        </div>
                                    </div>
                                </template>
                            </DataView>
                        </TabPanel>
                    </TabView>
                </Dialog>
                <Dialog v-model:visible="displaySetting" :header="$t('headers.setting_info')" :style="{ width: '100vw' }">
                    <h5>{{ $t('label.connect_auth') }}</h5>
                    <div class="grid">
                        <div class="field col">
                            <InputSwitch id="openAuth" @change="changeSetting" v-model="userSetting.requirePwd"
                                v-tooltip.right="$t('tooltips.auth_desc')" />
                        </div>
                        <div class="field col" v-show="userSetting.requirePwd">
                            <label for="authPwd">{{ $t('label.auth_pwd') }}：</label>
                            <Password id="authPwd" v-model="userSetting.password" @update:modelValue="changeSetting"
                                :placeholder="$t('label.pwd_placeholder')" toggleMask :feedback="false" />
                        </div>
                    </div>
                    <h5>{{ $t('label.receiver_confirm') }}</h5>
                    <div class="grid">
                        <div class="col-12 md:col-4">
                            <div class="field-radiobutton mb-0">
                                <RadioButton id="option1" @change="changeSetting" name="option" value="0"
                                    v-model="userSetting.automated" />
                                <label for="option1" v-tooltip.right="$t('tooltips.manual_confirm_desc')">{{
                                    $t('label.manual_confirm') }}</label>
                            </div>
                        </div>
                        <div class="col-12 md:col-4">
                            <div class="field-radiobutton mb-0">
                                <RadioButton id="option2" @change="changeSetting" name="option" value="1"
                                    v-model="userSetting.automated" />
                                <label for="option2" v-tooltip.right="$t('tooltips.auto_confirm_desc')">{{
                                    $t('label.auto_confirm') }}</label>
                            </div>
                        </div>
                        <div class="col-12 md:col-4">
                            <div class="field-radiobutton mb-0">
                                <RadioButton id="option3" @change="changeSetting" name="option" value="2"
                                    v-model="userSetting.automated" />
                                <label for="option3" v-tooltip.right="$t('tooltips.auto_reject_desc')">{{
                                    $t('label.auto_reject') }}</label>
                            </div>
                        </div>
                    </div>
                    <h5>{{ $t('label.split_record') }}</h5>
                    <div class="grid">
                        <div class="col-12 md:col-4">
                            <div class="field-radiobutton mb-0">
                                <RadioButton id="rec_0" @change="changeSetting" name="option" :value="0"
                                    v-model="userSetting.splitRecord" />
                                <label for="rec_o" v-tooltip.right="$t('tooltips.no_limit')">{{ $t('label.no_limit')
                                }}</label>
                            </div>
                        </div>
                        <div class="col-12 md:col-4">
                            <div class="field-radiobutton mb-0">
                                <RadioButton id="rec_1" @change="changeSetting" name="option" :value="5"
                                    v-model="userSetting.splitRecord" />
                                <label for="rec_1" v-tooltip.right="$t('tooltips.record_split_option', [5])">{{
                                    $t('label.record_split_option', [5]) }}</label>
                            </div>
                        </div>
                        <div class="col-12 md:col-4">
                            <div class="field-radiobutton mb-0">
                                <RadioButton id="rec_2" @change="changeSetting" name="option" :value="10"
                                    v-model="userSetting.splitRecord" />
                                <label for="rec_2" v-tooltip.right="$t('tooltips.record_split_option', [10])">{{
                                    $t('label.record_split_option', [10]) }}</label>
                            </div>
                        </div>
                    </div>
                    <h5>{{ $t('label.lang') }}</h5>
                    <div class="grid">
                        <div class="col-12 md:col-4">
                            <div class="field-radiobutton mb-0">
                                <RadioButton id="lang_zh" @change="changeSetting" name="option" value="zh-cn"
                                    v-model="userSetting.lang" />
                                <label for="lang_zh" v-tooltip.right="$t('label.zh_cn')">{{ $t('label.zh_cn') }}</label>
                            </div>
                        </div>
                        <div class="col-12 md:col-4">
                            <div class="field-radiobutton mb-0">
                                <RadioButton id="lang_en" @change="changeSetting" name="option" value="en-us"
                                    v-model="userSetting.lang" />
                                <label for="lang_en" v-tooltip.right="$t('label.en_us')">{{ $t('label.en_us') }}</label>
                            </div>
                        </div>
                    </div>
                </Dialog>
            </div>
        </div>
    </div>
</template>
<script setup>
import { ref, onBeforeMount, onMounted, onBeforeUnmount, reactive } from 'vue';
import { useShepherd } from 'vue-shepherd'
import { useConfirm } from "primevue/useconfirm";
import { Md5 } from 'ts-md5';
import { useToast } from 'primevue/usetoast';
import DeviceService from '@/service/DeviceService';
import MessageService from '@/service/MessageService'
import FileService from '@/service/FileService';
import CacheService from '@/utils/cache.js';
import streamSaver from 'streamsaver';
import { useI18n } from 'vue-i18n';
import serverSocket from '@/utils/socket';
import router from '@/router';
import vueQr from 'vue-qr/src/packages/vue-qr.vue';
import V3Emoji from 'vue3-emoji';
import 'vue3-emoji/dist/style.css';
import AES from "@/utils/AES.js";
import * as qiniu from 'qiniu-js';
const i18n = useI18n();
const { locale } = useI18n();
streamSaver.mitm = process.env.VITE_STEAMSAVE_URL;
const streamWriterMap = ref(new Map());
const taskMap = ref(new Map());
const dirMap = ref(new Map());
const dirData = ref({});
const dirBread = ref([]);
const downloadFiles = ref([]);
const uploadFiles = ref([]);
const uploadTasks = ref(new Map());
const files = ref([]);
const sendFiles = ref(new Map());
const sendConfirm = ref(new Map());
const deviceList = ref([]);
const localList = ref([]);
const myList = ref([]);
const codeMap = ref(new Map());
const peerMap = ref(new Map());
const channelMap = ref(new Map());
const fileChannelMap = ref(new Map());
const deviceService = new DeviceService();
const messageService = new MessageService();
const fileService = new FileService();
const desktopStream = ref();
const userStream = ref();
const deviceCode = ref(CacheService.code.get());
const inputCode = ref('');
const displayFinder = ref(false);
const displayShare = ref(false);
const displayDownload = ref(false);
const displaySetting = ref(false);
const displayDir = ref(false);
const displayDesktop = ref(false);
const displayVideo = ref(false);
const displayRemoteDesktop = ref(false);
const displayRemoteVideo = ref(false);
const displayFeeback = ref(false);
const displaySignIn = ref(false);
const displayUserInfo = ref(false);
const displayReset = ref(false);
const displaySignUp = ref(false);
const displayAbout = ref(false);
const displayTorrentVideo = ref(false);
const displayTorrent = ref(false);
const displayComment = ref(false);
const magnetUri = ref();
const unreadComment = ref(0);
const commentBadge = ref();
const commentValue = ref('');
const videoDefalut = ref(true);
const userSetting = ref({ requirePwd: false, automated: '0', password: '', lang: 'zh-cn', splitRecord: 0, trackerServer: 0 });
const customTracker = ref('https://cdn.jsdelivr.net/gh/ngosang/trackerslist@master/trackers_all_ws.txt');
const toast = useToast();
const confirm = useConfirm();
const remoteDesktopCode = ref('');
const remoteVideoCode = ref('');
const remoteVideoTrack = ref(new Map());
const remoteDesktopTrack = ref(new Map());
const feebackInfo = ref({ email: '', title: '', content: '' });
const peerConfig = ref();
const installApp = ref(false);
const userInfo = ref();
const videoMute = ref(false);
const screenMute = ref(false);
const screenRecord = ref(false);
const screenRemoteRecord = ref(false);
const videoRemoteRecord = ref(false);
const displayCreateRoom = ref(false);
const mediaRecorder = ref(new Map());
const editUser = ref(false);
const editInfo = ref({ nickname: '' });
const usercomments = ref([]);
const commentMore = ref(false);
const torrentMap = ref(new Map());
const torrentList = ref([]);
const torrentTask = ref([]);
const roomInfo = ref({ name: '', code: '', password: '', users: 0, qr: '', auth: false });
const cloudShare = ref({});
const tour = useShepherd({
    useModalOverlay: true
});
const aiworking = ref(false)
const aiChats = ref([])
const displayAiChat = ref(false)
const unreadChat = ref()
const unreadChatCount = ref(0)
const chatMap = ref(new Map());
const displayChatInput = ref(false);
const colseChat = () => {
    displayChatInput.value = false;
}
const showChatInput = () => {
    displayChatInput.value = true;
    unreadChat.value = null;
    unreadChatCount.value = 0;
    displayAiChat.value = false;
}
const showAiChat = () => {
    displayAiChat.value = true;
    displayChatInput.value = false;
}
const colseAiChat = () => {
    displayAiChat.value = false;
}
const client = new WebTorrent();
const chatValue = ref('');
const aiChatValue = ref('')
const submitChat = (code) => {
    if (chatValue.value) {
        let userchats = chatMap.value.get(code)
        if (!userchats) {
            userchats = []
            chatMap.value.set(code, userchats)
        }
        const timestamp = new Date().getTime();
        const nickname = userInfo.value ? userInfo.value.nickname : deviceCode.value
        const chat = { comment: chatValue.value, createTime: timestamp, code: deviceCode.value, nickename: nickname, id: timestamp }
        const content = AES.encrypt(JSON.stringify(chat), transferCode(serverSocket.deviceId, serverSocket.channel));
        const message = messageService.createChatChannelMessage(1, content);
        let channel = channelMap.value.get(code)
        if (channel && channel.readyState == 'open') {
            channel.send(message);
            userchats.push(chat)
        } else {
            toast.add({ severity: 'error', summary: i18n.t("message.send_chat_fail"), group: 'tc', life: 3000 });
        }
    }
    chatValue.value = '';
}
const submitAiChat = () => {
    if (aiworking.value) {
        toast.add({ severity: 'warn', summary: i18n.t("message.send_limit_warn"), group: 'tc', life: 3000 });
        return;
    }
    if (aiChatValue.value) {
        const msg = messageService.ceateChatMessage(aiChatValue.value);
        const aichat = { type: 0, comment: aiChatValue.value }
        aiChats.value.push(aichat)
        const apres = reactive({ type: 1 });
        aiChats.value.push(apres)
        aiworking.value = true;
        deviceService.streamMessage( 
            msg,
            data => { 
                if(data=='[DONE]')
                    return 
                const content = JSON.parse(data).choices[0].delta.content
                if(content){
                    if(apres.comment){
                        apres.comment += content
                    }else{
                        apres.comment = content
                    }
                }
            },
            ()=>{
                aiworking.value = false;
            }
        ) 
    }
    aiChatValue.value = '';
}
const transferCode = (userId, channel) => {
    let md5 = new Md5();
    md5.appendAsciiStr(userId + ":" + channel);
    return md5.end();
}

const cloudeShareFile = (event) => {
    uploadFile(event.files[0])
}

const uploadFile = (file) => {
    deviceService.getFileToken(encodeURIComponent(file.name)).then(data => {
        if (data.token) {
            cloudShare.value = {
                name: file.name,
                fileSize: file.size,
                percent: 0
            }
            const observable = qiniu.upload(file, data.key, data.token)
            const subscription = observable.subscribe({
                next(res) {
                    cloudShare.value.percent = res.total.percent
                },
                error(err) {
                    console.log(err)
                    toast.add({ severity: 'error', summary: i18n.t("message.upload_fail"), group: 'tc', life: 3000 });
                    cloudShare.value = {}
                },
                complete(res) {
                    deviceService.fileShare(JSON.stringify({
                        device: deviceCode.value,
                        fileName: file.name,
                        fullPath: process.env.VITE_FILE_DOMAIN_URL + data.key,
                        fileSize: file.size
                    })).then(share => {
                        cloudShare.value = {
                            qr: process.env.VITE_SHARE_URL + "?code=" + share.code,
                            name: share.fileName,
                            fileSize: share.fileSize,
                            code: share.code,
                            percent: 100
                        }
                        CacheService.sharefile.remember(JSON.stringify(cloudShare.value), new Date(new Date().getTime() + 24 * 60 * 60 * 1000))
                    });
                }
            })
        } else {
            toast.add({ severity: 'error', summary: i18n.t("message.token_fail"), group: 'tc', life: 3000 });
        }
    });
}
const onDeleteTorrentClick = (data) => {
    for (let i = 0; i < torrentList.value.length; i++) {
        if (torrentList.value[i].id == data.id) {
            torrentList.value.splice(i, 1);
            break
        }
    }
    const torrent = torrentMap.value.get(data.id)
    if (torrent) {
        torrentMap.value.delete(data.id);
        client.remove(torrent.infoHash, err => {
            console.log(err);
        });
    }


}
const createRoom = () => {
    if (roomInfo.value.name) {
        if (roomInfo.value.auth) {
            serverSocket.send(messageService.createCustomMessage(1, null, null, 'create', JSON.stringify({
                name: roomInfo.value.name,
                password: roomInfo.value.password
            })))
        } else {
            serverSocket.send(messageService.createCustomMessage(1, null, null, 'create', JSON.stringify({
                name: roomInfo.value.name
            })))
        }

    }
}
const closeRoom = () => {
    if (roomInfo.value.code) {
        serverSocket.send(messageService.createCustomMessage(1, null, null, 'close', JSON.stringify({
            code: roomInfo.value.code
        })))
        CacheService.myroom.remove();
        roomInfo.value = { name: '', code: '', password: '', auth: false }
    }
}
const openRoom = () => {
    if (roomInfo.value.code) {
        router.push({ path: '/room', query: { code: roomInfo.value.code } });
    }
}

const checkVideoType = (data) => {
    if (data.format.indexOf('video') > -1) {
        return true;
    }
    return false;
}
const onVideoPlay = async (id, data) => {
    const torrent = torrentMap.value.get(id);
    const file = torrent.files.find(file => file.path == data.id);
    if (file) {
        displayTorrentVideo.value = true;
        file.streamTo(torrentVideo)
        displayTorrent.value = false;
    }
}
const closeTorrentVideo = () => {
    displayTorrentVideo.value = false;
    torrentVideo.pause();
    torrentVideo.src = null;
}
const onTorrentDownload = (id, data) => {
    if (torrentTask.value.indexOf(id + data.id) > -1) {
        toast.add({ severity: 'error', summary: i18n.t("message.download_exit_err"), group: 'tc', life: 3000 });
        return
    }
    const torrent = torrentMap.value.get(id);
    const file = torrent.files.find(file => file.path == data.id);
    if (file) {
        torrentTask.value.push(id + data.id);
        const fileStream = streamSaver.createWriteStream(file.name, { size: file.size });
        let writer = fileStream.getWriter();
        streamWriterMap.value.set(id + data.id, writer);
        let stream = file.createReadStream();
        stream.on('data', buffer => {
            writer.write(buffer).catch((err) => {
                stream.cancel(err)
                streamWriterMap.value.delete(id + data.id);
            });
        }).on('end', () => {
            writer.close();
            streamWriterMap.value.delete(id + data.id);
            for (let i = 0; i < torrentTask.value.length; i++) {
                if (torrentTask.value[i] == (id + data.id)) {
                    torrentTask.value.splice(i, 1);
                    break
                }
            }
        })
    }
}
const openTorrent = (event) => {
    const torrentFile = event.files[0];
    let md5 = new Md5();
    md5.appendAsciiStr(torrentFile.name + ":" + torrentFile.size);
    let key = md5.end();
    for (let torrentInfo of torrentList.value.values()) {
        if (torrentInfo.id == key) {
            toast.add({ severity: 'error', summary: i18n.t("message.torrent_exist_error"), group: 'tc', life: 3000 });
            return
        }
    }
    torrentList.value.push({ id: key, name: '', files: [], totalSize: 0 });
    client.add(torrentFile, torrent => {
        torrentMap.value.set(key, torrent);
        for (let torrentInfo of torrentList.value.values()) {
            if (torrentInfo.id == key) {
                torrentInfo.name = torrent.name;
                torrentInfo.totalSize = torrent.length;
                for (const file of torrent.files) {
                    torrentInfo.files.push({ name: file.name, id: file.path, size: file.length, format: fileService.readFileFormat(file.name) });
                }
                return
            }
        }
    })
}
const transferMagnetUri = (uri) => {
    if ((uri.startsWith('magnet:?xt=urn:btih:') || uri.startsWith('magnet:?xt=urn:btmh:')) && uri.indexOf("&xs=") == -1) {
        const end = uri.indexOf('&');
        let toId = null;
        if (end > -1) {
            toId = uri.substring(20, end);
        } else {
            toId = uri.substring(20);
        }
        serverSocket.send(messageService.createCustomMessage(0, toId, toId));
        return true;
    }
    return false;
}
const onLoadTorrent = () => {
    if (magnetUri.value && checkMagnetUri(magnetUri.value)) {
        const url = magnetUri.value;
        for (let torrentInfo of torrentList.value.values()) {
            if (torrentInfo.id == url) {
                toast.add({ severity: 'error', summary: i18n.t("message.magneturi_error"), group: 'tc', life: 3000 });
                return
            }
        }

        torrentList.value.push({ id: transferId(url), name: '', files: [], totalSize: 0 });
        if (transferMagnetUri(url)) {
            return;
        }
        client.add(url, torrent => {
            torrentMap.value.set(url, torrent);
            for (let torrentInfo of torrentList.value.values()) {
                if (torrentInfo.id == transferId(url)) {
                    torrentInfo.name = torrent.name;
                    torrentInfo.totalSize = torrent.length;
                    for (const file of torrent.files) {
                        torrentInfo.files.push({ name: file.name, id: file.path, size: file.length, format: fileService.readFileFormat(file.name) });
                    }
                    return
                }
            }
        })

        magnetUri.value = '';
    } else {
        toast.add({ severity: 'error', summary: i18n.t("message.magneturi_error"), group: 'tc', life: 3000 });
    }
}
const checkMagnetUri = (uri) => {
    let magnetReg = /^(magnet:\?xt=urn:(btih|btmh):)[0-9a-fA-F]{40}.*$/;
    return magnetReg.test(uri) || checkUri(uri);
}
const checkUri = (uri) => {
    let httpReg = /http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/;
    return httpReg.test(uri);
}
const transferId = (uri) => {
    if (checkUri(uri)) {
        return uri;
    }
    const end = uri.indexOf('&');
    let id = null;
    if (end > -1) {
        id = uri.substring(20, end);
    } else {
        id = uri.substring(20);
    }
    return id;
}
const formatTimestamp = (timestamp) => {
    if (timestamp) {
        let date = new Date(timestamp);
        let year = date.getFullYear();
        let month = (date.getMonth() + 1).toString().padStart(2, '0');
        let day = date.getDate().toString().padStart(2, '0');
        let hour = date.getHours().toString().padStart(2, '0');
        let minute = date.getMinutes().toString().padStart(2, '0');
        let second = date.getSeconds().toString().padStart(2, '0');
        const formattedDate = `${year}-${month}-${day} ${hour}:${minute}:${second}`;
        return formattedDate;
    }
    return '';
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
const showUserComment = () => {
    displayComment.value = true;
    unreadComment.value = 0;
    commentBadge.value = null;
}
const showMoreComment = () => {
    let lastId = usercomments.value[0].id
    deviceService.showComment(JSON.stringify({ lastId: lastId, rows: 10 })).then(data => {
        if (data.code == 200) {
            let history = data.data;
            if (history) {
                history.forEach(comment => {
                    usercomments.value.unshift(comment)
                })
                if (history.length < 10) {
                    commentMore.value = false;
                }
            } else {
                commentMore.value = false;
            }
        }
    });
}
const submitComment = () => {
    if (commentValue.value.length <= 1000) {
        deviceService.userComment(JSON.stringify({ content: commentValue.value, code: deviceCode.value })).then(data => {
            if (data.code == 200) {
                let index = 0
                if (usercomments.value.length) {
                    if (data.data.id > usercomments.value[usercomments.value.length - 1].id) {
                        usercomments.value.push(data.data)
                    }
                } else {
                    usercomments.value.push(data.data)
                }

                commentValue.value = null;
            } else {
                toast.add({ severity: 'error', summary: i18n.t("message.user_comment_error"), group: 'tc', life: 3000 });
            }
        })
    } else {
        toast.add({ severity: 'error', summary: i18n.t("message.comment_lenght_error"), group: 'tc', life: 3000 });
    }
}
const startEditUser = () => {
    editUser.value = true;
    editInfo.value = { nickname: userInfo.value.nickname }
}
const saveEditUser = () => {
    editUser.value = false;
    if (editInfo.value.nickname != userInfo.value.nickname) {
        deviceService.updateUser(JSON.stringify(editInfo.value)).then((data) => {
            if (data.code == 200) {
                userInfo.value.nickname = editInfo.value.nickname;
                CacheService.userInfo.set(JSON.stringify(userInfo.value))
                CacheService.nickname.set(editInfo.value.nickname)
                initMenuItem();
            } else {
                toast.add({ severity: 'error', summary: i18n.t("message.update_user_error"), group: 'tc', life: 3000 });
            }
        })
    }
}
const state = reactive({ countdown: 0, timer: null, signdown: 0, signTimer: null, resetdown: 0, resetTimer: null })
const signUpForm = ref({ username: '', email: '', password: '', code: '', nickname: '', avatar: '' });
const userSignUp = () => {
    if (checkUsername(signUpForm.value.username)) {
        if (checkEmail(signUpForm.value.email)) {
            if (signUpForm.value.password.length >= 6) {
                let md5 = new Md5();
                md5.appendAsciiStr(signUpForm.value.password);
                deviceService.signup(JSON.stringify({
                    nickname: signUpForm.value.nickname,
                    username: signUpForm.value.username,
                    password: md5.end(),
                    verify: signUpForm.value.code,
                    email: signUpForm.value.email,
                    avatar: signUpForm.value.avatar
                })).then(data => {
                    if (data.code == 200) {
                        initSignUser(data.data);
                        displaySignUp.value = false;
                    } else {
                        toast.add({ severity: 'error', summary: i18n.t("message.sign_up_error"), group: 'tc', life: 3000 });
                    }
                })
            } else {
                toast.add({ severity: 'error', summary: i18n.t("message.error_password"), group: 'tc', life: 3000 });
            }
        } else {
            toast.add({ severity: 'error', summary: i18n.t("message.error_email"), group: 'tc', life: 3000 });
        }
    } else {
        toast.add({ severity: 'error', summary: i18n.t("message.sign_account_error"), group: 'tc', life: 3000 });
    }
}
const loginForm = ref({ type: 0, username: '', email: '', password: '', code: '', checked: false });
const resetForm = ref({ email: '', passowrd: '', code: '' });
const userSignIn = () => {
    if (loginForm.value.type == 0) {
        if (loginForm.value.username && checkUsername(loginForm.value.username)) {
            if (loginForm.value.password && loginForm.value.password != '') {
                let md5 = new Md5();
                md5.appendAsciiStr(loginForm.value.password);
                deviceService.login(JSON.stringify({ type: loginForm.value.type, login: loginForm.value.username, verify: md5.end() })).then(data => {
                    if (data.code == 200) {
                        initSignUser(data.data);
                        displaySignIn.value = false;
                    } else {
                        toast.add({ severity: 'error', summary: i18n.t("message.sign_account_error"), group: 'tc', life: 3000 });
                    }
                })
            } else {
                toast.add({ severity: 'error', summary: i18n.t("message.password__error"), group: 'tc', life: 3000 });
            }
        } else {
            toast.add({ severity: 'error', summary: i18n.t("message.username__error"), group: 'tc', life: 3000 });
        }
    } else {
        if (loginForm.value.email && checkEmail(loginForm.value.email)) {
            if (loginForm.value.code && loginForm.value.code != '') {
                deviceService.login(JSON.stringify({ type: loginForm.value.type, login: loginForm.value.email, verify: loginForm.value.code })).then(data => {
                    if (data.code == 200) {
                        initSignUser(data.data);
                        displaySignIn.value = false;
                    } else {
                        toast.add({ severity: 'error', summary: i18n.t("message.sign_email_error"), group: 'tc', life: 3000 });
                    }
                })
            } else {
                toast.add({ severity: 'error', summary: i18n.t("message.verify_code"), group: 'tc', life: 3000 });
            }

        } else {
            toast.add({ severity: 'error', summary: i18n.t("message.error_email"), group: 'tc', life: 3000 });
        }
    }

}
const initSignUser = (data) => {
    if (loginForm.value.checked) {
        CacheService.token.remember(data.token)
        CacheService.username.remember(data.username)
        CacheService.nickname.remember(data.nickname)
        CacheService.email.remember(data.email)
        CacheService.avatar.remember(data.avatar)
        CacheService.device.remember(data.channel)
        CacheService.userInfo.remember(JSON.stringify(data))
    } else {
        CacheService.token.set(data.token)
        CacheService.username.set(data.username)
        CacheService.nickname.set(data.nickname)
        CacheService.email.set(data.email)
        CacheService.avatar.set(data.avatar)
        CacheService.device.set(data.channel)
        CacheService.userInfo.set(JSON.stringify(data))
    }
    userInfo.value = data;
    createConnection(data.username, data.channel, data.token);

    loginForm.value = { type: 0, username: '', email: '', password: '', code: '', checked: false };
    initMenuItem();
    toast.add({ severity: 'info', summary: i18n.t("message.sign_in_success", [data.nickname || data.username]), group: 'tc', life: 3000 });
}
const logout = () => {
    CacheService.token.remove()
    CacheService.username.remove()
    CacheService.nickname.remove()
    CacheService.email.remove()
    CacheService.avatar.remove()
    CacheService.device.remove()
    CacheService.userInfo.remove()
    userInfo.value = null;
    // clearInterval(reconnect.value);
    createConnection(CacheService.deviceId.get(), CacheService.channel.get());
    initMenuItem();
    toast.add({ severity: 'info', summary: i18n.t("message.sign_out_success"), group: 'tc', life: 3000 });
}
const sendSignUpCode = () => {
    if (signUpForm.value.email && checkEmail(signUpForm.value.email)) {
        deviceService.verify(JSON.stringify({ type: 1, verify: signUpForm.value.email })).then(data => {
            if (data.code == 200 && !data.data.result) {
                deviceService.sendVerifyCode(JSON.stringify({ type: 0, email: signUpForm.value.email })).then(data => {
                    if (data.code == 200) {
                        state.signdown = 120
                        state.signTimer = setInterval(() => {
                            if (state.signdown > 0) {
                                state.signdown--
                            } else {
                                clearInterval(state.signTimer)
                            }
                        }, 1000)
                        toast.add({ severity: 'info', summary: i18n.t("message.verify_code_success"), group: 'tc', life: 3000 });
                    } else {
                        toast.add({ severity: 'error', summary: i18n.t("message.send_email_error"), group: 'tc', life: 3000 });
                    }
                })
            } else {
                toast.add({ severity: 'error', summary: i18n.t("message.error_email"), group: 'tc', life: 3000 });
            }
        });
    } else {
        toast.add({ severity: 'error', summary: i18n.t("message.error_email"), group: 'tc', life: 3000 });
    }
}
const sendResetCode = () => {
    if (resetForm.value.email && checkEmail(resetForm.value.email)) {
        deviceService.verify(JSON.stringify({ type: 1, verify: resetForm.value.email })).then(data => {
            if (data.code == 200 && data.data.result) {
                deviceService.sendVerifyCode(JSON.stringify({ type: 2, email: resetForm.value.email })).then(data => {
                    if (data.code == 200) {
                        state.resetdown = 120
                        state.resetTimer = setInterval(() => {
                            if (state.resetdown > 0) {
                                state.resetdown--
                            } else {
                                clearInterval(state.resetTimer)
                            }
                        }, 1000)
                        toast.add({ severity: 'info', summary: i18n.t("message.verify_code_success"), group: 'tc', life: 3000 });
                    } else {
                        toast.add({ severity: 'error', summary: i18n.t("message.send_email_error"), group: 'tc', life: 3000 });
                    }
                })
            } else {
                toast.add({ severity: 'error', summary: i18n.t("message.error_email"), group: 'tc', life: 3000 });
            }
        });
    } else {
        toast.add({ severity: 'error', summary: i18n.t("message.error_email"), group: 'tc', life: 3000 });
    }
}
const showResetPwd = () => {
    displaySignIn.value = false;
    displayReset.value = true;
}
const resetPassword = () => {
    if (checkEmail(resetForm.value.email)) {
        if (resetForm.value.password.length >= 6) {
            let md5 = new Md5();
            md5.appendAsciiStr(resetForm.value.password);
            deviceService.resetPwd(JSON.stringify({
                type: 1,
                password: md5.end(),
                verify: resetForm.value.code,
                login: resetForm.value.email
            })).then(data => {
                if (data.code == 200) {
                    toast.add({ severity: 'info', summary: i18n.t("message.reset_pwd_success"), group: 'tc', life: 3000 });
                    displayReset.value = false;
                    displaySignIn.value = true;
                    resetForm.value = { email: '', passowrd: '', code: '' }
                } else {
                    toast.add({ severity: 'error', summary: i18n.t("message.reset_pwd_error"), group: 'tc', life: 3000 });
                }
            })
        } else {
            toast.add({ severity: 'error', summary: i18n.t("message.error_password"), group: 'tc', life: 3000 });
        }
    } else {
        toast.add({ severity: 'error', summary: i18n.t("message.error_email"), group: 'tc', life: 3000 });
    }
}
const sendSignInCode = () => {
    if (loginForm.value.email && checkEmail(loginForm.value.email)) {
        deviceService.verify(JSON.stringify({ type: 1, verify: loginForm.value.email })).then(data => {
            if (data.code == 200 && data.data.result) {
                deviceService.sendVerifyCode(JSON.stringify({ type: 1, email: loginForm.value.email })).then(data => {
                    if (data.code == 200) {
                        state.countdown = 120
                        state.timer = setInterval(() => {
                            if (state.countdown > 0) {
                                state.countdown--
                            } else {
                                clearInterval(state.timer)
                            }
                        }, 1000)
                        toast.add({ severity: 'info', summary: i18n.t("message.verify_code_success"), group: 'tc', life: 3000 });
                    } else {
                        toast.add({ severity: 'error', summary: i18n.t("message.send_email_error"), group: 'tc', life: 3000 });
                    }
                })
            } else {
                toast.add({ severity: 'error', summary: i18n.t("message.error_email"), group: 'tc', life: 3000 });
            }
        });
    } else {
        toast.add({ severity: 'error', summary: i18n.t("message.error_email"), group: 'tc', life: 3000 });
    }
}
const checkUsername = (username) => {
    let pattern = /^[a-zA-Z0-9_-]{4,16}$/;
    return pattern.test(username)
}
const checkEmail = (email) => {
    let pattern = /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/;
    return pattern.test(email)
}

const items = ref();
const menubarItems = ref();
window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    window.deferredPrompt = event;
    installApp.value = true;
    tour.addStep({
        id: 'temp',
        text: i18n.t("message.install_info_tips"),
        attachTo: {
            element: '#install',
            on: 'bottom'
        },
        buttons: [
            {
                text: i18n.t("common.back"),
                action: tour.back
            },
            {
                text: i18n.t("common.next"),
                action: tour.next
            }
        ]
    }, 4);
});
const installDestop = () => {
    const promptEvent = window.deferredPrompt;
    if (!promptEvent) {
        return;
    }
    promptEvent.prompt();
    promptEvent.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
            window.deferredPrompt = null;
            installApp.value = false;
            tour.removeStep('temp');
        }
    });
}
const initTour = () => {
    tour.addStep({
        id: 'first',
        text: i18n.t("message.device_info_tips"),
        attachTo: {
            element: '#deviceInfo',
            on: 'top'
        },
        buttons: [
            {
                text: i18n.t("common.next"),
                action: tour.next
            }
        ]
    });
    tour.addStep({
        id: 'second',
        text: i18n.t("message.share_info_tips"),
        attachTo: {
            element: '#shareInfo',
            on: 'top'
        },
        buttons: [
            {
                text: i18n.t("common.back"),
                action: tour.back
            },
            {
                text: i18n.t("common.next"),
                action: tour.next
            }
        ]
    });
    tour.addStep({
        id: 'third',
        text: i18n.t("message.transfer_info_tips"),
        attachTo: {
            element: '#downloadInfo',
            on: 'top'
        },
        buttons: [
            {
                text: i18n.t("common.back"),
                action: tour.back
            },
            {
                text: i18n.t("common.next"),
                action: tour.next
            }
        ]
    });
    tour.addStep({
        id: 'fourth',
        text: i18n.t("message.setting_info_tips"),
        attachTo: {
            element: '#settingInfo',
            on: 'top'
        },
        buttons: [
            {
                text: i18n.t("common.back"),
                action: tour.back
            },
            {
                text: i18n.t("common.next"),
                action: tour.next
            }
        ]
    });
    tour.addStep({
        id: 'fifth',
        text: i18n.t("message.account_info_tips"),
        attachTo: {
            element: '#accountInfo',
            on: 'bottom'
        },
        buttons: [
            {
                text: i18n.t("common.back"),
                action: tour.back
            },
            {
                text: i18n.t("common.next"),
                action: tour.next
            }
        ]
    });
    tour.addStep({
        id: 'sixth',
        text: i18n.t("message.help_info_tips"),
        attachTo: {
            element: '#helpInfo',
            on: 'bottom'
        },
        buttons: [
            {
                text: i18n.t("common.back"),
                action: tour.back
            },
            {
                text: i18n.t("common.finish"),
                action: tour.next
            }
        ]
    });
}
const helpMenu = ref();
const helpItems = ref();
const acountMenu = ref();
const accountItems = ref();
const toggle = (event) => {
    helpMenu.value.toggle(event);
};
const accountAction = (event) => {
    acountMenu.value.toggle(event);
};
const onShowRemoteVideo = (data) => {
    if (remoteVideoCode.value == data.id && displayRemoteVideo.value) {
        displayFinder.value = false;
        return;
    }
    remoteVideoCode.value = data.id;
    let peer = peerMap.value.get(data.id);
    let channel = channelMap.value.get(data.id);
    if (peer) {
        peer.ontrack = function (event) {
            if (event && event.streams) {
                remoteVideo.srcObject = event.streams[0];
            }
        }
        if (channel) {
            let mediaInfo = { type: 1 }
            channel.send(messageService.createMediaChannelMessage(2, mediaInfo))
        }
        displayRemoteVideo.value = true;
    }
    displayFinder.value = false;
}
const onShowRemoteDesktop = (data) => {
    if (remoteDesktopCode.value == data.id && displayRemoteDesktop.value) {
        displayFinder.value = false;
        return;
    }
    remoteDesktopCode.value = data.id;
    let peer = peerMap.value.get(data.id);
    let channel = channelMap.value.get(data.id);
    if (peer) {
        peer.ontrack = (event) => {
            if (event && event.streams) {
                remoteDesktop.srcObject = event.streams[0];
            }
        };
        if (channel) {
            let mediaInfo = { type: 1 }
            channel.send(messageService.createMediaChannelMessage(1, mediaInfo))
        }
        displayRemoteDesktop.value = true;
    }
    displayFinder.value = false;
}

const closeDesktop = () => {
    let tracks = desktopStream.value.getTracks();
    if (tracks) {
        tracks.forEach(track => {
            track.stop();
        });
    }
    stopRecordScreen();
    displayDesktop.value = false;
    desktopStream.value = null;
    sendMediaMessage();
}
const muteScreen = () => {
    screenMute.value = true;
    desktopStream.value.getTracks().forEach(track => {
        if (track.kind === 'audio') {
            track.enabled = false;
        }
    })
}
const unmuteScreen = () => {
    screenMute.value = false;
    desktopStream.value.getTracks().forEach(track => {
        if (track.kind === 'audio') {
            track.enabled = true;
        }
    })
}
const recordScreen = () => {
    screenRecord.value = true;
    recordStream('screen', desktopStream.value);

}
const stopRecordScreen = () => {
    screenRecord.value = false;
    stopRecordStream('screen');

}
const recordRemoteScreen = () => {
    screenRemoteRecord.value = true;
    recordStream('remoteScreen', remoteDesktop.srcObject);

}
const stopRecordRemoteScreen = () => {
    screenRemoteRecord.value = false;
    stopRecordStream('remoteScreen');

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
    displayVideo.value = false;
    userStream.value = null;
    sendMediaMessage();
}
const muteVideo = () => {
    videoMute.value = true;
    userStream.value.getTracks().forEach(track => {
        if (track.kind === 'audio') {
            track.enabled = false;
        }
    })
}
const unmuteVideo = () => {
    videoMute.value = false;
    userStream.value.getTracks().forEach(track => {
        if (track.kind === 'audio') {
            track.enabled = true;
        }
    })
}
const switchVideo = () => {
    let videoOption = true;
    if (videoDefalut.value) {
        videoOption = { facingMode: { exact: "environment" } };
    }
    navigator.mediaDevices.getUserMedia({ video: videoOption, audio: true }).then(stream => {
        videoDefalut.value = !videoDefalut.value;
        let tracks = userStream.value.getTracks();
        userSource.srcObject = stream;
        userStream.value = stream;
        stream.getVideoTracks()[0].addEventListener('ended', () => {
            userStream.value = null;
            displayVideo.value = false;
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
        toast.add({ severity: 'error', summary: i18n.t("message.switch_video_err"), group: 'tc', life: 3000 });
    })
}
const closeRemoteVideo = () => {
    stopRecordRemoteVideo();
    let peer = peerMap.value.get(remoteVideoCode.value);
    let channel = channelMap.value.get(remoteVideoCode.value);
    if (peer) {
        remoteVideo.srcObject = null;
        peer.ontrack = null
        if (channel) {
            let mediaInfo = { type: 0 }
            channel.send(messageService.createMediaChannelMessage(2, mediaInfo))
        }
        displayRemoteVideo.value = false;
        remoteVideoCode.value = '';
    }
}
const recordRemoteVideo = () => {
    videoRemoteRecord.value = true;
    recordStream('remoteVideo', remoteVideo.srcObject);
}
const stopRecordRemoteVideo = () => {
    videoRemoteRecord.value = false;
    stopRecordStream('remoteVideo');
}
const closeRemoteDesktop = () => {
    stopRecordRemoteScreen();
    let peer = peerMap.value.get(remoteDesktopCode.value);
    let channel = channelMap.value.get(remoteDesktopCode.value);
    if (peer) {
        remoteDesktop.srcObject = null;
        peer.ontrack = null;
        if (channel) {
            let mediaInfo = { type: 0 }
            channel.send(messageService.createMediaChannelMessage(1, mediaInfo))
        }
        displayRemoteDesktop.value = false;
        remoteDesktopCode.value = '';
    }

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
        channel.send(messageService.createMediaChannelMessage(0, mediaInfo));
    }
}


const handleScreen = (event) => {
    let ele = event.target
    if (ele.fullscreenElement || document.fullscreenElement) {
        document.exitFullscreen();
    } else {
        ele.requestFullscreen();
    }

}
const emailItems = ref([]);
const emailEndfix = ref(['@qq.com', '@aliyun.com', '@163.com', '@gmail.com', '@sina.com', '@sina.cn', '@hotmail.com', '@126.com', '@263.net']);
const emailComplete = (event) => {
    emailItems.value = [];
    emailEndfix.value.forEach(endfix => {
        if (event.query.indexOf('@') > -1) {
            let end = event.query.substr(event.query.indexOf('@'))
            let prefix = event.query.substr(0, event.query.indexOf('@'))
            if (endfix.startsWith(end)) {
                emailItems.value.push(prefix + endfix);
            }
        } else {
            emailItems.value.push(event.query + endfix);
        }
    });
}
const cancelFeeback = () => {
    displayFeeback.value = false;
}
const sendFeeback = () => {

    if (feebackInfo.value.title && feebackInfo.value.content && feebackInfo.value.title != '' && feebackInfo.value.content != '') {

        deviceService.sendFeebackInfo(JSON.stringify(feebackInfo.value)).then(data => {
            if (data.code == 200) {
                toast.add({ severity: 'info', summary: i18n.t("message.submit_feeback_info"), group: 'tc', life: 3000 });
                feebackInfo.value = { email: '', title: '', content: '' }
                displayFeeback.value = false;
            } else {
                toast.add({ severity: 'error', summary: i18n.t("message.submit_feeback_fail"), group: 'tc', life: 3000 });
            }
        });
    } else {
        toast.add({ severity: 'warn', summary: i18n.t("message.verify_feeback"), group: 'tc', life: 3000 });
    }
}
onBeforeMount(() => {
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
    if (CacheService.trackerServer.get()) {
        customTracker.value = CacheService.trackerServer.get();
        userSetting.value.trackerServer = CacheService.trackerServer.get();
    } else {
        userSetting.value.trackerServer = 0;
    }
    CacheService.lang.set(locale.value);
    if (CacheService.userInfo.get()) {
        userInfo.value = JSON.parse(CacheService.userInfo.get());
    }
    if (CacheService.myroom.get()) {
        const data = JSON.parse(CacheService.myroom.get())
        roomInfo.value.code = data.code;
        roomInfo.value.password = data.password;
        roomInfo.value.name = data.name;
        roomInfo.value.users = data.users;
        roomInfo.value.qr = process.env.VITE_ROOM_URL + '?code=' + data.code;
    }
    if (CacheService.sharefile.get()) {
        cloudShare.value = JSON.parse(CacheService.sharefile.get())
    }
    initMenuItem();

})
onMounted(() => {
    if (navigator.serviceWorker) {
        navigator.serviceWorker.getRegistration('./').then(reg => {
            return reg || navigator.serviceWorker.register('sw.js', { scope: './' })
        }).then(reg => {
            const worker = reg.active || reg.waiting || reg.installing
            function checkState(worker) {
                return worker.state === 'activated' && client.loadWorker(worker)
            }
            if (!checkState(worker)) {
                worker.addEventListener('statechange', ({ target }) => checkState(target))
            }
        })
    }

    serverSocket.addOpenEvent(socketOpenEvent);
    serverSocket.addMsgEvent(socketMsgEvent);
    initTour();
    if (!CacheService.tips.get() || CacheService.tips.get() != process.env.VITE_APP_VERION) {
        CacheService.tips.set(process.env.VITE_APP_VERION);
        tour.start();
    }
    if (serverSocket.connected) {
        socketOpenEvent();
    }
    document.onfullscreenchange = (e) => {
        if (!e.currentTarget.fullscreenElement) {
            e.target.style.width = '200px'
        }

    }
})
onBeforeUnmount(() => {
    closeAllConnection();
    serverSocket.removeOpenEvent(socketOpenEvent);
    serverSocket.removeMsgEvent(socketMsgEvent);
    document.onfullscreenchange = null;
})
const changeSetting = () => {
    CacheService.setting.set(JSON.stringify(userSetting.value));
    locale.value = userSetting.value.lang;
    CacheService.lang.set(locale.value);
    initMenuItem();
    clearTour()
    initTour();

}
const clearTour = () => {
    tour.removeStep('first');
    tour.removeStep('second');
    tour.removeStep('third');
    tour.removeStep('fourth');
    tour.removeStep('fifth');
    tour.removeStep('sixth');
    tour.removeStep('temp')
}
const initMenuItem = () => {
    document.title = i18n.t('headers.title')
    items.value = [
        {
            id: 'deviceInfo',
            label: i18n.t("dockerItem.deviceInfo"),
            icon: "images/icons/link.png",
            command: () => {
                if (displayFinder.value == false) {
                    displayFinder.value = true;
                    displayShare.value = false;
                    displayDownload.value = false;
                    displaySetting.value = false;
                } else {
                    displayFinder.value = false;
                }

            }
        },
        {
            id: 'shareInfo',
            label: i18n.t("dockerItem.shareInfo"),
            icon: "images/icons/share.png",
            command: () => {
                if (displayShare.value == false) {
                    displayShare.value = true;
                    displayFinder.value = false;
                    displayDownload.value = false;
                    displaySetting.value = false;
                } else {
                    displayShare.value = false;
                }

            }
        },
        {
            id: 'downloadInfo',
            label: i18n.t("dockerItem.transferInfo"),
            icon: "images/icons/download.png",
            command: () => {
                if (displayDownload.value == false) {
                    displayDownload.value = true;
                    displayFinder.value = false;
                    displayShare.value = false;
                    displaySetting.value = false;
                } else {
                    displayDownload.value = false;
                }

            }
        },
        {
            id: 'settingInfo',
            label: i18n.t("dockerItem.settingInfo"),
            icon: "images/icons/setting.png",
            command: () => {
                if (displaySetting.value == false) {
                    displaySetting.value = true;
                    displayDownload.value = false;
                    displayFinder.value = false;
                    displayShare.value = false;

                } else {
                    displaySetting.value = false;
                }

            }
        }
    ]
    menubarItems.value = [
        {
            label: i18n.t("menus.media"),
            icon: 'pi pi-play',
            items: [
                {
                    label: i18n.t("menus.screen"),
                    icon: 'pi pi-desktop',
                    command: () => {
                        showDesktop();
                    }
                },
                {
                    label: i18n.t("menus.video"),
                    icon: 'pi pi-video',
                    command: () => {
                        showVideo();
                    }
                }
            ]
        },
        {
            label: i18n.t("menus.device"),
            icon: 'pi pi-sitemap',
            command: () => {
                if (displayFinder.value == false) {
                    displayFinder.value = true;
                    displayShare.value = false;
                    displayDownload.value = false;
                    displaySetting.value = false;
                } else {
                    displayFinder.value = false;
                }
            }
        },
        {
            label: i18n.t("menus.file"),
            icon: 'pi pi-file',
            command: () => {
                if (displayShare.value == false) {
                    displayShare.value = true;
                    displayFinder.value = false;
                    displayDownload.value = false;
                    displaySetting.value = false;
                } else {
                    displayShare.value = false;
                }
            }
        },
        {
            label: i18n.t("menus.transfer"),
            icon: 'pi pi-arrow-right-arrow-left',
            command: () => {
                if (displayDownload.value == false) {
                    displayDownload.value = true;
                    displayFinder.value = false;
                    displayShare.value = false;
                    displaySetting.value = false;
                } else {
                    displayDownload.value = false;
                }
            }
        },
        {
            label: i18n.t("menus.setting"),
            icon: 'pi pi-cog',
            command: () => {
                if (displaySetting.value == false) {
                    displaySetting.value = true;
                    displayDownload.value = false;
                    displayFinder.value = false;
                    displayShare.value = false;

                } else {
                    displaySetting.value = false;
                }
            }
        },
        {
            label: i18n.t("menus.torrent"),
            icon: 'pi pi-link',
            command: () => {
                displayTorrent.value = true;
            }
        },
        {
            label: i18n.t("menus.metting"),
            icon: 'pi pi-users',
            items: [
                {
                    label: i18n.t("menus.myRoom"),
                    icon: 'pi pi-plus',
                    command: () => {
                        displayCreateRoom.value = true;
                    }
                },
                {
                    label: i18n.t("menus.joinRoom"),
                    icon: 'pi pi-sign-in',
                    command: () => {
                        router.push('/room');
                    }
                }
            ]
        }
    ]
    helpItems.value = [
        {
            label: i18n.t("menus.help"),
            items: [
                {
                    label: i18n.t("menus.tips"),
                    icon: 'pi pi-info-circle',
                    command: () => {
                        tour.start();
                    }
                },
                {
                    label: i18n.t("menus.feeback"),
                    icon: 'pi pi-envelope',
                    command: () => {
                        if (userInfo.value) {
                            feebackInfo.value.email = userInfo.value.email;
                        }
                        displayFeeback.value = true;
                    }
                },

                {
                    label: i18n.t("tooltips.download_app"),
                    icon: 'pi pi-microsoft',
                    command: () => {
                        location.href = "#"
                    }
                },
                {
                    label: i18n.t("menus.about"),
                    icon: 'pi pi-globe',
                    command: () => {
                        displayAbout.value = true;
                    }
                }
            ]
        }]
    if (userInfo.value) {
        accountItems.value = [
            {
                label: userInfo.value.nickname || userInfo.value.username,
                items: [
                    {
                        label: i18n.t("menus.profile"),
                        icon: 'pi pi-user',
                        command: () => {
                            displayUserInfo.value = true;
                        }
                    },
                    {
                        label: i18n.t("menus.logout"),
                        icon: 'pi pi-sign-out',
                        command: () => {
                            logout()
                        }
                    }
                ]
            }
        ]
    } else {
        accountItems.value = [
            {
                label: i18n.t("menus.account"),
                items: [
                    {
                        label: i18n.t("menus.login"),
                        icon: 'pi pi-sign-in',
                        command: () => {
                            displaySignIn.value = true;
                        }
                    },
                    {
                        label: i18n.t("menus.signup"),
                        icon: 'pi pi-user-plus',
                        command: () => {
                            displaySignUp.value = true;
                        }
                    }
                ]
            }
        ]
    }
}
const showVideo = () => {
    if (navigator.mediaDevices) {
        if (displayVideo.value) {
            return;
        }
        navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
            userSource.srcObject = stream;
            displayVideo.value = true;
            userStream.value = stream;
            stream.getVideoTracks()[0].addEventListener('ended', () => {
                userStream.value = null;
                displayVideo.value = false;
                sendMediaMessage();
            });
            sendMediaMessage();
        }).catch(function (err) {
            toast.add({ severity: 'error', summary: err.name, group: 'tc', life: 3000 });
        })
    } else {
        toast.add({ severity: 'error', summary: i18n.t("message.live_video_err"), group: 'tc', life: 3000 });
    }
}
const showDesktop = () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
        navigator.mediaDevices.getDisplayMedia({ video: true, audio: true }).then(stream => {
            let oldStream = desktopStream.value
            desktopSource.srcObject = stream;
            displayDesktop.value = true;
            desktopStream.value = stream;
            stream.getVideoTracks()[0].addEventListener('ended', () => {
                displayDesktop.value = false;
                desktopStream.value = null;
                sendMediaMessage();
                stopRecordScreen();
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
            toast.add({ severity: 'error', summary: err.name, group: 'tc', life: 3000 });
        })
    } else {
        toast.add({ severity: 'error', summary: i18n.t("message.screen_share_err"), group: 'tc', life: 3000 });
    }
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
        updateUploadStatus({ id: key, device: code, name: file.name, format: fileService.readFileFormat(file.name), size: file.size, total: totalChunk, chunks: currentChunk + 1, status: 0 });
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
const onRefreshCode = () => {
    confirm.require({
        group: 'refreshDialog',
        message: i18n.t("message.change_code_msg"),
        header: i18n.t("headers.change_code_confirm"),
        icon: 'pi pi-info-circle',
        position: 'top',
        accept: () => {
            closePeerConnect();
            if (CacheService.code.get()) {
                serverSocket.send(messageService.createSubscribeMessage(4, JSON.stringify({ code: CacheService.code.get() })));
            } else {
                serverSocket.send(messageService.createSubscribeMessage(0, null));
            }
            toast.add({ severity: 'info', summary: i18n.t("message.change_code_confirm"), group: 'tc', life: 3000 });
        },
        reject: () => {
            toast.add({ severity: 'error', summary: i18n.t("message.change_code_cancel"), group: 'tc', life: 3000 });
        }
    });
}

const onRemoveTemplatingFile = (index) => {
    files.value.splice(index, 1);
    let fileInfo = [];
    for (let i = 0; i < files.value.length; i++) {
        let md5 = new Md5();
        md5.appendAsciiStr(deviceCode.value + ':' + files.value[i].name + ":" + files.value[i].size);
        let key = md5.end();
        fileInfo.push({ device: deviceCode.value, name: files.value[i].name, size: files.value[i].size, format: fileService.readFileFormat(files.value[i].name), id: key, status: 0 })
    }
    sendShareFileList(fileInfo);
};

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

    sendShareFileList(fileInfo);
}
const updateUploadStatus = (fileInfo) => {
    for (let i = 0; i < uploadFiles.value.length; i++) {
        if (fileInfo.id == uploadFiles.value[i].id && fileInfo.device == uploadFiles.value[i].device) {
            uploadFiles.value[i].chunks = fileInfo.chunks;
            if (uploadFiles.value[i].total == 0) {
                uploadFiles.value[i].total = fileInfo.total;
            }
            if (fileInfo.chunks == fileInfo.total) {
                uploadFiles.value[i].status = 1;
            }
            return;
        }
    }
    uploadFiles.value.push(fileInfo);
}
const onSendFile = (event, data) => {
    let md5 = new Md5();
    md5.appendAsciiStr(deviceCode.value + ':' + event.files[0].name + ":" + event.files[0].size);
    let key = md5.end();
    for (let i = 0; i < uploadFiles.value.length; i++) {
        if (key == uploadFiles.value[i].id && data.id == uploadFiles.value[i].device) {
            toast.add({ severity: 'warn', summary: i18n.t("message.send_file_warn"), group: 'tc', life: 3000 });
            return;
        }
    }

    sendFiles.value.set(key, event.files[0]);
    uploadFiles.value.push({ id: key, device: data.id, name: event.files[0].name, format: fileService.readFileFormat(event.files[0].name), size: event.files[0].size, total: 0, chunks: 0, status: -1 });
    if (sendConfirm.value.get(data.id)) {
        return;
    }
    sendConfirm.value.set(data.id, key);
    channelMap.value.get(data.id).send(messageService.createFileChannelMessage(1, { device: deviceCode.value, name: event.files[0].name, size: event.files[0].size, format: fileService.readFileFormat(event.files[0].name), id: key, status: 0 }));

};

const sendShareFileList = (fileInfo) => {

    for (let channel of channelMap.value.values()) {
        channel.send(messageService.createBasicChannelMessage(1, fileInfo));
    }
}
const calculateProgress = (data) => {
    if (data.chunks == 0) {
        return 0;
    } else if (data.chunks == data.total) {
        return 100;
    } else {
        return Math.floor(data.chunks / data.total * 100);

    }
}

const formatSize = (bytes) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const formatIcon = (name) => {
    let icon = fileService.readFileFormat(name) + '.png';
    return icon;
};
const onDockItemClick = (event, item) => {
    if (item.command) {
        item.command();
    }

    event.preventDefault();
}
const closeAllConnection = () => {
    for (let writer of streamWriterMap.value.values()) {
        writer.abort();
    }
    for (let peer of peerMap.value.values()) {
        peer.close();
    }

}
const onAddDeviceClick = () => {
    if (inputCode.value && inputCode.value.length == 6 && inputCode.value != deviceCode.value) {
        const user = codeMap.value.get(inputCode.value);
        if (user) {
            toast.add({ severity: 'warn', summary: i18n.t("message.exist_device_warn"), group: 'tc', life: 3000 });
            return;
        }
        serverSocket.send(messageService.createSubscribeMessage(1, JSON.stringify({ code: inputCode.value })));
    } else {
        toast.add({ severity: 'warn', summary: i18n.t("message.device_code_err"), group: 'tc', life: 3000 });
    }
}
const onDeleteDeviceClick = (data) => {
    for (let i = 0; i < deviceList.value.length; i++) {
        if (data.id == deviceList.value[i].id) {
            deviceList.value.splice(i, 1);
            break;
        }
    }
    codeMap.value.delete(data.id);
    serverSocket.send(messageService.createSubscribeMessage(2, JSON.stringify({ code: data.id })));
}
const changeConectStatus = (code, status) => {

    for (let i = 0; i < deviceList.value.length; i++) {
        if (code == deviceList.value[i].id) {
            deviceList.value[i].status = status;
            break;
        }
    }
    for (let i = 0; i < localList.value.length; i++) {
        if (code == localList.value[i].id) {
            localList.value[i].status = status;
            break;
        }
    }
    for (let i = 0; i < myList.value.length; i++) {
        if (code == myList.value[i].id) {
            myList.value[i].status = status;
            break;
        }
    }
}
const handleFileChunks = (code, data) => {
    let writer = streamWriterMap.value.get(data.id);
    let fileInfo = null;
    for (let i = 0; i < downloadFiles.value.length; i++) {
        if (data.id == downloadFiles.value[i].id) {
            fileInfo = downloadFiles.value[i];
            break;
        }
    }
    if (!fileInfo) {
        fileInfo = { device: code, name: data.name, size: data.size, chunks: 0, id: data.id, format: data.format, status: 0, total: data.total, start: new Date().getTime(), cost: 0 }
        downloadFiles.value.push(fileInfo);
    }
    if (fileInfo.status == 3) {
        return;
    }
    if (!writer) {
        let fileStream = streamSaver.createWriteStream(data.name, { size: data.size });
        writer = fileStream.getWriter();
        streamWriterMap.value.set(data.id, writer);
        fileInfo.status = 1;
        fileInfo.total = data.total;
    }
    //写入流数据
    writer.write(fileService.base64ToUint8Array(data.chunk));
    fileInfo.chunks++;
    if (fileInfo.total == fileInfo.chunks) {
        fileInfo.cost = new Date().getTime() - fileInfo.start;

        writer.close();
        streamWriterMap.value.delete(data.id);
        fileInfo.status = 2;
        for (let i = 0; i < deviceList.value.length; i++) {
            if (code == deviceList.value[i].id) {
                for (let file of deviceList.value[i].files.values()) {
                    if (data.id == file.id) {
                        file.status = 0;
                        break;
                    }
                }
                break;
            }
        }
        for (let i = 0; i < localList.value.length; i++) {
            if (code == localList.value[i].id) {
                for (let file of localList.value[i].files.values()) {
                    if (data.id == file.id) {
                        file.status = 0;
                        break;
                    }
                }
                break;
            }
        }
        for (let i = 0; i < myList.value.length; i++) {
            if (code == myList.value[i].id) {
                for (let file of myList.value[i].files.values()) {
                    if (data.id == file.id) {
                        file.status = 0;
                        break;
                    }
                }
                break;
            }
        }
    }
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
                    finishWirteFile(code, data.id);
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
                finishWirteFile(code, data.id);
            }
        }).catch((err) => {
            onStopDownload(fileInfo);
            fileInfo.chunks = 0
            streamWriterMap.value.delete(data.id)
        });

    }

}

const finishWirteFile = (code, key) => {
    downloadNext(code);
    for (let i = 0; i < deviceList.value.length; i++) {
        if (code == deviceList.value[i].id) {
            for (let file of deviceList.value[i].files.values()) {
                if (key == file.id) {
                    file.status = 0;
                    break;
                }
            }
            return;
        }
    }
    for (let i = 0; i < localList.value.length; i++) {
        if (code == localList.value[i].id) {
            for (let file of localList.value[i].files.values()) {
                if (key == file.id) {
                    file.status = 0;
                    break;
                }
            }
            return;
        }
    }
}

const downloadNext = (code) => {
    taskMap.value.delete(code);
    let dataChannel = channelMap.value.get(code);
    for (let i = 0; i < downloadFiles.value.length; i++) {
        if (downloadFiles.value[i].device == code && (downloadFiles.value[i].status == 0 || downloadFiles.value[i].status == 1)) {
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

const onConnectClick = (data) => {
    data.status = 2;
    initWebRTC(data.id);
    let userInfo = codeMap.value.get(data.id);
    if (data.password != '') {
        serverSocket.send(messageService.createWebRTCMessage(0, data.id, userInfo.userId, userInfo.channel, JSON.stringify({
            type: "auth", code: deviceCode.value, pwd: data.password
        })));
    } else {
        serverSocket.send(messageService.createWebRTCMessage(0, data.id, userInfo.userId, userInfo.channel, JSON.stringify({
            type: "apply", code: deviceCode.value
        })));
    }
    setTimeout(() => {
        if (data.status == 2) {
            let peer = peerMap.value.get(data.id);
            if (!peer || peer.connectionState == "new") {
                data.status = 0
            }
        }
    }, 5000);

}
const onOpenDirClick = (data) => {
    dirBread.value = [];
    let dir = dirMap.value.get(data.id);

    if (!dir) {
        dir = { id: data.id, device: data.id, name: data.id, type: 0, root: '', path: '', children: [] }
        dirMap.value.set(data.id, dir);
    }
    dirData.value = dir;

    dirBread.value.push({
        label: dir.device, id: data.id, data: dir, command: (event) => {
            breadCrumbClick(event);
        }
    })
    displayDir.value = true;
    let channel = channelMap.value.get(data.id);
    if (channel) {
        channel.send(messageService.createDirChannelMessage(0, { data: dir }));
    }
}

const breadCrumbClick = (event) => {
    let dir = event.item.data;
    let channel = channelMap.value.get(dir.device);
    if (channel) {
        channel.send(messageService.createDirChannelMessage(0, { data: dir }));
    }
    let index = 0
    for (let i = 0; i < dirBread.value.length; i++) {
        if (dirBread.value[i].id == dir.id) {
            index = i;
            break;
        }
    }
    if (index < dirBread.value.length - 1) {
        dirBread.value.splice(index + 1)
    }
    dirData.value = dir;
}

const onDirCilck = (dir) => {
    let channel = channelMap.value.get(dir.device);
    if (dir.type == 0) {
        toast.add({ severity: 'info', summary: i18n.t("message.dir_req_info", ['"' + dir.name + '"']), group: 'tc', life: 3000 });
        dirBread.value.push({
            label: dir.name, id: dir.id, data: dir, command: (event) => {
                breadCrumbClick(event);
            }

        })

        if (channel) {
            channel.send(messageService.createDirChannelMessage(0, { data: dir }));
        }
        dirData.value = dir;
    } else {
        for (let file of downloadFiles.value.values()) {
            if (file.id == dir.id) {
                toast.add({ severity: 'warn', summary: i18n.t("message.download_exit_err"), group: 'tc', life: 3000 });
                return;
            }
        }
        if (channel) {
            channel.send(messageService.createDirChannelMessage(2, { data: dir }));
        }
        toast.add({ severity: 'info', summary: i18n.t("message.download_req_info", ['"' + dir.name + '"']), group: 'tc', life: 3000 });
    }
}

const onAuthClick = (data) => {
    data.status = 2;
    initWebRTC(data.id);
    let userInfo = codeMap.value.get(data.id);
    serverSocket.send(messageService.createWebRTCMessage(0, data.id, userInfo.userId, userInfo.channel, JSON.stringify({
        type: "auth", code: deviceCode.value, pwd: data.password
    })));
    setTimeout(() => {
        if (data.status == 2) {
            let peer = peerMap.value.get(data.id);
            if (!peer || peer.connectionState == "new") {
                data.status = 0
            }
        }
    }, 5000);

}

const onClearDownloadRecord = (fileInfo) => {
    let writer = streamWriterMap.value.get(fileInfo.id);
    if (writer) {
        writer.abort();
        streamWriterMap.value.delete(fileInfo.id);
    }
    for (let i = 0; i < downloadFiles.value.length; i++) {
        if (downloadFiles.value[i].id == fileInfo.id) {
            downloadFiles.value.splice(i, 1);
            return;
        }
    }
}
const onClearUploadRecord = (fileInfo, index) => {

    uploadFiles.value.splice(index, 1);
    if (fileInfo.status == -1) {
        let key = sendConfirm.value.get(fileInfo.device);
        if (key && key == fileInfo.id) {
            sendNextConfirm(fileInfo.device)
        }
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
const onResumeDownload = (fileInfo) => {
    if (!taskMap.value.get(fileInfo.device)) {
        let channel = channelMap.value.get(fileInfo.device);
        if (channel) {
            if (fileInfo.type == 0) {
                channel.send(messageService.createFileChannelMessage(2, fileInfo));
            } else if (fileInfo.type == 1) {
                channel.send(messageService.createBasicChannelMessage(2, fileInfo));
            } else {
                channel.send(messageService.createFileChannelMessage(5, fileInfo));
            }
        }
    }
    fileInfo.status = 1;
}
const onFileDownload = (id, fileInfo) => {
    for (let file of downloadFiles.value.values()) {
        if (file.id == fileInfo.id) {
            toast.add({ severity: 'warn', summary: i18n.t("message.download_exit_err"), group: 'tc', life: 3000 });
            return;
        }
    }
    downloadFiles.value.push({ device: id, name: fileInfo.name, size: fileInfo.size, type: 1, chunks: 0, id: fileInfo.id, format: fileInfo.format, status: 0, total: 0, start: new Date().getTime(), cost: 0 });
    if (!taskMap.value.get(id)) {
        let dataChannel = channelMap.value.get(id);
        dataChannel.send(messageService.createBasicChannelMessage(2, fileInfo));
    }
    fileInfo.status = 1
}
const onDisconnectClick = (data) => {
    data.status = 2;
    peerMap.value.get(data.id).close();
    let userInfo = codeMap.value.get(data.id);
    serverSocket.send(messageService.createWebRTCMessage(3, data.id, userInfo.userId, userInfo.channel, JSON.stringify({
        type: "close", code: deviceCode.value
    })));
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
    }
}
const closePeerConnect = () => {
    for (let writer of streamWriterMap.value.values()) {
        writer.abort();
    }
    streamWriterMap.value.clear();
    for (let peer of peerMap.value.values()) {
        peer.close();
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
                    for (let i = 0; i < deviceList.value.length; i++) {
                        if (code == deviceList.value[i].id) {
                            deviceList.value[i].rtt = rtt + 'ms';
                            break;
                        }
                    }
                    for (let i = 0; i < localList.value.length; i++) {
                        if (code == localList.value[i].id) {
                            localList.value[i].rtt = rtt + 'ms';
                            break;
                        }
                    }
                    for (let i = 0; i < myList.value.length; i++) {
                        if (code == myList.value[i].id) {
                            myList.value[i].rtt = rtt + 'ms';
                            break;
                        }
                    }
                } else {
                    if (channelMap.value.get(code)) {
                        channelMap.value.get(code).send(channelMessage);
                    }

                }
            } else if (msg.type == 1) {
                //文件列表信息 
                for (let i = 0; i < deviceList.value.length; i++) {
                    if (code == deviceList.value[i].id) {
                        deviceList.value[i].files = msg.data;
                        if (streamWriterMap.value.size > 0) {
                            for (let fileInfo of deviceList.value[i].files.values()) {
                                if (streamWriterMap.value.has(fileInfo.id)) {
                                    fileInfo.status = 1;
                                }
                            }
                        }
                        break;
                    }
                }
                for (let i = 0; i < localList.value.length; i++) {
                    if (code == localList.value[i].id) {
                        localList.value[i].files = msg.data;
                        if (streamWriterMap.value.size > 0) {
                            for (let fileInfo of localList.value[i].files.values()) {
                                if (streamWriterMap.value.has(fileInfo.id)) {
                                    fileInfo.status = 1;
                                }
                            }
                        }
                        break;
                    }
                }
                for (let i = 0; i < myList.value.length; i++) {
                    if (code == myList.value[i].id) {
                        myList.value[i].files = msg.data;
                        if (streamWriterMap.value.size > 0) {
                            for (let fileInfo of myList.value[i].files.values()) {
                                if (streamWriterMap.value.has(fileInfo.id)) {
                                    fileInfo.status = 1;
                                }
                            }
                        }
                        break;
                    }
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
        } else if (data.type == 1) {
            //文件消息
            if (msg.type == 0) {
                handleFileChunks(code, msg.data);
            } else if (msg.type == 1) {
                let fileInfo = msg.data;
                let channel = channelMap.value.get(code);
                if (userSetting.value.automated == '0') {

                    confirm.require({
                        group: 'recDialog',
                        message: i18n.t("message.file_accept_confirm", [code, '"' + fileInfo.name + '"', formatSize(fileInfo.size)]),
                        header: i18n.t("headers.file_accept_conform"),
                        icon: 'pi pi-info-circle',
                        position: 'top',
                        accept: () => {
                            downloadFiles.value.push({ device: code, name: fileInfo.name, size: fileInfo.size, type: 0, chunks: 0, id: fileInfo.id, format: fileInfo.format, status: 0, total: 0, start: new Date().getTime(), cost: 0 });
                            if (!taskMap.value.get(code)) {
                                channel.send(messageService.createFileChannelMessage(2, fileInfo));
                            } else {
                                channel.send(messageService.createFileChannelMessage(4, fileInfo));
                            }
                        },
                        reject: () => {
                            channel.send(messageService.createFileChannelMessage(3, fileInfo));
                        }
                    });
                } else if (userSetting.value.automated == '1') {
                    downloadFiles.value.push({ device: code, name: fileInfo.name, size: fileInfo.size, type: 0, chunks: 0, id: fileInfo.id, format: fileInfo.format, status: 0, total: 0, start: new Date().getTime(), cost: 0 });
                    if (!taskMap.value.get(code)) {
                        channel.send(messageService.createFileChannelMessage(2, fileInfo));
                    } else {
                        channel.send(messageService.createFileChannelMessage(4, fileInfo));
                    }
                } else {
                    channel.send(messageService.createFileChannelMessage(3, fileInfo));
                }
            } else if (msg.type == 2) {
                //确认接收文件立即发送
                let fileInfo = msg.data;
                let file = sendFiles.value.get(fileInfo.id);
                for (let i = 0; i < uploadFiles.value.length; i++) {
                    if (fileInfo.id == uploadFiles.value[i].id && code == uploadFiles.value[i].device) {
                        uploadFiles.value[i].status = 0;
                        break;
                    }
                }
                setTimeout(() => {
                    sendNextConfirm(code);
                }, 500);
                if (file) {
                    sendFileBuffer(code, file, fileInfo.chunkSize, fileInfo.chunks);
                }
            } else if (msg.type == 3) {
                //拒绝接收文件

                let fileInfo = msg.data;
                toast.add({ severity: 'error', summary: i18n.t("message.file_reject_msg", [code, '"' + fileInfo.name + '"']), group: 'tc', life: 3000 });
                sendFiles.value.delete(fileInfo.id);
                for (let i = 0; i < uploadFiles.value.length; i++) {
                    if (fileInfo.id == uploadFiles.value[i].id && code == uploadFiles.value[i].device) {
                        uploadFiles.value.splice(i, 1);
                        break;
                    }
                }
                setTimeout(() => {
                    sendNextConfirm(code);
                }, 500);
            } else if (msg.type == 4) {
                //确认接收文件不发送
                let fileInfo = msg.data;
                for (let i = 0; i < uploadFiles.value.length; i++) {
                    if (fileInfo.id == uploadFiles.value[i].id && code == uploadFiles.value[i].device) {
                        uploadFiles.value[i].status = 0;
                        break;
                    }
                }
                setTimeout(() => {
                    sendNextConfirm(code);
                }, 500);
            }

        } else if (data.type == 2) {
            let dirInfo = msg.data;
            let channel = channelMap.value.get(code);
            let dir = dirInfo.data;
            //目录消息
            if (msg.type == 0) {
                channel.send(messageService.createDirChannelMessage(4, { code: '501', message: 'client not support', data: dirInfo.data }));
            } else if (msg.type == 1) {

                if (dir.root == '' && dir.path == '') {

                    if (dir.children) {
                        if (dirMap.value.get(code)) {
                            let top = dirMap.value.get(code);
                            top.children = dir.children;
                        } else {
                            dirMap.value.set(code, dir);
                        }
                    }
                } else {
                    if (dirMap.value.get(code)) {
                        let roots = dirMap.value.get(code).children;
                        for (let i = 0; i < roots.length; i++) {
                            if (roots[i].id == dir.root) {
                                appendDirChildren(roots[i], dir);
                            }
                        }
                    }
                }
            } else if (msg.type == 2) {
                channel.send(messageService.createDirChannelMessage(4, { code: '501', message: 'client not support', data: dirInfo.data }));
            } else if (msg.type == 3) {
                let fileInfo = { device: code, name: dir.name, size: dir.size, id: dir.id, format: fileService.readFileFormat(dir.name), status: 0 }
                downloadFiles.value.push({ device: code, name: dir.name, size: dir.size, type: 2, chunks: 0, id: dir.id, format: fileInfo.format, status: 0, total: 0, start: new Date().getTime(), cost: 0 });
                if (!taskMap.value.get(code)) {
                    channel.send(messageService.createFileChannelMessage(5, fileInfo));
                }
            } else if (msg.type == 4) {
                if (dirInfo.code == '501') {

                    toast.add({ severity: 'error', summary: i18n.t("message.dir_not_support_err", code), group: 'tc', life: 3000 });
                } else if (dirInfo.code == '404') {
                    toast.add({ severity: 'error', summary: i18n.t("message.dir_not_found_err", code), group: 'tc', life: 3000 });
                }

            }

        } else if (data.type == 3) {
            let mediaInfo = msg.data;
            let channel = channelMap.value.get(code);
            if (msg.type == 0) {
                for (let i = 0; i < deviceList.value.length; i++) {
                    if (code == deviceList.value[i].id) {
                        if (mediaInfo.desktop) {
                            deviceList.value[i].screen = 1;
                        } else {
                            if (displayRemoteDesktop.value) {
                                closeRemoteDesktop();
                                toast.add({ severity: 'error', summary: i18n.t("message.screen_share_stop", code), group: 'tc', life: 3000 });
                            }
                            deviceList.value[i].screen = 0;
                        }
                        if (mediaInfo.video) {
                            deviceList.value[i].video = 1;
                        } else {
                            if (displayRemoteVideo.value) {
                                closeRemoteVideo();
                                toast.add({ severity: 'error', summary: i18n.t("message.video_share_stop", code), group: 'tc', life: 3000 });
                            }
                            deviceList.value[i].video = 0;
                        }

                        break;
                    }
                }
                for (let i = 0; i < localList.value.length; i++) {
                    if (code == localList.value[i].id) {
                        if (mediaInfo.desktop) {
                            localList.value[i].screen = 1;
                        } else {
                            if (displayRemoteDesktop.value) {
                                closeRemoteDesktop();
                                toast.add({ severity: 'error', summary: i18n.t("message.screen_share_stop", code), group: 'tc', life: 3000 });
                            }
                            localList.value[i].screen = 0;
                        }
                        if (mediaInfo.video) {
                            localList.value[i].video = 1;
                        } else {
                            if (displayRemoteVideo.value) {
                                closeRemoteVideo();
                                toast.add({ severity: 'error', summary: i18n.t("message.video_share_stop", code), group: 'tc', life: 3000 });
                            }
                            localList.value[i].video = 0;
                        }
                        break;
                    }
                }
                for (let i = 0; i < myList.value.length; i++) {
                    if (code == myList.value[i].id) {
                        if (mediaInfo.desktop) {
                            myList.value[i].screen = 1;
                        } else {
                            if (displayRemoteDesktop.value) {
                                closeRemoteDesktop();
                                toast.add({ severity: 'error', summary: i18n.t("message.screen_share_stop", code), group: 'tc', life: 3000 });
                            }
                            myList.value[i].screen = 0;
                        }
                        if (mediaInfo.video) {
                            myList.value[i].video = 1;
                        } else {
                            if (displayRemoteVideo.value) {
                                closeRemoteVideo();
                                toast.add({ severity: 'error', summary: i18n.t("message.video_share_stop", code), group: 'tc', life: 3000 });
                            }
                            myList.value[i].video = 0;
                        }
                        break;
                    }
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
                    toast.add({ severity: 'error', summary: i18n.t("message.screen_share_stop", code), group: 'tc', life: 3000 });
                    displayRemote.value = false;
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
                    toast.add({ severity: 'error', summary: i18n.t("message.video_share_stop", code), group: 'tc', life: 3000 });
                    displayRemote.value = false;
                }
            } else if (msg.type == 3) {

            }
        } else if (data.type == 4) {
            let user = codeMap.value.get(code);
            const content = JSON.parse(AES.decrypt(msg.data, transferCode(user.userId, user.channel)));
            let userchats = chatMap.value.get(code)
            if (!userchats) {
                userchats = []
                chatMap.value.set(code, userchats)
            }
            if (msg.type == 0) {
                if (content.type == 0) {
                    if (userchats.length) {
                        let min = content.min;
                        let max = content.max;
                        if (userchats[0].createTime <= min) {
                            if (userchats[userchats.value.length] >= max) {
                                return;
                            } else {
                                min = userchats[userchats.value.length];
                            }
                        }
                        if (userchats[0].createTime > min && userchats[0].createTime < content.max) {
                            max = userchats[0].createTime;
                        }
                        requestChatHistoryInfo(code, min, max);
                    } else {
                        requestChatHistoryInfo(code, content.min, content.max);
                    }
                } else if (content.type == 1) {
                    sendResponsetChatHistory(code, content)
                }
            } else if (msg.type == 1) {
                userchats.push(content);
                if (!displayChatInput.value) {
                    if (!unreadChat.value) {
                        unreadChat.value = '1'
                        unreadChatCount.value++
                    } else {
                        unreadChatCount.value++
                        unreadChat.value = unreadChatCount.value + ''
                    }
                    toast.add({ severity: 'info', summary: i18n.t("message.rec_chat", [code]), group: 'tc', life: 3000 });
                }

            } else if (msg.type == 2) {
                content.reverse().forEach(chat => {
                    userchats.unshift(chat)
                })
            }
        }
    } else {
        handleFileBuffer(code, channelMessage);
    }
}

const requestChatHistoryInfo = (code, min, max) => {
    const content = AES.encrypt(JSON.stringify({ type: 1, min: min, max: max }), transferCode(serverSocket.deviceId, serverSocket.channel));
    const message = messageService.createChatChannelMessage(0, content);
    const channel = channelMap.value.get(code);
    if (channel && channel.readyState == 'open') {
        channel.send(message);
    }
}
const sendChatHistoryInfo = (code) => {
    let userchats = chatMap.value.get(code)
    if (userchats && userchats.length) {
        const min = userchats[0].createTime;
        const max = userchats[userchats.length - 1].createTime;
        const content = AES.encrypt(JSON.stringify({ type: 0, min: min, max: max }), transferCode(serverSocket.deviceId, serverSocket.channel));
        const message = messageService.createChatChannelMessage(0, content);
        const channel = channelMap.value.get(code);
        if (channel && channel.readyState == 'open') {
            channel.send(message);
        }
    }
}
const sendResponsetChatHistory = (code, data) => {
    let userchats = chatMap.value.get(code)
    if (userchats && userchats.length) {
        let sendChat = [];
        userchats.forEach(chat => {
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
const createOffer = (code) => {
    let peer = peerMap.value.get(code);
    let userInfo = codeMap.value.get(code);
    peer.createOffer().then((offer) => {
        let newOffer = JSON.parse(JSON.stringify(offer));
        newOffer["code"] = deviceCode.value;
        serverSocket.send(messageService.createWebRTCMessage(1, code, userInfo.userId, userInfo.channel, JSON.stringify(newOffer)));
        peerMap.value.get(code).setLocalDescription(offer);
    }).catch((err) => {
        console.log(err)
    });
}
const appendDirChildren = (parent, node) => {
    if (node.path.startsWith(parent.path)) {
        if (parent.id == node.id) {
            parent.children = node.children
        } else {
            for (let i = 0; i < parent.children.length; i++) {
                appendDirChildren(parent.children[i], node);
            }
        }
    }
}

const sendNextConfirm = (code) => {
    sendConfirm.value.delete(code);
    let fileInfo = null
    for (let i = 0; i < uploadFiles.value.length; i++) {
        if (uploadFiles.value[i].status == -1 && code == uploadFiles.value[i].device) {
            fileInfo = uploadFiles.value[i];
            break
        }
    }
    if (fileInfo) {
        sendConfirm.value.set(code, fileInfo.id);
        if (channelMap.value.get(code)) {
            channelMap.value.get(code).send(messageService.createFileChannelMessage(1, { device: deviceCode.value, name: fileInfo.name, size: fileInfo.size, format: fileService.readFileFormat(fileInfo.name), id: fileInfo.id, status: 0 }));
        }
    }
}

const handleFileChannel = async (code, channelMessage) => {
    handleFileBuffer(code, channelMessage);
}
const initWebRTC = (data) => {
    let userInfo = codeMap.value.get(data);
    if (!userInfo) {
        return;
    }
    if (peerMap.value.get(data)) {
        closeConnect(data)
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
            serverSocket.send(messageService.createWebRTCMessage(1, data, userInfo.userId, userInfo.channel, JSON.stringify({
                type: '_ice',
                code: deviceCode.value,
                iceCandidate: e.candidate
            })));
        }
    };
    peerMap.value.get(data).ondatachannel = function (e) {
        let receiveChannel = e.channel;
        if (receiveChannel.label == deviceCode.value) {
            receiveChannel.onmessage = (e) => {
                handleChannelMessage(data, e.data);
            }
            receiveChannel.onopen = () => {
                channelMap.value.get(data).send(messageService.createBasicChannelMessage(0, { code: deviceCode.value, time: new Date().getTime() }));
                let fileInfo = [];
                for (let i = 0; i < files.value.length; i++) {
                    let md5 = new Md5();
                    md5.appendAsciiStr(deviceCode.value + ':' + files.value[i].name + ":" + files.value[i].size);
                    let key = md5.end();
                    fileInfo.push({ device: deviceCode.value, name: files.value[i].name, size: files.value[i].size, format: fileService.readFileFormat(files.value[i].name), id: key, status: 0 })
                }
                channelMap.value.get(data).send(messageService.createBasicChannelMessage(1, fileInfo));
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
                if (peerMap.value.get(data) && peerMap.value.get(data).connectionState == 'closed') {
                    changeConectStatus(data, 0);
                    closeConnect(data);
                }
            }
        } else if (receiveChannel.label == 'file') {
            receiveChannel.onmessage = (e) => {
                handleFileChannel(data, e.data);
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
                    changeConectStatus(data, 1);
                    break;
                case "disconnected":
                    changeConectStatus(data, 0);
                    break;
                case "closed":
                    changeConectStatus(data, 0);
                    closeConnect(data);
                    break;
                case "failed":
                    changeConectStatus(data, 0);
                    break;
                default:
                    changeConectStatus(data, 0);
                    closeConnect(data);
                    break;
            }
        }

}
const handleSystemMsg = (body) => {
    if (body.code) {
        toast.add({ severity: 'warn', summary: body.msg, group: 'tc', life: 3000 });
    } else {
        if (!body.type) {
            logout()
        } else if (body.type == 2) {
            const content = JSON.parse(messageService.decodeContent(body.content));
            if (body.msgType == 'user_comment') {
                if (usercomments.value.length) {
                    if (usercomments.value[usercomments.value.length - 1].id < content.id) {
                        usercomments.value.push(content);
                        if (!displayComment.value) {
                            unreadComment.value++
                            commentBadge.value = unreadComment.value + ''
                        }
                    }
                } else {
                    usercomments.value.push(content);
                    if (!displayComment.value) {
                        unreadComment.value++
                        commentBadge.value = unreadComment.value + ''
                    }
                }
            }
        }
    }
}
const handleSubcribe = (body) => {

    if (body.code) {
        toast.add({ severity: 'warn', summary: body.msg, group: 'tc', life: 3000 });
    } else {
        let result = JSON.parse(messageService.decodeContent(body.content));
        if (!body.type) {
            deviceCode.value = result.code;
            CacheService.code.set(result.code);
        } else if (body.type == 1) {
            //添加订阅记录
            let icon = "pc_icon.png";
            if (result.device == 'Android') {
                icon = "phone_icon.png";
            } else if (result.device == 'iPhone' || result.device == 'iOS') {
                icon = "iphone_icon.png";
            }
            if (!codeMap.value.get(result.code)) {
                codeMap.value.set(result.code, result);
                if ('local' == body.msgType) {
                    localList.value.push({ id: result.code, name: result.code, device: result.device, status: 0, online: result.online, icon: icon, screen: 0, video: 0, rtt: '', password: '', files: [] })
                } else if ('myself' == body.msgType) {
                    myList.value.push({ id: result.code, name: result.code, device: result.device, status: 0, online: result.online, icon: icon, screen: 0, video: 0, rtt: '', password: '', files: [] })
                } else {
                    deviceList.value.push({ id: result.code, name: result.code, device: result.device, status: 0, online: result.online, icon: icon, screen: 0, video: 0, rtt: '', password: '', files: [] })
                }
            }
        } else if (body.type == 2) {
            if ('local' == body.msgType) {
                for (let i = 0; i < localList.value.length; i++) {
                    if (result.code == localList.value[i].id) {
                        localList.value.splice(i, 1);
                        break;
                    }
                }
            } else if ('myself' == body.msgType) {
                for (let i = 0; i < myList.value.length; i++) {
                    if (result.code == myList.value[i].id) {
                        myList.value.splice(i, 1);
                        break;
                    }
                }
            } else {
                for (let i = 0; i < deviceList.value.length; i++) {
                    if (result.code == deviceList.value[i].id) {
                        deviceList.value.splice(i, 1);
                        break;
                    }
                }
            }
            codeMap.value.delete(result.code);
        } else if (body.type == 3) {
            codeMap.value.set(result.code, result);
            let update = false;
            if ('local' == body.msgType) {
                for (let i = 0; i < localList.value.length; i++) {
                    if (result.code == localList.value[i].id) {
                        localList.value[i].online = result.online;
                        update = true;
                        break;
                    }
                }
            } else if ('myself' == body.msgType) {
                for (let i = 0; i < myList.value.length; i++) {
                    if (result.code == myList.value[i].id) {
                        myList.value[i].online = result.online;
                        update = true;
                        break;
                    }
                }
            } else {
                for (let i = 0; i < deviceList.value.length; i++) {
                    if (result.code == deviceList.value[i].id) {
                        deviceList.value[i].online = result.online;
                        update = true;
                        break;
                    }
                }
            }
            if (!update) {
                let icon = "pc_icon.png";
                if (result.device == 'Android') {
                    icon = "phone_icon.png";
                } else if (result.device == 'iPhone' || result.device == 'iOS') {
                    icon = "iphone_icon.png";
                }
                if ('local' == body.msgType) {
                    localList.value.push({ id: result.code, name: result.code, device: result.device, status: 0, online: result.online, icon: icon, rtt: '', screen: 0, video: 0, files: [] })
                } else if ('myself' == body.msgType) {
                    myList.value.push({ id: result.code, name: result.code, device: result.device, status: 0, online: result.online, icon: icon, rtt: '', screen: 0, video: 0, files: [] })
                } else {
                    deviceList.value.push({ id: result.code, name: result.code, device: result.device, status: 0, online: result.online, icon: icon, rtt: '', screen: 0, video: 0, files: [] })
                }

            }

        } else if (body.type == 4) {
            CacheService.code.remove();
            serverSocket.send(messageService.createSubscribeMessage(0, null));
        }
    }
}
const handleWebRTC = (body) => {
    let content = messageService.decodeContent(body.content)
    let { type, code, pwd, sdp, iceCandidate } = JSON.parse(content.replace(/\n/g, "\\n").replace(/\r/g, "\\r"));
    if (!body.type) {
        initWebRTC(code);
        if (userSetting.value.requirePwd && userSetting.value.password != '') {
            let userInfo = codeMap.value.get(code);
            if (!userInfo) {
                return;
            }
            if (type === 'apply') {
                serverSocket.send(messageService.createWebRTCMessage(1, code, userInfo.userId, userInfo.channel, JSON.stringify({
                    type: "auth", code: deviceCode.value
                })));
            } else if (type === 'auth') {
                if (pwd && pwd == userSetting.value.password) {
                    peerMap.value.get(code).createOffer().then((offer) => {
                        let newOffer = JSON.parse(JSON.stringify(offer));
                        newOffer["code"] = deviceCode.value;
                        serverSocket.send(messageService.createWebRTCMessage(1, code, body.fromId, body.sub, JSON.stringify(newOffer)));
                        peerMap.value.get(code).setLocalDescription(offer);
                    }).catch((err) => {
                        console.log(err)
                    });
                } else {
                    serverSocket.send(messageService.createWebRTCMessage(1, code, userInfo.userId, userInfo.channel, JSON.stringify({
                        type: "auth", code: deviceCode.value
                    })));
                }
            }
        } else {
            if (!peerMap.value.get(code)) {
                return;
            }
            peerMap.value.get(code).createOffer().then((offer) => {
                let newOffer = JSON.parse(JSON.stringify(offer));
                newOffer["code"] = deviceCode.value;
                serverSocket.send(messageService.createWebRTCMessage(1, code, body.fromId, body.sub, JSON.stringify(newOffer)));
                peerMap.value.get(code).setLocalDescription(offer);
            }).catch((err) => {
                console.log(err)
            });
        }
    }
    if (body.type == -1) {
        if (body.code) {
            toast.add({ severity: 'warn', summary: body.msg, group: 'tc', life: 3000 });
            return;
        }
    }
    if (body.type == 1) {
        if (body.code) {
            console.log(body.msg);
            return;
        }
        if (type === 'auth') {
            toast.add({ severity: 'info', summary: i18n.t("message.auth_req_msg"), group: 'tc', life: 3000 });
            changeConectStatus(code, 3);
            return;
        }
        if (type === 'offer') {
            if (!peerMap.value.get(code)) {
                return;
            }
            peerMap.value.get(code).setRemoteDescription(new RTCSessionDescription({ type, sdp }));
            peerMap.value.get(code).createAnswer().then((answer) => {
                let newAnswer = JSON.parse(JSON.stringify(answer));
                newAnswer["code"] = deviceCode.value;
                serverSocket.send(messageService.createWebRTCMessage(1, code, body.fromId, body.sub, JSON.stringify(newAnswer)));
                peerMap.value.get(code).setLocalDescription(answer);
            }).catch((err) => {
                console.log(err)
            });
            return;
        }
        if (type === 'answer') {
            if (!peerMap.value.get(code)) {
                return;
            }
            peerMap.value.get(code).setRemoteDescription(new RTCSessionDescription({ type, sdp }));
            return;
        }
        if (type == '_ice') {
            if (!peerMap.value.get(code)) {
                return;
            }
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
            changeConectStatus(code, 0);
            closeConnect(code);
        }
    }
}
const createConnection = (deviceId, channel, token) => {
    serverSocket.createConnection(deviceId, channel, token);
}
const socketMsgEvent = (message) => {
    if (!message.type) {
        handleSystemMsg(message.body[0]);
    } else if (message.type == 2) {
        handleCustomMsg(message.body[0]);
    } else if (message.type == 3) {
        handleSubcribe(message.body[0]);
    } else if (message.type == 4) {
        handleWebRTC(message.body[0]);
    }
}
const socketOpenEvent = () => {
    if (CacheService.code.get()) {
        serverSocket.send(messageService.createSubscribeMessage(0, JSON.stringify({ code: CacheService.code.get() })));
    } else {
        serverSocket.send(messageService.createSubscribeMessage(0, null));
    }
    deviceService.getIceServerConfig().then(config => {
        peerConfig.value = config;
    });
    deviceService.showComment(JSON.stringify({ rows: 10 })).then(data => {
        if (data.code == 200) {
            usercomments.value = data.data.reverse()
            if (data.data && data.data.length == 10) {
                commentMore.value = true;
            } else {
                commentMore.value = false;
            }
        }
    });
}
const handleCustomMsg = (body) => {
    if (body.code) {
        toast.add({ severity: 'warn', summary: body.msg, group: 'tc', life: 3000 });
        return;
    } else {
        if (!body.type) {
            const hashId = body.fromId;
            for (let torrentInfo of torrentList.value.values()) {
                if (torrentInfo.id.indexOf(hashId) > -1) {
                    if (!torrentMap.value.get(torrentInfo.id)) {
                        client.add(new Blob([body.content]), torrent => {
                            torrentMap.value.set(hashId, torrent);
                            for (let torrentInfo of torrentList.value.values()) {
                                if (torrentInfo.id == hashId) {
                                    torrentInfo.name = torrent.name;
                                    torrentInfo.totalSize = torrent.length;
                                    for (const file of torrent.files) {
                                        torrentInfo.files.push({ name: file.name, id: file.path, size: file.length, format: fileService.readFileFormat(file.name) });
                                    }
                                    return
                                }
                            }
                        })
                    }
                    return;
                }
            }
        } else if (body.type == 1) {
            let data = JSON.parse(messageService.decodeContent(body.content));
            if (body.msgType == 'info') {
                if (data.ownerId == serverSocket.deviceId) {
                    roomInfo.value.code = data.code
                    roomInfo.value.users = data.users.length
                    roomInfo.value.qr = process.env.VITE_ROOM_URL + '?code=' + data.code;
                    roomInfo.value.password = data.password
                    CacheService.myroom.set(JSON.stringify({ code: data.code, name: data.name, passowrd: data.password, users: data.users.length }));
                } else {
                    CacheService.joinroom.set(JSON.stringify({ code: data.code, name: data.name, passowrd: data.password, users: data.users.length }));
                }
            } else if (body.msgType == 'close') {
                if (data.ownerId == serverSocket.deviceId) {
                    roomInfo.value = { name: '', code: '', password: '', auth: false }
                    CacheService.myroom.remove();
                } else {
                    CacheService.joinroom.remove();
                }
            } else if (body.msgType == 'exit') {
                if (data.ownerId == serverSocket.deviceId) {
                    CacheService.myroom.set(JSON.stringify({ code: data.code, name: data.name, passowrd: data.password, users: data.users.length }));
                } else {
                    CacheService.joinroom.remove();
                }
            }
        }
    }
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

.dock-demo>.p-dock {
    z-index: 1000;
}

.dock-demo .p-menubar {
    padding: 5;
    border-radius: 0;
}

:deep(.p-fileupload-choose) {

    background-color: transparent;
    color: #6366F1;
    border-color: transparent;
    box-shadow: 0 3px 1px -2px rgba(0, 0, 0, 0.2), 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12);
}

#desktopSource {
    position: relative;
    background: #757474;
    width: 200px;
    z-index: 2;
}

#closeDestopSource {
    position: relative;
    z-index: 3;
}

#muteDestopSource {
    position: relative;
    left: 20px;
    z-index: 3;
}

#unmuteDestopSource {
    position: relative;
    left: 20px;
    z-index: 3;
}

#recordDestopSource {
    position: relative;
    left: 40px;
    z-index: 3;
}

#stopRecordDestopSource {
    position: relative;
    left: 40px;
    z-index: 3;
}

#userSource {
    position: relative;
    background: #757474;
    width: 200px;
    z-index: 2;
}

#closeUserSource {
    position: relative;
    z-index: 3;
}

#switchUserSource {
    position: relative;
    left: 20px;
    z-index: 3;
}

#muteUserSource {
    position: relative;
    left: 40px;
    z-index: 3;
}

#unmuteUserSource {
    position: relative;
    left: 40px;
    z-index: 3;
}

#videoDiv {
    position: absolute;
    top: 70px;
    right: 10px;
    width: 200px;
}

#userComentBtn {
    position: absolute;
    top: 50%;
    right: 10px;
}

#closeRemoteDestop {
    position: relative;
    z-index: 3;
}

#recordRemoteDesktop {
    position: relative;
    left: 20px;
    z-index: 3;
}

#stopRecordRemoteDesktop {
    position: relative;
    left: 20px;
    z-index: 3;
}

#closeRemoteSource {
    position: relative;
    z-index: 3;
}

#recordRemoteSource {
    position: relative;
    left: 20px;
    z-index: 3;
}

#stopRecordRemoteSource {
    position: relative;
    left: 20px;
    z-index: 3;
}

#remoteDesktop {
    position: relative;
    background: #757474;
    width: 200px;
}

.video-card>video::-webkit-media-controls-timeline {
    display: none;
}

.video-card>video::-webkit-media-controls-mute-button {
    display: none;
}

.video-card>video::-webkit-media-controls-overlay-play-button {
    display: none;
}

.video-card>video::-webkit-media-controls-play-button {
    display: none;
}

video::-webkit-media-controls #remoteVideo {
    position: relative;
    background: #757474;
    width: 200px;
}

.video-card {
    position: fixed;
    width: 200px;
    z-index: 2;
}

.video-play {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 60%;
    transform: translate(-50%, -50%);
    z-index: 999;
}

#remoteDiv {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 250px;
    transform: translate(-50%, -50%);
}

#torrentVideo {
    position: relative;
    background: #757474;
    width: 100%;
}

#closeTorrentSource {
    position: relative;
    z-index: 3;
}

.user-chat {
    vertical-align: middle;
    bottom: 100px;
    left: 50%;
    position: absolute;
    transform: translate(-50%, 0%);
    z-index: 999;
}

.ai-chat {
    vertical-align: middle;
    bottom: 50%;
    right: -10px;
    position: absolute;
    transform: translate(-50%, -50%);
    z-index: 999;
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

.my-chat {
    text-align: right;
}
</style>