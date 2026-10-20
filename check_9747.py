import json

# Check what we have in the Excel file for 9747/9749
with open('public/enriched_publications.json', encoding='utf-8') as f:
    pubs = json.load(f)

print('All publications with zipcode 9747 or 9749:')
print()

for p in pubs:
    zip_str = str(int(float(p.get('zipcode') or 0))) if p.get('zipcode') else ''
    if zip_str in ['9747', '9749']:
        print(f'Zipcode: {zip_str}')
        print(f'  City: {p.get("lastauthorcity")}')
        print(f'  Country: {p.get("lastauthorcountry")}')
        print(f'  Institution: {p.get("crm_level_1")}')
        print()

# The issue: 9747 is in Groningen (northern Netherlands) 
# But I may have the wrong coordinates for it
# Let me check if there's confusion with which zipcode belongs where

print()
print('Netherlands zipcodes starting with 9:')
with open('public/zipcode_coordinates.json', encoding='utf-8') as f:
    coords = json.load(f)

for zip_code in sorted(coords.keys()):
    if zip_code.startswith('9'):
        print(f'  {zip_code}: {coords[zip_code]}')
