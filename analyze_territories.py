import json

with open('public/enriched_publications.json', encoding='utf-8') as f:
    pubs = json.load(f)

# Collect all country-territory combinations
territories_by_country = {}

for pub in pubs:
    country = (pub.get('lastauthorcountry') or '').strip()
    territory = (pub.get('territory') or '').strip()
    
    if country and territory:
        if country not in territories_by_country:
            territories_by_country[country] = set()
        territories_by_country[country].add(territory)

print('Territories by Country:')
print()

for country in sorted(territories_by_country.keys()):
    territories = sorted(territories_by_country[country])
    print(f'{country}:')
    for territory in territories:
        # Count publications with this country-territory combo
        count = sum(1 for p in pubs if (p.get('lastauthorcountry') or '').strip() == country and (p.get('territory') or '').strip() == territory)
        print(f'  {territory}: {count} publications')
    print()
