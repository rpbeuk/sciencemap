def infer_country_from_zipcode(zipcode_str):
    """Infer country from postal code ranges."""
    if not zipcode_str:
        return None
    
    try:
        zipcode = int(float(zipcode_str))
    except (ValueError, TypeError):
        return None
    
    # Belgium: 1000-9999 (4 digits)
    if 1000 <= zipcode <= 9999:
        return 'Belgium'
    
    # Netherlands: 1000-9900 (4 digits) - overlaps with Belgium!
    # Luxembourg: 1000-8999 (4 digits) - overlaps with Belgium too!
    # We need to use country hints or city to disambiguate
    
    # For now, rely on explicit rules:
    # Netherlands postal codes typically don't start with 9
    # Belgium postal codes go up to 9999
    # Luxembourg postal codes max out around 8999
    
    # This is ambiguous - we'll need to cross-reference with city
    return None

# Test ranges
test_cases = [
    ('1050', 'Belgium'),  # Brussels
    ('1105', 'the Netherlands'),  # Amsterdam  
    ('3000', 'Belgium'),  # Leuven
    ('3584', 'the Netherlands'),  # Utrecht
    ('4000', 'Belgium'),  # Liège
    ('6500', 'the Netherlands'),  # Nijmegen
    ('9000', 'Belgium'),  # Ghent
]

for zipcode, expected_country in test_cases:
    inferred = infer_country_from_zipcode(zipcode)
    print(f'{zipcode}: inferred={inferred}, expected={expected_country}')
