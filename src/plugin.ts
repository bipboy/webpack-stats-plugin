const INDENT = 2;
const DEFAULT_TRANSFORM = (data) => JSON.stringify(data, null, INDENT);

export class StatsWriterPlugin {
  opts: {filename?: any; fields?: any; stats?: any; transform?: any};

  constructor(opts) {
    opts = opts || {};
    this.opts = {};
    this.opts.filename = opts.filename || 'stats.json';
    this.opts.fields =
      typeof opts.fields !== 'undefined' ? opts.fields : ['assetsByChunkName'];
    this.opts.stats = opts.stats || {};
    this.opts.transform = opts.transform || DEFAULT_TRANSFORM;

    if (
      typeof opts.stats !== 'undefined' &&
      typeof opts.fields === 'undefined'
    ) {
      this.opts.fields = null;
    }
  }

  apply(compiler) {
    if (compiler.hooks) {
      let emitHookSet = false;

      // Capture the compilation and then set up further hooks.
      compiler.hooks.thisCompilation.tap(
        'stats-writer-plugin',
        (compilation) => {
          if (compilation.hooks.processAssets) {
            // See:
            // - https://webpack.js.org/api/compilation-hooks/#processassets
            // - https://github.com/FormidableLabs/webpack-stats-plugin/issues/56
            compilation.hooks.processAssets.tapPromise(
              {
                name: 'stats-writer-plugin',
                stage: compilation.constructor.PROCESS_ASSETS_STAGE_REPORT
              },
              () => this.emitStats(compilation, null)
            );
          } else if (!emitHookSet) {
            // Legacy.
            //
            // Set up the `compiler` level hook only once to avoid multiple
            // calls during `webpack --watch`. (We have to do this here because
            // we can't otherwise detect if `compilation.hooks.processAssets` is
            // available for modern mode.)
            emitHookSet = true;
            compiler.hooks.emit.tapPromise(
              'stats-writer-plugin',
              this.emitStats.bind(this)
            );
          }
        }
      );
    } else {
      compiler.plugin('emit', this.emitStats.bind(this));
    }
  }

  emitStats(curCompiler, callback) {
    // Get stats.
    // The second argument automatically skips heavy options (reasons, source, etc)
    // if they are otherwise unspecified.
    let stats = curCompiler.getStats().toJson(this.opts.stats);

    // Filter to fields.
    if (this.opts.fields) {
      stats = this.opts.fields.reduce((memo, key) => {
        memo[key] = stats[key];
        return memo;
      }, {});
    }

    // Transform to string.
    let err;
    return (
      Promise.resolve()

        // Transform.
        .then(() =>
          this.opts.transform(stats, {
            compiler: curCompiler
          })
        )
        .catch((e) => {
          err = e;
        })

        // Finish up.
        // eslint-disable-next-line max-statements
        .then((statsStr) => {
          // Create simple equivalent of RawSource from webpack-sources.
          const statsBuf = Buffer.from(statsStr || '', 'utf-8');
          const source = curCompiler.webpack
            ? // webpack5+ abstraction
              new curCompiler.webpack.sources.RawSource(statsBuf)
            : // webpack4- manual class
              {
                source() {
                  return statsBuf;
                },
                size() {
                  return statsBuf.length;
                }
              };

          // Handle errors.
          if (err) {
            curCompiler.errors.push(err);
            // eslint-disable-next-line promise/no-callback-in-promise
            if (callback) {
              return void callback(err);
            }
            throw err;
          }

          const filename =
            typeof this.opts.filename === 'function'
              ? this.opts.filename(curCompiler)
              : this.opts.filename;

          // Add to assets.
          if (curCompiler.emitAsset) {
            // Modern method.
            const asset = curCompiler.getAsset(filename);
            if (asset) {
              curCompiler.updateAsset(filename, source);
            } else {
              curCompiler.emitAsset(filename, source);
            }
          } else {
            // Fallback to deprecated method.
            curCompiler.assets[filename] = source;
          }

          // eslint-disable-next-line promise/no-callback-in-promise,promise/always-return
          if (callback) {
            return void callback();
          }
        })
    );
  }
}
