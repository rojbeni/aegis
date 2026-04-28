

This error is the "Final Boss" of pypsexec. While WinError 10060 was a networking issue, ERROR_ACCESS_DENIED (Code 5) means you have successfully reached the machine, but Windows is slamming the door in your face.

In Windows, ROpenSCManagerW is the function used to establish a connection to the Service Control Manager (SCM). You need full administrative rights to touch this.

1. The "LocalAccountTokenFilterPolicy" Issue (Most Common)
If you are using a Local Administrator account (not a Domain Admin), Windows "User Account Control" (UAC) strips your administrative tokens when you connect remotely.

The Fix: You must tell Windows to allow local administrative rights over the network via the Registry on the target machine.

Open regedit on the target machine.

Navigate to: HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System

Create a new DWORD (32-bit) value named LocalAccountTokenFilterPolicy.

Set its value to 1.

No reboot is required, but it is recommended.


pip install virtualenv
python -m virtualenv .venv

uvicorn app.main:app --reload
celery -A app.worker:celery_app worker --loglevel=info --pool=solo

pip install .
python -m app.audit_file_parser -audit cis/CIS_Microsoft_Windows_Server_2022_Benchmark_v2.0.0_L1_MS.audit


pip install alembic
alembic init migrations

alembic revision --autogenerate -m  <revision message>
alembic upgrade head

ruff check .
ruff check --fix .
ruff format .

http://127.0.0.1:8000/redoc


