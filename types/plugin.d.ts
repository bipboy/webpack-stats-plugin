export declare class StatsWriterPlugin {
    opts: {
        filename?: any;
        fields?: any;
        stats?: any;
        transform?: any;
    };
    constructor(opts: any);
    apply(compiler: any): void;
    emitStats(curCompiler: any, callback: any): Promise<undefined>;
}
