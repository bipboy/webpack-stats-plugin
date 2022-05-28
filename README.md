# Stats Resolver for React SSR

Stats resolver function for Webpack

## Usage

```
npm i @bipboys/webpack-stats-plugin
```

### Use "StatsWriterPlugin" for export assets to \*.json

```ts
const {StatsWriterPlugin} = require('@bipboys/webpack-stats-plugin');

module = {
  // webpack config
  plugins: [
    new StatsWriterPlugin({
      filename: 'stats.json',
      fields: [
        'errors',
        'warnings',
        'assets',
        'hash',
        'publicPath',
        'outputPath',
        'namedChunkGroups'
      ]
    })
  ]
};
```

### Somewhere in your server:

```tsx
import {getScripts} from '@bipboys/webpack-stats-plugin';

// Get Scripts and Links from stats.json
const {scriptsAssets, stylesAssets} = await getScripts(manifest, assetName);
```
