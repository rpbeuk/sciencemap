import json

# Check the database entry
with open('public/zipcode_country_coordinates.json', encoding='utf-8') as f:
    db = json.load(f)

belgium_1050 = db.get('Belgium|1050')
if belgium_1050:
    print('Database entry for Belgium|1050:')
    print(f'  City: {belgium_1050.get("city")}')
    print(f'  Coordinates: {belgium_1050.get("coordinates")}')
    print(f'  Pub count: {belgium_1050.get("pub_count")}')
else:
    print('No entry for Belgium|1050')

print()

# Also check old database
with open('public/zipcode_coordinates.json', encoding='utf-8') as f:
    old_db = json.load(f)

if '1050' in old_db:
    print('Old database entry for 1050:')
    print(f'  Coordinates: {old_db["1050"]}')
    
print()

# Check Amsterdam entry
if 'Belgium|1105' in db:
    print('Database entry for Belgium|1105 (should be Amsterdam):')
    print(f'  Coordinates: {db["Belgium|1105"].get("coordinates")}')

if 'the Netherlands|1105' in db:
    print('Database entry for the Netherlands|1105:')
    print(f'  Coordinates: {db["the Netherlands|1105"].get("coordinates")}')
    
print()

# Check the publications
with open('public/enriched_publications.json', encoding='utf-8') as f:
    pubs = json.load(f)

# Find publications with zipcode 1050
pubs_1050 = [p for p in pubs if str(p.get('zipcode')).strip() == '1050']

print(f'Total publications with zipcode 1050: {len(pubs_1050)}')
print()
print('Breakdown by country:')
countries = {}
for p in pubs_1050:
    c = p.get('lastauthorcountry', 'Unknown')
    if c not in countries:
        countries[c] = []
    countries[c].append(p)

for country, pubs_list in countries.items():
    print(f'  {country}: {len(pubs_list)} pubs')
    for p in pubs_list[:2]:
        print(f'    - PMID {p["pmid"]}: {p.get("lastauthorcity")}')
