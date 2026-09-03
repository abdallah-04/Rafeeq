from __future__ import annotations

import json, re, sys
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]; sys.path.insert(0,str(ROOT/"src"))
from rafeeq_qg.v061_hybrid import verify_fact
from rafeeq_qg.v063_hybrid import deterministic_options
from rafeeq_qg.v061_formats import parse_short

def main():
    path=ROOT/"data"/"v063"/"master_v063.jsonl"; rows=[json.loads(x) for x in path.read_text(encoding="utf8").splitlines() if x.strip()]
    assert len(rows)==600 and len({r["id"] for r in rows})==600 and len({r["input_condition"] for r in rows})==600
    assert {s:sum(r["split"]==s for r in rows) for s in ("train","validation","test")} == {"train":480,"validation":60,"test":60}
    for row in rows:
        assert parse_short(row["targets"]["short_sentinel_v063"])
        assert "target_question" not in row["input_condition"] and "distractors" not in row["input_condition"] and "correct_letter" not in row["input_condition"]
        assert not re.search(r"\b(validation|test)\b", row["id"]+" "+row["curriculum_unit_id"]+" "+row["instance_signature"]+" "+row["input_condition"])
        if row["subject"]=="MATH":
            assert verify_fact(row["fact_payload"])
            if row["language"]=="ar": assert not re.search(r"[A-Za-z]{2,}",row["content"])
        options,letter=deterministic_options(row); answer=str(row["source_expected"]["answer"])
        assert len(options)==4 and len({x.casefold() for x in options})==4 and options[ord(letter)-65]==answer
    val={r["instance_signature"] for r in rows if r["split"]=="validation"}; test={r["instance_signature"] for r in rows if r["split"]=="test"}
    assert not val & test
    stats={"version":"v0.6.3","rows":len(rows),"counts":{s:sum(r["split"]==s for r in rows) for s in ("train","validation","test")},"units":{s:len({r["curriculum_unit_id"] for r in rows if r["split"]==s}) for s in ("train","validation","test")},"unique_inputs":len({r["input_condition"] for r in rows}),"math_facts_valid":True,"arabic_math_latin_contexts":0,"validation_test_signature_overlap":0,"deterministic_option_integrity":True}
    (ROOT/"data"/"v063"/"dataset_statistics_v063.json").write_text(json.dumps(stats,ensure_ascii=False,indent=2)+"\n",encoding="utf8"); print(json.dumps(stats,ensure_ascii=False,indent=2))
if __name__=="__main__": main()
