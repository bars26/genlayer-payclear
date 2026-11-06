"""Direct-mode tests for the PayClear contract."""

import json
import re
import sys
from datetime import datetime, timedelta, timezone

import pytest

from tests.direct.conftest import CONTRACT_PATH, llm_json, to_hex
GEN = 10**18
GH = "https://boards-api.greenhouse.io/v1/boards"
ASHBY = "https://api.ashbyhq.com/posting-api/job-board"


def _days_from_now(n):
    return (datetime.now(timezone.utc) + timedelta(days=n)).strftime("%Y-%m-%d")


def _job(jid, title, location, pay=None, content="<p>Join us.</p>", url=None, company="Figma"):
    return {"id": jid, "title": title, "location": {"name": location}, "company_name": company, "content": content,
            "absolute_url": url or f"https://job-boards.greenhouse.io/figma/jobs/{jid}",
            "pay_input_ranges": [{"min_cents": pay[0] * 100, "max_cents": pay[1] * 100, "currency_type": "USD"}] if pay else []}


# A board with one posting of each kind.
JOBS = [
    _job(1001, "Product Designer", "San Francisco, CA", pay=(150000, 200000)),  # the board's own pay field
    _job(1002, "Account Executive", "Toronto, ON, CA"),  # Canada: out of scope
    _job(1003, "Brand Designer, Web", "Remote, United States", content="<p>Design our website. Great benefits.</p>"),  # no pay at all
    _job(1004, "Data Scientist", "New York, NY", content="<p>The base salary range is $160,000 - $190,000 per year.</p>"),
    _job(1005, "Sales Lead", "Remote - US", content="<p>Our business makes nearly $1B annually.</p>",
         url="https://www.example.com/careers/1005"),  # the employer's own page
]


def _mock(direct_vm, url, body, status=200):
    direct_vm.mock_web("^" + re.escape(url) + "$", {"method": "GET", "response": {
        "status": status, "headers": {"Content-Type": b"application/json"}, "body": json.dumps(body).encode()}})


def _setup(direct_vm, jobs=None, board="figma", status=200, answers=("RANGE", "NO_RANGE"), ashby=None):
    direct_vm.clear_mocks()
    _mock(direct_vm, f"{GH}/{board}/jobs?content=true&pay_transparency=true", {"jobs": JOBS if jobs is None else jobs}, status)
    if ashby is not None:
        _mock(direct_vm, f"{ASHBY}/{board}?includeCompensation=true", {"jobs": ashby, "apiVersion": "1"}, status)
    direct_vm.mock_llm(r"For each numbered job posting", llm_json({"answers": list(answers)}))


def _payments(contract, monkeypatch):
    """Record every GEN transfer the contract makes instead of sending it (GEN only leaves through `withdraw`)."""
    sent = []
    monkeypatch.setattr(sys.modules[type(contract).__module__], "_send", lambda to, amount: sent.append((to.as_hex, int(amount))))
    return sent


def _owed(contract, who):
    return int(contract.owed_to(to_hex(who)))


def _withdraw(direct_vm, contract, who):
    direct_vm.sender = who
    return int(contract.withdraw())


