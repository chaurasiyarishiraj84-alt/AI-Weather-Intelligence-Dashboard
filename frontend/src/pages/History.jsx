import { Link } from "react-router-dom";

import HistoryTable from "../components/HistoryTable";

function History() {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f5f7fa",
        padding: "30px",
      }}
    >
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "30px",
            flexWrap: "wrap",
            gap: "15px",
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                color: "#1f2937",
              }}
            >
              Weather History
            </h1>

            <p
              style={{
                marginTop: "8px",
                color: "#6b7280",
              }}
            >
              View, edit and manage stored weather records.
            </p>
          </div>

          <Link
            to="/"
            style={{
              textDecoration: "none",
              backgroundColor: "#2563eb",
              color: "#ffffff",
              padding: "10px 18px",
              borderRadius: "8px",
              fontWeight: "600",
            }}
          >
            ← Back to Dashboard
          </Link>
        </div>

        {/* History Table Section */}
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "12px",
            padding: "25px",
            boxShadow:
              "0 2px 10px rgba(0,0,0,0.08)",
          }}
        >
          <HistoryTable />
        </div>
      </div>
    </div>
  );
}

export default History;