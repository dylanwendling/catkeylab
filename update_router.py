import re

with open('js/router.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace handleRoute logic
old_handle_route = "const hash = window.location.hash.replace('#', '').trim();"
new_handle_route = "let hash = window.location.pathname.replace(/^\\/|\\/$/g, '').trim();\n  if (!hash && window.location.hash) {\n    hash = window.location.hash.replace('#', '').trim();\n  }"
content = content.replace(old_handle_route, new_handle_route)

# Replace triggerRandomTool logic
old_trigger = "window.location.hash = `#${randomKey}`;"
new_trigger = "history.pushState(null, '', `/${randomKey}/`);\n  handleRoute();\n  window.scrollTo({ top: 0, behavior: 'instant' });"
content = content.replace(old_trigger, new_trigger)

old_current_hash = "const currentHash = window.location.hash.replace('#', '') || '';"
new_current_hash = "const currentHash = window.location.pathname.replace(/^\\/|\\/$/g, '').trim() || '';"
content = content.replace(old_current_hash, new_current_hash)

# Replace <a href="#something"> with <a href="/something/"> globally in router.js
content = re.sub(r'href="#([^"]+)"', r'href="/\1/"', content)

# Write back
with open('js/router.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("router.js updated")
