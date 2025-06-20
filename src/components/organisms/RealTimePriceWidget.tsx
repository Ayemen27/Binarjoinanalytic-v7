import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { Card } from '@/components/atoms/Card';
import RealTimeDataService, { RealTimePrice } from '@/lib/realtime-data';

interface RealTimePriceWidgetProps {
  symbol: string;
  className?: string;
}

export const RealTimePriceWidget: React.FC<RealTimePriceWidgetProps> = ({ 
  symbol, 
  className = '' 
}) => {
  const [priceData, setPriceData] = useState<RealTimePrice | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const dataService = RealTimeDataService.getInstance();
    
    const handlePriceUpdate = (data: RealTimePrice) => {
      setPriceData(data);
      setIsConnected(true);
    };

    // الاشتراك في تحديثات الأسعار
    dataService.subscribeToPrice(symbol, handlePriceUpdate);

    // تنظيف عند إلغاء المكون
    return () => {
      dataService.unsubscribeFromPrice(symbol, handlePriceUpdate);
    };
  }, [symbol]);

  if (!priceData) {
    return (
      <Card className={`p-4 ${className}`}>
        <div className="flex items-center justify-center">
          <Activity className="w-4 h-4 animate-pulse text-muted-foreground mr-2" />
          <span className="text-sm text-muted-foreground">جاري تحميل الأسعار...</span>
        </div>
      </Card>
    );
  }

  const isPositive = priceData.change >= 0;
  const changeColor = isPositive ? 'text-success' : 'text-destructive';
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;

  return (
    <Card className={`p-4 hover:shadow-medium transition-all ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 space-x-reverse mb-1">
            <h3 className="font-semibold text-foreground">{symbol}</h3>
            <div className={`flex items-center ${isConnected ? 'text-success' : 'text-muted-foreground'}`}>
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-success' : 'bg-muted-foreground'} mr-1`} />
              <span className="text-xs">{isConnected ? 'مباشر' : 'منقطع'}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 space-x-reverse">
            <span className="text-xl font-bold text-foreground">
              {priceData.price.toFixed(5)}
            </span>
            
            <div className={`flex items-center ${changeColor}`}>
              <TrendIcon className="w-4 h-4 mr-1" />
              <span className="text-sm font-medium">
                {isPositive ? '+' : ''}{priceData.change.toFixed(5)}
              </span>
              <span className="text-xs ml-1">
                ({isPositive ? '+' : ''}{priceData.changePercent.toFixed(2)}%)
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 space-x-reverse mt-2 text-xs text-muted-foreground">
            <span>عرض: {priceData.bid.toFixed(5)}</span>
            <span>طلب: {priceData.ask.toFixed(5)}</span>
            <span>فرق: {priceData.spread.toFixed(5)}</span>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-xs text-muted-foreground mb-1">
            الحجم: {(priceData.volume / 1000).toFixed(0)}K
          </div>
          <div className="text-xs text-muted-foreground">
            {new Date(priceData.timestamp).toLocaleTimeString('ar-SA')}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default RealTimePriceWidget;