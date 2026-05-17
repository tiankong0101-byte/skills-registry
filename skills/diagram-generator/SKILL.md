---
name: diagram-generator
description: |
  Generate diagrams, charts and visual representations from text descriptions.
metadata:
  openclaw:
    emoji: 📊
  security:
    allowed_domains: []
---

# diagram-generator

Specialized skill for converting textual descriptions into visual diagrams, charts, and architectural representations. Use when the user needs system architecture diagrams, flowcharts, sequence diagrams, mind maps, or data visualizations.

## Trigger Conditions

- User asks for an architecture diagram, system design visualization, or network topology
- User requests a flowchart, process diagram, or decision tree
- User needs sequence diagrams, UML diagrams, or ER diagrams
- User wants data visualized as charts (bar, line, pie, etc.) or mind maps

## Usage

1. **Identify Diagram Type** — Determine the appropriate diagram type based on the user's needs:
   - Flowcharts → process flows, workflows, decision trees
   - Sequence diagrams → interaction flows, API calls, message passing
   - Architecture diagrams → system components, service relationships
   - Mind maps → brainstorming, topic exploration, knowledge organization
   - Charts → data visualization (bar, line, pie, scatter)
2. **Parse Input** — Extract entities, relationships, flows, and hierarchy from the user's description.
3. **Generate Diagram** — Output diagram in the specified format:
   - Mermaid.js (preferred for markdown compatibility)
   - DOT/Graphviz
   - PlantUML
   - ASCII art (for quick inline sketches)
4. **Validation** — Verify the diagram accurately represents the described system or process. Check for missing connections or incorrect relationships.
5. **Iteration** — Refine layout, labeling, and styling based on user feedback.

## Requirements

- No external API keys required.
- Diagrams output as Mermaid.js code blocks for markdown rendering.
