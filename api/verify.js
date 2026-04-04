import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, username, password } = req.body;

  // FIX: The .* ensures that 'aps.' or 'aps123' or 'APS_' all pass.
  // It only checks that it STARTS with 'aps' and ENDS with the domain.
  const isStudent = /^aps.*@amitysharjah\.ae$/i.test(email);

  if (!isStudent) {
    // Keeping it vague to throw off teachers
    return res.status(403).json({ error: "Access denied. Invalid credentials." });
  }

  // 1. Create the Auth User
  const { data, error: authError } = await supabase.auth.signUp({
    email: email,
    password: password,
  });

  if (authError) return res.status(400).json({ error: authError.message });

  // 2. Insert into your 'profiles' table as 'false' (The Waiting Room)
  if (data.user) {
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([
        { 
          id: data.user.id, 
          username: username, 
          email: email, 
          is_verified: false 
        }
      ]);

    if (profileError) console.error("Profile creation failed:", profileError.message);
  }

  return res.status(200).json({ message: "Request received. Please wait 24 hours." });
}
