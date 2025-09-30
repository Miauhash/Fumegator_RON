// hooks/useRewardedAd.js

import { useState, useEffect, useCallback } from 'react';

// ATENÇÃO: SUBSTITUA ESTE ID PELO SEU ID DE BLOCO DE ANÚNCIOS RECOMPENSADOS DO GOOGLE.
// SEM ISSO, OS ANÚNCIOS NUNCA IRÃO CARREGAR E O BOTÃO DE BOOST FICARÁ DESABILITADO.
const AD_UNIT_ID = 'ca-pub-XXXXXXXXXXXXXXXX/YYYYYYYYYY'; 

export const useRewardedAd = ({ onReward }) => {
  const [rewardedAd, setRewardedAd] = useState(null);
  const [isAdReady, setIsAdReady] = useState(false);

  const loadAd = useCallback(() => {
    if (window.googletag && window.googletag.apiReady) {
      window.googletag.cmd.push(() => {
        const ad = window.googletag.rewarded(AD_UNIT_ID);
        
        ad.addEventListener('rewarded', (event) => {
          console.log('Anúncio recompensado!', event.detail.reward);
          if (onReward) {
            onReward(event.detail.payload);
          }
        });

        ad.addEventListener('load', () => {
          console.log('Anúncio com recompensa carregado.');
          setIsAdReady(true);
        });
        
        ad.addEventListener('fail', (event) => {
            console.error('Falha ao carregar anúncio:', event.detail.error);
            setIsAdReady(false);
            setTimeout(loadAd, 30000); 
        });

        ad.addEventListener('close', () => {
            console.log('Anúncio fechado. Carregando o próximo.');
            setIsAdReady(false);
            loadAd();
        });

        setRewardedAd(ad);
      });
    }
  }, [onReward]);

  useEffect(() => {
    loadAd();
  }, [loadAd]);

  const showAd = (payload) => {
    if (isAdReady && rewardedAd) {
      rewardedAd.makeRewardedVisible({ payload });
    } else {
      console.warn('Tentou mostrar o anúncio, mas ele não estava pronto.');
    }
  };

  return { showAd, isAdReady };
};