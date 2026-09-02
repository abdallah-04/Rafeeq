from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "data" / "v05"

AR_NUM = ["واحد", "اثنان", "ثلاثة", "أربعة", "خمسة", "ستة", "سبعة", "ثمانية", "تسعة", "عشرة", "أحد عشر", "اثنا عشر"]
EN_NUM = ["one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve"]
AR_LETTERS = ["ا", "ب", "ت", "ث", "ج", "ح", "د", "ر", "س", "م"]
EN_LETTERS = list("ABCDEFGHIJ")
AR_WORDS = [("قلم", "pen"), ("كتاب", "book"), ("كرة", "ball"), ("باب", "door"), ("شمس", "sun"), ("قمر", "moon"), ("كرسي", "chair"), ("تفاحة", "apple"), ("ماء", "water"), ("بيت", "house"), ("قط", "cat"), ("كلب", "dog"), ("زهرة", "flower"), ("حقيبة", "bag"), ("سيارة", "car")]
AR_ACTIONS = ["يجري", "يكتب", "يقرأ", "يقفز", "يضحك", "يمشي", "يرسم", "يغسل", "ينام", "يأكل"]
EN_ACTIONS = ["run", "write", "read", "jump", "laugh", "walk", "draw", "wash", "sleep", "eat"]
CONTEXTS = [("في الصف", "in class"), ("في البيت", "at home"), ("في الحديقة", "in the garden"), ("في الساحة", "in the yard"), ("في المكتبة", "in the library"), ("في الملعب", "on the playground"), ("في المتجر", "in the shop"), ("في المطبخ", "in the kitchen"), ("في الطريق", "on the way"), ("في الحفلة", "at the party"), ("مع الأسرة", "with the family"), ("مع الأصدقاء", "with friends"), ("صباحاً", "in the morning"), ("مساءً", "in the evening"), ("في يوم مشمس", "on a sunny day"), ("في يوم ممطر", "on a rainy day"), ("أمام المعلمة", "in front of the teacher"), ("بجوار النافذة", "beside the window"), ("على الطاولة", "on the table"), ("في الحقيبة", "in the bag"), ("في الرحلة", "on the trip"), ("في الصف الصغير", "in the small class"), ("في ركن القراءة", "in the reading corner"), ("في درس الرياضيات", "in maths class"), ("في درس اللغة", "in language class"), ("عند الباب", "by the door"), ("تحت الشجرة", "under the tree"), ("فوق الورقة", "on the paper"), ("بعد اللعب", "after playtime"), ("قبل الغداء", "before lunch"), ("مع القصة", "with the story"), ("في صندوق الألعاب", "in the toy box"), ("في الحديقة الصغيرة", "in the little garden"), ("خلال النشاط", "during the activity"), ("في زاوية الفن", "in the art corner"), ("في وقت القراءة", "during reading time"), ("في مجموعة العمل", "in the work group"), ("في زيارة قصيرة", "on a short visit"), ("في يوم المدرسة", "on a school day"), ("في نشاط الصباح", "during morning activity")]


def options(answer: str, distractors: list[str], position: int) -> tuple[list[str], str]:
    values = []
    for distractor in distractors:
        if distractor != answer and distractor not in values:
            values.append(distractor)
        if len(values) == 3:
            break
    if len(values) != 3:
        # Numeric comparison templates can collapse at the lower boundary.
        candidate = 1
        while len(values) < 3:
            fallback = str(candidate)
            if fallback != answer and fallback not in values:
                values.append(fallback)
            candidate += 1
    values.insert(position, answer)
    return values, "ABCD"[position]


