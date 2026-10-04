# 🚀 Deployment & Handoff Checklist

**Use this checklist before deploying to staging/production or handing off to a new team.**

---

## ✅ Pre-Deployment Verification

### Code Quality
- [ ] All TypeScript errors resolved: `npm run type-check` (if available)
- [ ] Production build succeeds: `npm run build`
- [ ] Build has 0 errors (check terminal output)
- [ ] No console warnings in dev mode: `npm run dev`

### Git Status
- [ ] All changes committed: `git status` shows clean
- [ ] Latest commits pushed: `git push origin main`
- [ ] Commit messages are clear and descriptive
- [ ] No uncommitted changes

### Performance
- [ ] Subscription batching implemented in NotificationBell.tsx
- [ ] AdminCandidatesTab has throttled subscription (500ms)
- [ ] RecruiterDashboard has throttled subscription (500ms)
- [ ] VisaSuccessStories uses requestAnimationFrame (not setInterval)

### Deno Configuration
- [ ] `deno.json` exists in root directory
- [ ] `supabase/deno.json` exists with proper config
- [ ] `supabase/functions/import_map.json` exists with deno.land/x mirrors
- [ ] `.vscode/settings.json` enables Deno language server
- [ ] `.vscode/extensions.json` recommends Deno extension

### Documentation
- [ ] SESSION_SUMMARY.md exists and is current
- [ ] QUICK_REFERENCE.md exists with troubleshooting
- [ ] EDGE_FUNCTION_DEBUGGING_GUIDE.md exists with curl examples
- [ ] PRODUCTION_STABILITY_ROADMAP.md exists with next steps
- [ ] DOCUMENTATION_INDEX.md exists for navigation
- [ ] All markdown files are readable and linked

---

## 🚀 Staging Deployment

### 1. Environment Setup
- [ ] Supabase project is configured
- [ ] Database is up to date
- [ ] Environment variables are set in Supabase Dashboard:
  - [ ] `SUPABASE_URL`
  - [ ] `SUPABASE_ANON_KEY`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`
  - [ ] Any other required secrets

### 2. Deploy Frontend
```bash
npm run build
# Upload dist/ folder to hosting platform
# Or use: vercel deploy, netlify deploy, etc.
```
- [ ] Build succeeds with 0 errors
- [ ] Assets are minified
- [ ] Source maps are available (optional but recommended)
- [ ] Staging URL is accessible

### 3. Deploy Edge Functions
```bash
supabase functions deploy admin-actions
supabase functions deploy submit-consultation
supabase functions deploy intent-router
supabase functions deploy upload-to-drive
supabase functions deploy create-candidate-drive-folder
supabase functions deploy document-status-alert
supabase functions deploy submit-wisescore
supabase functions deploy upload-resume
supabase functions deploy log-auth-attempt
supabase functions deploy smart-intent
```
- [ ] Each function deploys without errors
- [ ] Function logs show no startup errors: `supabase functions logs <name>`

### 4. Test Critical Flows
- [ ] Admin login → view dashboard → check stats load
- [ ] Admin view candidates → filter works → refresh works
- [ ] Recruiter login → view dashboard → add candidate
- [ ] Recruiter upload file → check Google Drive (if secrets configured)
- [ ] Submit consultation form → check submission saved
- [ ] AI intent routing → search works → routes to correct service

### 5. Monitor Logs
```bash
# Watch function logs for errors
supabase functions logs --follow

# In browser console (F12), check for:
# - No 401/403/500 errors
# - No red error messages
# - No infinite loops
```
- [ ] No errors in browser console
- [ ] No errors in Supabase function logs
- [ ] Notifications appear without lag
- [ ] Dashboard responsive and no freezes

---

## 🔧 Verify Edge Functions Work

Test each function locally before deploying:

```bash
# Get your auth token (from browser console after login)
TOKEN="your_auth_token_here"

# Test admin-actions
curl -X POST http://localhost:54321/functions/v1/admin-actions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "action": "get_dashboard_stats" }'

# Test submit-consultation
curl -X POST http://localhost:54321/functions/v1/submit-consultation \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Test User",
    "email": "test@example.com",
    "service": "education",
    "message": "Test message"
  }'

