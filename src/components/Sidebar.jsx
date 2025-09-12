import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Key, 
  CreditCard, 
  FileText, 
  Shield, 
  TrendingUp, 
  Settings,
  LogOut,
  Lock,
  Menu,
  X
} from 'lucide-react';

const Sidebar = ({ activeSection, setActiveSection, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);

  const closeSidebar = () => {
    setIsOpen(false);
  };
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'credentials', label: 'Credentials', icon: Key },
    { id: 'emails', label: 'Email Accounts', icon: Key },
    { id: 'banking', label: 'Banking', icon: CreditCard },
    { id: 'cards', label: 'Cards', icon: CreditCard },
    { id: 'government', label: 'Govt IDs', icon: FileText },
    { id: 'insurance', label: 'Insurance', icon: Shield },
    { id: 'investments', label: 'Investments', icon: TrendingUp },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 p-3 bg-dark-800 rounded-xl text-white"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={`${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 fixed md:relative z-50 w-64 h-screen glass-dark border-r border-white/10 p-6 flex flex-col transition-transform duration-300 ease-in-out`}
      >
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center">
              <Lock className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">Vault</h1>
          </div>
          <button
            onClick={closeSidebar}
            className="md:hidden p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-2">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          
          return (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => {
                setActiveSection(item.id);
                closeSidebar();
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'bg-primary-600 text-white shadow-lg' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon size={20} />
              <span className="font-medium">{item.label}</span>
            </motion.button>
          );
        })}
        </nav>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onLogout}
          className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-red-400 transition-colors rounded-xl hover:bg-red-500/10"
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </motion.button>
      </div>
    </>
  );
};

export default Sidebar;