def concept(unit_id: str, subject: str, level: int, family: str, topic_ar: str, topic_en: str, objective_ar: str, objective_en: str, content_ar: str, content_en: str, question_ar: str, question_en: str, answer_ar: str, answer_en: str, distractors_ar: list[str], distractors_en: list[str], index: int) -> dict:
    ar_options, ar_letter = options(answer_ar, distractors_ar, index % 4)
    en_options, en_letter = options(answer_en, distractors_en, index % 4)
    context_ar, context_en = CONTEXTS[index % len(CONTEXTS)]
    return {"curriculum_id": "rafeeq-demo-curriculum-v05", "unit_id": unit_id, "subject": subject, "level": level, "skill_domain": "Foundations and guided reasoning", "concept_family": family, "topic_ar": topic_ar, "topic_en": topic_en, "learning_objective_ar": objective_ar, "learning_objective_en": objective_en, "content_ar": f"{content_ar} يحدث ذلك {context_ar}.", "content_en": f"{content_en} This happens {context_en}.", "keywords_ar": [answer_ar, topic_ar], "keywords_en": [answer_en, topic_en], "prompt_ar": f"{question_ar} ({context_ar})", "prompt_en": f"{question_en} ({context_en})", "answer_ar": answer_ar, "answer_en": answer_en, "distractors_ar": distractors_ar, "distractors_en": distractors_en, "correct_letter_ar": ar_letter, "correct_letter_en": en_letter, "options_ar": ar_options, "options_en": en_options}


