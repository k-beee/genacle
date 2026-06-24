# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import *
import json

ERROR_EXPECTED = "[EXPECTED]"
ERROR_TRANSIENT = "[TRANSIENT]"
ERROR_LLM = "[LLM_ERROR]"

MAX_TITLE = 120
MAX_AGREEMENT = 500
MAX_CLAIMANT_CASE = 400
MAX_RESPONDENT_CASE = 400
MAX_EVIDENCE = 600
PAGE = 20
VALID_RULINGS = ("CLAIMANT_WIN", "RESPONDENT_WIN", "DISMISSED")


class Genacle(gl.Contract):
    owner: Address
    disputes: TreeMap[str, str]       # id -> serialized dispute record
    dispute_ids: DynArray[str]        # insertion order for pagination
    ledger: DynArray[str]             # append-only event log
    total_disputes: u256
    total_resolved: u256
    total_claimant_wins: u256
    seq: u256

    def __init__(self):
        self.owner = gl.message.sender_address
        self.total_disputes = u256(0)
        self.total_resolved = u256(0)
        self.total_claimant_wins = u256(0)
        self.seq = u256(0)
