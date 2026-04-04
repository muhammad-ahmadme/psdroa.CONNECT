import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, username, password } = req.body;

  /**
   * THE SECRET GATE (Case-Insensitive)
   * ^aps      -> Must start with 'aps' (any case)
   * .* -> Can have a dot, numbers, or letters after 'aps'
   * @amity... -> Must end with the school domain
   * /i        -> Makes the whole thing Case-Insensitive
   */
  const isStudent = /^aps.*@amitysharjah\.ae$/i.test(email);

  if (!isStudent) {
    return res.status(403).json({ error: "Access Denied. Use your school email." });
  }

  // 1. Add to Supabase Auth (Status: Unconfirmed)
  const { data, error: authError } = await supabase.auth.signUp({
    email: email,
    password: password,
  });

  if (authError) return res.status(400).json({ error: authError.message });

  // 2. Add to your 'profiles' table with is_verified = false
  if (data.user) {
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert([
        { 
          id: data.user.id, 
          username: username, 
          email: email, 
          is_verified: false 
        }
      ]);

    if (profileError) console.error("Profile Error:", profileError.message);
  }

  return res.status(200).json({ message: "In the waiting line." });
}
