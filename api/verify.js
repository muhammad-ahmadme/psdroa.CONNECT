import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, username, password } = req.body;

  // THE SECRET GATE (Strictly Hidden from Browsers)
  const isStudent = /^aps.*@amitysharjah\.ae$/i.test(email);

  if (!isStudent) {
    // Vague error so teachers don't know why they failed
    return res.status(403).json({ error: "Verification Failed." });
  }

  // Create the "Pending" account in Supabase
  const { data, error } = await supabase.auth.signUp({
    email: email,
    password: password,
    options: {
      data: {
        display_name: username,
        is_verified: false 
      }
    }
  });

  if (error) return res.status(400).json({ error: error.message });

  return res.status(200).json({ message: "Request received." });
}
