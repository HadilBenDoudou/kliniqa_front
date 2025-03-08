import React from "react";
import { Search, PhoneCall } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Header = () => (
  <div className="flex flex-col md:flex-row items-center justify-between px-6 py-4 bg-white shadow-md relative z-30">
    {/* Logo + Address */}
    <div className="flex items-center space-x-4 mb-4 md:mb-0">
      <img src="/logo/logo.png" alt="Kliniqa Logo" className="h-10" />
      <span className="text-xs md:text-sm text-gray-500">
        Store Location: Lincoln-344, Illinois, Chicago, USA
      </span>
    </div>

    {/* Search Bar */}
    <div className="flex items-center bg-gray-100 p-2 rounded-full w-full md:w-1/3 border border-gray-300 mb-4 md:mb-0">
      <Search className="h-5 w-5 text-gray-500 ml-2" />
      <Input
        type="text"
        placeholder="Search"
        className="bg-transparent outline-none flex-grow px-2 text-gray-700 border-none"
      />
      <Button className="bg-black text-white px-4 py-2 rounded-full hover:bg-gray-800 transition-all">
        Search
      </Button>
    </div>

    {/* Contact */}
    <div className="flex items-center space-x-2">
      <PhoneCall className="h-5 w-5 text-gray-500" />
      <span className="text-sm text-gray-700 font-medium">(219) 555-0114</span>
    </div>
  </div>
);

export default Header;