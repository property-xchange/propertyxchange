import jwt from 'jsonwebtoken';

export const generateTokenCookie = (res, userId, req) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET_KEY, {
    expiresIn: '7d',
  });

  // Determine if the request is over HTTPS
  const isHttps = req
    ? req.secure ||
      req.headers['x-forwarded-proto'] === 'https' ||
      req.headers.origin?.startsWith('https://')
    : false;

  const isProduction = process.env.NODE_ENV === 'production';

  // Support multiple cookie domains
  const cookieDomains = process.env.COOKIE_DOMAINS
    ? process.env.COOKIE_DOMAINS.split(',')
    : [process.env.COOKIE_DOMAIN];

  console.log('🍪 Cookie configuration:', {
    isProduction,
    isHttps,
    requestOrigin: req?.headers?.origin,
    requestProtocol: req?.protocol,
    xForwardedProto: req?.headers['x-forwarded-proto'],
    userAgent: req?.headers['user-agent']?.substring(0, 50),
  });

  // Base cookie options that work for both HTTP and HTTPS
  const baseCookieOptions = {
    httpOnly: true,
    secure: isHttps, // Only secure for HTTPS requests
    sameSite: isHttps ? 'none' : 'lax', // 'none' only for HTTPS cross-origin
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  };

  console.log('🍪 Setting cookies with options:', {
    isProduction,
    isHttps,
    domains: cookieDomains,
    baseCookieOptions,
  });

  // Set cookie for each configured domain
  cookieDomains.forEach((domain) => {
    if (domain && domain.trim()) {
      const cookieOptions = {
        ...baseCookieOptions,
        domain: domain.trim(),
      };

      res.cookie('token', token, cookieOptions);
      console.log('🍪 Cookie set for domain:', domain.trim());
    }
  });

  // IMPORTANT: Set cookies for specific scenarios to handle both https:// and https://www.

  // 1. Set cookie for root domain (works for both https:// and https://www.)
  if (isProduction) {
    const rootDomainCookie = {
      ...baseCookieOptions,
      domain: '.propertyxchange.com.ng', // Dot prefix makes it work for all subdomains
    };
    res.cookie('token', token, rootDomainCookie);
    console.log('🍪 Root domain cookie set for: .propertyxchange.com.ng');

    // 2. Set specific cookie for www subdomain (extra assurance)
    const wwwDomainCookie = {
      ...baseCookieOptions,
      domain: 'www.propertyxchange.com.ng',
    };
    res.cookie('token', token, wwwDomainCookie);
    console.log('🍪 WWW subdomain cookie set for: www.propertyxchange.com.ng');

    // 3. Set specific cookie for non-www domain (extra assurance)
    const nonWwwDomainCookie = {
      ...baseCookieOptions,
      domain: 'propertyxchange.com.ng',
    };
    res.cookie('token', token, nonWwwDomainCookie);
    console.log('🍪 Non-WWW domain cookie set for: propertyxchange.com.ng');
  }

  // Also set cookie without domain (for localhost and direct IP access)
  res.cookie('token', token, baseCookieOptions);
  console.log('🍪 Cookie set without domain (for localhost)');

  // IMPORTANT: Return the token so it can be sent in response body
  return token;
};
