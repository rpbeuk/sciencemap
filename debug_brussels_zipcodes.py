import json

# Check the publications
with open('public/enriched_publications.json', encoding='utf-8') as f:
    pubs = json.load(f)

# Find publications from Brussels
brussels_pubs = [p for p in pubs if (p.get('lastauthorcity') or '').lower() == 'brussels' and p.get('lastauthorcountry') == 'Belgium']

print(f'Total publications from Brussels: {len(brussels_pubs)}')
print()
print('Zipcodes used:')
zipcodes = {}
for p in brussels_pubs:
    z = p.get('zipcode', 'None')
    if z not in zipcodes:
        zipcodes[z] = []
    zipcodes[z].append(p)

for zipcode, pubs_list in sorted(zipcodes.items(), key=lambda x: -len(x[1])):
    print(f'  {zipcode}: {len(pubs_list)} pubs')
    if pubs_list:
        print(f'    - Example: PMID {pubs_list[0]["pmid"]} - {pubs_list[0].get("crm_level_1")}')

print()
print('Checking what zipcodes are in the database:')

with open('public/zipcode_country_coordinates.json', encoding='utf-8') as f:
    db = json.load(f)

belgium_entries = {k: v for k, v in db.items() if k.startswith('Belgium|')}
for key in sorted(belgium_entries.keys()):
    entry = belgium_entries[key]
    if (entry.get('city') or '').lower() == 'brussels':
        print(f'  {key}: pub_count={entry.get("pub_count")}')
