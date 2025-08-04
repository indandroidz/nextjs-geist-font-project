"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import StockChart from '@/components/StockChart';

const API_BASE_URL = 'http://localhost:8001';

interface User {
  username: string;
  token: string;
  expires_in: number;
}

interface StockData {
  symbol: string;
  current_price: number;
  indicators: {
    rsi_14?: number;
    sma_14?: number;
    sma_20?: number;
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
  signals: {
    recommendation: string;
    buy_signals: string[];
    sell_signals: string[];
  };
}

interface WatchlistData {
  [symbol: string]: {
    current_price: number;
    indicators: {
      rsi?: number;
      sma_14?: number;
    };
    recommendation: string;
    status: string;
  };
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Login form state
  const [username, setUsername] = useState('demo_user');
  const [pin, setPin] = useState('1234');
  const [totp, setTotp] = useState('');
  const [currentTotp, setCurrentTotp] = useState('');
  
  // Stock data state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStock, setSelectedStock] = useState('RELIANCE');
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [watchlistData, setWatchlistData] = useState<WatchlistData | null>(null);
  const [watchlistSymbols, setWatchlistSymbols] = useState('RELIANCE,TCS,INFY,HDFCBANK,ICICIBANK');

  // Get current TOTP for demo
  const getCurrentTotp = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/current-totp`);
      const data = await response.json();
      setCurrentTotp(data.current_totp);
      setTotp(data.current_totp);
    } catch (err) {
      console.error('Failed to get TOTP:', err);
    }
  };

  // Login function
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, pin, totp }),
      });

      const data = await response.json();

      if (response.ok) {
        setUser({
          username: data.user_info.username,
          token: data.access_token,
          expires_in: data.expires_in,
        });
        setSuccess('Login successful!');
        localStorage.setItem('auth_token', data.access_token);
        localStorage.setItem('username', data.user_info.username);
      } else {
        setError(data.detail || 'Login failed');
      }
    } catch (err) {
      setError('Network error. Please check if the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/auth/logout`, { method: 'POST' });
    } catch (err) {
      console.error('Logout error:', err);
    }
    
    setUser(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('username');
    setSuccess('Logged out successfully');
  };

  // Get stock data
  const getStockData = async (symbol: string) => {
    if (!user) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/stocks/ltp/${symbol}?exchange=NSE`, {
        headers: {
          'Authorization': `Bearer ${user.token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStockData(data);
      } else {
        setError('Failed to fetch stock data');
      }
    } catch (err) {
      setError('Network error while fetching stock data');
    } finally {
      setLoading(false);
    }
  };

  // Get watchlist data
  const getWatchlistData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/stocks/watchlist?symbols=${watchlistSymbols}&exchange=NSE`, {
        headers: {
          'Authorization': `Bearer ${user.token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setWatchlistData(data.watchlist);
      } else {
        setError('Failed to fetch watchlist data');
      }
    } catch (err) {
      setError('Network error while fetching watchlist data');
    } finally {
      setLoading(false);
    }
  };

  // Check for existing token on mount
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const username = localStorage.getItem('username');
    if (token && username) {
      setUser({ username, token, expires_in: 86400 });
    }
  }, []);

  // Auto-refresh TOTP every 30 seconds
  useEffect(() => {
    getCurrentTotp();
    const interval = setInterval(getCurrentTotp, 30000);
    return () => clearInterval(interval);
  }, []);

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'BUY': return 'bg-green-500';
      case 'SELL': return 'bg-red-500';
      default: return 'bg-yellow-500';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Indian Stock Signal</CardTitle>
            <CardDescription>Login with TOTP Authentication</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="pin">PIN</Label>
                <Input
                  id="pin"
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="Enter PIN"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="totp">TOTP Token</Label>
                <Input
                  id="totp"
                  value={totp}
                  onChange={(e) => setTotp(e.target.value)}
                  placeholder="Enter TOTP"
                />
                {currentTotp && (
                  <p className="text-sm text-gray-500">
                    Current TOTP (demo): <span className="font-mono font-bold">{currentTotp}</span>
                  </p>
                )}
              </div>

              {error && (
                <Alert className="border-red-500">
                  <AlertDescription className="text-red-600">{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="border-green-500">
                  <AlertDescription className="text-green-600">{success}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto p-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Indian Stock Signal Dashboard</h1>
            <p className="text-gray-400">Welcome, {user.username}</p>
          </div>
          <Button onClick={handleLogout} variant="outline">
            Logout
          </Button>
        </div>

        {error && (
          <Alert className="mb-4 border-red-500">
            <AlertDescription className="text-red-600">{error}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="stock-analysis" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="stock-analysis">Stock Analysis</TabsTrigger>
            <TabsTrigger value="watchlist">Watchlist</TabsTrigger>
          </TabsList>

          <TabsContent value="stock-analysis" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Stock Analysis</CardTitle>
                <CardDescription>Get detailed technical analysis for any stock</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter stock symbol (e.g., RELIANCE)"
                    value={selectedStock}
                    onChange={(e) => setSelectedStock(e.target.value.toUpperCase())}
                  />
                  <Button onClick={() => getStockData(selectedStock)} disabled={loading}>
                    {loading ? 'Loading...' : 'Analyze'}
                  </Button>
                </div>

                {stockData && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-semibold">{stockData.symbol}</h3>
                      <div className="text-right">
                        <p className="text-2xl font-bold">₹{stockData.current_price.toFixed(2)}</p>
                        <Badge className={getRecommendationColor(stockData.signals.recommendation)}>
                          {stockData.signals.recommendation}
                        </Badge>
                      </div>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Technical Indicators</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          {stockData.indicators.rsi_14 && (
                            <div className="flex justify-between">
                              <span>RSI (14):</span>
                              <span className="font-mono">{stockData.indicators.rsi_14.toFixed(2)}</span>
                            </div>
                          )}
                          {stockData.indicators.sma_14 && (
                            <div className="flex justify-between">
                              <span>SMA (14):</span>
                              <span className="font-mono">₹{stockData.indicators.sma_14.toFixed(2)}</span>
                            </div>
                          )}
                          {stockData.indicators.sma_20 && (
                            <div className="flex justify-between">
                              <span>SMA (20):</span>
                              <span className="font-mono">₹{stockData.indicators.sma_20.toFixed(2)}</span>
                            </div>
                          )}
                          {stockData.indicators.macd && (
                            <>
                              <div className="flex justify-between">
                                <span>MACD:</span>
                                <span className="font-mono">{stockData.indicators.macd.macd.toFixed(4)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Signal:</span>
                                <span className="font-mono">{stockData.indicators.macd.signal.toFixed(4)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Histogram:</span>
                                <span className="font-mono">{stockData.indicators.macd.histogram.toFixed(4)}</span>
                              </div>
                            </>
                          )}
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Trading Signals</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          {stockData.signals.buy_signals.length > 0 && (
                            <div>
                              <p className="font-semibold text-green-400">Buy Signals:</p>
                              <ul className="list-disc list-inside text-sm">
                                {stockData.signals.buy_signals.map((signal, index) => (
                                  <li key={index}>{signal}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {stockData.signals.sell_signals.length > 0 && (
                            <div>
                              <p className="font-semibold text-red-400">Sell Signals:</p>
                              <ul className="list-disc list-inside text-sm">
                                {stockData.signals.sell_signals.map((signal, index) => (
                                  <li key={index}>{signal}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {stockData.signals.buy_signals.length === 0 && stockData.signals.sell_signals.length === 0 && (
                            <p className="text-gray-400">No specific signals detected</p>
                          )}
                        </CardContent>
                      </Card>
                    </div>

                    {/* Stock Chart Component */}
                    <StockChart data={stockData} />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="watchlist" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Watchlist</CardTitle>
                <CardDescription>Monitor multiple stocks at once</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter comma-separated symbols (e.g., RELIANCE,TCS,INFY)"
                    value={watchlistSymbols}
                    onChange={(e) => setWatchlistSymbols(e.target.value.toUpperCase())}
                  />
                  <Button onClick={getWatchlistData} disabled={loading}>
                    {loading ? 'Loading...' : 'Update'}
                  </Button>
                </div>

                {watchlistData && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(watchlistData).map(([symbol, data]) => (
                      <Card key={symbol} className="bg-gray-800 border-gray-700">
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-center">
                            <CardTitle className="text-lg">{symbol}</CardTitle>
                            <Badge className={getRecommendationColor(data.recommendation)}>
                              {data.recommendation}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="flex justify-between">
                            <span>Price:</span>
                            <span className="font-mono font-bold">₹{data.current_price.toFixed(2)}</span>
                          </div>
                          {data.indicators.rsi && (
                            <div className="flex justify-between">
                              <span>RSI:</span>
                              <span className="font-mono">{data.indicators.rsi.toFixed(2)}</span>
                            </div>
                          )}
                          {data.indicators.sma_14 && (
                            <div className="flex justify-between">
                              <span>SMA (14):</span>
                              <span className="font-mono">₹{data.indicators.sma_14.toFixed(2)}</span>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
