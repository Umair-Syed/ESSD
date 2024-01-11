import ServerDataModel from "../../models/server-data";
import axios from 'axios';

interface ICreateServerMetaBody {
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
                $set: { services: servicesData.services }
            },
            { upsert: true, new: true }
        );
    } catch (error) {
        console.error(`Failed to update services data for server ${serverMeta.hostname}:`, error);
    }
}

interface NodeStatus {
    nodeName: string;
    status: 'up' | 'down';
}

interface ServiceStatus {
    name: string;
    nodes: NodeStatus[];
}

interface ServicesData {
    services: ServiceStatus[];
}

async function getServicesData(serverMeta: ICreateServerMetaBody): Promise<ServicesData> {
    const url = `https://${serverMeta.hostname}:2443/configuration-service-admin/cluster/nodes?namespace=/serviceRegistry&_=1700746112434`;
    const username = serverMeta.userName2443;
    const password = serverMeta.password2443;

    const base64Credentials = Buffer.from(username + ':' + password).toString('base64');

    const headers = {
        'Authorization': 'Basic ' + base64Credentials
    };

    try {
        const response = await axios.get(url, { headers: headers, timeout: 3000 });
        console.log(`Data: ${JSON.stringify(response.data, null, 2).substring(0, 1000)}`);
        if (response && response.data) {
            return parseServiceData(response.data);
        }
        return { services: [] };
    } catch (e) {
        console.error('Error 2443:', e);
        return { services: [] };
    }
}

interface ServiceNodeData {
    [nodeId: string]: string;
}

interface ServerResponseData {
    data: {
        [serviceName: string]: ServiceNodeData;
    };
    status: string;
}

function parseServiceData(responseData: ServerResponseData): ServicesData {
    const services: ServiceStatus[] = [];
    /**
     * Example of resonseData:
     * data : {
     *  "patient-touch": {
     *    "6b689635-a13b-4eb2-9d1a-e76ff593b1f0": "{\"payload\":{\"hostname\":\"}
     *  }
     * }
     */
    if (responseData.status && responseData.status === "success") {
        for (const serviceName in responseData.data) {
            const serviceNodes = responseData.data[serviceName];

            const nodes: NodeStatus[] = [];

            for (const nodeId in serviceNodes) {
                try {
                    const nodeData = JSON.parse(serviceNodes[nodeId]);
                    let status: ('up' | 'down') = 'down';
                    let nodeName = serviceName;

                    if (nodeData.payload) {
                        nodeName = nodeData.payload.hostname;
                        status = "up";
                    }

                    const nodeExists = nodes.some(node => node.nodeName === nodeName);

                    if (!nodeExists) {
                        nodes.push({
                            nodeName: nodeName,
                            status: status
                        });
                    }
                } catch (e) {
                    console.error("Error parsing node data for service:", serviceName, "Node ID:", nodeId, e);
                }
            }
            services.push({ name: serviceName, nodes: nodes });
        }
    }

    const parsedData: ServicesData = { services };

    // console.log("Parsed Data:", JSON.stringify(parsedData, null, 2));

    return parsedData;
}
