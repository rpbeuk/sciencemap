#!/usr/bin/env python3
"""
Load enriched data and create local JSON for map display.
Since Supabase columns don't exist yet, we'll use local JSON loading.
"""
import pandas as pd
import json
from pathlib import Path

print("Loading enriched Excel file...")
file_path = r"C:\Users\beukw\.copilot\workspaces\2b87db60-bef7-453e-aa90-2c991a72847e\attachments\c6b2ad80-9cf8-43cf-bd4e-787394020e43-tissuedigest_chapter3_pdfonly_agent_output_CRM_enriched.xlsx"
df = pd.read_excel(file_path)

print(f"Loaded {len(df)} publications")

# Build enriched publications with geographic data
enriched_pubs = []
for idx, row in df.iterrows():
    pmid = row['pmid']
    if pd.isna(pmid):
        continue
    
    try:
        pmid = int(float(pmid))
    except:
        continue
    
    # Get geographic info
    zipcode = row.get('Zipcode')
    territory = row.get('Territory')
    crm_level_1 = row.get('CRM full name 1')
    crm_level_3 = row.get('CRM full name 3')
    last_author_city = row.get('Last author city')
    
    # Handle NaN values
    zipcode = None if pd.isna(zipcode) else float(zipcode)
    territory = None if pd.isna(territory) else str(territory)
    crm_level_1 = None if pd.isna(crm_level_1) else str(crm_level_1)
    crm_level_3 = None if pd.isna(crm_level_3) else str(crm_level_3)
    last_author_city = None if pd.isna(last_author_city) else str(last_author_city)
    
    pub = {
        'pmid': pmid,
        'title': str(row.get('title', '')),
        'crm_level_1': crm_level_1,
        'crm_level_3': crm_level_3,
        'zipcode': zipcode,
        'territory': territory,
        'lastauthorcity': last_author_city,
        'lastauthorcountry': str(row.get('Last author country', '')),
        'summary': str(row.get('summary', '')),
    }
    enriched_pubs.append(pub)

print(f"Prepared {len(enriched_pubs)} enriched publication records")

# Save to JSON
output_path = Path('public/enriched_publications.json')
with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(enriched_pubs, f, ensure_ascii=False, indent=2)

print(f"Saved to {output_path}")

# Also create a geographic index for quick lookup
print("\nBuilding geographic index...")
geo_index = {}
for pub in enriched_pubs:
    if pub['zipcode'] and pub['territory']:
        key = f"{pub['zipcode']}:{pub['territory']}"
        if key not in geo_index:
            geo_index[key] = {
                'zipcode': pub['zipcode'],
                'territory': pub['territory'],
                'publications': []
            }
        geo_index[key]['publications'].append(pub['pmid'])

print(f"Created geographic index with {len(geo_index)} locations")
print(f"Sample entries: {list(geo_index.keys())[:5]}")

# Save geo index
geo_path = Path('public/geo_index.json')
with open(geo_path, 'w', encoding='utf-8') as f:
    json.dump(geo_index, f, ensure_ascii=False, indent=2)

print(f"Saved geo index to {geo_path}")
