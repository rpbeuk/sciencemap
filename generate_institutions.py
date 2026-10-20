import json

# Manual geocoding for key institutions
INSTITUTION_COORDINATES = {
    'Amsterdam': [52.3676, 4.9041],
    'Amsterdam (Vrije Universiteit Amsterdam)': [52.3340, 4.8681],
    'Utrecht': [52.0907, 5.1214],
    'Leiden': [52.1601, 4.4818],
    'Groningen': [53.2129, 6.5626],
    'Nijmegen': [51.8433, 5.8519],
    'Maastricht': [50.8503, 5.6880],
    'Bruxelles': [50.8503, 4.3517],
    'Leuven': [50.8798, 4.7005],
    'Ghent': [51.0537, 3.7159],
    'Breda': [51.5910, 4.7789],
    'Tilburg': [51.5603, 5.0919],
    'Eindhoven': [51.4416, 5.4697],
    'Namur': [50.4657, 4.8637],
    'Antwerp': [51.2194, 4.4025],
    'Mons': [50.4501, 3.9559],
    'Liege': [50.6326, 5.5673],
}

# Load matched publications
with open('matched_publications.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Add coordinates to matched publications
for pub in data['matched']:
    city = pub['city']
    # Try exact match first
    if city in INSTITUTION_COORDINATES:
        pub['coordinates'] = INSTITUTION_COORDINATES[city]
    else:
        # Try partial match
        found = False
        for key, coords in INSTITUTION_COORDINATES.items():
            if city.lower() in key.lower():
                pub['coordinates'] = coords
                found = True
                break
        if not found:
            # Default to Benelux center if not found
            pub['coordinates'] = [51.5, 4.75]

# Group by institution (account + city)
institutions_map = {}
for pub in data['matched']:
    key = f"{pub['account']}-{pub['city']}"
    if key not in institutions_map:
        institutions_map[key] = {
            'name': pub['account'],
            'city': pub['city'],
            'postal': pub['postal'],
            'country': pub['country'],
            'coordinates': pub.get('coordinates', [51.5, 4.75]),
            'publications': [],
        }
    institutions_map[key]['publications'].append(pub)

institutions = list(institutions_map.values())

print(f"Generated {len(institutions)} institutions from {len(data['matched'])} matched publications")
print("\nSample institutions:")
for inst in institutions[:10]:
    print(f"  {inst['name']} ({inst['city']}) - {len(inst['publications'])} publications")

# Save institution data
with open('institutions_data.json', 'w', encoding='utf-8') as f:
    json.dump(institutions, f, ensure_ascii=False, indent=2)

print("\nSaved to institutions_data.json")
