import { useState } from "react";

export default function Home() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");

  const submitForm = async (e) => {
    e.preventDefault();
    setStatus("sending");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          message,
        }),
      });

      await response.json();

      if (response.ok) {
        setStatus("success");
        setName("");
        setEmail("");
        setMessage("");
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

        <form onSubmit={submitForm}>
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={inputStyle}
            required
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
            required
          />

          <textarea
            placeholder="Message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            style={textareaStyle}
            required
          />

          <button type="submit" style={buttonStyle}>
            Send Message
          </button>
        </form>

        {status === "sending" && (
          <p style={infoStyle}>Sending...</p>
        )}

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
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "#020617",
  padding: "20px",
  fontFamily: "Arial, sans-serif",
};

const cardStyle = {
  width: "100%",
  maxWidth: "600px",
  background: "#0f172a",
  borderRadius: "16px",
  padding: "40px",
  boxShadow: "0 0 30px rgba(0,0,0,0.45)",
  color: "white",
  boxSizing: "border-box",
};

const titleStyle = {
  fontSize: "32px",
  fontWeight: "700",
  marginBottom: "10px",
};

const subtitleStyle = {
  color: "#94a3b8",
  marginBottom: "28px",
  lineHeight: "1.5",
};

const inputStyle = {
  width: "100%",
  padding: "14px 16px",
  marginBottom: "16px",
  borderRadius: "10px",
  border: "1px solid #334155",
  background: "#111827",
  color: "white",
  fontSize: "16px",
  boxSizing: "border-box",
  outline: "none",
};

const textareaStyle = {
  width: "100%",
  minHeight: "140px",
  padding: "14px 16px",
  marginBottom: "20px",
  borderRadius: "10px",
  border: "1px solid #334155",
  background: "#111827",
  color: "white",
  fontSize: "16px",
  boxSizing: "border-box",
  outline: "none",
  resize: "vertical",
};

const buttonStyle = {
  padding: "14px 22px",
  borderRadius: "10px",
  border: "none",
  background: "#ffffff",
  color: "#0f172a",
  fontWeight: "700",
  fontSize: "16px",
  cursor: "pointer",
};

const infoStyle = {
  marginTop: "18px",
  color: "#cbd5e1",
};

const successStyle = {
  marginTop: "18px",
  color: "#22c55e",
};

const errorStyle = {
  marginTop: "18px",
  color: "#ef4444",
};
