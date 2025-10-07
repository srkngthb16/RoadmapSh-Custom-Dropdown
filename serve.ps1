param(
  [int]$Port = 8000
)

Write-Host "Starting simple PowerShell static file server on port $Port..." -ForegroundColor Green

$prefix = "http://localhost:$Port/"
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($prefix)

try {
  $listener.Start()
} catch {
  Write-Host "Failed to start HttpListener on prefix $prefix." -ForegroundColor Red
  Write-Host "Common fixes: run PowerShell as Administrator, choose another port, or reserve the URL using netsh (see README)." -ForegroundColor Yellow
  throw
}

Write-Host "Serving files from: $(Get-Location)" -ForegroundColor Cyan
Write-Host "Open http://localhost:$Port in your browser. Press Ctrl+C to stop." -ForegroundColor Cyan

while ($listener.IsListening) {
  try {
    $context = $listener.GetContext()
    $request = $context.Request
    $response = $context.Response

    $path = $request.Url.AbsolutePath
    if ($path -eq '/') { $rel = 'index.html' } else { $rel = $path.TrimStart('/') -replace '/','\\' }
    $full = Join-Path (Get-Location) $rel

    if (-not (Test-Path $full)) {
      $response.StatusCode = 404
      $msg = "404 Not Found"
      $buffer = [System.Text.Encoding]::UTF8.GetBytes($msg)
      $response.ContentType = 'text/plain'
      $response.ContentLength64 = $buffer.Length
      $response.OutputStream.Write($buffer,0,$buffer.Length)
      $response.OutputStream.Close()
      continue
    }

    $ext = [System.IO.Path]::GetExtension($full).ToLower()
    switch ($ext) {
      '.html' { $mime = 'text/html' }
      '.htm'  { $mime = 'text/html' }
      '.css'  { $mime = 'text/css' }
      '.js'   { $mime = 'application/javascript' }
      '.json' { $mime = 'application/json' }
      '.png'  { $mime = 'image/png' }
      '.jpg'  { $mime = 'image/jpeg' }
      '.jpeg' { $mime = 'image/jpeg' }
      '.svg'  { $mime = 'image/svg+xml' }
      default { $mime = 'application/octet-stream' }
    }

    $bytes = [System.IO.File]::ReadAllBytes($full)
    $response.ContentType = $mime
    $response.ContentLength64 = $bytes.Length
    $response.OutputStream.Write($bytes,0,$bytes.Length)
    $response.OutputStream.Close()
  } catch [System.Exception] {
    Write-Host "Request handling error: $_" -ForegroundColor Yellow
  }
}

$listener.Stop()
