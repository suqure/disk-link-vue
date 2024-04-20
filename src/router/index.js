import { createRouter, createWebHashHistory } from 'vue-router'; 

const router = createRouter({
    history: createWebHashHistory(),
    routes: [
        {
            path: '/',
            name: 'desktop',
            component: () => import('@/views/Desktop.vue')
        },
        {
            path: '/room',
            name: 'room',
            component: () => import('@/views/Room.vue')
        },
        {
            path: '/file',
            name: 'file',
            component: () => import('@/views/ShareFile.vue')
        }  
    ]
});

export default router;
