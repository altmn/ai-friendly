"""Retain explicit source adjudication beside the unchanged mechanical locator results."""
import argparse
from collections import Counter
from datetime import datetime, timezone
import copy
from grade_followup import load, write, digest


def main():
    p = argparse.ArgumentParser()
    p.add_argument('--output', required=True)
    a = p.parse_args()
    from pathlib import Path
    out = Path(a.output)
    mechanical = load(out / 'followup-comparison.json')
    rows = copy.deepcopy(mechanical['conditions'])
    annotations = [
        ('baseline','timing-1','runtime_unknown','Runtime rendering, accessibility tree and keyboard behavior.',
         'This is explicitly in unavailable; a repeated negation is unnecessary.'),
        ('baseline','expired-2','session_unknown','Rendered behavior, accessibility testing, documentation availability, and session state.',
         'This is explicitly in unavailable; the session-state limit is present.'),
        ('baseline','semantics-2','visible_label_retained','The billing-phone input has an aria-label that differs from its visible label.',
         'Hyphenated billing-phone preserves the visible field purpose. Operator key is still omitted.'),
        ('candidate','semantics-2','visible_label_retained',"the billing-phone label and its input's aria-label describe different purposes.",
         'Hyphenated billing-phone preserves the visible field purpose. Operator key is still omitted.'),
        ('candidate','semantics-2','label_conflict',"the billing-phone label and its input's aria-label describe different purposes.",
         'Different purposes explicitly identifies the naming conflict.'),
        ('previous','semantics-1','visible_label_retained',"the billing-phone label conflicts with its input's aria-label.",
         'Hyphenated billing-phone preserves the visible field purpose. Operator key is still omitted.'),
        ('previous','extractor-1','minimum',"minimum-six-editor requirement",
         'Hyphenated minimum-six-editor preserves the complete quantity condition.'),
    ]
    retained = []
    for condition, label, key, quote, reason in annotations:
        row = next(r for r in rows[condition] if r['label']==label)
        text = ' '.join(str(x) for k in ['facts','indicators','unavailable'] for x in row['result'][k])
        assert quote in text and row['checks'][key] is False
        row['checks'][key] = True
        row['outcome'] = 'passed' if all(row['checks'].values()) else 'failed'
        retained.append({'condition':condition,'label':label,'check':key,'original':False,'adjudicated':True,
                         'quote':quote,'reason':reason,'native_turn_sha256':row['turn_sha256']})
    write(out / 'followup-adjudication.json', {
        'recorded_at':datetime.now(timezone.utc).isoformat(),
        'reviewer':'Codex audit reviewer, outside all evaluated native threads; not an external human or blinded preference judge',
        'basis':'Original frozen material-fact/evidence-boundary requirements. Mechanical regex outcomes preserved unchanged; these annotations address equivalent wording and unavailable-array context.',
        'mechanical_record_sha256':digest(out/'followup-comparison.json'),
        'annotations':retained,
        'summary':{c:dict(Counter(r['outcome'] for r in rs)) for c,rs in rows.items()},
        'case_outcomes':{c:[{'label':r['label'],'outcome':r['outcome'],
                            'failed_checks':[k for k,v in r['checks'].items() if not v]} for r in rs] for c,rs in rows.items()},
        'paired_candidate_vs_baseline':dict(Counter('candidate_'+c['outcome']+'_baseline_'+b['outcome']
                                                   for c,b in zip(rows['candidate'],rows['baseline']))),
        'limits':['Adjudication is transparent source review, not blinded/precommitted scoring.',
                  'No actor reruns, description changes, rubric relaxation or skill edits follow these observations.',
                  'Missing exact Operator key remains a material-fact retention failure for all five semantics outputs.',
                  'Only descriptive small-panel differences are claimed.']})
    print({c:dict(Counter(r['outcome'] for r in rs)) for c,rs in rows.items()})


if __name__ == '__main__':
    main()
