import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Plus, Lock } from 'lucide-react';

const ProfileSelector = ({ onSelectProfile }) => {
  const [profiles, setProfiles] = useState(() => {
    const stored = localStorage.getItem('vault_profiles');
    return stored ? JSON.parse(stored) : [];
  });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');

  const createProfile = (e) => {
    e.preventDefault();
    if (newProfileName.trim()) {
      const newProfile = {
        id: Date.now().toString(),
        name: newProfileName.trim(),
        createdAt: new Date().toISOString()
      };
      const updatedProfiles = [...profiles, newProfile];
      setProfiles(updatedProfiles);
      localStorage.setItem('vault_profiles', JSON.stringify(updatedProfiles));
      setNewProfileName('');
      setShowCreateForm(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-dark rounded-3xl p-8 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="w-20 h-20 gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4"
          >
            <Lock className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold text-white mb-2">Select Profile</h1>
          <p className="text-gray-400">Choose your secure vault</p>
        </div>

        <div className="space-y-4">
          {profiles.map((profile, index) => (
            <motion.button
              key={profile.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => onSelectProfile(profile)}
              className="w-full flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all duration-200"
            >
              <div className="w-12 h-12 gradient-secondary rounded-xl flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <h3 className="text-white font-medium">{profile.name}</h3>
                <p className="text-gray-400 text-sm">
                  Created {new Date(profile.createdAt).toLocaleDateString()}
                </p>
              </div>
            </motion.button>
          ))}

          {!showCreateForm ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowCreateForm(true)}
              className="w-full flex items-center gap-4 p-4 border-2 border-dashed border-white/20 rounded-xl hover:border-primary-500 hover:bg-primary-500/5 transition-all duration-200"
            >
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                <Plus className="w-6 h-6 text-gray-400" />
              </div>
              <span className="text-gray-400 font-medium">Create New Profile</span>
            </motion.button>
          ) : (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              onSubmit={createProfile}
              className="space-y-4"
            >
              <input
                type="text"
                value={newProfileName}
                onChange={(e) => setNewProfileName(e.target.value)}
                placeholder="Profile name (e.g., John, Sarah)"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 transition-colors"
                autoFocus
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setNewProfileName('');
                  }}
                  className="flex-1 px-4 py-3 text-gray-400 border border-white/10 rounded-xl hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 gradient-primary text-white rounded-xl hover:opacity-90 transition-opacity"
                >
                  Create
                </button>
              </div>
            </motion.form>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ProfileSelector;