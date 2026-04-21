# Production Stability & Feature Roadmap

**Last Updated:** 2026-01-17  
**Status:** In-Progress (Performance & API Stabilization Phase)

## 🎯 Objective

Stabilize the Recruitly production environment by fixing dashboard freezes, resolving edge-function API errors, completing the Google Drive upload pipeline, and adding missing features with minimal disruption to the current codebase.

---

## ✅ Completed Tasks

### 1. **UI Enhancements** (Committed & Pushed)
- Updated `SmartIntentHero.tsx` hero section with improved CTAs, input focus states, and global positioning
- Enhanced `HomepageHiringSection.tsx` with trust badges and refined card layouts
- Replaced auto-scroll `setInterval` in `VisaSuccessStories.tsx` with `requestAnimationFrame` for smoother, safer rendering
- All changes preserve existing routing logic and animations

### 2. **Lovable Integration Removal** (Committed & Pushed)
- Removed `lovable-tagger` dependency from `package.json` and `vite.config.ts`
- Deleted favicon placeholder files
- Updated READMEs to remove Lovable references
- Repo now fully self-owned

### 3. **Deno & Import Stabilization** (Committed & Pushed)
- Created `deno.json` (root) and `supabase/deno.json` with proper Deno compiler & import settings
- Added `.vscode/settings.json` and `.vscode/extensions.json` to enable Deno support in VS Code
- Created `supabase/functions/import_map.json` mapping `@supabase/supabase-js` to stable `deno.land/x@2.45.1`
- Replaced all `esm.sh` imports across Supabase Edge Functions with `deno.land/x` mirrors
- Functions updated: `smart-intent`, `submit-wisescore`, `create-candidate-drive-folder`, `admin-actions`, `intent-router`, `upload-resume`, `log-auth-attempt`, `submit-consultation`, `upload-to-drive`, `document-status-alert`
- Created documentation: `DENO_SETUP.md`, `CDN_FIX_SUMMARY.md`

### 4. **Subscription Throttling & Cleanup** (Committed & Pushed)
- Implemented batching pattern in `NotificationBell.tsx`: realtime inserts buffered + flushed every 300ms
- Applied same pattern to `AdminCandidatesTab.tsx` and `RecruiterDashboard.tsx` postgres_changes subscriptions
- Fixed TypeScript cast issue in `RecruiterDashboard.tsx` broadcast_messages query
- All subscriptions now properly clean up channels on unmount
- Expected impact: **Significant reduction in UI re-render floods** during high-frequency updates

### 5. **Helper Libraries** (New)
- Created `src/lib/debounce.ts` for controlled user-action debouncing across dashboards
- Exported for use in admin tabs and form handlers

---

## 🔄 In-Progress / Partially Complete

### 1. **Dashboard Freeze Investigation & Fix**
**Root Causes Identified:**
- High-frequency realtime subscription handlers causing UI re-renders on every insert
- `setInterval` in `SmartIntentHero.tsx` (3.5s placeholder rotation) — **Status:** Kept by design (simple, non-blocking)
- Batch table updates in admin tabs without debouncing

**Actions Taken:**
- ✅ Replaced realtime floods with throttled handlers (300ms batches)
- ✅ Switched `VisaSuccessStories.tsx` to requestAnimationFrame (smoother, can be cancelled)
- ✅ Added `debounce.ts` helper for manual debouncing of user-triggered updates

**Validation Needed:**
- [ ] Run app locally with Chrome DevTools Performance/Memory profiler
- [ ] Reproduce "dashboard freeze" scenario → capture flame graph
- [ ] Verify no additional hidden intervals or event listeners

**Next Step:** Local performance profiling once above changes are merged.

### 2. **Edge Function Error Tracing**
**Functions Known to Be Used:**
- `admin-actions` — Invoked in AdminDashboard, AdminDataTab, AdminPartnersTab, AdminConsultationsTab
- `submit-consultation` — Invoked in ApostilleServices, ToursAndTravels, useSubmitConsultation hook
- `submit-wisescore` — Invoked in WiseScoreFormV2
- `intent-router` — Invoked in useIntentRouter hook (AI routing)
- `upload-to-drive` — Invoked in RecruiterDashboard (file upload)
- `create-candidate-drive-folder` — Invoked in RecruiterDashboard (folder creation)
- `document-status-alert` — Invoked in RecruiterDashboard & AdminCandidatesTab (PCC/SLC status updates)

