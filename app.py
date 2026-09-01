import os
import sys
import importlib.util

current_dir = os.path.dirname(os.path.abspath(__file__))
subproject_dir = os.path.join(current_dir, 'smart-internship-portal')
if subproject_dir not in sys.path:
    sys.path.insert(0, subproject_dir)

# Load app module directly from smart-internship-portal/app.py
spec = importlib.util.spec_from_file_location("portal_app", os.path.join(subproject_dir, "app.py"))
portal_module = importlib.util.module_from_spec(spec)
sys.modules["portal_app"] = portal_module
spec.loader.exec_module(portal_module)

app = portal_module.app

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)

