/* global kiwi:true */
/**
 * Configuration module for the radio plugin
 * This file defines default settings and provides functions to manage configuration
 */

// Base path of the script (determined at runtime)
// Configuration base name used for namespacing settings
export const basePath = getBasePath();
export const configBase = 'plugin-radio';

/**
 * Default configuration settings
 * @type {Object}
 */
export const defaultConfig = {
    url: `${basePath}${configBase}/stations.json`, // URL to the stations JSON file
    volume: 0.4, // Default volume level (40%)
    starred: [], // List of starred stations (empty by default)
    active: '', // Currently active station (none by default)
    showWave: true, // Show waveform visualization (enabled by default)
    autoPlay: false, // Autoplay stations (disabled by default)
    forceVolume: false, // Force volume level (disabled by default)
    reloadOnOpen: false, // Reload stations on open (disabled by default)
    forceShowClose: false, // Force show close button (disabled by default)
    animationsFPS: 30,
};

/**
 * Set default configuration values
 * @param {Object} kiwi - The KiwiIRC instance
 */
export function setDefaults(kiwi) {
    kiwi.setConfigDefaults(configBase, defaultConfig);
}

/**
 * Get or set a configuration setting
 * @param {string} name - The setting name
 * @param {*} newVal - The new value (optional)
 * @returns {*} - The current value of the setting
 */
/**
 * Get or set a configuration setting
 * @param {string} name - The setting name
 * @param {*} newVal - The new value (optional)
 * @returns {*} - The current value of the setting
 */
export function setting(name, newVal) {
    return kiwi.state.setting([configBase, name].join('.'), newVal);
}

/**
 * Get a configuration setting
 * @param {string} name - The setting name
 * @returns {*} - The value of the setting
 */
export function getSetting(name) {
    return kiwi.state.getSetting(['settings', configBase, name].join('.'));
}

/**
 * Set a configuration setting
 * @param {string} name - The setting name
 * @param {*} value - The value to set
 * @returns {*} - The new value of the setting
 */
export function setSetting(name, value) {
    return kiwi.state.setSetting(['settings', configBase, name].join('.'), value);
}

/**
 * Get the base path of the script
 * @returns {string} - The base path
 */
/**
 * Get the base path of the script
 * @returns {string} - The base path
 */
function getBasePath() {
    const scripts = document.getElementsByTagName('script');
    const scriptPath = scripts[scripts.length - 1].src;
    return scriptPath.substr(0, scriptPath.lastIndexOf('/') + 1);
}
