# Write the escapeHtml function with correct entity codes
# Using explicit character codes to avoid Python interpreting them

import re

with open('/sessions/laughing-fervent-mendel/mnt/kavita web/project.html', 'r') as f:
    content = f.read()

# The escapeHtml function - we need to replace the return object
# Current: '"': """, "'": "'"
# Fixed: '"': """, "'": "'"

# Using bytes approach - find and replace the specific line
old_bytes = b'    return { "&": "&", "<": "<", ">": ">", \'"\': "&#34;", "\'": "'" }[c];'
new_bytes = b'    return { "&": "&", "<": "<", ">": ">", \'"\': "&#34;", "\'": "'" }[c];'

# Actually let's just use regex with explicit codes
# The issue is the entity values in the return object
# They should be "&" "<" ">" """ "'"

pattern = r'(function escapeHtml\(text\) \{\s+return String\(text == null \? "" : text\)\.replace\(/\[&<>"\']/g, function \(c\) \{\s+return \{) "&": "[^"]*", "<": "[^"]*", ">": "[^"]*", \'"\': "[^"]*", "\'": "[^"]*" \}\[c\];)'

replacement = r'\1 "&": "&", "<": "<", ">": ">", \'"\': """, "\'": "'" }[c];'

content = re.sub(pattern, replacement, content)

with open('/sessions/laughing-fervent-mendel/mnt/kavita web/project.html', 'w') as f:
    f.write(content)

print('Done')