# Test intent-router
curl -X POST http://localhost:54321/functions/v1/intent-router \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "query": "I want to hire workers for Germany" }'
```

- [ ] admin-actions returns valid JSON
- [ ] submit-consultation saves consultation_request
- [ ] intent-router identifies service correctly
- [ ] All functions return 200 (not 401/403/500)

---

## 📋 Configuration Checklist

### Supabase Dashboard Secrets
- [ ] `GOOGLE_SERVICE_ACCOUNT_JSON` set (for Drive upload)
- [ ] `GOOGLE_DRIVE_PARENT_FOLDER_ID` set (for Drive upload)
- [ ] Secrets are valid and not expired
- [ ] Test with: `supabase functions logs upload-to-drive --follow` during test upload

### Database
- [ ] RLS policies enabled on all tables
- [ ] Check: `SELECT * FROM pg_policies WHERE schemaname='public' LIMIT 10;`
- [ ] All required tables exist:
  - [ ] `candidates`
  - [ ] `notifications`
  - [ ] `job_listings`
  - [ ] `consultation_requests`
  - [ ] `auth_logs`
  - etc.

### Frontend Environment
- [ ] `.env` file configured (if needed)
- [ ] API URLs point to correct Supabase instance
- [ ] Authentication flow works

---

## ⚡ Performance Checks

### Browser Performance
1. Open staging URL
2. Open DevTools (F12)
3. Go to Performance tab
4. Record a 10-second session:
   - [ ] Navigate to admin dashboard
   - [ ] View candidates list
   - [ ] Trigger notification (if possible)
5. Stop recording, analyze:
   - [ ] No frames longer than 100ms
   - [ ] No long main-thread tasks (red blocks)
   - [ ] Frame rate stays above 50fps

### Bundle Size
```bash
npm run build
# Check output for any chunks > 500 kB
```
- [ ] No chunks larger than 500 kB (or acceptable for your app)
- [ ] Main bundle < 200 kB gzipped

### Realtime Performance
1. Open browser DevTools → Network tab
2. Filter for "realtime" or "supabase"
3. Trigger updates (e.g., add candidate):
   - [ ] Realtime connection established
   - [ ] No 401/403 errors on realtime requests
   - [ ] Update received within 1 second

---

## 🔐 Security Checks

- [ ] HTTPS enforced (check SSL certificate)
- [ ] No hardcoded secrets in code
- [ ] Authentication header verified in functions
- [ ] RLS policies prevent unauthorized access
- [ ] CORS headers correct (not wildcard if possible)
- [ ] Error messages don't expose sensitive info

Verify with CURL (should fail without auth):
```bash
curl -X POST http://staging.example.com/api/admin-actions
# Should return 401 Unauthorized (not 200)
```

---

## 📱 Browser Compatibility

Test on:
- [ ] Chrome/Chromium (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile browser (iOS Safari or Chrome Mobile)

Check:
- [ ] Forms submit correctly
- [ ] Buttons respond to clicks
- [ ] Navigation works
- [ ] No JavaScript errors in console

---

## 🧑‍💼 Team Handoff

### Before Handing Off, Verify Team Has:

**Documentation Access:**
- [ ] Read SESSION_SUMMARY.md
- [ ] Bookmarked QUICK_REFERENCE.md
- [ ] Understand where EDGE_FUNCTION_DEBUGGING_GUIDE.md is
- [ ] Know about PRODUCTION_STABILITY_ROADMAP.md for planning

**Local Setup:**
- [ ] Clone the repository
- [ ] Follow DENO_SETUP.md to configure Deno
- [ ] Run `npm install` successfully
- [ ] Run `npm run dev` and see no errors
- [ ] Can run `supabase functions serve`

**Communication:**
- [ ] Team knows who to contact for questions
- [ ] Team knows where to find logs (Supabase Dashboard)
- [ ] Team knows how to test functions locally (curl examples)
- [ ] Team knows escalation path for critical issues

**Access:**
- [ ] Team has GitHub access to repository
- [ ] Team has Supabase project access (appropriate role)
- [ ] Team has Google Cloud access (for Drive integration)
- [ ] Team has staging/production deployment credentials

---

## 🚨 Emergency Rollback Plan

If deployment breaks:

1. **Identify the issue:**
   ```bash
   supabase functions logs --follow
   # Look for recent errors
   ```

2. **Rollback options:**
   
   **Option A: Revert last commit**
   ```bash
   git revert HEAD
   git push origin main
   # Redeploy
   ```

   **Option B: Disable broken function**
   ```
   Supabase Dashboard → Edge Functions → [function name] → Disable
   ```

   **Option C: Revert to previous staging deployment**
   - If you have a previous good build, redeploy it

3. **Communicate:**
   - Notify team of rollback
   - Document what broke and why
   - Plan fix for next session

---

## ✅ Final Sign-Off

### Before Marking "Complete"

- [ ] All verification items above are checked
- [ ] Team is trained and confident
- [ ] Runbooks are documented
- [ ] Emergency procedures are clear
- [ ] Monitoring is enabled (if available)

### Sign-Off

- **Deployed by:** _________________________ (Name/Date)
- **Verified by:** _________________________ (Name/Date)
- **Approved by:** _________________________ (Name/Date)

---

## 📞 After Deployment

### Day 1 (Monitoring)
- [ ] Check function logs hourly: `supabase functions logs --follow`
- [ ] Monitor dashboard performance (Chrome DevTools)
- [ ] Confirm notifications work
- [ ] Test critical flows (login, upload, etc.)

### Day 3-7 (Stability)
- [ ] No critical errors in logs
- [ ] All metrics normal
- [ ] Users reporting no issues
- [ ] Consider moving to production

### Weekly (Ongoing)
- [ ] Review logs for errors
- [ ] Check performance metrics
- [ ] Plan next improvements

---

## 📝 Deployment Record

**Date Deployed:** ____________  
**Version:** ____________  
**Deployed To:** [ ] Staging [ ] Production  
**Deployed By:** ____________  
**Issues Encountered:** ____________  
**Notes:** ____________  

---

**Good luck with your deployment! 🚀**

For any issues, refer to:
- **QUICK_REFERENCE.md** — Emergency troubleshooting
- **EDGE_FUNCTION_DEBUGGING_GUIDE.md** — API errors
- **PRODUCTION_STABILITY_ROADMAP.md** — Strategic questions
