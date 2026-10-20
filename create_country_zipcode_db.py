import json

# Load current zipcode database
with open('public/zipcode_coordinates.json', encoding='utf-8') as f:
    coords_db = json.load(f)

# Load publications
with open('public/enriched_publications.json', encoding='utf-8') as f:
    pubs = json.load(f)

# Build country-aware database: maps (country, zipcode) -> coordinates
zipcode_country_map = {}

for pub in pubs:
    country = pub.get('lastauthorcountry', '').strip()
    zipcode = pub.get('zipcode')
    
    if not country or not zipcode:
        continue
    
    zipcode = str(int(float(zipcode)))
    key = (country, zipcode)
    
    if key not in zipcode_country_map:
        # Try to find coordinates from existing database
        coords = coords_db.get(zipcode)
        zipcode_country_map[key] = {
            'zipcode': zipcode,
            'country': country,
            'city': pub.get('lastauthorcity', ''),
            'coordinates': coords,
            'pub_count': 0
        }
    
    zipcode_country_map[key]['pub_count'] += 1

# Create new database format
new_db = {}
for (country, zipcode), entry in zipcode_country_map.items():
    # Key format: "country|zipcode"
    key = f"{country}|{zipcode}"
    new_db[key] = {
        'coordinates': entry['coordinates'],
        'city': entry['city'],
        'pub_count': entry['pub_count']
    }

# Save new database
with open('public/zipcode_country_coordinates.json', 'w', encoding='utf-8') as f:
    json.dump(new_db, f, indent=2)

print("Country-aware zipcode database created!")
print(f"Total entries: {len(new_db)}")
print()
print("Sample entries:")
for key in sorted(new_db.keys())[:15]:
    entry = new_db[key]
    print(f"  {key}: {entry['city']} ({entry['pub_count']} pubs)")

# Check for missing coordinates
missing = [k for k, v in new_db.items() if not v['coordinates']]
if missing:
    print()
    print(f"WARNING: {len(missing)} entries without coordinates:")
    for key in missing[:10]:
        print(f"  {key}: {new_db[key]['city']}")
