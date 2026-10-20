import json

with open('public/zipcode_country_coordinates.json', encoding='utf-8') as f:
    db = json.load(f)

keys_to_check = [
    'Luxembourg|1210',
    'Belgium|6041', 
    'the Netherlands|2628',
    'the Netherlands|9747',
    'the Netherlands|1105'
]

print('Verified coordinates for key locations:')
print()

for key in keys_to_check:
    entry = db.get(key)
    if entry:
        coords = entry['coordinates']
        print(f'{key}:')
        print(f'  Coordinates: [{coords[0]}, {coords[1]}]')
        print(f'  City: {entry["city"]}')
        print(f'  Publications: {entry["pub_count"]}')
    else:
        print(f'{key}: NOT FOUND')
    print()
