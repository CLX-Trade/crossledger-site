export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed." });
  }

  try {
    const { name, email, question } = req.body;

    if (!name || !email || !question) {
      return res.status(400).json({ message: "All fields are required." });
    }

    console.log("NEW CONTACT MESSAGE");
    console.log("Name:", name);
    console.log("Email:", email);
    console.log("Question:", question);

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Contact API error:", error);
    return res.status(500).json({ message: "Failed to send message." });
  }
}
