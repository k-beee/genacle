import os
import json
from gl import make_client, read

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)

info = json.load(open(os.path.join(ROOT, "deployment.json"), encoding="utf-8"))
addr = info["contract_address"]

client, account = make_client()
print("Stats:", read(client, account, addr, "get_stats"))
print("Disputes page 0:", read(client, account, addr, "get_disputes", [0]))
