import RadioBrowser from '@/components/RadioBrowser.vue';
import RadioControls from '@/components/RadioControls.vue';
import useRadioAPI from '@/libs/useRadioAPI';

import translations from '@/translations';

import * as config from '@/config.js';

// eslint-disable-next-line no-undef
kiwi.plugin('radio', (kiwi, log) => {
    config.setDefaults(kiwi);

    kiwi.addTranslations(config.configBase, translations);

    const radioAPI = useRadioAPI();
    kiwi.pluginRadio = radioAPI;

    kiwi.addUi('browser', RadioControls, { props: { radioAPI } });

    kiwi.addView('RadioStations', RadioBrowser, { radioAPI });

    const handleUserInteracted = () => {
        kiwi.off('document.clicked', handleUserInteracted);
        kiwi.off('document.keydown', handleUserInteracted);

        if (radioAPI.userInteracted) {
            // user already interacted
            return;
        }
        radioAPI.userInteracted = true;
        radioAPI.checkForAutoplay();
    };

    kiwi.on('document.clicked', handleUserInteracted);
    kiwi.on('document.keydown', handleUserInteracted);
});
