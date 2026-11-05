import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth, GoogleAuthProvider, signInWithPopup, signOut,
  onAuthStateChanged, updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getFirestore, doc, getDoc, setDoc, updateDoc, serverTimestamp,
  collection, addDoc, getDocs, deleteDoc, query, orderBy, limit, increment,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyD_v4W7Mp2L_LDf8I9aZcg3o_YVx1M4VOY",
  authDomain: "aiqentraplatform.firebaseapp.com",
  projectId: "aiqentraplatform",
  storageBucket: "aiqentraplatform.firebasestorage.app",
  messagingSenderId: "90385988808",
  appId: "1:90385988808:web:51f30a2c6004b27921b9fd",
  measurementId: "G-0NQ0G027MJ"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: "select_account" });

const MAX_IMAGES = 3;
const MAX_IMAGE_SIZE = 8 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const IMAGE_MAX_DIM = 700;
const IMAGE_QUALITY = 0.55;
const VERCEL_BODY_LIMIT = 2 * 1024 * 1024;

const DAILY_LIMIT = 10;
const POLL_INTERVAL_MS = 2000;
const POLL_MAX_ATTEMPTS = 90;

const SUBJECTS = ["arabic", "english", "history"];

const THEME_KEY = "aiq_theme";
const THEME_COLORS = { light: "#f8fafc", dark: "#0b1220" };

