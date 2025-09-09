/* global kiwi:true */
/**
 * Configuration module for the radio plugin.
 * Defines default settings and provides functions to manage configuration.
 */

// Base path of the script (determined at runtime)
// Configuration base name for namespacing settings
export const basePath = getBasePath();
export const configBase = 'plugin-radio';

/**
 * Default configuration settings.
 * @type {Object}
 */
export const defaultConfig = {
    url: `${basePath}${configBase}/stations.json`,
    volume: 0.4,
    starred: [],
    active: '',
    showWave: true,
    showMarquee: true,
    autoPlay: false,
    forceVolume: false,
    reloadOnOpen: false,
    forceShowClose: false,
    animationsFPS: 30,
};

/**
 * Set default configuration values.
 * @param {Object} kiwi - The KiwiIRC instance
 */
export function setDefaults(kiwi) {
    kiwi.setConfigDefaults(configBase, defaultConfig);
}

/**
 * Get or set a configuration setting.
 * @param {string} name - The setting name
 * @param {*} newVal - The new value (optional)
 * @returns {*} - The current value of the setting
 */
export function setting(name, newVal) {
    return kiwi.state.setting([configBase, name].join('.'), newVal);
}

/**
 * Get a configuration setting.
 * @param {string} name - The setting name
 * @returns {*} - The value of the setting
 */
export function getSetting(name) {
    return kiwi.state.getSetting(['settings', configBase, name].join('.'));
}

/**
 * Set a configuration setting.
 * @param {string} name - The setting name
 * @param {*} value - The value to set
 * @returns {*} - The new value of the setting
 */
export function setSetting(name, value) {
    return kiwi.state.setSetting(['settings', configBase, name].join('.'), value);
}

/**
 * Get the base path of the script.
 * @returns {string} - The base path
 */
function getBasePath() {
    const scripts = document.getElementsByTagName('script');
    const scriptPath = scripts[scripts.length - 1].src;
    return scriptPath.substr(0, scriptPath.lastIndexOf('/') + 1);
}
