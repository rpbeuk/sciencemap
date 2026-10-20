import json

d = json.load(open('public/enriched_publications.json', encoding='utf-8'))

# Check countries
countries = set(p["lastauthorcountry"] for p in d if p.get("lastauthorcountry"))
print(f'Countries in data: {sorted(countries)}')

# Check cities
cities = set(p["lastauthorcity"] for p in d if p.get("lastauthorcity"))
print(f'\nUnique cities: {len(cities)}')
print(f'Cities: {sorted(cities)[:20]}')  # First 20

# Check institutions with country breakdown
print('\nInstitutions by country:')
for country in sorted(countries):
    insts = set(p["crm_level_1"] for p in d if p.get("lastauthorcountry") == country)
    print(f'  {country}: {len(insts)} institutions')

# Check for None/empty values
print(f'\nPublications with None country: {sum(1 for p in d if p.get("lastauthorcountry") is None)}')
print(f'Publications with None city: {sum(1 for p in d if p.get("lastauthorcity") is None)}')
