// Nepali (नेपाली) copy for the /ne/cee/* pages and the predictor UI.
// ⚠️ NEEDS NATIVE-SPEAKER REVIEW before promotion: drafted by Claude, numbers/facts mirror ceePages.ts exactly.
// Numerals are kept as Latin digits for readability; college names stay in English (as they appear on MEC notices).
import type { CeeFaq } from "@/data/ceePages";

export interface NeCeePage { title: string; h1: string; description: string; subtitle: string; faqs: CeeFaq[] }

export const NE_PAGES: Record<string, NeCeePage> = {
  "result-2083": {
    title: "सीईई नतिजा २०८३ (MECEE-BL 2027): रोल नम्बरबाट र‍्याङ्क हेर्नुहोस् | Recruitly Group",
    h1: "सीईई नतिजा २०८३: आफ्नो र‍्याङ्क, अंक र कलेजको सम्भावना हेर्नुहोस्",
    description: "MBBS, BDS र BSc नर्सिङको MECEE-BL 2027 (सीईई २०८३) मा रोल नम्बरबाट आफ्नो र‍्याङ्क, अंक र पर्सेन्टाइल हेर्नुहोस्, अनि नेपालका छात्रवृत्ति र शुल्क तिर्ने कलेजहरू पत्ता लगाउनुहोस्।",
    subtitle: "रोल नम्बर हाल्नुहोस्। हामी MEC को नतिजा सूचीका २७,००० भन्दा बढी उत्तीर्ण उम्मेदवारसँग मिलान गरेर तपाईंले यथार्थमा लक्ष्य गर्न सक्ने कलेजहरूको नाम देखाउँछौं।",
    faqs: [
      { q: "रोल नम्बरबाट सीईई (MECEE-BL 2027) को नतिजा कसरी हेर्ने?", a: "यही पेजको चेकरमा आफ्नो रोल नम्बर हाल्नुहोस्। यसले MBBS, BDS र BSc नर्सिङको पूरा MEC नतिजा सूचीसँग मिलान गरेर तपाईंको सही र‍्याङ्क, अंक र पर्सेन्टाइल देखाउँछ।" },
      { q: "सीईई २०८३ को योग्यता कट-अफ कति हो?", a: "MEC को ५०औं पर्सेन्टाइल कट-अफ MBBS मा ५६.२५, BDS मा ६२.२५ र BSc नर्सिङ/मिडवाइफरीमा ४८ हो। कट-अफ नाघ्नु भनेको सिट पक्का हुनु होइन; भर्ना र‍्याङ्क, कोटा र उपलब्ध सिटमा भर पर्छ।" },
      { q: "नतिजा कहिले प्रकाशित भयो?", a: "चिकित्सा शिक्षा आयोगले MBBS को नतिजा २०२६ नोभेम्बर १८, BDS को नोभेम्बर १९ र BSc नर्सिङ/मिडवाइफरीको नोभेम्बर २१ मा प्रकाशित गरेको हो।" },
      { q: "कति जना उत्तीर्ण भए?", a: "MEC को सूची अनुसार MBBS मा १०,३२१, BDS मा ६,२५६ र BSc नर्सिङमा १०,८०५ जना उत्तीर्ण भएका छन्।" },
      { q: "मेरो र‍्याङ्कले नेपालमा सिट नपाए के गर्ने?", a: "तपाईंको रिपोर्टमा भारत र विदेशका विकल्प नाम सहित देखिन्छन्। रिक्रुटली ग्रुपले भारत र अन्य गन्तव्यका लागि सिट बुकिङ र परामर्श रु ० मा गर्छ।" },
    ],
  },
  "mbbs-colleges-nepal": {
    title: "नेपालका MBBS कलेज २०८३/८४: सिट, शुल्क र छात्रवृत्ति कट-अफ | Recruitly Group",
    h1: "नेपालका MBBS कलेज २०८३/८४: सिट, शुल्क सीमा र छात्रवृत्ति कट-अफ",
    description: "नेपालका सबै २८ MBBS संस्थाको MEC २०८३/८४ सिट बाँडफाँड, सरकारी/निजी विवरण, MEC शुल्क सीमा र कोटा अनुसार छात्रवृत्तिको अन्तिम र‍्याङ्क (२०८०–२०८२)।",
    subtitle: "नेपालका सबै MBBS कलेज, प्रत्येकमा कति सिट, MEC ले कति शुल्क लिन दिन्छ, र प्रत्येक कोटामा छात्रवृत्ति पाउने अन्तिम र‍्याङ्क कति थियो।",
    faqs: [
      { q: "२०८३/८४ मा नेपालमा कति MBBS सिट छन्?", a: "MEC ले २०८३/८४ का लागि २८ संस्थामा जम्मा २,७४५ MBBS सिट बाँडफाँड गरेको छ। गत वर्ष (२०८२) २,६३५ सिटमध्ये ६९१ सरकारी छात्रवृत्ति सिट थिए।" },
      { q: "नेपालमा MBBS को शुल्क सीमा कति हो?", a: "नेपाली विद्यार्थीका लागि शुल्क तिर्ने सिटमा काठमाडौं उपत्यका बाहिर लगभग रु ४५.९६ लाख र उपत्यकाभित्र लगभग रु ४०.२–४१.७ लाख (स्रोत अनुसार फरक) भनिएको छ। शुल्क बुझाउनुअघि MEC को हालको सूचना हेर्नुहोस्।" },
      { q: "छात्रवृत्ति सिटका लागि कति र‍्याङ्क चाहिन्छ?", a: "२०८२ मा खुला (Open) छात्रवृत्तिको अन्तिम सिट र‍्याङ्क ४५३ (अंक १४६) मा बन्द भयो। आरक्षित कोटा पछिल्लो र‍्याङ्कमा बन्द हुन्छन्, जस्तै महिला २,७२३। यस पेजको तालिकामा २०८०–२०८२ का सबै कोटा छन्।" },
      { q: "नेपालमा MBBS पढाइने सरकारी कलेज कुन कुन हुन्?", a: "IOM महाराजगञ्ज, BPKIHS धरान, Patan Academy of Health Sciences, Karnali Academy of Health Sciences, Pokhara Academy of Health Sciences, Madan Bhandari Academy, Madhesh Institute र Martyr Dasharath Chand University।" },
      { q: "सीईई MBBS को योग्यता अंक कति हो?", a: "५६.२५; १८ नोभेम्बर २०२६ मा प्रकाशित MEC सूचीमा १०,३२१ जना उत्तीर्ण भए।" },
    ],
  },
  "bds-colleges-nepal": {
    title: "नेपालका BDS कलेज २०८३/८४: सिट र MEC शुल्क सीमा | Recruitly Group",
    h1: "नेपालका BDS कलेज २०८३/८४: सिट, शुल्क र कट-अफ",
    description: "नेपालका सबै १५ BDS (दन्त चिकित्सा) कलेजको MEC २०८३/८४ सिट बाँडफाँड, सरकारी/निजी विवरण र MEC शुल्क सीमा, साथै सीईई २०८३ को BDS योग्यता कट-अफ।",
    subtitle: "दन्त चिकित्साका सिट कम छन्: ६,२५६ उत्तीर्ण उम्मेदवारका लागि ६२५ सिट। सिट कहाँ छन् र कति शुल्क लाग्छ हेर्नुहोस्।",
    faqs: [
      { q: "नेपालमा BDS का कति सिट छन्?", a: "MEC को २०८३/८४ बाँडफाँडमा १५ संस्थामा जम्मा ६२५ BDS सिट छन्, उत्तीर्ण उम्मेदवार ६,२५६ जना।" },
      { q: "नेपालमा BDS को शुल्क कति हो?", a: "नेपाली विद्यार्थीका लागि शुल्क तिर्ने BDS सिटको MEC सीमा लगभग रु २०.९२ लाख भनिएको छ। BPKIHS र IOM ले छात्रवृत्ति सिट दिन्छन्।" },
      { q: "सीईई BDS को कट-अफ कति हो?", a: "६२.२५ (५०औं पर्सेन्टाइल)। BDS को सर्वोच्च अंक १८३.७५ रह्यो।" },
      { q: "नेपालमा BDS कुन कुन कलेजमा पढाइन्छ?", a: "सरकारी: BPKIHS र IOM महाराजगञ्ज। निजी: यस पेजको तालिकामा भएका अन्य कलेज, जस्तै KUSMS, Kathmandu Medical College, Nepal Medical College, People's Dental, Kantipur Dental र अन्य।" },
    ],
  },
  "bsc-nursing-colleges-nepal": {
    title: "नेपालका BSc नर्सिङ कलेज २०८३/८४: सिट, शुल्क र सीईई कट-अफ | Recruitly Group",
    h1: "नेपालका BSc नर्सिङ कलेज २०८३/८४: सिट, MEC शुल्क र सीईई कट-अफ",
    description: "नेपालका सबै ५९ BSc नर्सिङ कलेजको MEC २०८३/८४ सिट बाँडफाँड, सरकारी क्याम्पस र निजी कलेज, MEC शुल्क सीमा र सीईई २०८३ को योग्यता कट-अफ।",
    subtitle: "५९ कलेजमा २,६४० BSc नर्सिङ सिट। सरकारी क्याम्पस, निजी कलेज र MEC ले तोकेको शुल्क सीमा हेर्नुहोस्।",
    faqs: [
      { q: "नेपालमा BSc नर्सिङका कति सिट छन्?", a: "MEC को २०८३/८४ बाँडफाँडमा ५९ कलेजमा २,६४० सिट छन्; MECEE-BL 2027 को नर्सिङ सूचीमा १०,८०५ जना उत्तीर्ण भएका छन्।" },
      { q: "BSc नर्सिङको शुल्क सीमा कति हो?", a: "नेपाली विद्यार्थीका लागि शुल्क तिर्ने सिटको MEC सीमा कार्यक्रमभर लगभग रु १०.३६ लाख भनिएको छ। सरकारी क्याम्पसमा छात्रवृत्ति सिट हुन्छन्।" },
      { q: "सीईई BSc नर्सिङको कट-अफ कति हो?", a: "४८ (५०औं पर्सेन्टाइल)। सर्वोच्च अंक १८१ रह्यो।" },
      { q: "नेपालबाहेक BSc नर्सिङको विकल्प छ?", a: "छ। भारतमा BSc नर्सिङ योग्यताक्रम (merit) का आधारमा NEET बिना भर्ना हुन्छ (जस्तै बैंगलोरका RGUHS सम्बद्ध कलेज), र रिक्रुटली ग्रुपले जर्मनीतर्फको नर्स मार्ग पनि सहयोग गर्छ।" },
    ],
  },
};

