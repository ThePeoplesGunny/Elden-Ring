"""
v3.15 data-block patch: replace ENG_DATA.derivedStats lookup tables with
Fextralife authoritative values. All 4 tables in one pass to minimize
file writes. Verified against Gunny's in-game reads at Fort Faroth
(2026-04-19): HP at VIG 10/25/40, FP at MND 10/25/40, EquipLoad at
END 10/20/30, Discovery at ARC 10/20.
"""
import re
import json

# ============================================================
# FEXTRALIFE AUTHORITATIVE TABLES (verbatim from wiki, 2026-04-19)
# ============================================================

HP = {
    1:300, 2:304, 3:312, 4:322, 5:334, 6:347, 7:362, 8:378, 9:396, 10:414,
    11:434, 12:455, 13:476, 14:499, 15:522, 16:547, 17:572, 18:598, 19:624, 20:652,
    21:680, 22:709, 23:738, 24:769, 25:800, 26:833, 27:870, 28:910, 29:951, 30:994,
    31:1037, 32:1081, 33:1125, 34:1170, 35:1216, 36:1262, 37:1308, 38:1355, 39:1402, 40:1450,
    41:1476, 42:1503, 43:1529, 44:1555, 45:1581, 46:1606, 47:1631, 48:1656, 49:1680, 50:1704,
    51:1727, 52:1750, 53:1772, 54:1793, 55:1814, 56:1834, 57:1853, 58:1871, 59:1887, 60:1900,
    61:1906, 62:1912, 63:1918, 64:1924, 65:1930, 66:1936, 67:1942, 68:1948, 69:1954, 70:1959,
    71:1965, 72:1971, 73:1977, 74:1982, 75:1988, 76:1993, 77:1999, 78:2004, 79:2010, 80:2015,
    81:2020, 82:2026, 83:2031, 84:2036, 85:2041, 86:2046, 87:2051, 88:2056, 89:2060, 90:2065,
    91:2070, 92:2074, 93:2078, 94:2082, 95:2086, 96:2090, 97:2094, 98:2097, 99:2100,
}

FP = {
    1:40, 2:43, 3:46, 4:49, 5:52, 6:55, 7:58, 8:62, 9:75, 10:78,
    11:82, 12:85, 13:88, 14:91, 15:95, 16:100, 17:105, 18:110, 19:116, 20:121,
    21:126, 22:131, 23:137, 24:142, 25:147, 26:152, 27:158, 28:163, 29:168, 30:173,
    31:179, 32:184, 33:189, 34:194, 35:200, 36:207, 37:214, 38:221, 39:228, 40:235,
    41:242, 42:248, 43:255, 44:262, 45:268, 46:275, 47:281, 48:287, 49:293, 50:300,
    51:305, 52:311, 53:317, 54:322, 55:328, 56:333, 57:338, 58:342, 59:346, 60:350,
    61:352, 62:355, 63:357, 64:360, 65:362, 66:365, 67:367, 68:370, 69:373, 70:375,
    71:378, 72:380, 73:383, 74:385, 75:388, 76:391, 77:393, 78:396, 79:398, 80:401,
    81:403, 82:406, 83:408, 84:411, 85:414, 86:416, 87:419, 88:421, 89:424, 90:426,
    91:429, 92:432, 93:434, 94:437, 95:439, 96:442, 97:444, 98:447, 99:450,
}

EQUIP = {
    # END 1-8: flat 45.0
    1:45.0, 2:45.0, 3:45.0, 4:45.0, 5:45.0, 6:45.0, 7:45.0, 8:45.0, 9:46.6, 10:48.2,
    11:49.8, 12:51.4, 13:52.9, 14:54.5, 15:56.1, 16:57.7, 17:59.3, 18:60.9, 19:62.5, 20:64.1,
    21:65.6, 22:67.2, 23:68.8, 24:70.4, 25:72.0, 26:73.0, 27:74.1, 28:75.2, 29:76.4, 30:77.6,
    31:78.9, 32:80.2, 33:81.5, 34:82.8, 35:84.1, 36:85.4, 37:86.8, 38:88.1, 39:89.5, 40:90.9,
    41:92.3, 42:93.7, 43:95.1, 44:96.5, 45:97.9, 46:99.4, 47:100.8, 48:102.2, 49:103.7, 50:105.2,
    51:106.6, 52:108.1, 53:109.6, 54:111.0, 55:112.5, 56:114.0, 57:115.5, 58:117.0, 59:118.5, 60:120.0,
    61:121.0, 62:122.1, 63:123.1, 64:124.1, 65:125.1, 66:126.2, 67:127.2, 68:128.2, 69:129.2, 70:130.3,
    71:131.3, 72:132.3, 73:133.3, 74:134.4, 75:135.4, 76:136.4, 77:137.4, 78:138.5, 79:139.5, 80:140.5,
    81:141.5, 82:142.6, 83:143.6, 84:144.6, 85:145.6, 86:146.7, 87:147.7, 88:148.7, 89:149.7, 90:150.8,
    91:151.8, 92:152.8, 93:153.8, 94:154.9, 95:155.9, 96:156.9, 97:157.9, 98:159.0, 99:160.0,
}

# Discovery: Base 100 + ARC level (linear, confirmed by Gunny's in-game reads)
DISCOVERY = {arc: 100 + arc for arc in range(1, 100)}


def build_json_values(d):
    """Build compact JSON matching existing engine format: {"1":V,"2":V,...}"""
    parts = []
    for k in sorted(d.keys()):
        v = d[k]
        if isinstance(v, float):
            # preserve 1-decimal for equip load
            if v == int(v):
                s = f'{v:.1f}'
            else:
                s = f'{v:.1f}'
        else:
            s = str(v)
        parts.append(f'"{k}":{s}')
    return '{' + ','.join(parts) + '}'


FILE = r'C:\Users\miken\OneDrive\Desktop\claude stuff\Elden Ring\Tarnished_Companion_v3.9.html'

with open(FILE, 'r', encoding='utf-8') as f:
    html = f.read()

orig_len = len(html)
replacements = 0

# Each table: match "<key>":{"values":{...}} and replace the inner values object
# Use non-greedy match within the values object - it's a flat dict of "N":V pairs
for key, table, label in [
    ('hp', HP, 'B18 HP'),
    ('fp', FP, 'B14 FP'),
    ('equipLoad', EQUIP, 'B15 EquipLoad'),
    ('discovery', DISCOVERY, 'B19 Discovery'),
]:
    new_values = build_json_values(table)
    # Match: "<key>":{"source":"...","softCaps":[...],"values":{...}}
    # Capture prefix up to "values":, then match and replace just the values object
    pattern = re.compile(
        r'("' + key + r'":\{"source":"[^"]*","softCaps":\[[^\]]*\],"values":)\{[^}]*\}'
    )
    m = pattern.search(html)
    if not m:
        print(f'{label}: pattern NOT FOUND for key "{key}"')
        continue
    prefix = m.group(1)
    new_block = prefix + new_values
    html = html[:m.start()] + new_block + html[m.end():]
    replacements += 1
    print(f'{label}: replaced ({len(m.group(0))} bytes -> {len(new_block)} bytes)')

with open(FILE, 'w', encoding='utf-8') as f:
    f.write(html)

print(f'\nTotal replacements: {replacements}/4')
print(f'File size: {orig_len} -> {len(html)} (delta {len(html)-orig_len:+d})')
