with open('/sessions/laughing-fervent-mendel/mnt/kavita web/project.html', 'rb') as f:
    content = f.read()

# Fix the apostrophe entity - should be ' not literal '
old = b"'\": \"'\" }[c];"
new = b"'\": \"'\" }[c];"

if old in content:
    content = content.replace(old, new)
    print('Fixed apostrophe entity')
else:
    print('Pattern not found')
    # Find what we have
    idx = content.find(b"'\":")
    if idx >= 0:
        print(content[idx:idx+30])

with open('/sessions/laughing-fervent-mendel/mnt/kavita web/project.html', 'wb') as f:
    f.write(content)
print('Done')