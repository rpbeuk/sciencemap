import json

with open('public/enriched_publications.json', encoding='utf-8') as f:
    pubs = json.load(f)

# Find all Enschede publications
enschede_pubs = [p for p in pubs if (p.get('lastauthorcity') or '').lower() in ['enschede', 'twente']]

print('Enschede area publications:')
print()

by_zipcode = {}
for p in enschede_pubs:
    zip_code = str(int(float(p.get('zipcode') or 0))) if p.get('zipcode') else 'N/A'
    if zip_code not in by_zipcode:
        by_zipcode[zip_code] = []
    by_zipcode[zip_code].append(p)

for zip_code in sorted(by_zipcode.keys()):
    print(f'Zipcode {zip_code}: {len(by_zipcode[zip_code])} publications')
    for p in by_zipcode[zip_code][:2]:
        print(f'  - {p.get("crm_level_1")} ({p.get("lastauthorcity")})')
    print()

# Check current coordinates
print()
print('Current coordinates in database:')

with open('public/zipcode_coordinates.json', encoding='utf-8') as f:
    coords = json.load(f)

for zip_code in ['7500', '7511', '7522']:
    if zip_code in coords:
        print(f'{zip_code}: {coords[zip_code]}')
    else:
        print(f'{zip_code}: NOT FOUND')

print()
print('Enschede should be approximately [52.22, 6.89] (northeast)')
print('Current coordinates seem too far south/west')
