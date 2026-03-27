"""
Clean Room Engineering Agent Pipeline
======================================
Two-agent sequential pipeline for clean room engineering of npm packages.

Agent 1 (Analyst):     Reads package documentation → produces a code-free JSON spec.
Agent 2 (Clean Room):  Reads ONLY the spec → writes a fresh index.js implementation.

The agents communicate through session state using output_key.
The README content must be injected into state as 'readme_content' before running.
"""

from google.adk.agents.sequential_agent import SequentialAgent
from google.adk.agents.llm_agent import LlmAgent

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
MODEL = "gemini-2.5-flash"

# ---------------------------------------------------------------------------
# Agent 1 — The Analyst (Legal Firewall)
# ---------------------------------------------------------------------------
# This agent receives the raw README documentation of an npm package and
# produces a strict, functional JSON specification of the package's public API.
# It MUST NOT include, reproduce, or reference any source code.

analyst_agent = LlmAgent(
    name="AnalystAgent",
    model=MODEL,
    description=(
        "Analyzes npm package documentation and produces a code-free "
        "functional JSON specification of the package's API surface."
    ),
    instruction="""You are a **Legal Analyst** performing clean room analysis of a software package.

You are given the README / documentation of an npm package. Your job is to produce a **strict functional JSON specification** that describes the package's public API surface.

**README Documentation:**
{readme_content}

**Package name:**
{package_name}

---

## YOUR RULES (LEGALLY CRITICAL — VIOLATING THESE INVALIDATES THE CLEAN ROOM):

1. **NEVER** include, reproduce, quote, or paraphrase any source code from the documentation.
2. **NEVER** include code examples, code snippets, or implementation details you saw in the docs.
3. You may ONLY describe **what** each function/method does, NOT **how** it does it internally.
4. Focus on: function names, parameter names & types, return types, behavioral descriptions, edge cases, and error handling.

## OUTPUT FORMAT:

You MUST respond with ONLY raw JSON. Do NOT wrap it in ```json``` or any markdown fences. Do NOT add any text before or after the JSON. Start your response with { and end with }.

The JSON structure:

{
  "package_name": "<name>",
  "description": "<comprehensive description of what the package does and its primary purpose>",
  "api": [
    {
      "name": "<exported function/class/method name>",
      "type": "function | class | constant",
      "description": "<detailed description of WHAT it does — be very thorough so a developer who has never seen the docs can implement it>",
      "parameters": [
        {
          "name": "<param>",
          "type": "<expected type>",
          "required": true/false,
          "description": "<what this parameter represents and any constraints on valid values>"
        }
      ],
      "returns": {
        "type": "<return type>",
        "description": "<exactly what the return value represents, including edge case return values>"
      }
    }
  ],
  "notes": {
    "behavioral_requirements": [
      "<list every important behavioral rule — e.g. 'should accept string representations of numbers and coerce them', 'should return true for 0', etc.>"
    ],
    "edge_cases": [
      "<list every edge case you can identify — e.g. 'negative numbers', 'floating point numbers', 'NaN', 'Infinity', 'empty string', 'null/undefined', etc.>"
    ],
    "type_coercion": "<describe any implicit type coercion the package performs, e.g. 'accepts strings like \"4\" and treats them as numbers'>",
    "error_handling": "<describe what happens on invalid input — does it throw? return false? return undefined?>",
    "export_style": "<how the package exports its API — default export of a single function, named exports, class constructor, etc.>",
    "constraints": [
      "<any other constraints — e.g. 'must be zero-dependency', 'must work in Node.js and browser', 'must handle BigInt', etc.>"
    ]
  }
}

CRITICAL: The "notes" section is THE MOST IMPORTANT part of your output. A second engineer who has NEVER seen the documentation will use ONLY your JSON spec to write a new implementation. If your notes are vague or incomplete, the implementation will be wrong. Be exhaustive. List EVERY edge case, EVERY behavioral quirk, EVERY type coercion rule you can extract from the docs.

If the package exports a single default function, still wrap it in the api array.
If documentation is sparse, infer reasonable types and behaviors from context and common JavaScript conventions.

REMINDER: Output ONLY the raw JSON object. No ```json fences. No markdown. Start with { end with }.
""",
    output_key="functional_spec",
)

# ---------------------------------------------------------------------------
# Agent 2 — The Clean Room Coder
# ---------------------------------------------------------------------------
# This agent receives ONLY the functional JSON specification produced by
# Agent 1. It has NEVER seen the original documentation or source code.
# It writes a completely new implementation from scratch.

coder_agent = LlmAgent(
    name="CleanRoomCoderAgent",
    model=MODEL,
    description=(
        "Writes a brand-new, functionally equivalent npm package implementation "
        "from scratch using only a functional JSON specification."
    ),
    instruction="""You are a **Clean Room Software Engineer**. You are participating in a legally compliant clean room engineering process.

You have **NEVER** seen the original source code or documentation of the package. You are given ONLY a functional JSON specification that describes what the package should do.

**Functional Specification:**
{functional_spec}

---

## YOUR TASK:

1. Write a **completely new, original** `index.js` file that implements ALL the functions/classes described in the specification.
2. Write your own logic from scratch. Do NOT attempt to replicate or guess the original implementation.
3. Use clear, well-commented, production-quality JavaScript (CommonJS `module.exports`).
4. Handle edge cases and errors as described in the specification.
5. Also produce a minimal `package.json` for this new package.

## OUTPUT FORMAT:

You MUST respond with ONLY raw JSON. Do NOT wrap it in ```json``` or any markdown fences. Do NOT add any text before or after the JSON. Start your response with { and end with }.

The JSON structure:

{
  "index_js": "<the complete contents of index.js as a string>",
  "package_json": {
    "name": "liberated-<package_name>",
    "version": "1.0.0",
    "description": "Clean room implementation of <package_name>",
    "main": "index.js",
    "license": "Proprietary",
    "author": "Clean Room Engineer (AI)",
    "keywords": []
  }
}

IMPORTANT:
- The `index_js` value must be a properly escaped JSON string containing the full source code.
- The implementation must be YOUR OWN original work — this is a legal requirement.
- Use CommonJS (require/module.exports), not ES modules.
- Do not add any dependencies — the implementation must be zero-dependency.

REMINDER: Output ONLY the raw JSON object. No ```json fences. No markdown. Start with { end with }.
""",
    output_key="clean_room_output",
)

# ---------------------------------------------------------------------------
# Sequential Pipeline
# ---------------------------------------------------------------------------
# Runs Agent 1 (Analyst) → Agent 2 (Coder) in strict order.
# They share session state: Agent 1 writes 'functional_spec', Agent 2 reads it.

clean_room_pipeline = SequentialAgent(
    name="CleanRoomPipeline",
    sub_agents=[analyst_agent, coder_agent],
    description=(
        "Orchestrates the clean room engineering pipeline: "
        "analysis → specification → implementation."
    ),
)

# ADK expects a root_agent export
root_agent = clean_room_pipeline