**Known Issues:**
- Some `functions.invoke()` calls may fail silently (wrapped in `.catch(() => {})`)
- CORS headers present but auth headers may be missing or mismatched

**Debugging Strategy:**
1. Enable verbose logging in edge functions (add `console.error()` statements)
2. Inspect Supabase function logs: `supabase functions logs <function-name>`
3. Test locally with `supabase functions serve` + Postman/curl
4. Verify Authorization header is passed correctly from frontend
5. Check for RLS policy violations in database update calls

**Next Step:** Trace specific failing invocations with live logs.

### 3. **Google Drive Upload Pipeline**
**Status:** Function code complete, needs deployment & testing

**`upload-to-drive/index.ts` includes:**
- ✅ Google OAuth2 JWT service account flow
- ✅ Dynamic folder creation (with idempotency check)
- ✅ File upload with metadata
- ✅ CORS headers and auth verification
- ✅ File type validation (PDF, ZIP, DOC, DOCX)
- ✅ Size limit (20MB)

**Missing:**
1. **Secrets in Supabase Dashboard:**
   - `GOOGLE_SERVICE_ACCOUNT_JSON` — Full JSON string of service account key
   - `GOOGLE_DRIVE_PARENT_FOLDER_ID` — Folder ID from Drive URL (currently hardcoded as fallback)

2. **Database Metadata Table:**
   - Need to add `candidate_documents` table to track uploaded files
   - Schema:
     ```sql
     CREATE TABLE candidate_documents (
       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
       candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
       file_name TEXT NOT NULL,
       file_id TEXT NOT NULL,
       drive_folder_id TEXT,
       drive_web_view_link TEXT,
       uploaded_at TIMESTAMP DEFAULT now(),
       uploaded_by UUID REFERENCES auth.users(id),
       UNIQUE(candidate_id, file_id)
     );
     ```

3. **RLS Policy:**
   ```sql
   ALTER TABLE candidate_documents ENABLE ROW LEVEL SECURITY;
   CREATE POLICY candidate_documents_recruiter_access
     ON candidate_documents FOR SELECT
     USING (
       EXISTS (
         SELECT 1 FROM candidates
         WHERE candidates.id = candidate_documents.candidate_id
         AND candidates.recruiter_id = auth.uid()
       )
       OR EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
     );
   CREATE POLICY candidate_documents_insert
     ON candidate_documents FOR INSERT
     WITH CHECK (uploaded_by = auth.uid());
   ```

4. **Frontend Storage:**
   - After successful upload, save metadata to `candidate_documents` table
   - Update RecruiterDashboard to display upload history

**Next Step:** Add secrets to Supabase, deploy function, add DB schema, test end-to-end.

---

## 📋 Remaining High-Priority Work

### 1. **Fix Status Update Issues (PCC/SLC)**
**Symptoms:**
- Updates to `pcc_status` and `slc_status` may not persist or may not trigger notifications
- Related to RLS policies or edge-function side-effects

**Investigation Needed:**
1. Verify RLS policies on `candidates` table allow admin/recruiter updates
2. Check `document-status-alert` function for proper payload handling
3. Ensure correct user_id is passed in invocation headers
4. Validate function logs for errors

**Expected Fix:** RLS policy adjustment + function debugging (est. 1-2 hours)

### 2. **Interview Type Feature**
**Requirements:**
- Add `interview_type` column to `candidates` table
  ```sql
  ALTER TABLE candidates ADD COLUMN interview_type TEXT DEFAULT 'Standard';
  -- Consider ENUM: 'Standard', 'Technical', 'Cultural Fit', 'Group'
  ```
- Frontend select UI in AdminCandidatesTab to allow admin selection
- Save & persist to database
- Display in recruiter view

**Estimated Effort:** 1-2 hours (DB + UI + handlers)

### 3. **Broad Performance Optimization**
- [ ] Audit unused imports & dead code
- [ ] Profile bundle size (Vite build analysis)
- [ ] Lazy-load admin tabs (defer until clicked)
- [ ] Memoize expensive computations in filter/sort
- [ ] Consider virtual scrolling for candidate lists (if >1000 rows)

**Estimated Effort:** 2-4 hours

