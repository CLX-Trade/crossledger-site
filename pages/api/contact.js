import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { name, email, question } = req.body || {};

    if (!name || !email || !question) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: String(process.env.SMTP_SECURE) === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const recipient = process.env.CONTACT_TO_EMAIL;

    await transporter.sendMail({
      from: process.env.CONTACT_FROM_EMAIL,
      to: recipient,
      replyTo: email,
      subject: `CrossLedger Contact Form - ${name}`,
      text: `
New CrossLedger contact form submission

Name: ${name}
Email: ${email}

Question:
${question}
      `,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>New CrossLedger contact form submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Question:</strong></p>
          <p>${question.replace(/\n/g, "<br />")}</p>
        </div>
      `,
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Contact API error:", error);
    return res.status(500).json({ message: "Failed to send message." });
  }
}
