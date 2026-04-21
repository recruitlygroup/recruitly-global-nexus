# Quick Reference: Production Support & Common Tasks

**Quick navigation for developers and support teams.**

---

## 🚨 Emergency Troubleshooting

### "Dashboard is frozen / not responding"

1. **Hard refresh:** `Cmd+Shift+R` (clear cache)
2. **Check browser console:** `F12` → Console → look for red errors
3. **Open DevTools Performance tab:** F12 → Performance → Reload & record 3 seconds → Check for long tasks/frames
4. **Check Supabase status:** https://status.supabase.com
5. **Restart the browser tab** if still frozen

### "Upload is failing"

1. Check that file is < 20MB
2. Verify file type is PDF, ZIP, DOC, or DOCX
3. Check browser console for error message
4. Verify `GOOGLE_SERVICE_ACCOUNT_JSON` secret is set in Supabase Dashboard
5. Test with curl (see **EDGE_FUNCTION_DEBUGGING_GUIDE.md**)

### "Notification/status update not showing"

1. Check NotificationBell subscription in browser DevTools → Network → Filter "realtime"
2. Verify user is logged in and has valid session
3. Check for RLS policy violations: Supabase Dashboard → SQL Editor → look for "permission denied" in logs
4. Try manual refresh: Click Refresh button in admin tab

### "Admin action returns 401 Unauthorized"

1. **Log out and back in** (session may be expired)
2. Verify user has `admin` role in `user_roles` table
3. Check Authorization header is being sent: DevTools → Network → admin-actions request → Headers → "authorization"

---

## 🛠️ Common Commands

### Local Development

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Run Supabase functions locally
supabase functions serve

# View function logs
supabase functions logs <function-name> --follow

# Deploy a function
supabase functions deploy <function-name>
```

### Git Operations

```bash
# Check status
git status

# Stage all changes
git add -A

# Commit with message
git commit -m "🔧 Fix: description of change"

# Push to remote
git push origin main

# View recent commits
git log --oneline -10
```

### Database (Supabase Dashboard)

**Location:** Supabase Project → SQL Editor

```sql
-- Check a user's role
SELECT * FROM user_roles WHERE user_id = '<user-uuid>';

-- Check RLS policies on a table
SELECT * FROM pg_policies WHERE tablename = 'candidates';

-- View recent notifications for a user
SELECT * FROM notifications WHERE user_id = '<user-uuid>' ORDER BY created_at DESC LIMIT 20;

-- View all pending documents (PCC not received)
SELECT id, full_name, pcc_status, slc_status FROM candidates 
WHERE pcc_status != 'Received' AND created_at > now() - interval '30 days';
```

---

## 📊 Monitoring & Metrics

### Key Metrics to Watch

| Metric | Expected | Warning | Critical |
|--------|----------|---------|----------|
| Dashboard load time | < 2s | > 3s | > 5s |
| Function response time | < 1s | > 2s | > 5s |
| API error rate | 0% | > 1% | > 5% |
| Realtime latency | < 100ms | > 500ms | > 2s |
| Database connection pool | < 70% used | > 80% | > 90% |

### Where to Check

1. **Browser DevTools:**
   - Network tab → Watch response times
   - Performance tab → Look for long tasks
   - Console → Check for errors/warnings

2. **Supabase Dashboard:**
   - Analytics → API metrics
   - SQL Editor → Query performance

3. **Function Logs:**
   ```bash
   supabase functions logs admin-actions --follow
   ```

---

## 🔐 Security Checklist

Before going to production:

- [ ] All secrets configured in Supabase (not in code)
- [ ] CORS headers correct (only allow your domain)
- [ ] Auth headers verified in all functions
- [ ] RLS policies enabled on all tables
- [ ] No sensitive data in logs
- [ ] HTTPS enforced
- [ ] Rate limiting configured (if needed)

---

## 📋 Deployment Workflow

### 1. Develop & Test Locally

```bash
npm run dev          # Start frontend
supabase functions serve  # Start edge functions in another terminal
# Test in browser, no errors in console
```

### 2. Commit & Push to Main

```bash
git add -A
git commit -m "🔧 Fix: clear description"
git push origin main
```

### 3. Deploy Functions (if changed)

```bash
supabase functions deploy upload-to-drive
supabase functions deploy admin-actions
# etc. for any functions that changed
```

### 4. Verify on Staging

- Visit staging URL
- Test critical flows:
  - Admin login → view dashboard
  - Recruiter login → add candidate
  - Upload file → check Google Drive
- Check logs: `supabase functions logs --follow`

### 5. Deploy to Production

- Same as staging
- Monitor function logs for errors
- Check dashboard performance

---

## 🎯 Feature Flags / Config Changes

### Enabling Interview Type Feature

(Once implemented)

```sql
-- Add column to candidates table
ALTER TABLE candidates ADD COLUMN interview_type TEXT DEFAULT 'Standard';

