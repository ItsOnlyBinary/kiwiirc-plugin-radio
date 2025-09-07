/* global kiwi:true */
/**
 * Main plugin file for the radio functionality
 * This file sets up the plugin, initializes the API, and registers UI components
 */
import RadioBrowser from '@/components/RadioBrowser.vue';
import RadioControls from '@/components/RadioControls.vue';
import useRadioAPI from '@/libs/useRadioAPI';

import translations from '@/translations';
import * as config from '@/config.js';

/**
 * Initialize the plugin
 * @param {Object} kiwi - The KiwiIRC instance
 * @param {Object} logger - Logger instance
 */
kiwi.plugin('template', (kiwi, logger) => {
    // Set default configuration values
    config.setDefaults(kiwi);

    // Add translations for the plugin
    kiwi.addTranslations(config.configBase, translations);

    // Initialize the radio API
    const radioAPI = useRadioAPI();
    kiwi.pluginRadio = radioAPI;

    // Register UI components
    kiwi.addUi('browser', RadioControls, { props: { radioAPI } });
    kiwi.addView('RadioStations', RadioBrowser, { radioAPI });

    /**
     * Handle user interaction to enable autoplay
     */
    /**
     * Handle user interaction to enable autoplay
     * Removes event listeners after first interaction and checks for autoplay
     */
    const handleUserInteracted = () => {
        // Remove event listeners after first interaction
        kiwi.off('document.clicked', handleUserInteracted);
        kiwi.off('document.keydown', handleUserInteracted);

        if (radioAPI.userInteracted) {
            // User already interacted
            return;
        }

        // Mark user as interacted and check for autoplay
        radioAPI.userInteracted = true;
        radioAPI.checkForAutoplay();
    };

    // Add event listeners for user interaction
    // These listeners trigger the handleUserInteracted function
    // They are removed after the first interaction to prevent multiple triggers
    kiwi.on('document.clicked', handleUserInteracted);
    kiwi.on('document.keydown', handleUserInteracted);
});
