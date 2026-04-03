param(
    [string]$BaseUrl = "http://localhost:8080",
    [int]$BatchSize = 500,
    [string]$AccessToken = "",
    [string]$CookieHeader = ""
)

$ErrorActionPreference = "Stop"

if ([string]::IsNullOrWhiteSpace($AccessToken) -and [string]::IsNullOrWhiteSpace($CookieHeader)) {
    Write-Error "AccessToken 또는 CookieHeader 중 하나는 반드시 입력해야 합니다."
}

$url = "$BaseUrl/api/admin/search-indexes/posts/reindex?batchSize=$BatchSize"
$headers = @{}

if (-not [string]::IsNullOrWhiteSpace($AccessToken)) {
    $headers["Authorization"] = "Bearer $AccessToken"
}

if (-not [string]::IsNullOrWhiteSpace($CookieHeader)) {
    $headers["Cookie"] = $CookieHeader
}

Write-Host "[REINDEX] POST $url"
$response = Invoke-RestMethod -Method POST -Uri $url -Headers $headers
$response | ConvertTo-Json -Depth 5
