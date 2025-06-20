import React, { useState, useEffect } from 'react';
import { Globe, Clock, Activity, TrendingUp } from 'lucide-react';
import { Card } from '@/components/atoms/Card';
import RealTimePriceWidget from './RealTimePriceWidget';
import RealTimeDataService, { MarketStatus } from '@/lib/realtime-data';

const majorPairs = [
  'EUR/USD',
  'GBP/USD', 
  'USD/JPY',
  'USD/CHF',
  'AUD/USD',
  'USD/CAD'
];

export const MarketOverview: React.FC = () => {
  const [marketStatus, setMarketStatus] = useState<MarketStatus | null>(null);

  useEffect(() => {
    const dataService = RealTimeDataService.getInstance();
    
    // تحديث حالة السوق كل دقيقة
    const updateMarketStatus = () => {
      setMarketStatus(dataService.getMarketStatus());
    };

    updateMarketStatus();
    const interval = setInterval(updateMarketStatus, 60000);

    return () => clearInterval(interval);
  }, []);

  const getSessionDisplayName = (session: string) => {
    switch (session) {
      case 'asian': return 'الجلسة الآسيوية';
      case 'european': return 'الجلسة الأوروبية';
      case 'american': return 'الجلسة الأمريكية';
      default: return 'السوق مغلق';
    }
  };

  const getSessionColor = (session: string) => {
    switch (session) {
      case 'asian': return 'text-warning';
      case 'european': return 'text-primary';
      case 'american': return 'text-success';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      {/* حالة السوق */}
      {marketStatus && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground flex items-center">
              <Globe className="w-5 h-5 mr-3" />
              حالة السوق العالمي
            </h2>
            
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className={`flex items-center ${marketStatus.isOpen ? 'text-success' : 'text-destructive'}`}>
                <div className={`w-3 h-3 rounded-full ${marketStatus.isOpen ? 'bg-success' : 'bg-destructive'} mr-2`} />
                <span className="font-medium">
                  {marketStatus.isOpen ? 'السوق مفتوح' : 'السوق مغلق'}
                </span>
              </div>
              
              <div className={`flex items-center ${getSessionColor(marketStatus.session)}`}>
                <Clock className="w-4 h-4 mr-2" />
                <span className="text-sm">
                  {getSessionDisplayName(marketStatus.session)}
                </span>
              </div>
            </div>
          </div>

          {!marketStatus.isOpen && marketStatus.nextOpen && (
            <div className="bg-muted/30 rounded-lg p-3">
              <p className="text-sm text-muted-foreground">
                <Clock className="w-4 h-4 inline mr-2" />
                سيفتح السوق في: {marketStatus.nextOpen.toLocaleString('ar-SA')}
              </p>
            </div>
          )}
        </Card>
      )}

      {/* الأزواج الرئيسية */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground flex items-center">
            <TrendingUp className="w-5 h-5 mr-3" />
            الأزواج الرئيسية
          </h2>
          
          <div className="flex items-center text-sm text-muted-foreground">
            <Activity className="w-4 h-4 mr-2" />
            <span>تحديث مباشر</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {majorPairs.map((pair) => (
            <RealTimePriceWidget 
              key={pair} 
              symbol={pair}
              className="hover:scale-[1.02] transition-transform"
            />
          ))}
        </div>
      </Card>

      {/* إحصائيات السوق */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-foreground mb-6">إحصائيات السوق</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-success mb-1">+2.3%</div>
            <div className="text-sm text-muted-foreground">المؤشر العام</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-primary mb-1">$5.2T</div>
            <div className="text-sm text-muted-foreground">حجم التداول اليومي</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-warning mb-1">1,247</div>
            <div className="text-sm text-muted-foreground">أدوات التداول</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground mb-1">24/5</div>
            <div className="text-sm text-muted-foreground">ساعات التداول</div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default MarketOverview;