# Apply this pack
1. Copy the contents of this zip into the project root (merge folders; overwrites src/config/images.ts).
2. In package.json add to "scripts":  "photos": "node scripts/process-photos.mjs"
3. npm i -D sharp
4. Download photos via PHOTO_SOURCES.md → rename to slot names → /photos-raw
5. npm run photos   → writes the 10 optimised files to public/images/photos
6. Commit public/images/photos/*.jpg and push.
