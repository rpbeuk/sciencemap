import json

# Load all data
with open('public/enriched_publications.json', encoding='utf-8') as f:
    pubs = json.load(f)

with open('public/zipcode_country_coordinates.json', encoding='utf-8') as f:
    db = json.load(f)

# Define country bounds [lat_min, lat_max, lon_min, lon_max]
COUNTRY_BOUNDS = {
    'Belgium': [49.5, 51.5, 2.3, 6.0],
    'the Netherlands': [50.75, 53.5, 3.3, 7.3],
    'Luxembourg': [49.4, 50.2, 5.7, 6.6],
}

print('=' * 80)
print('COMPREHENSIVE COUNTRY-ZIPCODE VALIDATION')
print('=' * 80)
print()

# Collect all unique country-zipcode combinations from publications
pub_combinations = {}
for pub in pubs:
    country = pub.get('lastauthorcountry', '').strip()
    zipcode = pub.get('zipcode')
    
    if not country or not zipcode:
        continue
    
    zipcode_int = str(int(float(zipcode)))
    key = f'{country}|{zipcode_int}'
    
    if key not in pub_combinations:
        pub_combinations[key] = {
            'country': country,
            'zipcode': zipcode_int,
            'cities': set(),
            'count': 0
        }
    
    pub_combinations[key]['cities'].add(pub.get('lastauthorcity', 'Unknown'))
    pub_combinations[key]['count'] += 1

# Check each combination
errors = []
warnings = []

print(f'Checking {len(pub_combinations)} unique country-zipcode combinations...')
print()

for key in sorted(pub_combinations.keys()):
    combo = pub_combinations[key]
    country = combo['country']
    zipcode = combo['zipcode']
    
    # Get database entry
    db_entry = db.get(key)
    
    if not db_entry:
        errors.append(f'MISSING: {key} has {combo["count"]} publications but no DB entry')
        continue
    
    coords = db_entry.get('coordinates')
    
    if not coords:
        errors.append(f'NO COORDS: {key} exists in DB but has no coordinates')
        continue
    
    # Validate coordinates are in correct country
    bounds = COUNTRY_BOUNDS.get(country)
    if not bounds:
        errors.append(f'UNKNOWN COUNTRY: {country}')
        continue
    
    lat, lon = coords[0], coords[1]
    lat_min, lat_max, lon_min, lon_max = bounds
    
    if not (lat_min <= lat <= lat_max and lon_min <= lon <= lon_max):
        error_msg = f'WRONG COUNTRY: {key} at [{lat}, {lon}] is OUTSIDE {country} bounds [{lat_min}-{lat_max}, {lon_min}-{lon_max}]'
        errors.append(error_msg)
        print(f'  ERROR: {error_msg}')

print()
print('=' * 80)
print('ERRORS AND WARNINGS')
print('=' * 80)
print()

if errors:
    print(f'ERRORS FOUND: {len(errors)}')
    print()
    for error in errors:
        print(f'  [ERROR] {error}')
    print()
else:
    print('[OK] No coordinate errors found!')
    print()

print()
print('=' * 80)
print('PUBLICATION COUNTS BY COUNTRY')
print('=' * 80)
print()

for country in sorted(COUNTRY_BOUNDS.keys()):
    country_combos = {k: v for k, v in pub_combinations.items() if k.startswith(f'{country}|')}
    total_pubs = sum(v['count'] for v in country_combos.values())
    print(f'{country}: {len(country_combos)} locations, {total_pubs} publications')
