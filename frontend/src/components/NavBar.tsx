"use client"; // This file is client-side only
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { usePathname } from 'next/navigation'
import { Button } from "flowbite-react";
import AddServerModal from "./AddServerModal";
import EnterFullScreenIcon from '@/assets/full-screen.svg';
import ExitFullScreenIcon from '@/assets/exit-full-screen.svg';
import { IoIosAddCircleOutline, IoIosRemoveCircleOutline } from "react-icons/io";
import { addFilter as addFilterApi } from '@/network/api/miscelleneousDataApis';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getFilters, deleteFilter } from "@/network/api/miscelleneousDataApis";
import WarningModal from "./WarningModal";


export default function NavBar() {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState("All servers");
    const dropdownRef = useRef<HTMLDivElement>(null);
    const pathname = usePathname()
    const [showAddServerModal, setShowAddServerModal] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [newFilter, setNewFilter] = useState("");
    const [filters, setFilters] = useState<string[]>(["All servers"]);
    const [showFilterDeleteModal, setShowFilterDeleteModal] = useState(false);
    const [filterToDelete, setFilterToDelete] = useState('');

    const handleClickOutside = (event: Event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
            setDropdownOpen(false);
        }
    };

    // will run only once on component mount
    useEffect(() => {
        const fetchFilters = async () => {
            try {
                const filtersData = await getFilters();
                const fetchedFilterItems = filtersData.filters.map(filter => filter.filter);
                // All servers filter is always present. When user choose All filter, send GET request without filter.
                const updatedDropdownItems = [...filters, ...fetchedFilterItems];
                setFilters(updatedDropdownItems);
            } catch (error) {
                console.error("Error fetching filters:", error);
            }
        };

        fetchFilters();
    }, []);

    // Handle click outside of dropdown menu
    useEffect(() => {
        if (dropdownOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dropdownOpen]);


    const handleFullScreenToggle = () => {
        const navbar = document.querySelector('.navbar');

        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setIsFullScreen(true);
            if (navbar) {
                navbar.classList.add('navbar-hidden');
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
                setIsFullScreen(false);
                if (navbar) {
                    navbar.classList.remove('navbar-hidden');
                }
            }
        }
    };

    // Show navbar when mouse is near the top of the screen
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const navbar = document.querySelector('.navbar');
            if (navbar && isFullScreen && e.clientY < 100) { // 100px from the top
                navbar.classList.remove('navbar-hidden');
            } else if (navbar && isFullScreen && e.clientY > 100 && !dropdownOpen) {
                navbar.classList.add('navbar-hidden');
            }
        };

        window.addEventListener('mousemove', handleMouseMove);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, [isFullScreen, dropdownOpen]);


    const navLinks = [
        { href: "/", text: "Home" },
        { href: "/present", text: "Present" },
    ];

    const primaryNavItems = (href: string) =>
        `py-4 px-2 text-gray-500 text-xl hover:text-primary transition duration-300 ${pathname === href ? "text-grey-800 font-extrabold" : "font-semibold"}`;

    const handleFilterClick = (item: string) => {
        setSelectedFilter(item);
        setDropdownOpen(false);
    };

    const handleFilterRemove = async (filter: string) => {
        try {
            const response = await deleteFilter(filter);
            toast.warning(`Filter ${filter} deleted.`, {
                position: "bottom-left",
                autoClose: 3000,
            });
            const filterItems = response.filters.map(filter => filter.filter);
            setFilters(filterItems);
        } catch (error) {
            console.error("Error adding filter:", error);
            alert(`Error adding filter. Error: ${((error as any).message || "Unknown error")}`);
            // Handle the error appropriately - maybe show a message to the user
        }
        setNewFilter("");
    };

    const handleFilterAdd = async () => {
        if (newFilter.length > 0 && !filters.includes(newFilter)) {
            try {
                await addFilterApi({ filter: newFilter });
                toast.success(`Filter ${newFilter} added successfully`, {
                    position: "bottom-left",
                    autoClose: 3000,
                });
                const updatedDropdownItems = [...filters];
                updatedDropdownItems.push(newFilter);
                setFilters(updatedDropdownItems);
            } catch (error) {
                console.error("Error adding filter:", error);
                alert(`Error adding filter. Error: ${((error as any).message || "Unknown error")}`);
                // Handle the error appropriately - maybe show a message to the user
            }
            setNewFilter("");
        } else if (filters.includes(newFilter)) {
            toast.error(`Filter ${newFilter} already exists`, {
                position: "bottom-left",
                autoClose: 3000,
            });
        }
    }

    return (
        <nav className="bg-white shadow-md navbar">
            <div className="container mx-auto px-2 sm:px-4 lg:px-8">
                <div className="flex justify-between items-center">
                    <div className="flex items-center">
                        {/* Logo */}
                        <a href="/" className="py-4 mr-4">
                            <Image src="/logo.png" alt="Logo" width={60} height={60} />
                        </a>
                        {/* Primary Navbar items */}
                        <div className="hidden md:flex items-center space-x-4 ml-4 pt-1">
                            {navLinks.map((link) => (
                                <a key={link.href} href={link.href} className={primaryNavItems(link.href)}>
                                    {link.text}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Add server button, Filter and search for Home page only */}
                    <div className="hidden md:flex items-center space-x-3 relative">
                        {/* Add server */}
                        {pathname === "/" && <Button
                            onClick={() => setShowAddServerModal(true)}
                            color="dark"
                        >
                            Add server
                        </Button>}

                        {/* Filter */}
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                className="text-gray-700 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center border border-gray-300"
                            >
                                {selectedFilter}
                                <svg className="ml-2 w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 12">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5l5 5 5-5" />
                                </svg>
                            </button>

                            {/* Dropdown Menu */}
                            {dropdownOpen && (
                                <div className="absolute z-10 bg-white divide-y divide-gray-100 rounded-lg shadow w-68 mt-2">
                                    <div className="max-h-80 overflow-y-auto">
                                        <ul className="py-2 text-sm text-gray-700o">
                                            {filters.map((item) => (
                                                <li key={item}>
                                                    <div className="flex justify-between hover:bg-gray-100">
                                                        <button className="px-4 py-2 " onClick={() => handleFilterClick(item)}>
                                                            {item}
                                                        </button>
                                                        {item !== "All servers" &&
                                                            <button className="pr-2 py-2" onClick={() => {
                                                                setFilterToDelete(item);
                                                                setShowFilterDeleteModal(true);
                                                            }}>
                                                                <IoIosRemoveCircleOutline className="text-gray-600 h-5 w-5 hover:text-red-500" />
                                                            </button>
                                                        }
                                                    </div>
                                                </li>
                                            ))}

                                        </ul>
                                    </div>
                                    {/* Fixed 'Add Filter' Field at Bottom */}
                                    <div className="border-t border-gray-100 pt-2">
                                        <div className="flex justify-between">
                                            <input
                                                type="text"
                                                placeholder="Add Filter"
                                                className="bg-white border ml-2 border-gray-100 px-2 mb-2 rounded"
                                                onChange={(e) => setNewFilter(e.target.value)}
                                                value={newFilter}
                                            />
                                            <button className="bg-white px-2 pb-2" onClick={handleFilterAdd}>
                                                <IoIosAddCircleOutline className="text-gray-700 h-6 w-6 hover:text-green-500" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        {/* Full Screen Toggle for '/present' path */}
                        {pathname === "/present" && (
                            <button
                                onClick={handleFullScreenToggle}
                            >
                                {isFullScreen ? (
                                    <Image src={ExitFullScreenIcon} alt="Exit Full Screen" className="ml-2 w-6 h-6" />
                                ) : (
                                    <Image src={EnterFullScreenIcon} alt="Enter Full Screen" className="ml-2 w-8 h-8" />
                                )}
                            </button>
                        )}
                        {/* Search */}
                        {pathname === "/" && <input type="search" placeholder="Search" className="py-2 px-4 bg-white border border-gray-300 rounded-md" />}
                    </div>
                </div>
                {/* Modal to add server */}
                {showAddServerModal && (
                    <AddServerModal
                        showModal={showAddServerModal}
                        setShowModal={setShowAddServerModal}
                    />
                )}
            </div>
            <ToastContainer
                position="bottom-left"
                autoClose={5000}
                hideProgressBar
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="colored"
            />
            {showFilterDeleteModal && <WarningModal
                openModal={showFilterDeleteModal}
                setOpenModal={setShowFilterDeleteModal}
                description={`Are you sure you want to delete ${filterToDelete} filter?`}
                onConfirm={() => handleFilterRemove(filterToDelete)}
            />}
        </nav>
    );
}