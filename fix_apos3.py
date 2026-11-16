with open('/sessions/laughing-fervent-mendel/mnt/kavita web/project.html', 'rb') as f:
    content = f.read()

# The bytes for the apostrophe entity: & # 3 9 ;
# Current has: ' (literal apostrophe = 0x27)
# Should be: ' (0x26 0x23 0x33 0x39 0x3b)

old = b"'\": \"'\" }[c];"
new = b"'\": \"'\" }[c];"

if old in content:
    content = content.replace(old, new)
    print('Fixed apostrophe entity')
else:
    print('Pattern not found')
    idx = content.find(b"'\":")
    if idx >= 0:
        print("Found at:", idx, content[idx:idx+30])

with open('/sessions/laughing-fervent-mendel/mnt/kavita web/project.html', 'wb') as f:
    f.write(content)
print('Done')