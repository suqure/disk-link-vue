import { createI18n } from 'vue-i18n'
import zhCN from './local/zh_cn'
import enUS from './local/en_us'

const i18n = createI18n({
  legacy: false,
  locale: 'zh-cn',
  messages: {
    'zh-cn': zhCN,
    'en-us': enUS
  }
})

export default i18n