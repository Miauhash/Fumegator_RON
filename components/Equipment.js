// components/Equipment.js
import styles from '../styles/Equipment.module.css';
import { t } from '../lib/i18n';
import { useMemo } from 'react';

const getBuffInfo = (lang) => ({
  timeAccelerator: { name: t('buff_time_accelerator', lang), icon: '/img/shop/power_boost.png' },
  adFreeBoost: { name: t('buff_ad_free_boost', lang), icon: '/img/shop/boost_auto.png' },
  autoClick: { name: t('buff_auto_click', lang), icon: '/img/shop/auto_play.png' },
  premiumPass: { name: t('buff_premium_pass', lang), icon: '/img/icons/trophy.png' },
});

const formatTimeLeft = (expirationTimestamp, lang) => {
  const now = Date.now();
  if (expirationTimestamp < now) return t('expired', lang);
  const remaining = expirationTimestamp - now;
  const minutes = Math.floor(remaining / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
};

export default function Equipment({ activeBuffs, permanentBuffs, explodingSlots, lang }) {
  const buffInfo = useMemo(() => getBuffInfo(lang), [lang]);

  const safeActiveBuffs = activeBuffs || {};
  const safePermanentBuffs = permanentBuffs || {};
  const safeExplodingSlots = explodingSlots || new Set();
  
  const slotOrder = ['timeAccelerator', 'adFreeBoost', 'autoClick', 'premiumPass'];
  
  const activeTimedBuffs = Object.entries(safeActiveBuffs)
    .filter(([key, value]) => value > Date.now())
    .map(([key, value]) => ({ name: key, expiresAt: value }));

  const activePermanentBuffs = Object.keys(safePermanentBuffs)
    .filter(key => safePermanentBuffs[key] === true)
    .map(key => ({ name: key, isPermanent: true }));

  const allActiveBuffs = [...activeTimedBuffs, ...activePermanentBuffs];

  const slots = slotOrder.map(buffName => {
    return allActiveBuffs.find(b => b.name === buffName) || null;
  });
  
  while (slots.length < 4) {
    slots.push(null);
  }

  return (
    <div className={styles.equipmentContainer}>
      <h4>{t('active_equipment', lang)}</h4>
      <div className={styles.slotsRow}>
        {slots.slice(0, 4).map((buff, index) => {
          const isExploding = buff && safeExplodingSlots.has(buff.name);
          const info = buff ? buffInfo[buff.name] : null;
          return (
            <div 
              key={index} 
              className={`${styles.equipmentSlot} ${isExploding ? styles.explosionEffect : ''}`}
            >
              {buff && info ? (
                <>
                  <img src={info.icon} alt={info.name} className={styles.buffIcon} title={info.name} />
                  {buff.expiresAt && <div className={styles.timeLeft}>{formatTimeLeft(buff.expiresAt, lang)}</div>}
                </>
              ) : (
                <div className={styles.emptySlot}></div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}