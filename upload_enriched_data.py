#!/usr/bin/env python3
import pandas as pd
import json
from supabase import create_client, Client
import sys

# Supabase credentials
url = "https://zwropbskjywvpzaqyrtd.supabase.co"
key = "sb_publishable_QliePmyF31f-uYMayncEig_tRAbWl7x"

# Initialize Supabase client
supabase: Client = create_client(url, key)

print("Loading enriched Excel file...")
file_path = r"C:\Users\beukw\.copilot\workspaces\2b87db60-bef7-453e-aa90-2c991a72847e\attachments\c6b2ad80-9cf8-43cf-bd4e-787394020e43-tissuedigest_chapter3_pdfonly_agent_output_CRM_enriched.xlsx"
df = pd.read_excel(file_path)

print(f"Loaded {len(df)} publications")

# Rename columns to match Supabase schema
column_mapping = {
    'pmid': 'pmid',
    'title': 'title',
    'authors': 'authors',
    'Last Author': 'lastauthor',
    'year': 'year',
    'journal': 'journal',
    'summary': 'summary',
    'Last author city': 'lastauthorcity',
    'Last author country': 'lastauthorcountry',
    'sample type': 'sampletype',
    'instrument': 'instrument',
    'miltenyi product': 'miltenyiproduct',
    'enzymes': 'enzymes',
    'CRM full name 1': 'crm_level_1',
    'CRM full name 3': 'crm_level_3',
    'Zipcode': 'zipcode',
    'Territory': 'territory',
}

# Build records for upload
records = []
for idx, row in df.iterrows():
    record = {}
    
    # Map columns
    for old_col, new_col in column_mapping.items():
        if old_col in df.columns:
            val = row[old_col]
            # Handle NaN values
            if pd.isna(val):
                record[new_col] = None
            elif isinstance(val, float) and val != val:  # NaN check
                record[new_col] = None
            else:
                record[new_col] = str(val) if not isinstance(val, (int, float, bool)) else val
    
    # Convert pmid to int
    if 'pmid' in record and record['pmid']:
        try:
            record['pmid'] = int(float(record['pmid']))
        except:
            continue  # Skip rows without valid PMID
    else:
        continue
    
    records.append(record)

print(f"\nPrepared {len(records)} records for upload")
print(f"\nSample record:")
print(json.dumps(records[0], indent=2, default=str))

# Upload to Supabase in batches
batch_size = 100
print(f"\nUploading in batches of {batch_size}...")

for i in range(0, len(records), batch_size):
    batch = records[i:i+batch_size]
    try:
        result = supabase.table('publications').upsert(batch).execute()
        print(f"  Uploaded batch {i//batch_size + 1} ({len(batch)} records)")
    except Exception as e:
        print(f"  Error uploading batch {i//batch_size + 1}: {e}")
        # Try inserting individually to see which ones fail
        for j, record in enumerate(batch):
            try:
                supabase.table('publications').upsert([record]).execute()
            except Exception as e2:
                print(f"    Record {i+j} (PMID {record.get('pmid')}): {e2}")

print("\nUpload complete!")
