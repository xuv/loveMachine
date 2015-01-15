setlocal ENABLEDELAYEDEXPANSION
set psstart1="&{ start-process powershell -ArgumentList '-ExecutionPolicy RemoteSigned -noprofile -file
set psstart2=\install.ps1' -verb RunAs}"
set psstart=%psstart1% %cd%%psstart2%
powershell -noprofile -command %psstart%
pause
