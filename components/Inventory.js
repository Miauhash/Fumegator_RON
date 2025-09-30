// components/Inventory.js (VERSÃO ATUALIZADA COM TRADUÇÕES)

import baseStyles from '../styles/ModalBase.module.css';
import invStyles from '../styles/Inventory.module.css';
import { FaBoxOpen } from 'react-icons/fa';
import { t } from '../lib/i18n';

// Lista dos `itemId` dos itens que podem ser vendidos no mercado.
const SELLABLE_ITEMS = [
    'timeAccelerator_3m_3x', 
    'ad_free_boost_10m'
    // Adicione aqui outros IDs de itens de crafting que você queira que sejam vendáveis
];

export default function Inventory({ inventory, onEquip, onSell, onClose, lang }) {
  const items = Object.values(inventory);
  return (
    <div className={baseStyles.modalOverlay} onClick={onClose}>
      <div className={baseStyles.modalContent} onClick={e => e.stopPropagation()}>
        <div className={baseStyles.header}>
          <h2 className={baseStyles.title}><FaBoxOpen /> {t('inventory_title', lang)}</h2>
          <button onClick={onClose} className={baseStyles.closeButton}>&times;</button>
        </div>
        <div className={baseStyles.mainContent}>
          <div className={invStyles.inventoryGrid}>
            {items.length > 0 ? items.map(item => (
              <div key={item.id} className={invStyles.inventoryItem}>
                {item.image && (
                  <div className={invStyles.itemImageContainer}>
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className={invStyles.itemImage}
                      onError={(e) => { e.currentTarget.src = '/img/tokens/default.png'; }}
                    />
                  </div>
                )}
                <div className={invStyles.itemDetails}>
                  <h3 className={invStyles.itemName}>{item.name} (x{item.quantity})</h3>
                  <p className={invStyles.itemDescription}>{item.description}</p>
                  <div className={invStyles.buttonGroup}>
                    <button onClick={() => onEquip(item)} className={baseStyles.button}>{t('equip_button', lang)}</button>
                    {onSell && SELLABLE_ITEMS.includes(item.id) && (
                       <button onClick={() => onSell(item)} className={`${baseStyles.button} ${baseStyles.buttonSecondary}`}>
                         {t('sell_button', lang)}
                       </button>
                    )}
                  </div>
                </div>
              </div>
            )) : <p style={{textAlign: 'center', gridColumn: '1 / -1'}}>{t('inventory_empty', lang)}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}