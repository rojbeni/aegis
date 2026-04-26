import re


def is_likely_regex(pattern):
    metacharacters = r"()[]{}*+?|^$\."
    if is_valid_regex(pattern):
        return any(char in metacharacters for char in pattern)
    return False


def is_valid_regex(pattern):
    try:
        re.compile(pattern)
        return True
    except re.error:
        return False
