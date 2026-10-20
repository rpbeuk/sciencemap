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
        print(f'  {error_msg}')
    else:
        # Check if it's in wrong country territory
        for other_country, other_bounds in COUNTRY_BOUNDS.items():
            if other_country != country:
                o_lat_min, o_lat_max, o_lon_min, o_lon_max = other_bounds
                if o_lat_min <= lat <= o_lat_max and o_lon_min <= lon <= o_lon_max:
                    warning = f'AMBIGUOUS: {key} at [{lat}, {lon}] is in both {country} AND {other_country} bounds'
                    warnings.append(warning)
                    print(f'  WARNING: {warning}')

print()
print('=' * 80)
print('VALIDATION SUMMARY')
print('=' * 80)
print()

if errors:
    print(f'ERRORS FOUND: {len(errors)}')
    print()
    for error in errors:
        print(f'  ❌ {error}')
    print()
else:
    print('✓ No coordinate errors found!')
    print()

if warnings:
    print(f'WARNINGS: {len(warnings)}')
    print()
    for warning in warnings:
        print(f'  ⚠ {warning}')
else:
    print('✓ No ambiguous coordinates!')

print()
print('=' * 80)
print('PUBLICATION COUNTS BY COUNTRY-ZIPCODE')
print('=' * 80)
print()

for country in sorted(COUNTRY_BOUNDS.keys()):
    country_combos = {k: v for k, v in pub_combinations.items() if k.startswith(f'{country}|')}
    total_pubs = sum(v['count'] for v in country_combos.values())
    print(f'{country}: {len(country_combos)} locations, {total_pubs} publications')
    
    # Top 5
    top_combos = sorted(country_combos.items(), key=lambda x: -x[1]['count'])[:5]
    for key, combo in top_combos:
        cities = ', '.join(sorted(combo['cities']))
        zipcode = key.split('|')[1]
        print(f'  {zipcode}: {combo["count"]:3d} pubs | {cities}')
