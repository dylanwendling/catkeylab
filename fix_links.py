import os
import re

js_dir = 'js'
for root, dirs, files in os.walk(js_dir):
    for file in files:
        if file.endswith('.js'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # replace href="#" with href="/"
            content = content.replace('href="#"', 'href="/"')
            # replace href="#something" with href="/something/"
            content = re.sub(r'href="#([^"]+)"', r'href="/\1/"', content)
            
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)

print("All js files updated for history API links")
