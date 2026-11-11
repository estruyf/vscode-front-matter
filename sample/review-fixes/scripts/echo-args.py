# Content script (Python, started as "python3 -u"): records the arguments it receives
import json
import os
import sys
from datetime import datetime, timezone

ws_path, file_path, front_matter = (sys.argv[1:] + ['', '', ''])[:3]
output = os.path.join(ws_path, 'script-output.json')
try:
    with open(output, encoding='utf-8') as f:
        runs = json.load(f)
except (OSError, ValueError):
    runs = []
runs.append({
    'time': datetime.now(timezone.utc).isoformat(),
    'script': 'python-echo',
    # The interpreter options it was started with: ['-u'] when "python3 -u" was split correctly
    'interpreterOptions': [arg for arg in getattr(sys, 'orig_argv', [])[1:] if arg.startswith('-')],
    'filePath': file_path,
    'frontMatter': front_matter,
})
with open(output, 'w', encoding='utf-8') as f:
    json.dump(runs, f, indent=2)
print(f'Received: {file_path}')
