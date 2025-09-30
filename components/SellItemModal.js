// components/SellItemModal.js (VERSÃO ATUALIZADA COM TRADUÇÕES)

import { useState, useEffect } from 'react';
import baseStyles from '../styles/ModalBase.module.css';
import sellStyles from '../styles/SellItemModal.module.css';
import { t } from '../lib/i18n';

export default function SellItemModal({ isOpen, onClose, item, onConfirm, lang }) {
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(1.0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
      setPrice(1.0);
      setError('');
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen || !item) {
    return null;
  }

  const handleConfirm = async () => {
    if (quantity <= 0 || quantity > item.quantity) {
      setError(t('quantity_error', lang, { max: item.quantity }));
      return;
    }
    if (price <= 0) {
      setError(t('price_error', lang));
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    await onConfirm(item.id, quantity, price);
    
    setIsSubmitting(false);
  };
  
  const totalVIDA = (quantity * price).toFixed(4);

  return (
    <div className={baseStyles.modalOverlay} onClick={onClose}>
      <div className={`${baseStyles.modalContent}`} onClick={e => e.stopPropagation()}>
        <div className={baseStyles.header}>
          <h2 className={baseStyles.title}>{t('list_item_for_sale', lang)}</h2>
          <button onClick={onClose} className={baseStyles.closeButton}>&times;</button>
        </div>
        <div className={baseStyles.mainContent}>
          <div className={sellStyles.itemInfo}>
            <img src={item.image || '/img/tokens/default.png'} alt={item.name} className={sellStyles.itemImage} />
            <div className={sellStyles.itemDetails}>
              <h3>{item.name}</h3>
              <p>{t('you_have', lang, { quantity: item.quantity })}</p>
            </div>
          </div>

          <div className={sellStyles.form}>
            <div className={sellStyles.formGroup}>
              <label htmlFor="quantity">{t('quantity_to_sell', lang)}</label>
              <input
                type="number"
                id="quantity"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10)))}
                min="1"
                max={item.quantity}
                className={sellStyles.input}
              />
            </div>
            <div className={sellStyles.formGroup}>
              <label htmlFor="price">{t('price_per_unit_vida_label', lang)}</label>
              <input
                type="number"
                id="price"
                value={price}
                onChange={(e) => setPrice(parseFloat(e.target.value))}
                step="0.01"
                min="0.01"
                className={sellStyles.input}
              />
            </div>
          </div>
          
          <div className={sellStyles.summary}>
            <p>{t('total_will_receive', lang, { total: totalVIDA })}</p>
            <small>{t('market_fee_note', lang)}</small>
          </div>

          {error && <p className={sellStyles.error}>{error}</p>}

          <div className={baseStyles.modalActions}>
             <button onClick={onClose} className={`${baseStyles.button} ${baseStyles.buttonSecondary}`}>
               {t('cancel_button', lang)}
             </button>
             <button onClick={handleConfirm} disabled={isSubmitting} className={baseStyles.button}>
               {isSubmitting ? t('listing_button_progress', lang) : t('confirm_listing_button', lang)}
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}