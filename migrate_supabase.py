#!/usr/bin/env python3
"""
Script to add missing columns to Supabase publications table.
Uses Supabase REST API via curl to execute SQL.
"""
import subprocess
import json

url = "https://zwropbskjywvpzaqyrtd.supabase.co"
key = "sb_publishable_QliePmyF31f-uYMayncEig_tRAbWl7x"

# SQL to add missing columns
sql_commands = [
    "ALTER TABLE publications ADD COLUMN IF NOT EXISTS crm_level_1 TEXT;",
    "ALTER TABLE publications ADD COLUMN IF NOT EXISTS crm_level_3 TEXT;",
    "ALTER TABLE publications ADD COLUMN IF NOT EXISTS zipcode NUMERIC;",
    "ALTER TABLE publications ADD COLUMN IF NOT EXISTS territory TEXT;",
]

for sql in sql_commands:
    print(f"Executing: {sql}")
    
    # Use curl to execute via Supabase RPC
    cmd = [
        "curl",
        "-X", "POST",
        f"{url}/rest/v1/rpc/exec",
        "-H", f"Authorization: Bearer {key}",
        "-H", "Content-Type: application/json",
        "-d", json.dumps({"sql": sql})
    ]
    
    result = subprocess.run(cmd, capture_output=True, text=True)
    print(f"  Status: {result.returncode}")
    if result.stdout:
        print(f"  Response: {result.stdout[:200]}")
    if result.stderr:
        print(f"  Error: {result.stderr[:200]}")
    print()

print("Migration complete!")
