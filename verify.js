export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

    const { email, username } = req.body;

    // THE SECRET RULE:
    // 1. Starts with 'aps' (any case)
    // 2. Ends with '@amitysharjah.ae'
    const studentRegex = /^aps.*@amitysharjah\.ae$/i;

    if (!studentRegex.test(email)) {
        // We reject without explaining why to keep the rule hidden
        return res.status(403).json({ success: false });
    }

    // In a real setup, you would use 'Nodemailer' here to send the 
    // email to inquiries@psdroa.co.uk automatically.
    console.log(`New Student Request: ${username} (${email})`);

    return res.status(200).json({ success: true });
}