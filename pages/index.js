import { useState } from "react";

export default function Home() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [question, setQuestion] = useState("");
  const [status, setStatus] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("sending");

    try {
      const response = await fetch("https://formspree.io/f/mlgpnvbk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          question,
        }),
      });

      if (response.ok) {
        setStatus("success");
        setName("");
        setEmail("");
        setQuestion("");
      } else {
        setStatus("error");
      }
    } catch (error) {
      setStatus("error");
    }
  };

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <h1 style={titleStyle}>CLX Contact</h1>
        <p style={subtitleStyle}>
          Send us a message and our team will get back to you.
        </p>

        <form onSubmit={handleSubmit} style={formStyle}>
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={inputStyle}
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
            required
          />

          <textarea
            name="question"
            placeholder="Question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            style={textareaStyle}
            required
          />

          <button type="submit" style={buttonStyle}>
            {status === "sending" ? "Sending..." : "Send Message"}
          </button>
        </form>

        {status === "success" && (
          <p style={successStyle}>Message sent successfully.</p>
        )}

        {status === "error" && (
          <p style={errorStyle}>Failed to send message.</p>
        )}
      </div>
    </div>
  );
}

const pageStyle = {
  minHeight: "100vh",
  background:
    "radial-gradient(circle at top, #071a44 0%, #03102b 45%, #020817 100%)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: "40px 20px",
  fontFamily: "Arial, sans-serif",
};

const cardStyle = {
  width: "100%",
  maxWidth: "900px",
  background: "rgba(9, 23, 52, 0.96)",
  border: "1px solid rgba(83, 116, 176, 0.35)",
  borderRadius: "30px",
  padding: "56px",
  boxSizing: "border-box",
  boxShadow: "0 20px 60px rgba(0, 0, 0, 0.4)",
};

const titleStyle = {
  color: "#ffffff",
  fontSize: "64px",
  fontWeight: 700,
  lineHeight: 1.05,
  margin: "0 0 24px 0",
};

const subtitleStyle = {
  color: "#97a6c3",
  fontSize: "26px",
  lineHeight: 1.5,
  margin: "0 0 40px 0",
};

const formStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "24px",
};

const inputStyle = {
  width: "100%",
  height: "84px",
  borderRadius: "20px",
  border: "1px solid rgba(112, 137, 185, 0.45)",
  background: "rgba(8, 20, 45, 0.95)",
  color: "#ffffff",
  fontSize: "24px",
  padding: "0 24px",
  outline: "none",
  boxSizing: "border-box",
};

const textareaStyle = {
  width: "100%",
  minHeight: "220px",
  borderRadius: "20px",
  border: "1px solid rgba(112, 137, 185, 0.45)",
  background: "rgba(8, 20, 45, 0.95)",
  color: "#ffffff",
  fontSize: "24px",
  padding: "22px 24px",
  outline: "none",
  boxSizing: "border-box",
  resize: "vertical",
};

const buttonStyle = {
  marginTop: "8px",
  width: "280px",
  height: "92px",
  borderRadius: "20px",
  border: "2px solid #d9dce4",
  background: "#f4f4f6",
  color: "#0f1a34",
  fontSize: "24px",
  fontWeight: 700,
  cursor: "pointer",
};

const successStyle = {
  marginTop: "28px",
  color: "#24e06d",
  fontSize: "26px",
  fontWeight: 500,
};

const errorStyle = {
  marginTop: "28px",
  color: "#ff4d4f",
  fontSize: "26px",
  fontWeight: 500,
};
