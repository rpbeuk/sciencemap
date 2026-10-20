import * as XLSX from 'xlsx';
import type { Publication, Institution } from '../context/DataContext';

// Benelux city coordinates (university medical centers and major cities)
const cityCoordinates: Record<string, [number, number]> = {
  'Leiden': [52.1601, 4.4774],
  'Enschede': [52.2215, 6.8937],
  'Zoersel': [51.2500, 4.9000],
  'Tilburg': [51.5581, 5.0833],
  'Zwijnaarde': [50.8667, 3.8000],
  'Amsterdam': [52.3676, 4.9041],
  'Rotterdam': [51.9225, 4.4792],
  'Groningen': [53.2166, 6.5667],
  'Utrecht': [52.0907, 5.1214],
  'Maastricht': [50.8514, 5.6910],
  'Brussels': [50.8503, 4.3517],
  'Antwerp': [51.2194, 4.4025],
  'Ghent': [51.0536, 3.7196],
  'Liège': [50.6365, 5.5681],
  'Luxembourg City': [49.6116, 6.1319],
};

export interface RawPublication {
  pmid: string | number;
  title: string;
  authors: string;
  'Last Author': string;
  year: number;
  journal: string;
  summary?: string;
  'Last author city': string;
  'Last author institute': string;
  'Last author country': string;
  'sample type'?: string;
  'enzymes'?: string;
  'instrument'?: string;
  'miltenyi product'?: string;
}

export interface RawAccount {
  Account: string;
  'Postal Code': string;
  City: string;
  Country: string;
}

export const loadExcelData = async (
  publicationFile: File,
  accountsFile: File
): Promise<{ publications: Publication[]; institutions: Institution[] }> => {
  try {
    const pubBuffer = await publicationFile.arrayBuffer();
    const accountsBuffer = await accountsFile.arrayBuffer();

    const pubWorkbook = XLSX.read(pubBuffer);
    const accountsWorkbook = XLSX.read(accountsBuffer);

    const pubData = XLSX.utils.sheet_to_json<RawPublication>(
      pubWorkbook.Sheets[pubWorkbook.SheetNames[0]]
    );
    const accountsData = XLSX.utils.sheet_to_json<RawAccount>(
      accountsWorkbook.Sheets[accountsWorkbook.SheetNames[0]]
    );

    // Process publications
    const publications = pubData
      .filter((pub) => pub.pmid && pub.title && pub['Last author city'])
      .map((pub) => ({
        pmid: Number(pub.pmid),
        title: pub.title || '',
        authors: pub.authors || '',
        lastAuthor: pub['Last Author'] || '',
        year: pub.year || new Date().getFullYear(),
        journal: pub.journal || '',
        summary: pub.summary || '',
        city: pub['Last author city'] || '',
        institute: pub['Last author institute'] || '',
        country: pub['Last author country'] || '',
        sampleType: pub['sample type'] || '',
        enzymes: pub.enzymes || '',
        instrument: pub.instrument || '',
        miltenyiProduct: pub['miltenyi product'] || '',
      }));

    // Process institutions from accounts data and publications
    const institutionMap = new Map<string, Institution>();

    // Add institutions from publications
    publications.forEach((pub) => {
      const key = `${pub.institute}-${pub.city}`;
      if (!institutionMap.has(key)) {
        const coords = cityCoordinates[pub.city] || [50.5, 4.5];
        institutionMap.set(key, {
          name: pub.institute,
          city: pub.city,
          postalCode: '',
          country: pub.country,
          coordinates: coords,
          publications: [],
        });
      }
      institutionMap.get(key)!.publications.push(pub);
    });

    // Enrich with accounts data (postal codes)
    accountsData.forEach((acc) => {
      const city = acc.City || '';
      const country = acc.Country || '';
      const coords = cityCoordinates[city] || [50.5, 4.5];

      const key = `${acc.Account}-${city}`;
      if (!institutionMap.has(key)) {
        institutionMap.set(key, {
          name: acc.Account,
          city: city,
          postalCode: acc['Postal Code'] || '',
          country: country,
          coordinates: coords,
          publications: [],
        });
      }
    });

    const institutions = Array.from(institutionMap.values());

    return { publications, institutions };
  } catch (error) {
    console.error('Error loading Excel data:', error);
    throw error;
  }
};

export const getCountryColor = (country: string): string => {
  const colors: Record<string, string> = {
    NL: 'bg-blue-500',
    BE: 'bg-yellow-500',
    LU: 'bg-green-500',
  };
  return colors[country] || 'bg-gray-500';
};

export const filterPublicationsByKeyword = (
  publications: Publication[],
  keyword: string
): Publication[] => {
  const lower = keyword.toLowerCase();
  return publications.filter(
    (pub) =>
      pub.title.toLowerCase().includes(lower) ||
      pub.summary.toLowerCase().includes(lower) ||
      (pub.sampleType?.toLowerCase().includes(lower) ?? false) ||
      (pub.enzymes?.toLowerCase().includes(lower) ?? false) ||
      (pub.instrument?.toLowerCase().includes(lower) ?? false)
  );
};
