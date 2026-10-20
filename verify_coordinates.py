import json

with open('public/zipcode_country_coordinates.json', encoding='utf-8') as f:
    db = json.load(f)

print('Verification of key locations:')
print()

entries_to_check = [
    ('Belgium|1050', 'Brussels'),
    ('the Netherlands|1105', 'Amsterdam'),
    ('Belgium|3000', 'Leuven'),
    ('the Netherlands|3584', 'Utrecht'),
    ('Belgium|9000', 'Ghent'),
]

for key, expected_city in entries_to_check:
    if key in db:
        entry = db[key]
        coords = entry.get('coordinates')
        print(f'{key} ({expected_city}):')
        print(f'  City in DB: {entry.get("city")}')
        print(f'  Coordinates: {coords}')
        print(f'  Publications: {entry.get("pub_count")}')
    else:
        print(f'{key}: NOT FOUND')
    print()
