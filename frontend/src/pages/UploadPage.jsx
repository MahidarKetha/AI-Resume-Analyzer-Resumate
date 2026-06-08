import { useState, useRef } from "react";

const s = {
  page: {
    minHeight: "100vh", width: "100vw",
    background: "linear-gradient(135deg, #eaeaf5 0%, #8bd8d8 45%, #80c6ff 100%)",
    fontFamily: "'Segoe UI', sans-serif", display: "flex", flexDirection: "column", boxSizing: "border-box",
  },
  nav: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "18px 40px", background: "rgba(255,255,255,0.6)", backdropFilter: "blur(16px)",
    borderBottom: "1px solid rgba(200,195,230,0.3)", position: "sticky", top: 0, zIndex: 10,
  },
  logo: { fontWeight: "800", fontSize: "1.1rem", letterSpacing: "2px", color: "#5a5a9a" },
  logoRe: { color: "#b87a8a" },
  logoutBtn: {
    background: "linear-gradient(90deg,#7b7bbf,#9b80c8)", color: "#fff",
    border: "none", borderRadius: "50px", padding: "9px 22px",
    fontWeight: "600", fontSize: "1.0rem", cursor: "pointer",
    boxShadow: "0 3px 12px rgba(123,123,191,0.3)",
  },
  body: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "48px 24px 60px" },
  heroTitle: {
    fontSize: "clamp(3rem,5vw,4rem)", fontWeight: "800", textAlign: "center",
    lineHeight: 1.2, marginBottom: "14px", color: "#7c6fa3",
  },
  heroHighlight: { color: "#5577a1" },
  heroSub: { color: "#514e4e", fontSize: "0.97rem", marginBottom: "40px", textAlign: "center" },
  form: {
    background: "rgba(255,255,255,0.6)", backdropFilter: "blur(20px)",
    borderRadius: "24px", padding: "36px 36px 32px", width: "100%", maxWidth: "560px",
    boxShadow: "0 8px 40px rgba(120,100,180,0.10)",
  },
  label: { display: "block", fontSize: "1.3rem", color: "#555", marginBottom: "8px", fontWeight: "500" },
  input: {
    width: "100%", padding: "13px 16px", borderRadius: "12px",
    border: "1.5px solid #e0dff0", background: "#fff", fontSize: "1.0rem",
    color: "#333", outline: "none", marginBottom: "20px", boxSizing: "border-box", transition: "border-color 0.2s",
  },
  inputFocus: { borderColor: "#9090d0" },
  textarea: {
    width: "100%", padding: "13px 16px", borderRadius: "12px",
    border: "1.5px solid #e0dff0", background: "#fff", fontSize: "0.95rem",
    color: "#333", outline: "none", marginBottom: "20px", boxSizing: "border-box",
    resize: "vertical", minHeight: "110px", fontFamily: "inherit", transition: "border-color 0.2s",
  },
  dropzone: {
    border: "2px dashed #c8c5e8", borderRadius: "16px", background: "rgba(255,255,255,0.7)",
    padding: "36px 20px", textAlign: "center", cursor: "pointer", marginBottom: "24px",
    transition: "border-color 0.2s, background 0.2s",
  },
  dropzoneActive: { borderColor: "#7b7bbf", background: "rgba(123,123,191,0.06)" },
  dropText: { color: "#444", fontSize: "1.0rem", marginBottom: "4px" },
  dropTextLink: { color: "#7b7bbf", fontWeight: "600" },
  dropHint: { color: "#aaa", fontSize: "0.8rem" },
  fileChosen: { color: "#5a5a9a", fontWeight: "600", fontSize: "0.9rem", marginTop: "8px" },
  submitBtn: {
    width: "100%", padding: "15px", borderRadius: "50px", border: "none",
    background: "linear-gradient(90deg,#7b7bbf 0%,#9b80c8 100%)", color: "#fff",
    fontSize: "1rem", fontWeight: "600", cursor: "pointer",
    boxShadow: "0 4px 16px rgba(123,123,191,0.35)", transition: "opacity 0.2s, transform 0.1s", letterSpacing: "0.3px",
  },
  loadingWrap: { textAlign: "center", padding: "14px 0" },
  errorBanner: {
    marginTop: "16px", padding: "12px 18px", borderRadius: "10px",
    background: "#fee2e2", border: "1px solid #fca5a5", color: "#a7e3e5", fontSize: "0.85rem",
  },
};

