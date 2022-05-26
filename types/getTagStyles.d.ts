import { PathLike } from 'fs';
export declare const getTagStyles: (path: PathLike, file: string, entrypoint?: string | undefined) => Promise<{
    inlineTagStyles: Promise<string[]>;
}>;
