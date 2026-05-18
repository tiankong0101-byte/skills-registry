#!/bin/bash
# MemPalace-style auto-save hook for skill-evolver
# Place this in OpenCode hooks directory

EVOLVE_DIR="C:/Users/TIAN/.config/opencode/skills/skill-evolver/.evolve"
SKILL_NAME="$1"
ROUND="$2"

if [ -z "$SKILL_NAME" ]; then
  echo "Usage: $0 <skill-name> [round]"
  exit 1
fi

node "C:/Users/TIAN/.config/opencode/skills/skill-evolver/src/auto-save.js" "$SKILL_NAME" "$EVOLVE_DIR" "$ROUND"
