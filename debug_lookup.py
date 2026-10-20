import json

# Simulate what the app does
with open('public/enriched_publications.json', encoding='utf-8') as f:
    pubs = json.load(f)

with open('public/zipcode_country_coordinates.json', encoding='utf-8') as f:
    db = json.load(f)

# Find a Brussels 1050 publication
test_pub = None
for p in pubs:
    if (p.get('lastauthorcity') or '').lower() == 'brussels' and str(p.get('zipcode')) == '1050.0':
        test_pub = p
        break

if test_pub:
    print('Test publication:')
    print(f'  PMID: {test_pub["pmid"]}')
    print(f'  City: {test_pub["lastauthorcity"]}')
    print(f'  Country: {test_pub["lastauthorcountry"]}')
    print(f'  Zipcode (raw): {test_pub["zipcode"]} (type: {type(test_pub["zipcode"]).__name__})')
    
    # Simulate the app's conversion
    zipcode = str(int(float(test_pub['zipcode'])))
    country = test_pub['lastauthorcountry']
    
    print()
    print('After app conversion:')
    print(f'  zipcode: {zipcode} (type: {type(zipcode).__name__})')
    print(f'  country: {country}')
    
    # Try lookup
    key = f'{country}|{zipcode}'
    print()
    print(f'Looking up key: {key}')
    
    if key in db:
        entry = db[key]
        print(f'  FOUND in database')
        print(f'  City: {entry.get("city")}')
        print(f'  Coordinates: {entry.get("coordinates")}')
    else:
        print(f'  NOT FOUND in database')
        print(f'  Available keys starting with "{country}|":')
        for k in db.keys():
            if k.startswith(f'{country}|'):
                print(f'    {k}')
