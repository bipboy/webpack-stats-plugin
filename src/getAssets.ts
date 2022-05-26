import fs from 'fs/promises';
import jsonFile from 'jsonfile';

interface Assets {
  assets: {
    name: string;
  }[];
}

const pathExists = (path: string) =>
  fs
    .access(path)
    .then(() => true)
    .catch(() => false);

let loadPromise: Promise<ReturnType<any>> | null = null;

export const getAssets = (
  manifestPath: string,
  entrypoint?: string
): Promise<string[]> => {
  if (loadPromise) {
    return loadPromise;
  }

  const resolvedPath = manifestPath;
  loadPromise = pathExists(resolvedPath)
    .then(() => {
      return jsonFile.readFile(resolvedPath, {});
    })
    .then((manifest: {namedChunkGroups: {}; publicPath: string}) => {
      const entrypointGroups = manifest.namedChunkGroups;
      let entrypointGroup: Assets | null = null;

      for (let key in entrypointGroups) {
        if (key === entrypoint) {
          entrypointGroup = entrypointGroups[key];
        }
      }

      return entrypointGroup?.assets.map(
        (asset: {name: string}) => `${manifest.publicPath}${asset.name}`
      );
    })
    .catch((err) => console.error(err));

  return loadPromise;
};
