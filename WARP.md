# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Обзор

Этот репозиторий содержит графические материалы бренда (логотипы, мокапы, круговые печати, QR‑коды для Telegram/VK, ценники, фото примерочной) и набор шрифтов. Исходного кода, сборочных конфигураций и тестов нет.

Ключевые директории (высокоуровнево):
- DESIGN/Circle_Stamp/Circle_Stamp — исходники круговой печати (cdr, eps, jpg, pdf). Имеется глубокая вложенность с папками, названными числами.
- DESIGN/Fonts/Fonts — шрифты (otf/ttf).
- DESIGN/Logotype/Logotype — логотипы и мокапы.
- Price_Tsenniki/Price_Tsenniki — материалы ценников (cdr/pdf/jpg).
- Primerochnaya/Primerochnaya — фотографии (jpg/tif).
- Rezhim_Raboty/Rezhim_Raboty — афиши/режим работы (ai/eps/jpg).
- Telegram_Tolstovka/Telegram_Tolstovka и VK_Tolstovka/VK_Tolstovka — QR‑коды (png/eps).

На момент создания этого файла в репозитории не обнаружены: README.md, WARP.md, CLAUDE.md, Cursor rules (.cursor/rules/, .cursorrules), Copilot rules (.github/copilot-instructions.md), а также конфигурации сборки/линтинга/тестов.

## Команды (Windows PowerShell)

Так как это репозиторий ассетов без кода, ниже приведены команды для поиска, анализа и конвертации файлов.

- Обзор ассетов по расширениям:

```powershell
Get-ChildItem -Recurse -File |
  Group-Object Extension |
  Sort-Object Count -Descending |
  Format-Table -Auto
```

- Топ самых крупных файлов:

```powershell
Get-ChildItem -Recurse -File |
  Sort-Object Length -Descending |
  Select-Object -First 20 @{Name='SizeMB';Expression={[math]::Round($_.Length/1MB,2)}}, FullName
```

- Поиск файлов по типам:

```powershell
Get-ChildItem -Recurse -File -Include *.cdr,*.eps,*.ai,*.pdf,*.jpg,*.png,*.tif
```

### Конвертация и предпросмотры

- EPS → PNG (требуется ImageMagick; на Windows команда `magick`):

```powershell
magick -density 300 "input.eps" -background none -resize 2000x -strip "output.png"
```

- Первая страница PDF → PNG (белый фон):

```powershell
magick -density 300 "input.pdf[0]" -background white -flatten -resize 2000x -strip "output.png"
```

- Пакетная генерация PNG‑превью для всех EPS в репозитории в папку `previews/`:

```powershell
New-Item -ItemType Directory -Path ".\previews" -Force | Out-Null
Get-ChildItem -Recurse -File -Include *.eps | ForEach-Object {
  $out = Join-Path ".\previews" ($_.BaseName + ".png")
  magick -density 300 $_.FullName -background none -resize 2000x -strip $out
}
```

- Конвертация EPS/AI/CDR → PDF через Inkscape (если установлен; импорт CDR зависит от версии Inkscape):

```powershell
inkscape "input.eps" --export-type=pdf --export-filename="output.pdf"
inkscape "input.ai"  --export-type=pdf --export-filename="output.pdf"
inkscape "input.cdr" --export-type=pdf --export-filename="output.pdf"
```

- Метаданные (если установлен `exiftool`):

```powershell
exiftool "path\to\file"
```

- Поиск возможных дубликатов по размеру:

```powershell
Get-ChildItem -Recurse -File |
  Group-Object Length |
  Where-Object Count -gt 1 |
  Sort-Object Count -Descending |
  Select-Object -First 20 Count, @{N='SizeMB';E={[math]::Round($_.Name/1MB,2)}}
```

### Установка инструментов (по желанию)

Если необходимо, можно установить утилиты через winget:

```powershell
winget install --id ImageMagick.ImageMagick -e
winget install --id Inkscape.Inkscape -e
winget install --id PhilHarvey.ExifTool -e
```

## Рекомендации для Warp

- В проекте нет сборки, линта и тестов — на запросы об их запуске отвечайте, что они не применимы к данному репозиторию.
- Предлагайте операции с ассетами: поиск и группировка, генерация предпросмотров, конвертация форматов, извлечение метаданных.
- Учитывайте глубокую вложенность в `DESIGN/Circle_Stamp/Circle_Stamp` и потенциальные повторяющиеся имена файлов при пакетных операциях.
