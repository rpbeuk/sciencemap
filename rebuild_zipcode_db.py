import json

# Load publications - this is the ground truth from the original Excel file
with open('public/enriched_publications.json', encoding='utf-8') as f:
    pubs = json.load(f)

# Load old coordinate database to get coordinates
with open('public/zipcode_coordinates.json', encoding='utf-8') as f:
    old_coords = json.load(f)

# Build database using ONLY what's in the Excel file
# Trust country and zipcode as provided
zipcode_country_db = {}

for pub in pubs:
    country = pub.get('lastauthorcountry', '').strip()
    zipcode = pub.get('zipcode')
    city = pub.get('lastauthorcity', '')
    
    if not country or not zipcode:
        continue
    
    zipcode_int = str(int(float(zipcode)))
    key = f'{country}|{zipcode_int}'
    
    if key not in zipcode_country_db:
        # Get coordinates from old database
        coords = old_coords.get(zipcode_int)
        
        zipcode_country_db[key] = {
            'zipcode': zipcode_int,
            'country': country,
            'city': city,
            'coordinates': coords,
            'pub_count': 0
        }
    
    zipcode_country_db[key]['pub_count'] += 1

# Save the corrected database
with open('public/zipcode_country_coordinates.json', 'w', encoding='utf-8') as f:
    json.dump(zipcode_country_db, f, indent=2)

print('Rebuilt country-aware zipcode database from original Excel file')
print(f'Total entries: {len(zipcode_country_db)}')
print()
print('Verified entries:')
print(f'  Belgium|1050 (Brussels): {zipcode_country_db.get("Belgium|1050", {}).get("pub_count")} pubs')
print(f'  the Netherlands|1105 (Amsterdam): {zipcode_country_db.get("the Netherlands|1105", {}).get("pub_count")} pubs')
print(f'  Belgium|3000 (Leuven): {zipcode_country_db.get("Belgium|3000", {}).get("pub_count")} pubs')
print(f'  the Netherlands|3584 (Utrecht): {zipcode_country_db.get("the Netherlands|3584", {}).get("pub_count")} pubs')
