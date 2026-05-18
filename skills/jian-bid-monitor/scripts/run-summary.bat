@echo off
ping -n 31 127.0.0.1 >nul 2>&1
"C:\Program Files\nodejs\node.exe" "C:\Users\TIAN\.config\opencode\skills\jian-bid-monitor\scripts\monitor.js" --summary
