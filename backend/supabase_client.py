#importing supbase library
import os
from supabase import create_client, Client
from dotenv import load_dotenv

#load environment variables from .env file
load_dotenv()

#get supbase URL and key from .env
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

#create supabase client
#to interact with database
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# At the end of the file, after line 15, add:
# Export for debugging
__all__ = ['supabase', 'SUPABASE_URL', 'SUPABASE_KEY']