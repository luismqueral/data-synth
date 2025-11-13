# Archive Folder

This folder contains files from previous development phases that are no longer relevant to the current project direction.

## What's Here

### Next.js Migration Documentation (Deprecated)
We explored migrating to Next.js but decided against it. Vanilla JS + ES6 modules is a better fit for DataSynth.

- `NEXTJS_ARCHITECTURE.md` - Proposed Next.js architecture
- `NEXTJS_MIGRATION_SUMMARY.md` - Migration planning
- `SINGLE_FILE_VS_NEXTJS.md` - Comparison analysis
- `FRAMEWORK_AGNOSTIC_ARCHITECTURE.md` - Framework-agnostic exploration
- `VERCEL_DEPLOYMENT.md` - Deployment planning
- `vercel.json` - Vercel configuration
- `SERVER_RUNNING.md` - Server setup notes
- `NODE_BASED_INTERFACE_GUIDE.md` - Interface planning
- `REPO_ORGANIZATION_GUIDE.md` - Organization guide

### Old Files
- `index.html` - Previous monolithic version (identical to `json-mapper-v2.html`)
- `metrics.json` - Build metrics (no longer needed)
- `Settings.json` - Configuration (purpose unclear)

## Current Project Direction

**DataSynth is now being refactored as:**
- Vanilla JavaScript (no frameworks)
- ES6 modules (native browser support)
- Static file deployment (no build step)
- Web Audio API + D3.js + Canvas

See the main `README.md` for current architecture and `docs/REFACTOR_GUIDE.md` for refactoring progress.

## Why These Files Are Archived

1. **Complexity**: Next.js added unnecessary complexity for a client-side audio tool
2. **Build overhead**: No build step means faster iteration and simpler deployment
3. **Performance**: Direct Web Audio API access without framework abstraction
4. **Philosophy**: Keep it simple - static files, modular code, no dependencies

These files remain for historical reference but are not part of the active codebase.

