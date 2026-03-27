"""
Standalone README Comparator
=============================
This script fetches the README of a given npm package from unpkg.com
and uses Gemini to compare the documentation against the locally generated
source code in backend/codespace/<package_name>/ to verify if it fulfills
the described features.
"""

import sys
import os
import requests
from dotenv import load_dotenv
from google import genai

def compare_package_with_readme(package_name: str):
    load_dotenv()
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("❌ Error: GEMINI_API_KEY not found in environment")
        return

    # Fetch README
    readme_url = f"https://unpkg.com/{package_name}/README.md"
    print(f"📥 Fetching README from: {readme_url}")
    
    try:
        resp = requests.get(readme_url, timeout=15)
        if resp.status_code != 200:
            print(f"❌ Failed to fetch README (HTTP {resp.status_code})")
            return
        readme_content = resp.text
        print(f"✅ README fetched ({len(readme_content)} chars)")
    except Exception as e:
        print(f"❌ Error fetching README: {e}")
        return

    # Read generated files
    codespace_dir = os.path.join(os.path.dirname(__file__), "codespace", package_name)
    
    index_js_path = os.path.join(codespace_dir, "index.js")
    package_json_path = os.path.join(codespace_dir, "package.json")
    
    if not os.path.exists(index_js_path) or not os.path.exists(package_json_path):
        print(f"❌ Error: Generated files not found in {codespace_dir}")
        print("Make sure you have run the agent pipeline for this package first.")
        return

    try:
        with open(index_js_path, "r", encoding="utf-8") as f:
            index_js_content = f.read()
        with open(package_json_path, "r", encoding="utf-8") as f:
            package_json_content = f.read()
    except Exception as e:
        print(f"❌ Error reading local generated files: {e}")
        return

    # Call Gemini for comparison
    print(f"\n🤖 Analyzing implementation vs README using Gemini...")
    client = genai.Client(api_key=api_key)
    
    prompt = f"""
You are an expert software engineer reviewing a clean-room implementation of an npm package.
You will be given the original README documentation, and the generated clean room source code.

Your task is to analyze if the generated implementation functionally fulfills the behavior, API, and features described in the README.

**ORIGINAL README**:
{readme_content}

**GENERATED package.json**:
```json
{package_json_content}
```

**GENERATED index.js**:
```javascript
{index_js_content}
```

Please output a structured markdown assessment detailing:
1. **API Coverage**: Does the code export the expected functions/classes?
2. **Behavioral Correctness**: Does the logic seem to match the described behavior?
3. **Missing Features**: Identify any features from the README that are missing in the code.
4. **Final Conclusion**: Is this a good clean room implementation?
"""

    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
        )
        print("\n" + "="*60)
        print(f"📋 ANALYSIS REPORT FOR '{package_name}'")
        print("="*60)
        print(response.text)
        print("="*60)
    except Exception as e:
        print(f"❌ Error calling Gemini API: {e}")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python compare_readme.py <package_name>")
        sys.exit(1)
    
    pkg_name = sys.argv[1]
    compare_package_with_readme(pkg_name)
