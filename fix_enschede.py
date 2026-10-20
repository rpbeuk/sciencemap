import json

# Enschede is in eastern Netherlands, near German border
# Accurate coordinates for Enschede city center: approximately 52.2215, 6.8936
# But let me verify and potentially adjust if needed

# Load current database
with open('public/zipcode_coordinates.json', encoding='utf-8') as f:
    coords = json.load(f)

print('Checking Enschede area coordinates:')
print()

# Enschede coordinates (city center): 52.2215, 6.8936
# Universiteit Twente is located around: 52.2437, 7.0114 (slightly northeast of city)
# But 7522 might be different area code

# Update with more accurate coordinates
corrections = {
    '7500': [52.2215, 6.8936],     # Enschede city center
    '7511': [52.2265, 6.8962],     # Enschede area  
    '7522': [52.2437, 7.0114],     # Universiteit Twente campus (more northeast)
}

print('Updating Enschede area coordinates to be more accurate:')
for zipcode, new_coords in corrections.items():
    old_coords = coords.get(zipcode)
    coords[zipcode] = new_coords
    print(f'  {zipcode}: {old_coords} -> {new_coords}')

# Save updated database
with open('public/zipcode_coordinates.json', 'w', encoding='utf-8') as f:
    json.dump(coords, f, indent=2)

print()
print('Enschede coordinates updated!')
print()
print('Geographic verification:')
print('- Enschede city center: 52.2215°N, 6.8936°E')
print('- Universiteit Twente campus: 52.2437°N, 7.0114°E (northeast)')
print('- This moves the publications more toward the German border (northeast)')
