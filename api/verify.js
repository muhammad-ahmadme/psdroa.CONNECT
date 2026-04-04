import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, username, password } = req.body;

  // THE SECRET GATE
  const isStudent = /^aps.*@amitysharjah\.ae$/i.test(email);

  if (!isStudent) {
    return res.status(403).json({ error: "Access Denied" });
  }

  // 1. Add to Supabase Auth (Status: Unconfirmed)
  const { data, error: authError } = await supabase.auth.signUp({
    email: email,
    password: password,
  });

  if (authError) return res.status(400).json({ error: authError.message });

  // 2. Add to your 'profiles' table with is_verified = false
  if (data.user) {
    await supabase.from('profiles').insert([
      { id: data.user.id, username, email, is_verified: false }
    ]);
  }

  return res.status(200).json({ message: "In the waiting line." });
}
