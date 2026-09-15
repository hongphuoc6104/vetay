import copy
import unittest
from channel_schema import validate_channel, SCIENCE_TYPES


def science():
    return {'domain': 'science', 'sources': [{'id': 's1', 'url': 'https://example.org/source', 'title': 'Draft source', 'source_type': 'paper', 'peer_review': 'unknown', 'published': None, 'published_note': 'Date not established', 'checked': False, 'checked_date': None}], 'channel': {'kind': 'science', 'content_type': 'explain', 'claims': [{'id': 'c1', 'text': 'Draft claim', 'source_ids': ['s1'], 'status': 'unverified'}]}}


def story():
    return {'domain': 'story', 'scenes': [{'id': 'opening'}], 'sources': [], 'channel': {'kind': 'storytelling', 'truth_status': 'fiction', 'truth_disclosure': 'This story is fictional.', 'character_bible': [{'id': 'cat', 'name': 'Cat', 'appearance': 'Orange coat', 'voice': 'Quiet', 'invariants': 'Blue scarf'}], 'continuity_checks': [{'scene_id': 'opening', 'character_ids': ['cat'], 'status': 'pending', 'note': 'Check scarf and coat against bible.'}]}}


class ChannelTests(unittest.TestCase):
    def test_legacy_untouched(self):
        validate_channel({'domain': 'science', 'sources': []})

    def test_all_science_types_and_no_mutation(self):
        for kind in SCIENCE_TYPES:
            spec = science()
            spec['channel']['content_type'] = kind
            original = copy.deepcopy(spec)
            validate_channel(spec)
            self.assertEqual(original, spec)

    def test_missing_source_metadata(self):
        for field in ['title', 'url', 'published', 'checked', 'checked_date', 'source_type', 'peer_review']:
            with self.subTest(field=field):
                spec = science()
                del spec['sources'][0][field]
                with self.assertRaises(ValueError): validate_channel(spec)

    def test_unknown_claim_source(self):
        spec = science()
        spec['channel']['claims'][0]['source_ids'] = ['missing']
        with self.assertRaises(ValueError): validate_channel(spec)

    def test_false_assurance_rejected(self):
        spec = science()
        spec['channel']['claims'][0].update(status='supported', assessment='Read source')
        with self.assertRaises(ValueError): validate_channel(spec)
        spec['sources'][0].update(checked=True, checked_date='2026-09-16', check_note='Read methods and limitations')
        validate_channel(spec)

    def test_bad_dates(self):
        for field in ['published', 'checked_date']:
            spec = science()
            spec['sources'][0].update(checked=True, checked_date='2026-09-16', check_note='Inspected')
            spec['sources'][0][field] = '2026-02-30'
            with self.assertRaises(ValueError): validate_channel(spec)

    def test_story_fiction_and_composite(self):
        for truth in ['fiction', 'composite']:
            spec = story()
            spec['channel']['truth_status'] = truth
            validate_channel(spec)

    def test_real_story_requires_evidence(self):
        for truth in ['documented', 'factual']:
            spec = story()
            spec['channel']['truth_status'] = truth
            with self.assertRaises(ValueError): validate_channel(spec)
            evidence = science()
            spec['sources'] = evidence['sources']
            spec['channel']['claims'] = evidence['channel']['claims']
            validate_channel(spec)

    def test_continuity_reference_and_coverage(self):
        for field, value in [('scene_id', 'missing'), ('character_ids', ['unknown'])]:
            spec = story()
            spec['channel']['continuity_checks'][0][field] = value
            with self.assertRaises(ValueError): validate_channel(spec)
        spec = story()
        spec['scenes'].append({'id': 'ending'})
        with self.assertRaises(ValueError): validate_channel(spec)

    def test_duplicate_ids(self):
        spec = science()
        spec['sources'].append(copy.deepcopy(spec['sources'][0]))
        with self.assertRaises(ValueError): validate_channel(spec)

    def test_wrong_channel_domain(self):
        spec = science()
        spec['domain'] = 'story'
        with self.assertRaises(ValueError): validate_channel(spec)


if __name__ == '__main__':
    unittest.main()
