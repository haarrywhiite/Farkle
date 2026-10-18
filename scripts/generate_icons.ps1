Add-Type -AssemblyName System.Drawing

function New-Icon {
    param ($size, $path)
    
    $bmp = New-Object System.Drawing.Bitmap $size, $size
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    
    # Colors
    $brown = [System.Drawing.ColorTranslator]::FromHtml("#451a03")
    $gold = [System.Drawing.ColorTranslator]::FromHtml("#fca311")
    
    # Background
    $brush = New-Object System.Drawing.SolidBrush $brown
    $g.FillRectangle($brush, 0, 0, $size, $size)
    
    # Border
    $pen = New-Object System.Drawing.Pen $gold, ($size * 0.05)
    $rect = New-Object System.Drawing.Rectangle ($size * 0.05), ($size * 0.05), ($size * 0.9), ($size * 0.9)
    $g.DrawRectangle($pen, $rect)
    
    # Pips (5)
    $pipSize = $size * 0.15
    $center = $size / 2
    $offset = $size * 0.25
    $pipBrush = New-Object System.Drawing.SolidBrush $gold
    
    # Draw Pips
    $g.FillEllipse($pipBrush, ($center - $pipSize/2), ($center - $pipSize/2), $pipSize, $pipSize) # Center
    $g.FillEllipse($pipBrush, ($center - $offset - $pipSize/2), ($center - $offset - $pipSize/2), $pipSize, $pipSize) # Top Left
    $g.FillEllipse($pipBrush, ($center + $offset - $pipSize/2), ($center - $offset - $pipSize/2), $pipSize, $pipSize) # Top Right
    $g.FillEllipse($pipBrush, ($center - $offset - $pipSize/2), ($center + $offset - $pipSize/2), $pipSize, $pipSize) # Bottom Left
    $g.FillEllipse($pipBrush, ($center + $offset - $pipSize/2), ($center + $offset - $pipSize/2), $pipSize, $pipSize) # Bottom Right
    
    $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
}

New-Icon -size 512 -path "f:\PROJECTS\farkle-game\img\icon-512.png"
New-Icon -size 192 -path "f:\PROJECTS\farkle-game\img\icon-192.png"
Write-Host "Icons generated successfully."
