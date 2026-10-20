import json

# Load enriched publications
with open('public/enriched_publications.json', encoding='utf-8') as f:
    pubs = json.load(f)

# Find Mons publications
mons_pubs = [p for p in pubs if (p.get('lastauthorcity') or '').lower() == 'mons']
print(f'Mons publications: {len(mons_pubs)}')
if mons_pubs:
    for p in mons_pubs[:3]:
        print(f'  PMID {p["pmid"]}: zipcode={p.get("zipcode")}, country={p.get("lastauthorcountry")}, city={p.get("lastauthorcity")}')

print()

# Find Diepenbeek publications
diepenbeek_pubs = [p for p in pubs if 'diepenbeek' in (p.get('lastauthorcity') or '').lower()]
print(f'Diepenbeek publications: {len(diepenbeek_pubs)}')
if diepenbeek_pubs:
    for p in diepenbeek_pubs[:3]:
        print(f'  PMID {p["pmid"]}: zipcode={p.get("zipcode")}, country={p.get("lastauthorcountry")}, city={p.get("lastauthorcity")}')

print()

# Check what's in the coordinate database for these
with open('public/zipcode_coordinates.json', encoding='utf-8') as f:
    coords = json.load(f)

print('Coordinate database entries:')
if '7000' in coords:
    print(f'  7000: {coords["7000"]}')
else:
    print('  7000: NOT FOUND')

if '3590' in coords:
    print(f'  3590: {coords["3590"]}')
else:
    print('  3590: NOT FOUND (Diepenbeek area)')

# Check what zipcodes Diepenbeek publications have
if diepenbeek_pubs:
    diepenbeek_zips = set()
    for p in diepenbeek_pubs:
        z = p.get('zipcode')
        if z:
            diepenbeek_zips.add(str(int(float(z))))
    print(f'\nDiepenbeek zipcodes: {sorted(diepenbeek_zips)}')
