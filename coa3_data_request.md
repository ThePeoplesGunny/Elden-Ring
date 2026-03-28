# COA 3 Data Request — Per-Type Boss Defense Values

**From:** Technical Authority (Claude Code)
**To:** Operational Authority (Chat) via Command (Gunny)
**Purpose:** Replace single scalar `df` values in ENG_DATA.bosses with per-damage-type defense values
**Priority:** Next engine improvement after v3.3 damage formula fix
**Claim tag:** All values must be ENGINE-VERIFIED from datamined sources, not estimated

---

## What I Need

For each of the 173 bosses listed below, I need **5 defense values per phase**:

```json
{
  "n": "Margit, the Fell Omen",
  "phaseIndex": 0,
  "defense": {
    "physical": 103,
    "magic": 95,
    "fire": 88,
    "lightning": 103,
    "holy": 103
  }
}
```

The fields map to the game's NpcParam table:
- `physical` → `defensePhy` (covers standard, slash, strike, pierce — we use one physical value for now)
- `magic` → `defenseMag`
- `fire` → `defenseFir`
- `lightning` → `defenseThun`
- `holy` → `defenseDar` (called "dark" in the param table, represents holy in Elden Ring)

---

## Authoritative Data Sources (in order of preference)

1. **tclark.io** — Datamined regulation data. Has NpcParam tables. Most reliable.
2. **Smithbox param viewer** — Reads regulation.bin directly. Same source data as tclark.io.
3. **The Elden Ring Object Data spreadsheet** (Google Sheets, community maintained) — Has NpcParam extracts.
4. **Fextralife boss pages** — Sometimes list individual defense values per damage type. Cross-reference only, not primary source.

---

## Delivery Format

A single JSON file named `boss_defense_per_type.json` with this structure:

```json
[
  {
    "index": 0,
    "name": "Soldier of Godrick",
    "phases": [
      { "physical": 100, "magic": 100, "fire": 100, "lightning": 100, "holy": 100 }
    ]
  },
  {
    "index": 22,
    "name": "Margit, the Fell Omen",
    "phases": [
      { "physical": 103, "magic": 95, "fire": 88, "lightning": 103, "holy": 103 }
    ]
  },
  {
    "index": 158,
    "name": "Malenia, Blade of Miquella",
    "phases": [
      { "physical": 123, "magic": 120, "fire": 118, "lightning": 123, "holy": 123 },
      { "physical": 123.2, "magic": 120.2, "fire": 118.2, "lightning": 123.2, "holy": 123.2 }
    ]
  }
]
```

**Rules:**
- `index` must match the boss index in the manifest below exactly
- `name` must match the `n` field in ENG_DATA.bosses exactly (spelling, capitalization, punctuation)
- Multi-phase bosses need one defense object per phase, in phase order
- If a boss's per-type defense data cannot be found in a datamined source, set all 5 values to the current scalar `df` value and add a `"verified": false` flag. I will use the scalar as fallback — a wrong per-type guess is worse than a known-flat approximation.
- Do NOT estimate, interpolate, or infer values from similar bosses. Datamined or flagged unverified.

---

## Complete Boss Manifest (173 bosses)