export default function UploadPage({ onLogout, onAnalyzed }) {
  const [company, setCompany]       = useState("");
  const [jobTitle, setJobTitle]     = useState("");
  const [jobDesc, setJobDesc]       = useState("");
  const [file, setFile]             = useState(null);
  const [dragging, setDragging]     = useState(false);
  const [focused, setFocused]       = useState(null);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState("");
  const fileInputRef = useRef(null);

  const handleDrop = (e) => {
    e.preventDefault(); setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) { setError("Please upload your resume first."); return; }
    setError(""); setLoading(true);

    try {
      const formData = new FormData();
      formData.append("resume", file);
      formData.append("company_name", company);
      formData.append("job_title", jobTitle);
      formData.append("job_description", jobDesc);

      const res = await fetch("/analyze", { method: "POST", body: formData });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      onAnalyzed(data);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <nav style={s.nav}>
        <span style={s.logo}><span style={s.logoRe}>RE</span>SUMATE</span>
      </nav>

      <div style={s.body}>
        <h1 style={s.heroTitle}>
          <span style={s.heroHighlight}>Get job-ready</span>{" "}with intelligent feedback
        </h1>
        <p style={s.heroSub}>Drop your resume for an ATS score and improvement tips.</p>

        <div style={s.form}>
          <label style={s.label}>Company Name</label>
          <input type="text" value={company} onChange={(e) => setCompany(e.target.value)}
            onFocus={() => setFocused("company")} onBlur={() => setFocused(null)}
            placeholder="Enter Your Company Name"
            style={{ ...s.input, ...(focused === "company" ? s.inputFocus : {}) }} />

          <label style={s.label}>Job Title</label>
          <input type="text" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)}
            onFocus={() => setFocused("title")} onBlur={() => setFocused(null)}
            placeholder="Enter Your Job Title"
            style={{ ...s.input, ...(focused === "title" ? s.inputFocus : {}) }} />

          <label style={s.label}>Job Description</label>
          <textarea value={jobDesc} onChange={(e) => setJobDesc(e.target.value)}
            onFocus={() => setFocused("desc")} onBlur={() => setFocused(null)}
            placeholder="Write a clear & concise job description with responsibilities & expectations..."
            style={{ ...s.textarea, ...(focused === "desc" ? s.inputFocus : {}) }} />

          <label style={s.label}>Upload Resume</label>
          <div
            style={{ ...s.dropzone, ...(dragging ? s.dropzoneActive : {}) }}
            onClick={() => fileInputRef.current.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
          >
            <div style={{ fontSize: "2rem", marginBottom: "10px" }}>📄</div>
            <p style={s.dropText}>
              <span style={s.dropTextLink}>Click to upload</span> or drag and drop
            </p>
            <p style={s.dropHint}>PDF, PNG or JPG (max. 10MB)</p>
            {file && <p style={s.fileChosen}>✓ {file.name}</p>}
            <input ref={fileInputRef} type="file" accept=".pdf,.png,.jpg,.jpeg"
              onChange={(e) => { if (e.target.files[0]) setFile(e.target.files[0]); }}
              style={{ display: "none" }} />
          </div>

          <button onClick={handleSubmit} disabled={loading}
            style={{ ...s.submitBtn, opacity: loading ? 0.7 : 1, cursor: loading ? "not-allowed" : "pointer" }}>
            {loading ? "Analyzing…" : "Save & Analyze Resume"}
          </button>

          {loading && (
            <div style={s.loadingWrap}>
              <p style={{ color: "#7b7bbf", fontSize: "0.85rem", marginTop: "12px" }}>
                ⏳ Scanning your resume with AI — this takes ~10 seconds…
              </p>
            </div>
          )}

          {error && <div style={s.errorBanner}>⚠ {error}</div>}
        </div>
      </div>
    </div>
  );
}