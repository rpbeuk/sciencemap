import XLSX from 'xlsx';

export interface Account {
  account: string;
  postalCode: string;
  city: string;
  country: string;
  fullName: string;
}

let accountsCache: Account[] | null = null;

export async function loadAccountsData(): Promise<Account[]> {
  if (accountsCache) {
    return accountsCache;
  }

  try {
    const response = await fetch('/sciencemap/accounts19102026.xlsx');
    const arrayBuffer = await response.arrayBuffer();
    const wb = XLSX.read(arrayBuffer, { type: 'array' });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(ws);

    accountsCache = data.map((row: any) => ({
      account: String(row.Account || '').toLowerCase(),
      postalCode: row['Postal Code'] || '',
      city: row.City || '',
      country: row.Country || '',
      fullName: row['Full Name 1'] || row.Account || '',
    }));

    return accountsCache;
  } catch (err) {
    console.error('Error loading accounts data:', err);
    return [];
  }
}

export async function getLocationByAccount(accountName: string): Promise<Account | null> {
  const accounts = await loadAccountsData();
  const normalizedName = accountName.toLowerCase();
  
  // Try exact match first
  let match = accounts.find((acc) => acc.account === normalizedName);
  
  // If no exact match, try partial match
  if (!match) {
    match = accounts.find((acc) => acc.account.includes(normalizedName) || normalizedName.includes(acc.account));
  }
  
  return match || null;
}

export async function getLocationByCity(city: string): Promise<Account | null> {
  const accounts = await loadAccountsData();
  return accounts.find((acc) => acc.city.toLowerCase() === city.toLowerCase()) || null;
}
