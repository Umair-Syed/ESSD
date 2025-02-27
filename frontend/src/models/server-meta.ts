export interface ServerMeta {
    _id: string,
    hostname: string,
    isCluster: boolean,
    nodesHostnames: string[],
    userName2443: string,
    password2443: string,
    usernameSSH: string,
    passwordSSH: string,
    showDatabaseInfo: boolean,
    databaseServerHost: string,
    databaseUsername: string,
    databasePassword: string,
    selectedDatabases: string[],
    selectedFilters: string[],
    createdAt: string,
    updatedAt: string,
}