const I18N = {
  ar: {
    "nav.home": "الرئيسية",
    "nav.how": "كيف يعمل؟",
    "nav.bank": "بنك الأسئلة",
    "nav.signin": "تسجيل الدخول",
    "nav.dashboard": "لوحة التحكم",

    "hero.pill": "منصة تعليمية مدعومة بالذكاء الاصطناعي",
    "hero.title.1": "حوّل محتواك",
    "hero.title.2": "إلى أسئلة أقوى",
    "hero.desc": "ارفع صفحاتك الدراسية ودع Qentra ينشئ لك أسئلة متدرجة من السهل إلى الصعب، مبنية على المحتوى الذي قدمته فقط.",
    "hero.cta": "ابدأ الآن",
    "hero.learn": "كيف يعمل؟",
    "hero.meta.q": "سؤال لكل مجموعة",
    "hero.meta.diff": "مستويات صعوبة",
    "hero.meta.lang": "دعم كامل",

    "how.title": "كيف يعمل؟",
    "how.sub": "ثلاث خطوات بسيطة من محتواك إلى بنك أسئلة متكامل.",
    "how.s1.t": "ارفع محتواك",
    "how.s1.d": "صور من صفحاتك الدراسية أو مذكراتك بصيغ JPG و PNG و WEBP — حتى 3 صور لكل محاولة.",
    "how.s2.t": "يقوم Qentra بالتحليل",
    "how.s2.d": "يقرأ Qentra المحتوى، يفهم الأفكار والعلاقات، ويبني أسئلة من المحتوى فقط.",
    "how.s3.t": "استلم أسئلة منظمة",
    "how.s3.d": "5 سهلة، 5 متوسطة، 10 صعبة، 10 امتحان — مع الإجابات والشروح والمصادر.",

    "cta.title": "جاهز لبناء بنك أسئلتك؟",
    "cta.sub": "ابدأ مجانًا بعشر محاولات يوميًا، 30 سؤالًا لكل مجموعة.",
    "cta.btn": "ابدأ الآن",

    "auth.title": "مرحبًا بك في AiQentra",
    "auth.sub": "سجّل الدخول باستخدام حساب Google فقط. لا حاجة لكلمة مرور.",
    "auth.google": "تسجيل الدخول باستخدام Google",
    "auth.note": "بالمتابعة أنت توافق على استخدام بياناتك لتشغيل حسابك داخل AiQentra فقط.",

    "name.title": "قبل أن نبدأ",
    "name.sub": "ما الاسم الذي تريد أن يناديك به Qentra؟",
    "name.label": "اكتب اسمك",
    "name.confirm": "تأكيد",
    "name.fine": "يُستخدم هذا الاسم فقط لمخاطبتك داخل التطبيق ويمكن تغييره لاحقًا من الإعدادات.",

    "dash.sub": "Qentra جاهز لإنشاء مجموعة أسئلة جديدة.",
    "dash.new": "توليد أسئلة جديدة",
    "dash.openBank": "بنك الأسئلة",
    "dash.usage.title": "محاولات اليوم",
    "dash.usage.reset": "تتجدد المحاولات تلقائيًا كل يوم.",
    "dash.bank.title": "بنك الأسئلة",
    "dash.bank.sub": "مجموعات محفوظة",
    "dash.bank.open": "فتح البنك",
    "dash.settings.title": "الإعدادات",
    "dash.settings.sub": "الاسم، اللغة، الحساب.",
    "dash.settings.open": "فتح الإعدادات",
    "dash.visual.pill": "Qentra Engine",
    "dash.visual.title": "من المحتوى إلى الأسئلة",
    "dash.curriculum.title": "نظام البكالوريا",
    "dash.curriculum.sub": "نظام دراسي جديد يوفر أسئلة متخصصة حسب المادة.",
    "dash.curriculum.open": "جرّبه الآن",

    "notif.title": "الإشعارات",
    "notif.clear": "مسح الكل",
    "notif.empty": "لا توجد إشعارات بعد.",
    "notif.ready.title": "مجموعة الأسئلة جاهزة",
    "notif.ready.sub": "اضغط لعرض الأسئلة الآن.",
    "notif.optin.title": "تفعيل إشعار \"الإجابات جاهزة\"",
    "notif.optin.sub": "سنخبرك داخل التطبيق عند اكتمال توليد الأسئلة حتى لو خرجت من الصفحة.",
    "notif.optin.yes": "تفعيل",
    "notif.optin.no": "لاحقًا",

    "upload.title": "توليد أسئلة جديدة",
    "upload.sub": "ارفع حتى 3 صور من موادك الدراسية. Qentra سيستخدم هذا المحتوى فقط.",
    "upload.dz.title": "اسحب الصور هنا أو اضغط للاختيار",
    "upload.dz.hint": "JPG، PNG، WEBP — الحد الأقصى 3 صور، 8 ميجا لكل صورة.",
    "upload.clear": "مسح الكل",
    "upload.generate": "توليد الأسئلة",
    "upload.rules.title": "قواعد الجودة",
    "upload.rules.1": "يستخدم Qentra المحتوى المرفوع كمصدر وحيد للحقيقة.",
    "upload.rules.2": "لا يعتمد على معلومات خارجية أو مصادر إنترنت.",
    "upload.rules.3": "لا يخترع أسئلة إذا كان المحتوى غير كافٍ.",
    "upload.rules.4": "التوزيع الافتراضي: 5 سهلة، 5 متوسطة، 10 صعبة، 10 امتحان.",
    "upload.rules.5": "الحد الأقصى 3 صور لكل محاولة توليد.",

    "upload.curriculum.title": "نظام البكالوريا",
    "upload.curriculum.sub": "يُولّد أسئلة متخصصة حسب المادة (عربي / إنجليزي / تاريخ).",
    "upload.curriculum.subject": "المادة",
    "upload.curriculum.mode": "الوضع",
    "upload.curriculum.edit": "تعديل",

    "curriculum.title": "إعدادات نظام البكالوريا",
    "curriculum.desc": "اختر المادة الدراسية، وحدّد إن كنت تريد وضع البكالوريا الرسمي.",
    "curriculum.subject.label": "المادة الدراسية",
    "curriculum.subject.arabic": "عربي",
    "curriculum.subject.arabic.sub": "نحو + بلاغة",
    "curriculum.subject.english": "إنجليزي",
    "curriculum.subject.english.sub": "Reading + Grammar",
    "curriculum.subject.history": "تاريخ",
    "curriculum.subject.history.sub": "7 أنواع متخصصة",
    "curriculum.mode.label": "وضع البكالوريا الرسمي",
    "curriculum.mode.title": "تفعيل وضع البكالوريا",
    "curriculum.mode.sub": "يوافق معايير امتحانات البكالوريا الرسمية.",
    "curriculum.confirm": "تأكيد",
    "curriculum.err.noSubject": "الرجاء اختيار المادة أولًا.",

    "curriculum.subject.label.arabic": "عربي",
    "curriculum.subject.label.english": "إنجليزي",
    "curriculum.subject.label.history": "تاريخ",
    "curriculum.mode.label.on": "بكالوريا",
    "curriculum.mode.label.off": "عادي",

    "gen.title": "Qentra يعمل الآن",
    "gen.stage.1": "جاري قراءة المحتوى...",
    "gen.stage.2": "جاري تحليل المحتوى...",
    "gen.stage.3": "جاري فهم الأفكار الرئيسية...",
    "gen.stage.4": "جاري بناء الأسئلة...",
    "gen.stage.5": "جاري مراجعة جودة الأسئلة...",
    "gen.stage.6": "جاري إنهاء المجموعة...",

    "questions.title.default": "مجموعة أسئلة",
    "questions.editTitle": "تعديل العنوان",
    "questions.showAnswers": "عرض الإجابات",
    "questions.hideAnswers": "إخفاء الإجابات",
    "questions.answer": "الإجابة",
    "questions.explanation": "الشرح",
    "questions.source": "مصدر الإجابة",
    "questions.showAnswer": "عرض الإجابة",
    "questions.showExplanation": "عرض الشرح",
    "questions.showSource": "عرض المصدر",
    "questions.sourceUndetermined": "تعذر تحديد موضع المصدر بدقة.",
    "questions.newTitle": "العنوان الجديد:",
    "questions.meta": "{total} سؤال — {easy} سهل / {medium} متوسط / {hard} صعب / {exam} امتحان",

    "diff.easy": "سهل",
    "diff.medium": "متوسط",
    "diff.hard": "صعب",
    "diff.exam": "امتحان",

    "type.multiple_choice": "اختيار من متعدد",
    "type.true_false": "صح / خطأ",
    "type.fill_blank": "أكمل الفراغ",
    "type.short_answer": "إجابة قصيرة",
    "type.essay": "مقالي",
    "type.jre": "JRE (Justify - Reason - Evidence)",
    "type.rewrite": "REWRITE",
    "type.explain": "فسّر",
    "type.results": "ما النتائج",
    "type.what_happens": "ماذا يحدث",
    "type.why": "بم تفسر",
    "type.authenticity": "حدد مصداقية العبارة",
    "type.prove": "دلل",
    "type.choose_justify": "اختر مع التبرير",

    "bank.title": "بنك الأسئلة",
    "bank.sub": "جميع مجموعاتك المحفوظة، خاصة بحسابك فقط.",
    "bank.search": "ابحث في بنك الأسئلة...",
    "bank.new": "توليد جديد",
    "bank.empty": "لا توجد مجموعات محفوظة حتى الآن.",
    "bank.empty.cta": "توليد أول مجموعة",
    "bank.open": "فتح",
    "bank.delete": "حذف",
    "bank.confirmDelete": "تأكيد الحذف؟",
    "bank.count": "{count} سؤال",

    "settings.title": "الإعدادات",
    "settings.sub": "إدارة حسابك وتفضيلاتك.",
    "settings.profile": "الملف الشخصي",
    "settings.name": "الاسم الظاهر",
    "settings.save": "حفظ",
    "settings.account": "الحساب",
    "settings.email": "البريد الإلكتروني",
    "settings.usage": "استخدام اليوم",
    "settings.signout": "تسجيل الخروج",
    "settings.notif": "إشعار الإجابات الجاهزة",
    "settings.theme": "الوضع الليلي",

    "common.back": "رجوع",
    "common.close": "إغلاق",
    "common.cancel": "إلغاء",
    "common.home": "الرئيسية",
    "common.confirm": "تأكيد",

    "bn.dashboard": "الرئيسية",
    "bn.upload": "توليد",
    "bn.bank": "البنك",
    "bn.settings": "الإعدادات",

    "footer.rights": "جميع الحقوق محفوظة.",

    "toast.saved": "تم الحفظ",
    "toast.deleted": "تم الحذف",
    "toast.notifEnabled": "تم تفعيل الإشعارات.",
    "toast.notifDisabled": "تم إيقاف الإشعارات.",
    "toast.themeDark": "تم تفعيل الوضع الليلي.",
    "toast.themeLight": "تم تفعيل الوضع النهاري.",

    "err.noImages": "الرجاء رفع صورة واحدة على الأقل.",
    "err.tooManyImages": "الحد الأقصى 3 صور لكل محاولة.",
    "err.badType": "صيغة غير مدعومة. استخدم JPG أو PNG أو WEBP.",
    "err.tooLarge": "حجم الصورة كبير جدًا (الحد 8 ميجا).",
    "err.limitReached": "لقد استهلكت جميع محاولاتك اليوم. عد غدًا.",
    "err.genFail": "تعذر إتمام التوليد. لم يتم خصم أي محاولة.",
    "err.timeout": "استغرق التوليد وقتًا أطول من المتوقع. حاول مرة أخرى.",
    "err.authFail": "تعذر تسجيل الدخول. حاول مرة أخرى.",
    "err.insufficient": "المحتوى المرفوع غير كافٍ لتوليد أسئلة موثوقة.",
    "err.subjectMismatch": "المادة المختارة لا تتطابق مع محتوى الصورة. عدّل الاختيار أو ارفع صورة صحيحة.",
    "err.network": "خطأ في الشبكة. تحقق من اتصالك وحاول مجددًا.",
    "err.nameEmpty": "الرجاء إدخال اسم صالح.",
    "err.payloadTooLarge": "الصور كبيرة جدًا. ارفع صورًا أقل أو أصغر.",
    "err.serverError": "خطأ من الخادم. حاول بعد لحظات.",
    "err.curriculumIncomplete": "الرجاء اختيار المادة أولًا.",
    "err.tokenRefresh": "تعذر تحديث الجلسة. أعد تسجيل الدخول.",
    "err.rateLimited": "الخدمة مشغولة حاليًا. حاول بعد دقيقة.",
    "err.contentBlocked": "المحتوى المرفوع لم يجتز فلتر السلامة. جرّب محتوى تعليميًا آخر."
  },
  en: {
    "nav.home": "Home",
    "nav.how": "How It Works",
    "nav.bank": "Question Bank",
    "nav.signin": "Sign In",
    "nav.dashboard": "Dashboard",

    "hero.pill": "AI-powered learning platform",
    "hero.title.1": "Turn Your Content",
    "hero.title.2": "Into Better Questions",
    "hero.desc": "Upload your study material and let Qentra create questions that progress from easy to extremely challenging, based only on the content you provide.",
    "hero.cta": "Get Started",
    "hero.learn": "How It Works",
    "hero.meta.q": "questions per set",
    "hero.meta.diff": "difficulty levels",
    "hero.meta.lang": "full support",

    "how.title": "How It Works",
    "how.sub": "Three simple steps from your content to a full question bank.",
    "how.s1.t": "Upload your content",
    "how.s1.d": "Images of your study pages or notes in JPG, PNG or WEBP — up to 3 per attempt.",
    "how.s2.t": "Qentra analyzes the material",
    "how.s2.d": "Qentra reads the content, understands ideas and relationships, and builds questions from it only.",
    "how.s3.t": "Receive structured questions",
    "how.s3.d": "5 easy, 5 medium, 10 hard, 10 exam-level — with answers, explanations and sources.",

    "cta.title": "Ready to build your question bank?",
    "cta.sub": "Start free with 10 daily generations, 30 questions per set.",
    "cta.btn": "Get Started",

    "auth.title": "Welcome to AiQentra",
    "auth.sub": "Sign in with your Google account. No password needed.",
    "auth.google": "Sign in with Google",
    "auth.note": "By continuing you agree to let us use your data solely to run your AiQentra account.",

    "name.title": "Before We Start",
    "name.sub": "What would you like Qentra to call you?",
    "name.label": "Enter your name",
    "name.confirm": "Confirm",
    "name.fine": "This name is used only to address you inside the app and can be changed later in Settings.",

    "dash.sub": "Qentra is ready to create a new question set.",
    "dash.new": "New Question Set",
    "dash.openBank": "Question Bank",
    "dash.usage.title": "Today's Generations",
    "dash.usage.reset": "Your daily generations reset automatically.",
    "dash.bank.title": "Question Bank",
    "dash.bank.sub": "saved sets",
    "dash.bank.open": "Open Bank",
    "dash.settings.title": "Settings",
    "dash.settings.sub": "Name, language, account.",
    "dash.settings.open": "Open Settings",
    "dash.visual.pill": "Qentra Engine",
    "dash.visual.title": "From content to questions",
    "dash.curriculum.title": "Baccalaureate System",
    "dash.curriculum.sub": "A new study system providing subject-specific questions.",
    "dash.curriculum.open": "Try it now",

    "notif.title": "Notifications",
    "notif.clear": "Clear All",
    "notif.empty": "No notifications yet.",
    "notif.ready.title": "Question set is ready",
    "notif.ready.sub": "Tap to view the questions now.",
    "notif.optin.title": "Enable \"answers ready\" notifications",
    "notif.optin.sub": "We'll notify you inside the app when generation completes, even if you leave the page.",
    "notif.optin.yes": "Enable",
    "notif.optin.no": "Later",

    "upload.title": "Generate New Questions",
    "upload.sub": "Upload up to 3 images of your study material. Qentra will use only this content.",
    "upload.dz.title": "Drag images here or click to select",
    "upload.dz.hint": "JPG, PNG, WEBP — max 3 images, 8 MB each.",
    "upload.clear": "Clear All",
    "upload.generate": "Generate Questions",
    "upload.rules.title": "Quality Rules",
    "upload.rules.1": "Qentra uses the uploaded content as its only source of truth.",
    "upload.rules.2": "No external information or internet sources are used.",
    "upload.rules.3": "It does not invent questions when content is insufficient.",
    "upload.rules.4": "Default split: 5 easy, 5 medium, 10 hard, 10 exam.",
    "upload.rules.5": "Maximum 3 images per generation attempt.",

    "upload.curriculum.title": "Baccalaureate System",
    "upload.curriculum.sub": "Generates subject-specific questions (Arabic / English / History).",
    "upload.curriculum.subject": "Subject",
    "upload.curriculum.mode": "Mode",
    "upload.curriculum.edit": "Edit",

    "curriculum.title": "Baccalaureate System Settings",
    "curriculum.desc": "Choose the study subject, and specify whether you want the official Baccalaureate mode.",
    "curriculum.subject.label": "Study Subject",
    "curriculum.subject.arabic": "Arabic",
    "curriculum.subject.arabic.sub": "Grammar + Rhetoric",
    "curriculum.subject.english": "English",
    "curriculum.subject.english.sub": "Reading + Grammar",
    "curriculum.subject.history": "History",
    "curriculum.subject.history.sub": "7 specialized types",
    "curriculum.mode.label": "Official Baccalaureate Mode",
    "curriculum.mode.title": "Enable Baccalaureate mode",
    "curriculum.mode.sub": "Aligns with official Baccalaureate exam standards.",
    "curriculum.confirm": "Confirm",
    "curriculum.err.noSubject": "Please select a subject first.",

    "curriculum.subject.label.arabic": "Arabic",
    "curriculum.subject.label.english": "English",
    "curriculum.subject.label.history": "History",
    "curriculum.mode.label.on": "Baccalaureate",
    "curriculum.mode.label.off": "Standard",

    "gen.title": "Qentra is working",
    "gen.stage.1": "Reading your content...",
    "gen.stage.2": "Analyzing the material...",
    "gen.stage.3": "Understanding the key ideas...",
    "gen.stage.4": "Building the questions...",
    "gen.stage.5": "Checking question quality...",
    "gen.stage.6": "Finalizing the question set...",

    "questions.title.default": "Question Set",
    "questions.editTitle": "Edit Title",
    "questions.showAnswers": "Show Answers",
    "questions.hideAnswers": "Hide Answers",
    "questions.answer": "Answer",
    "questions.explanation": "Explanation",
    "questions.source": "Answer Source",
    "questions.showAnswer": "Show Answer",
    "questions.showExplanation": "Show Explanation",
    "questions.showSource": "Show Source",
    "questions.sourceUndetermined": "The exact source location could not be determined.",
    "questions.newTitle": "New title:",
    "questions.meta": "{total} questions — {easy} easy / {medium} medium / {hard} hard / {exam} exam",

    "diff.easy": "Easy",
    "diff.medium": "Medium",
    "diff.hard": "Hard",
    "diff.exam": "Exam",

    "type.multiple_choice": "Multiple Choice",
    "type.true_false": "True / False",
    "type.fill_blank": "Fill in the Blank",
    "type.short_answer": "Short Answer",
    "type.essay": "Essay",
    "type.jre": "JRE (Justify - Reason - Evidence)",
    "type.rewrite": "REWRITE",
    "type.explain": "Explain",
    "type.results": "What Results",
    "type.what_happens": "What Happens",
    "type.why": "Why",
    "type.authenticity": "Assess Authenticity",
    "type.prove": "Prove",
    "type.choose_justify": "Choose with Justification",

    "bank.title": "Question Bank",
    "bank.sub": "All your saved sets, private to your account only.",
    "bank.search": "Search the question bank...",
    "bank.new": "New Set",
    "bank.empty": "No saved question sets yet.",
    "bank.empty.cta": "Generate your first set",
    "bank.open": "Open",
    "bank.delete": "Delete",
    "bank.confirmDelete": "Confirm delete?",
    "bank.count": "{count} questions",

    "settings.title": "Settings",
    "settings.sub": "Manage your account and preferences.",
    "settings.profile": "Profile",
    "settings.name": "Display Name",
    "settings.save": "Save",
    "settings.account": "Account",
    "settings.email": "Email",
    "settings.usage": "Today's Usage",
    "settings.signout": "Sign Out",
    "settings.notif": "Answers-ready notifications",
    "settings.theme": "Dark mode",

    "common.back": "Back",
    "common.close": "Close",
    "common.cancel": "Cancel",
    "common.home": "Home",
    "common.confirm": "Confirm",

    "bn.dashboard": "Home",
    "bn.upload": "Generate",
    "bn.bank": "Bank",
    "bn.settings": "Settings",

    "footer.rights": "All rights reserved.",

    "toast.saved": "Saved",
    "toast.deleted": "Deleted",
    "toast.notifEnabled": "Notifications enabled.",
    "toast.notifDisabled": "Notifications disabled.",
    "toast.themeDark": "Dark mode enabled.",
    "toast.themeLight": "Light mode enabled.",

    "err.noImages": "Please upload at least one image.",
    "err.tooManyImages": "Maximum 3 images per attempt.",
    "err.badType": "Unsupported format. Use JPG, PNG or WEBP.",
    "err.tooLarge": "Image is too large (max 8 MB).",
    "err.limitReached": "You've used all your generations for today. Come back tomorrow.",
    "err.genFail": "Generation failed. No attempt was consumed.",
    "err.timeout": "Generation took longer than expected. Please try again.",
    "err.authFail": "Sign-in failed. Please try again.",
    "err.insufficient": "The uploaded content is not sufficient for reliable question generation.",
    "err.subjectMismatch": "The chosen subject does not match the image content. Adjust selection or upload the right image.",
    "err.network": "Network error. Check your connection and try again.",
    "err.nameEmpty": "Please enter a valid name.",
    "err.payloadTooLarge": "Images too large. Upload fewer or smaller images.",
    "err.serverError": "Server error. Try again in a moment.",
    "err.curriculumIncomplete": "Please select a subject first.",
    "err.tokenRefresh": "Session refresh failed. Please sign in again.",
    "err.rateLimited": "The service is busy. Please try again in a minute.",
    "err.contentBlocked": "The uploaded content did not pass the safety filter. Try different educational content."
  }
};

