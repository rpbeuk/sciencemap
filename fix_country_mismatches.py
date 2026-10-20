import json

# Load publications
with open('public/enriched_publications.json', encoding='utf-8') as f:
    pubs = json.load(f)

# City to country mapping for disambiguation
CITY_COUNTRY_MAP = {
    'amsterdam': 'the Netherlands',
    'rotterdam': 'the Netherlands',
    'groningen': 'the Netherlands',
    'utrecht': 'the Netherlands',
    'leiden': 'the Netherlands',
    'wageningen': 'the Netherlands',
    'nijmegen': 'the Netherlands',
    'erasmus': 'the Netherlands',
    'maastricht': 'the Netherlands',
    
    'leuven': 'Belgium',
    'ghent': 'Belgium',
    'gent': 'Belgium',
    'brussels': 'Belgium',
    'antwerp': 'Belgium',
    'liege': 'Belgium',
    'liège': 'Belgium',
    'brussels': 'Belgium',
    'sciensano': 'Belgium',
    
    'luxembourg': 'Luxembourg',
}

# Build a corrected country-zipcode mapping
corrected_db = {}

for pub in pubs:
    country = pub.get('lastauthorcountry', '').strip()
    zipcode = pub.get('zipcode')
    city = (pub.get('lastauthorcity') or '').strip().lower()
    
    if not zipcode:
        continue
    
    zipcode_int = str(int(float(zipcode)))
    
    # Try to validate/correct the country
    corrected_country = country
    
    # Check if city name suggests a different country
    if city:
        for city_keyword, implied_country in CITY_COUNTRY_MAP.items():
            if city_keyword in city:
                corrected_country = implied_country
                break
    
    # Zipcode-based validation
    # Belgium: 1000-9999
    # Netherlands: 1000-9900 (but typically starts with 1-9, letters often follow)
    # Luxembourg: 1000-8999
    # Netherlands has postcodes like 1105AZ, so they have letters
    
    # For now, trust the corrected country from city matching
    
    key = f'{corrected_country}|{zipcode_int}'
    
    if key not in corrected_db:
        corrected_db[key] = {
            'zipcode': zipcode_int,
            'country': corrected_country,
            'city': pub.get('lastauthorcity', ''),
            'coordinates': None,  # Will be populated from old database
            'pub_count': 0
        }
    
    corrected_db[key]['pub_count'] += 1

# Load old database to get coordinates
with open('public/zipcode_country_coordinates.json', encoding='utf-8') as f:
    old_db = json.load(f)

# Copy over coordinates
for key, entry in corrected_db.items():
    if key in old_db and old_db[key].get('coordinates'):
        entry['coordinates'] = old_db[key]['coordinates']

# Save corrected database
with open('public/zipcode_country_coordinates.json', 'w', encoding='utf-8') as f:
    json.dump(corrected_db, f, indent=2)

print('Corrected country-aware zipcode database!')
print(f'Total entries: {len(corrected_db)}')
print()

# Show corrections made
print('Sample corrected entries:')
for key in ['Belgium|1050', 'the Netherlands|1105', 'Belgium|3000', 'the Netherlands|3584']:
    if key in corrected_db:
        entry = corrected_db[key]
        print(f'  {key}: {entry["city"]} ({entry["pub_count"]} pubs)')
