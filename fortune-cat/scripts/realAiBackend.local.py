"""Launch the real backend with a process-local BFF credential, without changing its files."""
import os
import sys
import re
import tempfile
from pathlib import Path

backend = Path(sys.argv[1]).resolve()
os.chdir(backend)
sys.path.insert(0, str(backend))
# Existing provider keys and databases are loaded by the backend's environment loader.
os.environ.update({
    'ENVIRONMENT': 'development', 'PAYWALL_ENABLED': 'true',
    'SLACK_WEBHOOK_URL': '', 'SLACK_TOKEN_ALERT_CHANNEL': '',
    'LANGCHAIN_TRACING_V2': 'true', 'LANGSMITH_TRACING': 'true',
    'TAROT_AI_PROFILE': 'gpt_analysis_gemini',
})
if not os.environ.get('BFF_API_KEY'):
    raise RuntimeError('Start this backend with the local AI launcher')
import uvicorn
import main
from api import tarot
from services import toss_anonymous
from services.tarot_sandbox import SandboxStore

# This adapter exists only in the separate loopback process, never in deployed authentication.
os.environ['TOSS_ANON_SESSION_SECRET'] = os.environ['BFF_API_KEY']
resolve_identity = toss_anonymous.resolve_identity
def local_identity(key):
    if re.fullmatch(r'local_ai_[a-f0-9]{32}', key):
        return key
    return resolve_identity(key)
toss_anonymous.resolve_identity = local_identity

class LocalTarotStore(SandboxStore):
    def trial_session(self, uid):
        return None

    def draw_free(self, row, state):
        return self.save(row['id'], row['version'], state | {'access': 'free'})

tarot_directory = tempfile.TemporaryDirectory(prefix='tarot-real-ai-')
tarot.service.store = LocalTarotStore(Path(tarot_directory.name) / 'consultations.sqlite3')
# Show the entire real answer in this test process; shared admission/model limits stay enabled.
main.PAYWALL_ENABLED = False
uvicorn.run(main.app, host='127.0.0.1', port=8020, log_level='warning')
