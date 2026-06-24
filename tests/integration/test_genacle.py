from gltest import get_contract_factory
from gltest.assertions import tx_execution_succeeded


def test_file_and_resolve_court_flow():
    factory = get_contract_factory("Genacle")
    contract = factory.deploy(args=[])

    # Check initial stats
    stats = contract.get_stats(args=[]).call()
    assert stats["disputes"] == 0
    assert stats["resolved"] == 0
    assert stats["claimant_wins"] == 0

    # File a dispute (deterministic write)
    title = "Freelance UI Development Dispute"
    agreement = (
        "Freelancer agreed to build a classy responsive dashboard with dark-mode toggle "
        "and double borders in the UI panels, delivered before June 2026."
    )
    claimant_case = (
        "Freelancer delivered the UI but it does not have a dark-mode toggle and double borders are missing. "
        "It looks simple and does not match the classy aesthetic specified."
    )
    respondent_case = (
        "I built the exact dashboard requested. The borders are implemented using standard CSS, "
        "and the dark-mode was not explicitly written into the contract terms, just mentioned in chat."
    )

    open_receipt = contract.file_dispute(args=[
        title,
        agreement,
        claimant_case,
        respondent_case
    ]).transact()
    assert tx_execution_succeeded(open_receipt)

    stats = contract.get_stats(args=[]).call()
    assert stats["disputes"] == 1

    disputes = contract.get_disputes(args=[0]).call()
    assert len(disputes) == 1
    did = disputes[0]["id"]
    assert disputes[0]["status"] == "PENDING"
    assert disputes[0]["title"] == title

    # Resolve dispute (AI write under consensus)
    evidence = (
        "Submission source code reveals standard CSS single borders and no dark mode toggle script "
        "or styles. Chat logs verify both parties agreed on dark mode during kickoff."
    )

    resolve_receipt = contract.resolve_dispute(args=[did, evidence]).transact()
    assert tx_execution_succeeded(resolve_receipt)

    resolved = contract.get_dispute(args=[did]).call()
    assert resolved["status"] == "RESOLVED"
    assert resolved["ruling"] in ("CLAIMANT_WIN", "RESPONDENT_WIN", "DISMISSED")
    assert 0 <= resolved["confidence"] <= 100
    if resolved["ruling"] == "DISMISSED":
        assert resolved["confidence"] <= 40


def test_guards_reject_invalid_length():
    factory = get_contract_factory("Genacle")
    contract = factory.deploy(args=[])

    # Check empty title fails
    receipt = contract.file_dispute(args=["", "agreement text", "claimant case", "respondent case"]).transact()
    assert not tx_execution_succeeded(receipt)
