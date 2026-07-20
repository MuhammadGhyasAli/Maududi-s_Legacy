import sys
import os

project_home = '/home/syedghyas/maududi-backend'
if project_home not in sys.path:
    sys.path.insert(0, project_home)

from main import app