-- Update RLS policies if needed
-- (usually no change required)

-- Frontend: AdminCandidatesTab will show new dropdown
```

### Disabling a Function (Emergency)

If a function is broken and needs to be disabled immediately:

1. **Option A:** Remove from frontend
   ```typescript
   // Comment out the invoke call
   // await supabase.functions.invoke("broken-function", {...});
   ```
   Then push code update.

2. **Option B:** Return error from function
   ```typescript
   // In the edge function:
   if (Deno.env.get("FUNCTION_DISABLED") === "true") {
     return new Response(JSON.stringify({ error: "Disabled for maintenance" }), { status: 503 });
   }
   ```
   Set environment variable in Supabase Dashboard.

---

## 🐛 Debugging Scripts

### Test Upload-to-Drive Function

Save as `test-upload.sh`:

```bash
#!/bin/bash

TOKEN="$1"
FILE="$2"

if [ -z "$TOKEN" ] || [ -z "$FILE" ]; then
  echo "Usage: ./test-upload.sh <token> <file-path>"
  exit 1
fi

curl -X POST http://localhost:54321/functions/v1/upload-to-drive \
  -H "Authorization: Bearer $TOKEN" \
  -F "candidateName=Test User" \
  -F "passportNumber=TEST123456" \
  -F "file=@$FILE"
```

Run with:
```bash
chmod +x test-upload.sh
./test-upload.sh "$TOKEN" "./test.pdf"
```

### Get Auth Token from Browser

In browser console:
```javascript
const session = await supabase.auth.getSession();
console.log(session.data.session.access_token);
// Copy the long token string
```

---

## 📞 Support Contacts

| Issue | Contact | Link |
|-------|---------|------|
| Supabase down | Status page | https://status.supabase.com |
| Google Drive API issues | Google Cloud Console | https://console.cloud.google.com |
| Deno runtime errors | Deno Docs | https://deno.land/manual |
| React errors | React DevTools | https://react-devtools-tutorial.vercel.app |

---

## 📚 Useful Links

- **Repository:** https://github.com/recruitlygroup/recruitly-global-nexus
- **Supabase Project:** [Your Supabase URL]
- **Google Cloud Project:** [Your GCP Project]
- **Production Domain:** [Your prod URL]
- **Staging Domain:** [Your staging URL]

---

## 🗂️ Important Files Reference

| File | Purpose |
|------|---------|
| `src/pages/AdminDashboard.tsx` | Admin dashboard entry point |
| `src/pages/RecruiterDashboard.tsx` | Recruiter dashboard |
| `src/components/admin/AdminCandidatesTab.tsx` | Candidate management UI |
| `supabase/functions/upload-to-drive/index.ts` | Google Drive upload |
| `supabase/functions/admin-actions/index.ts` | Admin API |
| `src/lib/debounce.ts` | Debounce utility |
| `.env` | Environment variables (local only) |
| `supabase/functions/import_map.json` | Deno import aliases |

---

## ⚡ Performance Tips

**For Developers:**
- Lazy-load admin tabs → don't load all tabs at once
- Memoize expensive computations → use `useMemo`
- Debounce user input → use `useDebounce` hook
- Batch database queries → use `Promise.all()`
- Cancel ongoing requests on unmount → store `AbortController`

**For Users:**
- Use Chrome (better devtools)
- Clear cache occasionally (Cmd+Shift+R)
- Don't open too many tabs
- Close unused browser extensions

---

## 🚀 Next Steps (Ordered by Priority)

1. ✅ **Deploy current performance fixes** → Commit & test
2. 🔧 **Debug edge functions** → Use EDGE_FUNCTION_DEBUGGING_GUIDE.md
3. 📤 **Complete Drive upload** → Add secrets, test end-to-end
4. 🏷️ **Add interview type feature** → DB schema + UI
5. 📊 **Broad optimization** → Bundle size, lazy-loading
6. 📈 **Add monitoring** → Error tracking (Sentry) + logging

---

**Last Updated:** 2026-01-17  
**Version:** 1.0  
**Status:** 🟢 Active
