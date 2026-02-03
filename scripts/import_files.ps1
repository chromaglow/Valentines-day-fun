param(
    [string]$SourcePath = "C:\\Users\\ezras\\OneDrive\\Desktop\\files",
    [string]$TargetPath = "$PSScriptRoot\\..\\docs"
)

Write-Host "Import script starting..."

if (-not (Test-Path -Path $SourcePath)) {
    Write-Error "Source path '$SourcePath' does not exist. Provide a valid path or copy files manually."
    exit 1
}

if (-not (Test-Path -Path $TargetPath)) {
    Write-Host "Creating target directory: $TargetPath"
    New-Item -ItemType Directory -Path $TargetPath -Force | Out-Null
}

Write-Host "Copying files from $SourcePath to $TargetPath..."
Copy-Item -Path (Join-Path $SourcePath '*') -Destination $TargetPath -Recurse -Force

Write-Host "Files copied. Review docs/ and commit the changes."
