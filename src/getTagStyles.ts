import {PathLike} from 'fs';
import fs from 'fs/promises';
import {getAssets} from './getAssets';

function inlineTagStyle(path: PathLike, asset: string): Promise<string> {
  return fs
    .readFile(`${path}/${asset}`, 'utf8')
    .then(
      (data) =>
        `<style id="__serverStyle__" type="text/css" data-chunk="${asset}">${data}</style>`
    );
}

export const getTagStyles = async (
  path: PathLike,
  file: string,
  entrypoint?: string
) => {
  const manifestAssets = await getAssets(file, entrypoint);

  const inlineTagStylesArray: Promise<string>[] = manifestAssets
    ?.filter((asset: string, _idx: number) => {
      const regex = new RegExp('[^.]+$');
      const extension = asset?.match(regex);
      return extension?.[0] === 'css';
    })
    .map((asset: string, _idx: number) => {
      return inlineTagStyle(path, asset);
    });

  const inlineTagStyles = Promise.all(inlineTagStylesArray);

  return {inlineTagStyles};
};
