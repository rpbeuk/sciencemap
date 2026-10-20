import json

with open('public/enriched_publications.json', encoding='utf-8') as f:
    pubs = json.load(f)

# Check the problematic zipcodes
problem_keys = [
    ('Luxembourg', '1210'),
    ('Luxembourg', '4362'),
    ('Luxembourg', '4365'),
    ('the Netherlands', '4401'),
    ('the Netherlands', '6200'),
    ('the Netherlands', '8200'),
]

print('Problematic country-zipcode combinations:')
print()

for country, zipcode in problem_keys:
    matching = [p for p in pubs if p.get('lastauthorcountry') == country and str(int(float(p.get('zipcode') or 0))) == zipcode]
    print(f'{country}|{zipcode}: {len(matching)} publications')
    if matching:
        for p in matching[:2]:
            print(f'  - PMID {p["pmid"]}: {p.get("lastauthorcity")} | {p.get("crm_level_1")}')
    print()
