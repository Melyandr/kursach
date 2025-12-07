@echo off
echo Dropping database...
mysql -u root -padmin -e "DROP DATABASE IF EXISTS magazine_db;" 2>nul

echo Creating fresh database...
mysql -u root -padmin -e "CREATE DATABASE magazine_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>nul

echo.
echo Running migrations...
python manage.py migrate

echo.
echo Creating superuser...
python manage.py createsuperuser

echo.
echo Done!
pause

