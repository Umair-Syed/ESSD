"use client"; // This file is client-side only
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { usePathname } from 'next/navigation'
import { Button } from "flowbite-react";
import AddServerModal from "./AddServerModal";
import EnterFullScreenIcon from '@/assets/full-screen.svg';
import ExitFullScreenIcon from '@/assets/exit-full-screen.svg';



export default function NavBar() {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState("All servers");
    const dropdownRef = useRef<HTMLDivElement>(null);
    const pathname = usePathname()
    const [showModal, setShowModal] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);


    const dropdownItems = [
        "All servers",
        "Up servers",
        "Down servers",
        "Edge team servers",
        "Mobile team servers",
        "DevOps team servers",
    ];


    const handleClickOutside = (event: Event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
            setDropdownOpen(false);
        }
    };

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

    const handleItemClick = (item: string) => {
        setSelectedItem(item);
        setDropdownOpen(false);
    };

    const handleFullScreenToggle = () => {
        const navbar = document.querySelector('.navbar');
    
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setIsFullScreen(true);
            if (navbar){
                navbar.classList.add('navbar-hidden');
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
                setIsFullScreen(false);
                if (navbar){
                    navbar.classList.remove('navbar-hidden');
                }
            }
        }
    };
    
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

    const linkClass = (href: string) =>
        `py-4 px-2 text-gray-500 text-xl hover:text-primary transition duration-300 ${pathname === href ? "text-grey-800 font-extrabold" : "font-semibold"}`;

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
                                <a key={link.href} href={link.href} className={linkClass(link.href)}>
                                    {link.text}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Add server button, Filter and search for Home page only */}
                    <div className="hidden md:flex items-center space-x-3 relative">
                        {/* Add server */}
                        {pathname === "/" && <Button
                            onClick={() => setShowModal(true)}
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
                                {selectedItem}
                                <svg className="ml-2 w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 12">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5l5 5 5-5" />
                                </svg>
                            </button>

                            {/* Dropdown Menu */}
                            {dropdownOpen && (
                                <div className="absolute z-10 bg-white divide-y divide-gray-100 rounded-lg shadow w-44 mt-2">
                                    <ul className="py-2 text-sm text-gray-700">
                                        {dropdownItems.map((item) => (
                                            <li key={item}>
                                                <a href="#" className="block px-4 py-2 hover:bg-gray-100" onClick={() => handleItemClick(item)}>
                                                    {item}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
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
                {showModal && (
                    <AddServerModal
                        showModal={showModal}
                        setShowModal={setShowModal}
                    />
                )}
            </div>
        </nav>
    );
}