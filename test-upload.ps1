# Test script for ELSMY /upload endpoint
# Usage: .\test-upload.ps1 -FilePath <path-to-file>
# Example: .\test-upload.ps1 -FilePath "test-audio.webm"

param(
  [string]$FilePath = "test.wav"
)

$ServerUrl = "http://localhost:3000/upload"

if (-not (Test-Path $FilePath)) {
  Write-Error "File not found: $FilePath"
  exit 1
}

Write-Host "Testing upload to $ServerUrl..."
Write-Host "File: $FilePath"
Write-Host ""

try {
  $fileItem = Get-Item $FilePath
  $fileBytes = [System.IO.File]::ReadAllBytes($FilePath)
  
  # Create multipart form data
  $boundary = [System.Guid]::NewGuid().ToString()
  $body = @()
  
  $body += "--$boundary"
  $body += 'Content-Disposition: form-data; name="file"; filename="' + $fileItem.Name + '"'
  $body += "Content-Type: application/octet-stream"
  $body += ""
  
  $bodyBefore = ($body | ForEach-Object { $_ + "`r`n" }) -join ""
  $bodyAfter = "`r`n--$boundary--"
  
  $requestBody = [System.Text.Encoding]::UTF8.GetBytes($bodyBefore) + $fileBytes + [System.Text.Encoding]::UTF8.GetBytes($bodyAfter)
  
  $response = Invoke-WebRequest -Uri $ServerUrl `
    -Method Post `
    -ContentType "multipart/form-data; boundary=$boundary" `
    -Body $requestBody `
    -ErrorAction Stop
  
  Write-Host "HTTP Status: $($response.StatusCode)"
  Write-Host "Response body:"
  Write-Host $response.Content
  Write-Host ""
  
  if ($response.StatusCode -in 200, 201) {
    Write-Host "✓ Upload successful!" -ForegroundColor Green
    $json = $response.Content | ConvertFrom-Json
    if ($json.url) {
      Write-Host "  File URL: $($json.url)"
      Write-Host "  Access at: http://localhost:3000$($json.url)"
    }
  }
} catch {
  Write-Host "✗ Upload failed: $($_.Exception.Message)" -ForegroundColor Red
  exit 1
}
