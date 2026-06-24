# Export System Documentation

EduManage can export student data to **PDF** (a branded, printable report) and **Excel** (a styled spreadsheet). Exports always reflect the **active filters**, not just the current page.

## Where to export

- **Students page** → the **Export** dropdown next to "Add Student". Exports whatever the current search/filters select (across all pages).
- **Settings → Data** → exports the **entire** database.

Both use the shared [`ExportMenu`](../src/components/students/export-menu.tsx) component, which is given a `fetchData()` function that resolves to the rows to export.

## Filtered exports

The Students page passes the current filter set (minus pagination) to [`getAllStudents()`](../src/services/students.service.ts), which **pages through the API in chunks of 100** until every matching record is collected. The PDF also receives a human-readable `subtitle` describing the active filters (e.g. `Filière: Génie Informatique · City: Lyon`).

```ts
<ExportMenu
  fetchData={() => getAllStudents(baseQuery)}   // all rows matching the filters
  subtitle={exportSubtitle}                      // shown in the PDF header
/>
```

If no rows match, the user gets an informational toast instead of an empty file.

## Performance: lazy loading

The export libraries (`jspdf`, `jspdf-autotable`, `xlsx`) are heavy, so they are **not** part of the initial bundle. They are loaded **on demand** the first time the user exports:

```ts
if (kind === "pdf") {
  const { exportStudentsToPDF } = await import("@/utils/export-pdf");
  exportStudentsToPDF(rows, subtitle);
} else {
  const { exportStudentsToExcel } = await import("@/utils/export-excel");
  exportStudentsToExcel(rows);
}
```

## PDF generation

Implemented in [`src/utils/export-pdf.ts`](../src/utils/export-pdf.ts) with **jsPDF** + **jspdf-autotable**:

- **Landscape A4** for wide tables.
- A **branded indigo header band** with the app name, the filter subtitle, the generation timestamp and the total count.
- An **auto-table** with striped rows, a colored header, line-wrapping cells and sensible padding.
- A **footer** on every page with the app name and `Page x of y`.
- Saved as `students-YYYY-MM-DD.pdf`.

Columns: Matricule · Last name · First name · Email · Phone · Filière · City · Date of birth.

This output is also **print-ready** — open the PDF and print, or print the page directly from the browser.

## Excel export

Implemented in [`src/utils/export-excel.ts`](../src/utils/export-excel.ts) with **SheetJS (xlsx)**:

- Rows are mapped to human-readable headers (Matricule, Last name, First name, Email, Phone, Date of birth, Filière, Address, City, Date added).
- Sensible **column widths** are set for readability.
- A single worksheet named **"Students"**.
- Saved as `students-YYYY-MM-DD.xlsx`.

## Feedback

Every export path surfaces feedback via the app's **toast service** (Bootstrap toasts):
- success → `Exported N students` with the file type,
- empty selection → informational toast,
- failure → error toast (the export never crashes the app).
