import ServerDataModel  from "../../models/server-data";
import axios from 'axios';

type ICreateServerMetaBody = {
    hostname: string,
    isCluster: boolean,
    nodesHostnames: string[],
    userName2443: string,
    password2443: string,
}

export default async function updateServicesDataTask(serverMeta: ICreateServerMetaBody) {
    try {
        const servicesData = await getServicesData(serverMeta);

        await ServerDataModel.findOneAndUpdate(
            { hostname: serverMeta.hostname },
            { 
                services: servicesData,
            },
            { upsert: true, new: true }
        );
    } catch (error) {
        console.error(`Failed to update data for server ${serverMeta.hostname}:`, error);
    }
}

async function getServicesData(serverMeta: ICreateServerMetaBody) {
    const url = `https://${serverMeta.hostname}:2443/configuration-service-admin/cluster/nodes?namespace=/serviceRegistry&_=1700746112434`;
    const username = serverMeta.userName2443;
    const password = serverMeta.password2443;
    
    const base64Credentials = Buffer.from(username + ':' + password).toString('base64');

    const headers = {
        'Authorization': 'Basic ' + base64Credentials
    };
    
    try {
        const response = await axios.get(url, { headers: headers });
        console.log(`Data: ${JSON.stringify(response.data, null, 2).slice(0, 100)}`);
        // TODO: Parse and get array of services with their status (up/down)
    } catch (e) {
        // TODO: get array of services with all down status
        console.error('Error 2443:', e)
    }
}