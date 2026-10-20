-- ScienceMap Benelux Database Schema
-- Run this in Supabase SQL Editor to set up the database

-- Publications table
CREATE TABLE publications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pmid INTEGER UNIQUE NOT NULL,
  doi TEXT,
  title TEXT NOT NULL,
  authors TEXT,
  year INTEGER,
  journal TEXT,
  summary TEXT,
  summaryMandM TEXT,
  sampleSpecies TEXT,
  sampleType TEXT,
  instrument TEXT,
  enzymes TEXT,
  lastAuthorCity TEXT,
  lastAuthorCountry TEXT,
  beneluxFlag BOOLEAN DEFAULT false,
  status TEXT,
  batchId UUID,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);

-- Publication batches table
CREATE TABLE publication_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batchName TEXT NOT NULL,
  uploadedAt TIMESTAMP DEFAULT NOW(),
  publicationCount INTEGER,
  createdBy TEXT
);

-- Create indexes for performance
CREATE INDEX idx_pmid ON publications(pmid);
CREATE INDEX idx_city ON publications(lastAuthorCity);
CREATE INDEX idx_country ON publications(lastAuthorCountry);
CREATE INDEX idx_batchId ON publications(batchId);

-- Enable Row Level Security (RLS) - Allow public read access for now
ALTER TABLE publications ENABLE ROW LEVEL SECURITY;
ALTER TABLE publication_batches ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
CREATE POLICY "Enable read access for all users" ON publications FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON publications FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable read access for all users" ON publication_batches FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON publication_batches FOR INSERT WITH CHECK (true);
