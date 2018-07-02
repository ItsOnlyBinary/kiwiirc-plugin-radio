import RadioControls from './components/RadioControls.vue';
import StationList from './components/StationList.vue';

import state from './libs/state.js';

// eslint-disable-next-line no-undef
kiwi.plugin('radio', (kiwi) => {
	setDefaultSetting('url', 'stations.json');
	setDefaultSetting('starred', []);
	setDefaultSetting('active', '');

	// get our station list
	let xmlhttp = new XMLHttpRequest();
	xmlhttp.onload = (temp) => {
		if (xmlhttp.status !== 200) {
			console.error('plugin-radio: error loading stations list');
			return
		}
		try {
			let json = JSON.parse(xmlhttp.responseText);
			if (json) { // TODO is this needed, should component creation be moved out of the try for better erroring
				state.stationList = json;
				if (state.stationList.length > 0) {
					// stations loaded successfully lets add our components
					let RadioControlsComponent = new kiwi.Vue(RadioControls);
				    RadioControlsComponent.$mount();
				   	kiwi.addUi('browser', RadioControlsComponent.$el);
					kiwi.addView('StationList', StationList);
				}
			}
		} catch (err) {
			console.error('plugin-radio: error parsing stations list');
		}
	}
	xmlhttp.open('GET', kiwi.state.setting('plugin-radio.url'), true);
	xmlhttp.send();

	function setDefaultSetting(name, val) {
		if (!kiwi.state.getSetting('settings.plugin-radio.' + name)) {
			kiwi.state.setSetting('settings.plugin-radio.' + name, val);
		}
	}
});
