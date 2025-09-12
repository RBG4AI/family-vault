import React from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { Key, CreditCard, Shield, TrendingUp, DollarSign } from 'lucide-react';
import { storage } from '../utils/storage';
import SecurityScore from './SecurityScore';

const Dashboard = () => {
  const credentials = storage.get('credentials') || [];
  const banking = storage.get('banking') || [];
  const insurance = storage.get('insurance') || [];
  const investments = storage.get('investments') || [];

  const totalInvestmentValue = investments.reduce((sum, inv) => sum + (inv.currentValue || 0), 0);
  
  const stats = [
    {
      title: 'Total Credentials',
      value: credentials.length,
      icon: Key,
      color: 'from-blue-500 to-blue-600',
      change: ''
    },
    {
      title: 'Bank Accounts',
      value: banking.length,
      icon: CreditCard,
      color: 'from-green-500 to-green-600',
      change: ''
    },
    {
      title: 'Insurance Policies',
      value: insurance.length,
      icon: Shield,
      color: 'from-purple-500 to-purple-600',
      change: ''
    },
    {
      title: 'Investment Value',
      value: totalInvestmentValue > 0 ? `₹${(totalInvestmentValue/1000).toFixed(1)}K` : '₹0',
      icon: TrendingUp,
      color: 'from-orange-500 to-orange-600',
      change: ''
    }
  ];

  const pieData = [
    { name: 'Credentials', value: credentials.length, color: '#3b82f6' },
    { name: 'Banking', value: banking.length, color: '#10b981' },
    { name: 'Insurance', value: insurance.length, color: '#8b5cf6' },
    { name: 'Investments', value: investments.length, color: '#f59e0b' }
  ];

  const barData = investments.length > 0 ? investments.map(inv => ({
    name: inv.name?.substring(0, 8) || 'Investment',
    value: inv.currentValue || 0
  })) : [];

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="mt-12 md:mt-0">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-gray-400">Welcome back to your secure vault</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-400">Last login</p>
          <p className="text-white font-medium">{new Date().toLocaleDateString()}</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-dark rounded-xl md:rounded-2xl p-3 md:p-6 hover:bg-white/5 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-8 h-8 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center`}>
                  <Icon className="w-4 h-4 md:w-6 md:h-6 text-white" />
                </div>
                {stat.change && <span className="text-green-400 text-sm font-medium">{stat.change}</span>}
              </div>
              <h3 className="text-lg md:text-2xl font-bold text-white mb-1">{stat.value}</h3>
              <p className="text-gray-400 text-xs md:text-sm">{stat.title}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <SecurityScore />

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-dark rounded-2xl p-6"
        >
          <h3 className="text-xl font-semibold text-white mb-4">Investment Growth</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={barData}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: '#fff'
                }} 
              />
              <Bar dataKey="value" fill="url(#gradient)" radius={[4, 4, 0, 0]} />
              <defs>
                <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#1d4ed8" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {(credentials.length > 0 || banking.length > 0 || insurance.length > 0 || investments.length > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-dark rounded-2xl p-6"
        >
          <h3 className="text-xl font-semibold text-white mb-4">Recent Activity</h3>
          <div className="text-center py-8">
            <p className="text-gray-400">Activity tracking will appear here as you use the app</p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Dashboard;