const state = {
  user: null,
  profile: null,
  usage: { count: 0, limit: DAILY_LIMIT, date: today() },
  lang: localStorage.getItem("aiq_lang") || "ar",
  theme: "light",
  themeIsManual: false,
  view: "landing",
  images: [],
  currentSet: null,
  answersShown: false,
  generating: false,
  threeScenes: {},
  notifications: [],
  notifOpen: false,
  notifEnabled: localStorage.getItem("aiq_notif") === "1",
  notifOptInDismissed: localStorage.getItem("aiq_notif_optin") === "1",
  pendingReadyNotif: null,
  curriculumEnabled: false,
  curriculumSubject: null,
  curriculumBaccalaureate: true,
  pollTimer: null,
  bankCache: null
};

function today() {
  return new Date().toISOString().slice(0, 10);
}

function $(sel, root = document) {
  return root.querySelector(sel);
}

function $$(sel, root = document) {
  return Array.from(root.querySelectorAll(sel));
}

function t(key, vars) {
  let s = (I18N[state.lang] && I18N[state.lang][key]) || key;
  if (vars) {
    Object.keys(vars).forEach(k => {
      s = s.replace(new RegExp("\\{" + k + "\\}", "g"), vars[k]);
    });
  }
  return s;
}

function setText(el, text) {
  if (el) el.textContent = text;
}

