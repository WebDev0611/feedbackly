const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET;
const emailTemplate = "541433c3-ef06-4633-97fc-0ca5469730a1";
const mailer = require("../../lib/sendgrid");
const cors = require("cors");

const User = require("../../models/user");

function decodeToken(req, res) {
  try {
    const decoded = jwt.verify(req.params.token, jwtSecret);
    console.log('JSON WEB TOKEN',decoded);
    delete decoded.exp;
    delete decoded.iat;
    return res.json(decoded);
  } catch (err) {
    res.status(400);
    if (err.message === "jwt expired")
      res.json({ error: "Verification email expired. Please try signing up again." });
    if (err.message === "invalid token")
      res.json({ error: "Verification failed. Please try signing up again." });
  }
}

async function encodeToken(req, res) {
  const { name, organization, email } = req.body;
  if (!name || !organization || !email)
    return res.status(400).json({ error: "Missing fields. Check your input." });

  try {
    const user = await User.findOne({ email });
    if (user) return res.status(400).json({ error: "User already exists" });

    let token = jwt.sign({ email, name, organization }, jwtSecret, { expiresIn: "3h" });

    let emailData = {
      fromEmail: "noreply@feedbackly.com",
      fromName: "Feedbackly",
      subject: "Please verify your Feedbackly account",
      templateId: emailTemplate
    };
    let substitutions = {
      "{{link}}": `${process.env.DASH_URL}/v-app/#/signup/${token}`
    };

    let addresses = [{ email, name }];

    if(process.env.DOCKER_ENV !== 'production') return res.send({link: substitutions["{{link}}"]})
    await mailer.sendEmail(emailData, substitutions, addresses);
    res.json({ ok: "true" });
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: "Something went wrong" });
  }
}

module.exports = { encodeToken, decodeToken };
