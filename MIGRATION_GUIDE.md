# Migration Guide

## Overview
This guide will help you migrate from the old Profile model to the new custom User model with `is_premium` field.

## Prerequisites

1. **Install Python dependencies:**
   ```bash
   pip install python-decouple
   ```

2. **Ensure your `.env` file is configured** with database credentials (see `.env.example`)

## Migration Steps

### Option 1: Fresh Database (No Existing Data)

If you don't have important data to preserve:

```bash
# Navigate to project directory
cd kursova

# Delete existing database (WARNING: This deletes all data!)
# For MySQL:
mysql -u root -p
DROP DATABASE magazine_db;
CREATE DATABASE magazine_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;

# Create migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser
```

### Option 2: Preserve Existing Data

If you have existing users with Profile data:

#### Step 1: Create Data Migration

First, create a data migration to transfer `is_premium` from Profile to User:

```bash
python manage.py makemigrations articles --empty --name migrate_premium_data
```

Then edit the created migration file to include:

```python
from django.db import migrations

def migrate_premium_data(apps, schema_editor):
    """
    Transfer is_premium from Profile to User model.
    """
    Profile = apps.get_model('articles', 'Profile')
    User = apps.get_model('articles', 'User')
    
    for profile in Profile.objects.all():
        if hasattr(profile, 'user'):
            user = profile.user
            user.is_premium = profile.is_premium
            user.save()

def reverse_migrate_premium_data(apps, schema_editor):
    """
    Reverse migration - create Profile records from User.is_premium
    """
    Profile = apps.get_model('articles', 'Profile')
    User = apps.get_model('articles', 'User')
    
    for user in User.objects.all():
        Profile.objects.get_or_create(
            user=user,
            defaults={'is_premium': user.is_premium}
        )

class Migration(migrations.Migration):
    dependencies = [
        ('articles', '0008_remove_poll_title'),  # Adjust to your last migration
    ]

    operations = [
        migrations.RunPython(migrate_premium_data, reverse_migrate_premium_data),
    ]
```

**Note:** Since migration 0009 already exists, you may need to adjust the approach. See "Important Notes" below.

#### Step 2: Run Migrations

```bash
# Check migration status
python manage.py showmigrations

# Apply migrations
python manage.py migrate
```

### Option 3: If Migration 0009 Already Exists

If migration `0009_user_delete_profile.py` already exists but hasn't been applied:

1. **Check if Profile table still exists:**
   ```bash
   python manage.py showmigrations articles
   ```

2. **If migrations are unapplied:**
   ```bash
   # Apply all migrations
   python manage.py migrate
   ```

3. **If Profile table still exists in database but migration was applied:**
   - You may need to manually drop the Profile table
   - Or create a new migration to handle the transition

## Troubleshooting

### Error: "Table 'auth_user' already exists"

This happens if you're switching to a custom User model but the default auth_user table exists.

**Solution:**
```bash
# Option A: Drop and recreate (WARNING: Deletes all users!)
mysql -u root -p
DROP DATABASE magazine_db;
CREATE DATABASE magazine_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;

python manage.py migrate

# Option B: Rename existing table
mysql -u root -p magazine_db
RENAME TABLE auth_user TO auth_user_old;
EXIT;

python manage.py migrate
```

### Error: "No such table: articles_profile"

If Profile table doesn't exist but migration tries to delete it:

**Solution:** The migration should handle this. If not, you can fake the migration:
```bash
python manage.py migrate articles 0008 --fake
python manage.py migrate
```

### Error: "AUTH_USER_MODEL refers to model that has not been installed"

**Solution:** Make sure `'magazine.articles'` is in `INSTALLED_APPS` in `settings.py`

## Verification

After migration, verify everything works:

1. **Check User model:**
   ```bash
   python manage.py shell
   ```
   ```python
   from magazine.articles.models import User
   User.objects.first()  # Should work
   User.objects.first().is_premium  # Should exist
   ```

2. **Test registration:**
   - Start server: `python manage.py runserver`
   - Try registering a new user
   - Check if `is_premium` field works

3. **Test admin:**
   - Access `/admin/`
   - Check User model has `is_premium` field

## Important Notes

⚠️ **WARNING:** Changing `AUTH_USER_MODEL` after creating migrations can cause issues. If you've already run migrations with the default User model:

1. **Best approach:** Start fresh (delete database and recreate)
2. **If you must preserve data:** Create a data migration BEFORE applying the User model migration

## Quick Start (Recommended for Development)

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Delete and recreate database
mysql -u root -p
DROP DATABASE IF EXISTS magazine_db;
CREATE DATABASE magazine_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;

# 3. Run migrations
cd kursova
python manage.py migrate

# 4. Create superuser
python manage.py createsuperuser

# 5. Start server
python manage.py runserver
```

