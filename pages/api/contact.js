import nodemailer from "nodemailer";

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {

    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: "gnardo@gdngroup.com.au",
      subject: "New CLX Website Message",
      text: `
Name: ${name}
Email: ${email}

Message:
${message}
`,
    });

    return res.status(200).json({ success: true });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      error: "Failed to send email",
    });

  }
}
