import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Download, Shield } from 'lucide-react';

const QuickActions = ({ onAction }) => {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    { id: 'add-credential', label: 'Add Credential', icon: Plus, color: 'bg-blue-500' },
    { id: 'search', label: 'Search', icon: Search, color: 'bg-green-500' },
    { id: 'export', label: 'Export Data', icon: Download, color: 'bg-purple-500' },
    { id: 'security-check', label: 'Security Check', icon: Shield, color: 'bg-red-500' },
  ];

  const handleAction = (actionId) => {
    onAction(actionId);
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute bottom-16 right-0 space-y-3"
          >
            {actions.map((action, index) => {
              const Icon = action.icon;
              return (
                <motion.button
                  key={action.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => handleAction(action.id)}
                  className="flex items-center gap-3 px-4 py-3 glass-panel text-white rounded-2xl whitespace-nowrap hover:border-white/20"
                >
                  <Icon size={20} />
                  {action.label}
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 gradient-primary rounded-full flex items-center justify-center glow-primary transition-all duration-200 ${
          isOpen ? 'rotate-45' : ''
        }`}
      >
        <Plus className="w-6 h-6 text-white" />
      </motion.button>
    </div>
  );
};

export default QuickActions;