/** Labels for the CeeHub template. {p} = program, {n}/{c} = numbers. */
export const NE_UI = {
  eyebrow: "सीईई · MECEE-BL 2027",
  cutoff: "योग्यता कट-अफ", qualified: "उत्तीर्ण उम्मेदवार", top: "सर्वोच्च अंक",
  seats: (n: string, c: number) => `MEC सिट २०८३/८४: ${n} (${c} कलेजमा)`, published: "नतिजा प्रकाशित",
  source: (d: string) => `स्रोत: चिकित्सा शिक्षा आयोग (MEC) को MECEE-BL 2027 नतिजा सूची र २०८३/८४ को सिट बाँडफाँड। अन्तिम अपडेट ${d}।`,
  allColleges: (p: string) => `नेपालका सबै ${p} कलेज (MEC २०८३/८४)`,
  groupGov: "सरकारी / छात्रवृत्ति कलेज", noteGov: "लगभग ७५% सिट छात्रवृत्तिका हुन्छन्।",
  groupPrivate: "निजी / शुल्क तिर्ने कलेज", notePrivate: "लगभग १०% सिट छात्रवृत्तिका हुन्छन्; बाँकी सिटमा MEC ले तोकेको सीमाभित्रको ट्युसन तिर्नुपर्छ।",
  college: "कलेज", location: "स्थान", seatsCol: (p: string) => `${p} सिट`, tuition: "ट्युसन (MEC सीमा)",
  govFee: "छात्रवृत्ति सिट निःशुल्क; शुल्क सिट MEC अनुसार", affiliation: "सम्बद्धता",
  quotaTitle: "कोटा अनुसार MBBS छात्रवृत्तिको अन्तिम र‍्याङ्क",
  ctaTitle: (p: string) => `तपाईंको र‍्याङ्कमा कुन ${p} कलेज मिल्छ पत्ता लगाउनुहोस्`,
  ctaBody: "रोल नम्बर हालेर आफ्नो सही र‍्याङ्क र नाम खुलेका छात्रवृत्ति तथा शुल्क तिर्ने कलेज हेर्नुहोस्। निःशुल्क, ६० सेकेन्ड लाग्छ।",
  ctaBtn: "मेरो र‍्याङ्क र कलेजको सम्भावना हेर्नुहोस् →",
  faq: "बारम्बार सोधिने प्रश्नहरू",
  india: "भारतमा MBBS, BDS र BSc नर्सिङ: निःशुल्क सिट बुकिङ",
  wise: "WiseScore: अमेरिका, अष्ट्रेलिया, न्युजिल्यान्ड र युरोपमा अध्ययन",
  english: "English version",
};

