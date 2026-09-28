import re
import os

with open('js/router.js', 'r', encoding='utf-8') as f:
    content = f.read()

start_str = "export const TOOL_METADATA = {"
start_idx = content.find(start_str)

if start_idx == -1:
    print("TOOL_METADATA not found")
    exit(1)

# Find matching closing brace
open_braces = 0
end_idx = -1
for i in range(start_idx + len("export const TOOL_METADATA = "), len(content)):
    if content[i] == '{':
        open_braces += 1
    elif content[i] == '}':
        open_braces -= 1
        if open_braces == 0:
            end_idx = i + 1
            break

metadata_block = content[start_idx + len("export const TOOL_METADATA = "):end_idx]

# Remove renderFn and cleanupFn using regex
metadata_block = re.sub(r'renderFn:\s*[^,]+,\s*', '', metadata_block)
metadata_block = re.sub(r'cleanupFn:\s*[^,]+,\s*', '', metadata_block)

out_dir = 'js/data'
os.makedirs(out_dir, exist_ok=True)
with open(os.path.join(out_dir, 'toolMetadata.js'), 'w', encoding='utf-8') as f:
    f.write('export const TOOL_METADATA = ' + metadata_block + ';\n')

# Now remove the block from router.js and replace it with an import and reconstruction
import_stmt = "import { TOOL_METADATA as _METADATA } from './data/toolMetadata.js';\n\nexport const TOOL_METADATA = { ..._METADATA };\n"

assignments = []
for match in re.finditer(r"'([^']+)'\s*:\s*\{.*?renderFn:\s*([^,]+),\s*cleanupFn:\s*([^,]+),", content[start_idx:end_idx], re.DOTALL):
    tool = match.group(1)
    render = match.group(2)
    cleanup = match.group(3)
    assignments.append(f"TOOL_METADATA['{tool}'].renderFn = {render};\nTOOL_METADATA['{tool}'].cleanupFn = {cleanup};")

replacement = import_stmt + "\n".join(assignments) + "\n"

new_content = content[:start_idx] + replacement + content[end_idx:]
with open('js/router.js', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Extraction complete!")
