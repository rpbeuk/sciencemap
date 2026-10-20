import openpyxl
import json
import sys
sys.stdout.reconfigure(encoding='utf-8')

# Load the accounts file with zipcodes
accounts_file = r'C:\Users\beukw\copilot-worktrees\sciencemap\rpbeuk-cautious-umbrella\public\accounts19102026.xlsx'
wb = openpyxl.load_workbook(accounts_file)
ws = wb.active

# Extract columns
cols = [cell.value for cell in ws[1]]
account_idx = cols.index('Account')
postal_idx = cols.index('Postal Code')
city_idx = cols.index('City')
country_idx = cols.index('Country')

print("Loading accounts data...")
accounts_map = {}  # Map by account name -> {city, postal, country, coordinates}

for row in ws.iter_rows(min_row=2, values_only=True):
    account = row[account_idx]
    postal = row[postal_idx]
    city = row[city_idx]
    country = row[country_idx]
    
    if account and city:
        # Normalize postal code
        postal_str = str(postal).strip() if postal else ''
        
        accounts_map[account] = {
            'account': account,
            'city': city,
            'postal': postal_str,
            'country': country,
        }

print(f"Loaded {len(accounts_map)} accounts")

# Load CRM mappings
crm_file = r'C:\Users\beukw\copilot-worktrees\sciencemap\rpbeuk-cautious-umbrella\public\crm_mappings.json'
with open(crm_file, 'r', encoding='utf-8') as f:
    crm_mappings = json.load(f)

# Extract CRM Level 1 mappings from the original Excel
excel_file = r'C:\Users\beukw\.copilot\workspaces\2b87db60-bef7-453e-aa90-2c991a72847e\attachments\5bd62016-80c7-491e-8173-f5cbc6a99af6-tissuedigest_CRM_with_full_names.xlsx'
wb2 = openpyxl.load_workbook(excel_file)
ws2 = wb2['Sheet1']

cols2 = [cell.value for cell in ws2[1]]
pmid_idx = cols2.index('pmid')
crm_1_idx = cols2.index('CRM full name 1')
postal_idx_sheet = cols2.index('Last author city')  # Use city from publication

# Create mapping of PMID -> CRM Level 1
pmid_to_crm1 = {}
for row in ws2.iter_rows(min_row=2, values_only=True):
    pmid = row[pmid_idx]
    crm1 = row[crm_1_idx]
    if pmid and isinstance(pmid, int) and crm1:
        pmid_to_crm1[pmid] = crm1

print(f"Loaded {len(pmid_to_crm1)} CRM Level 1 mappings")

# Now match publications to accounts
matched_publications = []
unmatched = []

for mapping in crm_mappings:
    pmid = mapping['pmid']
    crm_level_1 = pmid_to_crm1.get(pmid, mapping.get('crm_level_1', ''))
    crm_level_3 = mapping['crm_level_3']
    
    if crm_level_1 and crm_level_1 != 'Unknown / unmatched account':
        # Try to find matching account
        matching_account = None
        
        # Exact match first
        if crm_level_1 in accounts_map:
            matching_account = accounts_map[crm_level_1]
        else:
            # Try fuzzy match - look for partial matches
            for acc_name, acc_data in accounts_map.items():
                if crm_level_1.lower() in acc_name.lower() or acc_name.lower() in crm_level_1.lower():
                    matching_account = acc_data
                    break
        
        if matching_account:
            matched_publications.append({
                'pmid': pmid,
                'crm_level_1': crm_level_1,
                'crm_level_3': crm_level_3,
                'account': matching_account['account'],
                'city': matching_account['city'],
                'postal': matching_account['postal'],
                'country': matching_account['country'],
            })
        else:
            unmatched.append({
                'pmid': pmid,
                'crm_level_1': crm_level_1,
                'crm_level_3': crm_level_3,
                'reason': 'Account not found in accounts file',
            })
    else:
        unmatched.append({
            'pmid': pmid,
            'crm_level_1': crm_level_1 or 'Unknown',
            'crm_level_3': crm_level_3,
            'reason': 'No CRM Level 1 account',
        })

print(f"\n✓ Matched: {len(matched_publications)} publications")
print(f"✗ Unmatched: {len(unmatched)} publications")

# Show sample matches
print("\nSample matched publications:")
for pub in matched_publications[:10]:
    print(f"  PMID {pub['pmid']}: {pub['account']} ({pub['city']}) -> {pub['crm_level_3']}")

# Save matched publications
with open('matched_publications.json', 'w', encoding='utf-8') as f:
    json.dump({
        'matched': matched_publications,
        'unmatched': unmatched,
        'stats': {
            'total': len(crm_mappings),
            'matched': len(matched_publications),
            'unmatched': len(unmatched),
        }
    }, f, ensure_ascii=False, indent=2)

print("\nSaved to matched_publications.json")
