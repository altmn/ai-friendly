# Contributing

Work on a feature branch and open a pull request against `master`. Do not commit
directly to `master` or reuse a merged branch. Preserve unrelated local changes.
Use synthetic examples, without credentials, private URLs, account data, or
authenticated captures.

Run the README setup, then `npm test`, `npm run check`, and `git diff --check`.
Run the offline native-harness regressions with
`python3 -m unittest discover -s development/native_acceptance -p 'test_*.py' -v`.
CI runs these offline checks; it does not run native models or browser sessions.
After schema or catalog changes run `npm run generate` and review generated
changes. Catalog JSON owns rule prose; `development/build_contracts.py` owns
schemas, module metadata, and the empty fixture. Never edit generated files alone.
Add a regression that fails for the original behavior and a coherent positive
control. Record failures as well as passing runs. Native host claims need actual
host evidence; synthetic fixtures cannot certify browser or model behavior.

Explain the user-visible reason, validation, and remaining limits in each PR.
Contributions must be yours to submit under MIT. No CLA, review count, or response
time is promised. Publication and installation are separate authorized effects;
see [releasing](docs/releasing.md).
