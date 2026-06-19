import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { fetchPricingConfig, getDefaultPricingConfig } from '../utils/pricingConfig';

/**
 * Custom hook to manage paywall display logic
 * @returns {Object} Paywall state and control functions
 */
export const usePaywall = () => {
  const [pricingConfig, setPricingConfig] = useState(getDefaultPricingConfig());
  const [paywallConfig, setPaywallConfig] = useState({
    isOpen: false,
    type: null,
    expiresIn: getDefaultPricingConfig().defaultOfferHours,
    userName: ''
  });

  const user = useSelector((state) => state.authReducer.user);
  const chatTokens = user?.chat_tokens || 0;
  const remainingChats = user?.remaining_chats || 0;
  const interestedTokens = user?.interested_tokens || 0;
  const superInterestedTokens = user?.super_interested_tokens || 0;
  const isFemale = user?.gender === 'female';
  const isMale = user?.gender === 'male';

  useEffect(() => {
    let isActive = true;

    const loadPricingConfig = async () => {
      try {
        const config = await fetchPricingConfig(user?.token);
        if (isActive) {
          setPricingConfig(config);
        }
      } catch (error) {
        if (isActive) {
          console.log("[PAYWALL DEBUG] Failed to load pricing config", error?.message);
          setPricingConfig(getDefaultPricingConfig());
        }
      }
    };

    loadPricingConfig();

    return () => {
      isActive = false;
    };
  }, [user?.token]);

  /**
   * Show paywall for men when viewing first date profiles
   * @param {string} userName - Name of the user being interacted with
   * @param {number} expiresIn - Hours until offer expires
   * @param {boolean} forceShow - Force show the paywall regardless of token check
   */
  const showMenFirstDatePaywall = (userName = 'Someone', expiresIn = 48, forceShow = false) => {
    if (!pricingConfig?.paywallEnabled) {
      return;
    }

    console.log('[PAYWALL DEBUG] showMenFirstDatePaywall called', {
      isMale,
      interestedTokens,
      superInterestedTokens,
      forceShow,
      userName
    });
    
    if (!isMale) {
      console.log('[PAYWALL DEBUG] Not male, skipping paywall');
      return;
    }
    
    // If forceShow is true, always show the paywall
    if (forceShow) {
      console.log('[PAYWALL DEBUG] SHOWING PAYWALL (FORCED)');
      setPaywallConfig({
        isOpen: true,
        type: 'men_first_date',
        expiresIn: expiresIn || pricingConfig?.defaultOfferHours || 48,
        userName
      });
      return;
    }
    
    // Otherwise, show if user has no tokens at all
    if (interestedTokens === 0 && superInterestedTokens === 0) {
      console.log('[PAYWALL DEBUG] SHOWING PAYWALL (NO TOKENS)');
      setPaywallConfig({
        isOpen: true,
        type: 'men_first_date',
        expiresIn: expiresIn || pricingConfig?.defaultOfferHours || 48,
        userName
      });
    } else {
      console.log('[PAYWALL DEBUG] NOT showing paywall - user has tokens:', {
        interestedTokens,
        superInterestedTokens
      });
    }
  };

  /**
   * Show paywall for ladies when they run out of chats
   */
  const showLadiesChatPaywall = (expiresIn = 32, forceShow = false) => {
    if (!pricingConfig?.paywallEnabled) return;
    if (!isFemale) return;
    
    if (forceShow || (chatTokens === 0 && remainingChats === 0)) {
      setPaywallConfig({
        isOpen: true,
        type: 'ladies_chat',
        expiresIn: expiresIn || pricingConfig?.defaultOfferHours || 32,
        userName: ''
      });
    }
  };

  /**
   * Close the paywall
   */
  const closePaywall = () => {
    setPaywallConfig({
      isOpen: false,
      type: null,
      expiresIn: pricingConfig?.defaultOfferHours || 48,
      userName: ''
    });
  };

  /**
   * Check if user should see paywall automatically
   */
  const shouldShowPaywall = () => {
    if (isMale && interestedTokens === 0 && superInterestedTokens === 0) {
      return true;
    }
    if (isFemale && chatTokens === 0 && remainingChats === 0) {
      return true;
    }
    return false;
  };

  return {
    paywallConfig,
    pricingConfig,
    showMenFirstDatePaywall,
    showLadiesChatPaywall,
    closePaywall,
    shouldShowPaywall
  };
};
