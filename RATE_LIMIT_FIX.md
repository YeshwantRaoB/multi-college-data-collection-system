# Rate Limit Error Fix 🚦

## ❌ Error: 429 - Too Many Requests

**What happened:** You exceeded the login attempt limit (was 5 attempts per 15 minutes).

**Why:** Each login attempt makes 2 requests:
1. OPTIONS request (CORS preflight)
2. POST request (actual login)

So you hit the limit faster than expected.

---

## ✅ Fixed!

I've updated the rate limiting configuration:

### Changes Made:
1. **Increased limit:** 5 → 20 attempts per 15 minutes
2. **Skip OPTIONS requests:** CORS preflight requests no longer count toward the limit

### Files Changed:
- `backend/server.js` (lines 26-31)

---

## 🚀 Deploy the Fix

### Option 1: Redeploy to Vercel (Immediate Fix)

```bash
# Commit and push
git add .
git commit -m "Increase auth rate limit and skip OPTIONS requests"
git push

# Vercel will auto-deploy
# OR manually: Vercel Dashboard → Backend → Deployments → Redeploy
```

**Then try logging in again** - should work immediately!

---

### Option 2: Wait 15 Minutes (No Deploy Needed)

The rate limit resets every 15 minutes. Just wait and try again.

---

## 🔍 Understanding Rate Limits

### Current Limits (After Fix):

**General API:**
- 100 requests per 15 minutes per IP
- Applies to all `/api/*` endpoints

**Login Endpoint:**
- 20 login attempts per 15 minutes per IP
- Only counts POST requests (OPTIONS are skipped)
- Applies to `/api/auth/login`

### Why Rate Limiting?

Rate limiting protects against:
- Brute force password attacks
- DDoS attacks
- Accidental infinite loops in code

---

## 🐛 How to Tell You're Rate Limited

**In Browser Console:**
```
POST https://server-mcdcs.vercel.app/api/auth/login 429 (Too Many Requests)
```

**In Vercel Logs:**
```
responseStatusCode: 429
message: "Too many authentication attempts, please try again later."
```

**On Frontend:**
You'll see: "Too many authentication attempts, please try again later."

---

## 💡 Tips for Development

### For Local Testing:

When developing locally, you can temporarily disable rate limiting:

```javascript
// In backend/server.js
// Comment out these lines during development:
// app.use('/api/', limiter);
// app.use('/api/auth/login', authLimiter);
```

**⚠️ Remember to uncomment before deploying to production!**

---

### For Production Testing:

Use different accounts or wait between attempts:
- Create test users
- Test with different browsers (different IP tracking)
- Wait 15 minutes between test sessions
- Clear browser cache/cookies

---

## 🔧 Customizing Rate Limits

If you need different limits, edit `backend/server.js`:

```javascript
// General API limit
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Change this number
    message: 'Too many requests from this IP, please try again later.'
});

// Auth limit
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // Change this number
    message: 'Too many authentication attempts, please try again later.',
    skip: (req) => req.method === 'OPTIONS' // Keep this!
});
```

**Recommendations:**
- **Development:** 50-100 login attempts
- **Production:** 10-20 login attempts
- **Public demo:** 5-10 login attempts

---

## ✅ Verification

After deploying the fix:

1. **Wait for deployment** to complete (1-2 minutes)
2. **Try logging in:**
   - Username: `admin`
   - Password: `admin123`
3. **Should work now!** ✅

---

## 🆘 Still Getting 429?

If you're still rate limited after deploying:

1. **Wait the full 15 minutes** from your last attempt
2. **Clear browser cache and cookies**
3. **Try in incognito/private browsing mode**
4. **Check Vercel logs** to confirm new deployment is active
5. **Verify the code changes** are in the deployed version

---

## 📊 Monitoring Rate Limits

### Check Current Status:

You can add a rate limit status endpoint (optional):

```javascript
// In backend/server.js, add this route:
app.get('/api/rate-limit-status', (req, res) => {
    res.json({
        generalLimit: '100 requests per 15 minutes',
        authLimit: '20 login attempts per 15 minutes',
        message: 'Rate limits reset every 15 minutes'
    });
});
```

---

## 🎯 Summary

**Problem:** Rate limited after 5 login attempts  
**Solution:** Increased to 20 attempts + skip OPTIONS requests  
**Action:** Redeploy backend or wait 15 minutes  

**After fix:** You can make 20 login attempts per 15 minutes! 🎉

---

**Last Updated:** January 6, 2025  
**Issue:** 429 Too Many Requests on login  
**Status:** ✅ Fixed