### 4. **Error Handling & Logging**
- [ ] Add global error boundary in React tree
- [ ] Implement sentry/LogRocket for production error tracking
- [ ] Add retry logic for failed API calls
- [ ] Structured logging in edge functions

**Estimated Effort:** 2-3 hours

---

## 🚀 Recommended Next Steps (In Order)

1. **Commit & Deploy Current Changes**
   - ✅ All changes committed & pushed
   - [ ] Deploy to staging/production

2. **Validate Performance Improvements**
   - [ ] Local profiling with DevTools
   - [ ] Test high-frequency admin scenarios
   - [ ] Confirm no new regressions

3. **Edge Function Debugging**
   - [ ] Enable function logs in Supabase dashboard
   - [ ] Test each function individually with curl/Postman
   - [ ] Fix any auth/CORS/RLS issues found
   - [ ] **Estimated:** 2-3 hours

4. **Complete Google Drive Upload**
   - [ ] Add service account secrets to Supabase
   - [ ] Deploy `upload-to-drive` function
   - [ ] Create `candidate_documents` table + RLS policies
   - [ ] Update RecruiterDashboard to save metadata
   - [ ] End-to-end test with real file
   - [ ] **Estimated:** 2-3 hours

5. **Interview Type Feature**
   - [ ] Add DB column
   - [ ] Update AdminCandidatesTab UI
   - [ ] Test persistence
   - [ ] **Estimated:** 1-2 hours

6. **Broad Optimization Pass**
   - [ ] Bundle size analysis
   - [ ] Remove unused dependencies
   - [ ] Implement lazy-loading
   - [ ] **Estimated:** 2-4 hours

7. **Monitoring & Observability**
   - [ ] Set up error tracking (Sentry)
   - [ ] Add structured logging
   - [ ] Create runbook for common issues
   - [ ] **Estimated:** 2-3 hours

---

## 📊 Current Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | React + TypeScript | 18.x |
| Build | Vite | Latest |
| Backend | Supabase (Postgres + RLS) | Latest |
| Edge Runtime | Deno | 1.40+ |
| JS Client | supabase-js (Deno mirror) | 2.45.1 |
| Auth | Supabase Auth | Built-in |
| Storage | Google Drive API | v3 |
| UI Framework | Tailwind CSS + shadcn/ui | Latest |
| Animation | Framer Motion | Latest |

---

## 🔐 Environment Requirements

### Supabase Project Secrets (Required for Production)
```
GOOGLE_SERVICE_ACCOUNT_JSON    # Full JSON key from Google Cloud Service Account
GOOGLE_DRIVE_PARENT_FOLDER_ID  # Folder ID from shared Drive (currently fallback: 1wP9qTwiwCq7flVaEGicEwHmT51JLE3bd)
SUPABASE_URL                   # Your Supabase project URL
SUPABASE_ANON_KEY              # Anon public key
SUPABASE_SERVICE_ROLE_KEY      # Service role secret key
```

### Google Cloud Setup (for Drive Integration)
1. Create GCP Project
2. Enable Google Drive API
3. Create Service Account with `Editor` role on shared Drive
4. Download JSON key → store in `GOOGLE_SERVICE_ACCOUNT_JSON`
5. Share Drive folder with service account email → get folder ID

---

## 📝 Notes for Future Development

- **Subscription Cleanup:** Always call `supabase.removeChannel(ch)` in useEffect cleanup
- **Event Batching:** Use 300-500ms throttling windows for realtime events
- **RAF for Animations:** Prefer `requestAnimationFrame` over `setInterval` for smooth, cancellable effects
- **Error Messages:** Log edge-function errors to console with full stack
- **Type Safety:** Keep `as any` casts minimal; prefer proper Deno/TypeScript types
- **Testing:** Profile with Chrome DevTools → Performance tab to catch render floods

---

## 📞 Questions & Clarifications Needed

- [ ] Is `GOOGLE_SERVICE_ACCOUNT_JSON` already in Supabase secrets? If yes, which secret name?
- [ ] What is the actual parent Drive folder ID for candidate uploads?
- [ ] Are there specific "dashboard freeze" scenarios that can be reproduced?
- [ ] Should admin tabs be lazy-loaded or keep all in DOM?
- [ ] Any third-party analytics/error tracking already in place?

---

**Status:** 🟢 Green — Performance fixes deployed, edge functions stabilized. Ready for edge-function debugging & Drive integration next.
