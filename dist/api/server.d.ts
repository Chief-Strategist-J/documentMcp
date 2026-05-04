import express from 'express';
export declare class DocumentServer {
    private app;
    private databaseManager;
    private documentController;
    private apiGenerator;
    constructor(databaseUrl: string);
    private setupMiddleware;
    private setupRoutes;
    private setupErrorHandling;
    start(port?: number): Promise<void>;
    stop(): Promise<void>;
    getApp(): express.Application;
}
//# sourceMappingURL=server.d.ts.map