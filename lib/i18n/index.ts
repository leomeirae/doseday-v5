import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import * as Localization from 'expo-localization'

import ptBRCommon from '../../locales/pt-BR/common.json'
import enCommon from '../../locales/en/common.json'
import esCommon from '../../locales/es/common.json'

const resources = {
  'pt-BR': { common: ptBRCommon },
  en: { common: enCommon },
  es: { common: esCommon },
}

const detectedLocale = Localization.getLocales()[0]?.languageTag ?? 'pt-BR'

i18n.use(initReactI18next).init({
  resources,
  lng: detectedLocale,
  fallbackLng: 'pt-BR',
  defaultNS: 'common',
  interpolation: { escapeValue: false },
})

export default i18n
