import os
from typing import Optional

# Angel One API credentials (Demo mode)
ANGEL_ONE_HISTORICAL_API_KEY = os.getenv("ANGEL_ONE_HIST_API_KEY", "bDbooS6h")
ANGEL_ONE_HISTORICAL_SECRET = os.getenv("ANGEL_ONE_HIST_SECRET", "e335181b-c11d-44a1-93e3-89feda10ee73")
ANGEL_ONE_MARKET_API_KEY = os.getenv("ANGEL_ONE_MARKET_API_KEY", "8MZiKu0m")
ANGEL_ONE_MARKET_SECRET = os.getenv("ANGEL_ONE_MARKET_SECRET", "e35774c7-ae3f-47b9-a09f-1a515d84d446")

# TOTP secret for login (demo value; replace in production)
TOTP_SECRET = os.getenv("TOTP_SECRET", "JBSWY3DPEHPK3PXP")  # Base32 encoded secret

# JWT settings
JWT_SECRET = os.getenv("JWT_SECRET", "your_super_secret_jwt_key_change_in_production")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

# Angel One API URLs
ANGEL_ONE_BASE_URL = "https://apiconnect.angelbroking.com"
ANGEL_ONE_LOGIN_URL = f"{ANGEL_ONE_BASE_URL}/rest/auth/angelbroking/user/v1/loginByPassword"
ANGEL_ONE_LOGOUT_URL = f"{ANGEL_ONE_BASE_URL}/rest/secure/angelbroking/user/v1/logout"
ANGEL_ONE_PROFILE_URL = f"{ANGEL_ONE_BASE_URL}/rest/secure/angelbroking/user/v1/getProfile"
ANGEL_ONE_LTP_URL = f"{ANGEL_ONE_BASE_URL}/rest/secure/angelbroking/order/v1/getLTP"
ANGEL_ONE_CANDLE_URL = f"{ANGEL_ONE_BASE_URL}/rest/secure/angelbroking/historical/v1/getCandleData"

# Demo user credentials (for testing)
DEMO_USERNAME = os.getenv("DEMO_USERNAME", "demo_user")
DEMO_PIN = os.getenv("DEMO_PIN", "1234")

# CORS settings
ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:8000",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:8000"
]
