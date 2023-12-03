import { useState } from "react";
import { Modal } from "flowbite-react";
import { Button } from "flowbite-react";
import * as serverCardsApi from "@/network/api/serversCardsApis"

type IAddServerModalProps = {
    setShowModal: (show: boolean) => void;
    showModal: boolean;
}

export default function AddServerModal(props: IAddServerModalProps) {
    const [hostname, setHostname] = useState('');
    const [isCluster, setIsCluster] = useState(false);
    const [nodeHostnames, setNodeHostnames] = useState(['']);
    const [username2443, setUsername2443] = useState('admin');
    const [password2443, setPassword2443] = useState('password');
    const [formErrors, setFormErrors] = useState<string[]>([]);

    // To handle adding more node hostname fields
    const addNodeHostnameField = () => {
        setNodeHostnames([...nodeHostnames, '']);
    };

    // To update specific node hostname in the array
    const updateNodeHostname = (index: number, value: string) => {
        const updatedHostnames = [...nodeHostnames];
        updatedHostnames[index] = value;
        setNodeHostnames(updatedHostnames);
    };

    async function handleAddServer() {
        //1. validate fields
        const errors: string[] = [];
        validateFormFields(hostname, errors, isCluster, nodeHostnames, username2443, password2443);
        if (errors.length > 0) {
            console.error(`validateFormFields Errors: ${errors}`);
            setFormErrors(errors);
            return;
        }else {
            setFormErrors([]);
        }
        //2. send post request to backend
        try {
            console.log(`hostname: ${hostname}, isCluster: ${isCluster}, nodeHostnames: ${nodeHostnames}, username2443: ${username2443}, password2443: ${password2443}`)
            const server = {
                hostname: hostname,
                isCluster: isCluster,
                nodesHostnames: isCluster ? nodeHostnames : [],
                userName2443: username2443,
                password2443: password2443
            };

            const response = await serverCardsApi.addServerMetaInfo(server);
            props.setShowModal(false);
            alert(`Success: ${response.hostname} added successfully!`);
        } catch (error) {
            console.error(error);
            alert(error);
        }
        //3. Verify response
        //4. close modal
        //4. If success, show toast, else show error toast
        //5. If success, refresh servers list asynchronously
    };


    return (
        <Modal
            show={props.showModal}
            onClose={() => props.setShowModal(false)}
        >
            <Modal.Header>
                Add server
                {formErrors.length > 0 &&
                    <div>
                        <span className="text-red-700 text-sm font-semibold">Errors:</span>
                        {formErrors.map((error, index) => (
                            <p key={index} className="text-red-700 text-sm font-light">{error}</p>
                        ))}
                    </div>

                }
            </Modal.Header>
            <Modal.Body>
                <input
                    type="text"
                    placeholder="Hostname"
                    value={hostname}
                    onChange={(e) => setHostname(e.target.value)}
                    className="mb-4 w-full p-2 border border-gray-300 rounded"
                />

                <label className="flex items-center mb-8">
                    <span>Is cluster?</span>
                    <input
                        type="checkbox"
                        checked={isCluster}
                        onChange={(e) => setIsCluster(e.target.checked)}
                        className="ml-2"
                    />
                </label>
                {isCluster && nodeHostnames.map((nodeHostname, index) => (
                    <div key={index} className="flex items-center mb-2 gap-3">
                        <input
                            type="text"
                            placeholder="Node hostname"
                            value={nodeHostname}
                            onChange={(e) => updateNodeHostname(index, e.target.value)}
                            className="mr-2 p-2 border border-gray-300 rounded flex-grow"
                        />
                        {index === nodeHostnames.length - 1 && (
                            <button
                                onClick={addNodeHostnameField}
                                className="p-2 rounded-full bg-gray-500 text-white"
                            >
                                <span className="p-2">+</span>
                            </button>
                        )}
                    </div>
                ))}

                <h2 className="font-semibold mb-4 mt-8">
                    {hostname ? `${hostname}:2443` : 'Hostname:2443'} credentials
                </h2>

                <input
                    type="text"
                    placeholder="username"
                    defaultValue="admin"
                    onChange={(e) => setUsername2443(e.target.value)}
                    className="mb-2 w-full p-2 border border-gray-300 rounded"
                />
                <input
                    type="text"
                    placeholder="password"
                    defaultValue="1ntell1dot"
                    onChange={(e) => setPassword2443(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded"
                />
            </Modal.Body>
            <Modal.Footer className="flex justify-end space-x-2">
                <Button
                    onClick={() => props.setShowModal(false)}
                    color="gray"
                >
                    Cancel
                </Button>
                <Button
                    onClick={handleAddServer}
                    color="dark"
                >
                    Add
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

function validateFormFields(hostname: string, errors: string[], isCluster: boolean, nodeHostnames: string[], username2443: string, password2443: string) {
    const hostnameRegex = /^[a-zA-Z0-9][a-zA-Z0-9-_]{0,61}([a-zA-Z0-9]{0,1}\.[a-zA-Z0-9-_]{1,61})*\.[a-zA-Z]{2,6}$/;

    if (!hostname) {
        errors.push('Hostname is required');
    } else {
        if (!hostnameRegex.test(hostname)) {
            errors.push('Hostname format is invalid');
        }
    }
    if (isCluster) {
        let nodeHostnamesAreEmpty = true;
        nodeHostnames.forEach(nodeName => {
            if (nodeName.length > 0) {
                nodeHostnamesAreEmpty = false;
                if (!hostnameRegex.test(nodeName)) {
                    errors.push(`Node hostname ${nodeName} format is invalid`);
                }
            }
        });
        if (nodeHostnamesAreEmpty) {
            errors.push('At least one node valid hostname is required. If it is not cluster then uncheck "Is cluster?".');
        }
    }
    if (username2443.length === 0) {
        errors.push(`Username for ${hostname}:2443 is required`);
    }
    if (password2443.length === 0) {
        errors.push(`Password for ${hostname}:2443 is required`);
    }
}
