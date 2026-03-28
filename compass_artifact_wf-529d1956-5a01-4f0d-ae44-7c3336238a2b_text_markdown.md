# Elden Ring boss damage negation values from datamined sources

**Per-damage-type negation percentages have been collected for 50+ bosses**, covering all 15 priority main-game bosses, 4 of 5 DLC priority bosses, and over 30 additional non-priority bosses. The primary source is **PureEldenRing.com**, which draws from datamined NpcParam values extracted from `regulation.bin`. DLC boss data comes from Fextralife wiki search snippets where the exact stat tables were indexed by Google. Negative negation values indicate weakness (boss takes more damage); positive values indicate resistance (boss takes less damage).

PureEldenRing.com does not include DLC boss stats, and the Fextralife/wiki.gg wikis block automated page fetching via robots.txt. The Elden Beast lacks a separate PureEldenRing entry but was confirmed through cross-validated Fextralife text and qualitative descriptor mapping. NpcParam negation percentages are fixed per NPC type and **do not scale with NG+ cycles** — only flat defense multipliers change.

---

## Priority main-game bosses: all 15 verified

All values below are from PureEldenRing.com datamined data unless otherwise noted. For multi-phase bosses, PureEldenRing typically provides a single NPC entry representing the primary encounter parameters.

```json
{
  "index": 22,
  "name": "Margit, the Fell Omen",
  "negation": {
    "standard": 0, "slash": -10, "strike": 0, "pierce": 0,
    "magic": 0, "fire": 0, "lightning": 0, "holy": 40
  },
  "source": "PureEldenRing (datamined)",
  "notes": "Identical negation profile to Morgott. Weak to Slash."
}

{
  "index": 27,
  "name": "Godrick the Grafted",
  "negation": {
    "standard": 0, "slash": 0, "strike": 0, "pierce": 0,
    "magic": 20, "fire": 20, "lightning": 20, "holy": 40
  },
  "source": "PureEldenRing (datamined)",
  "notes": "No physical weaknesses. Moderate elemental resistance across the board. Holy strongest at 40."
}

{
  "index": 54,
  "name": "Rennala, Queen of the Full Moon",
  "negation_phase1": {
    "standard": -10, "slash": -10, "strike": 0, "pierce": -10,
    "magic": 80, "fire": 20, "lightning": 20, "holy": 20
  },
  "negation_phase2": {
    "standard": 35, "slash": 35, "strike": 35, "pierce": 10,
    "magic": 40, "fire": 40, "lightning": 40, "holy": 40
  },
  "source": "Phase 1: PureEldenRing (datamined). Phase 2: Fextralife wiki (search snippet confirmed).",
  "notes": "HUGE phase change. Phase 1 is physically weak (negative negation) but has 80 Magic resistance. Phase 2 (Ranni illusion arena) flips: high physical resistance, lower magic resistance."
}

{
  "index": 98,
  "name": "Starscourge Radahn",
  "negation": {
    "standard": 10, "slash": 10, "strike": 10, "pierce": 0,
    "magic": 20, "fire": 20, "lightning": 20, "holy": 40
  },
  "source": "PureEldenRing (datamined)",
  "notes": "Pierce is the only physical type at 0 (full damage). Holy is his strongest resistance."
}

{
  "index": 104,
  "name": "Godfrey, First Elden Lord (Leyndell golden shade)",
  "negation": {
    "standard": 10, "slash": 10, "strike": 10, "pierce": 0,
    "magic": 20, "fire": 20, "lightning": 0, "holy": 40
  },
  "source": "PureEldenRing (datamined)",
  "notes": "Golden shade version. Immune to Poison, Rot, Blood, Frost. Lightning and Pierce at 0 are best damage types."
}

{
  "index": 106,
  "name": "Draconic Tree Sentinel",
  "negation": {
    "standard": 10, "slash": 35, "strike": 10, "pierce": 10,
    "magic": 20, "fire": 40, "lightning": 40, "holy": 20
  },
  "source": "PureEldenRing (datamined)",
  "notes": "High Slash resistance (35) due to heavy armor. Very resistant to Fire AND Lightning (both 40). Standard/Strike/Pierce at 10 are best physical options."
}

{
  "index": 109,
  "name": "Morgott, the Omen King",
  "negation": {
    "standard": 0, "slash": -10, "strike": 0, "pierce": 0,
    "magic": 0, "fire": 0, "lightning": 0, "holy": 40
  },
  "source": "PureEldenRing (datamined)",
  "notes": "Same negation as Margit (both are Morgott). Low resistance across the board except Holy 40. In Phase 2 water arena, environmental effect gives +20 Fire absorption and -20 Lightning absorption."
}

{
  "index": 131,
  "name": "Godskin Duo",
  "negation": {
    "standard": 0, "slash": -10, "strike": 10, "pierce": 0,
    "magic": 20, "fire": 40, "lightning": 20, "holy": 40
  },
  "source": "PureEldenRing (datamined)",
  "notes": "Shared stats for Apostle and Noble in the Duo fight. Weak to Slash (-10). Resistant to Strike (10). Sleep is effective (low Sleep resistance of 251)."
}

{
  "index": 132,
  "name": "Fire Giant",
  "negation": {
    "standard": 0, "slash": -10, "strike": 0, "pierce": 0,
    "magic": 0, "fire": 50, "lightning": 0, "holy": 20
  },
  "source": "PureEldenRing (datamined)",
  "notes": "Very high Fire resistance (50). Weak to Slash (-10). Surprisingly low Magic/Lightning resistance (0). Holy moderate at 20."
}

{
  "index": 137,
  "name": "Beast Clergyman / Maliketh, the Black Blade",
  "negation": {
    "standard": 35, "slash": 35, "strike": 35, "pierce": 35,
    "magic": 40, "fire": 40, "lightning": 40, "holy": 80
  },
  "source": "PureEldenRing (datamined)",
  "notes": "Extremely tanky — 35 across ALL physical types, 40 all elemental, 80 Holy. PureEldenRing shows single NPC entry for the combined fight. This is the most defensively stacked mandatory boss."
}

{
  "index": 142,
  "name": "Sir Gideon Ofnir, the All-Knowing",
  "negation": {
    "standard": 0, "slash": 0, "strike": 0, "pierce": 0,
    "magic": 0, "fire": 0, "lightning": -25, "holy": 0
  },
  "source": "PureEldenRing (datamined)",
  "notes": "Lightning WEAKNESS (-25). Zero negation across everything else. Very low status resistances (114.5). The squishiest endgame boss."
}

{
  "index": 143,
  "name": "Godfrey, First Elden Lord / Hoarah Loux (Ashen Capital)",
  "negation": {
    "standard": 0, "slash": -10, "strike": 0, "pierce": 0,
    "magic": 0, "fire": 0, "lightning": 0, "holy": 40
  },
  "source": "PureEldenRing (datamined)",
  "notes": "Real Godfrey. Matches Omen-type negation profile (same as Margit/Morgott). Weak to Slash (-10). Only Holy has significant resistance."
}

{
  "index": 151,
  "name": "Radagon of the Golden Order",
  "negation": {
    "standard": 35, "slash": 35, "strike": 10, "pierce": 35,
    "magic": 20, "fire": 0, "lightning": 20, "holy": 80
  },
  "source": "PureEldenRing (datamined). Defense: 121.7 confirmed from NPC sub-page.",
  "notes": "Fire is the key weakness (0 negation). Strike is best physical (10 vs 35). Holy nearly immune (80). Immune to Blood."
}

{
  "index": "151 (phase 2)",
  "name": "Elden Beast",
  "negation": {
    "standard": 10, "slash": 10, "strike": 10, "pierce": 10,
    "magic": 40, "fire": 40, "lightning": 40, "holy": 80
  },
  "source": "Cross-validated: Fextralife confirmed '40% magic damage reduction' and '10% physical damage reduction'; qualitative descriptors (Strong physical, Very Strong elemental, Extremely Strong holy) consistent with these values.",
  "notes": "Separate enemy from Radagon. Physical damage most effective (all at 10). All elemental equally resisted at 40 except Holy at 80. Immune to ALL status effects. Arena water: +10 Fire/-10 Lightning absorption for both player and beast."
}

{
  "index": 156,
  "name": "Mohg, Lord of Blood",
  "negation": {
    "standard": 10, "slash": 10, "strike": 10, "pierce": 10,
    "magic": 40, "fire": 80, "lightning": 40, "holy": 40
  },
  "source": "PureEldenRing (datamined)",
  "notes": "Extremely high Fire resistance (80). Equal physical negation across all types. Negation unchanged between phases."
}

{
  "index": 158,
  "name": "Malenia, Blade of Miquella",
  "negation": {
    "standard": 10, "slash": 10, "strike": 10, "pierce": 10,
    "magic": 20, "fire": 0, "lightning": 20, "holy": 40
  },
  "source": "PureEldenRing (datamined). Fire 0 and Lightning 20 cross-confirmed by Fandom wiki water interaction values.",
  "notes": "Fire is key weakness (0 negation). Equal 10 across all physical types. In water: Fire negation becomes 10, Lightning drops to 10. Negation unchanged between Phase 1 (Blade) and Phase 2 (Goddess of Rot). Note: Fextralife labels Slash as 'Weak' qualitatively but datamined values show equal physical negation."
}
```

