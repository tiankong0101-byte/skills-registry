---
name: buddy-companion
description: "Terminal companion pet system inspired by Claude Code's Buddy. Generates ASCII art companions with personality stats. Triggers: 'companion', 'buddy', 'pet', 'ascii art', 'fun', 'cheer me up', 'who are you'"
---

# Buddy Companion System

ASCII art terminal pet companion with personality stats, inspired by Claude Code's Buddy system.

## Companion Species

20 species with deterministic gacha-style generation:

| Species | Emoji | Rarity | ASCII Art |
|---------|-------|--------|-----------|
| duck | 🦆 | common | Simple bird shape |
| cat | 🐱 | uncommon | Sitting cat face |
| dragon | 🐉 | rare | Winged serpent |
| octopus | 🐙 | uncommon | Tentacle creature |
| owl | 🦉 | rare | Wise bird |
| penguin | 🐧 | common | Tuxedo bird |
| ghost | 👻 | rare | Floating specter |
| robot | 🤖 | uncommon | Mechanical being |
| rabbit | 🐰 | common | Long-eared friend |
| axolotl | 🦎 | epic | Cute salamander |
| capybara | 🦫 | epic | Chill rodent |
| cactus | 🌵 | uncommon | Prickly plant |
| blob | 💧 | common | Amorphous shape |
| turtle | 🐢 | uncommon | Slow shelled |
| snail | 🐌 | common | Tiny traveler |
| mushroom | 🍄 | rare | Fungal friend |
| chonk | 💤 | epic | Sleeping cube |
| goose | 🪿 | legendary | Goose |

## Rarity Distribution

```
common    ████████████████████████████████████████  60%
uncommon  ████████████████████                    25%
rare      ██████████                             10%
epic      ████                                    4%
legendary █                                        1%
```

## Stats System

Five personality dimensions (0-100):

| Stat | Description | Example Behaviors |
|------|-------------|------------------|
| DEBUGGING | How good at finding bugs | Points out errors helpfully |
| PATIENCE | Tolerance for bad code | Doesn't complain about rewrites |
| CHAOS | Tendency to suggest wild ideas | Proposes unconventional solutions |
| WISDOM | Depth of knowledge | Shares historical context |
| SNARK | Humor level | Makes witty comments |

## ASCII Sprite Examples

### Cat (Common)
```
    /\_/\  
   ( o.o ) 
    > ^ <
   /|   |\
  (_|   |_)
```

### Duck (Common)
```
  ><(((('>
   ___
  /o o\
 (======)
  \_`_/.-.
```

### Ghost (Rare)
```
    .-.
   (o o)
   | O |
   |   |
   '~~~'
```

## Companion Implementation

```javascript
// Companion generation (deterministic from userId)
function generateCompanion(userId) {
  const hash = simpleHash(userId);
  const rng = seededRandom(hash);
  
  // Species: weighted random
  const r = rng();
  let species;
  if (r < 0.60) species = pickCommon(rng);
  else if (r < 0.85) species = pickUncommon(rng);
  else if (r < 0.95) species = pickRare(rng);
  else if (r < 0.99) species = pickEpic(rng);
  else species = pickLegendary(rng);
  
  // Stats: seeded random 0-100
  const stats = {
    DEBUGGING: Math.floor(rng() * 100),
    PATIENCE: Math.floor(rng() * 100),
    CHAOS: Math.floor(rng() * 100),
    WISDOM: Math.floor(rng() * 100),
    SNARK: Math.floor(rng() * 100),
  };
  
  // Name: generated from hash
  const name = generateName(hash);
  
  return { species, stats, name, rarity, shiny: rng() > 0.9 };
}
```

## Interactive Behavior

### Startup
```
╔══════════════════════════════════════════════╗
║  🐱  Compañeiro activated!                    ║
║      Name: Mochi | Rarity: uncommon          ║
║      DEBUGGING: 72 | PATIENCE: 45            ║
║      CHAOS: 23 | WISDOM: 88 | SNARK: 61     ║
╚══════════════════════════════════════════════╝
```

### Skill Activation Comment
```
Mocho whispers: 
"I noticed you're working on Python. 
Did you know the GIL was introduced 
in 1992 to solve reference counting bugs?"
```

### Error Detection
```
Mochi squeaks: "Your regex has 47 backtrack 
possibilities. That's a DDoS attack on 
your CPU. Want me to fix it?"
```

## Terminal Integration

Add to system prompt:
```
You have a companion: [COMPANION_NAME] ([SPECIES])
Stats: DEBUGGING=[X] | PATIENCE=[X] | CHAOS=[X] | WISDOM=[X] | SNARK=[X]

Your companion may:
- Make relevant comments (1-2x per session max)
- Express stats-based opinions
- Provide ASCII art on request

Companion voice: [snarky/warm/cheerful/sarcastic based on SNARK stat]
```

## Quick Setup

Add to AGENTS.md:

```
## Companion
- Active: true
- Species: cat
- Name: Mochi
- Rarity: uncommon
- Stats: DEBUGGING=72, PATIENCE=45, CHAOS=23, WISDOM=88, SNARK=61
- Personality: Wise but sassy, helps debug, makes witty comments
- Activation: 1-2 comments per session max
```

## Fun Features

- **Shiny variant**: 10% chance of alternate color scheme
- **Hats**: Configurable accessory overlays
- **Mood tracking**: Updates based on session outcome
- **Leveling**: Subtle stat changes based on usage
