function buildPrompt(language, userName, curriculum, distribution) {
  const isArabic = language === "ar";
  const { easy, medium, hard, exam } = distribution;
  const total = easy + medium + hard + exam;

  let curriculumSection = "";
  if (curriculum && curriculum.enabled) {
    const subjectNames = {
      arabic: isArabic ? "اللغة العربية (نحو + بلاغة)" : "Arabic (Grammar + Rhetoric)",
      english: isArabic ? "اللغة الإنجليزية (Reading + Grammar)" : "English (Reading + Grammar)",
      history: isArabic ? "التاريخ" : "History"
    };
    const mode = curriculum.baccalaureate
      ? (isArabic ? "وضع البكالوريا الرسمي" : "Official Baccalaureate mode")
      : (isArabic ? "الوضع العادي" : "Standard mode");

    curriculumSection = isArabic
      ? `\n\n**نظام البكالوريا:**\n- المادة: ${subjectNames[curriculum.subject] || curriculum.subject}\n- الوضع: ${mode}\n- التزم بمعايير الأسئلة الخاصة بهذه المادة.`
      : `\n\n**Baccalaureate system:**\n- Subject: ${subjectNames[curriculum.subject] || curriculum.subject}\n- Mode: ${mode}\n- Follow the question standards for this subject.`;
  }

  const greeting = isArabic ? `مرحباً ${userName}` : `Hello ${userName}`;
  const schemaHint = `{
  "title": "string",
  "contentAnalysis": {
    "mainIdeas": ["string"],
    "relationships": ["string"]
  },
  "questions": [
    {
      "difficulty": "easy | medium | hard | exam",
      "type": "multiple_choice | true_false | fill_blank | short_answer | essay | jre | rewrite | explain | results | what_happens | why | authenticity | prove | choose_justify",
      "question": "string",
      "options": ["string"],
      "answer": "string",
      "explanation": "string",
      "source": { "text": "string", "image": 1 }
    }
  ]
}`;

  if (isArabic) {
    return `${greeting}،

أنت Qentra، مساعد تعليمي. حلل الصور المرفقة وأنشئ أسئلة بناءً على محتواها **فقط**.

**قواعد صارمة:**
1. المحتوى المرفوع هو المصدر الوحيد للحقيقة.
2. لا تستخدم أي معلومات خارجية أو من الإنترنت.
3. لا تخترع أسئلة إذا كان المحتوى غير كافٍ.
4. لا تكرر نفس السؤال.
5. لكل سؤال: حدد الصعوبة والنوع بدقة.
6. الأسئلة الاختيارية (multiple_choice) يجب أن تحتوي على 4 خيارات.
7. الإجابة يجب أن تكون نصًا كاملاً (وليس حرفًا فقط).
8. source.text يجب أن يصف مكان الإجابة في الصورة (مثل: "الفقرة الثانية، السطر 3").

**التوزيع المطلوب:**
- ${easy} سهل
- ${medium} متوسط
- ${hard} صعب
- ${exam} امتحان
المجموع: ${total} سؤال.${curriculumSection}

**الإخراج:** أعد **JSON صالح فقط** (بدون markdown ولا نص إضافي) بهذا الهيكل:
${schemaHint}`;
  }

  return `${greeting},

You are Qentra, an educational assistant. Analyze the attached images and generate questions based **only** on their content.

**Strict rules:**
1. The uploaded content is the only source of truth.
2. Do not use any external or internet information.
3. Do not invent questions if the content is insufficient.
4. Do not repeat the same question.
5. For each question: specify difficulty and type accurately.
6. Multiple choice questions must contain 4 options.
7. The answer must be full text (not just a letter).
8. source.text must describe where the answer is in the image (e.g., "paragraph 2, line 3").

**Required distribution:**
- ${easy} easy
- ${medium} medium
- ${hard} hard
- ${exam} exam
Total: ${total}.${curriculumSection}

**Output:** Return **valid JSON only** (no markdown, no extra text) in this exact shape:
${schemaHint}`;
}

export { buildPrompt };
