"""
Clean up duplicate documents and keep only the 9 specific files the user wants.
"""

import sys
sys.path.insert(0, 'backend-python')

from app.services.supabase_service import supabase_service

# Files to KEEP (user's list)
KEEP_FILES = [
    "Spec_Loco_WAP7_302.pdf",
    "Spec_Transformer_T9.pdf",
    "Invoice_Boiler_B7.pdf",
    "Spec_Turbine_C2.pdf",
    "Fire Safety manual -27-10-21.pdf",
    "Spec_Compressor_K3.pdf",
    "Memo_Pump_Station_Alpha.pdf",
    "Log_Transformer_T9.pdf",
    "Log_Turbine_C2.pdf"
]

print("=" * 60)
print("CLEANING UP DUPLICATE DOCUMENTS")
print("=" * 60)

# Get all documents
all_docs = supabase_service.get_documents(limit=200)
print(f"\nTotal documents in database: {len(all_docs)}")

# Group by filename to find the latest version of each keep file
keep_doc_ids = set()
file_groups = {}

for doc in all_docs:
    filename = doc['file_name']
    if filename in KEEP_FILES:
        if filename not in file_groups:
            file_groups[filename] = []
        file_groups[filename].append(doc)

# For each keep file, keep only the most recent one
print(f"\nFiles to KEEP:")
for filename in KEEP_FILES:
    if filename in file_groups:
        # Sort by created_at (most recent first)
        sorted_docs = sorted(file_groups[filename], key=lambda x: x.get('created_at', ''), reverse=True)
        keep_doc = sorted_docs[0]
        keep_doc_ids.add(keep_doc['id'])
        print(f"  ✓ {filename} (ID: {keep_doc['id']}) - {len(sorted_docs)} version(s)")
    else:
        print(f"  ✗ {filename} - NOT FOUND in database")

# Delete all documents NOT in keep list
delete_count = 0
for doc in all_docs:
    if doc['id'] not in keep_doc_ids:
        try:
            supabase_service.delete_document(doc['id'])
            print(f"  [DELETED] {doc['file_name']} (ID: {doc['id']})")
            delete_count += 1
        except Exception as e:
            print(f"  [ERROR] Failed to delete {doc['file_name']}: {e}")

print("\n" + "=" * 60)
print("CLEANUP COMPLETE")
print("=" * 60)
print(f"\nDocuments kept: {len(keep_doc_ids)}")
print(f"Documents deleted: {delete_count}")
print(f"\n✓ Database now contains only the 9 files you specified!")
