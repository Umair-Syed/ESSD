'use client';
import { useState, useRef, useEffect } from "react";
import { Modal, Button, Spinner } from "flowbite-react";
import * as serverCardsApi from "@/network/api/serversCardsApis"
import * as databaseApi from "@/network/api/databaseApis"
import { getFilters } from "@/network/api/miscelleneousDataApis";

type IAddServerModalProps = {
    setShowModal: (show: boolean) => void;
    showModal: boolean;
}

export default function AddServerModal(props: IAddServerModalProps) {
    const [hostname, setHostname] = useState('');
    const [formErrors, setFormErrors] = useState<string[]>([]);

    const [isCluster, setIsCluster] = useState(false);
    const [nodeHostnames, setNodeHostnames] = useState(['']);
    const [username2443, setUsername2443] = useState('admin');
    const [password2443, setPassword2443] = useState('1ntell1dot');

    const [showDatabaseInfo, setShowDatabaseInfo] = useState(false);
    const [databaseServerHost, setDatabaseServerHost] = useState('blr-edge-sql01.vcraeng.com');
    const [databaseUsername, setDatabaseUsername] = useState('sa');
    const [databasePassword, setDatabasePassword] = useState('1ntell1dot!');
    const [isLoadingDatabases, setIsLoadingDatabases] = useState(false);
    const [databases, setDatabases] = useState<string[]>([]);
    const [selectedDatabases, setSelectedDatabases] = useState<string[]>([]);

    //Filters
    const [filters, setFilters] = useState<string[]>([]);
    const [selectedFilters, setSelectedFilters] = useState<string[]>([]);


    // will run only once on component mount
    useEffect(() => {
        const fetchFilters = async () => {
            try {
                const filtersData = await getFilters();
                const filterItems = filtersData.filters.map(filter => filter.filter);
                setFilters(filterItems);
            } catch (error) {
                console.error("Error fetching filters:", error);
            }
        };

        fetchFilters();
    }, []);

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
        validateFormFields(
            hostname,
            errors,
            isCluster,
            nodeHostnames,
            username2443,
            password2443,
            showDatabaseInfo,
            databaseServerHost,
            databaseUsername,
            databasePassword,
            selectedDatabases
        );
        if (errors.length > 0) {
            console.error(`validateFormFields Errors: ${errors}`);
            setFormErrors(errors);
            return;
        } else {
            setFormErrors([]);
        }
        //2. send post request to backend
        try {
            console.log(`hostname: ${hostname}, isCluster: ${isCluster}, nodeHostnames: ${nodeHostnames}, username2443: ${username2443}, password2443: ${password2443} showDatabaseInfo: ${showDatabaseInfo}, databaseServerHost: ${databaseServerHost}, databaseUsername: ${databaseUsername}, databasePassword: ${databasePassword}, selectedDatabasess: ${selectedDatabases}`)
            const server = {
                hostname: hostname,
                isCluster: isCluster,
                nodesHostnames: isCluster ? nodeHostnames : [],
                userName2443: username2443,
                password2443: password2443,
                showDatabaseInfo: showDatabaseInfo,
                databaseServerHost: showDatabaseInfo ? databaseServerHost : "",
                databaseUsername: showDatabaseInfo ? databaseUsername : "",
                databasePassword: showDatabaseInfo ? databasePassword : "",
                selectedDatabases: showDatabaseInfo ? selectedDatabases : [],
                selectedFilters: selectedFilters
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


    const fetchDatabases = async () => {
        setIsLoadingDatabases(true);
        try {
            const config = {
                databaseServer: databaseServerHost,
                username: databaseUsername,
                password: databasePassword
            };
            const response = await databaseApi.getDatabaseNames(config);
            const databaseNames = response.databases.map(db => db.name);
            setDatabases(databaseNames);
        } catch (error) {
            console.error('Error fetching databases:', error);
            setFormErrors([(error as any).response.data.message]);
        }
        setIsLoadingDatabases(false);
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
                    className="w-full p-2 mb-8 border border-gray-300 rounded"
                />
                <label className="flex items-center mb-2">
                    <span>Show database info: </span>
                    <input
                        type="checkbox"
                        checked={showDatabaseInfo}
                        onChange={(e) => setShowDatabaseInfo(e.target.checked)}
                        className="ml-2"
                    />
                </label>
                {showDatabaseInfo &&
                    <div className="flex flex-col">
                        <p className="font-light text-xs text-gray-400 mb-2">You need to fill database hostname and credentials. Then select the relevant databases.</p>
                        <input
                            type="text"
                            placeholder="Database Host"
                            defaultValue="blr-edge-sql01.vcraeng.com"
                            onChange={(e) => setDatabaseServerHost(e.target.value)}
                            className="mb-2 w-full p-2 border border-gray-300 rounded"
                        />
                        <input
                            type="text"
                            placeholder="Database Username"
                            defaultValue="sa"
                            onChange={(e) => setDatabaseUsername(e.target.value)}
                            className="mb-2 w-full p-2 border border-gray-300 rounded"
                        />
                        <input
                            type="text"
                            placeholder="Database Password"
                            defaultValue="1ntell1dot!"
                            onChange={(e) => setDatabasePassword(e.target.value)}
                            className="mb-2 w-full p-2 border border-gray-300 rounded"
                        />
                        <div className="flex justify-between">
                            <CheckboxDropdown
                                options={databases}
                                selectedOptions={selectedDatabases}
                                setSelectedOptions={setSelectedDatabases}
                                placeholder={databases.length == 0 ? "Click on Get to fetch databases" : "Select relevant databases"}
                                className="mr-4"
                            />
                            <Button
                                onClick={fetchDatabases}
                                color="dark"
                                disabled={isLoadingDatabases}
                                className="disabled:opacity-100 h-10"
                            >
                                {isLoadingDatabases ? <Spinner aria-label="Small spinner example" color="warning" size="sm" /> : 'Get'}
                            </Button>
                        </div>
                    </div>
                }
                <h2 className="font-semibold mt-8">
                    Tags
                </h2>
                <CheckboxDropdown
                    options={filters}
                    selectedOptions={selectedFilters}
                    setSelectedOptions={setSelectedFilters}
                    placeholder={"Select tags for filtering later"}
                    className="mt-4"
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

function validateFormFields(
    hostname: string,
    errors: string[],
    isCluster: boolean,
    nodeHostnames: string[],
    username2443: string,
    password2443: string,
    showDatabaseInfo: boolean,
    databaseServerHost: string,
    databaseUsername: string,
    databasePassword: string,
    selectedDatabases: string[]
) {
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
    if (showDatabaseInfo) {
        if (databaseServerHost.length === 0) {
            errors.push(`Database server host is required`);
        }
        if (databaseUsername.length === 0) {
            errors.push(`Database username is required`);
        }
        if (databasePassword.length === 0) {
            errors.push(`Database password is required`);
        }
        if (selectedDatabases.length === 0) {
            errors.push(`Please select at least one database`);
        }
    }
}

interface CheckboxDropdownProps {
    options: string[];
    selectedOptions: string[];
    setSelectedOptions: (selectedOptions: string[]) => void;
    placeholder: string;
    className?: string;
}

function CheckboxDropdown({ options, selectedOptions, setSelectedOptions, placeholder, className }: CheckboxDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;
            if (dropdownRef.current && !dropdownRef.current.contains(target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [dropdownRef]);

    const toggleOption = (option: string) => {
        const currentIndex = selectedOptions.indexOf(option);
        const newSelectedOptions = [...selectedOptions];

        if (currentIndex === -1) { // Option not yet selected
            newSelectedOptions.push(option);
        } else { // Option is already selected, need to remove
            newSelectedOptions.splice(currentIndex, 1);
        }

        setSelectedOptions(newSelectedOptions);
    };

    return (
        <div className={`flex-1 ${className}`} ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex justify-between items-center text-gray-700 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 border border-gray-300 w-full"
            >
                <div className="flex flex-wrap gap-2">
                    {selectedOptions.length > 0 ?
                        selectedOptions.map((option, index) => (
                            <span key={index} className="py-1 px-2 bg-gray-200 rounded flex flex-nowrap">{option}</span>
                        )) :
                        <span>{placeholder}</span>
                    }
                </div>
                <svg className="ml-2 w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 12">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5l5 5 5-5" />
                </svg>
            </button>


            {/* Dropdown Menu */}
            {isOpen && (
                <div className="relative">
                    <div className="origin-top-right absolute z-50  mt-2 right-0 w-full bg-white divide-y divide-gray-100 rounded-lg shadow" style={{ maxHeight: '180px', overflowY: 'auto' }}>
                        <ul className="py-2 text-sm text-gray-700">
                            {options.map((item, index) => (
                                <li key={index} className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">
                                    <input
                                        type="checkbox"
                                        checked={selectedOptions.includes(item)}
                                        onChange={() => toggleOption(item)}
                                        className="mr-2"
                                    />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
}