/** Predictor UI: English string → Nepali. Anything missing falls back to English. */
export const NE_PREDICTOR: Record<string, string> = {
  "Free tool · Takes 60 seconds": "निःशुल्क टुल · ६० सेकेन्ड मात्र",
  "CEE Rank & Admission Predictor": "सीईई र‍्याङ्क तथा भर्ना सम्भावना टुल",
  "Enter your roll number, rank or score. We match it against the complete MEC MECEE-BL 2027 result lists (MBBS, BDS and BSc Nursing), then name the Nepal scholarship and paying colleges you can realistically target — plus back-up options in India and abroad.":
    "आफ्नो रोल नम्बर, र‍्याङ्क वा अंक हाल्नुहोस्। हामी MEC को MECEE-BL 2027 को पूरा नतिजा सूची (MBBS, BDS र BSc नर्सिङ) सँग मिलान गरेर तपाईंले यथार्थमा लक्ष्य गर्न सक्ने नेपालका छात्रवृत्ति र शुल्क तिर्ने कलेजका नाम देखाउँछौं — साथै भारत र विदेशका वैकल्पिक विकल्प पनि।",
  "Full name *": "पूरा नाम *",
  "Phone / WhatsApp *": "फोन / ह्वाट्सएप नम्बर *",
  "Gmail / Email *": "जीमेल / इमेल *",
  "CEE roll number *": "सीईई रोल नम्बर *",
  "…or CEE rank": "…वा सीईई र‍्याङ्क",
  "…or CEE score": "…वा सीईई अंक",
  "Result list / program *": "नतिजा सूची / कार्यक्रम *",
  "Roll number auto-detects this. Needed only for rank/score.": "रोल नम्बर हालेमा स्वतः पहिचान हुन्छ। र‍्याङ्क/अंक हाल्दा मात्र चाहिन्छ।",
  "Reservation / quota *": "आरक्षण / कोटा *",
  "Budget range *": "बजेट दायरा *",
  "Home district / city (optional)": "गृह जिल्ला / सहर (ऐच्छिक)",
  "Optional: Send fee structure directly to Parent/Guardian": "ऐच्छिक: शुल्क विवरण सिधै अभिभावकलाई पठाउनुहोस्",
  "Show my admission chances": "मेरो भर्नाको सम्भावना हेर्नुहोस्",
  "Checking MEC results…": "MEC नतिजा खोज्दै…",
  "Your details are used only to send your report and counselling. Free, no obligation.": "तपाईंको विवरण रिपोर्ट पठाउन र परामर्शका लागि मात्र प्रयोग गरिन्छ। निःशुल्क, कुनै बाध्यता छैन।",
  "I agree that Recruitly Group may contact me by phone, WhatsApp and email about my CEE report and study options. If I add a parent/guardian number, I confirm they agree to be contacted. See our ":
    "म रिक्रुटली ग्रुपले मेरो सीईई रिपोर्ट र अध्ययनका विकल्पबारे फोन, ह्वाट्सएप र इमेलमार्फत सम्पर्क गर्न सक्छ भन्नेमा सहमत छु। अभिभावकको नम्बर राखेमा उहाँहरू सम्पर्कमा सहमत हुनुहुन्छ भनी पुष्टि गर्छु। हेर्नुहोस् ",
  "Privacy Policy": "गोपनीयता नीति",
  "Your MECEE-BL 2027 result": "तपाईंको MECEE-BL 2027 नतिजा",
  "Rank": "र‍्याङ्क", "Score": "अंक", "Percentile": "पर्सेन्टाइल",
  "ahead of qualified candidates": "उत्तीर्ण उम्मेदवारभन्दा अगाडि",
  "Qualified candidates": "उत्तीर्ण उम्मेदवार", "cut-off score": "कट-अफ अंक",
  "Nepal admission status for": "नेपालमा भर्नाको अवस्था:",
  "High Probability": "उच्च सम्भावना",
  "Borderline / Mop-Up Round Chance": "सीमारेखामा / मप-अप राउन्डमा सम्भावना",
  "Low Probability / Unlikely in Nepal": "कम सम्भावना / नेपालमा कठिन",
  "High chance": "उच्च सम्भावना", "Borderline": "सीमारेखामा", "Unlikely": "कम सम्भावना",
  "🎓 Eligible Scholarship Colleges in Nepal": "🎓 नेपालका योग्य छात्रवृत्ति कलेजहरू",
  "🏥 Eligible Paying Colleges in Nepal": "🏥 नेपालका योग्य शुल्क तिर्ने कलेजहरू",
  "College": "कलेज", "Seats": "सिट", "Est. closing rank": "अनुमानित अन्तिम र‍्याङ्क",
  "Tuition (MEC ceiling)": "ट्युसन (MEC सीमा)", "Admission likelihood": "भर्ना हुने सम्भावना",
  "Above your budget": "तपाईंको बजेटभन्दा माथि",
  "How these numbers are calculated": "यी अनुमान कसरी गरिएका हुन्",
  "Don't Lose a Year—And Don't Pay NPR 5,000 Just to Book a Seat!": "एक वर्ष नगुमाउनुहोस्, र सिट बुक गर्न मात्रै रु ५,००० नतिर्नुहोस्!",
  "Many consultancies charge NPR 5,000+ just to reserve a seat or process your file.": "धेरै कन्सल्टेन्सीले सिट रिजर्भ गर्न वा फाइल प्रोसेस गर्न मात्रै रु ५,००० भन्दा बढी लिन्छन्।",
  "Recruitly Group charges NPR 0": "रिक्रुटली ग्रुपले रु ० लिन्छ",
  "— 100% free seat booking and end-to-end admission planning for India and international destinations.": "— भारत र अन्तर्राष्ट्रिय गन्तव्यका लागि १००% निःशुल्क सिट बुकिङ र सुरुदेखि अन्त्यसम्मको भर्ना योजना।",
  "Book My Seat for NPR 0 (Free Counseling)": "रु ० मा मेरो सिट बुक गर्नुहोस् (निःशुल्क परामर्श)",
  "Save / Print My CEE Report": "मेरो सीईई रिपोर्ट सेभ / प्रिन्ट गर्नुहोस्",
  "Book Seat · NPR 0": "सिट बुक · रु ०",
  "Request noted — a counsellor will contact you on WhatsApp.": "अनुरोध प्राप्त भयो — हाम्रो काउन्सिलरले ह्वाट्सएपमा सम्पर्क गर्नेछन्।",
  "We couldn't save your details to our team.": "हामीले तपाईंको विवरण हाम्रो टोलीमा सेभ गर्न सकेनौं।",
  "Try again": "फेरि प्रयास गर्नुहोस्", "Message us on WhatsApp": "ह्वाट्सएपमा सन्देश पठाउनुहोस्",
  "Enter your full name.": "आफ्नो पूरा नाम लेख्नुहोस्।",
  "Enter a 10-digit mobile number starting with 97 or 98.": "९७ वा ९८ बाट सुरु हुने १० अंकको मोबाइल नम्बर लेख्नुहोस्।",
  "Enter a valid email address.": "मान्य इमेल ठेगाना लेख्नुहोस्।",
  "Enter your CEE roll number, rank or score.": "आफ्नो सीईई रोल नम्बर, र‍्याङ्क वा अंक लेख्नुहोस्।",
  "Please tick the box so we may contact you about your report.": "रिपोर्टबारे सम्पर्क गर्न हामीलाई अनुमति दिन बक्समा टिक लगाउनुहोस्।",
};
