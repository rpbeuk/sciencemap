import json

# Load the current coordinate database
with open('public/zipcode_coordinates.json', encoding='utf-8') as f:
    coords = json.load(f)

print('Checking postal codes for key cities:')
print()

# Check what we have for Brussels-area zipcodes (1000-1999)
print('Brussels area postal codes (1000-1999):')
brussels_codes = {k: v for k, v in coords.items() if 1000 <= int(k) <= 1999}
for code in sorted(brussels_codes.keys())[:10]:
    coord = brussels_codes[code]
    print(f'  {code}: {coord}')

print()
print('Amsterdam area postal codes (1000-1999):')
amsterdam_codes = {k: v for k, v in coords.items() if 1000 <= int(k) <= 1999}
for code in sorted(amsterdam_codes.keys())[:5]:
    coord = amsterdam_codes[code]
    print(f'  {code}: {coord}')

print()
print('Utrecht area postal codes (3500-3599):')
for code in sorted([k for k in coords.keys() if k.startswith('35')])[:5]:
    coord = coords[code]
    print(f'  {code}: {coord}')

print()
print('Leuven area postal codes (3000-3099):')
for code in sorted([k for k in coords.keys() if k.startswith('30')])[:5]:
    coord = coords[code]
    print(f'  {code}: {coord}')

print()
print('Known correct coordinates:')
print('  Brussels (Belgium): ~50.85, 4.35')
print('  Amsterdam (Netherlands): ~52.37, 4.89')
print('  Leuven (Belgium): ~50.88, 4.70')
print('  Utrecht (Netherlands): ~52.13, 5.26')
