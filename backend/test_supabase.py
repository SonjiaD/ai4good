from supabase_client import supabase, SUPABASE_URL, SUPABASE_KEY

# Debug: Print the values to see what's being loaded
print("=== DEBUG INFO ===")
print(f"SUPABASE_URL: '{SUPABASE_URL}'")
print(f"SUPABASE_KEY: '{SUPABASE_KEY[:20]}...'")  # Print first 20 chars only
print("==================\n")

# Try to connect and list tables
try:
    # Try to query the profiles table (it should be empty for now)
    response = supabase.table("profiles").select("*").execute()
    print("✅ Connected to Supabase successfully!")
    print(f"Found {len(response.data)} profiles in database")
except Exception as e:
    print("❌ Error connecting to Supabase:")
    print(e)