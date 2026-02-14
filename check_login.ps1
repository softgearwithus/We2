$base = "http://localhost:3001"
$email = "student@example.com"
$password = "password123"

Write-Host "Attempting Login for $email..."

try {
    $body = @{ email = $email; password = $password } | ConvertTo-Json
    $response = Invoke-RestMethod -Uri "$base/auth/login" -Method Post -ContentType "application/json" -Body $body -ErrorAction Stop
    Write-Host "LOGIN SUCCESSFUL"
    Write-Host "Token: $($response.accessToken)"
} catch {
    $status = $_.Exception.Response.StatusCode
    Write-Host "Login Failed ($status): $($_.Exception.Message)"
    
    if ($status -eq "Unauthorized" -or $status -eq 401) {
        Write-Host "Attempting Registration..."
        try {
            $regBody = @{ email = $email; password = $password; role = "student" } | ConvertTo-Json
            $regResponse = Invoke-RestMethod -Uri "$base/auth/register" -Method Post -ContentType "application/json" -Body $regBody -ErrorAction Stop
            Write-Host "REGISTRATION SUCCESSFUL"
            Write-Host "User ID: $($regResponse.id)"
        } catch {
             Write-Host "Registration Failed: $($_.Exception.Message)"
             if ($_.Exception.Response) {
                $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
                Write-Host "Details: $($reader.ReadToEnd())"
             }
        }
    }
}
