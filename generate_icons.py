import zlib
import struct
import os

def make_solid_png(width, height, rgb_color):
    """Generates a solid color PNG file bytes using only built-in python libraries."""
    # PNG signature
    png = b'\x89PNG\r\n\x1a\n'
    
    # IHDR chunk: Width, Height, Bit depth (8), Color type (2=RGB), Compression (0), Filter (0), Interlace (0)
    ihdr_data = struct.pack('!IIBBBBB', width, height, 8, 2, 0, 0, 0)
    ihdr = b'IHDR' + ihdr_data
    png += struct.pack('!I', len(ihdr_data)) + ihdr + struct.pack('!I', zlib.crc32(ihdr) & 0xffffffff)
    
    # IDAT chunk: Compressed raw pixel data
    # Each row must start with a filter type byte (0 = None)
    pixel_row = b'\x00' + bytes(rgb_color) * width
    raw_data = pixel_row * height
    idat_data = zlib.compress(raw_data)
    idat = b'IDAT' + idat_data
    png += struct.pack('!I', len(idat_data)) + idat + struct.pack('!I', zlib.crc32(idat) & 0xffffffff)
    
    # IEND chunk
    iend = b'IEND'
    png += struct.pack('!I', 0) + iend + struct.pack('!I', zlib.crc32(iend) & 0xffffffff)
    return png

def main():
    icon_dir = 'extension/icons'
    os.makedirs(icon_dir, exist_ok=True)
    
    # Accent color: Hex #3b82f6 -> RGB (59, 130, 246)
    blue_color = (59, 130, 246)
    
    sizes = [16, 48, 128]
    for sz in sizes:
        filepath = os.path.join(icon_dir, f'icon{sz}.png')
        print(f"Generating solid-color {sz}x{sz} icon at: {filepath}")
        png_bytes = make_solid_png(sz, sz, blue_color)
        with open(filepath, 'wb') as f:
            f.write(png_bytes)
            
    print("All icons generated successfully.")

if __name__ == '__main__':
    main()