def _program(direct_vm, direct_deploy, sponsor, fund=GEN, reward=GEN // 20, per_auditor=10, ends=None):
    direct_vm.sender = sponsor
    contract = direct_deploy(CONTRACT_PATH)
    direct_vm.value = fund
    result = contract.create_program("US pay transparency 2026", ends or _days_from_now(60), reward, per_auditor)
    direct_vm.value = 0
    return contract, result


def _open(direct_vm, contract, who, board="figma", ats="greenhouse", **setup):
    _setup(direct_vm, board=board, **setup)
    direct_vm.sender = who
    return contract.open_audit("program_0", ats, board)


def _results(contract, audit_id):
    return {r["id"]: r for r in json.loads(contract.get_results(audit_id, 0, 200))}


def _module(contract):
    return sys.modules[type(contract).__module__]


# --- programs ------------------------------------------------------------------


def test_a_program_freezes_its_terms(direct_vm, direct_deploy, direct_alice):
    contract, pid = _program(direct_vm, direct_deploy, direct_alice)
    p = contract.get_program(pid)
    assert (pid, p.title, int(p.reward), int(p.per_auditor), int(p.pot), int(p.n_funders)) == ("program_0", "US pay transparency 2026", GEN // 20, 10, GEN, 1)
    assert json.loads(contract.totals()) == {"expected_balance": str(GEN), "owed": "0", "withdrawn": "0"}
    assert "Colorado" in json.loads(contract.laws())["CO"]


@pytest.mark.parametrize("args, fund, reason", [
    (("ab", None, GEN // 20, 10), GEN, "title must be 3 to 80 characters"),
    (("Program", "2026-02-31", GEN // 20, 10), GEN, "ends must be a real calendar date"),
    (("Program", "2020-01-01", GEN // 20, 10), GEN, "ends must be today or later"),
    (("Program", None, GEN // 1000, 10), GEN, "reward must be at least 0.01 GEN"),
    (("Program", None, GEN // 20, 0), GEN, "per_auditor must be a whole number from 1 to 1000"),
    (("Program", None, GEN // 20, 10), GEN // 20, "fund the program with at least one reward and at least 0.1 GEN"),
])
def test_invalid_programs_are_refunded_in_full(direct_vm, direct_deploy, direct_alice, monkeypatch, args, fund, reason):
    direct_vm.sender = direct_alice
    contract = direct_deploy(CONTRACT_PATH)
    sent = _payments(contract, monkeypatch)
    direct_vm.value = fund
    title, ends, reward, cap = args
    result = contract.create_program(title, ends or _days_from_now(30), reward, cap)
    direct_vm.value = 0
    assert result.startswith("REFUNDED: ") and reason in result
    assert sent == [] and _owed(contract, direct_alice) == fund and int(contract.program_count) == 0
    assert json.loads(contract.totals())["expected_balance"] == str(fund)
    assert _withdraw(direct_vm, contract, direct_alice) == fund
    assert sent == [(to_hex(direct_alice), fund)] and _owed(contract, direct_alice) == 0


def test_anyone_funds_with_at_least_a_tenth_of_a_gen(direct_vm, direct_deploy, direct_alice, direct_bob):
    contract, pid = _program(direct_vm, direct_deploy, direct_alice)
    direct_vm.sender, direct_vm.value = direct_bob, GEN
    assert contract.fund(pid) == "funded"
    direct_vm.value = GEN // 20
    assert contract.fund(pid).startswith("REFUNDED: Send at least 0.1 GEN to fund the program")
    assert _owed(contract, direct_bob) == GEN // 20
    assert [r["address"] for r in json.loads(contract.get_funders(pid, 0, 200))] == [to_hex(direct_alice), to_hex(direct_bob)]


# --- reading a board -----------------------------------------------------------


def test_an_audit_classifies_each_posting(direct_vm, direct_deploy, direct_alice, direct_bob, monkeypatch):
    contract, pid = _program(direct_vm, direct_deploy, direct_alice)
    sent = _payments(contract, monkeypatch)
    aid = _open(direct_vm, contract, direct_bob)
    a = contract.get_audit(aid)
    assert (a.state, a.employer, int(a.board_size), int(a.n_read), int(a.n_steps)) == ("done", "Figma", 5, 5, 1)
    r = _results(contract, aid)
    assert {k: v["code"] for k, v in r.items()} == {"1001": "range_listed", "1002": "out_of_scope", "1003": "no_range",
                                                    "1004": "range_text", "1005": "unverified"}
    assert r["1001"]["pay"] == "150,000-200,000 USD" and r["1001"]["states"] == ["CA"]
    assert r["1003"]["states"] == ["US-REMOTE"]
    assert (int(a.n_scope), int(a.n_listed), int(a.n_text), int(a.n_missing), int(a.n_unverified)) == (4, 1, 1, 1, 1)
    assert json.loads(a.missing_json) == [{"id": "1003", "title": "Brand Designer, Web", "location": "Remote, United States",
                                           "url": "https://job-boards.greenhouse.io/figma/jobs/1003"}]
    assert json.loads(contract.score(aid)) == {"state": "done", "read": 5, "in_scope": 4, "show_pay": 2, "missing": 1,
                                               "unverified": 1, "unclear": 0, "score_bp": 6666}
    assert sent == [] and _owed(contract, direct_bob) == GEN // 20  # the step was credited to whoever ran it
    assert _withdraw(direct_vm, contract, direct_bob) == GEN // 20 and sent == [(to_hex(direct_bob), GEN // 20)]
    step = json.loads(a.steps_json)[0]
    assert (step["read"], step["paid"], step["by"]) == (5, str(GEN // 20), to_hex(direct_bob))


def test_a_posting_with_no_pay_words_is_decided_in_code_without_the_model(direct_vm, direct_deploy, direct_alice, direct_bob):
    contract, _ = _program(direct_vm, direct_deploy, direct_alice)
    aid = _open(direct_vm, contract, direct_bob, jobs=[JOBS[2]], answers=("UNCLEAR",))  # the mock would say UNCLEAR if asked
    assert _results(contract, aid)["1003"]["code"] == "no_range"


def test_the_validators_unclear_answer_is_kept_as_unclear(direct_vm, direct_deploy, direct_alice, direct_bob):
    contract, _ = _program(direct_vm, direct_deploy, direct_alice)
    aid = _open(direct_vm, contract, direct_bob, jobs=[JOBS[3]], answers=("UNCLEAR",))
    assert _results(contract, aid)["1004"]["code"] == "unclear"
    assert json.loads(contract.score(aid))["score_bp"] is None


def test_a_big_board_is_read_in_bounded_steps_and_each_step_is_paid(direct_vm, direct_deploy, direct_alice, direct_bob, direct_charlie,
                                                                   monkeypatch):
    jobs = [_job(5000 + i, f"Engineer {i}", "Denver, CO" if i % 2 else "Berlin, Germany", pay=(100000, 120000)) for i in range(60)]
    contract, pid = _program(direct_vm, direct_deploy, direct_alice, per_auditor=2)
    sent = _payments(contract, monkeypatch)
    aid = _open(direct_vm, contract, direct_bob, jobs=jobs)
    assert (contract.get_audit(aid).state, int(contract.get_audit(aid).n_read), contract.get_audit(aid).last_key) == ("running", 25, "5024")
    _setup(direct_vm, jobs=jobs)
    direct_vm.sender = direct_bob
    assert contract.step(aid) == "running"
    direct_vm.sender = direct_charlie
    assert contract.step(aid) == "done"
    a = contract.get_audit(aid)
    assert (int(a.n_read), int(a.n_steps), int(a.n_scope), int(a.n_listed)) == (60, 3, 30, 30)
    assert (_owed(contract, direct_bob), _owed(contract, direct_charlie), sent) == (2 * (GEN // 20), GEN // 20, [])
    with direct_vm.expect_revert("is already done"):
        contract.step(aid)
    assert len(json.loads(contract.get_results(aid, 0, 200))) == 60
    assert [r["id"] for r in json.loads(contract.get_results(aid, 50, 200))] == [str(5050 + i) for i in range(10)]


def test_new_postings_during_an_audit_are_read_and_removed_ones_skipped(direct_vm, direct_deploy, direct_alice, direct_bob):
    jobs = [_job(7000 + i, f"Role {i}", "Chicago, IL", pay=(1, 2)) for i in range(30)]
    contract, _ = _program(direct_vm, direct_deploy, direct_alice)
    aid = _open(direct_vm, contract, direct_bob, jobs=jobs)
    later = [j for j in jobs if j["id"] != 7027] + [_job(7100, "New role", "Seattle, WA", pay=(3, 4))]
    _setup(direct_vm, jobs=later)
    assert contract.step(aid) == "done"
    ids = list(_results(contract, aid))
    assert "7027" not in ids and "7100" in ids and len(ids) == 30


def test_steps_are_unpaid_once_the_cap_or_the_pot_runs_out_and_never_paid_to_a_funder(direct_vm, direct_deploy, direct_alice, direct_bob,
                                                                                     monkeypatch):
    jobs = [_job(9000 + i, f"Role {i}", "Boston, MA", pay=(1, 2)) for i in range(75)]
    contract, pid = _program(direct_vm, direct_deploy, direct_alice, fund=GEN // 10, reward=GEN // 10)
    sent = _payments(contract, monkeypatch)
    aid = _open(direct_vm, contract, direct_alice, jobs=jobs)  # the sponsor runs a step: not paid
    _setup(direct_vm, jobs=jobs)
    direct_vm.sender = direct_bob
    contract.step(aid)  # paid: the pot had exactly one reward
    contract.step(aid)  # the pot is empty: the step still runs, unpaid
    assert (_owed(contract, direct_bob), _owed(contract, direct_alice), sent) == (GEN // 10, 0, [])
    assert [s["paid"] for s in json.loads(contract.get_audit(aid).steps_json)] == ["0", str(GEN // 10), "0"]
    assert contract.get_audit(aid).state == "done" and int(contract.get_program(pid).pot) == 0


@pytest.mark.parametrize("args, status, reason", [
    (("program_9", "greenhouse", "figma"), 200, "No program with id program_9"),
    (("program_0", "lever", "figma"), 200, "ats must be greenhouse or ashby"),
    (("program_0", "greenhouse", "Fig ma!"), 200, "board must be the board's token"),
    (("program_0", "greenhouse", "figma"), 404, "has no public job board named figma"),
    (("program_0", "greenhouse", "figma"), 503, "could not be read right now"),
])
def test_bad_audits_are_refused(direct_vm, direct_deploy, direct_alice, direct_bob, args, status, reason):
    contract, _ = _program(direct_vm, direct_deploy, direct_alice)
    _setup(direct_vm, status=status)
    direct_vm.sender = direct_bob
    with direct_vm.expect_revert(reason):
        contract.open_audit(*args)
    assert int(contract.audit_count) == 0


def test_one_running_audit_per_board_and_a_week_between_audits(direct_vm, direct_deploy, direct_alice, direct_bob):
    jobs = [_job(6000 + i, f"Role {i}", "Austin, TX") for i in range(30)]
    contract, pid = _program(direct_vm, direct_deploy, direct_alice)
    aid = _open(direct_vm, contract, direct_bob, jobs=jobs)
    with direct_vm.expect_revert(f"{aid} is still auditing this board"):
        contract.open_audit(pid, "greenhouse", "figma")
    contract.step(aid)
    with direct_vm.expect_revert("audit it again after 7 days"):
        contract.open_audit(pid, "greenhouse", "figma")
    contract.audits[aid].finished_at = "2020-01-01T00:00:00"
    assert contract.open_audit(pid, "greenhouse", "figma") == "audit_1"
    assert contract.audit_for(pid, "greenhouse", "FIGMA") == "audit_1"


def test_ashby_boards_use_the_address_and_the_displayed_compensation(direct_vm, direct_deploy, direct_alice, direct_bob):
    def ash(jid, title, region, country, comp="", show=True, remote=False, text="We build tools.", location=""):
        return {"id": jid, "title": title, "location": location or region, "isRemote": remote, "jobUrl": f"https://jobs.ashbyhq.com/acme/{jid}",
                "address": {"postalAddress": {"addressRegion": region, "addressCountry": country}}, "secondaryLocations": [],
                "shouldDisplayCompensationOnJobPostings": show, "compensation": {"scrapeableCompensationSalarySummary": comp},
                "descriptionPlain": text}

    board = [
        ash("a1", "Engineer", "California", "USA", comp="$180K - $220K"),
        ash("a2", "Designer", "New York", "USA", comp="$150K - $190K", show=False),  # not displayed on the posting
        ash("a3", "Advocate", "", "USA", remote=True, text="Over $1B raised. Join us.", location="North America"),
        ash("a4", "Marketer", "Ontario", "Canada"),
    ]
    contract, _ = _program(direct_vm, direct_deploy, direct_alice)
    aid = _open(direct_vm, contract, direct_bob, board="acme", ats="ashby", ashby=board, answers=("NO_RANGE",))
    r = _results(contract, aid)
    assert {k: v["code"] for k, v in r.items()} == {"a1": "range_listed", "a2": "no_range", "a3": "no_range", "a4": "out_of_scope"}
    assert (r["a1"]["states"], r["a2"]["states"], r["a3"]["states"]) == (["CA"], ["NY"], ["US-REMOTE"])
    assert contract.get_audit(aid).employer == "acme"


@pytest.mark.parametrize("location, states", [
    ("San Francisco, CA", ["CA"]), ("Toronto, ON, CA", []), ("Remote - US", ["US-REMOTE"]), ("London, UK", []),
    ("San Francisco, CA • New York, NY • United States", ["CA", "NY", "US-REMOTE"]), ("Washington, DC", ["DC"]),
    ("Remote, New York, US", ["NY"]), ("Tel Aviv, IL", []), ("Bogotá, CO", []), ("Perth, WA", []), ("Denver, Colorado", ["CO"]),
    ("Austin, TX", ["TX"]), ("Boston, MA or Remote (US)", ["MA", "US-REMOTE"]), ("Remote - Canada", []),
])
def test_locations_are_read_in_code(direct_vm, direct_deploy, direct_alice, location, states):
    direct_vm.sender = direct_alice
    contract = direct_deploy(CONTRACT_PATH)
    assert _module(contract).jurisdictions(location) == states
    assert json.loads(contract.where(location))["states"] == states


def test_pay_passages_are_what_the_validators_read(direct_vm, direct_deploy, direct_alice):
    direct_vm.sender = direct_alice
    contract = direct_deploy(CONTRACT_PATH)
    m = _module(contract)
    assert m.pay_snippets("We are a great place to work with lots of benefits.") == []
    found = m.pay_snippets("Intro. " * 50 + "The base salary range is $160,000 - $190,000. " + "Benefits. " * 50 + "Revenue is $1B.")
    assert len(found) == 2 and "$160,000" in found[0] and "$1B" in found[1]


# --- rechecks ------------------------------------------------------------------


def test_a_posting_can_be_read_again_once_and_the_counts_follow(direct_vm, direct_deploy, direct_alice, direct_bob, direct_charlie):
    contract, _ = _program(direct_vm, direct_deploy, direct_alice)
    aid = _open(direct_vm, contract, direct_bob)
    fixed = [dict(j, pay_input_ranges=[{"min_cents": 9000000, "max_cents": 12000000, "currency_type": "USD"}]) if j["id"] == 1003 else j for j in JOBS]
    _setup(direct_vm, jobs=fixed)
    direct_vm.sender = direct_charlie  # anyone, the employer included
    assert contract.recheck(aid, "1003") == "range_listed"
    a = contract.get_audit(aid)
    assert (int(a.n_missing), int(a.n_listed), int(a.n_scope), json.loads(a.missing_json)) == (0, 2, 4, [])
    assert _results(contract, aid)["1003"]["before"] == "no_range"
    with direct_vm.expect_revert("already been read again"):
        contract.recheck(aid, "1003")
    _setup(direct_vm, jobs=[j for j in JOBS if j["id"] != 1004])
    assert contract.recheck(aid, "1004") == "out_of_scope"
    assert _results(contract, aid)["1004"]["removed"] is True and int(contract.get_audit(aid).n_text) == 0
    with direct_vm.expect_revert("has not read posting 9999"):
        contract.recheck(aid, "9999")


# --- closing -------------------------------------------------------------------


def test_close_returns_the_pot_pro_rata(direct_vm, direct_deploy, direct_alice, direct_bob, direct_charlie, monkeypatch):
    contract, pid = _program(direct_vm, direct_deploy, direct_alice)
    sent = _payments(contract, monkeypatch)
    direct_vm.sender, direct_vm.value = direct_bob, GEN
    contract.fund(pid)
    direct_vm.value = 0
    _open(direct_vm, contract, direct_charlie)
    with direct_vm.expect_revert("Audit steps are paid until"):
        contract.close(pid)
    contract.programs[pid].ends = "2020-01-01"
    returnable = 2 * GEN - GEN // 20
    assert contract.close(pid) == str(returnable)
    assert contract.refund(pid, to_hex(direct_alice)) == str(returnable // 2)
    with direct_vm.expect_revert("already been returned"):
        contract.refund(pid, to_hex(direct_alice))
    assert contract.refund(pid, to_hex(direct_bob)) == str(returnable - returnable // 2)
    assert sent == [] and json.loads(contract.totals())["expected_balance"] == str(2 * GEN)
    for who in (direct_alice, direct_bob, direct_charlie):
        _withdraw(direct_vm, contract, who)
    assert sum(a for _, a in sent) == 2 * GEN and {t for t, _ in sent} == {to_hex(w) for w in (direct_alice, direct_bob, direct_charlie)}
    assert json.loads(contract.totals()) == {"expected_balance": "0", "owed": "0", "withdrawn": str(2 * GEN)}


def test_stress_hundreds_of_funders_still_close_and_repay_everyone(direct_vm, direct_deploy, direct_alice, monkeypatch):
    contract, pid = _program(direct_vm, direct_deploy, direct_alice)
    sent = _payments(contract, monkeypatch)
    for i in range(300):
        direct_vm.sender, direct_vm.value = (0xFA11000 + i).to_bytes(20, "big"), GEN // 10 + i
        contract.fund(pid)
    direct_vm.value = 0
    funded = GEN + sum(GEN // 10 + i for i in range(300))
    contract.programs[pid].ends = "2020-01-01"
    reads = {"n": 0}
    real = type(contract.programs).__getitem__
    monkeypatch.setattr(type(contract.programs), "__getitem__",
                        lambda m, k: (reads.__setitem__("n", reads["n"] + ("|" in str(k))), real(m, k))[1])
    assert contract.close(pid) == str(funded) and reads["n"] == 0
    monkeypatch.setattr(type(contract.programs), "__getitem__", real)
    rows = json.loads(contract.get_funders(pid, 0, 200)) + json.loads(contract.get_funders(pid, 200, 200))
    for row in rows:
        contract.refund(pid, row["address"])
    assert len(rows) == 301 and json.loads(contract.totals())["owed"] == str(funded)
    for row in rows:
        direct_vm.sender = bytes.fromhex(row["address"][2:])
        contract.withdraw()
    assert sum(a for _, a in sent) == funded and len(sent) == 301
    assert json.loads(contract.totals()) == {"expected_balance": "0", "owed": "0", "withdrawn": str(funded)}


# --- withdrawing ---------------------------------------------------------------


def test_gen_only_leaves_through_withdraw_to_the_caller(direct_vm, direct_deploy, direct_alice, direct_bob, direct_charlie, monkeypatch):
    contract, pid = _program(direct_vm, direct_deploy, direct_alice)
    sent = _payments(contract, monkeypatch)
    _open(direct_vm, contract, direct_bob)
    direct_vm.sender = direct_charlie
    with direct_vm.expect_revert("Nothing to withdraw"):
        contract.withdraw()  # charlie earned nothing and cannot take bob's reward
    assert _withdraw(direct_vm, contract, direct_bob) == GEN // 20
    with direct_vm.expect_revert("Nothing to withdraw"):
        contract.withdraw()  # a second withdraw has nothing left
    assert sent == [(to_hex(direct_bob), GEN // 20)]
    assert json.loads(contract.totals()) == {"expected_balance": str(GEN - GEN // 20), "owed": "0", "withdrawn": str(GEN // 20)}


# --- consensus -----------------------------------------------------------------


def _reading(codes, asked=None, **extra):
    results = [{"id": str(i), "title": f"Role {i}", "states": ["NY"], "code": c} for i, c in enumerate(codes)]
    out = {"state": "ok", "employer": "Figma", "board_size": len(codes), "more": False, "packet": {"read": [r["id"] for r in results]},
           "results": results, "llm": [str(i) for i in range(len(codes))] if asked is None else asked}
    out.update(extra)
    return out


def test_validators_agree_on_code_exactly_and_on_the_models_reading_but_one_in_ten(direct_vm, direct_deploy, direct_alice):
    direct_vm.sender = direct_alice
    same = _module(direct_deploy(CONTRACT_PATH)).same_reading
    ten = ["range_text"] * 10
    assert same(_reading(ten), _reading(["no_range"] + ten[1:]))  # one wavering answer in ten
    assert not same(_reading(ten), _reading(["no_range", "unclear"] + ten[2:]))  # two are too many
    five = ["range_text"] * 5
    assert not same(_reading(five), _reading(["no_range"] + five[1:]))  # under ten, every answer must match
    assert not same(_reading(five, asked=[]), _reading(["range_listed"] + five[1:], asked=[]))  # code-decided: exact
    assert not same(_reading(ten), _reading(ten, board_size=11))  # the board itself must match
    assert not same(_reading(ten), _reading(ten, asked=["0"]))  # the same postings went to the model
    assert same({"state": "error"}, {"state": "error"}) and not same({"state": "error"}, _reading(ten))
    assert same({"state": "unreadable"}, {"state": "unreadable"}) and not same({"state": "none"}, {"state": "error"})


def test_an_unusable_model_answer_refuses_the_step(direct_vm, direct_deploy, direct_alice, direct_bob):
    contract, _ = _program(direct_vm, direct_deploy, direct_alice)
    _setup(direct_vm, answers=("RANGE",))  # two postings need the model; one answer is not enough
    direct_vm.sender = direct_bob
    with direct_vm.expect_revert("reading of the pay passages was unusable"):
        contract.open_audit("program_0", "greenhouse", "figma")
    assert int(contract.audit_count) == 0
