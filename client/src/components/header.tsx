import { Link, useLocation } from "wouter";
import { Scissors } from "lucide-react";

export default function Header() {
  const [location] = useLocation();

  return (
    <header className="bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/">
            <div className="flex items-center space-x-3 cursor-pointer">
              <div className="w-10 h-10 bg-gradient-to-br from-rose-primary to-rose-light rounded-full flex items-center justify-center">
                <Scissors className="text-white h-5 w-5" />
              </div>
              <h1 className="text-xl font-bold text-charcoal">Bella Beauty</h1>
            </div>
          </Link>
          
          <nav className="hidden md:flex space-x-8">
            <Link href="/">
              <span className={`font-medium transition-colors ${
                location === "/" 
                  ? "text-rose-primary border-b-2 border-rose-primary pb-1" 
                  : "text-gray-600 hover:text-rose-primary"
              }`}>
                Book Now
              </span>
            </Link>
            
            <Link href="/appointments">
              <span className={`font-medium transition-colors ${
                location === "/appointments" 
                  ? "text-rose-primary border-b-2 border-rose-primary pb-1" 
                  : "text-gray-600 hover:text-rose-primary"
              }`}>
                Appointments
              </span>
            </Link>
          </nav>
          
          <button className="md:hidden text-gray-600">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
