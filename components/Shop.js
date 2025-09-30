// components/Shop.js (VERSÃO FINAL E FUNCIONAL)
import baseStyles from '../styles/ModalBase.module.css';
import shopStyles from '../styles/Shop.module.css';
import { FaShoppingCart } from 'react-icons/fa';
import { useMemo } from 'react';
import { t } from '../lib/i18n';

export const getShopItems = (lang) => [
  // Aceleradores de Tempo
  { id: 'time_accelerator_5m', name: t('shop_item_accel_5m_name', lang), description: t('shop_item_accel_desc', lang), price: 15000.0, currency: 'INSU', type: 'EQUIPMENT', buffName: 'timeAccelerator', duration: 300000, image: '/img/shop/itens/vacina.gif' },
  { id: 'time_accelerator_15m', name: t('shop_item_accel_15m_name', lang), description: t('shop_item_accel_desc', lang), price: 10000.0, currency: 'ZOLG', type: 'EQUIPMENT', buffName: 'timeAccelerator', duration: 900000, image: '/img/shop/itens/vacina.gif' },
  { id: 'time_accelerator_60m', name: t('shop_item_accel_60m_name', lang), description: t('shop_item_accel_desc', lang), price: 1500.0, currency: 'VIDA', type: 'EQUIPMENT', buffName: 'timeAccelerator', duration: 3600000, image: '/img/shop/itens/vacina.gif' },
  // Boosts Automáticos
  { id: 'ad_free_boost_10m', name: t('shop_item_boost_10m_name', lang), description: t('shop_item_boost_desc', lang), price: 500.0, currency: 'VIDA', type: 'EQUIPMENT', buffName: 'adFreeBoost', duration: 600000, image: '/img/shop/itens/kit.gif' },
  { id: 'ad_free_boost_20m', name: t('shop_item_boost_20m_name', lang), description: t('shop_item_boost_desc', lang), price: 9.5, currency: 'RON', type: 'EQUIPMENT', buffName: 'adFreeBoost', duration: 1200000, image: '/img/shop/itens/kit.gif' },
  { id: 'ad_free_boost_40m', name: t('shop_item_boost_40m_name', lang), description: t('shop_item_boost_desc', lang), price: 15.55, currency: 'RON', type: 'EQUIPMENT', buffName: 'adFreeBoost', duration: 2400000, image: '/img/shop/itens/kit.gif' },
  // Auto Play
  { id: 'auto_play_unlock_insu', name: t('shop_item_auto_play_name', lang), description: t('shop_item_auto_play_desc', lang), price: 15000.0, currency: 'INSU', type: 'PERMANENT_BUFF', buffName: 'autoClick', image: '/img/shop/itens/chip.gif' },
  { id: 'auto_play_unlock_vida', name: t('shop_item_auto_play_name', lang), description: t('shop_item_auto_play_desc', lang), price: 1000.0, currency: 'VIDA', type: 'PERMANENT_BUFF', buffName: 'autoClick', image: '/img/shop/itens/chip.gif' },
  { id: 'auto_play_unlock_ron', name: t('shop_item_auto_play_name', lang), description: t('shop_item_auto_play_desc', lang), price: 100.0, currency: 'RON', type: 'PERMANENT_BUFF', buffName: 'autoClick', image: '/img/shop/itens/chip.gif' },
  // Giros de Roleta
  { id: 'spins_10', name: t('shop_item_spins_10_name', lang), description: t('shop_item_spins_10_desc', lang), price: 1000.0, currency: 'ZOLG', type: 'INVENTORY', itemName: 'freeSpins', amount: 10, image: '/img/shop/itens/sorte.gif' },
  { id: 'spins_100', name: t('shop_item_spins_100_name', lang), description: t('shop_item_spins_100_desc', lang), price: 500.0, currency: 'VIDA', type: 'INVENTORY', itemName: 'freeSpins', amount: 100, image: '/img/shop/itens/sorte.gif' },
  { id: 'spins_1000', name: t('shop_item_spins_1000_name', lang), description: t('shop_item_spins_1000_desc', lang), price: 55.5, currency: 'RON', type: 'INVENTORY', itemName: 'freeSpins', amount: 1000, image: '/img/shop/itens/sorte.gif' },
  // Passes Premium
  { id: 'premium_pass_5d', name: t('shop_item_premium_5d_name', lang), description: t('shop_item_premium_5d_desc', lang), price: 10.0, currency: 'RON', type: 'TIMED_BUFF', buffName: 'premiumPass', duration: 432000000, image: '/img/shop/itens/premium.gif' },
  { id: 'premium_pass_15d', name: t('shop_item_premium_15d_name', lang), description: t('shop_item_premium_15d_desc', lang), price: 20.0, currency: 'RON', type: 'TIMED_BUFF', buffName: 'premiumPass', duration: 1296000000, image: '/img/shop/itens/premium.gif' },
  { id: 'premium_pass_50d', name: t('shop_item_premium_50d_name', lang), description: t('shop_item_premium_50d_desc', lang), price: 50.0, currency: 'RON', type: 'TIMED_BUFF', buffName: 'premiumPass', duration: 4320000000, image: '/img/shop/itens/premium.gif' },
];

export default function Shop({ balances, onPurchase, onClose, lang }) {
  const shopItems = useMemo(() => getShopItems(lang), [lang]);

  return (
    <div className={baseStyles.modalOverlay} onClick={onClose}>
      <div className={`${baseStyles.modalContent} ${shopStyles.shopModal}`} onClick={e => e.stopPropagation()}>
        <div className={baseStyles.header}>
          <h2 className={baseStyles.title}><FaShoppingCart /> Item Shop</h2>
          <button onClick={onClose} className={baseStyles.closeButton}>&times;</button>
        </div>
        <div className={baseStyles.mainContent}>
          <div className={shopStyles.shopGrid}>
            {shopItems.map((item, index) => {
              const canAfford = (balances[item.currency] || 0) >= item.price;
              return (
                <div key={`${item.id}-${index}`} className={shopStyles.shopItem}>
                  <div className={shopStyles.itemImageContainer}>
                    <img src={item.image} alt={item.name} className={shopStyles.itemImage} />
                  </div>
                  <h3>{item.name}</h3>
                  <p>{item.description}</p>
                  <div className={shopStyles.priceTag}>
                    <span>{item.price.toFixed(4)}</span> <span>{item.currency}</span>
                  </div>
                  <button onClick={() => onPurchase(item)} className={baseStyles.button}>
                    Buy
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}