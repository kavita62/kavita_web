import re

with open('/sessions/laughing-fervent-mendel/mnt/kavita web/project.html', 'r') as f:
    content = f.read()

# Find the escapeHtml function and replace the return object
# Current broken: '"': """, "'": "'"
# Fixed: '"': """, "'": "'"

# Use a more targeted approach - find the exact lines
old_line = '    return { "&": "&", "<": "<", ">": ">", \'"\': "\"", "\'": "\'" }[c];'
new_line = '    return { "&": "&", "<": "<", ">": ">", \'"\': "\"", "\'": "\'" }[c];'

content = content.replace(old_line, new_line)

with open('/sessions/laughing-fervent-mendel/mnt/kavita web/project.html', 'w') as f:
    f.write(content)

print('Done')