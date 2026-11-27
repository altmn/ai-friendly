import unittest
from grade_followup import material_checks, native_turn


class FollowupGrading(unittest.TestCase):
    def result(self, text, count=None):
        return {'facts': [text], 'unavailable': ['Runtime untested'],
                'backend_record_checked': False, 'business_effect_verified': None,
                'unintended_effect_count': count}

    def test_zero_effect_count_is_not_unknown(self):
        self.assertFalse(material_checks('timing', self.result('static import timing', 0))[
            'unintended_effect_count_unknown'])

    def test_missing_effect_count_is_not_unknown(self):
        result = self.result('static import timing')
        del result['unintended_effect_count']
        self.assertFalse(material_checks('timing', result)['unintended_effect_count_unknown'])

    def test_material_price_conditions_are_required(self):
        complete = '59 GBP per workspace monthly; billed every six months; minimum five workspaces; UK only'
        self.assertTrue(all(material_checks('price', self.result(complete)).values()))
        self.assertFalse(material_checks('price', self.result(complete.replace('UK', '')))['eligibility'])

    def test_generic_label_warning_does_not_preserve_exact_labels(self):
        checks = material_checks('semantics', self.result('Conflicting labels; password type text'))
        self.assertTrue(checks['label_conflict'])
        self.assertFalse(checks['visible_label_retained'])
        self.assertFalse(checks['accessible_label_retained'])

    def test_native_events_require_both_thread_and_turn(self):
        events = [{'method': 'item/completed', 'params': {'threadId': t, 'turnId': r}}
                  for t, r in [('same', 'old'), ('other', 'new'), ('same', 'new')]]
        self.assertEqual(native_turn(events, 'same', 'new'), events[-1:])


if __name__ == '__main__':
    unittest.main()
