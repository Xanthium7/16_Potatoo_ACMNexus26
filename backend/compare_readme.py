"""
Standalone Code Comparator using Levenshtein Distance
=====================================================
This script fetches the actual source code of a given npm package from unpkg.com
and compares it against the locally generated source code in backend/codespace/<package_name>/
using the Levenshtein distance algorithm to measure similarity.
"""

import sys
import os
import requests

def levenshtein_distance(s1: str, s2: str) -> int:
    """
    Computes the Levenshtein edit distance between two strings using dynamic programming.
    This calculates the minimum number of single-character edits (insertions, deletions, or substitutions)
    required to change s1 into s2.
    """
    if len(s1) < len(s2):
        return levenshtein_distance(s2, s1)

    if len(s2) == 0:
        return len(s1)

    previous_row = range(len(s2) + 1)
    for i, c1 in enumerate(s1):
        current_row = [i + 1]
        for j, c2 in enumerate(s2):
            insertions = previous_row[j + 1] + 1
            deletions = current_row[j] + 1
            substitutions = previous_row[j] + (c1 != c2)
            current_row.append(min(insertions, deletions, substitutions))
        previous_row = current_row
    
    return previous_row[-1]

def compare_package_code(package_name: str):
    # Fetch real code - unpkg automatically redirects to the 'main' file defined in package.json
    real_code_url = f"https://unpkg.com/{package_name}"
    print(f"📥 Fetching real source code from: {real_code_url}")
    
    try:
        resp = requests.get(real_code_url, timeout=15)
        if resp.status_code != 200:
            print(f"❌ Failed to fetch real code (HTTP {resp.status_code}).")
            return
        real_code = resp.text
        print(f"✅ Real code fetched ({len(real_code)} chars)")
    except Exception as e:
        print(f"❌ Error fetching real code: {e}")
        return

    # Read locally generated Clean-Room code
    codespace_dir = os.path.join(os.path.dirname(__file__), "codespace", package_name)
    index_js_path = os.path.join(codespace_dir, "index.js")
    
    if not os.path.exists(index_js_path):
        print(f"❌ Error: Generated index.js not found in {codespace_dir}")
        print("Make sure you have run the agent pipeline for this package first.")
        return

    try:
        with open(index_js_path, "r", encoding="utf-8") as f:
            generated_code = f.read()
    except Exception as e:
        print(f"❌ Error reading local generated code: {e}")
        return

    # Compare using Levenshtein distance
    print(f"\n🧠 Calculating Levenshtein distance... (This may take a few seconds for large files)")
    distance = levenshtein_distance(real_code, generated_code)
    max_len = max(len(real_code), len(generated_code))
    
    if max_len == 0:
        similarity = 100.0
    else:
        # Calculate a rough percentage of similarity based on the distance
        similarity = ((max_len - distance) / max_len) * 100
        # If distance > max_len (theoretically impossible here but good for bounds), cap at 0
        similarity = max(0, similarity)

    print("\n" + "="*60)
    print(f"📊 LEVENSHTEIN COMPARISON REPORT FOR '{package_name}'")
    print("="*60)
    print(f"Real Code Size:      {len(real_code)} characters")
    print(f"Generated Code Size: {len(generated_code)} characters")
    print(f"Levenshtein Distance: {distance} edits needed")
    print(f"Similarity Score:    {similarity:.2f}%")
    print("="*60)

    # Output interpretations
    if similarity > 80:
        print("🟢 Output: HIGH SIMILARITY")
        print("   -> The generated code is extremely close to the original source code. Edits are likely minor format changes.")
    elif similarity > 40:
        print("🟡 Output: MODERATE SIMILARITY")
        print("   -> The generated code shares structural or naming similarities but differs somewhat in logic or boilerplate.")
    else:
        print("🔴 Output: LOW SIMILARITY / TRUE CLEAN ROOM")
        print("   -> The generated code is drastically different from the original.")
        print("   -> This is actually EXPECTED and GOOD for clean-room engineering, proving it's an original implementation!")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python compare_readme.py <package_name>")
        sys.exit(1)
    
    pkg_name = sys.argv[1]
    compare_package_code(pkg_name)
