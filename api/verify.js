import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, username, password } = req.body;

  // 1. THE SECRET GATE (APS Verification)
  // Allows 'aps.name', 'aps123', etc. but blocks anything else.
  const isStudent = /^aps.*@amitysharjah\.ae$/i.test(email);

  if (!isStudent) {
    return res.status(403).json({ error: "Access Denied. Institutional email required." });
  }

  // 2. CREATE AUTH USER
  // This registers them in the 'Authentication' tab of Supabase
  const { data, error: authError } = await supabase.auth.signUp({
    email: email,
    password: password,
  });

  // Handle common errors (like "User already registered")
  if (authError) {
    return res.status(400).json({ error: authError.message });
  }

  // 3. ADD TO WAITING LIST (Profiles Table)
  if (data.user) {
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert([
        { 
          id: data.user.id, 
          username: username, 
          email: email, 
          is_verified: false // Admin must flip this to true in Supabase
        }
      ]);

    if (profileError) {
      console.error("Profile Error:", profileError.message);
      // We don't return an error here because the Auth account was already created.
    }
  }

  // 4. RETURN SUCCESS
  // The frontend will now hide the form and show the "24-hour" message.
  return res.status(200).json({ 
    message: "Request received.",
    status: "waiting_list"
  });
}
