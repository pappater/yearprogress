# Refactor Plan

## Files

- `auth.js`: GitHub OAuth logic, token/user management
- `gist.js`: Gist integration (find/create, load/save milestones)
- `milestones.js`: Milestone logic, localStorage fallback
- `ui.js`: UI rendering, event listeners, app init

## How to use

- Import functions from these modules in `ui.js`.
- All milestone and auth logic is now modular and easier to maintain.

## Next steps

- Move any remaining UI logic from old `ui.js` into the new structure as needed.
- For future features, add new modules or expand these as appropriate.
