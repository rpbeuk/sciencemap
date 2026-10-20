import json

with open('public/enriched_publications.json', encoding='utf-8') as f:
    pubs = json.load(f)

# Find problematic entries: Dutch zipcodes but marked as "the Netherlands" with wrong country
print('Checking for country-zipcode mismatches:')
print()

# Check Belgian zipcodes marked as Netherlands
belgian_zips_wrong_country = [p for p in pubs if p.get('zipcode') and str(int(float(p['zipcode']))).startswith('1') and p.get('lastauthorcountry') == 'the Netherlands']

print(f'Belgian zipcodes (1000-1999) marked as Netherlands: {len(belgian_zips_wrong_country)}')
if belgian_zips_wrong_country:
    print('Examples:')
    for p in belgian_zips_wrong_country[:5]:
        z = str(int(float(p['zipcode'])))
        print(f'  PMID {p["pmid"]}: {p["lastauthorcity"]} | zipcode {z} | marked as: {p["lastauthorcountry"]}')

print()

# Check Netherlands zipcodes marked as Belgium
dutch_zips_wrong_country = [p for p in pubs if p.get('zipcode') and 1000 <= int(float(p['zipcode'])) < 10000 and p.get('lastauthorcountry') == 'Belgium']

print(f'Dutch zipcodes marked as Belgium: {len(dutch_zips_wrong_country)}')
if dutch_zips_wrong_country:
    print('Examples:')
    for p in dutch_zips_wrong_country[:5]:
        z = str(int(float(p['zipcode'])))
        print(f'  PMID {p["pmid"]}: {p["lastauthorcity"]} | zipcode {z} | marked as: {p["lastauthorcountry"]}')
