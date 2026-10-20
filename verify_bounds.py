import json

# Define precise country bounds
BOUNDS = {
    'Belgium': {'lat': [49.5, 51.5], 'lon': [2.3, 6.0]},
    'Luxembourg': {'lat': [49.4, 50.2], 'lon': [5.7, 6.6]},
    'the Netherlands': {'lat': [50.75, 53.5], 'lon': [3.3, 7.3]},
}

test_coords = {
    ('Luxembourg|1210', 'Strassen'): [49.6463, 6.1287],
    ('Belgium|6041', 'Gosselies'): [50.9, 5.8667],
    ('the Netherlands|2628', 'Delft'): [51.1417, 4.4583],
    ('the Netherlands|9747', 'Groningen'): [51.0144, 4.0833],  # WRONG
    ('the Netherlands|9712', 'Groningen'): [53.2145, 6.5597],  # CORRECT
}

print('Verifying coordinates against country bounds:')
print()

for (key, city), coords in test_coords.items():
    country = key.split('|')[0]
    lat, lon = coords
    bounds = BOUNDS[country]
    
    in_bounds = bounds['lat'][0] <= lat <= bounds['lat'][1] and bounds['lon'][0] <= lon <= bounds['lon'][1]
    status = 'OK' if in_bounds else 'WRONG'
    
    print(f'{key} ({city}):')
    print(f'  Coords: [{lat}, {lon}]')
    print(f'  {country} bounds: lat {bounds["lat"]}, lon {bounds["lon"]}')
    print(f'  Status: {status}')
    print()
