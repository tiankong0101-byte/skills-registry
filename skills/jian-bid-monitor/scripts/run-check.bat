@echo off
ping -n 10 127.0.0.1 >nul
"C:\Program Files\nodejs\node.exe" "C:\Users\TIAN\.config\opencode\skills\jian-bid-monitor\scripts\monitor.js" --check
