const fs   = require('fs');
const path = require('path');

// Prompt files live at project root /prompts/
const PROMPTS_DIR = path.resolve(__dirname, '../../../prompts');

function load(filename) {
  try {
    const full = path.join(PROMPTS_DIR, filename);
    return fs.readFileSync(full, 'utf8');
  } catch {
    return ''; // graceful fallback if file missing
  }
}

module.exports = {
  MASTER:      load('MASTER_SYSTEM_PROMPT.md'),
  SCANNER:     load('modules/MODULE_01_SCANNER.md'),
  ALLERGEN:    load('modules/MODULE_02_ALLERGEN.md'),
  NUTRITION:   load('modules/MODULE_03_NUTRITION.md'),
  RECIPE:      load('modules/MODULE_07_RECIPE.md'),
  MEALPLAN:    load('modules/MODULE_08_MEALPLAN.md'),
  FRESHNESS:   load('modules/MODULE_09_FRESHNESS.md'),
  VOICE:       load('modules/MODULE_11_VOICE.md'),
  PASSPORT:    load('modules/MODULE_12_PASSPORT.md'),
  FAMILY:      load('modules/MODULE_13_FAMILY.md'),
  CARBON:      load('modules/MODULE_14_CARBON.md'),
  ENCYCLOPEDIA:load('modules/MODULE_04_ENCYCLOPEDIA.md'),
  MENU:        load('modules/MODULE_05_MENU.md'),
  TRAVEL:      load('modules/MODULE_06_TRAVEL.md'),
};
