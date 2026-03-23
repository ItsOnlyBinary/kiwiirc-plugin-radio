/* global kiwi:true */

/**
 * Main plugin file for the radio functionality.
 * Sets up the plugin, initialises the API, and registers UI components.
 */
import RadioBrowser from '@/components/RadioBrowser.vue';
import RadioControls from '@/components/RadioControls.vue';
import useRadioAPI from '@/libs/useRadioAPI';

import translations from '@/translations';
import * as config from '@/config.js';

/**
 * Initialise the plugin.
 * @param {Object} kiwi - The KiwiIRC instance
 * @param {Object} logger - Logger instance
 */
kiwi.plugin('plugin-radio', (kiwi, logger) => {
    // Set default configuration values
    config.setDefaults(kiwi);

    // Add translations for the plugin
    kiwi.addTranslations(config.configBase, translations);

    import(/* webpackMode: "eager" */ '@/libs/iconLibrary');

    /* eslint-disable no-undef */
    if (module?.hot) {
        module.hot.accept('./libs/iconLibrary.js', () => {
            import(/* webpackMode: "eager" */ '@/libs/iconLibrary');
        });
    }
    /* eslint-enable no-undef */

    // Initialise the radio API
    const radioAPI = useRadioAPI();
    kiwi.pluginRadio = radioAPI;

    // Register UI components
    kiwi.addUi('browser', RadioControls, { props: { radioAPI } });
    kiwi.addView('RadioStations', RadioBrowser, { radioAPI });

    /**
     * Handle user interaction to enable autoplay.
     * Removes event listeners after first interaction and checks for autoplay.
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
    kiwi.on('document.clicked', handleUserInteracted);
    kiwi.on('document.keydown', handleUserInteracted);
});