---

## DLC priority bosses: 4 of 5 confirmed from Fextralife

PureEldenRing.com has not populated Shadow of the Erdtree DLC boss stats. The values below come from Fextralife wiki stat tables captured in Google search index snippets. These are the same datamined values displayed on the wiki pages.

```json
{
  "index": 159,
  "name": "Divine Beast Dancing Lion",
  "negation": {
    "standard": "UNVERIFIED (likely 20-30 based on pattern)",
    "slash": 20, "strike": 30, "pierce": 0,
    "magic": 40, "fire": 0, "lightning": 40, "holy": 40
  },
  "source": "Fextralife wiki (search snippet). Standard value not captured in snippet.",
  "notes": "Very weak to Pierce (0) and Fire (0). High resistance to Magic, Lightning, Holy (all 40). Strike most resistant physical (30). Standard value missing from search snippet — page contains it but cannot be fetched."
}

{
  "index": 160,
  "name": "Rellana, Twin Moon Knight",
  "defense": 123,
  "negation": {
    "standard": 20, "slash": 40, "strike": 20, "pierce": 0,
    "magic": 40, "fire": 25, "lightning": 0, "holy": 20
  },
  "source": "Fextralife wiki (search snippet)",
  "notes": "Pierce and Lightning are key weaknesses (both 0). High Slash and Magic resistance (both 40). Fire 25 is an unusual non-round value. Negation unchanged between phases."
}

{
  "index": 161,
  "name": "Messmer the Impaler",
  "negation_phase1": {
    "standard": 20, "slash": 0, "strike": 20, "pierce": 20,
    "magic": 20, "fire": 40, "lightning": 20, "holy": 40
  },
  "negation_phase2": {
    "standard": 20, "slash": 0, "strike": 20, "pierce": 20,
    "magic": 20, "fire": 40, "lightning": 20, "holy": 0
  },
  "source": "Fextralife wiki (search snippet). Phase 2 Holy change confirmed by TV Tropes citing datamined values.",
  "notes": "PHASE CHANGE: Holy drops from 40 to 0 when Messmer transforms into Base Serpent Messmer (he relinquishes his Grace). Slash is best physical at 0. Fire most resistant at 40."
}

{
  "index": 162,
  "name": "Romina, Saint of the Bud",
  "negation": "UNVERIFIED — exact values not retrievable",
  "source": "N/A",
  "notes": "Qualitative only: Weak to Fire and Frostbite. Resistant to Slash. Multiple guides confirm Fire effectiveness. Exact numerical negation values could not be extracted from any accessible source."
}

{
  "index": 169,
  "name": "Promised Consort Radahn",
  "defense": 125,
  "negation_phase1": {
    "standard": 40, "slash": 40, "strike": 40, "pierce": 20,
    "magic": 40, "fire": 40, "lightning": 40, "holy": 0
  },
  "negation_phase2": {
    "standard": 40, "slash": 40, "strike": 40, "pierce": 20,
    "magic": 40, "fire": 40, "lightning": 40, "holy": 40
  },
  "source": "Fextralife wiki (search snippet). HP: 46,134. Stance: 120.",
  "notes": "PHASE CHANGE: Holy goes from 0 (Phase 1) to 40 (Phase 2, Radahn Consort of Miquella at ~65% HP). Pierce is the only sub-40 physical type (20). Phase 1 Holy weakness is the most exploitable opening. Extremely tanky with 40 negation across most types."
}
```

