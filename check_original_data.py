import json

# Load the enriched publications - this should have the original data
with open('public/enriched_publications.json', encoding='utf-8') as f:
    pubs = json.load(f)

# Check specific examples
print("Sample publications with their country and zipcode:")
print()

# Brussels examples
brussels_pubs = [p for p in pubs if (p.get('lastauthorcity') or '').lower() == 'brussels']
print(f"Brussels publications (total: {len(brussels_pubs)}):")
for p in brussels_pubs[:3]:
    print(f"  PMID {p['pmid']}: zipcode={p.get('zipcode')}, country={p.get('lastauthorcountry')}")

print()

# Amsterdam examples  
amsterdam_pubs = [p for p in pubs if (p.get('lastauthorcity') or '').lower() == 'amsterdam']
print(f"Amsterdam publications (total: {len(amsterdam_pubs)}):")
for p in amsterdam_pubs[:3]:
    print(f"  PMID {p['pmid']}: zipcode={p.get('zipcode')}, country={p.get('lastauthorcountry')}")

print()

# Check for any with Belgium but high zipcodes
print("Publications with Belgium but zipcode 1105 (Amsterdam area):")
belgium_1105 = [p for p in pubs if p.get('lastauthorcountry') == 'Belgium' and str(int(float(p.get('zipcode') or 0))) == '1105']
print(f"  Count: {len(belgium_1105)}")

print()
print("Publications with Netherlands but zipcode 1050 (Brussels area):")
nl_1050 = [p for p in pubs if p.get('lastauthorcountry') == 'the Netherlands' and str(int(float(p.get('zipcode') or 0))) == '1050']
print(f"  Count: {len(nl_1050)}")
