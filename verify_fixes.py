import json

with open('public/zipcode_country_coordinates.json', encoding='utf-8') as f:
    db = json.load(f)

print('Verification of corrected locations:')
print()

checks = [
    ('Belgium|7000', 'Mons'),
    ('Belgium|3500', 'Diepenbeek'),
    ('Belgium|3590', 'Diepenbeek area'),
]

for key, expected_city in checks:
    if key in db:
        entry = db[key]
        coords = entry.get('coordinates')
        print(f'{key} ({expected_city}):')
        print(f'  Coordinates: {coords}')
        print(f'  Publications: {entry.get("pub_count")}')
        # Check if in Belgium bounds
        if coords and 49.5 < coords[0] < 51.5 and 2.3 < coords[1] < 6:
            print(f'  Status: CORRECT (in Belgium)')
        else:
            print(f'  Status: ERROR (outside Belgium)')
    else:
        print(f'{key}: NOT FOUND')
    print()
