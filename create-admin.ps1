$body = @{
    email = "admin@klens.local"
    password = "Admin@123"
    name = "System Admin"
    role = "admin"
    department = "IT"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:8000/api/auth/register" -Method Post -Body $body -ContentType "application/json"
    Write-Host "✅ Admin account created successfully!" -ForegroundColor Green
    Write-Host "Email: admin@klens.local" -ForegroundColor Cyan
    Write-Host "Password: Admin@123" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Now login at: http://localhost" -ForegroundColor Yellow
} catch {
    if ($_.Exception.Response.StatusCode -eq 400) {
        Write-Host "⚠️  Admin account already exists!" -ForegroundColor Yellow
        Write-Host "Just login with:" -ForegroundColor Cyan
        Write-Host "Email: admin@klens.local" -ForegroundColor Cyan
        Write-Host "Password: Admin@123" -ForegroundColor Cyan
    } else {
        Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}
