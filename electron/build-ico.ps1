Add-Type -AssemblyName System.Drawing

$sizes = @(16, 24, 32, 48, 64, 128, 256)
$sourcePath = Join-Path $PSScriptRoot "..\img\icon-512.png"
$destPath = Join-Path $PSScriptRoot "icon.ico"

$source = [System.Drawing.Image]::FromFile($sourcePath)
$ms = New-Object System.IO.MemoryStream
$bw = New-Object System.IO.BinaryWriter $ms

# ICO Header
$bw.Write([UInt16]0)
$bw.Write([UInt16]1)
$bw.Write([UInt16]$sizes.Count)

$pngStreams = @()
foreach ($s in $sizes) {
    $bmp = New-Object System.Drawing.Bitmap $s, $s
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.DrawImage($source, 0, 0, $s, $s)
    $g.Dispose()

    $pms = New-Object System.IO.MemoryStream
    $bmp.Save($pms, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    $pngStreams += $pms
}

$offset = 6 + ($sizes.Count * 16)
for ($i = 0; $i -lt $sizes.Count; $i++) {
    $s = $sizes[$i]
    $w = if ($s -ge 256) { [byte]0 } else { [byte]$s }
    $h = if ($s -ge 256) { [byte]0 } else { [byte]$s }
    $len = [UInt32]$pngStreams[$i].Length

    $bw.Write($w)
    $bw.Write($h)
    $bw.Write([byte]0) # colors
    $bw.Write([byte]0) # reserved
    $bw.Write([UInt16]1) # planes
    $bw.Write([UInt16]32) # bpp
    $bw.Write($len)
    $bw.Write([UInt32]$offset)
    $offset += $len
}

for ($i = 0; $i -lt $sizes.Count; $i++) {
    $bytes = $pngStreams[$i].ToArray()
    $bw.Write($bytes)
    $pngStreams[$i].Dispose()
}

$source.Dispose()
[System.IO.File]::WriteAllBytes($destPath, $ms.ToArray())
$bw.Dispose()
$ms.Dispose()
Write-Host "Generated multi-resolution icon.ico ($($sizes.Count) sizes) successfully."
