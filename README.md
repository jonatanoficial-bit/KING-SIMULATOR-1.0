# Medieval Kingdoms — Turn-Based (Part 2: Commercial Base)

A mobile-first, premium UI/UX, vanilla HTML/CSS/JS turn-based strategy + narrative game.

## What’s new in Part 2
- (previous features)

## What’s new in Part 3
- **War tab** unlocked when you are in war.
- **War actions**: Raid, Siege, Reinforce, Seek Peace.
- **War state** with Player Power, Enemy Power and Morale.
- **War events** chain and peace talks.
- **Win war** by reducing Enemy Power to 0; **lose** if War Morale collapses.

- Turn-based loop with **3 Action Points (PA)** per turn.
- **Factions** (Nobility, Clergy, Army, Merchants) with loyalty and coup/game-over conditions.
- **Abstract Realm Map** (4 regions) with prosperity/unrest affecting income.
- **Treaties meta** (Alliances/Wars/Rivalries) used for endings.
- PT/EN selectable on boot.

## Run locally
### Option A (recommended): local server
```bash
python3 -m http.server
```
Open:
- `http://localhost:8000/medieval_turn_based/index.html`
- `http://localhost:8000/medieval_turn_based/admin.html`

### Option B: open the file directly
Some browsers restrict ES modules via `file://`. If it fails, use Option A.

## Deploy on GitHub Pages
1. Create a repo and upload the `medieval_turn_based/` folder contents to the repository root (or keep inside a folder).
2. On GitHub: **Settings → Pages**.
3. Select the branch (e.g. `main`) and `/root` directory.
4. Save. GitHub will provide the Pages URL.

## Admin (local)
- Open `admin.html`
- Login: **admin / admin**
- DLC install/export/import is prepared for future steps.

## Content & DLC
Core content is embedded in `/src/data.js` and `/src/locales.js` so the game works statically.
Future steps can switch to loading JSON packs from `/content/` without changing the core engine.

---
Version: `v1.3 (Part 4: Economy + Fix)`

## What’s new in Part 4
- Economy tab with Inflation, Debt, Food, Trade and Stability.
- Economic actions (Bonds, Grain subsidy, Open markets, Embargo, Austerity).
- Economic events (Famine, Guild demands, Inflation spike).
- Bankrupt ending also triggers from high debt / zero food / zero stability.

