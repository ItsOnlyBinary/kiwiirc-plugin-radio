# Radio Plugin for [Kiwi IRC](https://github.com/kiwiirc/kiwiirc)

This plugin allows irc users to listen to radio stations

#### Dependencies

* node (https://nodejs.org/)
* yarn (https://yarnpkg.com/)

#### Building the source

```console
$ yarn
$ yarn build
```

The plugin will then be built into `dist/plugin-radio.js`

#### Configuration

```json5
"plugin-radio": {
    // URL path to stations.json file
    "url": "//example.com/stations.json",

    // Initial volume for the player (0 to 1)
    "volume": 0.4,

    // Station names to be starred by default
    "starred": [],

    // Initially selected station name
    // if none is set then a random station will be selected on play
    "active": "",

    // Should the equalizer wave be shown behind the station name
    "showWave": true,

    // Should the radio start playing soon as the user connects
    // note: this option does require some user interaction on the page
    "autoPlay": false,

    // Force the above volume to be set on startup overriding any volume
    // saved from the last session
    "forceVolume": false,

    // Reload stations.json when opening the stations browser
    "reloadOnOpen": false,

    // Force show the close button on stations browser
    "forceShowClose": false,
}
```

#### Creating stations.json

you will need to find your own stations for the stations.json file, there are many resources on the internet to help with this.

The stations.json file should be structured as follows:

```json5
[
    {
        "name": "Rock Radio",
        "image": "https://example.com/rock_radio.jpg",
        "source": "http://example.com/rock_stream_mp3",
        "description": "Many head banging tunes"
    },
    {
        "name": "Classic Radio",
        "image": "https://example.com/kiwi_classic_radio.jpg",
        "source": "http://example.com/kiwi_classic_stream.mp3",
        "description": "Relax to some classical music"
    }
]
```

## License

[Licensed under the Apache License, Version 2.0](LICENSE).
