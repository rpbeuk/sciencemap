import json

with open('public/zipcode_coordinates.json', encoding='utf-8') as f:
    zipcode_coords = json.load(f)

with open('public/enriched_publications.json', encoding='utf-8') as f:
    pubs = json.load(f)

# Build country-aware zipcode database from publications
country_zipcode_db = {}

for pub in pubs:
    country = pub.get('lastauthorcountry', '').strip()
    zipcode = pub.get('zipcode')
    city = pub.get('lastauthorcity', 'Unknown')
    
    if not country or not zipcode:
        continue
    
    # Normalize zipcode
    zipcode_int = str(int(float(zipcode)))
    key = f'{country}|{zipcode_int}'
    
    if key not in country_zipcode_db:
        # Get coordinates from base database
        coords = zipcode_coords.get(zipcode_int)
        
        if coords:
            country_zipcode_db[key] = {
                'coordinates': coords,
                'city': city,
                'pub_count': 0
            }
    
    if key in country_zipcode_db:
        country_zipcode_db[key]['pub_count'] += 1

# Save updated database
with open('public/zipcode_country_coordinates.json', 'w', encoding='utf-8') as f:
    json.dump(country_zipcode_db, f, indent=2)

print(f'Regenerated country-zipcode database with {len(country_zipcode_db)} entries')
print()

# Count by country
for country in ['Belgium', 'Luxembourg', 'the Netherlands']:
    entries = {k: v for k, v in country_zipcode_db.items() if k.startswith(f'{country}|')}
    total = sum(e['pub_count'] for e in entries.values())
    print(f'{country}: {len(entries)} locations, {total} publications')
