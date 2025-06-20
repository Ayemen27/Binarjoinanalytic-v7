import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { Card } from '@/components/atoms/Card';

interface Stat {
  title: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  color: string;
  bgColor: string;
}

interface AnimatedStatsProps {
  stats: Stat[];
  className?: string;
}

export const AnimatedStats: React.FC<AnimatedStatsProps> = ({ stats, className = '' }) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        const changeColor = stat.changeType === 'positive' ? 'text-success' : 
                           stat.changeType === 'negative' ? 'text-destructive' : 'text-muted-foreground';
        
        return (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            whileHover={{ y: -5 }}
          >
            <Card className="p-6 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                {stat.change && (
                  <span className={`text-sm font-medium ${changeColor}`}>
                    {stat.change}
                  </span>
                )}
              </div>
              
              <div>
                <motion.p 
                  className="text-2xl font-bold text-foreground mb-1"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.8, delay: index * 0.1 + 0.2 }}
                >
                  {stat.value}
                </motion.p>
                <p className="text-sm text-muted-foreground">
                  {stat.title}
                </p>
              </div>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
};

export default AnimatedStats;