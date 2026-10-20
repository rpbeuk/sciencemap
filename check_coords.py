import json

with open('public/zipcode_country_coordinates.json', encoding='utf-8') as f:
    db = json.load(f)

print('Amsterdam-area entries (52.3-52.4 lat, 4.8-4.9 lon):')
for key in sorted(db.keys()):
    entry = db[key]
    coords = entry.get('coordinates')
    if coords and 52.3 < coords[0] < 52.4 and 4.8 < coords[1] < 4.9:
        print(f'  {key}: {entry["city"]} -> {coords}')

print()
print('Specific entries:')
be_1050 = db.get('Belgium|1050', {})
print(f'Belgium|1050 (Brussels):')
print(f'  City: {be_1050.get("city")}')
print(f'  Coordinates: {be_1050.get("coordinates")}')

nl_1105 = db.get('the Netherlands|1105', {})
print(f'the Netherlands|1105 (Amsterdam):')
print(f'  City: {nl_1105.get("city")}')
print(f'  Coordinates: {nl_1105.get("coordinates")}')
