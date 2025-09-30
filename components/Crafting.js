// components/Crafting.js (VERSÃO FINAL com Chaves de Tradução Corrigidas)
import baseStyles from '../styles/ModalBase.module.css';
import craftStyles from '../styles/Crafting.module.css';
import { FaFlask } from 'react-icons/fa';
import { useMemo } from 'react';
import { t } from '../lib/i18n';

// A lista de receitas agora usa chaves de tradução simplificadas
const recipesData = [
  { 
    id: 'craft_seringa_avancada', 
    nameKey: 'craft_luck_syringe_name', 
    descriptionKey: 'craft_luck_syringe_desc',
    image: '/img/laboratory/LuckSyringe.png',
    result: { itemId: 'freeSpins', quantity: 5, type: 'CONSUMABLE' }, 
    ingredients: [
      { itemId: 'INSULINE', quantity: 55 }, 
      { itemId: 'ZOLGENSMA', quantity: 25 }
    ] 
  },
  { 
    id: 'craft_kit_medico_5d', 
    nameKey: 'craft_nft_kit_5d_name', 
    descriptionKey: 'craft_nft_kit_5d_desc',
    image: '/img/laboratory/NFTKit5Days.png',
    result: { itemId: 'item_nft_life_extension_5d', quantity: 1, type: 'APPLICABLE' }, 
    ingredients: [
      { itemId: 'VIDA', quantity: 10 }, 
      { itemId: 'LUXUTURNA', quantity: 30 },
      { itemId: 'ZYNTEGLO', quantity: 15 }
    ] 
  },
  { 
    id: 'craft_kit_medico_15d', 
    nameKey: 'craft_nft_kit_15d_name', 
    descriptionKey: 'craft_nft_kit_15d_desc',
    image: '/img/laboratory/NFTKit15Days.png',
    result: { itemId: 'item_nft_life_extension_15d', quantity: 1, type: 'APPLICABLE' },
    ingredients: [
      { itemId: 'VIDA', quantity: 100 },
      { itemId: 'ZYNTEGLO', quantity: 100 },
      { itemId: 'LUXUTURNA', quantity: 100 },
      { itemId: 'ZOLGENSMA', quantity: 100 },
      { itemId: 'INSULINE', quantity: 100 },
    ] 
  },
  { 
    id: 'craft_acelerador_tempo_3m_3x', 
    nameKey: 'craft_super_accelerator_name', 
    descriptionKey: 'craft_super_accelerator_desc',
    image: '/img/laboratory/SuperAccelerator3.png',
    result: { itemId: 'item_timeAccelerator_3m_3x', quantity: 1, type: 'EQUIPMENT' }, 
    ingredients: [
      { itemId: 'INSULINE', quantity: 100 }, 
      { itemId: 'ZOLGENSMA', quantity: 75 },
      { itemId: 'LUXUTURNA', quantity: 20 }
    ]
  },
  { 
    id: 'craft_boost_automatico_10m', 
    nameKey: 'craft_auto_boost_name', 
    descriptionKey: 'craft_auto_boost_desc',
    image: '/img/laboratory/AutoBoost10m.png',
    result: { itemId: 'item_ad_free_boost_10m', quantity: 1, type: 'EQUIPMENT' },
    ingredients: [
      { itemId: 'VIDA', quantity: 5 },
      { itemId: 'ZYNTEGLO', quantity: 50 }
    ]
  },
  { 
    id: 'craft_pacote_giros_50', 
    nameKey: 'craft_spin_pack_name', 
    descriptionKey: 'craft_spin_pack_desc',
    image: '/img/laboratory/SpinPack50Units.png',
    result: { itemId: 'freeSpins', quantity: 50, type: 'CONSUMABLE' },
    ingredients: [
      { itemId: 'VIDA', quantity: 50 },
      { itemId: 'ZYNTEGLO', quantity: 200 },
      { itemId: 'LUXUTURNA', quantity: 200 },
    ]
  },
];

export default function Crafting({ playerResources, onCraft, onClose, lang }) {
  const recipes = useMemo(() => {
    return recipesData.map(recipe => ({
        ...recipe,
        name: t(recipe.nameKey, lang),
        description: t(recipe.descriptionKey, lang),
    }));
  }, [lang]);

  if (!playerResources) return null;

  return (
    <div className={baseStyles.modalOverlay} onClick={onClose}>
      <div className={`${baseStyles.modalContent} ${baseStyles.modalContentRed}`} onClick={e => e.stopPropagation()}>
        <div className={baseStyles.header}>
          <h2 className={baseStyles.title}><FaFlask /> {t('crafting_title', lang)}</h2>
          <button onClick={onClose} className={baseStyles.closeButton}>&times;</button>
        </div>
        <div className={baseStyles.mainContent}>
          <p style={{textAlign: 'center', marginTop: '-1rem', color: 'var(--text-secondary)'}}>{t('crafting_subtitle', lang)}</p>
          <div className={craftStyles.recipeList}>
            {recipes.map(recipe => {
              const canCraft = recipe.ingredients.every(ing => (playerResources[ing.itemId] || 0) >= ing.quantity);
              return (
                <div key={recipe.id} className={craftStyles.recipeCard}>
                  <div className={craftStyles.itemImageContainer}>
                    <img src={recipe.image} alt={recipe.name} className={craftStyles.itemImage} />
                  </div>
                  <div className={craftStyles.details}>
                    <div className={craftStyles.recipeHeader}>
                      <h3>{recipe.name}</h3>
                      <p className={craftStyles.createsText}>
                        {t('creates', lang)}: <span>{recipe.result.quantity}x {t(recipe.result.itemId, lang)}</span>
                      </p>
                    </div>
                    <p className={craftStyles.description}>{recipe.description}</p>
                    <div className={craftStyles.ingredientsList}>
                      {recipe.ingredients.map(ing => {
                        const userAmount = playerResources[ing.itemId] || 0;
                        const progress = Math.min((userAmount / ing.quantity) * 100, 100);
                        return (
                          <div key={ing.itemId} className={craftStyles.ingredient}>
                            <span>{ing.itemId}</span>
                            <div className={craftStyles.progress}><div className={craftStyles.progressBar} style={{ width: `${progress}%` }}></div></div>
                            <span className={craftStyles.progressText}>{Math.floor(userAmount)} / {ing.quantity}</span>
                          </div>
                        );
                      })}
                    </div>
                    <button onClick={() => onCraft(recipe.id)} disabled={!canCraft} className={baseStyles.button}>
                      {canCraft ? t('craft_item', lang) : t('insufficient_resources', lang)}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}