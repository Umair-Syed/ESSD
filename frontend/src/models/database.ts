/** This is for databases in AddServerModal */

interface Database {
    name: string;
}
export interface DatabaseResponse {
    databases: Database[];
}