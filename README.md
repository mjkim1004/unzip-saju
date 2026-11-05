# 운.zip

Korean, mobile-first saju site with a Wrapped-inspired visual identity. Buildless production artifact: `dist/index.html` (CSS, application code, astronomy tables and Korean lunar month table inline). No remote runtime calls, analytics, login, browser storage or submitted birth data.

## Build and validate

```sh
node scripts/build.mjs
node scripts/test.mjs
node scripts/serve.mjs
```

Open the printed localhost URL. `src/` is the editable source; deploy `dist/` using `.openai/hosting.json`. The production version must match the pushed source commit. Tests cover two independent sexagenary day anchors, leap-lunar conversion, invalid input, 23:00 rollover, exact jie boundaries, historical Korean time/DST, overseas conversion, bounded/deterministic scores, six periods and holiday filtering.

## Calculation provenance

User rules v4.1, with explicitly approved supplemental rules v4.1+unzip.1. Full formulas and assumptions are visible in every report's expandable calculation appendix. This is a traditional interpretation model, not an empirically calibrated prediction probability. No daily confidence A is generated.

Preferred sxtwl could not compile on this host without an Xcode compiler. The specified fallback uses PyEphem 4.2.1 apparent geocentric solar longitude, with equinox-of-date and bisection. Solar jie tables: 1899–2056. Birth input: 1900–2050 and no future births. Korean lunar conversion: korean-lunar-calendar 0.4.0. Holiday snapshot: holidays 0.108, generated 2026-11-05. After newly declared temporary holidays, regenerate the snapshot before relying on work-date filtering. Births within one minute of a jie are intentionally blocked for further verification.

Regeneration uses `scripts/generate_calendar.py` with `ephem`, `korean-lunar-calendar` and `holidays` installed into the sibling `../pylibs` directory (or adjust the Python path). Generated tables are committed; rebuilding the website does not require Python or network access.

## User flows

Birth input → verified pillars and short character → one interview screen → personalized report. Unknown birth time is explicitly three pillars. IANA timezone conversion handles historical offsets; ambiguous or missing DST wall times are rejected. Interests change with situation; users can pick a period, compare up to five dates, supply past-year events for a boundary role table, track tasks, or supply a second birth for a supplemental compatibility score.

Reports include a current-day score, selected-interest cards, four pillars, five elements, period charts, calendar filters, bottom-sheet detail, relative rankings when averages are below 40, work-date holiday filtering, JSON and standalone HTML exports. Saved HTML is an explicitly dated snapshot. No user data is persisted by the site.

## Design and validation

Deep ink, lilac, acid lime and orange; a CSS vinyl illustration, expressive Korean typography, responsive desktop landing and narrow mobile report. All decorative graphics are inline CSS/SVG. Local fonts only. Reduced motion, keyboard focus, modal Escape and dismiss, screenreader labels, numbers and text grades are included.

390 px overflow check passed. Manual input-to-report flow, all 30 dates in November 2026, field filtering and exported JSON versus three rendered date values verified in the browser. Formal source tests: 12 groups passed.

## GitHub Pages 배포

Repository Settings → Pages → Deploy from a branch → main / (root).
외부 의존 없는 단일 index.html을 바로 제공합니다. 소스 변경 후 `npm run build`로 index.html을 갱신하고 커밋합니다. `npm test`로 계산 검증을 실행합니다.
