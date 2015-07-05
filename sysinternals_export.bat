@echo off
REM export sysinternals registry

reg export HKEY_CURRENT_USER\Software\Sysinternals sysinternals_export.reg
