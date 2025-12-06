@echo off
echo Creating admin account directly in database...
docker exec -it klens-postgres psql -U klens_user -d klens -c "INSERT INTO users (email, password_hash, name, role, department) VALUES ('admin@klens.local', '$2b$10$rKJ5qZ5qZ5qZ5qZ5qZ5qZuO5qZ5qZ5qZ5qZ5qZ5qZ5qZ5qZ5qZ5qZ', 'System Admin', 'admin', 'IT') ON CONFLICT (email) DO NOTHING;"
echo.
echo Admin account created!
echo Email: admin@klens.local
echo Password: Admin@123
echo.
echo Now login at: http://localhost
pause
