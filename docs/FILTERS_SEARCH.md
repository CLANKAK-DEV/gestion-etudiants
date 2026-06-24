# Filters & Search Documentation

The Students page offers a real-time, multi-dimensional filtering experience. All filtering, sorting and pagination happen **server-side** for correctness and scalability; the client owns the filter state and renders results.

## State model

The filter state lives in the Students page ([`src/pages/students.tsx`](../src/pages/students.tsx)) and is shaped by [`StudentFilterState`](../src/components/students/student-filters.tsx):

```ts
interface StudentFilterState {
  search: string;
  filiere: string;
  ville: string;
  dateFrom: string;   // YYYY-MM-DD
  dateTo: string;     // YYYY-MM-DD
  sortBy: string;     // created_at | nom | prenom | matricule | filiere | ville
  sortOrder: "asc" | "desc";
}
```

Pagination (`page`, `limit`) is tracked separately. **Any** filter change resets `page` to 1.

## Real-time search

- A single search box matches across **name, matricule, email and city**.
- Input is **debounced** (350ms) via [`useDebounce`](../src/hooks/use-debounce.ts) so we don't fire a request on every keystroke.
- The header's **global search** navigates to `/students?search=…`; the page reads that query param and seeds the search box, so search works from anywhere.

```ts
const debouncedSearch = useDebounce(filters.search, 350);
```

On the backend ([`server/services/student.service.js`](../server/services/student.service.js)) the term is applied with a case-insensitive `OR` across columns:

```js
builder.or(
  `nom.ilike.%${term}%,prenom.ilike.%${term}%,matricule.ilike.%${term}%,` +
  `email.ilike.%${term}%,ville.ilike.%${term}%`
);
```

The term is **sanitized** first — characters meaningful to PostgREST's `or` syntax and to `ILIKE` patterns (`% _ * ( ) ,`) are stripped, so a search string can never change the query structure or inject wildcards. Trigram indexes (`pg_trgm`) keep these `ILIKE` lookups fast.

## Multi-filter system

Beyond search, the **Filters** popover and inline controls provide:

| Filter | Backend behaviour |
| --- | --- |
| **Filière** | Exact match (`eq`), validated against the known program list |
| **City** | Partial, case-insensitive match (`ilike`) |
| **Date range** | `created_at` between `dateFrom 00:00` and `dateTo 23:59` (inclusive) |

Filters are **composable** — they combine with AND semantics, and an active-filter **count badge** plus a one-click **Reset** keep things manageable. The set of active filters is summarised for the PDF export subtitle.

### Period quick-filters & live total

Above the filters, the **All time / Today / This week / This month** buttons set the `created_at` date range in one click (computed with `date-fns`). The first summary card on the Students page shows the **live filtered total**, so combining the filière dropdown with a period — or any other filter — instantly answers questions like _"how many students in Génie Informatique this week?"_. The card's label switches to "Filtered results" whenever a filter is active.

## Sorting logic

- Sort field is chosen from a whitelist (`SORTABLE_FIELDS`) shared with the backend's allowed columns — only valid, indexed columns are accepted (the server rejects anything else with a 422).
- Direction is toggled with the asc/desc button.
- Applied server-side via `order(sortBy, { ascending })`.

```js
builder.order(sortBy, { ascending: sortOrder === "asc" }).range(from, to);
```

## Pagination

- Server-side via Supabase `.range(from, to)`, returning an exact total `count`.
- The response includes `meta: { total, page, limit, totalPages }`.
- The pagination footer in [`student-list.component`](../frontend/src/app/features/students/student-list/student-list.component.ts) shows "X–Y of Z", a page-size selector (10/20/50/100) and prev/next controls.

## Smooth UX details

- Search input is **debounced** in the component before triggering a request, so typing doesn't fire one call per keystroke.
- Loading shows **skeleton rows**; no results shows a context-aware **empty state** (different copy for "no students yet" vs "no matches", with the right call-to-action).
- A single derived query object drives both the table and the export, guaranteeing they always agree.
