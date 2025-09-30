// lib/missionConfig.js
import { t } from './i18n';
export const getMissionConfig = (lang = 'en') => ({
'mission_1h': { name: t('expedition_short', lang), duration: 3600, rewardToken: 'INSULINE', rewardAmount: 0.1 },
'mission_4h': { name: t('expedition_medium', lang), duration: 14400, rewardToken: 'INSULINE', rewardAmount: 0.5 },
'mission_12h': { name: t('expedition_long', lang), duration: 43200, rewardToken: 'INSULINE', rewardAmount: 1 },
'mission_24h': { name: t('expedition_elite', lang), duration: 86400, rewardToken: 'INSULINE', rewardAmount: 2.2 },
'mission_48h': { name: t('expedition_deep', lang), duration: 172800, rewardToken: 'INSULINE', rewardAmount: 4.5 },
});