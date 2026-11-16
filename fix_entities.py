with open('/sessions/laughing-fervent-mendel/mnt/kavita web/project.html', 'rb') as f:
    content = f.read()

# Find the escapeHtml function location
idx = content.find(b'escapeHtml')
if idx >= 0:
    print("Found escapeHtml at:", idx)
    print(content[idx:idx+300])

# The broken line (with literal chars) - use raw bytes
old = b'    return { "&": "&", "<": "<", ">": ">", \'"\': "\"", "\'": "\'" }[c];'

# The fixed line (with entity codes) - build it byte by byte
# & = 0x26 0x23 0x33 0x38 0x3b = b"&#38;"
# < = 0x26 0x23 0x36 0x30 0x3b = b"&#60;"
# > = 0x26 0x23 0x36 0x32 0x3b = b"&#62;"
# " = 0x26 0x23 0x33 0x34 0x3b = b"&#34;"
# ' = 0x26 0x23 0x33 0x39 0x3b = b"'"

amp = b"&#38;"
lt = b"&#60;"
gt = b"&#62;"
quot = b"&#34;"
apos = b"'"

new = b'    return { "&": "' + amp + b'", "<": "' + lt + b'", ">": "' + gt + b'", \'"\': "' + quot + b'", "\'": "' + apos + b'" }[c];'

if old in content:
    content = content.replace(old, new)
    print('Found and replaced!')
else:
    print('Old pattern not found, searching...')
    # Try to find the return line
    idx2 = content.find(b'return { "&":')
    if idx2 >= 0:
        print("Found return at:", idx2)
        print(content[idx2:idx2+100])

with open('/sessions/laughing-fervent-mendel/mnt/kavita web/project.html', 'wb') as f:
    f.write(content)
print('Done')