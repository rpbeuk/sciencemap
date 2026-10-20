import json

with open('public/zipcode_country_coordinates.json', encoding='utf-8') as f:
    db = json.load(f)

print('Enschede area coordinates verification:')
print()

for key in ['the Netherlands|7500', 'the Netherlands|7511', 'the Netherlands|7522']:
    entry = db.get(key)
    if entry:
        coords = entry['coordinates']
        print(f'{key}:')
        print(f'  Coordinates: [{coords[0]}, {coords[1]}]')
        print(f'  City: {entry["city"]}')
        print(f'  Publications: {entry["pub_count"]}')
    print()

print('Verification: 7522 (Universiteit Twente) should now be at [52.2437, 7.0114]')
print('This is more northeast compared to previous [52.21, 6.9]')
