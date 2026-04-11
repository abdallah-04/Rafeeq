export type ArticleCategory = 'Speech' | 'Learning' | 'Behavior';

export interface Article {
  id: string;
  title_en: string;
  title_ar: string;
  body_en: string[];
  body_ar: string[];
  category: ArticleCategory;
  readTime: number; // minutes
  author: string;
  authorInitial: string;
  views: string;
  likes: number;
  saved: number;
  featured?: boolean;
}

export const mockArticles: Article[] = [
  {
    id: '1',
    title_en: 'Understanding Delayed Speech in Toddlers',
    title_ar: 'فهم تأخر الكلام عند الأطفال الصغار',
    body_en: [
      'Speech delays are more common than many parents realize. Between 10–15% of children under 3 show some form of communication delay — and early identification makes all the difference.',
      '"Early intervention before age 3 can dramatically improve long-term outcomes. The brain\'s plasticity during this window is unmatched at any later stage."',
      'If your child isn\'t meeting speech milestones, it doesn\'t always mean something is wrong — but it does mean it\'s worth exploring with a qualified specialist.',
      'Signs to watch for include: not babbling by 12 months, not using single words by 16 months, not combining two words by 24 months, or losing previously acquired language skills at any age.',
      'Working with a speech-language pathologist early can open doors to communication your child may otherwise struggle to access independently.',
    ],
    body_ar: [
      'تأخر الكلام أكثر شيوعاً مما يدرك كثير من الآباء. ما بين 10–15% من الأطفال دون سن الثالثة يُظهرون شكلاً من أشكال تأخر التواصل — والاكتشاف المبكر يُحدث فارقاً كبيراً.',
      '"التدخل المبكر قبل سن الثالثة يمكن أن يُحسّن النتائج طويلة المدى بشكل ملحوظ. مرونة الدماغ خلال هذه المرحلة لا مثيل لها في أي مرحلة لاحقة."',
      'إذا لم يُحقق طفلك معالم الكلام، فهذا لا يعني دائماً وجود خطأ — لكنه يعني أن الأمر يستحق الاستشارة مع متخصص مؤهل.',
      'علامات تستدعي الانتباه: عدم الثرثرة بعمر 12 شهراً، وعدم استخدام كلمات مفردة بعمر 16 شهراً، وعدم دمج كلمتين بعمر 24 شهراً، أو فقدان مهارات لغوية مكتسبة سابقاً.',
      'العمل مع أخصائي علاج نطق في وقت مبكر يفتح أمام طفلك أبواب التواصل التي قد يجد صعوبة في الوصول إليها باستقلالية.',
    ],
    category: 'Speech',
    readTime: 8,
    author: 'Dr. Sarah Ahmed',
    authorInitial: 'S',
    views: '13k',
    likes: 250,
    saved: 16,
    featured: true,
  },
  {
    id: '2',
    title_en: 'How to Support Reading Skills at Home',
    title_ar: 'كيف تدعم مهارات القراءة في المنزل',
    body_en: [
      'Reading is one of the most foundational skills a child can develop. Home support plays a critical role alongside formal schooling.',
      'Simple daily habits — reading aloud for 20 minutes, pointing to words as you read, and asking open questions about the story — can build strong literacy foundations.',
      '"Children with learning differences benefit greatly from multi-sensory approaches: seeing, hearing, and tracing letters simultaneously."',
      'Start with books that match your child\'s interest, not just their reading level. Motivation is the most powerful engine for literacy growth.',
      'Be patient and celebrate small wins. Progress in reading is rarely linear, especially for children with learning differences.',
    ],
    body_ar: [
      'القراءة من أهم المهارات الأساسية التي يمكن للطفل تطويرها. دعم المنزل يؤدي دوراً حاسماً جنباً إلى جنب مع التعليم الرسمي.',
      'العادات اليومية البسيطة — القراءة بصوت عالٍ 20 دقيقة، والإشارة إلى الكلمات أثناء القراءة، وطرح أسئلة مفتوحة عن القصة — يمكن أن تبني أسساً قوية للقراءة والكتابة.',
      '"يستفيد الأطفال ذوو الاحتياجات التعليمية الخاصة بشكل كبير من الأساليب متعددة الحواس: رؤية الحروف وسماعها وتتبعها في آنٍ واحد."',
      'ابدأ بكتب تتوافق مع اهتمام طفلك، وليس فقط مستواه القرائي. الدافعية هي المحرك الأقوى لنمو القراءة والكتابة.',
      'كن صبوراً واحتفل بالإنجازات الصغيرة. التقدم في القراءة نادراً ما يكون خطياً، خاصة بالنسبة للأطفال ذوي صعوبات التعلم.',
    ],
    category: 'Learning',
    readTime: 5,
    author: 'Ms. Lina Haddad',
    authorInitial: 'L',
    views: '8k',
    likes: 134,
    saved: 9,
  },
  {
    id: '3',
    title_en: "Managing ADHD Symptoms: A Parent's Guide",
    title_ar: 'إدارة أعراض فرط الحركة: دليل الوالدين',
    body_en: [
      'ADHD is one of the most commonly diagnosed neurodevelopmental disorders in children. Understanding it is the first step toward effective management.',
      '"Structure and routine are not restrictions — they are the scaffolding that allows children with ADHD to thrive within predictable boundaries."',
      'Break tasks into small, achievable steps. Children with ADHD often feel overwhelmed by large tasks; chunking creates momentum.',
      'Positive reinforcement works far better than punishment. Reward the effort, not just the result.',
      'Work with teachers to establish a consistent framework between home and school. Consistency is the key.',
    ],
    body_ar: [
      'فرط الحركة ونقص الانتباه من أكثر الاضطرابات العصبية النمائية تشخيصاً لدى الأطفال. فهمه هو الخطوة الأولى نحو الإدارة الفعّالة.',
      '"الهيكل والروتين ليسا قيوداً — بل هما السقالة التي تُتيح للأطفال المصابين بفرط الحركة الازدهار ضمن حدود قابلة للتنبؤ."',
      'قسّم المهام إلى خطوات صغيرة وقابلة للتحقيق. كثيراً ما يشعر الأطفال المصابون بفرط الحركة بالإرهاق من المهام الكبيرة؛ التقسيم يخلق زخماً.',
      'التعزيز الإيجابي يعمل بشكل أفضل بكثير من العقاب. كافئ الجهد وليس النتيجة فحسب.',
      'تعاون مع المعلمين لإنشاء إطار عمل متسق بين المنزل والمدرسة. الاتساق هو المفتاح.',
    ],
    category: 'Behavior',
    readTime: 6,
    author: 'Dr. Omar Nassar',
    authorInitial: 'O',
    views: '11k',
    likes: 198,
    saved: 22,
  },
  {
    id: '4',
    title_en: 'Early Intervention: Why It Matters for Speech Delays',
    title_ar: 'التدخل المبكر: لماذا يهم في تأخر الكلام',
    body_en: [
      'The first three years of life are a critical window for language development. During this time, the brain creates neural pathways at an extraordinary rate.',
      '"Every interaction — reading, singing, talking — is building the architecture for language. This is why early speech therapy is so powerful."',
      'Many parents wait too long before seeking help, worried about labeling their child. But assessment is just assessment — it opens options, not closes them.',
      'Early speech therapy helps children develop compensatory strategies while their brains are most malleable.',
      'Talk to your pediatrician if you have concerns. A referral to a speech-language pathologist is always a reasonable first step.',
    ],
    body_ar: [
      'السنوات الثلاث الأولى من الحياة نافذة حرجة لتطور اللغة. خلال هذا الوقت، يُنشئ الدماغ مسارات عصبية بمعدل غير عادي.',
      '"كل تفاعل — قراءة، غناء، حديث — يبني بنية اللغة. لهذا السبب يُعدّ علاج النطق المبكر قوياً جداً."',
      'كثير من الآباء ينتظرون طويلاً قبل طلب المساعدة، خشية وصم أطفالهم. لكن التقييم مجرد تقييم — يفتح الخيارات ولا يُغلقها.',
      'يساعد علاج النطق المبكر الأطفال على تطوير استراتيجيات تعويضية بينما أدمغتهم أكثر مرونة.',
      'تحدث إلى طبيب أطفالك إذا كانت لديك مخاوف. الإحالة إلى أخصائي علاج النطق هي دائماً خطوة أولى معقولة.',
    ],
    category: 'Speech',
    readTime: 4,
    author: 'Dr. Sarah Ahmed',
    authorInitial: 'S',
    views: '9k',
    likes: 176,
    saved: 14,
  },
  {
    id: '5',
    title_en: 'Building Focus: Activities for Children with ADD',
    title_ar: 'بناء التركيز: أنشطة للأطفال المصابين بنقص الانتباه',
    body_en: [
      'Attention Deficit Disorder (ADD) without hyperactivity is often overlooked because the child may seem quiet or daydreamy rather than disruptive.',
      '"The challenge is not attention itself — children with ADD can hyperfocus on things they love. The challenge is directing attention on demand."',
      'Structured play, puzzles, and short timed tasks help train the attention muscle. Start with 5-minute focus sessions and build gradually.',
      'Minimize distractions in the learning environment — quiet spaces, reduced clutter, and clear visual cues help enormously.',
      'Games like memory cards, sorting activities, and guided storytelling are enjoyable ways to build sustained attention naturally.',
    ],
    body_ar: [
      'اضطراب نقص الانتباه دون فرط الحركة كثيراً ما يُغفل عنه لأن الطفل قد يبدو هادئاً أو حالماً بدلاً من كونه مشتتاً.',
      '"التحدي ليس في الانتباه نفسه — يمكن للأطفال المصابين بنقص الانتباه التركيز المفرط على ما يحبون. التحدي هو توجيه الانتباه عند الطلب."',
      'اللعب المنظّم والألغاز والمهام القصيرة المحددة بوقت تساعد في تدريب عضلة الانتباه. ابدأ بجلسات تركيز لمدة 5 دقائق وابنِ تدريجياً.',
      'قلّل من المشتتات في بيئة التعلم — الأماكن الهادئة والفوضى المنخفضة والإشارات البصرية الواضحة تساعد كثيراً.',
      'ألعاب مثل بطاقات الذاكرة وأنشطة التصنيف والقصص الموجّهة طرق ممتعة لبناء الانتباه المستمر بشكل طبيعي.',
    ],
    category: 'Learning',
    readTime: 7,
    author: 'Ms. Rania Khalil',
    authorInitial: 'R',
    views: '6k',
    likes: 112,
    saved: 8,
  },
];

export const CATEGORY_COLORS: Record<ArticleCategory, string> = {
  Speech: '#4A90E2',
  Learning: '#7B61FF',
  Behavior: '#FF6B6B',
};

export const CATEGORY_EMOJIS: Record<string, string> = {
  Speech: '🗣️',
  Learning: '📚',
  Behavior: '🧠',
};
