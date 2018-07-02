# Radio for [Kiwi IRC] (https://kiwiirc.com)

This plugin allows irc users to listen to radio stations

#### Dependencies
* node (https://nodejs.org/)
* yarn (https://yarnpkg.com/)

#### Building the source

```console
$ yarn
$ yarn build
```

The plugin will then be built into dist/plugin-radio.js

#### Confguring stations.json

you will need to find your own stations to add to the list, there are many resources on the internet to help with this.


The url to the stations list can be provided via client.json

```
"plugin-radio": {
    "url": "http://exmaple.com/stations.json"
}
```

## License

[Licensed under the Apache License, Version 2.0](LICENSE).
