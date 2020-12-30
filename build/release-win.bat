@echo off

set NAME=goman
set VERSION=%1
set TYPE=%2
set SRC=github.com/i-apples/goman/go/main/%TYPE%

if "%VERSION%" == "" GOTO USAGE
if "%TYPE%" == "web" GOTO BUILD
if "%TYPE%" == "app" GOTO BUILD
GOTO USAGE

:BUILD
set DIR=%cd%
set DISTDIR=%DIR%\dist
set DISTNAME=%NAME%.%VERSION%.%TYPE%-win64.exe

set DISTSYSO=%DIR%\..\go\main\%TYPE%\%NAME%.syso

if not exist %DISTDIR% (
	mkdir %DISTDIR%
)

echo.
echo %DISTNAME% building...
echo.

REM windres -i %DIR%\%NAME%.rc -O coff -o %DISTSYSO%
echo F | xcopy /Y %DIR%\%NAME%.syso %DISTSYSO%

go build -ldflags="-H windowsgui" -o %DISTDIR%\%DISTNAME% %SRC%

del %DISTSYSO%

GOTO END

:USAGE
echo.
echo argument error.
echo.
echo e.g. "release-win v0.4.0 web" or "release-win v0.4.0 app"
echo.

:END