def make_math(level: int, index: int) -> dict:
    family = f"math-l{level}-family-{index // 5 + 1:02d}"
    if level == 1:
        kind = index % 4
        if kind == 0:
            n = index // 4 + 1
            distractors = [str(n + 1), str(n + 2), str(n + 3)]
            return concept(f"math-l1-number-{n}", "MATH", 1, family, f"العدد {AR_NUM[n-1]}", f"Number {EN_NUM[n-1]}", "يتعرف عدداً مكتوباً", "Recognise a written number", f"العدد {AR_NUM[n-1]} يعني {n} عناصر.", f"The number {EN_NUM[n-1]} means {n} items.", f"أي عدد يعني {n} عناصر؟", f"Which number means {n} items?", str(n), str(n), distractors, distractors, index)
        if kind == 1:
            shapes = [("دائرة", "circle", "مستدير بلا أضلاع", "round with no sides"), ("مربع", "square", "له أربعة أضلاع متساوية", "has four equal sides"), ("مثلث", "triangle", "له ثلاثة أضلاع", "has three sides"), ("مستطيل", "rectangle", "له ضلعان طويلان وضلعان قصيران", "has two long and two short sides"), ("نجمة", "star", "له أطراف مدببة", "has pointed tips")]
            ar, en, ca, ce = shapes[(index // 4) % len(shapes)]
            others = [x for x in shapes if x[0] != ar]
            return concept(f"math-l1-shape-{index}", "MATH", 1, family, ar, en, "يميز شكلاً أساسياً", "Identify a basic shape", f"الشكل {ar} {ca}.", f"A {en} is {ce}.", f"أي شكل {ca}؟", f"Which shape is {ce}?", ar, en, [x[0] for x in others[:3]], [x[1].title() for x in others[:3]], index)
        a, b = index % 10 + 1, (index * 3) % 10 + 1
        if a == b: b += 1
        greater = max(a, b)
        return concept(f"math-l1-compare-{index}", "MATH", 1, family, "مقارنة عددين", "Compare two numbers", "يختار العدد الأكبر", "Choose the greater number", f"العدد {greater} أكبر من العدد الآخر.", f"The number {greater} is greater than the other number.", f"أي عدد أكبر: {a} أم {b}؟", f"Which number is greater: {a} or {b}?", str(greater), str(greater), [str(min(a,b)), str(greater+1), str(max(1,greater-1))], [str(min(a,b)), str(greater+1), str(max(1,greater-1))], index)
    if level == 2:
        kind = index % 4
        if kind == 0:
            a, b = index % 8 + 1, (index * 2) % 6 + 1
            total = a + b
            return concept(f"math-l2-add-{a}-{b}-{index}", "MATH", 2, family, "جمع عددين", "Add two numbers", "يجمع عددين صغيرين", "Add two small numbers", f"عند جمع {a} و{b} يكون الناتج {total}.", f"When {a} and {b} are added, the total is {total}.", f"ما ناتج {a} + {b}؟", f"What is {a} + {b}?", str(total), str(total), [str(total-1), str(total+1), str(total+2)], [str(total-1), str(total+1), str(total+2)], index)
        if kind == 1:
            total, a = 5 + index % 8, 1 + index % 4
            missing = total - a
            return concept(f"math-l2-missing-add-{a}-{total}", "MATH", 2, family, "عدد مفقود في الجمع", "Missing addend", "يجد العدد المفقود", "Find the missing addend", f"في {a} + ؟ = {total} العدد المفقود هو {missing}.", f"In {a} + ? = {total}, the missing number is {missing}.", f"ما العدد المفقود: {a} + ؟ = {total}؟", f"What number is missing: {a} + ? = {total}?", str(missing), str(missing), [str(missing-1), str(missing+1), str(missing+2)], [str(missing-1), str(missing+1), str(missing+2)], index)
        a, b = index % 9 + 2, (index * 2) % 8 + 1
        answer = "الأول" if a > b else "الثاني"
        return concept(f"math-l2-compare-quantities-{index}", "MATH", 2, family, "مقارنة كميتين", "Compare quantities", "يقارن كميتين", "Compare two quantities", f"العدد {max(a,b)} يمثل كمية أكبر.", f"The quantity {max(a,b)} is greater.", f"أي كمية أكبر: {a} أم {b}؟", f"Which quantity is greater: {a} or {b}?", str(max(a,b)), str(max(a,b)), [str(min(a,b)), str(max(a,b)-1), str(max(a,b)+1)], [str(min(a,b)), str(max(a,b)-1), str(max(a,b)+1)], index)
    if level == 3:
        kind = index % 3
        if kind == 0:
            a, b = 5 + index % 10, 1 + index % 5
            return concept(f"math-l3-subtract-{a}-{b}", "MATH", 3, family, "طرح كميتين", "Subtract quantities", "يطرح عدداً من عدد أكبر", "Subtract one quantity from another", f"عند طرح {b} من {a} يبقى {a-b}.", f"When {b} is taken from {a}, {a-b} remain.", f"ما ناتج {a} - {b}؟", f"What is {a} - {b}?", str(a-b), str(a-b), [str(a-b-1), str(a-b+1), str(a)], [str(a-b-1), str(a-b+1), str(a)], index)
        if kind == 1:
            start, given, extra = 4 + index % 7, 1 + index % 3, 1 + (index // 2) % 3
            total = start - given + extra
            return concept(f"math-l3-context-{index}", "MATH", 3, family, "مسألة كمية قصيرة", "Short quantity story", "يحل مسألة من خطوتين", "Solve a two-step quantity story", f"كان مع طفل {start} أشياء، أعطى {given} ثم حصل على {extra}، فأصبح معه {total}.", f"A child had {start} items, gave away {given}, then got {extra}, leaving {total}.", "كم أصبح معه؟", "How many items are there now?", str(total), str(total), [str(total-1), str(total+1), str(start)], [str(total-1), str(total+1), str(start)], index)
        n = 2 + index % 6
        return concept(f"math-l3-sequence-{index}", "MATH", 3, family, "تتابع عددي", "Number sequence", "يكمل تتابعاً عددياً", "Continue a number sequence", f"في التتابع {n}، {n+2}، {n+4} يأتي {n+6}.", f"In the sequence {n}, {n+2}, {n+4}, the next number is {n+6}.", f"ما العدد التالي: {n}، {n+2}، {n+4}، ؟", f"What comes next: {n}, {n+2}, {n+4}, ?", str(n+6), str(n+6), [str(n+5), str(n+7), str(n+8)], [str(n+5), str(n+7), str(n+8)], index)
    raise ValueError(level)


def make_language(level: int, index: int) -> dict:
    family = f"language-l{level}-family-{index // 5 + 1:02d}"
    if level == 1:
        if index % 2 == 0:
            i = index // 2 % len(AR_LETTERS); ar, en = AR_LETTERS[i], EN_LETTERS[i]
            return concept(f"lang-l1-letter-{i}", "LANGUAGE", 1, family, f"حرف {ar}", f"Letter {en}", "يتعرف رمز الحرف", "Recognise a letter symbol", f"الحرف {ar} رمز لحرف عربي.", f"The symbol {en} is a letter.", f"أي رمز هو الحرف {ar}؟", f"Which symbol is the letter {en}?", ar, en, [x for x in AR_LETTERS if x != ar][:3], [x for x in EN_LETTERS if x != en][:3], index)
        i = index // 2 % len(AR_WORDS); ar, en = AR_WORDS[i]
        others = [x for x in AR_WORDS if x[0] != ar]
        return concept(f"lang-l1-word-{i}", "LANGUAGE", 1, family, f"كلمة {ar}", f"Word {en}", "يتعرف كلمة شائعة", "Recognise common vocabulary", f"كلمة {ar} اسم لشيء مألوف.", f"The word {en} names a familiar object.", f"أي كلمة تسمي {en}؟", f"Which word names a {en}?", ar, en, [x[0] for x in others[:3]], [x[1].title() for x in others[:3]], index)
    if level == 2:
        if index % 2 == 0:
            i = index // 2 % len(AR_ACTIONS); ar, en = AR_ACTIONS[i], EN_ACTIONS[i]
            return concept(f"lang-l2-action-{i}", "LANGUAGE", 2, family, "كلمات الأفعال", "Action words", "يميز كلمة تدل على فعل", "Identify an action word", f"كلمة {ar} تدل على فعل.", f"The word {en} names an action.", "أي كلمة تدل على فعل؟", "Which word names an action?", ar, en, ["كتاب", "شمس", "باب"], ["book", "sun", "door"], index)
        i = index // 2 % len(AR_WORDS); ar, en = AR_WORDS[i]
        return concept(f"lang-l2-meaning-{i}", "LANGUAGE", 2, family, "معنى كلمة", "Word meaning", "يربط الكلمة بمعناها", "Match a word to its meaning", f"نستخدم {ar} في موقف مناسب لمعناه.", f"We use a {en} for its familiar purpose.", f"أي كلمة تعني {en}؟", f"Which word means {en}?", ar, en, [x[0] for x in AR_WORDS if x[0] != ar][:3], [x[1].title() for x in AR_WORDS if x[1] != en][:3], index)
    if level == 3:
        if index % 3 == 0:
            i = index // 3 % len(AR_WORDS); ar, en = AR_WORDS[i]
            return concept(f"lang-l3-context-{i}", "LANGUAGE", 3, family, "تفصيل من سياق", "Context detail", "يستخرج تفصيلاً من جملة", "Find a detail from context", f"ذهب الطفل إلى المكان ومعه {ar}.", f"The child went to a place carrying a {en}.", f"ماذا كان مع الطفل؟", f"What did the child carry?", ar, en, [x[0] for x in AR_WORDS if x[0] != ar][:3], [x[1].title() for x in AR_WORDS if x[1] != en][:3], index)
        if index % 3 == 1:
            ar, en = ("نقطة", "period") if index % 2 else ("علامة استفهام", "question mark")
            return concept(f"lang-l3-punctuation-{index}", "LANGUAGE", 3, family, "علامات الترقيم", "Punctuation", "يختار علامة مناسبة للسياق", "Choose punctuation for context", f"تستخدم {ar} في نوع الجملة المناسب.", f"A {en} is used for the matching sentence type.", "ما العلامة المناسبة لنهاية السؤال؟" if en == "question mark" else "ما العلامة المناسبة لنهاية جملة خبرية؟", "Which mark ends a question?" if en == "question mark" else "Which mark ends a statement?", ar, en, ["فاصلة", "حرف", "مسافة"], ["comma", "letter", "space"], index)
        return concept(f"lang-l3-inference-{index}", "LANGUAGE", 3, family, "استنتاج من جملة", "Sentence inference", "يستنتج معنى بسيطاً من السياق", "Make a simple sentence inference", "إذا كانت السماء مظلمة فقد يأتي المطر.", "If the sky is dark, rain may come.", "ماذا قد يأتي عندما تكون السماء مظلمة؟", "What may come when the sky is dark?", "المطر", "rain", ["الشمس", "الكتاب", "القلم"], ["sun", "book", "pen"], index)
    raise ValueError(level)


def main() -> None:
    units = [make_math(level, index) if subject == "MATH" else make_language(level, index) for subject in ("MATH", "LANGUAGE") for level in (1, 2, 3) for index in range(40)]
    for ordinal, unit in enumerate(units, 1):
        unit["unit_id"] = f"{unit['unit_id']}-v05-{ordinal:03d}"
    rows = []
    for unit in units:
        for language in ("ar", "en"):
            options_value = unit[f"options_{language}"]
            correct_letter = unit[f"correct_letter_{language}"]
            explanation = (f"الإجابة الصحيحة هي {unit['answer_ar']}. {unit['content_ar']}" if language == "ar" else f"The correct answer is {unit['answer_en']}. {unit['content_en']}")
            rows.append({"id": f"{unit['unit_id']}-{language}", "curriculum_unit_id": unit["unit_id"], "concept_family": unit["concept_family"], "level": unit["level"], "subject": unit["subject"], "language": language, "historical_split": None, "topic": unit[f"topic_{language}"], "content": unit[f"content_{language}"], "source_expected": {"question": unit[f"prompt_{language}"], "answer": unit[f"answer_{language}"], "distractors": unit[f"distractors_{language}"], "explanation": explanation}, "input_condition": "\n".join(["task=generate_mcq", f"language={language}", f"level={unit['level']}", f"subject={unit['subject']}", f"topic={unit[f'topic_{language}']}", f"content={unit[f'content_{language}']}"]), "training_expected": {"question": unit[f"prompt_{language}"], "options": options_value, "correct_letter": correct_letter, "correct_option": "ABCD".index(correct_letter) + 1, "explanation": explanation}, "targets": {"sentinel_native_v2": " ".join([f"<extra_id_{i}> {value}" for i, value in enumerate([unit[f'prompt_{language}'], *options_value, correct_letter, explanation])]) + " <extra_id_7>", "plain_text": "\n".join([f"Q: {unit[f'prompt_{language}']}", *[f"{letter}: {value}" for letter, value in zip('ABCD', options_value)], f"ANS: {correct_letter}", f"EXP: {explanation}"])}})
    # Split whole semantic families within each subject/level stratum.
    split = {}
    for subject in ("MATH", "LANGUAGE"):
        for level in (1, 2, 3):
            families = sorted({row["concept_family"] for row in rows if row["subject"] == subject and row["level"] == level})
            for family in families[:6]: split[family] = "train"
            split[families[6]] = "validation"; split[families[7]] = "test"
    for row in rows: row["historical_split"] = split[row["concept_family"]]
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "curriculum_v05.json").write_text(json.dumps({"curriculum_id": "rafeeq-demo-curriculum-v05", "data_status": "DEMO / PROTOTYPE EDUCATIONAL DATA", "units": units}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    with (OUT / "master_v05.jsonl").open("w", encoding="utf-8", newline="\n") as handle:
        for row in rows: handle.write(json.dumps(row, ensure_ascii=False) + "\n")
    manifest = {"version": "v05", "split_rule": "sorted concept families, six train, one validation, one test per subject/level", "families": {name: value for name, value in sorted(split.items())}, "unit_membership": {name: sorted({row["curriculum_unit_id"] for row in rows if row["historical_split"] == name}) for name in ("train", "validation", "test")}, "row_membership": {name: sorted(row["id"] for row in rows if row["historical_split"] == name) for name in ("train", "validation", "test")}, "counts": {name: sum(row["historical_split"] == name for row in rows) for name in ("train", "validation", "test")}}
    (OUT / "split_manifest_v05.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"units": len(units), "rows": len(rows), "split_counts": manifest["counts"]}, indent=2))


if __name__ == "__main__": main()
