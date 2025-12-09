# ELSMY Upload Endpoint Testing

## Prerequisites

1. Server running on `http://localhost:3000`:
```powershell
cd server
npm install
npm start
```

## PowerShell Test (Windows)

Run the test script with an audio file:

```powershell
.\test-upload.ps1 -FilePath "path/to/your/audio.webm"
```

Or use a dummy file for testing:

```powershell
# Create a dummy file
"test data" | Out-File -Encoding ASCII test.wav

# Run test
.\test-upload.ps1 -FilePath test.wav
```

## Bash/Shell Test (macOS/Linux)

Run the test script:

```bash
bash test-upload.sh path/to/your/audio.webm
```

Or test with a dummy file:

```bash
# Create a dummy file
echo "test data" > test.wav

# Run test
bash test-upload.sh test.wav
```

## Manual cURL Test

### Windows PowerShell

```powershell
$File = "test.wav"
Invoke-WebRequest -Uri "http://localhost:3000/upload" `
  -Method Post `
  -Form @{file=@$File}
```

### Bash/Shell

```bash
curl -X POST -F "file=@test.wav" http://localhost:3000/upload
```

## Expected Response

Success (200 OK):
```json
{
  "url": "/uploads/1735000000000-test.wav"
}
```

Then access the file at: `http://localhost:3000/uploads/1735000000000-test.wav`

## Troubleshooting

- **Server not responding**: Make sure server is running on port 3000
- **CORS errors**: Check `CORS_ORIGIN` environment variable (should be `*` for local testing)
- **File size too large**: Adjust `MAX_UPLOAD_SIZE` in `.env` (default 50MB)
- **Upload directory**: Check that `server/uploads/` directory exists and is writable

## Cleanup

Remove uploaded test files:

```powershell
Remove-Item server/uploads/* -Force
```

Or:

```bash
rm server/uploads/*
```
