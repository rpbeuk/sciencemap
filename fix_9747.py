import json

# Fix the incorrect zipcode coordinates
with open('public/zipcode_coordinates.json', encoding='utf-8') as f:
    coords = json.load(f)

print('Fixing incorrect zipcodes:')
print()

# 9747 should be in northern Groningen, not southern
old_9747 = coords.get('9747')
coords['9747'] = [53.2145, 6.5597]  # Same as 9712 which is also Groningen
print(f'9747 (Groningen): {old_9747} -> {coords["9747"]}')

# Save corrected database
with open('public/zipcode_coordinates.json', 'w', encoding='utf-8') as f:
    json.dump(coords, f, indent=2)

print()
print('Coordinate database updated!')
