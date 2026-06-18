import "./ExportPanel.css";

import {
  exportJson,
  exportCsv,
  exportPdf,
  exportMarkdown
} from "../services/api";

function ExportPanel() {
  return (
    <div className="export-panel">

      <h2>📤 Export Weather Data</h2>

      <p>
        Download stored weather records
        in multiple formats.
      </p>

      <div className="export-buttons">

        <button
          className="export-btn export-json"
          onClick={exportJson}
        >
          📄 Export JSON
        </button>

        <button
          className="export-btn export-csv"
          onClick={exportCsv}
        >
          📊 Export CSV
        </button>

        <button
          className="export-btn export-pdf"
          onClick={exportPdf}
        >
          📕 Export PDF
        </button>

        <button
          className="export-btn export-md"
          onClick={exportMarkdown}
        >
          📝 Export Markdown
        </button>

      </div>

    </div>
  );
}

export default ExportPanel;