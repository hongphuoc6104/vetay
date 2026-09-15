"""Optional channel preparation contract; validates metadata, never truth itself."""
from datetime import date
from urllib.parse import urlparse

SCIENCE_TYPES = ('explain', 'tutorial', 'news', 'paper-review', 'scientific-writing')
TRUTH_STATUSES = ('fiction', 'composite', 'documented', 'factual')
SOURCE_TYPES = ('paper', 'preprint', 'official', 'book', 'news', 'other')


def require(condition, message):
    if not condition:
        raise ValueError('Channel preparation: ' + message)


def text(value):
    return isinstance(value, str) and bool(value.strip())


def iso_date(value):
    if not isinstance(value, str):
        return False
    try:
        return date.fromisoformat(value).isoformat() == value
    except ValueError:
        return False


def records(value, label, nonempty=True):
    require(isinstance(value, list), label + ' must be a list')
    require(not nonempty or bool(value), label + ' must not be empty')
    require(all(isinstance(x, dict) for x in value), label + ' must contain objects')
    return value


def unique_ids(rows, label):
    require(all(text(x.get('id')) for x in rows), label + ' need IDs')
    ids = [x['id'] for x in rows]
    require(len(set(ids)) == len(ids), label + ' have duplicate IDs')
    return set(ids)


def validate_evidence(spec, channel):
    sources = records(spec.get('sources'), 'sources')
    source_ids = unique_ids(sources, 'sources')
    for source in sources:
        require(text(source.get('url')), 'source needs URL')
        url = urlparse(source['url'])
        require(url.scheme in {'http', 'https'} and bool(url.netloc), 'source URL must be HTTP(S)')
        require(text(source.get('title')), 'source needs title')
        require(source.get('source_type') in SOURCE_TYPES, 'invalid source_type')
        require(source.get('peer_review') in ('yes', 'no', 'unknown'), 'peer_review must be yes/no/unknown')
        require('published' in source, 'source needs published date or explicit null')
        require(iso_date(source['published']) or (source['published'] is None and text(source.get('published_note'))), 'published needs ISO date or null with published_note')
        require(type(source.get('checked')) is bool, 'checked must be boolean')
        require('checked_date' in source, 'source needs checked_date')
        if source['checked']:
            require(iso_date(source['checked_date']), 'checked source needs checked_date')
            require(text(source.get('check_note')), 'checked source needs check_note describing actual inspection')
        else:
            require(source['checked_date'] is None, 'unchecked source must have null checked_date')
    claims = records(channel.get('claims'), 'claims')
    unique_ids(claims, 'claims')
    for claim in claims:
        require(text(claim.get('text')), 'claim needs text')
        refs = claim.get('source_ids')
        require(isinstance(refs, list) and bool(refs) and all(text(x) and x in source_ids for x in refs), 'claim needs known source_ids')
        require(claim.get('status') in ('unverified', 'supported', 'disputed'), 'claim status must be unverified/supported/disputed')
        if claim['status'] != 'unverified':
            require(text(claim.get('assessment')), 'assessed claim needs assessment')
            require(all(x['checked'] for x in sources if x['id'] in refs), 'assessed claim references unchecked source')


def validate_channel(spec):
    """Raise ValueError on malformed opt-in metadata; legacy specs are accepted.

    This is structural validation, not a fact check or editorial approval.
    """
    if 'channel' not in spec:
        return
    channel = spec['channel']
    require(isinstance(channel, dict), 'channel must be an object')
    kind = channel.get('kind')
    require(kind in ('science', 'storytelling'), 'kind must be science/storytelling')
    require(spec.get('domain') == ('science' if kind == 'science' else 'story'), 'channel kind differs from domain')
    if kind == 'science':
        require(channel.get('content_type') in SCIENCE_TYPES, 'invalid science content_type')
        validate_evidence(spec, channel)
        return
    require(channel.get('truth_status') in TRUTH_STATUSES, 'invalid truth_status')
    require(text(channel.get('truth_disclosure')), 'story needs audience-facing truth_disclosure')
    bible = records(channel.get('character_bible'), 'character_bible', nonempty=False)
    ids = unique_ids(bible, 'character_bible')
    for character in bible:
        require(all(text(character.get(k)) for k in ['name', 'appearance', 'voice', 'invariants']), 'character needs name/appearance/voice/invariants')
    checks = records(channel.get('continuity_checks'), 'continuity_checks')
    scene_ids = {x['id'] for x in spec.get('scenes', []) if isinstance(x, dict) and text(x.get('id'))}
    for check in checks:
        require(text(check.get('scene_id')) and check['scene_id'] in scene_ids, 'continuity check needs known scene_id')
        refs = check.get('character_ids')
        require(isinstance(refs, list) and all(text(x) and x in ids for x in refs), 'continuity check has unknown character_ids')
        require(text(check.get('note')), 'continuity check needs note')
        require(check.get('status') in ('pending', 'pass', 'fail'), 'invalid continuity status')
    require({x['scene_id'] for x in checks} == scene_ids, 'continuity checks must cover every scene')
    if channel['truth_status'] in {'documented', 'factual'}:
        validate_evidence(spec, channel)
