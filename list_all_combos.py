import json

# Load publications to see all unique country-zipcode combinations
with open('public/enriched_publications.json', encoding='utf-8') as f:
    pubs = json.load(f)

# Collect all unique combinations
combinations = {}
for pub in pubs:
    country = (pub.get('lastauthorcountry') or '').strip()
    zipcode = pub.get('zipcode')
    city = (pub.get('lastauthorcity') or '').strip()
    
    if country and zipcode:
        zipcode_int = str(int(float(zipcode)))
        key = f'{country}|{zipcode_int}'
        
        if key not in combinations:
            combinations[key] = {'cities': set(), 'count': 0}
        combinations[key]['cities'].add(city)
        combinations[key]['count'] += 1

print('All unique country-zipcode combinations:')
print()

# Group by country
for country in sorted(['Belgium', 'Luxembourg', 'the Netherlands']):
    country_combos = {k: v for k, v in combinations.items() if k.startswith(f'{country}|')}
    
    print(f'\n{country}: {len(country_combos)} locations')
    print('-' * 60)
    
    for key in sorted(country_combos.keys()):
        zipcode = key.split('|')[1]
        cities = ', '.join(sorted(country_combos[key]['cities']))
        count = country_combos[key]['count']
        print(f'  {zipcode}: {cities} ({count} pubs)')
