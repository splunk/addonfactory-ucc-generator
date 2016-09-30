"""
This module provides a replacement of the open-source library `chardet`
"""

guess = ['ascii', 'utf-8', 'latin1']


def detect(content):
    for encoding in guess:
        try:
            content.decode(encoding)
            return dict(encoding=encoding, confidence=1)
        except UnicodeDecodeError:
            pass
    # failed, use utf-8 as a fallback
    return dict(encoding='utf-8', confidence=0)