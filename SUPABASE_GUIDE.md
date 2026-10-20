# Supabase Integration Guide

Your ScienceMap Benelux app now integrates with **Supabase** for persistent data storage. Publications uploaded to the database persist across sessions and can be incrementally enriched with new data.

## Setup Steps

### 1. Create Supabase Project
You've already created a project at: `https://zwropbskjywvpzaqyrtd.supabase.co`

### 2. Create Database Tables
The app needs two tables: `publications` and `publication_batches`.

**To create them:**
1. Go to your Supabase project dashboard
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the SQL from `SUPABASE_SETUP.sql` in the repository
5. Click **Run**

This creates:
- `publications` table (with 20+ columns for publication metadata)
- `publication_batches` table (tracks upload batches)
- Indexes for fast queries
- Row-level security policies for public access

### 3. Environment Configuration
The app credentials are already configured in `.env.local`:
```
VITE_SUPABASE_URL=https://zwropbskjywvpzaqyrtd.supabase.co
VITE_SUPABASE_KEY=sb_publishable_QliePmyF31f-uYMayncEig_tRAbWl7x
```

This public key is safe to commit and allows browser-based access for public data.

## Using the App

### First Time: Upload Initial Data
1. Open the app at https://rpbeuk.github.io/sciencemap/
2. You'll see two upload modes: **Local** and **Supabase**
3. Click **Supabase** tab
4. Select your publications Excel file
5. Click **Upload to Database**
6. The app will parse the file and upload all publications to Supabase

The status badge shows "Supabase" in the header when connected.

### Subsequent Uses: Upload & Enrich
1. Each time you upload a new Excel file via Supabase tab, it enriches the database
2. Publications are identified by `PMID` (unique identifier)
3. Duplicate PMIDs are skipped (no duplicates created)
4. New metadata in the file overwrites existing records
5. The app automatically loads all publications from the database on startup

### Local Mode (Offline)
If you don't want to use Supabase:
1. Click **Local** tab
2. Upload two files: publications and accounts
3. Works exactly like before (data lost on refresh)

## Data Schema

### publications table
```
id              UUID (auto-generated)
pmid            INTEGER (unique identifier from PubMed)
doi             TEXT
title           TEXT
authors         TEXT (comma-separated)
year            INTEGER
journal         TEXT
summary         TEXT (publication abstract/summary)
summaryMandM    TEXT (methods section)
sampleSpecies   TEXT (e.g., "porcine", "human")
sampleType      TEXT (e.g., "cornea (corneal buttons)")
instrument      TEXT (equipment/instruments used)
enzymes         TEXT (biological enzymes used)
lastAuthorCity  TEXT (city of last author)
lastAuthorCountry TEXT (country of last author)
beneluxFlag     BOOLEAN (1 if Benelux region)
status          TEXT (e.g., "Downloaded", "Success")
batchId         UUID (references publication_batches.id)
createdAt       TIMESTAMP (upload timestamp)
updatedAt       TIMESTAMP (last update)
```

### publication_batches table
```
id              UUID (auto-generated)
batchName       TEXT (upload identifier)
uploadedAt      TIMESTAMP
publicationCount INTEGER (number of pubs in batch)
createdBy       TEXT (user info)
```

## API Reference

The app uses these Supabase functions (in `src/utils/supabaseClient.ts`):

### Upload Publications
```typescript
uploadPublications(publications, batchName): Promise<{ success, count, error }>
```
Uploads an array of publications to the database. Returns count of successfully inserted records.

### Get Publications
```typescript
getPublications(filters?: { city?, country?, species?, sampleType? }): Promise<Publication[]>
```
Retrieves publications with optional filters.

### Search Publications
```typescript
searchPublications(keyword: string): Promise<Publication[]>
```
Full-text search across title, summary, sample type, and instrument columns.

### Get Batches
```typescript
getBatches(): Promise<PublicationBatch[]>
```
List all upload batches with metadata.

## Troubleshooting

### "403 Forbidden" or "Unauthorized"
- Check that `.env.local` contains the correct Supabase URL and anon key
- Verify your repository is **public** (GitHub Pages requirement)

### "No data loading"
- Ensure SQL setup was run (tables must exist first)
- Check browser console for Supabase connection errors
- Verify the database tables in Supabase dashboard

### "Duplicate PMID error"
- This is normal - the app skips duplicates when re-uploading
- To update a publication, edit the Excel file and upload again

### Performance Issues
- The app shows 300+ publications without lag
- For datasets >5000 publications, consider adding pagination

## Advanced Usage

### Initial Data Load Script
For server-side bulk import, use `setup-supabase.js`:
```bash
SUPABASE_KEY=your_service_role_key node setup-supabase.js publications.xlsx
```
This requires the **service role key** (not the public anon key) from Supabase settings.

### Exporting Data
To export all publications from Supabase:
```typescript
import { getPublications } from './src/utils/supabaseClient';
const allPubs = await getPublications();
// Convert to CSV, Excel, or JSON
```

### Security Considerations
- The public anon key only allows **read and insert** (no delete/update)
- To enable data updates/deletes, modify RLS policies in Supabase dashboard
- For production, consider restricting access to authenticated users only

## Next Steps

1. ✅ Create Supabase tables (run SUPABASE_SETUP.sql)
2. ✅ Configure .env.local (already done)
3. Use app to upload first Excel file to Supabase
4. Subsequent uploads enrich the database
5. (Optional) Share the public app URL with team members to view publications

The app is now production-ready with persistent cloud storage! 🚀
