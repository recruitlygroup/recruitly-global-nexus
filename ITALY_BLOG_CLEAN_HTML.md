# Italy Study Guide Blog - Clean HTML Version

**Date:** May 4, 2026  
**Blog ID:** studying-italy-nepal-2026-complete-guide  
**Read Time:** 22 minutes  

## Instructions

This is a professional, Tailwind CSS-styled HTML replacement for the Italy blog post. To integrate:

1. Replace the `content.html` string in `src/data/staticBlogPosts.ts` for the Italy blog entry with the HTML provided below.
2. The HTML uses Tailwind CSS classes (ensure your blog rendering system loads Tailwind).
3. The brand color (#2563eb) matches your Recruitly logo.

---

## Clean HTML for Blog Post

```html
<div class="max-w-7xl mx-auto px-6 py-10 lg:py-14">
  <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
    <main class="lg:col-span-8 space-y-8">
      <header class="space-y-4">
        <h1 class="text-3xl sm:text-4xl font-extrabold text-[#2563eb] leading-tight">The Ultimate 2026 Guide: Studying in Italy from Nepal</h1>
        <p class="text-gray-600">Complete roadmap: university selection, entrance tests, credential evaluation, DSU scholarship, and visa process (VFS Kathmandu).</p>
        
        <nav aria-label="Progress" class="bg-white p-4 rounded-lg shadow-sm">
          <div class="flex items-center justify-between gap-4">
            <div class="flex items-center gap-4 w-full">
              <a href="#phase1" class="flex items-center gap-3 text-sm md:text-base">
                <div class="w-9 h-9 flex items-center justify-center rounded-full bg-[#2563eb] text-white font-semibold">1</div>
                <div class="hidden sm:block">
                  <div class="text-xs text-gray-500">Step 1</div>
                  <div class="text-sm font-medium">Select Uni</div>
                </div>
              </a>
              <a href="#phase2" class="flex items-center gap-3 text-sm md:text-base">
                <div class="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 text-gray-700 font-semibold">2</div>
                <div class="hidden sm:block">
                  <div class="text-xs text-gray-500">Step 2</div>
                  <div class="text-sm font-medium">Documents</div>
                </div>
              </a>
              <a href="#phase3" class="flex items-center gap-3 text-sm md:text-base">
                <div class="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 text-gray-700 font-semibold">3</div>
                <div class="hidden sm:block">
                  <div class="text-xs text-gray-500">Step 3</div>
                  <div class="text-sm font-medium">Pre-Enrollment</div>
                </div>
              </a>
              <a href="#phase5" class="flex items-center gap-3 text-sm md:text-base ml-auto">
                <div class="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 text-gray-700 font-semibold">4</div>
                <div class="hidden sm:block">
                  <div class="text-xs text-gray-500">Step 4</div>
                  <div class="text-sm font-medium">Visa</div>
                </div>
              </a>
            </div>
          </div>
          <div class="mt-4">
            <div class="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
              <div class="bg-[#2563eb] h-2 rounded-full" style="width: 50%;"></div>
            </div>
            <div class="mt-2 text-xs text-gray-500">Progress: Application planning & document collection</div>
          </div>
        </nav>
      </header>

      <section id="phase1" class="space-y-4">
        <div class="bg-white border rounded-lg shadow-sm p-5">
          <h2 class="text-lg font-semibold text-gray-900">Phase 1 — Discovery & Entry Requirements</h2>
          <p class="text-gray-600 mt-1">Choose the right program, check language and entrance tests, and prepare core documents.</p>
        </div>
        <div class="space-y-3 text-gray-700">
          <h3 class="font-semibold text-gray-900">Why Recruitly helps</h3>
          <p><strong>Recruitly Group maintains a searchable database of all Italian universities and programs</strong> — we match your CGPA, subject, and budget to programs (English- vs Italian-taught).</p>

          <h4 class="font-semibold text-gray-900 mt-4">Key entry requirements</h4>
          <ul class="space-y-2 ml-4">
            <li><strong>IELTS:</strong> Target: <strong>6.0–6.5</strong>.</li>
            <li><strong>TOLC-E/TOLC-F/TOLC-I:</strong> Standardised Italian entrance tests for Economics and Engineering.</li>
            <li><strong>SAT:</strong> Accepted by selective universities — target ~1350+.</li>
            <li><strong>IMAT:</strong> Mandatory for MBBS (medicine).</li>
          </ul>

          <div class="bg-[#eff6ff] border-l-4 border-[#2563eb] p-4 rounded mt-4">
            <strong class="text-[#2563eb]">💡 Recruitly Advice:</strong>
            <p class="mt-1 text-gray-700">Use our WiseScore tool to instantly match programs to your scores and budget.</p>
          </div>
        </div>
      </section>

      <section id="phase2" class="space-y-4">
        <div class="bg-white border rounded-lg shadow-sm p-5">
          <h2 class="text-lg font-semibold text-gray-900">Phase 2 — Special Programs: MBBS & Nursing</h2>
          <p class="text-gray-600 mt-1">IMAT for medicine; clinical placements for nursing.</p>
        </div>
        <div class="space-y-3 text-gray-700">
          <h4 class="font-semibold text-gray-900">MBBS (Medicine)</h4>
          <p>Many Italian medical programs offer low tuition for international students — but <strong>IMAT</strong> is mandatory.</p>

          <h4 class="font-semibold text-gray-900 mt-4">Nursing</h4>
          <p>Nursing degrees require in-person clinical placements in Italy. Some universities offer partial online Pharmacy (theory online, practicum in Italy).</p>

          <div class="bg-amber-50 border-l-4 border-amber-400 p-4 rounded mt-4">
            <strong class="text-amber-800">⚠️ Warning</strong>
            <p class="mt-1 text-gray-700">Nursing students must be physically present for clinical rotations.</p>
          </div>
        </div>
      </section>

      <section id="phase3" class="space-y-4">
        <div class="bg-white border rounded-lg shadow-sm p-5">
          <h2 class="text-lg font-semibold text-gray-900">Phase 3 — Administrative Milestones</h2>
          <p class="text-gray-600 mt-1">Universitaly registration → credential evaluation (DOV vs CIMEA) → VFS Kathmandu.</p>
        </div>
        <div class="space-y-3 text-gray-700">
          <h4 class="font-semibold text-gray-900">DOV vs CIMEA</h4>
          <div class="bg-[#eff6ff] border-l-4 border-[#2563eb] p-4 rounded">
            <strong class="text-[#2563eb]">💡 Recruitly Advice:</strong>
            <ul class="mt-2 text-gray-700 space-y-2 ml-4">
              <li><strong>DOV:</strong> Cheaper, quick (5–10 days). Can be processed at your VFS appointment in Kathmandu. <em>Recommended</em>.</li>
              <li><strong>CIMEA:</strong> More comprehensive but pricier and slower (10–15 days).</li>
            </ul>
          </div>

          <h4 class="font-semibold text-gray-900 mt-4">VFS Kathmandu</h4>
          <div class="bg-green-50 border-l-4 border-green-500 p-4 rounded">
            <strong class="text-green-700">✅ Key fact:</strong>
            <p class="mt-1 text-gray-700">Submit your DOV application at the Italian Embassy during your VFS Kathmandu appointment — saves a trip!</p>
          </div>
        </div>
      </section>

      <section id="phase4" class="space-y-4">
        <div class="bg-white border rounded-lg shadow-sm p-5">
          <h2 class="text-lg font-semibold text-gray-900">Phase 4 — DSU Scholarship & Documents</h2>
          <p class="text-gray-600 mt-1">Regional need-based scholarships and critical Nepali documents you must obtain.</p>
        </div>
        <div class="space-y-3 text-gray-700">
          <div class="bg-green-50 border-l-4 border-green-500 p-4 rounded">
            <strong class="text-green-700">📋 Scholarship Essentials</strong>
            <ol class="mt-3 text-gray-700 space-y-2 ml-4">
              <li><strong>Relationship Certificate (Certificato di Parentela)</strong> — obtain from municipality in Kathmandu.</li>
              <li><strong>Low-Income Certificate (Certificato di Reddito Familiare)</strong> — bank statements/tax docs; apply via local office.</li>
            </ol>
            <p class="mt-3 text-sm">Contact Recruitly: <a href="mailto:recruitlygroup@gmail.com" class="text-[#2563eb] underline font-medium">recruitlygroup@gmail.com</a></p>
          </div>
        </div>
      </section>

      <section id="phase5" class="space-y-4">
        <div class="bg-white border rounded-lg shadow-sm p-5">
          <h2 class="text-lg font-semibold text-gray-900">Phase 5 — Financials & Visa</h2>
          <p class="text-gray-600 mt-1">Clean numbers for visa proof and budgeting.</p>
        </div>

        <div class="space-y-4">
          <h4 class="text-gray-900 font-semibold">Financial Requirements (Visa proof = €500/month)</h4>

          <div class="overflow-x-auto">
            <table class="mx-auto w-full sm:w-3/4 text-sm border-collapse">
              <thead>
                <tr class="bg-[#DBEAFE]">
                  <th class="p-3 text-left border-b border-gray-200">Program</th>
                  <th class="p-3 text-left border-b border-gray-200">Annual Tuition</th>
                  <th class="p-3 text-left border-b border-gray-200">Duration</th>
                  <th class="p-3 text-right border-b border-gray-200">Total Cost</th>
                </tr>
              </thead>
              <tbody class="bg-white">
                <tr>
                  <td class="p-3 border-b">Bachelors (3-year)</td>
                  <td class="p-3 border-b">€3,000 / year</td>
                  <td class="p-3 border-b">3 years</td>
                  <td class="p-3 border-b text-right"><strong>€21,000</strong></td>
                </tr>
                <tr class="bg-gray-50">
                  <td class="p-3 border-b">Masters (2-year)</td>
                  <td class="p-3 border-b">€7,000 / year</td>
                  <td class="p-3 border-b">2 years</td>
                  <td class="p-3 border-b text-right"><strong>€14,000</strong></td>
                </tr>
                <tr>
                  <td class="p-3 border-b">MBBS (Medicine)</td>
                  <td class="p-3 border-b">€2,000–3,500 / year</td>
                  <td class="p-3 border-b">6 years</td>
                  <td class="p-3 border-b text-right"><strong>€12,000–21,000</strong></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="bg-amber-50 border-l-4 border-amber-400 p-4 rounded mt-4">
            <strong class="text-amber-800">⏰ Important Deadlines</strong>
            <ul class="mt-2 text-gray-700 space-y-2 ml-4">
              <li>Universitaly pre-enrollment windows — typically spring/summer for September intake.</li>
              <li>VFS Kathmandu appointments fill fast — book 2–4 weeks ahead.</li>
            </ul>
          </div>
        </div>
      </section>

      <section class="space-y-4">
        <div class="bg-white border rounded-lg shadow-sm p-5">
          <h2 class="text-lg font-semibold text-gray-900">Timeline & Checklist</h2>
        </div>

        <div class="space-y-3 text-gray-700">
          <p><strong>Months 1–3:</strong> Research, IELTS/TOLC. <strong>Months 4–6:</strong> Apply, obtain acceptances. <strong>Months 7–9:</strong> DSU, VFS booking. <strong>Months 10–12:</strong> Visa, flights.</p>

          <h5 class="font-semibold text-gray-900 mt-4">Pre-Departure Checklist</h5>
          <ul class="space-y-2 ml-4">
            <li>✓ Passport, student visa, acceptance letter</li>
            <li>✓ DOV/CIMEA, bank statement, travel insurance</li>
            <li>✓ Relationship & Low-Income certificates</li>
          </ul>
        </div>
      </section>
    </main>

    <aside class="lg:col-span-4">
      <div class="sticky top-24 space-y-4">
        <div class="bg-white border rounded-lg shadow-sm p-4">
          <h3 class="text-sm font-semibold text-gray-900">On this page</h3>
          <nav class="mt-3 text-sm space-y-2">
            <a href="#phase1" class="block text-gray-700 hover:text-[#2563eb]">Phase 1 — Entry requirements</a>
            <a href="#phase2" class="block text-gray-700 hover:text-[#2563eb]">Phase 2 — MBBS & Nursing</a>
            <a href="#phase3" class="block text-gray-700 hover:text-[#2563eb]">Phase 3 — Pre-enrollment & DOV</a>
            <a href="#phase4" class="block text-gray-700 hover:text-[#2563eb]">Phase 4 — DSU Scholarship</a>
            <a href="#phase5" class="block text-gray-700 hover:text-[#2563eb]">Phase 5 — Financials & Visa</a>
          </nav>
        </div>

        <div class="bg-white border rounded-lg shadow-sm p-4 flex flex-col gap-3">
          <h4 class="text-sm font-semibold text-gray-900">Need help?</h4>
          <p class="text-sm text-gray-600">Get templates, DSU support, and visa coordination.</p>

          <div class="w-full flex gap-2">
            <a href="https://wa.me/9779743208282" target="_blank" rel="noopener" class="flex items-center justify-center w-1/2 bg-[#25D366] hover:opacity-95 text-white py-2 rounded text-sm font-medium">WhatsApp</a>
            <a href="mailto:recruitlygroup@gmail.com" class="flex items-center justify-center w-1/2 border border-gray-200 hover:bg-gray-50 py-2 rounded text-gray-700 text-sm font-medium">Email</a>
          </div>

          <p class="text-xs text-gray-500 mt-2">Templates available on request.</p>
        </div>
      </div>
    </aside>
  </div>

  <footer class="mt-10 bg-[#f8fafc] border border-gray-100 rounded-lg p-6 text-center">
    <h3 class="text-lg font-semibold text-gray-900">Ready to get started?</h3>
    <p class="text-gray-600 mt-2">We help with program selection, DSU templates, DOV/CIMEA guidance, and VFS coordination.</p>
    <div class="mt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
      <a href="https://wa.me/9779743208282" target="_blank" rel="noopener" class="inline-flex items-center gap-2 bg-[#2563eb] hover:bg-[#1f52c7] text-white px-5 py-2 rounded-md font-medium">Chat on WhatsApp</a>
      <a href="mailto:recruitlygroup@gmail.com" class="inline-flex items-center gap-2 border border-gray-200 px-5 py-2 rounded-md text-gray-700 hover:bg-white/80">Email Us</a>
    </div>
    <p class="mt-3 text-xs text-gray-500">We provide DSU templates and step-by-step assistance for Nepali students.</p>
  </footer>
</div>
```

---

## Design Features Implemented

✅ **Horizontal stepper** with progress bar (CSS-based, no symbols)  
✅ **Summary cards** for each phase (white cards with shadows)  
✅ **Sidebar TOC** (sticky, non-intrusive)  
✅ **Callout boxes:** Blue (#eff6ff) for Recruitly advice, Green for scholarship, Amber for warnings  
✅ **Financial table** with light-blue header (#DBEAFE)  
✅ **Professional footer CTA** with WhatsApp (wa.me) and Email links  
✅ **Recruitly branding** using #2563eb throughout  

---

## Next Steps

**Option 1:** Manually paste the HTML into your blog editing UI (if available)  
**Option 2:** I can programmatically update `staticBlogPosts.ts` with this HTML if you confirm this is the desired design.

The blog post is now ready to publish with a professional, modern, scannable layout!
