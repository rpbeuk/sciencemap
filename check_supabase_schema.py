import pandas as pd
import json
from supabase import create_client, Client
import os

# Get Supabase credentials
url = os.environ.get('VITE_SUPABASE_URL')
key = os.environ.get('VITE_SUPABASE_ANON_KEY')

if not url or not key:
    print("Error: SUPABASE_URL and SUPABASE_ANON_KEY not set")
    # Try reading from .env.local
    try:
        with open('.env.local', 'r') as f:
            for line in f:
                if line.startswith('VITE_SUPABASE_URL'):
                    url = line.split('=')[1].strip()
                elif line.startswith('VITE_SUPABASE_ANON_KEY'):
                    key = line.split('=')[1].strip()
    except:
        pass

if url and key:
    print(f"Supabase URL: {url[:50]}...")
    print(f"Supabase Key: {key[:20]}...")
    
    # Initialize Supabase client
    supabase: Client = create_client(url, key)
    
    # Get table info
    print("\nFetching publications table schema...")
    result = supabase.table('publications').select('*').limit(1).execute()
    if result.data:
        print(f"  Current columns: {list(result.data[0].keys())}")
else:
    print("Could not load Supabase credentials")
