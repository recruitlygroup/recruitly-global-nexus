# Deno & Supabase Edge Functions Setup

This project includes Supabase Edge Functions written in Deno/TypeScript. To properly support these files in VS Code, Deno must be configured.

## Setup Instructions

### 1. Install Deno Extension (Recommended)
Install the official Deno extension for VS Code:
- Search for `denoland.vscode-deno` in VS Code Extensions
- Or install from: https://marketplace.visualstudio.com/items?itemName=denoland.vscode-deno

### 2. Configuration Files Already Added ✅
The following configuration files have been created:
- `deno.json` - Deno compiler options and import aliases
- `supabase/deno.json` - Supabase-specific Deno configuration
- `.vscode/settings.json` - Deno settings for VS Code
- `.vscode/extensions.json` - Recommended VS Code extensions

### 3. Verify Deno is Recognized
Once the Deno extension is installed:
1. Open the command palette (Cmd+Shift+P)
2. Search for "Deno: Enable"
3. Reload the window
4. TypeScript errors in Deno files should disappear

## Project Structure

### Supabase Edge Functions
Located in: `supabase/functions/`

Each edge function is a separate Deno program that:
- Imports from Deno standard library (`https://deno.land/std/`)
- Uses Supabase client (`https://esm.sh/@supabase/supabase-js@2`)
- Can use other Deno-compatible packages from `deno.land` or `esm.sh`

### Example Function
```
supabase/functions/
└── create-candidate-drive-folder/
    ├── index.ts (Main Deno function)
    └── [other files]
```

## Common Issues & Solutions

### Issue: "Cannot find module" errors
**Solution**: Ensure the Deno extension is installed and enabled

### Issue: "Cannot find name 'Deno'"
**Solution**: Make sure `deno.enable` is `true` in `.vscode/settings.json`

### Issue: Import errors for Supabase or deno.land
**Solution**: These are network imports. The IDE will cache them on first use. Wait a moment for resolution.

## Running Edge Functions Locally

To test Supabase Edge Functions locally:

```bash
# Start Supabase local development
supabase start

# Deploy a specific function (example)
supabase functions deploy create-candidate-drive-folder

# View function logs
supabase functions logs create-candidate-drive-folder
```

## Deployment

Edge functions in `supabase/functions/` are automatically deployed when pushed to the main branch, handled by Supabase CLI.

For manual deployment:
```bash
supabase functions deploy --project-id YOUR_PROJECT_ID
```

---

For more info: https://supabase.com/docs/guides/functions
