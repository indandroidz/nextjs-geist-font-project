#!/usr/bin/env python3
"""
Test script for Indian Stock Signal API
Demonstrates the complete workflow from authentication to getting trading signals
"""

import requests
import json
import time

# API Configuration
BASE_URL = "http://localhost:8001"
DEMO_USERNAME = "demo_user"
DEMO_PIN = "1234"

def test_api():
    """Test the complete API workflow"""
    print("🚀 Testing Indian Stock Signal API")
    print("=" * 50)
    
    # Step 1: Get current TOTP token
    print("\n1. Getting current TOTP token...")
    try:
        response = requests.get(f"{BASE_URL}/api/auth/current-totp")
        totp_data = response.json()
        current_totp = totp_data["current_totp"]
        print(f"✅ Current TOTP: {current_totp}")
    except Exception as e:
        print(f"❌ Failed to get TOTP: {e}")
        return
    
    # Step 2: Login with TOTP
    print("\n2. Logging in with TOTP...")
    try:
        login_data = {
            "username": DEMO_USERNAME,
            "pin": DEMO_PIN,
            "totp": current_totp
        }
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json=login_data,
            headers={"Content-Type": "application/json"}
        )
        login_result = response.json()
        access_token = login_result["access_token"]
        print(f"✅ Login successful! Token expires in {login_result['expires_in']} seconds")
    except Exception as e:
        print(f"❌ Login failed: {e}")
        return
    
    # Headers for authenticated requests
    headers = {"Authorization": f"Bearer {access_token}"}
    
    # Step 3: Search for stocks
    print("\n3. Searching for stocks...")
    try:
        response = requests.get(
            f"{BASE_URL}/api/stocks/search?q=RELIANCE",
            headers=headers
        )
        search_result = response.json()
        print(f"✅ Found {search_result['count']} stocks matching 'RELIANCE'")
        for stock in search_result['results']:
            print(f"   - {stock['symbol']}: {stock['name']} ({stock['exchange']})")
    except Exception as e:
        print(f"❌ Stock search failed: {e}")
    
    # Step 4: Get stock data with indicators
    print("\n4. Getting stock data with technical indicators...")
    try:
        response = requests.get(
            f"{BASE_URL}/api/stocks/ltp/RELIANCE?exchange=NSE",
            headers=headers
        )
        stock_data = response.json()
        print(f"✅ RELIANCE Current Price: ₹{stock_data['current_price']}")
        
        indicators = stock_data['indicators']
        print(f"   📊 Technical Indicators:")
        print(f"      - RSI (14): {indicators.get('rsi_14', 'N/A')}")
        print(f"      - SMA (14): ₹{indicators.get('sma_14', 'N/A'):.2f}" if indicators.get('sma_14') else "      - SMA (14): N/A")
        print(f"      - SMA (20): ₹{indicators.get('sma_20', 'N/A'):.2f}" if indicators.get('sma_20') else "      - SMA (20): N/A")
        
        if 'macd' in indicators:
            macd = indicators['macd']
            print(f"      - MACD: {macd['macd']:.4f}")
            print(f"      - Signal: {macd['signal']:.4f}")
            print(f"      - Histogram: {macd['histogram']:.4f}")
        
        # Trading signals
        signals = stock_data['signals']
        print(f"   🎯 Trading Signals:")
        print(f"      - Recommendation: {signals.get('recommendation', 'N/A')}")
        if signals.get('buy_signals'):
            print(f"      - Buy Signals: {', '.join(signals['buy_signals'])}")
        if signals.get('sell_signals'):
            print(f"      - Sell Signals: {', '.join(signals['sell_signals'])}")
            
    except Exception as e:
        print(f"❌ Failed to get stock data: {e}")
    
    # Step 5: Get trading signals for analysis period
    print("\n5. Getting comprehensive trading signals...")
    try:
        response = requests.get(
            f"{BASE_URL}/api/stocks/signals/RELIANCE?exchange=NSE&period=30",
            headers=headers
        )
        signals_data = response.json()
        print(f"✅ Analysis for {signals_data['analysis_period']} days ({signals_data['data_points']} data points)")
        print(f"   📈 Current Price: ₹{signals_data['current_price']}")
        print(f"   🎯 Overall Recommendation: {signals_data['signals']['recommendation']}")
        
    except Exception as e:
        print(f"❌ Failed to get trading signals: {e}")
    
    # Step 6: Test watchlist functionality
    print("\n6. Testing watchlist with multiple stocks...")
    try:
        response = requests.get(
            f"{BASE_URL}/api/stocks/watchlist?symbols=RELIANCE,TCS,INFY&exchange=NSE",
            headers=headers
        )
        watchlist_data = response.json()
        print(f"✅ Watchlist analysis for {watchlist_data['total_symbols']} stocks:")
        
        for symbol, data in watchlist_data['watchlist'].items():
            if data['status'] == 'success':
                print(f"   📊 {symbol}:")
                print(f"      - Price: ₹{data['current_price']}")
                print(f"      - RSI: {data['indicators'].get('rsi', 'N/A')}")
                print(f"      - Recommendation: {data['recommendation']}")
            else:
                print(f"   ❌ {symbol}: {data['message']}")
                
    except Exception as e:
        print(f"❌ Watchlist test failed: {e}")
    
    # Step 7: Test logout
    print("\n7. Testing logout...")
    try:
        response = requests.post(f"{BASE_URL}/api/auth/logout")
        print("✅ Logout successful")
    except Exception as e:
        print(f"❌ Logout failed: {e}")
    
    print("\n" + "=" * 50)
    print("🎉 API Testing Complete!")
    print("\n📚 API Documentation: http://localhost:8001/docs")
    print("🔍 ReDoc Documentation: http://localhost:8001/redoc")

if __name__ == "__main__":
    test_api()
