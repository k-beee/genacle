# Genacle: Decentralized AI Arbitration Court

*An autonomous legal tribunal that lives entirely on-chain on GenLayer. Parties file disputes citing agreement terms and arguments; when evidence is submitted, a decentralized consensus of validator AI jurors resolves the case. No middlemen, no custody, network fees only.*

Genacle is sitting live at [k-beee.github.io/genacle](https://k-beee.github.io/genacle/), reading and writing to contract [`0xd23D6E…5ACe`](https://explorer-bradbury.genlayer.com/address/0xd23D6E7688942FeB5e58aca3f5700b98921E5ACe) on GenLayer Bradbury.

---

### Why does an arbitration court need a blockchain?

Because a legal tribunal is only as trustworthy as the consensus that resolves it. Standard Web2 servers resolving disputes operate as black boxes that must be trusted blindly. Genacle moves the resolution process entirely under consensus: a leader validator drafts the initial verdict, every other validator independently re-runs the deliberation prompt on their own LLMs, and only a verdict they agree on gets etched into state. This adversarial re-derivation is what GenLayer makes possible.

### How does Genacle's storage architecture work?

The smart contract holds the complete court record and statistics in GenLayer state storage:
* **Disputes Dossier**: A `TreeMap[str, str]` mapping auto-incremented dispute IDs to serialized JSON cases.
* **Docket Index**: A parallel `DynArray[str]` storing insertion order for pagination.
* **Telemetry Ledger**: A `DynArray[str]` logging critical events (e.g. `FILED`, `RESOLVED`).
* **Statistics Counters**: `total_disputes`, `total_resolved`, and `total_claimant_wins` using `u256` so summary metrics never require high-gas loops.

### How is a verdict reached under consensus?

Inside `_deliberate`, the leader packages the agreement, claimant arguments, respondent arguments, and evidence into an injection-resistant prompt. It instructs the LLM to output a strict JSON format mapping:
`{"ruling": "CLAIMANT_WIN" | "RESPONDENT_WIN" | "DISMISSED", "confidence": 0-100, "rationale": "..."}`.

The leader's output is verified by validators in `validator_fn`:
1. Rulings must match exactly (`CLAIMANT_WIN` vs `RESPONDENT_WIN`).
2. Confidence score variance must fall within a math-based tolerance threshold (absolute difference is less than or equal to the larger of 20 points or 20% of the max confidence).
3. Leaders returning malformed JSON or failed prompts are rotated out.
4. After consensus, a post-consensus backstop caps `DISMISSED` confidence at 40 to protect against prompt injection or low-trust states.

### How does the frontend decode consensus in real-time?

The Next.js dashboard uses `genlayer-js` to poll transaction receipts during consensus. It extracts the leader's base64-encoded `eq_outputs` from the receipt (`consensus_data.leader_receipt.eq_outputs`), decodes it from base64, and parses the raw JSON. This allows the client UI to render a "deliberating draft verdict" preview live on screen before the validators finalize consensus.

### How to run and deploy locally?

1. **Lint and Test the Contract**:
   ```bash
   pip install genvm-linter genlayer-test
   genvm-lint check contracts/genacle.py
   gltest tests/integration/ -v -s --network studionet
   ```

2. **Run the Frontend**:
   ```bash
   cd frontend
   npm install --legacy-peer-deps
   npm run dev
   ```

3. **Deploy to Bradbury Testnet**:
   Define `GENLAYER_PRIVATE_KEY` in a root `.env` file (see `.env.example`), then deploy and verify:
   ```bash
   python scripts/deploy.py
   python scripts/verify_read.py
   python scripts/verify_write.py
   ```

4. **Static Export**:
   Build the static export of the frontend:
   ```bash
   cd frontend && npm run build
   ```
