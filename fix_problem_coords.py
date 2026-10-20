import json

with open('public/zipcode_coordinates.json', encoding='utf-8') as f:
    coords = json.load(f)

# Fix the incorrect mappings
corrections = {
    # Luxembourg cities - should be in Luxembourg
    '1210': [49.6463, 6.1287],     # Strassen, Luxembourg
    '4362': [49.6194, 5.9756],     # Esch-Sur-Alzette, Luxembourg
    '4365': [49.6194, 5.9756],     # Belvaux, Luxembourg (same area as Esch)
    
    # Netherlands cities - should be in Netherlands
    '4401': [51.4416, 3.9833],     # Yerseke, Netherlands (Zeeland, southern)
    '6200': [50.8333, 5.6667],     # Maastricht, Netherlands (Limburg, southern)
    '8200': [52.4539, 5.2753],     # Lelystad, Netherlands (Flevoland, central)
}

print('Fixing incorrect zipcode coordinates:')
for zipcode, new_coords in corrections.items():
    old_coords = coords.get(zipcode)
    coords[zipcode] = new_coords
    print(f'  {zipcode}: {old_coords} -> {new_coords}')

# Save updated database
with open('public/zipcode_coordinates.json', 'w', encoding='utf-8') as f:
    json.dump(coords, f, indent=2)

print()
print('Updated coordinate database saved!')
