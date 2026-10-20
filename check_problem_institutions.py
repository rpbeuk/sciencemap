import json

with open('public/enriched_publications.json', encoding='utf-8') as f:
    pubs = json.load(f)

with open('public/zipcode_country_coordinates.json', encoding='utf-8') as f:
    db = json.load(f)

# Find the problematic institutions
searches = [
    ('Luxembourg Institute of Health', 'LIH'),
    ('ULB', 'gosselies'),
    ('Delft', 'TU'),
    ('groningen', 'Groningen')
]

print('Checking problematic institutions:')
print()

for search_term, alt_term in searches:
    matching = [p for p in pubs if search_term.lower() in p.get('crm_level_1', '').lower() or alt_term.lower() in p.get('crm_level_1', '').lower()]
    
    if matching:
        inst_name = matching[0]['crm_level_1']
        print(f'{inst_name}:')
        
        # Group by country-zipcode
        by_key = {}
        for p in matching:
            country = p.get('lastauthorcountry', '')
            zipcode = p.get('zipcode')
            if zipcode:
                zipcode = str(int(float(zipcode)))
                key = f'{country}|{zipcode}'
                if key not in by_key:
                    by_key[key] = []
                by_key[key].append(p)
        
        for key in sorted(by_key.keys()):
            db_entry = db.get(key)
            if db_entry:
                coords = db_entry['coordinates']
                print(f'  {key}: {len(by_key[key])} pubs | Coords: [{coords[0]}, {coords[1]}] | City: {db_entry["city"]}')
            else:
                print(f'  {key}: {len(by_key[key])} pubs | NO DB ENTRY')
        print()
