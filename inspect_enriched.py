import pandas as pd

file_path = r"C:\Users\beukw\.copilot\workspaces\2b87db60-bef7-453e-aa90-2c991a72847e\attachments\c6b2ad80-9cf8-43cf-bd4e-787394020e43-tissuedigest_chapter3_pdfonly_agent_output_CRM_enriched.xlsx"
df = pd.read_excel(file_path)

print("Columns containing 'zip' or 'terr':", [c for c in df.columns if 'zip' in c.lower() or 'terr' in c.lower()])

print("\nSample data:")
cols_to_show = ['pmid', 'title', 'CRM full name 1', 'CRM full name 3', 'Zipcode', 'Territory', 'Last author city']
for col in cols_to_show:
    if col in df.columns:
        print(f"  {col}: OK")
print()

sample = df[cols_to_show].head(5)
print(sample.to_string())

print("\n\nZipcode stats:")
print(f"  Non-null: {df['Zipcode'].notna().sum()}/{len(df)}")
print(f"  Unique: {df['Zipcode'].nunique()}")
print(f"  Sample values: {df['Zipcode'].dropna().unique()[:10]}")

print("\nTerritory stats:")
print(f"  Non-null: {df['Territory'].notna().sum()}/{len(df)}")
print(f"  Unique: {df['Territory'].nunique()}")
print(f"  Sample values: {df['Territory'].dropna().unique()[:10]}")
