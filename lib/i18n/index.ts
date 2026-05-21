import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import * as Localization from 'expo-localization'

import ptBRAccount from '../../locales/pt-BR/account.json'
import ptBRAuth from '../../locales/pt-BR/auth.json'
import ptBRCheckin from '../../locales/pt-BR/checkin.json'
import ptBRCommon from '../../locales/pt-BR/common.json'
import ptBRDashboard from '../../locales/pt-BR/dashboard.json'
import ptBRFinances from '../../locales/pt-BR/finances.json'
import ptBRInsights from '../../locales/pt-BR/insights.json'
import ptBRMedication from '../../locales/pt-BR/medication.json'
import ptBROnboarding from '../../locales/pt-BR/onboarding.json'
import ptBRProfile from '../../locales/pt-BR/profile.json'
import ptBRQuickLog from '../../locales/pt-BR/quickLog.json'
import ptBRReport from '../../locales/pt-BR/report.json'
import ptBRSettings from '../../locales/pt-BR/settings.json'
import ptBRSubscription from '../../locales/pt-BR/subscription.json'
import ptBRWeight from '../../locales/pt-BR/weight.json'
import ptBRNotifications from '../../locales/pt-BR/notifications.json'
import ptBRWelcome from '../../locales/pt-BR/welcome.json'

import enAccount from '../../locales/en/account.json'
import enAuth from '../../locales/en/auth.json'
import enCheckin from '../../locales/en/checkin.json'
import enCommon from '../../locales/en/common.json'
import enDashboard from '../../locales/en/dashboard.json'
import enFinances from '../../locales/en/finances.json'
import enInsights from '../../locales/en/insights.json'
import enMedication from '../../locales/en/medication.json'
import enOnboarding from '../../locales/en/onboarding.json'
import enProfile from '../../locales/en/profile.json'
import enQuickLog from '../../locales/en/quickLog.json'
import enReport from '../../locales/en/report.json'
import enSettings from '../../locales/en/settings.json'
import enSubscription from '../../locales/en/subscription.json'
import enWeight from '../../locales/en/weight.json'
import enNotifications from '../../locales/en/notifications.json'
import enWelcome from '../../locales/en/welcome.json'

import esAccount from '../../locales/es/account.json'
import esAuth from '../../locales/es/auth.json'
import esCheckin from '../../locales/es/checkin.json'
import esCommon from '../../locales/es/common.json'
import esDashboard from '../../locales/es/dashboard.json'
import esFinances from '../../locales/es/finances.json'
import esInsights from '../../locales/es/insights.json'
import esMedication from '../../locales/es/medication.json'
import esOnboarding from '../../locales/es/onboarding.json'
import esProfile from '../../locales/es/profile.json'
import esQuickLog from '../../locales/es/quickLog.json'
import esReport from '../../locales/es/report.json'
import esSettings from '../../locales/es/settings.json'
import esSubscription from '../../locales/es/subscription.json'
import esWeight from '../../locales/es/weight.json'
import esNotifications from '../../locales/es/notifications.json'
import esWelcome from '../../locales/es/welcome.json'

const resources = {
  'pt-BR': {
    account: ptBRAccount,
    auth: ptBRAuth,
    checkin: ptBRCheckin,
    common: ptBRCommon,
    dashboard: ptBRDashboard,
    finances: ptBRFinances,
    insights: ptBRInsights,
    medication: ptBRMedication,
    onboarding: ptBROnboarding,
    profile: ptBRProfile,
    quickLog: ptBRQuickLog,
    report: ptBRReport,
    settings: ptBRSettings,
    subscription: ptBRSubscription,
    weight: ptBRWeight,
    notifications: ptBRNotifications,
    welcome: ptBRWelcome,
  },
  en: {
    account: enAccount,
    auth: enAuth,
    checkin: enCheckin,
    common: enCommon,
    dashboard: enDashboard,
    finances: enFinances,
    insights: enInsights,
    medication: enMedication,
    onboarding: enOnboarding,
    profile: enProfile,
    quickLog: enQuickLog,
    report: enReport,
    settings: enSettings,
    subscription: enSubscription,
    weight: enWeight,
    notifications: enNotifications,
    welcome: enWelcome,
  },
  es: {
    account: esAccount,
    auth: esAuth,
    checkin: esCheckin,
    common: esCommon,
    dashboard: esDashboard,
    finances: esFinances,
    insights: esInsights,
    medication: esMedication,
    onboarding: esOnboarding,
    profile: esProfile,
    quickLog: esQuickLog,
    report: esReport,
    settings: esSettings,
    subscription: esSubscription,
    weight: esWeight,
    notifications: esNotifications,
    welcome: esWelcome,
  },
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
