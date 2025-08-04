"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface StockChartProps {
  data: {
    symbol: string;
    current_price: number;
    indicators: {
      rsi_14?: number;
      sma_14?: number;
      sma_20?: number;
      sma_50?: number;
      macd?: {
        macd: number;
        signal: number;
        histogram: number;
      };
      bollinger_bands?: {
        upper_band: number;
        middle_band: number;
        lower_band: number;
      };
    };
  };
}

export default function StockChart({ data }: StockChartProps) {
  // Generate mock historical data for visualization
  const generateMockData = () => {
    const days = 30;
    const mockData = [];
    let basePrice = data.current_price;
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Add some randomness to simulate price movement
      const change = (Math.random() - 0.5) * 100;
      basePrice = Math.max(basePrice + change, basePrice * 0.8);
      
      mockData.push({
        date: date.toLocaleDateString(),
        price: parseFloat(basePrice.toFixed(2)),
        sma_14: data.indicators.sma_14 ? parseFloat((data.indicators.sma_14 + (Math.random() - 0.5) * 50).toFixed(2)) : undefined,
        sma_20: data.indicators.sma_20 ? parseFloat((data.indicators.sma_20 + (Math.random() - 0.5) * 50).toFixed(2)) : undefined,
        volume: Math.floor(Math.random() * 1000000) + 100000,
      });
    }
    
    // Set the last data point to current price
    mockData[mockData.length - 1].price = data.current_price;
    
    return mockData;
  };

  const chartData = generateMockData();

  const indicatorData = [
    {
      name: 'RSI',
      value: data.indicators.rsi_14 || 0,
      color: data.indicators.rsi_14 && data.indicators.rsi_14 > 70 ? '#ef4444' : 
             data.indicators.rsi_14 && data.indicators.rsi_14 < 30 ? '#22c55e' : '#3b82f6'
    },
    {
      name: 'MACD',
      value: data.indicators.macd?.macd || 0,
      color: data.indicators.macd && data.indicators.macd.macd > data.indicators.macd.signal ? '#22c55e' : '#ef4444'
    }
  ];

  return (
    <div className="space-y-4">
      {/* Price Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Price Movement - {data.symbol}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="date" 
                stroke="#9ca3af"
                fontSize={12}
              />
              <YAxis 
                stroke="#9ca3af"
                fontSize={12}
                domain={['dataMin - 50', 'dataMax + 50']}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#f9fafb'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="price" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={false}
                name="Price (₹)"
              />
              {data.indicators.sma_14 && (
                <Line 
                  type="monotone" 
                  dataKey="sma_14" 
                  stroke="#f59e0b" 
                  strokeWidth={1}
                  strokeDasharray="5 5"
                  dot={false}
                  name="SMA 14"
                />
              )}
              {data.indicators.sma_20 && (
                <Line 
                  type="monotone" 
                  dataKey="sma_20" 
                  stroke="#10b981" 
                  strokeWidth={1}
                  strokeDasharray="5 5"
                  dot={false}
                  name="SMA 20"
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Volume Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Volume</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="date" 
                stroke="#9ca3af"
                fontSize={12}
              />
              <YAxis 
                stroke="#9ca3af"
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#f9fafb'
                }}
              />
              <Bar 
                dataKey="volume" 
                fill="#6366f1"
                name="Volume"
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Technical Indicators */}
      <Card>
        <CardHeader>
          <CardTitle>Technical Indicators</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={indicatorData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                type="number"
                stroke="#9ca3af"
                fontSize={12}
              />
              <YAxis 
                type="category"
                dataKey="name"
                stroke="#9ca3af"
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#f9fafb'
                }}
              />
              <Bar 
                dataKey="value" 
                fill="#6366f1"
                name="Value"
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Bollinger Bands Info */}
      {data.indicators.bollinger_bands && (
        <Card>
          <CardHeader>
            <CardTitle>Bollinger Bands</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-gray-400">Upper Band</p>
                <p className="text-lg font-bold text-red-400">
                  ₹{data.indicators.bollinger_bands.upper_band.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Middle Band (SMA 20)</p>
                <p className="text-lg font-bold text-blue-400">
                  ₹{data.indicators.bollinger_bands.middle_band.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Lower Band</p>
                <p className="text-lg font-bold text-green-400">
                  ₹{data.indicators.bollinger_bands.lower_band.toFixed(2)}
                </p>
              </div>
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-400">
                Current Price Position: 
                <span className={`ml-2 font-bold ${
                  data.current_price > data.indicators.bollinger_bands.upper_band ? 'text-red-400' :
                  data.current_price < data.indicators.bollinger_bands.lower_band ? 'text-green-400' :
                  'text-blue-400'
                }`}>
                  {data.current_price > data.indicators.bollinger_bands.upper_band ? 'Above Upper Band' :
                   data.current_price < data.indicators.bollinger_bands.lower_band ? 'Below Lower Band' :
                   'Within Bands'}
                </span>
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
