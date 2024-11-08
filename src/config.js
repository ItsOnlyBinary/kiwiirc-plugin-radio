/* global kiwi:true */

export const basePath = getBasePath();
export const configBase = 'plugin-radio';

export const defaultConfig = {
    url: basePath + configBase + '/stations.json',
    volume: 0.4,
    starred: [],
    active: '',
    showWave: true,
    autoPlay: false,
    forceVolume: false,
    reloadOnOpen: false,
    forceShowClose: false,
};

export function setDefaults(kiwi) {
    kiwi.setConfigDefaults(configBase, defaultConfig);
}

export function setting(name, newVal) {
    return kiwi.state.setting([configBase, name].join('.'), newVal);
}

export function getSetting(name) {
    return kiwi.state.getSetting(['settings', configBase, name].join('.'));
}

export function setSetting(name, value) {
    return kiwi.state.setSetting(['settings', configBase, name].join('.'), value);
}

function getBasePath() {
    const scripts = document.getElementsByTagName('script');
    const scriptPath = scripts[scripts.length - 1].src;
    return scriptPath.substr(0, scriptPath.lastIndexOf('/') + 1);
}
