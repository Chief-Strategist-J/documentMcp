/**
 * Express server setup for document management API
 * Follows DRY principles - centralized server configuration
 * Follows strict null handling and typecasting rules
 */
export declare class DocumentServer {
    private app;
    private databaseManager;
    private documentController;
    private documentGenerator;
    constructor(databaseUrl: string);
    /**
     * Sets up express middleware
     */
    private setupMiddleware;
    /**
     * Sets up API routes
     */
    private setupRoutes;
    catch(error: any): void;
}
//# sourceMappingURL=server_broken.d.ts.map