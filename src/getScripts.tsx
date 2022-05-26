import * as React from 'react';

import {getAssets} from './getAssets';

interface StylesheetProps extends React.LinkHTMLAttributes<HTMLLinkElement> {
  href: string;
}
interface ScriptProps extends React.ScriptHTMLAttributes<HTMLScriptElement> {
  src: string;
}

function Script(props: ScriptProps) {
  const {type, defer, ...otherProps} = props;
  const isNoModule = type === 'nomodule';

  const attributes = {
    ...otherProps,
    type: !type || isNoModule ? 'text/javascript' : type,
    defer: type === 'module' ? undefined : defer,
    noModule: isNoModule ? true : undefined
  };

  return <script {...attributes} />;
}

function Stylesheet(props: StylesheetProps) {
  return <link rel="stylesheet" type="text/css" {...props} />;
}

export const getScripts = async (
  file: string,
  entrypoint?: string
): Promise<any> => {
  const manifestAssets = await getAssets(file, entrypoint);
  const scriptsAssets = manifestAssets
    .filter((asset: string, _idx: number) => {
      const regex = new RegExp('[^.]+$');
      const extension = asset?.match(regex);
      return extension?.[0] === 'js';
    })
    .map((asset: string, idx: number) => {
      return (
        <Script
          key={idx}
          crossOrigin="anonymous"
          src={asset}
          type={'text/javascript'}
        />
      );
    });

  const linksAssets = manifestAssets.map((asset: string, idx: number) => {
    return (
      <link
        key={idx}
        rel="preload"
        crossOrigin="anonymous"
        href={asset}
        as={'script'}
      />
    );
  });

  const stylesAssets: any = manifestAssets
    ?.filter((asset: string, _idx: number) => {
      const regex = new RegExp('[^.]+$');
      const extension = asset?.match(regex);
      return extension?.[0] === 'css';
    })
    .map((asset: string, idx: number) => {
      return (
        <Stylesheet
          key={idx}
          data-style-link={asset}
          href={asset}
          crossOrigin="anonymous"
        />
      );
    });

  return {scriptsAssets, linksAssets, stylesAssets};
};
