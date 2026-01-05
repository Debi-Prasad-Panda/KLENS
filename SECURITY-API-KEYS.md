# K-LENS Security Documentation

## API Key Management & Rotation Guide

### Overview
This document provides procedures for managing and rotating API keys in the K-LENS application following OWASP best practices.

---

## 🔑 Current API Keys in Use

### 1. **Google Gemini API Key**
- **Purpose**: AI embeddings and document analysis
- **Location**: Backend (`GEMINI_API_KEY` environment variable)
- **Exposure**: Server-side only (NEVER exposed to client)
- **Get Key**: https://makersuite.google.com/app/apikey

### 2. **OpenRouter API Key**
- **Purpose**: LLM completions (chat feature)
- **Location**: Backend (`OPENROUTER_API_KEY` environment variable)
- **Exposure**: Server-side only
- **Get Key**: https://openrouter.ai/keys

### 3. **Supabase Keys**
- **Service Role Key**: Backend operations (`SUPABASE_KEY`)
  - Full database access
  - Server-side only
  - NEVER expose to client
- **Anon Key**: Frontend operations (`VITE_SUPABASE_ANON_KEY`)
  - Limited by Row Level Security (RLS)
  - Safe to expose in client code
- **Get Keys**: https://app.supabase.com/project/_/settings/api

### 4. **JWT Secret**
- **Purpose**: Legacy authentication token signing
- **Location**: Backend (`JWT_SECRET` environment variable)
- **Minimum Length**: 32 characters
- **Generate**: `openssl rand -base64 32`

---

## 🔒 Security Best Practices

### Environment Variables
✅ **DO:**
- Store all secrets in `.env` files
- Add `.env` to `.gitignore`
- Use different keys for development, staging, and production
- Use `.env.example` with placeholder values for documentation
- Rotate keys regularly (every 90 days recommended)

❌ **DON'T:**
- Hard-code API keys in source code
- Commit `.env` files to version control
- Share API keys via email, Slack, or other insecure channels
- Reuse the same keys across environments
- Expose backend keys (service role, JWT secret) to the frontend

### Client-Side Exposure Check
Run this command to verify no secrets are exposed in frontend code:
```bash
# Search for potential API keys in frontend code
grep -r "AIzaSy" src/
grep -r "sk-or-v1" src/
grep -r "service_role" src/
```

All searches should return **zero results**. If any keys are found, remove them immediately.

---

## 🔄 API Key Rotation Procedures

### When to Rotate Keys
- **Immediately** if a key is exposed (committed to git, shared publicly, etc.)
- **Every 90 days** as routine security maintenance
- **After team member departure** who had access to keys
- **After security incident** or suspected breach

### General Rotation Process
1. **Generate New Key** from the provider
2. **Update `.env` files** with the new key
3. **Restart Application** to load new environment variables
4. **Test Functionality** to ensure everything works
5. **Revoke Old Key** in the provider's dashboard
6. **Document Rotation** (date, reason) in security log

---

## 🛠️ Specific Rotation Procedures

### Rotating Gemini API Key

1. **Generate New Key:**
   - Go to https://makersuite.google.com/app/apikey
   - Click "Create API Key"
   - Copy the new key

2. **Update Backend:**
   ```bash
   # Edit backend .env file
   nano backend-python/.env
   # Update: GEMINI_API_KEY=new_key_here
   ```

3. **Restart Backend:**
   ```bash
   docker-compose restart backend-python
   ```

4. **Test AI Features:**
   - Upload a document →See AI summary generated
   - Use chat feature
   - Run search with semantic similarity

5. **Revoke Old Key:**
   - Go back to Google AI Studio
   - Find the old key and click "Delete"

### Rotating Supabase Keys

⚠️ **CAUTION**: Rotating Supabase keys affects all connected clients

1. **Generate New Keys:**
   - Go to https://app.supabase.com/project/_/settings/api
   - Click "Reset service_role secret" or "Reset anon key"
   - Copy the new keys

2. **Update Backend (.env):**
   ```bash
   SUPABASE_KEY=new_service_role_key_here
   ```

3. **Update Frontend (.env):**
   ```bash
   VITE_SUPABASE_ANON_KEY=new_anon_key_here
   ```

4. **Rebuild Frontend:**
   ```bash
   npm run build
   ```

5. **Restart Services:**
   ```bash
   docker-compose restart
   ```

6. **Test Authentication:**
   - Login/logout
   - Document upload
   - Search functionality

### Rotating OpenRouter API Key

1. **Generate New Key:**
   - Go to https://openrouter.ai/keys
   - Click "Create Key"
   - Copy the new key

2. **Update Backend:**
   ```bash
   # Edit backend .env file
   OPENROUTER_API_KEY=new_key_here
   ```

3. **Restart Backend:**
   ```bash
   docker-compose restart backend-python
   ```

4. **Test Chat:**
   - Send a message in the chat interface
   - Verify AI responses are working

5. **Revoke Old Key:**
   - Go back to OpenRouter
   - Find the old key and click "Revoke"

### Rotating JWT Secret

⚠️ **WARNING**: This invalidates all existing user sessions

1. **Generate New Secret:**
   ```bash
   openssl rand -base64 32
   ```

2. **Update Backend (.env):**
   ```bash
   JWT_SECRET=new_generated_secret_here
   ```

3. **Restart Backend:**
   ```bash
   docker-compose restart backend-python
   ```

4. **Notify Users:**
   - All users will need to log in again
   - Session tokens are now invalid

---

## 📋 Rotation Checklist

Use this checklist when rotating keys:

- [ ] Identify which key needs rotation
- [ ] Generate new key from provider
- [ ] Update `.env` files (backend and/or frontend)
- [ ] Restart affected services
- [ ] Test all affected functionality
- [ ] Verify old key is revoked in provider dashboard
- [ ] Update team documentation/password manager
- [ ] Log rotation in security log (date, person, reason)
- [ ] Monitor error logs for 24 hours post-rotation

---

## 🚨 Emergency Key Revocation

If a key is compromised (exposed in git, shared publicly, etc.):

1. **Immediately Revoke** the key in the provider's dashboard
2. **Generate New Key** and update `.env` files
3. **Restart Services** immediately
4. **Investigate Scope**:
   - Check git history: `git log -S "AIzaSy" --all`
   - Check if the key was used maliciously (API logs)
5. **Notify Team** of the incident
6. **Document Incident** (what was exposed, how, remediation)

---

## 🔍 Audit & Monitoring

### Regular Security Audits
Run these checks monthly:

```bash
# 1. Check for hard-coded secrets in codebase
grep -r "AIzaSy" .
grep -r "sk-or-v1" .
grep -r "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9" .

# 2. Check .env is in .gitignore
grep "\.env" .gitignore

# 3. Verify .env.example has no real keys
cat .env.example | grep -E "(AIzaSy|sk-or-v1)"
```

### API Key Usage Monitoring
- Monitor API quotas in provider dashboards
- Set up alerts for unusual usage patterns
- Review API logs for unauthorized access attempts

---

## 📚 Additional Resources

- [OWASP API Security Top 10](https://owasp.org/www-project-api-security/)
- [OWASP Secrets Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
- [12-Factor App Config](https://12factor.net/config)

---

**Last Updated**: 2026-01-04  
**Document Owner**: Security Team  
**Review Schedule**: Quarterly
