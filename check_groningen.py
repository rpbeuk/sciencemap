import json

# Check current coordinates
with open('public/zipcode_country_coordinates.json', encoding='utf-8') as f:
    db = json.load(f)

print('Checking all Groningen and problematic zipcodes:')
print()

check_keys = [
    'the Netherlands|9747',  # Wrong coordinates
    'the Netherlands|9712',  # Correct Groningen
    'Luxembourg|1210',       # LIH in Strassen
    'Belgium|6041',          # Gosselies
    'the Netherlands|2628',  # TU Delft
]

for key in check_keys:
    entry = db.get(key)
    if entry:
        coords = entry['coordinates']
        print(f'{key}:')
        print(f'  Coordinates: [{coords[0]}, {coords[1]}]')
        print(f'  City: {entry["city"]}')
    else:
        print(f'{key}: NOT FOUND')
    print()

# Check if 9747 is a typo or real zipcode
print()
print('Looking for 9747 and 9749 in database:')
for key in db.keys():
    if '9747' in key or '9749' in key:
        print(f'  {key}: {db[key]["coordinates"]} - {db[key]["city"]}')