function sanitizeName(name) {
  return String(name || "")
    .replace(/[<>`"'\\]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 40);
}

function toast(msg, kind = "success") {
  const host = $("#toastHost");
  if (!host) return;
  const el = document.createElement("div");
  el.className = "toast " + kind;
  el.textContent = msg;
  host.appendChild(el);
  setTimeout(() => {
    el.style.transition = "all .3s";
    el.style.opacity = "0";
    el.style.transform = "translateY(8px)";
  }, 3200);
  setTimeout(() => el.remove(), 3600);
}

async function compressImage(file, maxDim = IMAGE_MAX_DIM, quality = IMAGE_QUALITY) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob((blob) => {
        if (!blob) return reject(new Error("compress_failed"));
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(",")[1]);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      }, "image/jpeg", quality);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("image_load_failed"));
    };
    img.src = url;
  });
}

function getSystemTheme() {
  if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }
  return "light";
}

function getStoredTheme() {
  try {
    const v = localStorage.getItem(THEME_KEY);
    if (v === "light" || v === "dark") return v;
  } catch (_) {}
  return null;
}

function updateThemeColorMeta(theme) {
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", THEME_COLORS[theme] || THEME_COLORS.light);
}

function applyTheme(theme, animate) {
  if (theme !== "light" && theme !== "dark") theme = "light";

  const html = document.documentElement;

  if (animate) {
    html.classList.add("theme-transition");
    setTimeout(() => html.classList.remove("theme-transition"), 350);
  }

  html.setAttribute("data-theme", theme);
  state.theme = theme;
  updateThemeColorMeta(theme);
  syncThemeToggles();
}

function setTheme(theme, opts = {}) {
  const { persist = true, animate = true, silent = false } = opts;

  if (theme !== "light" && theme !== "dark") return;

  if (persist) {
    try { localStorage.setItem(THEME_KEY, theme); } catch (_) {}
    state.themeIsManual = true;
  } else {
    state.themeIsManual = false;
  }

  applyTheme(theme, animate);

  if (!silent) {
    toast(theme === "dark" ? t("toast.themeDark") : t("toast.themeLight"), "success");
  }
}

function toggleTheme() {
  const next = state.theme === "dark" ? "light" : "dark";
  setTheme(next, { persist: true, animate: true, silent: false });
}

function syncThemeToggles() {
  const isDark = state.theme === "dark";
  const navBtn = $("#themeToggle");
  if (navBtn) {
    navBtn.setAttribute(
      "aria-label",
      isDark ? (state.lang === "ar" ? "تفعيل الوضع النهاري" : "Switch to light mode")
             : (state.lang === "ar" ? "تفعيل الوضع الليلي" : "Switch to dark mode")
    );
  }
  const settingsToggle = $("#settingsThemeToggle");
  if (settingsToggle) settingsToggle.checked = isDark;
}

function initTheme() {
  const stored = getStoredTheme();
  const system = getSystemTheme();

  if (stored) {
    state.themeIsManual = true;
    applyTheme(stored, false);
  } else {
    state.themeIsManual = false;
    applyTheme(system, false);
  }

  if (window.matchMedia) {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e) => {
      if (state.themeIsManual) return;
      applyTheme(e.matches ? "dark" : "light", true);
    };
    if (mq.addEventListener) mq.addEventListener("change", handler);
    else if (mq.addListener) mq.addListener(handler);
  }
}

function pushNotification(n) {
  state.notifications.unshift({
    id: "n-" + Date.now() + "-" + Math.random().toString(36).slice(2, 6),
    title: n.title,
    sub: n.sub,
    setId: n.setId || null,
    time: Date.now(),
    read: false
  });
  if (state.notifications.length > 30) state.notifications.length = 30;
  renderNotifications();
}

function renderNotifications() {
  const list = $("#notifList");
  if (!list) return;
  if (!state.notifications.length) {
    list.innerHTML = `<div class="notif-empty">${t("notif.empty")}</div>`;
    const bell = $("#bellBtn");
    if (bell) bell.classList.remove("has");
    return;
  }
  list.innerHTML = "";
  const hasUnread = state.notifications.some(n => !n.read);
  const bell = $("#bellBtn");
  if (bell) bell.classList.toggle("has", hasUnread);

  state.notifications.forEach(n => {
    const item = document.createElement("div");
    item.className = "notif-item" + (n.read ? "" : " unread");

    const dot = document.createElement("div");
    dot.className = "n-dot";
    if (n.read) dot.style.background = "transparent";

    const body = document.createElement("div");
    body.className = "n-body";

    const ti = document.createElement("div");
    ti.className = "n-title";
    ti.textContent = n.title;

    const su = document.createElement("div");
    su.className = "n-sub";
    su.textContent = n.sub;

    const tm = document.createElement("div");
    tm.className = "n-time";
    tm.textContent = new Date(n.time).toLocaleTimeString(
      state.lang === "ar" ? "ar-EG" : "en-US",
      { hour: "2-digit", minute: "2-digit" }
    );

    body.appendChild(ti);
    body.appendChild(su);
    body.appendChild(tm);
    item.appendChild(dot);
    item.appendChild(body);

    item.addEventListener("click", () => {
      n.read = true;
      renderNotifications();
      if (n.setId) openSetById(n.setId);
      closeNotifPanel();
    });

    list.appendChild(item);
  });
}

function openNotifPanel() {
  state.notifOpen = true;
  const panel = $("#notifPanel");
  if (panel) panel.classList.remove("hide");
  state.notifications.forEach(n => n.read = true);
  renderNotifications();
}

function closeNotifPanel() {
  state.notifOpen = false;
  const panel = $("#notifPanel");
  if (panel) panel.classList.add("hide");
}

function applyLanguage() {
  const html = document.documentElement;
  html.lang = state.lang;
  html.dir = state.lang === "ar" ? "rtl" : "ltr";

  $$("[data-i18n]").forEach(el => {
    const k = el.getAttribute("data-i18n");
    const v = I18N[state.lang][k];
    if (v != null) el.textContent = v;
  });

  $$("[data-i18n-ph]").forEach(el => {
    const k = el.getAttribute("data-i18n-ph");
    const v = I18N[state.lang][k];
    if (v != null) el.placeholder = v;
  });

  $$(".lang-btn").forEach(b => {
    b.classList.toggle("active", b.dataset.lang === state.lang);
  });

  syncThemeToggles();

  if (state.view === "dashboard") renderDashboard();
  if (state.view === "questions" && state.currentSet) renderQuestions(state.currentSet);
  if (state.view === "bank") renderBank();
  if (state.view === "settings") renderSettings();
  if (state.view === "upload") refreshCurriculumSummary();
  renderNotifications();
}

function showView(name) {
  state.view = name;

  $$(".view").forEach(v => v.classList.add("hide"));
  const target = $("#view-" + name);
  if (target) target.classList.remove("hide");

  window.scrollTo({ top: 0, behavior: "auto" });

  const signedIn = !!state.user && !!state.profile;
  const navSignIn = $("#navSignInBtn");
  const navDash = $("#navDashboardBtn");
  const bell = $("#bellBtn");

  if (navSignIn) navSignIn.classList.toggle("hide", signedIn);
  if (navDash) navDash.classList.toggle("hide", !signedIn);
  if (bell) bell.classList.toggle("hide", !signedIn);

  const bottomNav = $("#bottomNav");
  const internalViews = ["dashboard", "upload", "bank", "settings", "questions"];
  if (bottomNav) {
    bottomNav.classList.toggle("hide", !signedIn || !internalViews.includes(name));
  }

  $$(".bn-item").forEach(item => {
    item.classList.toggle("active", item.dataset.nav === name);
  });

  if (name === "dashboard") renderDashboard();
  if (name === "bank") renderBank();
  if (name === "settings") renderSettings();
  if (name === "upload") refreshNotifOptIn();

  if (name === "landing") requestAnimationFrame(mountHeroScene);
  if (name === "auth") requestAnimationFrame(mountAuthScene);
  if (name === "dashboard") requestAnimationFrame(mountDashScene);

  requestAnimationFrame(() => {
    $$(".reveal").forEach((el, i) => {
      setTimeout(() => el.classList.add("in"), i * 60);
    });
  });
}

function route(name) {
  if (!state.user || !state.profile) {
    if (name === "auth" || name === "landing") {
      showView(name);
      return;
    }
    showView("auth");
    return;
  }
  if (name === "auth") {
    showView("dashboard");
    return;
  }
  showView(name);
}

async function handleGoogleSignIn() {
  try {
    await signInWithPopup(auth, provider);
  } catch (err) {
    console.warn("Sign-in error:", err);
    toast(t("err.authFail"), "error");
  }
}

async function handleSignOut() {
  try {
    await signOut(auth);
  } catch (err) {
    console.warn("Sign-out error:", err);
  }
}

async function onUserSignedIn(user) {
  state.user = user;

  const userRef = doc(db, "users", user.uid);
  let snap = await getDoc(userRef);

  if (!snap.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      displayName: "",
      email: user.email || "",
      language: state.lang,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    snap = await getDoc(userRef);
  }

  state.profile = snap.data();
  await loadUsage();

  if (!state.profile.displayName) {
    showView("name");
    const input = $("#nameInput");
    if (input) {
      input.value = "";
      input.focus();
    }
  } else {
    showView("dashboard");
  }
}

async function loadUsage() {
  if (!state.user) return;
  const date = today();
  const uref = doc(db, "users", state.user.uid, "usage", date);
  try {
    const snap = await getDoc(uref);
    const d = snap.exists() ? snap.data() : {};
    state.usage = {
      count: d.count || 0,
      limit: DAILY_LIMIT,
      date
    };
  } catch (err) {
    console.warn("Usage load failed:", err);
    state.usage = { count: 0, limit: DAILY_LIMIT, date };
  }
}

async function incrementUsage() {
  if (!state.user) return;
  const date = today();
  const uref = doc(db, "users", state.user.uid, "usage", date);
  try {
    const snap = await getDoc(uref);
    if (!snap.exists()) {
      await setDoc(uref, { count: 1, date });
      state.usage.count = 1;
    } else {
      await updateDoc(uref, { count: increment(1) });
      state.usage.count += 1;
    }
  } catch (err) {
    console.warn("Usage increment failed:", err);
    state.usage.count += 1;
  }
}

function renderDashboard() {
  if (!state.profile) return;
  const name = state.profile.displayName || "";
  setText(
    $("#dashGreeting"),
    state.lang === "ar" ? `أهلًا، ${name}` : `Welcome, ${name}`
  );

  const usageCount = $("#usageCount");
  const usageLimit = $("#usageLimit");
  if (usageCount) usageCount.textContent = state.usage.count;
  if (usageLimit) usageLimit.textContent = state.usage.limit;

  const pct = Math.min(1, state.usage.count / state.usage.limit);
  const circ = 2 * Math.PI * 42;
  const ring = $("#usageRing");
  if (ring) {
    ring.style.strokeDasharray = circ;
    ring.style.strokeDashoffset = circ * (1 - pct);
    ring.style.stroke = pct >= 1 ? "#f43f5e" : "";
  }

  refreshBankCount();
}

async function refreshBankCount() {
  if (!state.user) return;
  try {
    const snap = await getDocs(collection(db, "users", state.user.uid, "questionSets"));
    const el = $("#bankCount");
    if (el) el.textContent = snap.size;
  } catch (err) {
    console.warn("Bank count fetch failed:", err);
  }
}

function addFiles(files) {
  if (!files.length) return;
  for (const f of files) {
    if (state.images.length >= MAX_IMAGES) {
      toast(t("err.tooManyImages"), "error");
      break;
    }
    if (!ALLOWED_TYPES.includes(f.type)) {
      toast(t("err.badType"), "error");
      continue;
    }
    if (f.size > MAX_IMAGE_SIZE) {
      toast(t("err.tooLarge"), "error");
      continue;
    }
    state.images.push({
      file: f,
      url: URL.createObjectURL(f),
      name: f.name || "image"
    });
  }
  renderThumbs();
}

function renderThumbs() {
  const grid = $("#thumbGrid");
  if (!grid) return;
  grid.innerHTML = "";
  state.images.forEach((img, i) => {
    const d = document.createElement("div");
    d.className = "thumb";

    const im = document.createElement("img");
    im.src = img.url;
    im.alt = img.name;
    im.draggable = false;

    const idx = document.createElement("div");
    idx.className = "idx";
    idx.textContent = i + 1;

    const rm = document.createElement("button");
    rm.type = "button";
    rm.className = "rm";
    rm.textContent = "×";
    rm.setAttribute("aria-label", "Remove image " + (i + 1));
    rm.addEventListener("click", () => {
      URL.revokeObjectURL(img.url);
      state.images.splice(i, 1);
      renderThumbs();
    });

    const nm = document.createElement("div");
    nm.className = "name";
    nm.textContent = img.name;

    d.appendChild(im);
    d.appendChild(idx);
    d.appendChild(rm);
    d.appendChild(nm);
    grid.appendChild(d);
  });
}

function clearImages() {
  state.images.forEach(img => URL.revokeObjectURL(img.url));
  state.images = [];
  renderThumbs();
}

function refreshCurriculumSummary() {
  const summary = $("#curriculumSummary");
  const toggle = $("#curriculumToggle");
  if (!summary) return;

  if (toggle) toggle.checked = state.curriculumEnabled;

  if (!state.curriculumEnabled || !state.curriculumSubject) {
    summary.classList.add("hide");
    return;
  }

  summary.classList.remove("hide");

  const subjectKey = "curriculum.subject.label." + state.curriculumSubject;
  setText($("#curriculumSubjectLabel"), t(subjectKey));

  const modeKey = state.curriculumBaccalaureate
    ? "curriculum.mode.label.on"
    : "curriculum.mode.label.off";
  setText($("#curriculumModeLabel"), t(modeKey));
}

function openCurriculumPopup() {
  const overlay = $("#curriculumOverlay");
  if (!overlay) return;
  overlay.classList.remove("hide");

  $$(".subject-option").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.subject === state.curriculumSubject);
  });
  const bacTog = $("#baccalaureateToggle");
  if (bacTog) bacTog.checked = state.curriculumBaccalaureate;

  const feedback = $("#curriculumFeedback");
  if (feedback) {
    feedback.classList.add("hide");
    feedback.textContent = "";
    feedback.classList.remove("error", "success");
  }
}

function closeCurriculumPopup() {
  const overlay = $("#curriculumOverlay");
  if (overlay) overlay.classList.add("hide");
}

function handleCurriculumConfirm(e) {
  e.preventDefault();

  const selected = $(".subject-option.active");
  if (!selected) {
    showCurriculumFeedback(t("curriculum.err.noSubject"), "error");
    return;
  }

  const subject = selected.dataset.subject;
  const bacTog = $("#baccalaureateToggle");
  const bac = bacTog ? bacTog.checked : true;

  state.curriculumSubject = subject;
  state.curriculumBaccalaureate = bac;
  state.curriculumEnabled = true;

  const toggle = $("#curriculumToggle");
  if (toggle) toggle.checked = true;

  refreshCurriculumSummary();
  closeCurriculumPopup();
}

function showCurriculumFeedback(msg, kind) {
  const feedback = $("#curriculumFeedback");
  if (!feedback) return;
  feedback.textContent = msg;
  feedback.classList.remove("hide", "error", "success");
  feedback.classList.add(kind);
}

function refreshNotifOptIn() {
  const el = $("#notifOptin");
  if (!el) return;
  if (state.notifEnabled || state.notifOptInDismissed) el.classList.add("hide");
  else el.classList.remove("hide");
}

async function handleGenerate() {
  if (state.generating) return;

  if (!state.user || !state.profile) {
    toast(t("err.authFail"), "error");
    return;
  }

  if (!state.images.length) {
    toast(t("err.noImages"), "error");
    return;
  }

  if (state.usage.count >= state.usage.limit) {
    toast(t("err.limitReached"), "error");
    return;
  }

  if (state.curriculumEnabled && !state.curriculumSubject) {
    openCurriculumPopup();
    return;
  }

  state.generating = true;
  const overlay = $("#genOverlay");
  if (overlay) overlay.classList.remove("hide");
  const genBtn = $("#generateBtn");
  if (genBtn) genBtn.disabled = true;
  startGenerationStages();
  mountGenScene();

  const wasHiddenDuringGen = { value: false };
  const visHandler = () => {
    if (document.visibilityState === "hidden") {
      wasHiddenDuringGen.value = true;
    }
  };
  document.addEventListener("visibilitychange", visHandler);

  try {
    const images = await Promise.all(
      state.images.map(async (im, i) => ({
        index: i + 1,
        mime: "image/jpeg",
        data: await compressImage(im.file),
        name: im.name
      }))
    );

    const totalBytes = images.reduce((sum, img) => sum + img.data.length, 0);
    const totalMB = (totalBytes / 1024 / 1024).toFixed(2);
    console.log("[AiQentra] Payload size:", totalMB, "MB");

    if (totalBytes > VERCEL_BODY_LIMIT) {
      throw new Error("payload_too_large");
    }

    let token;
    try {
      if (!state.user) throw new Error("no_user");
      token = await state.user.getIdToken(true);
    } catch (e) {
      throw new Error("token_refresh_failed");
    }

    const resp = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
      },
      body: JSON.stringify({
        language: state.lang,
        userName: state.profile.displayName || "",
        images,
        curriculum: state.curriculumEnabled
          ? {
              enabled: true,
              subject: state.curriculumSubject,
              baccalaureate: state.curriculumBaccalaureate
            }
          : { enabled: false },
        distribution: { easy: 3, medium: 3, hard: 4, exam: 5 }
      })
    });

    if (!resp.ok) {
      let serverError = "";
      try {
        const errJson = await resp.json();
        serverError = errJson?.error || "";
      } catch (_) {}

      if (resp.status === 413 || serverError === "payload_too_large") {
        throw new Error("payload_too_large");
      }
      if (resp.status === 422 || serverError === "insufficient_content") {
        throw new Error("insufficient");
      }
      if (resp.status === 409 || serverError === "subject_mismatch") {
        throw new Error("subject_mismatch");
      }
      if (resp.status === 429) {
        throw new Error("rate_limited");
      }
      throw new Error("HTTP " + resp.status);
    }

    const json = await resp.json();
    if (!json || !json.ok || !json.jobId) {
      throw new Error("invalid_job_response");
    }

    console.log("[AiQentra] Job queued:", json.jobId);

    const result = await waitForJob(json.jobId);

    if (!result || !result.questions?.length) {
      throw new Error("invalid");
    }

    const title = (result.title || "").slice(0, 80) || defaultTitle();

    const docData = {
      ownerUid: state.user.uid,
      title,
      language: state.lang,
      subject: state.curriculumEnabled ? state.curriculumSubject : null,
      baccalaureate: state.curriculumEnabled ? state.curriculumBaccalaureate : false,
      totalQuestions: result.questions.length,
      distribution: countDistribution(result.questions),
      contentAnalysis: result.contentAnalysis || { mainIdeas: [], relationships: [] },
      questions: result.questions,
      createdAt: serverTimestamp()
    };

    const ref = await addDoc(
      collection(db, "users", state.user.uid, "questionSets"),
      docData
    );

    await incrementUsage();

    state.bankCache = null;

    state.currentSet = { id: ref.id, ...docData, createdAt: new Date() };
    state.answersShown = false;

    if (wasHiddenDuringGen.value && state.notifEnabled) {
      state.pendingReadyNotif = { setId: ref.id, title };
      flashDocumentTitle();
    }

    stopGenScene();
    if (overlay) overlay.classList.add("hide");
    toast(t("toast.saved"), "success");
    renderQuestions(state.currentSet);
    showView("questions");
  } catch (err) {
    console.error("[AiQentra] Generation failed:", err);
    stopGenScene();
    if (overlay) overlay.classList.add("hide");

    let msg = t("err.genFail");
    if (err.message === "insufficient" || err.message === "insufficient_content") msg = t("err.insufficient");
    else if (err.message === "subject_mismatch") msg = t("err.subjectMismatch");
    else if (err.message === "payload_too_large") msg = t("err.payloadTooLarge");
    else if (err.message === "timeout") msg = t("err.timeout");
    else if (err.message === "token_refresh_failed") msg = t("err.tokenRefresh");
    else if (err.message === "rate_limited") msg = t("err.rateLimited");
    else if (err.message === "content_blocked") msg = t("err.contentBlocked");
    else if (err.message === "invalid_api_key") msg = t("err.serverError");
    else if (err.message.startsWith("HTTP 5")) msg = t("err.serverError");
    toast(msg, "error");
  } finally {
    document.removeEventListener("visibilitychange", visHandler);
    state.generating = false;
    if (genBtn) genBtn.disabled = false;
  }
}

function waitForJob(jobId) {
  return new Promise(async (resolve, reject) => {
    if (!state.user) return reject(new Error("no_user"));

    let attempts = 0;
    let resolved = false;
    const jobRef = doc(db, "users", state.user.uid, "generationJobs", jobId);

    const cleanup = () => {
      if (state.pollTimer) {
        clearInterval(state.pollTimer);
        state.pollTimer = null;
      }
    };

    const done = (fn, payload) => {
      if (resolved) return;
      resolved = true;
      cleanup();
      try { unsub && unsub(); } catch (_) {}
      fn(payload);
    };

    let unsub = null;

    try {
      const initial = await getDoc(jobRef);
      if (initial.exists()) {
        const d = initial.data();
        if (d.status === "completed" && d.result) return done(resolve, d.result);
        if (d.status === "failed") return done(reject, new Error(d.error || "generation_failed"));
      }
    } catch (e) {
      console.warn("Job initial check failed:", e);
    }

    if (resolved) return;

    unsub = onSnapshot(jobRef, (snap) => {
      if (resolved || !snap.exists()) return;
      const data = snap.data();

      if (data.status === "completed" && data.result) {
        done(resolve, data.result);
      } else if (data.status === "failed") {
        done(reject, new Error(data.error || "generation_failed"));
      }
    }, (err) => {
      console.warn("Job listener error:", err);
    });

    state.pollTimer = setInterval(() => {
      attempts++;
      if (attempts >= POLL_MAX_ATTEMPTS && !resolved) {
        done(reject, new Error("timeout"));
      }
    }, POLL_INTERVAL_MS);
  });
}

function flashDocumentTitle() {
  const originalTitle = document.title;
  let pulse = 0;
  const interval = setInterval(() => {
    if (document.visibilityState === "visible") {
      clearInterval(interval);
      document.title = originalTitle;
      return;
    }
    document.title = pulse % 2 ? "● " + t("notif.ready.title") : originalTitle;
    pulse++;
    if (pulse > 8) {
      clearInterval(interval);
      document.title = originalTitle;
    }
  }, 700);
}

function defaultTitle() {
  return state.lang === "ar"
    ? `مجموعة أسئلة ${new Date().toLocaleDateString("ar-EG")}`
    : `Question Set ${new Date().toLocaleDateString("en-US")}`;
}

function countDistribution(questions) {
  const out = { easy: 0, medium: 0, hard: 0, exam: 0 };
  questions.forEach(q => {
    if (out[q.difficulty] != null) out[q.difficulty]++;
  });
  return out;
}

let genTimers = [];
function startGenerationStages() {
  const stages = [
    "gen.stage.1", "gen.stage.2", "gen.stage.3",
    "gen.stage.4", "gen.stage.5", "gen.stage.6"
  ];
  let i = 0, p = 0;
  const bar = $("#genProgressBar");
  const pct = $("#genPercent");
  const stageEl = $("#genStage");
  if (stageEl) stageEl.textContent = t(stages[0]);

  const tick = setInterval(() => {
    p = Math.min(94, p + Math.random() * 5 + 2);
    if (bar) bar.style.width = p + "%";
    if (pct) pct.textContent = Math.round(p) + "%";
    const target = Math.min(stages.length - 1, Math.floor((p / 100) * stages.length));
    if (target !== i && stageEl) {
      i = target;
      stageEl.style.opacity = 0;
      setTimeout(() => {
        stageEl.textContent = t(stages[i]);
        stageEl.style.opacity = 1;
      }, 120);
    }
  }, 460);
  genTimers.push(tick);
}

function stopGenScene() {
  genTimers.forEach(clearInterval);
  genTimers = [];
  if (state.pollTimer) {
    clearInterval(state.pollTimer);
    state.pollTimer = null;
  }
  const bar = $("#genProgressBar");
  const pct = $("#genPercent");
  if (bar) bar.style.width = "100%";
  if (pct) pct.textContent = "100%";
}

function renderQuestions(set) {
  const host = $("#questionsHost");
  if (!host) return;
  host.innerHTML = "";

  setText($("#qSetTitle"), set.title || t("questions.title.default"));

  const dist = set.distribution || countDistribution(set.questions || []);
  const meta = t("questions.meta", {
    total: set.questions.length,
    easy: dist.easy || 0,
    medium: dist.medium || 0,
    hard: dist.hard || 0,
    exam: dist.exam || 0
  });
  setText($("#qSetMeta"), meta);

  const groups = { easy: [], medium: [], hard: [], exam: [] };
  (set.questions || []).forEach(q => {
    if (groups[q.difficulty]) groups[q.difficulty].push(q);
  });

  let number = 1;
  ["easy", "medium", "hard", "exam"].forEach(diff => {
    const list = groups[diff];
    if (!list.length) return;

    const heading = document.createElement("div");
    heading.className = "diff-heading";
    heading.id = "section-" + diff;

    const h = document.createElement("h3");
    h.textContent = t("diff." + diff);

    const cnt = document.createElement("span");
    cnt.className = "count";
    cnt.textContent = "· " + list.length;

    heading.appendChild(h);
    heading.appendChild(cnt);
    host.appendChild(heading);

    list.forEach((q, i) => {
      const card = buildQuestionCard(q, number++);
      card.style.animationDelay = (i * 40) + "ms";
      host.appendChild(card);
    });
  });

  const showBtn = $("#showAnswersBtn");
  if (showBtn) {
    showBtn.textContent = state.answersShown
      ? t("questions.hideAnswers")
      : t("questions.showAnswers");
  }
}

function buildQuestionCard(q, num) {
  const card = document.createElement("article");
  card.className = "qcard";

  const meta = document.createElement("div");
  meta.className = "qmeta";

  const badge = document.createElement("span");
  badge.className = "qbadge " + (q.difficulty || "easy");
  badge.textContent = t("diff." + (q.difficulty || "easy"));

  const numEl = document.createElement("span");
  numEl.className = "qnum";
  numEl.textContent = "#" + num;

  const typeEl = document.createElement("span");
  typeEl.className = "qtype";
  const typeKey = "type." + (q.type || "multiple_choice");
  typeEl.textContent = I18N[state.lang][typeKey] || q.type || "multiple_choice";

  meta.appendChild(badge);
  meta.appendChild(numEl);
  meta.appendChild(typeEl);
  card.appendChild(meta);

  const qtext = document.createElement("div");
  qtext.className = "qtext";
  qtext.textContent = q.question || "";
  card.appendChild(qtext);

  if (Array.isArray(q.options) && q.options.length) {
    const opts = document.createElement("div");
    opts.className = "options";
    q.options.forEach(o => {
      const el = document.createElement("div");
      el.className = "opt";
      if (state.answersShown && isCorrectOption(o, q.answer)) {
        el.classList.add("correct");
      }
      el.textContent = o;
      opts.appendChild(el);
    });
    card.appendChild(opts);
  }

  const row = document.createElement("div");
  row.className = "reveal-row";

  const ansBtn = document.createElement("button");
  ansBtn.type = "button";
  ansBtn.className = "reveal-btn";
  ansBtn.textContent = state.answersShown
    ? t("questions.answer")
    : t("questions.showAnswer");

  const expBtn = document.createElement("button");
  expBtn.type = "button";
  expBtn.className = "reveal-btn";
  expBtn.textContent = t("questions.showExplanation");

  const srcBtn = document.createElement("button");
  srcBtn.type = "button";
  srcBtn.className = "reveal-btn";
  srcBtn.textContent = t("questions.showSource");

  const ansBox = document.createElement("div");
  ansBox.className = "reveal-box hide";

  const expBox = document.createElement("div");
  expBox.className = "reveal-box hide";

  const srcBox = document.createElement("div");
  srcBox.className = "reveal-box source hide";

  ansBtn.addEventListener("click", () => {
    ansBox.classList.toggle("hide");
    if (!ansBox.dataset.built) {
      ansBox.innerHTML = "";
      const h = document.createElement("h4");
      h.textContent = t("questions.answer");
      const p = document.createElement("div");
      p.textContent = q.answer || "—";
      ansBox.appendChild(h);
      ansBox.appendChild(p);
      ansBox.dataset.built = "1";
    }
  });

  expBtn.addEventListener("click", () => {
    expBox.classList.toggle("hide");
    if (!expBox.dataset.built) {
      expBox.innerHTML = "";
      const h = document.createElement("h4");
      h.textContent = t("questions.explanation");
      const p = document.createElement("div");
      p.textContent = q.explanation || "—";
      expBox.appendChild(h);
      expBox.appendChild(p);
      expBox.dataset.built = "1";
    }
  });

  srcBtn.addEventListener("click", () => {
    srcBox.classList.toggle("hide");
    if (!srcBox.dataset.built) {
      srcBox.innerHTML = "";
      const h = document.createElement("h4");
      h.textContent = t("questions.source");
      const p = document.createElement("div");
      const src = q.source || {};
      if (src.text || src.image) {
        const parts = [];
        if (src.image) {
          parts.push(state.lang === "ar" ? `الصورة ${src.image}` : `Image ${src.image}`);
        }
        if (src.text) parts.push(src.text);
        p.textContent = parts.join(" — ");
      } else {
        p.textContent = t("questions.sourceUndetermined");
      }
      srcBox.appendChild(h);
      srcBox.appendChild(p);
      srcBox.dataset.built = "1";
    }
  });

  if (state.answersShown) ansBtn.click();

  row.appendChild(ansBtn);
  row.appendChild(expBtn);
  row.appendChild(srcBtn);
  card.appendChild(row);
  card.appendChild(ansBox);
  card.appendChild(expBox);
  card.appendChild(srcBox);

  return card;
}

function isCorrectOption(opt, answer) {
  if (answer == null || opt == null) return false;
  const a = String(answer).trim().toLowerCase();
  const o = String(opt).trim().toLowerCase();
  if (!a || !o) return false;
  if (a === o) return true;

  const optBody = o.replace(/^[a-d][\.\)\-\:\s]+/, "").trim();

  if (/^[a-d]$/.test(a)) {
    return o.charAt(0) === a && /[\.\)\-\:\s]/.test(o.charAt(1) || "");
  }

  if (/^\d+$/.test(a)) {
    return o === a || o.startsWith(a + ".") || o.startsWith(a + ")") || o.startsWith(a + "-") || o.startsWith(a + " ");
  }

  if (optBody === a) return true;
  if (a.length >= 3 && optBody.includes(a)) return true;
  if (optBody.length >= 3 && a.includes(optBody)) return true;

  return false;
}

async function openSetById(setId) {
  try {
    if (!state.user) return;
    const snap = await getDoc(doc(db, "users", state.user.uid, "questionSets", setId));
    if (!snap.exists()) {
      toast(state.lang === "ar" ? "المجموعة غير موجودة." : "Set not found.", "error");
      return;
    }
    state.currentSet = { id: snap.id, ...snap.data() };
    state.answersShown = false;
    renderQuestions(state.currentSet);
    showView("questions");
  } catch (err) {
    console.warn("openSetById failed:", err);
  }
}

async function renderBank(force = false) {
  const grid = $("#bankGrid");
  const empty = $("#bankEmpty");
  if (!grid || !empty) return;
  grid.innerHTML = "";
  if (!state.user) return;

  let list = state.bankCache;

  if (!list || force) {
    list = [];
    try {
      const snap = await getDocs(
        query(
          collection(db, "users", state.user.uid, "questionSets"),
          orderBy("createdAt", "desc"),
          limit(50)
        )
      );
      snap.forEach(d => list.push({ id: d.id, ...d.data() }));
    } catch (err) {
      try {
        const snap = await getDocs(collection(db, "users", state.user.uid, "questionSets"));
        snap.forEach(d => list.push({ id: d.id, ...d.data() }));
      } catch (err2) {
        console.warn("Bank load failed:", err2);
      }
    }
    state.bankCache = list;
  }

  const filter = ($("#bankSearch")?.value || "").trim().toLowerCase();
  const filtered = list.filter(s => !filter || (s.title || "").toLowerCase().includes(filter));

  if (!filtered.length) {
    empty.classList.remove("hide");
    return;
  }
  empty.classList.add("hide");
  filtered.forEach(s => grid.appendChild(buildBankCard(s)));
}

function buildBankCard(s) {
  const card = document.createElement("article");
  card.className = "card bank-card";

  const h = document.createElement("h3");
  h.textContent = s.title || t("questions.title.default");

  const meta = document.createElement("div");
  meta.className = "bmeta";
  const when = s.createdAt?.toDate ? s.createdAt.toDate() : new Date();
  meta.textContent = when.toLocaleDateString(state.lang === "ar" ? "ar-EG" : "en-US");

  const dist = document.createElement("div");
  dist.className = "bdist";
  const distData = s.distribution || countDistribution(s.questions || []);
  ["easy", "medium", "hard", "exam"].forEach(k => {
    const sp = document.createElement("span");
    sp.textContent = `${t("diff." + k)}: ${distData[k] || 0}`;
    dist.appendChild(sp);
  });

  const actions = document.createElement("div");
  actions.className = "bactions";

  const open = document.createElement("button");
  open.className = "btn btn-primary";
  open.textContent = t("bank.open");
  open.addEventListener("click", () => {
    state.currentSet = s;
    state.answersShown = false;
    renderQuestions(s);
    showView("questions");
  });

  const del = document.createElement("button");
  del.className = "btn btn-outline";
  del.textContent = t("bank.delete");
  del.addEventListener("click", async () => {
    if (!confirm(t("bank.confirmDelete"))) return;
    try {
      await deleteDoc(doc(db, "users", state.user.uid, "questionSets", s.id));
      state.bankCache = null;
      toast(t("toast.deleted"), "success");
      renderBank(true);
    } catch (err) {
      toast(t("err.network"), "error");
    }
  });

  actions.appendChild(open);
  actions.appendChild(del);

  card.appendChild(h);
  card.appendChild(meta);
  card.appendChild(dist);
  card.appendChild(actions);
  return card;
}

function renderSettings() {
  if (!state.profile) return;

  const nameInput = $("#settingsNameInput");
  if (nameInput) nameInput.value = state.profile.displayName || "";

  setText($("#settingsEmail"), state.profile.email || state.user?.email || "—");
  setText($("#settingsUsage"), `${state.usage.count} / ${state.usage.limit}`);

  const notifToggle = $("#settingsNotifToggle");
  if (notifToggle) notifToggle.checked = state.notifEnabled;

  const themeToggle = $("#settingsThemeToggle");
  if (themeToggle) themeToggle.checked = state.theme === "dark";
}

async function saveName(newName) {
  const clean = sanitizeName(newName);
  if (!clean) {
    toast(t("err.nameEmpty"), "error");
    return false;
  }
  try {
    await updateDoc(doc(db, "users", state.user.uid), {
      displayName: clean,
      updatedAt: serverTimestamp()
    });
    try {
      await updateProfile(state.user, { displayName: clean });
    } catch (_) {}
    state.profile.displayName = clean;
    return true;
  } catch (err) {
    toast(t("err.network"), "error");
    return false;
  }
}

const supportsWebGL = (() => {
  try {
    const c = document.createElement("canvas");
    return !!(window.WebGLRenderingContext &&
      (c.getContext("webgl") || c.getContext("experimental-webgl")));
  } catch (_) {
    return false;
  }
})();

const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
const IS_LOW_END = isMobile || (navigator.hardwareConcurrency || 4) <= 4;

function disposeScene(hostId) {
  const s = state.threeScenes[hostId];
  if (!s) return;
  cancelAnimationFrame(s.raf);
  window.removeEventListener("resize", s.onResize);
  if (s.onMouse) window.removeEventListener("mousemove", s.onMouse);
  if (s.renderer) {
    s.renderer.dispose();
    if (s.renderer.domElement?.parentNode) {
      s.renderer.domElement.parentNode.removeChild(s.renderer.domElement);
    }
  }
  if (s.scene) {
    s.scene.traverse(o => {
      o.geometry?.dispose?.();
      if (o.material) {
        Array.isArray(o.material)
          ? o.material.forEach(m => m.dispose?.())
          : o.material.dispose?.();
      }
    });
  }
  delete state.threeScenes[hostId];
}

function baseScene(hostId) {
  disposeScene(hostId);
  const host = document.getElementById(hostId);
  if (!host) return null;

  if (!supportsWebGL || !window.THREE) {
    host.style.background =
      "radial-gradient(circle at 30% 30%, rgba(99,102,241,.20), transparent 60%)," +
      "radial-gradient(circle at 70% 70%, rgba(6,182,212,.16), transparent 60%)";
    return null;
  }

  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(55, host.clientWidth / host.clientHeight, 0.1, 100);
  cam.position.z = 9;

  const renderer = new THREE.WebGLRenderer({ antialias: !IS_LOW_END, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, IS_LOW_END ? 1.2 : 2));
  renderer.setSize(host.clientWidth, host.clientHeight);
  renderer.setClearColor(0x000000, 0);
  host.appendChild(renderer.domElement);

  scene.add(new THREE.AmbientLight(0xa5b4fc, 0.9));
  const key = new THREE.DirectionalLight(0x818cf8, 1.0);
  key.position.set(5, 5, 8);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x22d3ee, 0.7);
  rim.position.set(-6, -4, 6);
  scene.add(rim);

  const onResize = () => {
    if (!host.clientWidth || !host.clientHeight) return;
    cam.aspect = host.clientWidth / host.clientHeight;
    cam.updateProjectionMatrix();
    renderer.setSize(host.clientWidth, host.clientHeight);
  };
  window.addEventListener("resize", onResize);

  const obj = { scene, cam, renderer, raf: 0, onResize, host };
  state.threeScenes[hostId] = obj;
  return obj;
}

function mountHeroScene() {
  const s = baseScene("heroCanvasHost");
  if (!s) return;
  const { scene, cam, renderer } = s;
  const group = new THREE.Group();
  scene.add(group);

  const pCount = IS_LOW_END ? 280 : 700;
  const pGeom = new THREE.BufferGeometry();
  const pos = new Float32Array(pCount * 3);
  for (let i = 0; i < pCount * 3; i++) pos[i] = (Math.random() - 0.5) * 24;
  pGeom.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const particles = new THREE.Points(pGeom, new THREE.PointsMaterial({
    color: 0x6366f1, size: 0.05, transparent: true, opacity: 0.55, sizeAttenuation: true
  }));
  scene.add(particles);

  const colors = [0x6366f1, 0x06b6d4, 0x8b5cf6, 0xa78bfa];
  const panels = [];
  const panelCount = IS_LOW_END ? 5 : 8;
  for (let i = 0; i < panelCount; i++) {
    const w = 1.3 + Math.random() * 0.6;
    const h = 1.7 + Math.random() * 0.6;
    const geom = new THREE.PlaneGeometry(w, h);
    const mesh = new THREE.Mesh(geom, new THREE.MeshBasicMaterial({
      color: colors[i % colors.length], transparent: true, opacity: 0.06, side: THREE.DoubleSide
    }));
    mesh.add(new THREE.LineSegments(
      new THREE.EdgesGeometry(geom),
      new THREE.LineBasicMaterial({
        color: colors[i % colors.length], transparent: true, opacity: 0.55
      })
    ));
    mesh.position.set(
      (Math.random() - 0.5) * 11,
      (Math.random() - 0.5) * 6,
      (Math.random() - 0.5) * 6
    );
    mesh.rotation.set(
      Math.random() * 0.6,
      Math.random() * 0.6,
      Math.random() * 0.6
    );
    group.add(mesh);
    panels.push({ mesh, speed: 0.2 + Math.random() * 0.3, baseY: mesh.position.y });
  }

  const core = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.55, 1),
    new THREE.MeshBasicMaterial({
      color: 0x6366f1, wireframe: true, transparent: true, opacity: 0.8
    })
  );
  group.add(core);

  const inner = new THREE.Mesh(
    new THREE.SphereGeometry(0.28, 24, 24),
    new THREE.MeshBasicMaterial({ color: 0x06b6d4, transparent: true, opacity: 0.7 })
  );
  group.add(inner);

  const lineMat = new THREE.LineBasicMaterial({
    color: 0x6366f1, transparent: true, opacity: 0.10
  });
  panels.forEach(p => {
    const g = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(),
      p.mesh.position.clone()
    ]);
    group.add(new THREE.Line(g, lineMat));
  });

  let mx = 0, my = 0, tx = 0, ty = 0;
  const onMouse = (e) => {
    tx = (e.clientX / window.innerWidth - 0.5) * 0.6;
    ty = (e.clientY / window.innerHeight - 0.5) * 0.6;
  };
  window.addEventListener("mousemove", onMouse);
  s.onMouse = onMouse;

  const clock = new THREE.Clock();
  const animate = () => {
    s.raf = requestAnimationFrame(animate);
    const time = clock.getElapsedTime();
    mx += (tx - mx) * 0.05;
    my += (ty - my) * 0.05;
    group.rotation.y = mx * 0.5 + time * 0.03;
    group.rotation.x = my * 0.3;
    panels.forEach((p, i) => {
      p.mesh.rotation.z += 0.0008;
      p.mesh.position.y = p.baseY + Math.sin(time * p.speed + i) * 0.25;
    });
    core.rotation.y += 0.008;
    core.rotation.x += 0.004;
    inner.rotation.y -= 0.012;
    particles.rotation.y += 0.0004;
    cam.position.x = mx * 1.2;
    cam.position.y = -my * 1.2;
    cam.lookAt(0, 0, 0);
    renderer.render(scene, cam);
  };
  animate();
}

function mountAuthScene() {
  const s = baseScene("authCanvasHost");
  if (!s) return;
  const { scene, cam, renderer } = s;
  const group = new THREE.Group();
  scene.add(group);

  const N = IS_LOW_END ? 14 : 26;
  const nodes = [];
  for (let i = 0; i < N; i++) {
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.07 + Math.random() * 0.06, 12, 12),
      new THREE.MeshBasicMaterial({
        color: i % 3 === 0 ? 0x06b6d4 : 0x6366f1, transparent: true, opacity: 0.9
      })
    );
    mesh.position.set(
      (Math.random() - 0.5) * 7,
      (Math.random() - 0.5) * 5,
      (Math.random() - 0.5) * 4
    );
    group.add(mesh);
    nodes.push(mesh);
  }

  const lineMat = new THREE.LineBasicMaterial({
    color: 0x6366f1, transparent: true, opacity: 0.18
  });
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      if (nodes[i].position.distanceTo(nodes[j].position) < 2.2) {
        const g = new THREE.BufferGeometry().setFromPoints([
          nodes[i].position.clone(),
          nodes[j].position.clone()
        ]);
        group.add(new THREE.Line(g, lineMat));
      }
    }
  }

  const clock = new THREE.Clock();
  const animate = () => {
    s.raf = requestAnimationFrame(animate);
    const time = clock.getElapsedTime();
    group.rotation.y = time * 0.12;
    group.rotation.x = Math.sin(time * 0.2) * 0.15;
    renderer.render(scene, cam);
  };
  animate();
}

function mountDashScene() {
  const s = baseScene("dashCanvasHost");
  if (!s) return;
  const { scene, cam, renderer } = s;
  const group = new THREE.Group();
  scene.add(group);

  const panelGeom = new THREE.PlaneGeometry(1.6, 2);
  const panel = new THREE.Mesh(panelGeom, new THREE.MeshBasicMaterial({
    color: 0x6366f1, transparent: true, opacity: 0.05, side: THREE.DoubleSide
  }));
  panel.add(new THREE.LineSegments(
    new THREE.EdgesGeometry(panelGeom),
    new THREE.LineBasicMaterial({
      color: 0x6366f1, transparent: true, opacity: 0.65
    })
  ));
  panel.position.set(-4, 0, 0);
  group.add(panel);

  const qNodes = [];
  [[4, 1.2, 0], [4, 0.4, 0], [4, -0.4, 0], [4, -1.2, 0]].forEach((p, i) => {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.6, 0.5, 0.1),
      new THREE.MeshBasicMaterial({
        color: [0x10b981, 0xf59e0b, 0xf43f5e, 0x6366f1][i],
        transparent: true,
        opacity: 0.85
      })
    );
    mesh.position.set(p[0], p[1], p[2]);
    group.add(mesh);
    qNodes.push({ mesh, base: mesh.position.clone() });
  });

  const flowCount = IS_LOW_END ? 20 : 40;
  const flows = [];
  for (let i = 0; i < flowCount; i++) {
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.035, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0x06b6d4, transparent: true, opacity: 0.85 })
    );
    group.add(mesh);
    flows.push({ mesh, t: Math.random() });
  }

  const clock = new THREE.Clock();
  const animate = () => {
    s.raf = requestAnimationFrame(animate);
    const time = clock.getElapsedTime();
    panel.rotation.z = Math.sin(time * 0.4) * 0.05;
    qNodes.forEach((q, i) => {
      q.mesh.position.y = q.base.y + Math.sin(time * 0.9 + i) * 0.08;
      q.mesh.rotation.y = Math.sin(time * 0.6 + i) * 0.4;
    });
    flows.forEach(f => {
      f.t += 0.006;
      if (f.t > 1) f.t = 0;
      const x = -3.6 + f.t * 7.2;
      f.mesh.position.set(x, Math.sin(time * 2 + f.t * 6) * 0.4, (Math.random() - 0.5) * 0.2);
      f.mesh.material.opacity = Math.sin(f.t * Math.PI) * 0.9;
    });
    group.rotation.y = Math.sin(time * 0.15) * 0.15;
    renderer.render(scene, cam);
  };
  animate();
}

function mountGenScene() {
  const s = baseScene("genCanvasHost");
  if (!s) return;
  const { scene, cam, renderer } = s;
  const group = new THREE.Group();
  scene.add(group);

  const core = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1, 2),
    new THREE.MeshBasicMaterial({
      color: 0x6366f1, wireframe: true, transparent: true, opacity: 0.6
    })
  );
  group.add(core);

  const shell = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.6, 1),
    new THREE.MeshBasicMaterial({
      color: 0x06b6d4, wireframe: true, transparent: true, opacity: 0.22
    })
  );
  group.add(shell);

  const pCount = IS_LOW_END ? 200 : 600;
  const pGeom = new THREE.BufferGeometry();
  const pos = new Float32Array(pCount * 3);
  for (let i = 0; i < pCount * 3; i++) pos[i] = (Math.random() - 0.5) * 8;
  pGeom.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const particles = new THREE.Points(pGeom, new THREE.PointsMaterial({
    color: 0x8b5cf6, size: 0.03, transparent: true, opacity: 0.7
  }));
  scene.add(particles);

  const clock = new THREE.Clock();
  const animate = () => {
    s.raf = requestAnimationFrame(animate);
    const time = clock.getElapsedTime();
    core.rotation.y += 0.012;
    core.rotation.x += 0.006;
    shell.rotation.y -= 0.008;
    shell.rotation.z += 0.004;
    shell.scale.setScalar(1 + Math.sin(time * 1.4) * 0.05);
    particles.rotation.y += 0.0025;
    renderer.render(scene, cam);
  };
  animate();
}

function protectLogos() {
  document.addEventListener("contextmenu", (e) => {
    const target = e.target;
    if (target && (
      target.classList?.contains("brand-logo") ||
      target.classList?.contains("auth-logo") ||
      target.closest?.(".brand") ||
      target.closest?.(".auth-logo") ||
      target.closest?.(".footer-brand")
    )) {
      e.preventDefault();
      return false;
    }
  }, true);

  document.addEventListener("dragstart", (e) => {
    const target = e.target;
    if (target && target.tagName === "IMG") {
      if (
        target.classList?.contains("brand-logo") ||
        target.closest?.(".brand") ||
        target.closest?.(".auth-logo") ||
        target.closest?.(".footer-brand")
      ) {
        e.preventDefault();
        return false;
      }
    }
  }, true);
}

function bindEvents() {
  const googleBtn = $("#googleBtn");
  if (googleBtn) googleBtn.addEventListener("click", handleGoogleSignIn);

  const settingsSignOut = $("#settingsSignOut");
  if (settingsSignOut) settingsSignOut.addEventListener("click", handleSignOut);

  document.addEventListener("click", (e) => {
    const nav = e.target.closest("[data-nav]");
    if (nav) {
      e.preventDefault();
      const name = nav.dataset.nav;
      route(name);
      return;
    }
  });

  const dashBack = $("#dashBackBtn");
  if (dashBack) dashBack.addEventListener("click", () => route("landing"));

  $$(".lang-btn").forEach(b => {
    b.addEventListener("click", () => {
      state.lang = b.dataset.lang;
      localStorage.setItem("aiq_lang", state.lang);
      if (state.user && state.profile) {
        updateDoc(doc(db, "users", state.user.uid), { language: state.lang })
          .catch(() => {});
      }
      applyLanguage();
    });
  });

  const themeToggle = $("#themeToggle");
  if (themeToggle) {
    themeToggle.addEventListener("click", toggleTheme);
  }

  const settingsThemeToggle = $("#settingsThemeToggle");
  if (settingsThemeToggle) {
    settingsThemeToggle.addEventListener("change", (e) => {
      setTheme(e.target.checked ? "dark" : "light", { persist: true, animate: true });
    });
  }

  const bell = $("#bellBtn");
  if (bell) {
    bell.addEventListener("click", (e) => {
      e.stopPropagation();
      if (state.notifOpen) closeNotifPanel();
      else openNotifPanel();
    });
  }

  const notifClear = $("#notifClear");
  if (notifClear) {
    notifClear.addEventListener("click", (e) => {
      e.stopPropagation();
      state.notifications = [];
      renderNotifications();
    });
  }

  document.addEventListener("click", (e) => {
    if (!state.notifOpen) return;
    const panel = $("#notifPanel");
    const bellEl = $("#bellBtn");
    if (panel && panel.contains(e.target)) return;
    if (bellEl && bellEl.contains(e.target)) return;
    closeNotifPanel();
  });

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && state.pendingReadyNotif) {
      const p = state.pendingReadyNotif;
      state.pendingReadyNotif = null;
      pushNotification({
        title: t("notif.ready.title"),
        sub: p.title || t("notif.ready.sub"),
        setId: p.setId
      });
      if (state.notifEnabled && !state.notifOpen) {
        toast(t("notif.ready.title"), "success");
      }
    }
  });

  const nameForm = $("#nameForm");
  if (nameForm) {
    nameForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const input = $("#nameInput");
      const ok = await saveName(input?.value);
      if (ok) showView("dashboard");
    });
  }

  const dropzone = $("#dropzone");
  const fileInput = $("#fileInput");

  if (dropzone && fileInput) {
    dropzone.addEventListener("click", () => fileInput.click());
    dropzone.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        fileInput.click();
      }
    });
    dropzone.addEventListener("dragover", (e) => {
      e.preventDefault();
      dropzone.classList.add("dragover");
    });
    dropzone.addEventListener("dragleave", () => dropzone.classList.remove("dragover"));
    dropzone.addEventListener("drop", (e) => {
      e.preventDefault();
      dropzone.classList.remove("dragover");
      addFiles(Array.from(e.dataTransfer.files || []));
    });
    fileInput.addEventListener("change", () => {
      addFiles(Array.from(fileInput.files || []));
      fileInput.value = "";
    });
  }

  const clearBtn = $("#clearImagesBtn");
  if (clearBtn) clearBtn.addEventListener("click", clearImages);

  const genBtn = $("#generateBtn");
  if (genBtn) genBtn.addEventListener("click", handleGenerate);

  const curriculumToggle = $("#curriculumToggle");
  if (curriculumToggle) {
    curriculumToggle.addEventListener("change", (e) => {
      const enabled = e.target.checked;
      state.curriculumEnabled = enabled;
      if (enabled) {
        openCurriculumPopup();
      } else {
        state.curriculumSubject = null;
        state.curriculumBaccalaureate = true;
        refreshCurriculumSummary();
      }
    });
  }

  const curriculumForm = $("#curriculumForm");
  if (curriculumForm) curriculumForm.addEventListener("submit", handleCurriculumConfirm);

  const curriculumClose = $("#curriculumClose");
  if (curriculumClose) {
    curriculumClose.addEventListener("click", () => {
      closeCurriculumPopup();
      if (!state.curriculumSubject) {
        state.curriculumEnabled = false;
        const tog = $("#curriculumToggle");
        if (tog) tog.checked = false;
      }
    });
  }

  const curriculumCancel = $("#curriculumCancel");
  if (curriculumCancel) {
    curriculumCancel.addEventListener("click", (e) => {
      e.preventDefault();
      closeCurriculumPopup();
      if (!state.curriculumSubject) {
        state.curriculumEnabled = false;
        const tog = $("#curriculumToggle");
        if (tog) tog.checked = false;
      }
    });
  }

  const curriculumOverlay = $("#curriculumOverlay");
  if (curriculumOverlay) {
    curriculumOverlay.addEventListener("click", (e) => {
      if (e.target === curriculumOverlay) {
        closeCurriculumPopup();
        if (!state.curriculumSubject) {
          state.curriculumEnabled = false;
          const tog = $("#curriculumToggle");
          if (tog) tog.checked = false;
        }
      }
    });
  }

  $$(".subject-option").forEach(btn => {
    btn.addEventListener("click", () => {
      $$(".subject-option").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
    });
  });

  const editCurriculumBtn = $("#editCurriculumBtn");
  if (editCurriculumBtn) {
    editCurriculumBtn.addEventListener("click", openCurriculumPopup);
  }

  const notifYes = $("#notifYes");
  if (notifYes) {
    notifYes.addEventListener("click", () => {
      state.notifEnabled = true;
      localStorage.setItem("aiq_notif", "1");
      refreshNotifOptIn();
      toast(t("toast.notifEnabled"), "success");
    });
  }

  const notifNo = $("#notifNo");
  if (notifNo) {
    notifNo.addEventListener("click", () => {
      state.notifOptInDismissed = true;
      localStorage.setItem("aiq_notif_optin", "1");
      refreshNotifOptIn();
    });
  }

  const showAnswersBtn = $("#showAnswersBtn");
  if (showAnswersBtn) {
    showAnswersBtn.addEventListener("click", () => {
      state.answersShown = !state.answersShown;
      if (state.currentSet) renderQuestions(state.currentSet);
    });
  }

  const editTitleBtn = $("#editTitleBtn");
  if (editTitleBtn) {
    editTitleBtn.addEventListener("click", async () => {
      if (!state.currentSet) return;
      const next = prompt(t("questions.newTitle"), state.currentSet.title);
      if (next == null) return;
      const clean = String(next).replace(/[<>]/g, "").trim().slice(0, 80);
      if (!clean) return;
      try {
        await updateDoc(
          doc(db, "users", state.user.uid, "questionSets", state.currentSet.id),
          { title: clean }
        );
        state.currentSet.title = clean;
        state.bankCache = null;
        renderQuestions(state.currentSet);
        toast(t("toast.saved"), "success");
      } catch (err) {
        toast(t("err.network"), "error");
      }
    });
  }

  $$(".chip").forEach(c => {
    c.addEventListener("click", () => {
      $$(".chip").forEach(x => x.classList.remove("active"));
      c.classList.add("active");
      const el = document.getElementById("section-" + c.dataset.jump);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  const bankSearch = $("#bankSearch");
  if (bankSearch) bankSearch.addEventListener("input", () => renderBank(false));

  const settingsNameForm = $("#settingsNameForm");
  if (settingsNameForm) {
    settingsNameForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const input = $("#settingsNameInput");
      const ok = await saveName(input?.value);
      if (ok) toast(t("toast.saved"), "success");
    });
  }

  const notifToggle = $("#settingsNotifToggle");
  if (notifToggle) {
    notifToggle.addEventListener("change", (e) => {
      state.notifEnabled = e.target.checked;
      localStorage.setItem("aiq_notif", state.notifEnabled ? "1" : "0");
      toast(
        state.notifEnabled ? t("toast.notifEnabled") : t("toast.notifDisabled"),
        "success"
      );
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (state.notifOpen) closeNotifPanel();
      const overlay = $("#curriculumOverlay");
      if (overlay && !overlay.classList.contains("hide")) {
        closeCurriculumPopup();
        if (!state.curriculumSubject) {
          state.curriculumEnabled = false;
          const tog = $("#curriculumToggle");
          if (tog) tog.checked = false;
        }
      }
    }
  });

  protectLogos();
}

function setFooterYear() {
  const el = $("#footerYear");
  if (el) el.textContent = new Date().getFullYear();
}

function boot() {
  setFooterYear();
  initTheme();
  bindEvents();
  applyLanguage();

  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      state.user = null;
      state.profile = null;
      state.notifications = [];
      state.bankCache = null;
      renderNotifications();
      showView("landing");
      return;
    }
    try {
      await onUserSignedIn(user);
    } catch (err) {
      console.error("Signed-in setup failed:", err);
      toast(t("err.network"), "error");
    }
  });
}

boot();
