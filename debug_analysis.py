import json

pubs = json.load(open('public/enriched_publications.json', encoding='utf-8'))
zipcodes_db = json.load(open('public/zipcode_coordinates.json', encoding='utf-8'))

print('=== DETAILED ANALYSIS ===\n')

# By country
by_country = {}
for pub in pubs:
    country = pub.get('lastauthorcountry', 'Unknown')
    if country not in by_country:
        by_country[country] = {'total': 0, 'with_zipcode': 0, 'mapped': 0}
    by_country[country]['total'] += 1
    
    zipcode = pub.get('zipcode')
    if zipcode:
        by_country[country]['with_zipcode'] += 1
        zipcode_str = str(int(float(zipcode)))
        if zipcode_str in zipcodes_db:
            by_country[country]['mapped'] += 1

for country in sorted(by_country.keys()):
    stats = by_country[country]
    print(f'{country}:')
    print(f'  Total: {stats["total"]}')
    print(f'  With zipcode: {stats["with_zipcode"]}')
    print(f'  Mapped to coordinates: {stats["mapped"]}')
    print()

# Check grouping by institution
print('=== GROUPING BY INSTITUTION ===\n')
from collections import defaultdict
by_inst = defaultdict(lambda: {'pubs': 0, 'country': None, 'zipcode': None})

for pub in pubs:
    inst = pub.get('crm_level_1', 'Unknown')
    by_inst[inst]['pubs'] += 1
    if not by_inst[inst]['country']:
        by_inst[inst]['country'] = pub.get('lastauthorcountry')
    if not by_inst[inst]['zipcode']:
        by_inst[inst]['zipcode'] = pub.get('zipcode')

print(f'Total unique institutions: {len(by_inst)}')
print(f'\nTop 15 institutions by publication count:')
for inst, data in sorted(by_inst.items(), key=lambda x: x[1]['pubs'], reverse=True)[:15]:
    country = data['country']
    zipcode = data['zipcode']
    zipcode_str = str(int(float(zipcode))) if zipcode else 'None'
    mapped = 'YES' if (zipcode and zipcode_str in zipcodes_db) else 'NO'
    print(f'  {inst} ({data["pubs"]} pubs): {country} | Zipcode {zipcode_str} -> {mapped}')

# Check what happens when filtering by country
print('\n=== FILTERING BY COUNTRY (as App.tsx does) ===\n')
selected_countries = ['Belgium', 'Luxembourg', 'Netherlands']
filtered_pubs = []
for pub in pubs:
    country = pub.get('lastauthorcountry', '')
    country_normalized = country.strip().lower()
    
    if country_normalized == 'the netherlands' or country_normalized == 'nl':
        if 'Netherlands' in selected_countries:
            filtered_pubs.append(pub)
    elif country_normalized == 'belgium' or country_normalized == 'be':
        if 'Belgium' in selected_countries:
            filtered_pubs.append(pub)
    elif country_normalized == 'luxembourg' or country_normalized == 'lu':
        if 'Luxembourg' in selected_countries:
            filtered_pubs.append(pub)

print(f'Publications passing country filter: {len(filtered_pubs)}')
print(f'With zipcodes: {sum(1 for p in filtered_pubs if p.get("zipcode"))}')
print(f'Mapped to coordinates: {sum(1 for p in filtered_pubs if p.get("zipcode") and str(int(float(p.get("zipcode")))) in zipcodes_db)}')
