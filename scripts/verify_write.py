import os
import json
import time
from gl import make_client, read
from genlayer_py.types import TransactionStatus

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)

info = json.load(open(os.path.join(ROOT, "deployment.json"), encoding="utf-8"))
addr = info["contract_address"]

client, account = make_client()
print("Filing a dispute...")
tx1 = client.write_contract(
    address=addr,
    function_name="file_dispute",
    args=[
        "Agreement on React widget color",
        "Developer must build a widget that turns yellow when clicked.",
        "The widget remains blue when clicked, standard rendering failed.",
        "The click event is registered, but active styles class wasn't updated on parent."
    ]
)
print("file_dispute tx:", tx1)
client.wait_for_transaction_receipt(transaction_hash=tx1, status=TransactionStatus.ACCEPTED, interval=5000, retries=120)

disputes = read(client, account, addr, "get_disputes", [0])
did = disputes[-1]["id"]
print("Filed dispute ID:", did)

print("Resolving dispute under AI consensus...")
tx2 = client.write_contract(
    address=addr,
    function_name="resolve_dispute",
    args=[
        did,
        "telemetry logs and source code verify widget has active yellow state but class is masked by parent z-index overlay."
    ]
)
print("resolve_dispute tx:", tx2)
client.wait_for_transaction_receipt(transaction_hash=tx2, status=TransactionStatus.ACCEPTED, interval=8000, retries=120)
time.sleep(3)

print("Updated stats:", read(client, account, addr, "get_stats"))
print("Final dispute ruling:", read(client, account, addr, "get_dispute", [did]))
