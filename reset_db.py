#!/usr/bin/env python
"""
Script to drop and recreate the database.
"""
import os
import sys
import django

# Setup Django
sys.path.insert(0, os.path.dirname(__file__))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "magazine.articles.settings")
django.setup()

from django.db import connection
from decouple import config

def reset_database():
    db_name = config('DATABASE_NAME', default='magazine_db')
    
    print(f"Dropping database '{db_name}'...")
    
    # Close existing connections
    connection.close()
    
    # Get a connection without specifying database
    from django.db import connections
    default_connection = connections['default']
    
    # Switch to mysql database to drop the target database
    default_connection.settings_dict['NAME'] = 'mysql'
    cursor = default_connection.cursor()
    
    # Drop database
    cursor.execute(f"DROP DATABASE IF EXISTS {db_name};")
    print(f"Database '{db_name}' dropped.")
    
    # Create fresh database
    cursor.execute(f"CREATE DATABASE {db_name} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;")
    print(f"Database '{db_name}' created.")
    
    # Switch back to the target database
    default_connection.settings_dict['NAME'] = db_name
    default_connection.close()
    
    print("\nDatabase reset complete! Now run: python manage.py migrate")

if __name__ == "__main__":
    reset_database()

