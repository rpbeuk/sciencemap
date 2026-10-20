import json

# Load the coordinate database
with open('public/zipcode_coordinates.json', encoding='utf-8') as f:
    coords = json.load(f)

# Fix Belgian zipcodes that are pointing to Netherlands
corrections = {
    '7000': [50.4502, 4.4914],     # Mons, Belgium
    '3500': [50.8365, 5.3619],     # Diepenbeek, Belgium
    '3590': [50.8365, 5.3619],     # Diepenbeek/Hasselt area, Belgium
}

print('Fixing Belgian zipcode coordinates:')
for zipcode, new_coords in corrections.items():
    old_coords = coords.get(zipcode)
    coords[zipcode] = new_coords
    print(f'  {zipcode}: {old_coords} -> {new_coords}')

# Save updated database
with open('public/zipcode_coordinates.json', 'w', encoding='utf-8') as f:
    json.dump(coords, f, indent=2)

print()
print('Updated coordinate database saved!')
