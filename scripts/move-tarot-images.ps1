$sets = @(
  @{ source = "publicimagestarotset1"; start = 0;  end = 14;  dest = "public/images/tarot/set1" },
  @{ source = "publicimagestarotset2"; start = 15; end = 30;  dest = "public/images/tarot/set2" },
  @{ source = "publicimagestarotset3"; start = 31; end = 45;  dest = "public/images/tarot/set3" },
  @{ source = "publicimagestarotset4"; start = 46; end = 61;  dest = "public/images/tarot/set4" },
  @{ source = "publicimagestarotset5"; start = 62; end = 77;  dest = "public/images/tarot/set5" }
)

foreach ($set in $sets) {
  $files = Get-ChildItem -Path $set.source -Recurse -Include *.jpg | Where-Object { $_.FullName -notlike "*__MACOSX*" } | Sort-Object Name

  if (-not (Test-Path $set.dest)) {
    New-Item -ItemType Directory -Path $set.dest -Force | Out-Null
  }

  $index = $set.start
  foreach ($file in $files) {
    $destPath = Join-Path $set.dest "$index.jpg"
    Copy-Item -Path $file.FullName -Destination $destPath
    Write-Host "Copied $($file.Name) -> $destPath"
    $index++
  }
}

Write-Host "Done."