Index | Name | Phases | Current df
------|------|--------|----------
0 | Soldier of Godrick | 1 | 100
1 | Mad Pumpkin Head | 1 | 101
2 | Beastman of Farum Azula | 1 | 101
3 | Black Knife Assassin (Limgrave) | 1 | 101
4 | Grave Warden Duelist (Limgrave) | 1 | 101
5 | Erdtree Burial Watchdog (Stormfoot Catacombs) | 1 | 101
6 | Demi-Human Chief Duo | 2 | 101, 101.3
7 | Stonedigger Troll (Limgrave) | 1 | 101
8 | Guardian Golem | 1 | 101
9 | Cemetery Shade (Limgrave) | 1 | 102
10 | Scaly Misbegotten | 1 | 102
11 | Erdtree Burial Watchdog (Impaler's Catacombs) | 1 | 102
12 | Miranda the Blighted Bloom (Limgrave) | 1 | 102
13 | Runebear | 1 | 102
14 | Bloodhound Knight Darriwil | 1 | 103
15 | Leonine Misbegotten | 1 | 103
16 | Crucible Knight (Limgrave) | 1 | 103
17 | Night's Cavalry (Agheel Lake North) | 1 | 103
18 | Bell Bearing Hunter (Limgrave) | 1 | 103
19 | Tree Sentinel | 1 | 103
20 | Tibia Mariner (Limgrave) | 1 | 103
21 | Deathbird (Warmaster's Shack) | 1 | 103
22 | Margit, the Fell Omen | 1 | 103
23 | Night's Cavalry (Weeping Penisula) | 1 | 105
24 | Ancient Hero of Zamor (Limgrave) | 1 | 105
25 | Erdtree Avatar (Limgrave) | 1 | 105
26 | Deathbird (Weeping Penisula) | 1 | 105
27 | Godrick the Grafted | 1 | 105
28 | Flying Dragon Agheel | 1 | 106
29 | Dragonkin Soldier of Nokstella | 1 | 106
30 | Cemetery Shade (Liurnia) | 1 | 107
31 | Crystalian (Raya Lucaria Crystal Tunnel) | 1 | 107
32 | Spiritcaller Snail (Liurnia) | 1 | 107
33 | Cleanrot Knight | 1 | 107
34 | Bloodhound Knight | 1 | 107
35 | Royal Revenant | 1 | 107
36 | Crystalian Duo (Liurnia) | 2 | 107, 107.9
37 | Black Knife Assassin (Liurnia) | 1 | 107
38 | Red Wolf of Radagon | 1 | 107
39 | Erdtree Burial Watchdog (Liurnia) | 1 | 107
40 | Grafted Scion | 1 | 107
41 | Royal Knight Loretta | 1 | 107
42 | Ancestor Spirit | 1 | 107
43 | Ulcerated Tree Spirit (Limgrave) | 1 | 107
44 | Cemetery Shade (Caelid) | 1 | 109
45 | Nox Swordstress and Nox Priest | 2 | 109, 109.3
46 | Cleanrot Knight Duo | 2 | 109, 109.3
47 | Mad Pumpkin Head Duo | 2 | 109, 109.3
48 | Frenzied Duelist | 1 | 109
49 | Fallingstar Beast (Caelid) | 1 | 109
50 | Putrid Crystalian Trio | 3 | 109, 109.3
51 | Erdtree Burial Watchdog Duo | 2 | 109, 109.3
52 | Magma Wyrm (Caelid) | 1 | 109
53 | Magma Wyrm Makar | 1 | 109
54 | Rennala, Queen of the Full Moon | 2 | 109, 109.3
55 | Omenkiller (Liurnia) | 1 | 110
56 | Sanguine Noble | 1 | 110
57 | Crystalian Duo (Altus Plateau) | 2 | 110, 110.6
58 | Black Knife Assassin (Sage's Cave) | 1 | 110
59 | Onyx Lord (Liurnia) | 1 | 110
60 | Perfumer Tricia and Misbegotten Warrior | 2 | 110, 110.6
61 | Night's Cavalry (Gate Town Bridge) | 1 | 110
62 | Night's Cavalry (Bellum Church) | 1 | 110
63 | Stonedigger Troll (Altus Plateau) | 1 | 110
64 | Demi-Human Queen Gilika | 1 | 110
65 | Ancient Hero of Zamor (Altus Plateau) | 1 | 110
66 | Misbegotten Warrior and Crucible Knight | 2 | 110, 110.6
67 | Bell Bearing Hunter (Liurnia) | 1 | 110
68 | Glintstone Dragon Adula (Ranni's Rise) | 1 | 110
69 | Erdtree Avatar (Mausoleum Compound) | 1 | 110
70 | Erdtree Avatar (Revenger's Shack) | 1 | 110
71 | Bols, Carian Knight | 1 | 110
72 | Tibia Mariner (Liurnia) | 1 | 110
73 | Deathbird (Liurnia) | 1 | 110
74 | Omenkiller and Miranda the Blighted Bloom | 2 | 110, 110.6
75 | Death Rite Bird (Liurnia) | 1 | 110
76 | Abductor Virgin Duo | 2 | 110, 110.6
77 | Kindred of Rot Duo | 2 | 111, 111.9
78 | Battlemage Hugues | 1 | 111
79 | Onyx Lord (Altus Plateau) | 1 | 111
80 | Grave Warden Duelist | 1 | 111
81 | Red Wolf of the Champion | 1 | 111
82 | Night's Cavalry (Southern Aeonia Swamp Bank) | 1 | 111
83 | Erdtree Burial Watchdog (Altus Plateau) | 1 | 111
84 | Demi-Human Queen Margot | 1 | 111
85 | Elemer of the Briar | 1 | 111
86 | Crucible Knight and Crucible Knight Ordovis | 2 | 111, 111.9
87 | Putrid Avatar (Smoldering Church) | 1 | 111
88 | Regal Ancestor Spirit | 1 | 111
89 | Death Rite Bird (Caelid) | 1 | 111
90 | Commander O'Neil | 1 | 111
91 | Valiant Gargoyle Duo | 2 | 111, 111.9
92 | Black Knife Assassin (Sainted Hero's Grave) | 1 | 113
93 | Night's Cavalry (Altus Plateau) | 1 | 113
94 | Wormface | 1 | 113
95 | Glintstone Dragon Smarag | 1 | 113
96 | Fallingstar Beast (Altus Plateau) | 1 | 113
97 | Godskin Apostle (Altus Plateau) | 1 | 113
98 | Starscourge Radahn | 1 | 113
99 | Tree Sentinel Duo | 2 | 113, 113.3
100 | Godefroy the Grafted | 1 | 113
101 | Demi-Human Queen Maggie | 1 | 114
102 | Dragonkin Soldier (Siofra River) | 1 | 114
103 | Bell Bearing Hunter (Altus Plateau) | 1 | 114
104 | Godfrey, First Elden Lord (Leyndell, Royal Capital) | 1 | 114
105 | Tibia Mariner (Altus Plateau) | 1 | 114
106 | Draconic Tree Sentinel | 1 | 114
107 | Deathbird (Altus Plateau) | 1 | 114
108 | Godskin Noble (Mt. Gelmir) | 1 | 114
109 | Morgott, the Omen King | 1 | 114
110 | Astel, Naturalborn of the Void | 1 | 114
111 | Ulcerated Tree Spirit (Mt. Gelmir) | 1 | 114
112 | Magma Wyrm (Mt. Gelmir) | 1 | 114
113 | Lichdragon Fortissax | 1 | 114
114 | Full-Grown Fallingstar Beast | 1 | 114
115 | Decaying Ekzykes | 1 | 114
116 | Ancient Hero of Zamor (Mountaintops of the Giants) | 1 | 115
117 | Fell Twin Duo | 2 | 115, 115.9
118 | Black Blade Kindred (Forbidden Lands) | 1 | 115
119 | Ancient Dragon Lansseax (Abandoned Coffin) | 1 | 115
120 | Ancient Dragon Lansseax (Rampartside Path) | 1 | 115
121 | Ulcerated Tree Spirit (Mountaintops of the Giants) | 1 | 115
122 | Godskin Apostle, Godskin Noble, and Spiritcaller Snail | 3 | 115, 115.9
123 | God-Devouring Serpent | 2 | 115, 115.9
124 | Crucible Knight Siluria | 1 | 117
125 | Dragonkin Soldier (Lake of Rot) | 1 | 117
126 | Mohg, the Omen | 1 | 117
127 | Commander Niall | 1 | 117
128 | Night's Cavalry (Forbidden Lands) | 1 | 118
129 | Erdtree Avatar (Snowvalley Ruins Overlook) | 1 | 118
130 | Death Rite Bird (Snow Valley Ruins Overlook) | 1 | 118
131 | Godskin Duo | 2 | 118, 118.6
132 | Fire Giant | 1 | 118
133 | Misbegotten Crusader | 1 | 120
134 | Beastman of Farum Azula Duo | 2 | 120, 120
135 | Alecto, Black Knife Ringleader | 1 | 120
136 | Putrid Grave Warden Duelist | 1 | 120
137 | Beast Clergyman | 2 | 120, 120
138 | Borealis the Freezing Fog | 1 | 120
139 | Godskin Apostle (Caelid) | 1 | 120
140 | Putrid Tree Spirit | 1 | 120
141 | Astel, Stars of Darkness | 1 | 120
142 | Sir Gideon Ofnir, the All-Knowing | 1 | 120
143 | Godfrey, First Elden Lord (Leyndell, Ashen Capital) | 2 | 120, 120
144 | Night's Cavalry (Lenne's Rise) | 1 | 121
145 | Bell Bearing Hunter (Caelid) | 1 | 121
146 | Flying Dragon Greyll | 1 | 121
147 | Glintstone Dragon Adula (Village of the Albinaurics) | 1 | 121
148 | Black Blade Kindred (Caelid) | 1 | 121
149 | Putrid Avatar (Dragonbarrow Fork) | 1 | 121
150 | Dragonlord Placidusax | 1 | 121
151 | Radagon of the Golden Order | 2 | 121, 121.7
152 | Putrid Avatar (Ordina, Liturgical Town) | 1 | 122
153 | Loretta, Knight of the Haligtree | 1 | 122
154 | Night's Cavalry Duo | 2 | 122, 122
155 | Death Rite Bird (Apostate Derelict) | 1 | 122
156 | Mohg, Lord of Blood | 1 | 122
157 | Great Wyrm Theodorix | 1 | 122
158 | Malenia, Blade of Miquella | 2 | 123, 123.2
159 | Divine Beast Dancing Lion | 1 | 115
160 | Rellana, Twin Moon Knight | 1 | 118
161 | Messmer the Impaler | 2 | 120, 118
162 | Romina, Saint of the Bud | 1 | 118
163 | Midra, Lord of Frenzied Flame | 1 | 112
164 | Bayle the Dread | 2 | 125, 125
165 | Metyr, Mother of Fingers | 1 | 120
166 | Scadutree Avatar | 3 | 115, 115
167 | Gaius, the Commander | 1 | 120
168 | Putrescent Knight | 1 | 115
169 | Promised Consort Radahn | 2 | 125, 128
170 | Commander Gaius | 1 | 115
171 | Death Knight (Scorched Ruins) | 1 | 112
172 | Rugalea the Great Red Bear | 1 | 118

---

## Validation Plan

Once delivered, I will spot-check against:
1. Known community damage test videos (exact weapon + stats + boss = expected damage)
2. Fextralife per-boss defense tables where available
3. Internal consistency (bosses of the same type should have similar defense profiles)

If per-type values produce results within ±5% of observed community damage numbers, the data is accepted.

---

## What NOT to do

- Do NOT estimate from boss appearance or lore
- Do NOT interpolate from similar bosses
- Do NOT use the existing scalar `df` as the physical defense and guess the rest
- Do NOT include DLC bosses (159-172) if the datamined source doesn't cover DLC regulation — flag them as unverified instead
- If a source provides defense values in a different scale or format, document the conversion