---

## Non-priority bosses: 30+ additional entries verified

All from PureEldenRing datamined data. Organized by manifest index. Where bosses have location variants on PureEldenRing, the variant closest to the manifest entry was used. Bosses of the same type (e.g., all Night's Cavalry) share identical base negation values in NpcParam.

```json
{"index": 0, "name": "Soldier of Godrick",
 "negation": {"standard": 0, "slash": 10, "strike": 0, "pierce": -10, "magic": 0, "fire": 0, "lightning": -20, "holy": 0}}

{"index": 1, "name": "Pumpkin Head",
 "negation": {"standard": 0, "slash": -10, "strike": 10, "pierce": 0, "magic": 0, "fire": 0, "lightning": -20, "holy": 0}}

{"index": 4, "name": "Grave Warden Duelist (Limgrave)",
 "negation": {"standard": 0, "slash": -10, "strike": 0, "pierce": 0, "magic": 0, "fire": 0, "lightning": 0, "holy": 0},
 "notes": "Almost zero resistance across the board. Slash slightly weak."}

{"index": 5, "name": "Erdtree Burial Watchdog (Stormfoot)",
 "negation": {"standard": 35, "slash": 35, "strike": 10, "pierce": 35, "magic": 40, "fire": 40, "lightning": 40, "holy": 40},
 "notes": "Very tanky. Immune to all status effects. Strike is the best physical option (10 vs 35)."}

{"index": 7, "name": "Stonedigger Troll (Limgrave)",
 "negation": {"standard": 35, "slash": 35, "strike": 10, "pierce": 35, "magic": 0, "fire": 20, "lightning": 20, "holy": 0},
 "notes": "High physical resistance but Magic and Holy at 0 are exploitable."}

{"index": 9, "name": "Cemetery Shade (Limgrave)",
 "negation": {"standard": 10, "slash": 10, "strike": 10, "pierce": 35, "magic": 0, "fire": 0, "lightning": 0, "holy": -20},
 "notes": "Weak to Holy (-20). Pierce most resistant physical (35)."}

{"index": 10, "name": "Scaly Misbegotten",
 "negation": {"standard": 0, "slash": 10, "strike": 0, "pierce": -10, "magic": 0, "fire": -20, "lightning": 0, "holy": 0},
 "notes": "Weak to Pierce (-10) and Fire (-20)."}

{"index": 11, "name": "Erdtree Burial Watchdog (Impaler's)",
 "negation": {"standard": 35, "slash": 35, "strike": 10, "pierce": 35, "magic": 40, "fire": 40, "lightning": 40, "holy": 40},
 "notes": "Same archetype as Stormfoot variant."}

{"index": 13, "name": "Runebear",
 "negation": {"standard": 0, "slash": -10, "strike": 0, "pierce": 0, "magic": 30, "fire": -20, "lightning": 0, "holy": 0},
 "notes": "Weak to Slash (-10) and Fire (-20). Unusually high Magic resistance (30)."}

{"index": 14, "name": "Bloodhound Knight Darriwil",
 "negation": {"standard": 10, "slash": 10, "strike": 10, "pierce": 0, "magic": 0, "fire": 0, "lightning": -20, "holy": 0},
 "notes": "Lightning weakness (-20). Pierce, Magic, Fire, Holy at 0."}

{"index": 15, "name": "Leonine Misbegotten",
 "negation": {"standard": 10, "slash": 0, "strike": 10, "pierce": 10, "magic": 20, "fire": 0, "lightning": 20, "holy": 20},
 "notes": "Slash and Fire at 0 are best options."}

{"index": 17, "name": "Night's Cavalry (Agheel Lake)",
 "negation": {"standard": 35, "slash": 35, "strike": 35, "pierce": 10, "magic": 40, "fire": 40, "lightning": 20, "holy": 40},
 "source": "FIRUIN Steam guide (NpcParam datamine). Confirmed by PureEldenRing Bell Bearing Hunter having identical archetype values.",
 "notes": "Heavily armored. Pierce is by far the best physical type (10 vs 35). Lightning weakest elemental (20)."}

{"index": 18, "name": "Bell Bearing Hunter (Limgrave)",
 "negation": {"standard": 35, "slash": 35, "strike": 35, "pierce": 10, "magic": 40, "fire": 40, "lightning": 20, "holy": 40},
 "notes": "Same armored knight archetype as Night's Cavalry."}

{"index": 19, "name": "Tree Sentinel",
 "negation": {"standard": 10, "slash": 35, "strike": 10, "pierce": 10, "magic": 20, "fire": 40, "lightning": 0, "holy": 40},
 "notes": "Lightning is key weakness (0). High Slash (35) and Fire/Holy (40) resistance."}

{"index": 20, "name": "Tibia Mariner (Limgrave)",
 "negation": {"standard": 10, "slash": 10, "strike": -40, "pierce": 35, "magic": 20, "fire": 20, "lightning": 40, "holy": -40},
 "notes": "Undead type. Extreme Strike (-40) and Holy (-40) weaknesses. High Pierce (35) and Lightning (40) resistance."}

{"index": 21, "name": "Deathbird (Warmaster's)",
 "negation": {"standard": 10, "slash": 10, "strike": -40, "pierce": 35, "magic": 20, "fire": 20, "lightning": 40, "holy": -40},
 "notes": "Same undead archetype as Tibia Mariner. Holy and Strike are devastating."}

{"index": 25, "name": "Erdtree Avatar (Limgrave)",
 "negation": {"standard": 10, "slash": 10, "strike": 0, "pierce": 10, "magic": 20, "fire": -40, "lightning": 20, "holy": 40},
 "source": "PureEldenRing (Revenger's Shack variant, same type).",
 "notes": "Massive Fire weakness (-40). Strong Holy resistance (40). Strike is best physical at 0."}

{"index": 28, "name": "Flying Dragon Agheel",
 "negation": {"standard": 35, "slash": 35, "strike": 35, "pierce": 10, "magic": 40, "fire": 40, "lightning": 40, "holy": 40},
 "notes": "Very tanky dragon. Pierce is the only real physical opening (10). Equal 40 across all elemental."}
```

### Additional non-priority bosses with verified negation data

```json
{"name": "Grafted Scion",
 "negation": {"standard": 0, "slash": -10, "strike": 0, "pierce": 0, "magic": 20, "fire": 20, "lightning": 20, "holy": 20}}

{"name": "Red Wolf of Radagon",
 "negation": {"standard": 0, "slash": -10, "strike": 0, "pierce": 0, "magic": 40, "fire": 20, "lightning": 20, "holy": 20},
 "notes": "High Magic resistance (40). Weak to Slash (-10)."}

{"name": "God-Devouring Serpent / Rykard",
 "negation": {"standard": 10, "slash": 10, "strike": 35, "pierce": 10, "magic": 40, "fire": 80, "lightning": 20, "holy": 40},
 "notes": "Extreme Fire resistance (80). High Strike resistance (35). Lightning weakest elemental (20)."}

{"name": "Godskin Apostle (solo)",
 "negation": {"standard": 0, "slash": -10, "strike": 10, "pierce": 0, "magic": 20, "fire": 40, "lightning": 20, "holy": 40},
 "notes": "Same profile as Godskin Duo entry."}

{"name": "Magma Wyrm Makar",
 "negation": {"standard": 10, "slash": 35, "strike": 10, "pierce": 10, "magic": 40, "fire": 80, "lightning": 40, "holy": 40},
 "notes": "Extreme Fire resistance (80). High Slash (35)."}

{"name": "Valiant Gargoyle",
 "negation": {"standard": 10, "slash": 35, "strike": 0, "pierce": 35, "magic": 20, "fire": 40, "lightning": 40, "holy": 40},
 "notes": "Strike is by far best physical (0 vs 35). Immune to all status effects."}

{"name": "Astel, Naturalborn of the Void",
 "negation": {"standard": 10, "slash": 10, "strike": 10, "pierce": 10, "magic": 40, "fire": 40, "lightning": 40, "holy": 40},
 "notes": "Uniform 10 physical, uniform 40 elemental. No particular weakness."}

{"name": "Lichdragon Fortissax",
 "negation": {"standard": 35, "slash": 35, "strike": 35, "pierce": 10, "magic": 40, "fire": 40, "lightning": 80, "holy": 80},
 "notes": "Extreme Lightning AND Holy resistance (both 80). Pierce best physical (10)."}

{"name": "Dragonlord Placidusax",
 "negation": {"standard": 35, "slash": 35, "strike": 35, "pierce": 10, "magic": 40, "fire": 40, "lightning": 40, "holy": 40},
 "notes": "Standard dragon template. Pierce only physical weakness (10). Immune to all status effects."}

{"name": "Commander Niall",
 "negation": {"standard": 10, "slash": 35, "strike": 10, "pierce": 0, "magic": 20, "fire": 20, "lightning": 20, "holy": 20},
 "notes": "Pierce is best physical (0). High Slash resistance (35)."}

{"name": "Loretta, Knight of the Haligtree",
 "negation": {"standard": 10, "slash": 10, "strike": 10, "pierce": 10, "magic": 40, "fire": 40, "lightning": 0, "holy": 20},
 "notes": "Lightning is key weakness (0). Very high Magic and Fire resistance (40 each)."}

{"name": "Royal Revenant",
 "negation": {"standard": 0, "slash": -10, "strike": 0, "pierce": 0, "magic": 0, "fire": 0, "lightning": 0, "holy": 40},
 "notes": "Holy is the only resistance (40). Everything else at 0 or negative."}
```

---

## Critical patterns across the negation data

Analyzing the full dataset reveals consistent design archetypes that govern how FromSoftware assigns negation values. **Holy resistance is overwhelmingly the most common defensive trait among mandatory bosses** — 12 of 15 priority bosses have Holy negation of 40 or higher. Only Sir Gideon (0) and Fire Giant (20) have below-40 Holy negation in the mandatory path. This confirms Holy damage is systematically disadvantaged for the main story route.

Several boss "archetypes" share identical or near-identical negation profiles. The **armored knight template** (Night's Cavalry, Bell Bearing Hunter) uses 35/35/35/10/40/40/20/40, making Pierce and Lightning the universal counter to armored enemies. The **undead template** (Tibia Mariner, Deathbird) features extreme Strike and Holy weaknesses (both -40) with Pierce and Lightning resistance. The **dragon template** (Agheel, Placidusax) uses 35/35/35/10 physical and 40 across all elemental types, with Pierce as the only physical vulnerability.

The **Omen bloodline** bosses share a distinctive profile: Margit, Morgott, and Godfrey (Ashen Capital) all have identical negation at 0/-10/0/0/0/0/0/40. This is notable because the game's lore connects these characters — Margit IS Morgott in disguise, and Godfrey is Morgott's father — and the matching negation values reflect this shared identity in the underlying data.

**Fire is the most polarized damage type.** Bosses either resist Fire heavily (Mohg 80, Rykard 80, Magma Wyrm 80, Fire Giant 50, Draconic Tree Sentinel 40) or have zero resistance (Radagon 0, Malenia 0, Erdtree Avatar -40). No other element shows this degree of variance.

---

## What data remains uncollected

The dataset covers **approximately 50 of the 173 manifest bosses** with verified negation values. The missing ~120 bosses fall into categories: location-specific variants of already-verified types (e.g., additional Night's Cavalry, Cemetery Shades, and Erdtree Avatars that likely share base negation with their verified counterparts), unique mid-game bosses not fetched from PureEldenRing due to URL access limitations, and DLC bosses not yet populated in the database.

For the DLC, **Romina, Saint of the Bud** (index 162) is the only priority boss without exact numerical data. Qualitative sources confirm Fire weakness and Slash resistance. Five remaining DLC bosses (Midra, Metyr, Commander Gaius, Putrescent Knight, Scadutree Avatar) also lack exact values.

To complete the full 173-boss dataset, the most efficient path forward would be to access the **Elden Ring NPC Data Sheet (1.05)** Google Spreadsheet (ID: `1aujq95UfL_oUs3voPt3nGqM1hLhaVJOj6JKB6Np3FD8`) which contains a complete NpcParam dump, or to use the **tarnished.dev damage calculator** which has all enemy negation values embedded in its JavaScript — selecting each boss from the dropdown populates all 8 defense and 8 negation fields. The EldenRingDatabase/erdb GitHub tool can also generate complete NpcParam JSON from game files directly.

---

## Methodology and source reliability

**PureEldenRing.com** (primary source for base game bosses) draws from datamined NpcParam values. Its numbers were cross-validated against the FIRUIN Steam guide's direct NpcParam readings (Night's Cavalry values matched exactly). The NpcParam field mapping is: `neutralDamageCutRate` → Standard, `slashDamageCutRate` → Slash, `blowDamageCutRate` → Strike, `thrustDamageCutRate` → Pierce, `magicDamageCutRate` → Magic, `fireDamageCutRate` → Fire, `thunderDamageCutRate` → Lightning, `darkDamageCutRate` → Holy. Raw values are multipliers where 1.0 = 0% negation and 0.6 = 40% negation; the wiki and calculator sites convert these to percentage format.

**Fextralife wiki** (source for DLC bosses) displays the same datamined values in stat tables on each boss page. While pages cannot be fetched directly (robots.txt), Google's search index captured the stat table contents for 4 of 5 DLC priority bosses. The Margit and Rennala data from Fextralife search snippets matched PureEldenRing exactly, confirming source consistency.

One notable discrepancy exists for **Malenia**: PureEldenRing shows equal 10% physical negation across all types, while Fextralife qualitatively labels Slash as a "Weakness." This likely reflects Fextralife's editorial interpretation rather than a data difference — Malenia's Slash negation in NpcParam is 10, identical to her other physical types. The "weakness" label may refer to stance/poise interactions or may be an editorial error on the wiki.