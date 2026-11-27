# Privacy

The project runs locally and operates no publisher-hosted service or telemetry.
The CLI sends requests only for explicitly selected public HTTP collection.
The selected site receives the request and ordinary connection metadata.

Raw HTTP bodies and cookies are not retained by the collector. Minimized metadata
and observations are written to the chosen output directory. Known-pattern
redaction is imperfect; review retained summaries before sharing. Host tools and
model providers have their own processing policies. No authenticated profile,
cookie jar, HAR, or storage export is needed. Retain only authorized minimized
evidence and remove owned output directories when no longer needed.
