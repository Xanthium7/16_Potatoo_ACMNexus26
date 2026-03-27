"""
Test Runner for Clean Room Engineering Pipeline
=================================================
Usage:
    1. Set your Gemini API key in backend/.env
    2. Run: python test_pipeline.py <package_name>
    
    Example: python test_pipeline.py is-odd
"""

import asyncio
import json
import re
import sys
import os

import requests
from dotenv import load_dotenv

# Load API key from .env
load_dotenv()

from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types

# Import our agent pipeline
from clean_room_agent.agent import root_agent


def strip_markdown_fences(text: str) -> str:
    """Strip markdown code fences (```json ... ```) from LLM output."""
    text = text.strip()
    # Remove ```json ... ``` or ``` ... ```
    pattern = r'^```(?:json)?\s*\n?(.*?)\n?```$'
    match = re.match(pattern, text, re.DOTALL)
    if match:
        return match.group(1).strip()
    return text


async def run_pipeline(package_name: str):
    """Fetch README from unpkg and run the clean room pipeline."""

    # --- Step 1: Fetch README from unpkg.com ---
    url = f"https://unpkg.com/{package_name}/README.md"
    print(f"\n📥 Fetching README from: {url}")

    resp = requests.get(url, timeout=15)
    if resp.status_code != 200:
        print(f"❌ Failed to fetch README (HTTP {resp.status_code})")
        print(f"   URL: {url}")
        sys.exit(1)

    readme_content = resp.text
    print(f"✅ README fetched ({len(readme_content)} chars)")

    # --- Step 2: Set up ADK session with state ---
    session_service = InMemorySessionService()
    session = await session_service.create_session(
        app_name="clean_room_app",
        user_id="test_user",
        state={
            "readme_content": readme_content,
            "package_name": package_name,
        },
    )

    # --- Step 3: Run the pipeline ---
    runner = Runner(
        agent=root_agent,
        app_name="clean_room_app",
        session_service=session_service,
    )

    print(f"\n🔬 Running clean room pipeline for '{package_name}'...")
    print("   Agent 1 (Analyst) is analyzing documentation...")

    user_message = types.Content(
        role="user",
        parts=[types.Part.from_text(
            text=f"Analyze the npm package '{package_name}' and produce a clean room implementation."
        )],
    )

    final_response = None
    async for event in runner.run_async(
        user_id="test_user",
        session_id=session.id,
        new_message=user_message,
    ):
        if event.is_final_response() and event.content and event.content.parts:
            final_response = event.content.parts[0].text

    # --- Step 4: Extract results from session state ---
    result_session = await session_service.get_session(
        app_name="clean_room_app",
        user_id="test_user",
        session_id=session.id,
    )

    functional_spec = result_session.state.get("functional_spec", "NOT FOUND")
    clean_room_output = result_session.state.get("clean_room_output", "NOT FOUND")

    # --- Step 5: Display results ---
    print("\n" + "=" * 60)
    print("📋 AGENT 1 OUTPUT — Functional Specification")
    print("=" * 60)
    print(functional_spec)

    print("\n" + "=" * 60)
    print("🔨 AGENT 2 OUTPUT — Clean Room Implementation")
    print("=" * 60)
    print(clean_room_output)

    # --- Step 6: Try to parse and save files to codespace/<package_name>/ ---
    try:
        cleaned_output = strip_markdown_fences(clean_room_output)
        output = json.loads(cleaned_output)
        codespace_dir = os.path.join(os.path.dirname(__file__), "codespace", package_name)
        os.makedirs(codespace_dir, exist_ok=True)

        with open(os.path.join(codespace_dir, "index.js"), "w", encoding="utf-8") as f:
            f.write(output["index_js"])

        with open(os.path.join(codespace_dir, "package.json"), "w", encoding="utf-8") as f:
            json.dump(output["package_json"], f, indent=2)

        print(f"\n✅ Files saved to codespace/{package_name}/")
        print(f"   - codespace/{package_name}/index.js")
        print(f"   - codespace/{package_name}/package.json")
    except (json.JSONDecodeError, KeyError) as e:
        print(f"\n⚠️  Could not parse Agent 2 output as JSON: {e}")
        print("   Raw output saved above — you may need to extract code manually.")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python test_pipeline.py <package_name>")
        print("Example: python test_pipeline.py is-odd")
        sys.exit(1)

    package_name = sys.argv[1]
    asyncio.run(run_pipeline(package_name))
