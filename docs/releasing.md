# Release preparation

A request to "get to production" includes a new versioned release, even for documentation-only changes, and updates to existing installed copies without another confirmation. Follow [project instructions](../AGENTS.md#getting-to-production) and the checks below. Update only supported, existing installations; this project does not acquire a ChatGPT plugin route merely through GitHub publication.

1. Use a fresh feature branch and a supported Node runtime. Review dependencies;
   use the pinned lockfile and disable lifecycle scripts.
2. Run `npm run generate`, `npm test`, `npm run check`, and `git diff --check`.
   Review generated changes and candidate-specific audit evidence.
3. Build to an owned ignored directory with
   `python3 development/package_release.py --package-root ai-friendly-audit --out dist`.
   Inspect archive contents, checksums, MIT license, and upstream notices.
4. Keep native support provisional until actual import/discovery, allowed/denied
   browser tasks, authenticated fixtures, interruption, and cleanup are recorded.
5. Update versions and source-bound verification before publishing a new release.
   A production request authorizes publication, updates to existing live
   installations, pushing, and merging under the project instructions; a local
   build or source-only request alone does not.
