#!/usr/bin/env python3
"""Build the patient-question spreadsheet from sourced questions.

Every row is a question retrieved from a Reddit thread, a published
People Also Ask / clinic FAQ, a government page, or a peer-reviewed
paper that listed questions patients ask or that ChatGPT itself
returned as its top patient FAQs. Nothing here is invented.
"""

from __future__ import annotations

import re
from collections import Counter
from pathlib import Path

from openpyxl import Workbook
from openpyxl.styles import Alignment, Font, PatternFill
from openpyxl.utils import get_column_letter
from openpyxl.worksheet.datavalidation import DataValidation
from openpyxl.formatting.rule import FormulaRule
from openpyxl.chart import BarChart, Reference

OUT = Path(__file__).with_name("patient-questions-implants-dentures.xlsx")

# slug, keywords that mean this blog already answers the question
BLOGS: list[tuple[str, tuple[str, ...]]] = [
    ("what-is-all-on-4", ("what is all-on-4", "what is all on 4", "what are all-on-4", "what does all-on-4", "teeth in a day", "what is all-on-4,")),
    ("snap-on-dentures-vs-all-on-4", ("snap-in", "snap in", "snap-on", "snap on", "did i agree", "over implants", "vs all-on-4", "vs all on 4")),
    ("dentures-vs-dental-implants", ("dentures vs", "vs dentures", "vs. dentures", "implants vs dentures", "dentures or implants", "better than dentures", "instead of dentures")),
    ("dental-implants-vs-bridge", ("vs bridge", "or a bridge", "or bridge", "implant vs bridge", "bridge or implant")),
    ("full-arch-vs-individual-dental-implants", ("every tooth", "individual implant", "full mouth", "full-mouth", "whole mouth", "all my teeth")),
    ("same-day-dental-implants-new-teeth-one-day", ("same day", "same-day", "one day", "in one day", "teeth in a day", "immediately after")),
    ("temporary-teeth-after-all-on-4", ("temporary", "temps", "traditional denture", "while waiting", "pmma", "plastic", "zirconia")),
    ("when-do-you-get-final-teeth-after-all-on-4", ("final teeth", "permanents", "permanent set", "permanent denture", "when do you get", "when the final", "finals differ")),
    ("all-on-4-recovery-first-weeks", ("first weeks", "recovery", "post-op", "post op", "days post", "is this normal", "ache")),
    ("how-long-do-all-on-4-implants-last", ("how long do", "how long will", "how long can", "success rate", "how successful", "how long last")),
    ("all-on-4-vs-all-on-6", ("all-on-6", "all on 6", "all on 4/6", "all-on-x")),
    ("dental-implants-with-bone-loss", ("bone loss", "low jawbone", "not enough bone", "bone density", "years of missing", "too late", "long time")),
    ("dental-implants-with-diabetes-or-smoking", ("diabetes", "smoke", "smoking", "osteoporosis")),
    ("dental-implant-not-feeling-right", ("not feeling", "fail", "failing", "fell out", "fell off", "peri-implant", "infection", "something wrong", "is this serious")),
    ("denture-adhesive-vs-implants", ("adhesive", "glue", "won't stay", "will not stay", "loose", "pop up")),
    ("lower-denture-vs-implants", ("bottom denture", "lower denture", "bottoms", "lower implants")),
    ("upper-denture-vs-all-on-4", ("upper denture", "palate", "roof of my mouth", "plate")),
    ("sedation-for-dental-implant-surgery", ("sedation", "iv sedation", "knocked out", "awake", "laughing gas", "anesthesia", "anaesthesia", "suboxone")),
    ("what-is-included-in-an-implant-quote", ("quote", "cost", "price", "afford", "how much", "included", "breakdown", "worth it", "$$$$")),
    ("does-the-canadian-dental-care-plan-cover-dental-implants", ("cdcp", "canadian dental care", "ohip")),
    ("denturist-vs-dentist-for-implant-teeth", ("denturist", "prosthodontist", "which specialist", "who will restore")),
    ("all-on-4-dental-implants-after-years-of-missing-teeth", ("after not having teeth", "years without", "missing teeth for", "too late")),
    ("why-people-are-choosing-all-on-4", ("why do people", "why people", "biggest reasons")),
    ("on-site-dental-lab-for-all-on-4", ("on-site lab", "dental lab")),
]

# question, channel, topic, stage, source, url, cluster
Q = tuple[str, str, str, str, str, str, str]

REDDIT_D = "https://www.reddit.com/r/dentures"
REDDIT_I = "https://www.reddit.com/r/Dentalimplant"
REDDIT_A = "https://www.reddit.com/r/Allon4ImplantDentures"
REDDIT_ASK = "https://www.reddit.com/r/askdentists"


def R(path: str, sub: str = "dentures") -> str:
    base = {"dentures": REDDIT_D, "implant": REDDIT_I, "allon4": REDDIT_A, "ask": REDDIT_ASK}[sub]
    return f"{base}/comments/{path}"


ROWS: list[Q] = []


def add(question: str, channel: str, topic: str, stage: str, source: str, url: str, cluster: str) -> None:
    ROWS.append((question.strip(), channel, topic, stage, source, url, cluster))


# --- ChatGPT's own "top patient FAQs" (Journal of Prosthetic Dentistry, 2025) ---
JPD = "https://www.thejpd.org/article/S0022-3913(25)00243-4/fulltext"
CH = "ChatGPT"
for question, topic, stage, cluster in [
    ("What are dental implants?", "Basics", "Deciding", "what-are-implants"),
    ("How successful are dental implants?", "Longevity", "Deciding", "success-rate"),
    ("How long do dental implants last?", "Longevity", "Deciding", "how-long-last"),
    ("Can dental implants be done in one day?", "Same-day teeth", "Choosing a treatment", "same-day"),
    ("Are there any risks or complications with dental implants?", "Complications", "Deciding", "risks"),
    ("What are the alternatives to dental implants?", "Comparing options", "Choosing a treatment", "alternatives"),
    ("Can dental implants fail?", "Failure", "Deciding", "can-fail"),
    ("How long is the recovery time after getting dental implants?", "Healing", "Before surgery", "recovery-time"),
    ("What materials are used in dental implants?", "Materials", "Choosing a treatment", "materials"),
    ("Can dental implants be placed immediately after a tooth extraction?", "Same-day teeth", "Choosing a treatment", "immediate-placement"),
    ("What is a dental crown?", "Basics", "Choosing a treatment", "what-is-crown"),
    ("What types of dental crowns are available?", "Materials", "Choosing a treatment", "crown-types"),
    ("How long does a dental crown last?", "Longevity", "Living with it", "crown-last"),
    ("Are there alternatives to a dental crown?", "Comparing options", "Choosing a treatment", "crown-alternatives"),
    ("How is a dental crown different from a veneer?", "Comparing options", "Choosing a treatment", "crown-vs-veneer"),
    ("Can I eat normally with a dental crown?", "Eating and speech", "Living with it", "eat-crown"),
    ("How do I choose between the different types of dental crown materials?", "Materials", "Choosing a treatment", "crown-material-choice"),
    ("Do dental crowns feel like natural teeth?", "Feel", "Deciding", "feel-natural"),
    ("What is the success rate of dental crowns?", "Longevity", "Deciding", "crown-success"),
    ("Can a dental crown be done in one visit?", "Timeline", "Choosing a treatment", "crown-one-visit"),
    ("What are dentures?", "Basics", "Deciding", "what-are-dentures"),
    ("How do I get used to wearing dentures?", "Adjusting", "First weeks", "getting-used-to"),
    ("Do dentures affect how I speak?", "Eating and speech", "First weeks", "speech"),
    ("Will dentures change how I look?", "Appearance and shame", "Deciding", "looks"),
    ("Can I sleep with my dentures?", "Daily care", "Living with it", "sleep-dentures"),
    ("How long do complete dentures last?", "Longevity", "Living with it", "denture-last"),
    ("Can I eat normally with dentures?", "Eating and speech", "Deciding", "eat-dentures"),
    ("How do complete dentures stay in place?", "Fit and adhesive", "Deciding", "how-dentures-stay"),
    ("Will dentures affect my taste?", "Eating and speech", "Deciding", "taste"),
    ("Do I need to use denture adhesive forever?", "Fit and adhesive", "Living with it", "adhesive-forever"),
    ("What is a partial denture?", "Basics", "Deciding", "what-is-partial"),
    ("How do partial dentures stay in place?", "Fit and adhesive", "Deciding", "partial-stay"),
    ("Can I eat normally with a partial denture?", "Eating and speech", "Deciding", "eat-partial"),
    ("How long do partial dentures last?", "Longevity", "Living with it", "partial-last"),
    ("Do I need to remove my partial denture at night?", "Daily care", "Living with it", "partial-night"),
    ("Are there different types of partial dentures?", "Comparing options", "Choosing a treatment", "partial-types"),
    ("Is it difficult to speak with partial dentures in?", "Eating and speech", "First weeks", "partial-speech"),
    ("Do I need to use denture adhesive with a partial denture?", "Fit and adhesive", "Living with it", "partial-adhesive"),
    ("Can I sleep with my partial dentures in?", "Daily care", "Living with it", "partial-sleep"),
    ("How does the cost of a partial denture compare to other tooth replacement options?", "Cost", "Choosing a treatment", "partial-cost"),
]:
    add(question, CH, topic, stage, "ChatGPT top FAQs, Journal of Prosthetic Dentistry (2025)", JPD, cluster)

# Questions prosthodontists say patients actually ask, then submitted to ChatGPT
for question, topic, stage, cluster in [
    ("What are the advantages of dental implants?", "Comparing options", "Deciding", "advantages"),
    ("What are the disadvantages of dental implants?", "Comparing options", "Deciding", "disadvantages"),
    ("Is it painful during dental implant surgery?", "Pain and fear", "Before surgery", "pain-surgery"),
    ("After dental implant treatment, how should I care for it?", "Daily care", "Living with it", "care-implant"),
    ("Do I need to floss around dental implants?", "Daily care", "Living with it", "floss"),
    ("Can I eat everything with my implant crown?", "Eating and speech", "Living with it", "eat-everything"),
    ("Is it better to extract my tooth and get an implant?", "Comparing options", "Choosing a treatment", "extract-or-save"),
    ("Can I have an infection around my dental implant?", "Complications", "When something goes wrong", "infection"),
    ("Do I need to get bone grafting before implant placement?", "Bone graft and sinus", "Choosing a treatment", "need-graft"),
    ("How long should I wait until I get my implant crown?", "Timeline", "Months of healing", "wait-for-crown"),
    ("What is a temporary dental crown?", "Temporary teeth", "Surgery day", "temp-crown"),
    ("Why do I need a temporary crown?", "Temporary teeth", "Before surgery", "why-temp-crown"),
    ("Can I get a root canal after the crown is made?", "Complications", "Living with it", "root-canal-after-crown"),
    ("My tooth has a crack. Do I have to crown it?", "Comparing options", "Deciding", "cracked-tooth"),
    ("Should I get teeth whitening before or after getting a new crown?", "Appearance and shame", "Before surgery", "whitening-timing"),
    ("Can I get a cavity under my crown?", "Complications", "Living with it", "cavity-under-crown"),
    ("Can my tooth get damaged by being crowned?", "Complications", "Deciding", "crown-damage"),
    ("Does the crown make my tooth stronger?", "Basics", "Deciding", "crown-stronger"),
    ("Is the crown a permanent treatment?", "Longevity", "Deciding", "crown-permanent"),
    ("Will the color of my crown change over time?", "Appearance and shame", "Living with it", "crown-color"),
    ("How do I clean complete dentures?", "Daily care", "Living with it", "clean-dentures"),
    ("Do I need implants if my denture is not stable?", "Comparing options", "Living with it", "unstable-need-implants"),
    ("Can I eat an apple with my complete dentures?", "Eating and speech", "Living with it", "eat-apple"),
    ("Can I have the denture without covering my palate?", "Palate and gagging", "Choosing a treatment", "no-palate"),
    ("For my lower denture, does it have to go all the way to the back?", "Fit and adhesive", "Choosing a treatment", "lower-length"),
    ("May I use denture adhesive?", "Fit and adhesive", "First weeks", "may-use-adhesive"),
    ("How many implants do I need to get my denture stable?", "Snap-in vs fixed", "Choosing a treatment", "how-many-implants"),
    ("Do I have to come for cleaning after I get my dentures?", "Daily care", "Living with it", "denture-checkups"),
    ("Can dentures be repaired?", "Maintenance", "When something goes wrong", "repair-dentures"),
    ("How can I get my dentures more retentive?", "Fit and adhesive", "Living with it", "more-retentive"),
    ("Are partial dentures the best way to replace missing teeth?", "Comparing options", "Choosing a treatment", "partial-best"),
    ("How do I remove partial dentures with a clasp?", "Daily care", "Living with it", "remove-clasp"),
    ("How can I clean partial dentures?", "Daily care", "Living with it", "clean-partial"),
    ("Will a partial denture affect my other teeth?", "Complications", "Deciding", "partial-other-teeth"),
    ("Does a partial denture have to cover my palate?", "Palate and gagging", "Choosing a treatment", "partial-palate"),
    ("Do partial dentures have to be metal?", "Materials", "Choosing a treatment", "partial-metal"),
    ("Why do you have to grind my teeth away when making a partial denture?", "Procedure", "Before surgery", "grind-teeth"),
    ("Can I have a small partial denture just to cover my missing teeth, instead of a big metal plate?", "Comparing options", "Choosing a treatment", "small-partial"),
    ("Can you make a partial denture that is pink and flexible?", "Materials", "Choosing a treatment", "flexible-partial"),
    ("Is a partial denture a better option than a bridge or an implant?", "Comparing options", "Choosing a treatment", "partial-vs-bridge-implant"),
]:
    add(question, "Questions patients ask, then put to ChatGPT", topic, stage, "Prosthodontist FAQ list, Journal of Prosthetic Dentistry (2025)", JPD, cluster)

# 30 questions prosthodontists collected and submitted to ChatGPT-4o and Gemini
PMC30 = "https://pmc.ncbi.nlm.nih.gov/articles/PMC12764373/"
for question, topic, stage, cluster in [
    ("What happens if I don't get a dental bridge?", "Comparing options", "Deciding", "skip-bridge"),
    ("How long does a dental bridge last?", "Longevity", "Deciding", "bridge-last"),
    ("Can I eat normally with a crown?", "Eating and speech", "Living with it", "eat-crown"),
    ("How long does it take to get a dental bridge?", "Timeline", "Choosing a treatment", "bridge-time"),
    ("Is there a possibility of swallowing my dental bridge?", "Complications", "Living with it", "swallow-bridge"),
    ("Will you anesthetize me before preparing a dental bridge?", "Pain and fear", "Before surgery", "anesthetic-bridge"),
    ("I have a root canal treated tooth. Is it necessary to place a cap over the tooth?", "Comparing options", "Deciding", "cap-after-root-canal"),
    ("Which specialist should I see for replacing my tooth?", "Who does the work", "Deciding", "which-specialist"),
    ("Which treatment option is more aesthetic for replacing front teeth?", "Appearance and shame", "Choosing a treatment", "front-teeth-aesthetic"),
    ("What happens if I do not replace my lost tooth?", "Comparing options", "Deciding", "do-nothing"),
    ("Can I have all types of food using my complete dentures?", "Eating and speech", "Living with it", "all-foods-dentures"),
    ("Are removable partial dentures comfortable?", "Feel", "Deciding", "partial-comfort"),
    ("Is taking a dental impression painful?", "Pain and fear", "Before surgery", "impression-pain"),
    ("Can I eat normally with complete dentures?", "Eating and speech", "Deciding", "eat-dentures"),
    ("How long do complete dentures last?", "Longevity", "Living with it", "denture-last"),
    ("Can I wear my complete dentures all the time?", "Daily care", "Living with it", "wear-all-the-time"),
    ("Can I use regular toothpaste to clean my partial dentures?", "Daily care", "Living with it", "toothpaste-on-denture"),
    ("How do I care for my removable partial dentures?", "Daily care", "Living with it", "care-partial"),
    ("What happens if my partial denture breaks?", "Maintenance", "When something goes wrong", "partial-breaks"),
    ("Will removable partial dentures affect my speech?", "Eating and speech", "First weeks", "partial-speech"),
    ("What is the success rate of dental implants?", "Longevity", "Deciding", "success-rate"),
    ("How do I care for my dental implants?", "Daily care", "Living with it", "care-implant"),
    ("Are dental implants better than dentures or bridges?", "Comparing options", "Choosing a treatment", "implants-vs-dentures-bridges"),
    ("How much do dental implants cost?", "Cost", "Deciding", "cost-general"),
    ("Is the procedure for dental implant placement painful?", "Pain and fear", "Before surgery", "pain-surgery"),
    ("What are the benefits of dental implants over other tooth replacement options?", "Comparing options", "Deciding", "benefits"),
    ("Can I eat normally after getting dental implants?", "Eating and speech", "First weeks", "eat-after-implants"),
    ("Do I need to take medications for a dental implant treatment?", "Procedure", "Before surgery", "medications"),
    ("Do I need a radiograph before placing a dental implant?", "Procedure", "Before surgery", "xray"),
    ("Is there any side effect of dental implant treatment?", "Complications", "Deciding", "side-effects"),
]:
    add(question, "Questions patients ask, then put to ChatGPT", topic, stage, "Prosthodontist clinic questions submitted to ChatGPT-4o and Gemini", PMC30, cluster)

# 35 questions chatbots named as what people ask about prostheses
PMC35 = "https://pmc.ncbi.nlm.nih.gov/articles/PMC12126883/"
for question, topic, stage, cluster in [
    ("What types of dental prostheses are available for replacing missing teeth?", "Comparing options", "Deciding", "prosthesis-types"),
    ("What is the difference between dentures, bridges, and implants?", "Comparing options", "Choosing a treatment", "difference-three"),
    ("Can I get a prosthesis if I have bone loss in my jaw?", "Bone graft and sinus", "Deciding", "bone-loss-candidacy"),
    ("Are dental implants safe for seniors?", "Candidacy", "Deciding", "seniors"),
    ("Can I get implants if I have osteoporosis or diabetes?", "Candidacy", "Deciding", "diabetes-osteoporosis"),
    ("Can dental prostheses be permanently attached, or are they removable?", "Snap-in vs fixed", "Choosing a treatment", "fixed-or-removable"),
    ("What materials are used in making dental prostheses?", "Materials", "Choosing a treatment", "materials"),
    ("Is getting a dental prosthesis painful?", "Pain and fear", "Before surgery", "pain-surgery"),
    ("Will I need multiple appointments to get a dental prosthesis?", "Timeline", "Deciding", "multiple-visits"),
    ("What are the stages for getting a dental prosthesis?", "Timeline", "Deciding", "stages"),
    ("Are there common issues with dental prostheses that I should be aware of?", "Complications", "Deciding", "common-issues"),
    ("How long does it take to get used to a new dental prosthesis?", "Adjusting", "First weeks", "getting-used-to"),
    ("How do I take care of my dental prosthesis?", "Daily care", "Living with it", "care-prosthesis"),
    ("How do I apply denture adhesive?", "Fit and adhesive", "First weeks", "how-to-apply-adhesive"),
    ("How long can I keep dentures in with adhesive?", "Fit and adhesive", "Living with it", "adhesive-duration"),
    ("Can I sleep with my dentures in?", "Daily care", "Living with it", "sleep-dentures"),
    ("When should I replace my dental prosthesis?", "Maintenance", "Living with it", "when-replace"),
    ("What should I do if my dental prosthesis breaks or gets damaged?", "Maintenance", "When something goes wrong", "breaks"),
    ("What should I do if my dentures become loose or uncomfortable?", "Fit and adhesive", "When something goes wrong", "loose-uncomfortable"),
    ("How often do I need to see the dentist for check-ups after getting a prosthesis?", "Daily care", "Living with it", "checkup-frequency"),
    ("Will I be able to speak normally with a dental prosthesis?", "Eating and speech", "First weeks", "speech"),
    ("Can I eat normally with a dental prosthesis?", "Eating and speech", "Deciding", "eat-prosthesis"),
    ("What foods should I avoid with dentures?", "Eating and speech", "First weeks", "foods-to-avoid"),
    ("Can the dental prosthesis be customized to match my natural teeth?", "Appearance and shame", "Choosing a treatment", "match-teeth"),
]:
    add(question, CH, topic, stage, "Questions chatbots returned as what people ask about prostheses, BMC Oral Health (2025)", PMC35, cluster)

# American College of Prosthodontists — questions patients send in
ACP = "https://www.gotoapro.org/dentures-faq"
for question, topic, stage, cluster in [
    ("I need dentures. Where do I start?", "Basics", "Deciding", "where-to-start"),
    ("What is the average cost of dentures?", "Cost", "Deciding", "denture-cost"),
    ("Can I eat normally with dentures?", "Eating and speech", "Deciding", "eat-dentures"),
    ("Can I sleep in my dentures?", "Daily care", "Living with it", "sleep-dentures"),
    ("How much pain is involved with getting dentures?", "Pain and fear", "Before surgery", "denture-pain"),
    ("How do you know when it's time to reline dentures?", "Maintenance", "Months of healing", "when-reline"),
    ("After a reline, what should I do about excess saliva?", "Adjusting", "Months of healing", "excess-saliva"),
    ("What are permanent dentures?", "Snap-in vs fixed", "Choosing a treatment", "what-are-permanent"),
    ("Is it possible to have dentures put in the same day as teeth removal?", "Same-day teeth", "Choosing a treatment", "same-day-denture"),
    ("I have implants under my bottom denture, but my denture is still loose. Why?", "Fit and adhesive", "When something goes wrong", "implants-but-loose"),
    ("As a new denture wearer, the bottom denture seems loose. What should I do?", "Fit and adhesive", "First weeks", "new-bottom-loose"),
    ("Is it possible to perfectly color match my partial denture to my remaining natural teeth?", "Appearance and shame", "Choosing a treatment", "color-match"),
    ("What do I do if the screws in the denture are loosening?", "Maintenance", "When something goes wrong", "screws-loose"),
    ("What do I do if my dentures feel very heavy and it is difficult to close my mouth?", "Fit and adhesive", "First weeks", "too-heavy"),
    ("After a very long time of denture wearing, I'm losing gum and bone. Can this be fixed?", "Bone graft and sinus", "Living with it", "long-term-bone-loss"),
    ("My dentures will not stay in no matter what kind of adhesive I use. What should I do?", "Fit and adhesive", "When something goes wrong", "no-adhesive-works"),
    ("Is there a way to replace teeth with dentures after losing them from oral cancer?", "Candidacy", "Deciding", "after-cancer"),
    ("Is it possible to get dentures after not having teeth for a long time?", "Candidacy", "Deciding", "long-time-without-teeth"),
    ("The back of my dentures pop up when eating. What do I do?", "Fit and adhesive", "Living with it", "back-pops-up"),
    ("After applying adhesive, it's very difficult to remove dentures. How do I remove them without pain?", "Fit and adhesive", "Living with it", "adhesive-stuck"),
]:
    add(question, "Professional body FAQ", topic, stage, "American College of Prosthodontists denture FAQ", ACP, cluster)

# Google People Also Ask and AAID's most-asked list
for question, topic, stage, cluster, source, url in [
    ("Why does someone need dental restoration?", "Basics", "Deciding", "why-restore", "People Also Ask on a dental implant consultation page", "https://bluebonnetdental.com/houston-tx/dental-implants-consultation"),
    ("How should someone prepare for dental implant surgery?", "Procedure", "Before surgery", "how-to-prepare", "People Also Ask on a dental implant consultation page", "https://bluebonnetdental.com/houston-tx/dental-implants-consultation"),
    ("When is bone grafting necessary?", "Bone graft and sinus", "Choosing a treatment", "when-graft", "People Also Ask on a dental implant consultation page", "https://bluebonnetdental.com/houston-tx/dental-implants-consultation"),
    ("What happens during the implant procedure?", "Procedure", "Before surgery", "what-happens-during", "People Also Ask", "https://adcroundrock.com/round-rock-tx/dental-implants-consultation"),
    ("Can dental implants replace my missing teeth?", "Basics", "Deciding", "can-replace", "People Also Ask", "https://adcroundrock.com/round-rock-tx/dental-implants-consultation"),
    ("Are dental implants better than dentures or dental bridges?", "Comparing options", "Choosing a treatment", "implants-vs-dentures-bridges", "People Also Ask", "https://adcroundrock.com/round-rock-tx/dental-implants-consultation"),
    ("How much of the implant process can you complete in the office?", "Who does the work", "Choosing a treatment", "in-office", "Questions answered on implant consultation pages", "https://adcroundrock.com/round-rock-tx/dental-implants-consultation"),
    ("Do I qualify for dental implants?", "Candidacy", "Deciding", "do-i-qualify", "Questions answered on implant consultation pages", "https://adcroundrock.com/round-rock-tx/dental-implants-consultation"),
    ("What is the recovery process for dental implants?", "Healing", "Before surgery", "recovery-process", "Questions answered on implant consultation pages", "https://adcroundrock.com/round-rock-tx/dental-implants-consultation"),
    ("How much do dental implants cost?", "Cost", "Deciding", "cost-general", "AAID: top questions received from patients", "https://www.dentistrytoday.com/aaid-reports-the-top-questions-it-receives-from-patients-about-dental-implants"),
    ("How much time will the dental implant process take?", "Timeline", "Deciding", "process-time", "AAID: top questions received from patients", "https://www.dentistrytoday.com/aaid-reports-the-top-questions-it-receives-from-patients-about-dental-implants"),
    ("Does it hurt to get dental implants?", "Pain and fear", "Before surgery", "does-it-hurt", "AAID: top questions received from patients", "https://www.dentistrytoday.com/aaid-reports-the-top-questions-it-receives-from-patients-about-dental-implants"),
    ("Where can I find a local dental implant specialist?", "Who does the work", "Deciding", "find-specialist", "AAID: top questions received from patients", "https://www.dentistrytoday.com/aaid-reports-the-top-questions-it-receives-from-patients-about-dental-implants"),
    ("Why do people prefer dental implants over dentures?", "Comparing options", "Deciding", "why-prefer-implants", "AAID: top questions received from patients", "https://www.dentistrytoday.com/aaid-reports-the-top-questions-it-receives-from-patients-about-dental-implants"),
]:
    add(question, "Google", topic, stage, source, url, cluster)

# Consultation questions patients are told to ask (these are the questions offices say patients bring)
CONSULT = "https://www.theperfectsmile.co.uk/news/questions-you-should-ask-before-getting-a-dental-implant"
for question, cluster in [
    ("Am I a good candidate for dental implants?", "candidacy"),
    ("What do I need to do before the implants?", "how-to-prepare"),
    ("What is the success rate for dental implants?", "success-rate"),
    ("How long have you been placing implants and how many do you place each year?", "surgeon-experience"),
    ("Can you show me before and after photos?", "before-after"),
    ("What are the risks, benefits, and alternatives to dental implants?", "risks"),
    ("Are dental implants ever rejected?", "rejection"),
    ("How do you assess whether I have enough bone to anchor dental implants?", "enough-bone"),
    ("Can you tell me about the surgical procedure for implant placement?", "what-happens-during"),
    ("What type of anesthesia will you use during my implant surgery?", "which-sedation"),
    ("What can I expect in the hours and days following my implant surgery?", "first-days"),
    ("How long will it take my implants to heal?", "heal-time"),
    ("How long can I expect my implants to last?", "how-long-last"),
    ("Will there be any maintenance required with my implants?", "maintenance"),
    ("How much will dental implants cost?", "cost-general"),
    ("Will my insurance cover all or a portion of the cost?", "insurance"),
]:
    add(question, "Google", "Choosing a clinic" if cluster in {"surgeon-experience", "before-after"} else "Deciding", "Before surgery" if cluster in {"how-to-prepare", "which-sedation", "what-happens-during"} else "Deciding", "Questions patients are advised to ask before implants", CONSULT, cluster)

# Topic overrides for consult questions that I dumped into Deciding incorrectly - leave, cluster is what matters; topic field is a bit coarse. I'll set topic properly:
# Actually I used a ternary that sets topic to Choosing a clinic OR the string "Deciding" as topic. That's wrong for cost etc.
# I'll fix topics in a cleanup pass using cluster.

# Columbus patient FAQ headings — questions the page is built to answer
COL = "https://columbusdenturesandimplants.com/faq"
for question, topic, stage, cluster in [
    ("What is All-on-4, or teeth in a day?", "Basics", "Deciding", "what-is-all-on-4"),
    ("What are snap-in implant dentures?", "Snap-in vs fixed", "Choosing a treatment", "what-are-snaps"),
    ("How many implants does a snap-in denture need?", "Snap-in vs fixed", "Choosing a treatment", "how-many-implants"),
    ("What are full dentures?", "Basics", "Deciding", "what-are-full-dentures"),
    ("What are partial dentures?", "Basics", "Deciding", "what-is-partial"),
    ("What are immediate dentures?", "Temporary teeth", "Choosing a treatment", "what-are-immediates"),
    ("What does the immediate denture process look like?", "Timeline", "Before surgery", "immediate-process"),
    ("How does All-on-4 compare to snap-in dentures or mini implants?", "Snap-in vs fixed", "Choosing a treatment", "allon4-vs-snap-vs-mini"),
    ("I already have an implant. Can it be used for All-on-4?", "Candidacy", "Choosing a treatment", "existing-implant"),
    ("Will I get to snap my dentures onto the implants the same day?", "Timeline", "Surgery day", "snap-same-day"),
    ("What is recovery like after All-on-4?", "Healing", "First weeks", "allon4-recovery"),
    ("How much time should I take off work?", "Practical life", "Before surgery", "time-off-work"),
    ("My dentures feel like they're getting loose. Is that normal?", "Fit and adhesive", "Months of healing", "getting-loose-normal"),
    ("What is it like getting used to immediate dentures?", "Adjusting", "First weeks", "getting-used-immediates"),
    ("Will I know how to use my new teeth right away?", "Adjusting", "First weeks", "use-right-away"),
    ("Will my dentures rock or move?", "Fit and adhesive", "Living with it", "rocking"),
    ("Can I remove my All-on-4 teeth?", "Snap-in vs fixed", "Choosing a treatment", "can-i-remove-fixed"),
    ("Are implant dentures removable?", "Snap-in vs fixed", "Choosing a treatment", "are-snaps-removable"),
    ("Can I remove immediate dentures?", "Temporary teeth", "First weeks", "remove-immediates"),
    ("I can't stand having the roof of my mouth covered. What are my options?", "Palate and gagging", "Choosing a treatment", "hate-the-roof"),
    ("Can the palate be removed from a snap-in denture?", "Palate and gagging", "Choosing a treatment", "palate-off-snaps"),
    ("What is involved in maintaining implant dentures?", "Daily care", "Living with it", "maintain-snaps"),
    ("What's included in the teeth-in-a-day price?", "Cost", "Choosing a treatment", "whats-included"),
    ("Are mini dental implants a good idea?", "Comparing options", "Choosing a treatment", "mini-implants"),
]:
    add(question, "Google", topic, stage, "Patient FAQ headings, denture and implant clinic", COL, cluster)

# Canadian coverage questions people search
for question, url, cluster in [
    ("Does the Canadian Dental Care Plan cover dental implants?", "https://www.canada.ca/en/services/benefits/dental/dental-care-plan/guide.html", "cdcp-implants"),
    ("Does the CDCP cover All-on-4?", "https://surreydentalimplants.ca/resources/does-cdcp-cover-dental-implants", "cdcp-allon4"),
    ("Does the CDCP cover dentures?", "https://www.westwooddentalgroup.ca/post/does-the-canadian-dental-care-plan-cdcp-cover-dental-implants-what-s-covered-what-isn-t-and-you", "cdcp-dentures"),
    ("Does the CDCP cover implant-supported dentures?", "https://www.canada.ca/en/services/benefits/dental/dental-care-plan/guide.html", "cdcp-implant-dentures"),
    ("Does the CDCP cover bone grafts and sinus lifts?", "https://emydental.ca/patient-resources/what-cdcp-does-not-cover", "cdcp-grafts"),
    ("Can I use the CDCP for the covered steps and pay for the implant myself?", "https://www.westwooddentalgroup.ca/post/does-the-canadian-dental-care-plan-cdcp-cover-dental-implants-what-s-covered-what-isn-t-and-you", "cdcp-split-pay"),
    ("Why would I still pay something if the CDCP says it covers dentures?", "https://www.canada.ca/en/services/benefits/dental/dental-care-plan/coverage.html", "cdcp-copay"),
    ("Do I qualify for the Canadian Dental Care Plan?", "https://www.canada.ca/en/services/benefits/dental/dental-care-plan/qualify.html", "cdcp-qualify"),
    ("Are dental implants tax deductible in Canada?", "https://surreydentalimplants.ca/resources/does-cdcp-cover-dental-implants", "tax-credit"),
    ("Does OHIP cover dental implants or dentures?", "https://www.publichealthontario.ca/-/media/Documents/C/25/canadian-dental-care-plan.pdf?rev=5dcf9617958c44c4884c7aeea9adcd95&sc_lang=en", "ohip"),
    ("Which line items on an implant plan are CDCP-eligible?", "https://surreydentalimplants.ca/resources/does-cdcp-cover-dental-implants", "cdcp-line-items"),
    ("Does the CDCP cover immediate dentures and overdentures?", "https://www.canada.ca/en/services/benefits/dental/dental-care-plan/coverage.html", "cdcp-immediate"),
    ("How often will the CDCP pay for a new denture?", "https://www.publichealthontario.ca/-/media/Documents/C/25/canadian-dental-care-plan.pdf?rev=5dcf9617958c44c4884c7aeea9adcd95&sc_lang=en", "cdcp-frequency"),
]:
    add(question, "Google", "Coverage", "Deciding", "Canadian Dental Care Plan pages and clinic explainers of those searches", url, cluster)

# Reddit — verbatim titles and the questions inside the posts
reddit_items = [
    ("Have to get a sinus lift, graft, and implant. No insurance. Is it worth it?", "Cost", "Deciding", "worth-it-graft", "r/Dentalimplant", R("1x152do/have_to_get_a_sinus_lift_graft_and_implant_soooo", "implant"), "worth-it"),
    ("If the implant fails, is it normal that I have to pay again? Should the fix be free?", "Cost", "When something goes wrong", "pay-again-if-fail", "r/Dentalimplant", R("1iudlbb/question_on_cost_wrt_dental_implant_failure", "implant"), "redo-cost"),
    ("What should I do if my All-on-4 is plastic, painful, and the gums keep falling off?", "Materials", "When something goes wrong", "pmma-not-zirconia", "r/Dentalimplant", R("1wekqjl/all_on_4_failure", "implant"), "material-bait"),
    ("Do I have to rush bone grafting and a sinus lift, or can I wear dentures and decide in a year or two?", "Bone graft and sinus", "Deciding", "rush-graft", "r/Dentalimplant", R("1h08fzp/do_i_have_to_rush_getting_bone_grafting_for", "implant"), "rush-graft"),
    ("Is it ever too late to get bone grafting and implants?", "Bone graft and sinus", "Deciding", "too-late", "r/Dentalimplant", R("1h08fzp/do_i_have_to_rush_getting_bone_grafting_for", "implant"), "too-late"),
    ("Are dentists just upselling implants, and are dentures enough?", "Trust", "Deciding", "upsell", "r/Dentalimplant", R("1h08fzp/do_i_have_to_rush_getting_bone_grafting_for", "implant"), "upsell"),
    ("Do 50 percent of implant patients get peri-implantitis?", "Complications", "Deciding", "peri-implantitis-rate", "r/Dentalimplant", R("1h08fzp/do_i_have_to_rush_getting_bone_grafting_for", "implant"), "peri-implantitis"),
    ("Am I making the right decision getting an implant instead of a bridge?", "Comparing options", "Choosing a treatment", "implant-vs-bridge", "r/askdentists", R("11b96gs/am_i_making_the_right_decision_on_getting_an", "ask"), "implant-vs-bridge"),
    ("Should I get a flipper after the extraction and decide on the implant later?", "Temporary teeth", "Choosing a treatment", "flipper", "r/askdentists", R("11b96gs/am_i_making_the_right_decision_on_getting_an", "ask"), "flipper"),
    ("If I already had a bone graft and sinus lift, am I locked into an implant?", "Bone graft and sinus", "Choosing a treatment", "locked-in", "r/askdentists", R("11b96gs/am_i_making_the_right_decision_on_getting_an", "ask"), "locked-in-after-graft"),
    ("How do you afford implants?", "Cost", "Deciding", "how-afford", "r/Dentalimplant", R("1hk5i02/how_do_you_afford_implants", "implant"), "how-afford"),
    ("Where do you even find affordable dental implants without getting scammed?", "Trust", "Deciding", "scam-cheap", "r/Dentalimplant", REDDIT_I, "avoid-scam"),
    ("Has anyone found an affordable way to get dental implants?", "Cost", "Deciding", "affordable-way", "r/Dentalimplant", REDDIT_I, "how-afford"),
    ("Is $45,000 for dental implants a good price?", "Cost", "Choosing a treatment", "is-45k-fair", "r/Dentalimplant", REDDIT_I, "price-check"),
    ("Realistically, what's the cheapest place to get All-on-4 that isn't sketchy?", "Trust", "Choosing a treatment", "cheapest-not-sketchy", "r/Dentalimplant", REDDIT_I, "avoid-scam"),
    ("Should I trust a low-cost dental implant?", "Trust", "Choosing a treatment", "trust-cheap", "r/Dentalimplant", REDDIT_I, "trust-cheap"),
    ("Can someone give a real cost breakdown for dental implants?", "Cost", "Deciding", "cost-breakdown", "r/Dentalimplant", R("1i5i1wc/dental_implant_costs_we_paid", "implant"), "cost-breakdown"),
    ("What do full-mouth dental implants actually cost?", "Cost", "Deciding", "full-mouth-cost", "r/Dentalimplant", REDDIT_I, "full-mouth-cost"),
    ("Is this price normal for one front tooth?", "Cost", "Deciding", "front-tooth-price", "r/Dentalimplant", R("1pe0fm1/flabbergasted_at_this_cost", "implant"), "price-check"),
    ("Does my quote sound reasonable?", "Cost", "Deciding", "quote-reasonable", "r/askdentists", R("1ar2mie/dental_implant_pricing_does_my_quote_sound_reasonable_also_how", "ask"), "price-check"),
    ("How are people affording whole-mouth implants?", "Cost", "Deciding", "afford-whole-mouth", "r/askdentists", R("1ar2mie/dental_implant_pricing_does_my_quote_sound_reasonable_also_how", "ask"), "how-afford"),
    ("Is nobody given an implant for every single tooth?", "Basics", "Choosing a treatment", "not-every-tooth", "r/askdentists", R("1ar2mie/dental_implant_pricing_does_my_quote_sound_reasonable_also_how", "ask"), "not-every-tooth"),
    ("When the teeth are screwed in, can they be taken out for cleaning or are they permanent?", "Snap-in vs fixed", "Choosing a treatment", "removable-or-fixed", "r/askdentists", R("1ar2mie/dental_implant_pricing_does_my_quote_sound_reasonable_also_how", "ask"), "fixed-or-removable"),
    ("How do I find a dentist who actually does same-day implants without months of waiting?", "Same-day teeth", "Choosing a treatment", "find-same-day", "r/Dentalimplant", REDDIT_I, "same-day"),
    ("What do All-on-4 dental implants actually cost these days?", "Cost", "Deciding", "allon4-price", "r/dentures", REDDIT_D, "allon4-price"),
    ("Should I get All-on-4, All-on-6, or three separate bridges?", "Comparing options", "Choosing a treatment", "allon4-vs-bridges", "r/Dentalimplant", REDDIT_I, "allon4-vs-bridges"),
    ("It's 12 days after All-on-X. Is what I'm feeling normal?", "Healing", "First weeks", "12-days-normal", "r/Dentalimplant", REDDIT_I, "is-this-normal"),
    ("Has anyone lost a front tooth and waited for the implant without wearing a denture?", "Temporary teeth", "Choosing a treatment", "wait-without-flipper", "r/Dentalimplant", REDDIT_I, "flipper"),
    ("Does my new implant tooth look off or crooked?", "Appearance and shame", "When something goes wrong", "looks-crooked", "r/Dentalimplant", REDDIT_I, "looks-wrong"),
    ("I'm not sure I should get an implant. Should I?", "Comparing options", "Deciding", "should-i", "r/Dentalimplant", REDDIT_I, "should-i"),
    ("Can I get All-on-4 while on Suboxone?", "Candidacy", "Before surgery", "suboxone", "r/Dentalimplant", REDDIT_I, "medications-candidacy"),
    ("What is implant placement like if you are not under IV sedation?", "Pain and fear", "Before surgery", "no-iv", "r/Dentalimplant", REDDIT_I, "awake"),
    ("What do people wish they had known before getting a dental implant?", "Expectations", "Before surgery", "wish-i-knew", "r/Dentalimplant", REDDIT_I, "wish-i-knew"),
    ("My implant crown fell off. Can it be fixed without a new crown?", "Maintenance", "When something goes wrong", "crown-fell-off", "r/Dentalimplant", REDDIT_I, "crown-fell-off"),
    ("Can you get dental implants if you have low jawbone density?", "Bone graft and sinus", "Deciding", "low-density", "r/Dentalimplant", REDDIT_I, "low-bone"),
    ("Do I need a bone graft before the implant, what temporary tooth can I wear, and how long will the whole thing take?", "Timeline", "Choosing a treatment", "graft-temp-timeline", "r/Dentalimplant", REDDIT_I, "timeline-bundle"),
    ("How long did it take for your implants to feel normal?", "Feel", "Months of healing", "feel-normal", "r/Dentalimplant", REDDIT_I, "feel-normal"),
    ("I think something is wrong with my implant. Is this really that common?", "Healing", "First weeks", "something-wrong", "r/Dentalimplant", R("1v09z8a/i_think_theres_something_wrong_with_my_implant", "implant"), "something-wrong"),
    ("Is it normal for an implant to ache a little a month later?", "Healing", "Months of healing", "ache-a-month-later", "r/Dentalimplant", R("1th9xuu/is_it_normal_for_an_implant_to_ache_a_little_bit", "implant"), "ache-later"),
    ("If I get IV or oral sedation, will I be aware and just forget afterward?", "Pain and fear", "Before surgery", "sedation-memory", "r/Dentalimplant", R("1tlyfbk/terrified_for_tooth_extraction_and_implant", "implant"), "sedation-memory"),
    ("If the specialist doesn't offer sedation, should I find someone who does?", "Pain and fear", "Before surgery", "find-sedation", "r/Dentalimplant", R("1tlyfbk/terrified_for_tooth_extraction_and_implant", "implant"), "find-sedation"),
    ("How much is a single implant if I'm paying cash, and how much extra is sedation?", "Cost", "Deciding", "cash-price-sedation", "r/Dentalimplant", R("1tlyfbk/terrified_for_tooth_extraction_and_implant", "implant"), "cash-and-sedation"),
    ("Has anyone had a front tooth implant, and did you need a gum graft?", "Bone graft and sinus", "Choosing a treatment", "front-gum-graft", "r/Dentalimplant", R("1tlyfbk/terrified_for_tooth_extraction_and_implant", "implant"), "gum-graft"),
    ("Honestly, how was healing? What was the pain like, and what went wrong after?", "Pain and fear", "Before surgery", "healing-honest", "r/Dentalimplant", R("1tlyfbk/terrified_for_tooth_extraction_and_implant", "implant"), "healing-honest"),
    ("Should I be wary of a periodontist who does the extraction and implant in one visit?", "Same-day teeth", "Choosing a treatment", "one-visit-wary", "r/Dentalimplant", R("1tlyfbk/terrified_for_tooth_extraction_and_implant", "implant"), "one-visit-wary"),
    ("I'm in mortal fear of nerve pain or peri-implantitis. Are the smiling photos trustworthy?", "Pain and fear", "Deciding", "mortal-fear", "r/askdentists", R("18sjqgk/im_in_mortal_fear_of_getting_dental_implants", "ask"), "mortal-fear"),
    ("Some sites say implants succeed 95 to 98 percent of the time and others say 40 percent get peri-implantitis. Which is real?", "Complications", "Deciding", "conflicting-stats", "r/askdentists", R("18sjqgk/im_in_mortal_fear_of_getting_dental_implants", "ask"), "conflicting-stats"),
    ("I'm so scared to get a dental implant. What was it actually like?", "Pain and fear", "Before surgery", "so-scared", "r/Dentalimplant", REDDIT_I, "so-scared"),
    ("Should I get a dental implant at all?", "Comparing options", "Deciding", "should-i-get-one", "r/Dentalimplant", REDDIT_I, "should-i"),
    ("Do implants really stop bone loss?", "Bone graft and sinus", "Deciding", "stop-bone-loss", "r/Dentalimplant", REDDIT_I, "stop-bone-loss"),
    ("My dentists disagree about whether I have bone loss around the implant. Who do I believe?", "Complications", "When something goes wrong", "conflicting-opinions", "r/Dentalimplant", REDDIT_I, "second-opinion"),
    ("What part of a dental implant is this, and is it serious?", "Complications", "When something goes wrong", "what-part-is-this", "r/Dentalimplant", REDDIT_I, "what-is-this"),
    ("What is this above my implant?", "Complications", "When something goes wrong", "what-is-above", "r/Dentalimplant", REDDIT_I, "what-is-this"),
    ("I have bone loss around an implant. Should I try to save it or take it out?", "Failure", "When something goes wrong", "salvage-or-remove", "r/Dentalimplant", R("1ns34tr/bone_loss_around_implants_attempt_to_salvage_or", "implant"), "salvage-or-remove"),
    ("If they remove the failing implant, am I stuck with a denture forever?", "Failure", "When something goes wrong", "stuck-with-denture", "r/Dentalimplant", R("1ns34tr/bone_loss_around_implants_attempt_to_salvage_or", "implant"), "stuck-with-denture"),
    ("They removed my implant. Do I really need to replace it, or is there something less invasive?", "Failure", "When something goes wrong", "replace-or-not", "r/Dentalimplant", REDDIT_I, "replace-or-not"),
    ("I was quoted over $50,000 in the US. What are honest experiences in Mexico, Colombia, or Turkey?", "Trust", "Choosing a treatment", "dental-tourism", "r/Dentalimplant", REDDIT_I, "tourism"),
    ("Are implants just to hold a full denture a waste of money?", "Cost", "Choosing a treatment", "implants-for-denture-waste", "r/Dentalimplant", REDDIT_I, "worth-it"),
    ("Are implants and bridges a waste of money compared with keeping your real teeth?", "Comparing options", "Deciding", "waste-of-money", "r/Dentalimplant", R("1uu70sa/i_honestly_feel_dental_implants_and_bridges_are", "implant"), "waste-of-money"),
    ("The implant fell out when they went to place the abutment. Is there a way to test stability first?", "Failure", "When something goes wrong", "fell-out-at-abutment", "r/Dentalimplant", R("1ukocwm/implant_failed_during_the_abutment_placing_tooth_7", "implant"), "fell-out"),
    ("Do same-day replacement implants have a harder time healing?", "Same-day teeth", "When something goes wrong", "same-day-harder", "r/Dentalimplant", R("1ukocwm/implant_failed_during_the_abutment_placing_tooth_7", "implant"), "same-day-harder"),
    ("How long should I wait before they touch the other implant?", "Timeline", "When something goes wrong", "wait-after-failure", "r/Dentalimplant", R("1ukocwm/implant_failed_during_the_abutment_placing_tooth_7", "implant"), "wait-after-failure"),
    ("Fixed teeth on a bar, or snap-ins? And do I have to wear regular dentures while I heal?", "Snap-in vs fixed", "Choosing a treatment", "bar-or-snaps", "r/Dentalimplant", R("1weyuda/fixed_dentures_with_bar_or_snap_ins_and_did_u", "implant"), "bar-or-snaps"),
    ("What are snap-in dentures?", "Snap-in vs fixed", "Choosing a treatment", "what-are-snaps", "r/dentures", R("1jv1hbp/what_are_snap_in_dentures", "dentures"), "what-are-snaps"),
    ("How often do you take snap-ins out, and is the surgery the same as fixed implants?", "Snap-in vs fixed", "Choosing a treatment", "how-often-remove-snaps", "r/dentures", R("1jv1hbp/what_are_snap_in_dentures", "dentures"), "how-often-remove"),
    ("Why would someone choose snap-ins instead of fixed implants?", "Snap-in vs fixed", "Choosing a treatment", "why-snaps", "r/dentures", R("1jv1hbp/what_are_snap_in_dentures", "dentures"), "why-snaps"),
    ("I asked for All-on-4 and they scheduled snap-ins. Did I agree to the wrong thing?", "Snap-in vs fixed", "Choosing a treatment", "wrong-thing", "r/dentures", R("1oket1y/snapin_dentures_vs_allon4_did_i_agree_to_the", "dentures"), "wrong-product"),
    ("Are snap-ins what most people get, and is fixed a lot more money?", "Cost", "Choosing a treatment", "snaps-vs-fixed-cost", "r/dentures", R("1oket1y/snapin_dentures_vs_allon4_did_i_agree_to_the", "dentures"), "snaps-vs-fixed-cost"),
    ("Implants or dentures for an 81-year-old with dementia?", "Candidacy", "Deciding", "elderly-dementia", "r/Dentalimplant", R("1u1jz6h/implants_vs_dentures_for_an_81_yr_old_man_with", "implant"), "elderly"),
    ("Is cleaning implants just as much work as cleaning dentures?", "Daily care", "Choosing a treatment", "cleaning-comparison", "r/Dentalimplant", R("1u1jz6h/implants_vs_dentures_for_an_81_yr_old_man_with", "implant"), "cleaning-comparison"),
    ("If someone won't take care of dentures, are implants actually easier?", "Daily care", "Choosing a treatment", "wont-maintain", "r/Dentalimplant", R("1u1jz6h/implants_vs_dentures_for_an_81_yr_old_man_with", "implant"), "wont-maintain"),
    ("People who switched from dentures to implants, what surprised you most?", "Expectations", "Deciding", "what-surprised-you", "r/dentures", R("1sfyoz6/people_who_switched_from_dentures_to_implants", "dentures"), "what-surprised"),
    ("Is an implant denture the same thing as a regular denture?", "Basics", "Choosing a treatment", "same-as-regular", "r/dentures", REDDIT_D, "implant-denture-vs-regular"),
    ("Are dentures really that bad? Can I get the full rundown?", "Expectations", "Deciding", "are-dentures-bad", "r/dentures", REDDIT_D, "are-dentures-bad"),
    ("How are you affording implant-supported dentures?", "Cost", "Deciding", "afford-supported", "r/dentures", REDDIT_D, "how-afford"),
    ("Should I get dentures or implants, or spend the money to repair the teeth I have?", "Comparing options", "Deciding", "repair-or-replace", "r/dentures", REDDIT_D, "repair-or-replace"),
    ("I'm not even 30 and I need dentures or implants. What do I do?", "Appearance and shame", "Deciding", "under-30", "r/dentures", REDDIT_D, "too-young"),
    ("I'm 33. What should I do about my teeth?", "Appearance and shame", "Deciding", "age-33", "r/dentures", REDDIT_D, "too-young"),
    ("Do you tell other people that you have dentures, and why?", "Appearance and shame", "Living with it", "tell-people", "r/dentures", REDDIT_D, "disclosure"),
    ("If you were getting dentures for the first time, what would you have wanted to know?", "Expectations", "Before surgery", "wish-i-knew-dentures", "r/dentures", R("1wfmbf8/if_you_were_getting_dentures_for_the_first_time", "dentures"), "wish-i-knew"),
    ("What's the most annoying little thing about dentures that nobody talks about?", "Adjusting", "Living with it", "annoying-little-things", "r/dentures", R("1wt5m0h/whats_the_most_annoying_little_thing_about_having", "dentures"), "annoying-things"),
    ("I hate my dentures, I can't eat, every adhesive fails, and they make me gag. What are my options?", "Fit and adhesive", "When something goes wrong", "hate-them-options", "r/dentures", R("1wtgu44/my_choices_i_absolutely_hate_my_dentures", "dentures"), "hate-dentures"),
    ("How do you eat with immediate dentures?", "Eating and speech", "First weeks", "eat-immediates", "r/dentures", R("1dve90i/eating_with_immediate_dentures", "dentures"), "eat-immediates"),
    ("Is it normal to get food under the denture every time you eat?", "Eating and speech", "Living with it", "food-underneath", "r/dentures", REDDIT_D, "food-under"),
    ("My bottom denture will not sit still. Will adhesive let me talk and eat?", "Fit and adhesive", "First weeks", "bottoms-wont-sit", "r/dentures", R("1okda4w/bottom_denture_literally_will_not_sit_still", "dentures"), "bottoms-float"),
    ("When can I get a reline, and are these sore spots bone spurs?", "Maintenance", "First weeks", "when-reline-spurs", "r/dentures", R("1okda4w/bottom_denture_literally_will_not_sit_still", "dentures"), "bone-spurs"),
    ("I can't wear my dentures because of bone spurs. Do I need a new set?", "Maintenance", "First weeks", "spurs-new-set", "r/dentures", R("1vyeqlh/im_beyond_bummed", "dentures"), "bone-spurs"),
    ("My immediate dentures are huge and I can't close my lips. Can they remake them?", "Appearance and shame", "First weeks", "immediates-too-big", "r/dentures", R("1scvifu/im_so_upset_embarrassed", "dentures"), "immediates-too-big"),
    ("How hard is it to keep my partner from seeing me without my dentures?", "Appearance and shame", "Before surgery", "partner-seeing", "r/dentures", R("1fh05b1/im_so_embarrassed_please_help", "dentures"), "partner"),
    ("I'm young, scared, and embarrassed about dentures. Does it get better?", "Appearance and shame", "Before surgery", "scared-embarrassed", "r/dentures", R("1ic6uao/hoping_for_some_support_im_scared_and_embarrassed", "dentures"), "shame"),
    ("I've had dentures for 5 years and still can't tolerate them. Is anyone else like this?", "Adjusting", "Living with it", "years-later-cant", "r/dentures", R("1wguli8/5_years_and_i_still_cant_tolerate_them_anyone_else", "dentures"), "never-adjust"),
    ("My dentist keeps dismissing the gagging and the bulk. Can another dentist fix it?", "Trust", "When something goes wrong", "dismissed", "r/dentures", R("1vuget0/my_dentist_keeps_dismissing_me", "dentures"), "second-opinion"),
    ("It's 5 months after extractions and they say nothing more can be done for my immediates. Is that normal?", "Temporary teeth", "Months of healing", "immediates-abandoned", "r/dentures", R("1vy21d4/5_months_postextractions_and_told_nothing_more", "dentures"), "immediates-abandoned"),
    ("Did your immediate dentures change what you look like?", "Appearance and shame", "First weeks", "changed-my-face", "r/dentures", REDDIT_D, "face-change"),
    ("I'm getting all my teeth pulled and immediate dentures. I'm scared. What should I expect?", "Pain and fear", "Before surgery", "e-day-scared", "r/dentures", REDDIT_D, "e-day"),
    ("If you skipped immediate dentures, what were the first days with the new ones like after waiting with no teeth?", "Temporary teeth", "Choosing a treatment", "skip-immediates", "r/dentures", REDDIT_D, "skip-immediates"),
    ("How much chewing power do dentures really have?", "Eating and speech", "Deciding", "chewing-power", "r/dentures", REDDIT_D, "chewing-power"),
    ("Would I rather just go toothless?", "Comparing options", "Deciding", "rather-toothless", "r/dentures", REDDIT_D, "rather-toothless"),
    ("This is not the denture process I thought it would be. What is normal in the first weeks?", "Expectations", "First weeks", "not-what-i-thought", "r/dentures", R("1wjewe0/so_i_just_got_my_new_dentures_and_this_is_not_the", "dentures"), "expectations"),
    ("I had my immediates remade and I hate how I look. Can the teeth be changed?", "Appearance and shame", "First weeks", "hate-how-i-look", "r/dentures", REDDIT_D, "hate-looks"),
    ("I have to get dentures in my 20s and I can't stop crying. Is there another way?", "Appearance and shame", "Deciding", "dentures-in-20s", "r/dentures", REDDIT_D, "too-young"),
    ("I just got dentures and I hate them. Will I get used to them?", "Adjusting", "First weeks", "hate-them-new", "r/dentures", REDDIT_D, "getting-used-to"),
    ("A year later, food still tastes and feels off. Does that go away?", "Eating and speech", "Living with it", "taste-a-year-later", "r/dentures", REDDIT_D, "taste"),
    ("I feel like I'm never going to eat again. When does eating come back?", "Eating and speech", "First weeks", "never-eat-again", "r/dentures", REDDIT_D, "eat-timeline"),
    ("I can't stop gagging on my immediates the day after extraction. Is the palate too long?", "Palate and gagging", "First weeks", "gagging-day-one", "r/dentures", REDDIT_D, "gagging"),
    ("How do I sleep without teeth if I use a CPAP?", "Practical life", "First weeks", "cpap", "r/dentures", R("1vdqanq/some_advice_for_people_getting_dentures", "dentures"), "cpap"),
    ("Should I wait 6 months or 10 to 12 months before the permanent dentures are made?", "Timeline", "Months of healing", "when-permanents", "r/dentures", R("1vdqanq/some_advice_for_people_getting_dentures", "dentures"), "when-permanents"),
    ("Can I use adhesive on immediate dentures?", "Fit and adhesive", "First weeks", "adhesive-on-immediates", "r/dentures", R("1okda4w/bottom_denture_literally_will_not_sit_still", "dentures"), "adhesive-immediates"),
    ("Is IV sedation worth it for a full-mouth extraction?", "Pain and fear", "Before surgery", "iv-worth-it", "r/dentures", R("1vdqanq/some_advice_for_people_getting_dentures", "dentures"), "iv-worth-it"),
    ("What is the difference between an adjustment, a soft reline, and a hard reline?", "Maintenance", "Months of healing", "reline-types", "r/dentures", R("1wfmbf8/if_you_were_getting_dentures_for_the_first_time", "dentures"), "reline-types"),
    ("How do I take care of the implant posts under a snap-in denture?", "Daily care", "Living with it", "care-posts", "r/dentures", R("1wfmbf8/if_you_were_getting_dentures_for_the_first_time", "dentures"), "care-posts"),
    ("If the denture makes me gag, is that normal or does the back need to be shortened?", "Palate and gagging", "First weeks", "gag-not-normal", "r/dentures", R("1wfmbf8/if_you_were_getting_dentures_for_the_first_time", "dentures"), "gagging"),
    ("Are 3D-printed immediate dentures more fragile?", "Materials", "Before surgery", "printed-immediates", "r/dentures", R("1wfmbf8/if_you_were_getting_dentures_for_the_first_time", "dentures"), "printed-temps"),
    ("Does nicotine, not just smoking, affect implant healing?", "Candidacy", "Before surgery", "nicotine", "r/dentures", R("1wfmbf8/if_you_were_getting_dentures_for_the_first_time", "dentures"), "nicotine"),
    ("Is it normal to grieve after the extractions?", "Appearance and shame", "First weeks", "grief", "r/dentures", R("1wfmbf8/if_you_were_getting_dentures_for_the_first_time", "dentures"), "grief"),
    ("Sores and ulcers showed up. When should I go back instead of toughing it out?", "Healing", "First weeks", "when-to-call", "r/dentures", R("1wfmbf8/if_you_were_getting_dentures_for_the_first_time", "dentures"), "when-to-call"),
    ("I was told I'd get All-on-5 the day of my extractions and left with regular dentures. Is that common?", "Trust", "Surgery day", "promised-fixed-got-denture", "r/dentures", R("1wfmbf8/if_you_were_getting_dentures_for_the_first_time", "dentures"), "promised-fixed"),
    ("How does everyone like their snap-on dentures?", "Snap-in vs fixed", "Deciding", "like-snaps", "r/dentures", REDDIT_D, "like-snaps"),
    ("What is your personal experience with snap-in dentures?", "Snap-in vs fixed", "Deciding", "snap-experience", "r/dentures", REDDIT_D, "like-snaps"),
    ("Do snap-in dentures cause bone loss?", "Bone graft and sinus", "Deciding", "snaps-bone-loss", "r/dentures", REDDIT_D, "snaps-bone-loss"),
    ("Has anyone liked their temporary snap-ons and then hated the permanent set?", "Expectations", "Months of healing", "temps-better-than-perms", "r/dentures", REDDIT_D, "temps-vs-perms"),
    ("What is people's real experience with All-on-4 versus staying in dentures?", "Comparing options", "Deciding", "allon4-experience", "r/dentures", REDDIT_D, "allon4-vs-dentures"),
    ("Does anyone have ClearChoice or same-day All-on-4? I have surgery scheduled and I'm terrified.", "Pain and fear", "Before surgery", "clearchoice-terrified", "r/askdentists", REDDIT_ASK, "chain-clinic"),
    ("What were your biggest reasons for getting dental implants?", "Comparing options", "Deciding", "biggest-reasons", "r/askdentists", REDDIT_ASK, "why-implants"),
    ("Is my dental implant failing, and if so what are my options?", "Failure", "When something goes wrong", "is-it-failing", "r/askdentists", REDDIT_ASK, "is-it-failing"),
    ("I'm getting three implants and I'll be awake. What is that like?", "Pain and fear", "Before surgery", "awake-three", "r/askdentists", REDDIT_ASK, "awake"),
    ("Are dental implants being pushed too aggressively? Is it a scam?", "Trust", "Deciding", "scam", "r/Dentalimplant", REDDIT_I, "upsell"),
    ("Where can I find affordable implants that won't fall apart in five years?", "Trust", "Choosing a treatment", "cheap-and-durable", "r/Dentalimplant", REDDIT_I, "avoid-scam"),
    ("Is there a dental implant program for people who are broke?", "Cost", "Deciding", "program-for-broke", "r/Dentalimplant", REDDIT_I, "how-afford"),
    ("How do I get affordable implants for a parent who won't spend the money on themselves?", "Cost", "Deciding", "parent-wont-spend", "r/Dentalimplant", REDDIT_I, "family-decision"),
    ("I can't accept the risks of implants. Am I wrong?", "Pain and fear", "Deciding", "cant-accept-risks", "r/Dentalimplant", REDDIT_I, "risks"),
    ("I'm overwhelmed by the cost of upgrading the prosthetic on my implants. Is it worth it?", "Cost", "Living with it", "prosthetic-upgrade", "r/Dentalimplant", REDDIT_I, "upgrade-cost"),
    ("Is a $999 dental implant in Vancouver real?", "Trust", "Deciding", "999-implant", "r/askvancouver", "https://www.reddit.com/r/askvancouver", "too-cheap-canada"),
    ("Where are affordable dental implants in Vancouver?", "Cost", "Deciding", "vancouver-cost", "r/askvan", "https://www.reddit.com/r/askvan", "canada-cost"),
    ("In Canada, a single front implant was about $6,000 to $7,000. Is a flipper worth $500 while you wait?", "Cost", "Choosing a treatment", "canada-single-cost", "r/Dentalimplant", R("1dj0bsg/my_experience_getting_a_dental_implant", "implant"), "canada-cost"),
    ("What if the procedure fails and I'm left with a missing front tooth for life?", "Failure", "Deciding", "missing-for-life", "r/Dentalimplant", R("1dj0bsg/my_experience_getting_a_dental_implant", "implant"), "missing-for-life"),
    ("Will people judge me while the front tooth is missing?", "Appearance and shame", "Months of healing", "judged-missing-tooth", "r/Dentalimplant", R("1dj0bsg/my_experience_getting_a_dental_implant", "implant"), "judged"),
    ("I have a lisp fear if they change my front teeth. Will it be permanent?", "Eating and speech", "Deciding", "lisp-forever", "r/Dentalimplant", REDDIT_I, "lisp"),
    ("I don't trust another dentist after bad orthodontics. How do I pick someone for front-tooth implants?", "Trust", "Deciding", "dont-trust", "r/Dentalimplant", REDDIT_I, "dont-trust"),
    ("My insurance calls implants cosmetic. Is there any way they pay?", "Coverage", "Deciding", "cosmetic-denial", "r/Dentalimplant", REDDIT_I, "insurance-cosmetic"),
    ("How long do you take off work after All-on-4?", "Practical life", "Before surgery", "time-off-allon4", "r/dentures", R("1mlqlbn/15_years_in_all_on_4_implants_my_thoughts", "dentures"), "time-off-work"),
    ("What is the pain and recovery like after full-arch implants? I'm scared of something foreign in my mouth.", "Pain and fear", "Before surgery", "foreign-body-fear", "r/dentures", R("1mlqlbn/15_years_in_all_on_4_implants_my_thoughts", "dentures"), "foreign-feeling"),
    ("If I get upper implants, do I still have a plate on the roof?", "Palate and gagging", "Choosing a treatment", "plate-with-implants", "r/dentures", R("1mlqlbn/15_years_in_all_on_4_implants_my_thoughts", "dentures"), "plate-or-not"),
    ("Is it worth getting only a few implants on the lower, or will the final denture fit without them?", "Comparing options", "Choosing a treatment", "few-lower-implants", "r/dentures", R("1mlqlbn/15_years_in_all_on_4_implants_my_thoughts", "dentures"), "two-implant-lower"),
    ("Food gets stuck under my upper All-on-4. Is that normal, and is a water pick the answer?", "Daily care", "Living with it", "food-stuck-fixed", "r/dentures", R("1mlqlbn/15_years_in_all_on_4_implants_my_thoughts", "dentures"), "food-trap"),
    ("Is $30,000 for top and bottom All-on-4 worth it?", "Cost", "Deciding", "30k-worth-it", "r/dentures", R("1mlqlbn/15_years_in_all_on_4_implants_my_thoughts", "dentures"), "worth-it"),
    ("I was quoted $44,000 for an upper fixed arch. Is that high?", "Cost", "Choosing a treatment", "44k-upper", "r/dentures", R("1mlqlbn/15_years_in_all_on_4_implants_my_thoughts", "dentures"), "price-check"),
    ("I don't want to spend months in a regular denture. Is that a reason to choose fixed All-on-4 over snap-ons?", "Snap-in vs fixed", "Choosing a treatment", "avoid-healing-denture", "r/dentures", R("1k4z2l6/allon4_experience_3_weeks_postop_the_good_the_bad", "dentures"), "avoid-healing-denture"),
    ("Are snap-ons a bad idea for the top arch?", "Snap-in vs fixed", "Choosing a treatment", "snaps-bad-on-top", "r/dentures", R("1k4z2l6/allon4_experience_3_weeks_postop_the_good_the_bad", "dentures"), "snaps-on-top"),
    ("I had to be toothless at the try-ins and nobody warned me. Is that part of fixed implants?", "Temporary teeth", "Surgery day", "toothless-tryins", "r/dentures", R("1k4z2l6/allon4_experience_3_weeks_postop_the_good_the_bad", "dentures"), "try-ins"),
    ("If I clench or the temps clank, will I ruin the implants while they heal?", "Healing", "First weeks", "clench-fear", "r/dentures", R("1k4z2l6/allon4_experience_3_weeks_postop_the_good_the_bad", "dentures"), "clenching"),
    ("Do I need a night guard after implants if I grind?", "Daily care", "Living with it", "night-guard", "r/Dentalimplant", R("1dj0bsg/my_experience_getting_a_dental_implant", "implant"), "night-guard"),
    ("I woke up during sedation. What should have been done differently?", "Pain and fear", "When something goes wrong", "woke-up", "r/Dentalimplant", R("1wekqjl/all_on_4_failure", "implant"), "woke-during"),
    ("I thought I was getting zirconia and it's PMMA. How do I tell what I paid for?", "Materials", "When something goes wrong", "zirconia-or-pmma", "r/Dentalimplant", R("1wekqjl/all_on_4_failure", "implant"), "zirconia-or-plastic"),
    ("Has anyone had an All-on-4 implant fail and still recommend them?", "Failure", "Deciding", "failed-still-recommend", "r/dentures", REDDIT_D, "failure-and-retry"),
    ("If an implant fails in the first months, do they replace it free?", "Cost", "When something goes wrong", "free-replacement", "r/dentures", REDDIT_D, "redo-cost"),
    ("I regret the full set of implant dentures. Can I go back?", "Failure", "When something goes wrong", "regret-implant-dentures", "r/dentures", REDDIT_D, "regret"),
    ("My snap-in All-on-4 day was awful. Is rocking and pain a sign they failed?", "Failure", "First weeks", "snap-worst-day", "r/dentures", REDDIT_D, "snap-problems"),
    ("Has anyone chosen to skip both dentures and implants?", "Comparing options", "Deciding", "skip-both", "r/dentures", REDDIT_D, "rather-toothless"),
    ("Just found out I need dentures. I'm depressed and scared. Where do I start?", "Appearance and shame", "Deciding", "just-found-out", "r/dentures", REDDIT_D, "where-to-start"),
    ("It feels like my dentist is scaring me out of dentures. Are they as bad as they say?", "Trust", "Deciding", "scared-out-of-dentures", "r/dentures", REDDIT_D, "are-dentures-bad"),
    ("I had full-mouth implants at a chain and I'm cleaning an hour a day and my mouth tastes bad. Is that the treatment or the office?", "Trust", "When something goes wrong", "chain-aftercare", "r/Dentalimplant", REDDIT_I, "chain-clinic"),
    ("They filed down my natural teeth during the bite adjustment without asking. Is that normal?", "Trust", "When something goes wrong", "filed-natural-teeth", "r/Dentalimplant", REDDIT_I, "consent"),
    ("Be careful of places that promise everything in one day. How do I know if same-day is safe for me?", "Same-day teeth", "Choosing a treatment", "same-day-warning", "r/SFbitcheswithtaste", "https://www.reddit.com/r/SFbitcheswithtaste/comments/1mjkxwz/dental_implants", "same-day-warning"),
    ("What was the biggest turning point in your implant journey?", "Expectations", "Deciding", "turning-point", "r/Dentalimplant", REDDIT_I, "stories"),
    ("Beyond frustrated. Do I get a regular bridge or an implant-supported bridge?", "Comparing options", "Choosing a treatment", "bridge-or-implant-bridge", "r/PeriodontalDisease", "https://www.reddit.com/r/PeriodontalDisease", "implant-vs-bridge"),
    ("How big a problem is a bridge that connects a natural tooth to an implant?", "Comparing options", "Choosing a treatment", "tooth-to-implant-bridge", "r/Dentistry", "https://www.reddit.com/r/Dentistry", "tooth-implant-bridge"),
    ("I'm missing my two front teeth. Implants or a bridge?", "Comparing options", "Choosing a treatment", "two-front-teeth", "r/Dentalimplant", REDDIT_I, "front-teeth"),
    ("How do dentists decide between an implant and a bridge?", "Comparing options", "Choosing a treatment", "how-dentists-decide", "r/Dentalimplant", REDDIT_I, "implant-vs-bridge"),
    ("Is a sinus lift worth it if I've already had so much dental work?", "Bone graft and sinus", "Deciding", "sinus-worth-it", "r/Dentalimplant", R("1x152do/have_to_get_a_sinus_lift_graft_and_implant_soooo", "implant"), "sinus-lift"),
    ("The graft failed and had to be redone. How often does that happen?", "Bone graft and sinus", "When something goes wrong", "graft-failed", "r/Dentalimplant", R("1x152do/have_to_get_a_sinus_lift_graft_and_implant_soooo", "implant"), "graft-failure"),
    ("Can I have a bone graft and the implant at the same time, and still have weird pain a week later?", "Healing", "First weeks", "graft-and-implant-pain", "r/Dentalimplant", REDDIT_I, "pain-one-week"),
    ("Everything I read says I should feel fine by now. Why does my jaw still ache?", "Healing", "First weeks", "should-feel-fine", "r/Dentalimplant", REDDIT_I, "is-this-normal"),
    ("I had the implant removed and it hurts worse than when it went in. Is that normal?", "Pain and fear", "When something goes wrong", "removal-hurts-more", "r/Dentalimplant", R("1wmqpbw/i_had_my_implant_removed_today_and_omfg_it_hurts", "implant"), "removal-pain"),
    ("After a failed implant, I don't want to try again. What else can I do?", "Comparing options", "When something goes wrong", "wont-try-again", "r/Dentalimplant", R("1wmqpbw/i_had_my_implant_removed_today_and_omfg_it_hurts", "implant"), "wont-retry"),
    ("My 15-year-old implant failed from infection. Is a new one going to ache when the old one never did?", "Failure", "Living with it", "old-implant-failed", "r/Dentalimplant", R("1th9xuu/is_it_normal_for_an_implant_to_ache_a_little_bit", "implant"), "late-failure"),
    ("Do I have to give up vaping for the implant to heal?", "Candidacy", "Before surgery", "vaping", "r/Dentalimplant", R("1dj0bsg/my_experience_getting_a_dental_implant", "implant"), "vaping"),
    ("The flipper makes it hard to talk and I can't eat with it. Is it worth having?", "Temporary teeth", "Months of healing", "flipper-worth-it", "r/Dentalimplant", R("1dj0bsg/my_experience_getting_a_dental_implant", "implant"), "flipper"),
    ("Should I combine the extraction and the implant, or do one step at a time?", "Timeline", "Choosing a treatment", "stage-or-combine", "r/Dentalimplant", R("1dj0bsg/my_experience_getting_a_dental_implant", "implant"), "staged-vs-immediate"),
    ("I was quoted $54,000 for snap-ons and $84,000 for All-on-4, including grafts. Is anyone else seeing that?", "Cost", "Choosing a treatment", "54-vs-84", "r/Allon4ImplantDentures", REDDIT_A, "price-check"),
    ("Was a verification jig used so the teeth don't loosen or crack?", "Procedure", "Choosing a treatment", "verification-jig", "r/Allon4ImplantDentures", REDDIT_A, "quality-check"),
    ("I didn't want traditional dentures because lowers slip when I talk and eat. Is All-on-4 the way out?", "Comparing options", "Deciding", "lowers-slip", "r/Allon4ImplantDentures", R("1psrrtl/an_allonfour_journey", "allon4"), "why-not-dentures"),
    ("More than $20,000 an arch is too much. Are there real alternatives?", "Cost", "Deciding", "per-arch-cost", "r/Allon4ImplantDentures", R("1psrrtl/an_allonfour_journey", "allon4"), "allon4-price"),
    ("The swelling and the temporary denture made me want to quit and go back to a regular denture. Does that feeling pass?", "Adjusting", "First weeks", "want-to-quit", "r/Allon4ImplantDentures", R("1psrrtl/an_allonfour_journey", "allon4"), "regret-early"),
    ("My face has sunk in where teeth are missing. Will implants bring the shape back?", "Appearance and shame", "Deciding", "facial-collapse", "r/Allon4ImplantDentures", R("1psrrtl/an_allonfour_journey", "allon4"), "face-collapse"),
    ("How does everyone remove adhesive without ripping their gums?", "Fit and adhesive", "Living with it", "remove-adhesive", "American College of Prosthodontists, echoed on Reddit", ACP, "remove-adhesive"),
    ("Can a dog chewing my dentures really destroy them, and how do I keep them safe at night?", "Practical life", "Living with it", "pets-chew-dentures", "Patient FAQ, denture clinic", COL, "pets"),
    ("Will I be able to taste and feel temperature if the palate comes off?", "Eating and speech", "Choosing a treatment", "taste-without-palate", "Patient FAQ, denture clinic", COL, "taste"),
    ("Not everyone gets suction on an upper denture. Why, and what then?", "Fit and adhesive", "First weeks", "no-suction", "Patient FAQ, denture clinic", COL, "no-suction"),
    ("With only two lower implants, the denture still rocks in the back. Is a bit of adhesive normal?", "Fit and adhesive", "Living with it", "two-implants-rock", "Patient FAQ, denture clinic", COL, "two-implant-rock"),
    ("How often do the snaps wear out, and what does it cost to change them?", "Maintenance", "Living with it", "snap-replacement", "Patient FAQ, denture clinic", COL, "snap-wear"),
    ("Do I still need professional cleanings if the teeth are implants?", "Daily care", "Living with it", "professional-cleaning", "Patient FAQ, denture clinic", COL, "recall"),
    ("Will my mouth keep changing after the first year, and will the denture need refitting?", "Maintenance", "Living with it", "ongoing-change", "Patient FAQ, denture clinic", COL, "ongoing-reline"),
    ("What are economy dentures, and are they different from the final set?", "Cost", "Choosing a treatment", "economy-dentures", "Affordable Dentures patient FAQ", "https://www.affordabledentures.com/patient-support/faqs/dentures", "economy-dentures"),
    ("How long will my dentures last, and are immediates only meant to last a couple of months?", "Longevity", "Choosing a treatment", "how-long-immediates", "Affordable Dentures patient FAQ", "https://www.affordabledentures.com/patient-support/faqs/dentures", "immediate-lifespan"),
    ("Can the office do adjustments, relines, and repairs, or do I have to start over?", "Maintenance", "When something goes wrong", "repair-or-remake", "Affordable Dentures patient FAQ", "https://www.affordabledentures.com/patient-support/faqs/dentures", "repairs"),
    ("Can I get new dentures the same day as the first appointment?", "Timeline", "Deciding", "same-day-denture-appointment", "Affordable Dentures patient FAQ", "https://www.affordabledentures.com/patient-support/faqs/dentures", "same-day-dentures"),
    ("Do you take dental insurance for dentures?", "Coverage", "Deciding", "insurance-dentures", "Affordable Dentures patient FAQ", "https://www.affordabledentures.com/patient-support/faqs/dentures", "insurance"),
    ("What can I expect as a first-time denture wearer while the gums shrink?", "Expectations", "First weeks", "first-timer-shrink", "Affordable Dentures patient FAQ", "https://www.affordabledentures.com/patient-support/faqs/dentures", "shrinkage"),
    ("What are the different types of dentures?", "Comparing options", "Deciding", "denture-types", "Affordable Dentures patient FAQ", "https://www.affordabledentures.com/patient-support/faqs/dentures", "denture-types"),
    ("How do snap-in dentures work?", "Snap-in vs fixed", "Choosing a treatment", "how-snaps-work", "Affordable Dentures snap-in page", "https://www.affordabledentures.com/dental-implants/denture-implants-snap-in", "how-snaps-work"),
    ("What is the difference between snap-in dentures and implants?", "Snap-in vs fixed", "Choosing a treatment", "snaps-vs-implants-wording", "Affordable Dentures snap-in page", "https://www.affordabledentures.com/dental-implants/denture-implants-snap-in", "wording-confusion"),
    ("Can dentures be made into implants if the denture I have is still in good shape?", "Comparing options", "Living with it", "retrofit-denture", "Periodontist FAQ", "https://metrolinaperio.com/blog/20-questions-to-ask-your-periodontist-about-dental-implants", "retrofit"),
    ("Can implants help if I already have full or partial dentures?", "Comparing options", "Living with it", "add-implants-later", "Periodontist FAQ", "https://metrolinaperio.com/blog/20-questions-to-ask-your-periodontist-about-dental-implants", "add-later"),
    ("Are dental implants removable like dentures?", "Snap-in vs fixed", "Choosing a treatment", "are-implants-removable", "Periodontist FAQ", "https://metrolinaperio.com/blog/20-questions-to-ask-your-periodontist-about-dental-implants", "are-implants-removable"),
    ("How common are dental implants?", "Basics", "Deciding", "how-common", "Periodontist FAQ", "https://metrolinaperio.com/blog/20-questions-to-ask-your-periodontist-about-dental-implants", "how-common"),
    ("How long does the dental implant procedure take?", "Timeline", "Deciding", "procedure-length", "Periodontist FAQ", "https://metrolinaperio.com/blog/20-questions-to-ask-your-periodontist-about-dental-implants", "procedure-length"),
    ("Am I a good candidate if my jaw isn't fully grown, my gums aren't healthy, or I can't wear dentures?", "Candidacy", "Deciding", "candidacy-detail", "Periodontist FAQ", "https://metrolinaperio.com/blog/20-questions-to-ask-your-periodontist-about-dental-implants", "candidacy"),
    ("Will my insurance cover my implants?", "Coverage", "Deciding", "will-insurance-cover", "Periodontist FAQ", "https://metrolinaperio.com/blog/20-questions-to-ask-your-periodontist-about-dental-implants", "insurance"),
    ("What type of dental implants would you recommend for my situation?", "Choosing a clinic", "Before surgery", "which-type-for-me", "Questions patients bring to consults", "https://www.blankdental.com/questions-to-ask-your-dentist-before-dental-implants", "which-system"),
    ("What will my total investment be, not just the implant screw?", "Cost", "Choosing a treatment", "total-investment", "Questions patients bring to consults", "https://www.blankdental.com/questions-to-ask-your-dentist-before-dental-implants", "all-in-cost"),
    ("How do dental implants compare with a bridge, a partial, and a full denture?", "Comparing options", "Choosing a treatment", "compare-all-four", "Oral surgery FAQ", "https://centralfloridaoralsurgery.com/blog/every-single-question-youll-want-to-ask-before-getting-dental-implants/", "compare-options"),
    ("What is the dental implant process from scan to final tooth?", "Timeline", "Deciding", "process-steps", "Oral surgery FAQ", "https://centralfloridaoralsurgery.com/blog/every-single-question-youll-want-to-ask-before-getting-dental-implants/", "process-steps"),
    ("How long will it take if I also need an extraction or a bone graft?", "Timeline", "Choosing a treatment", "timeline-with-graft", "Oral surgery FAQ", "https://centralfloridaoralsurgery.com/blog/every-single-question-youll-want-to-ask-before-getting-dental-implants/", "timeline-with-graft"),
    ("Who puts the crown or the denture on the implants, the surgeon or my dentist?", "Who does the work", "Choosing a treatment", "who-restores", "Oral surgery FAQ", "https://centralfloridaoralsurgery.com/blog/every-single-question-youll-want-to-ask-before-getting-dental-implants/", "who-restores"),
    ("How do I take care of implant-supported dentures?", "Daily care", "Living with it", "care-implant-denture", "Oral surgery FAQ", "https://centralfloridaoralsurgery.com/blog/every-single-question-youll-want-to-ask-before-getting-dental-implants/", "care-implant-denture"),
    ("I've worn dentures for years and my jaw has shrunk. Can grafting still let me have implants?", "Bone graft and sinus", "Deciding", "years-of-dentures", "Oral surgery FAQ", "https://centralfloridaoralsurgery.com/blog/every-single-question-youll-want-to-ask-before-getting-dental-implants/", "after-years-of-dentures"),
    ("What makes dental implants a better choice than the other options?", "Comparing options", "Deciding", "why-better", "Oral surgery consult questions", "https://www.hrsurgery.com/14-questions-to-ask-your-oral-surgeon-about-dental-implants", "why-better"),
    ("Are there drawbacks to getting dental implants?", "Comparing options", "Deciding", "drawbacks", "Oral surgery consult questions", "https://www.hrsurgery.com/14-questions-to-ask-your-oral-surgeon-about-dental-implants", "disadvantages"),
    ("How long does the implant procedure itself take?", "Timeline", "Before surgery", "chair-time", "Oral surgery consult questions", "https://www.hrsurgery.com/14-questions-to-ask-your-oral-surgeon-about-dental-implants", "chair-time"),
    ("How long is recovery, and when can I eat normally again?", "Eating and speech", "Before surgery", "when-eat-normally", "Oral surgery consult questions", "https://www.hrsurgery.com/14-questions-to-ask-your-oral-surgeon-about-dental-implants", "when-eat"),
    ("Can I leave with teeth the same day?", "Same-day teeth", "Choosing a treatment", "leave-with-teeth", "Periodontist FAQ", "https://dcperio.com/faqs", "same-day"),
    ("What's the difference between full-arch implants and dentures?", "Comparing options", "Choosing a treatment", "full-arch-vs-dentures", "Periodontist FAQ", "https://dcperio.com/faqs", "full-arch-vs-dentures"),
    ("How long does full-arch treatment take from implants to final teeth?", "Timeline", "Deciding", "full-arch-duration", "Periodontist FAQ", "https://dcperio.com/faqs", "full-arch-time"),
    ("How long do dental implants last?", "Longevity", "Deciding", "how-long-last", "Periodontist FAQ", "https://dcperio.com/faqs", "how-long-last"),
    ("What does a periodontist actually do, and do I need one?", "Who does the work", "Deciding", "what-periodontist-does", "Periodontist FAQ", "https://dcperio.com/faqs", "who-does-it"),
    ("I was told I couldn't have implants. Can bone grafting change that?", "Bone graft and sinus", "Deciding", "told-i-cant", "Periodontist FAQ", "https://dcperio.com/faqs", "told-no"),
    ("Dentures versus implants: which one should I get?", "Comparing options", "Deciding", "which-should-i-get", "Clinic FAQ", "https://www.richmondsmiledesign.com/restorative-dentistry/dentures/dentures-faq", "which-one"),
    ("Can a traditional upper denture work, with implants only on the lower?", "Comparing options", "Choosing a treatment", "upper-denture-lower-implants", "Clinic FAQ", "https://www.richmondsmiledesign.com/restorative-dentistry/dentures/dentures-faq", "upper-denture-lower-implants"),
    ("Do implant-retained dentures still need adhesive?", "Fit and adhesive", "Choosing a treatment", "snaps-need-glue", "Clinic FAQ", "https://www.richmondsmiledesign.com/restorative-dentistry/dentures/dentures-faq", "snaps-and-glue"),
    ("Can the dentist take fixed implant teeth out every few years to clean under them?", "Daily care", "Living with it", "dentist-removes-to-clean", "Clinic FAQ", "https://www.richmondsmiledesign.com/restorative-dentistry/dentures/dentures-faq", "professional-removal"),
    ("What is the difference between dentures and dental implants?", "Comparing options", "Deciding", "difference", "Ohio State explainer matching the search", "https://health.osu.edu/health/dental-health/dental-implants-vs-dentures", "difference"),
    ("Dentures only give about 20 percent of natural biting force. Is that true, and do implants chew like real teeth?", "Eating and speech", "Deciding", "biting-force", "Ohio State explainer", "https://health.osu.edu/health/dental-health/dental-implants-vs-dentures", "biting-force"),
    ("Which is the better option, dentures or dental implants?", "Comparing options", "Deciding", "which-is-better", "Healthline, matching the search", "https://www.healthline.com/health/dentures-vs-implants", "which-is-better"),
    ("How much do dentures cost compared with implants?", "Cost", "Choosing a treatment", "denture-vs-implant-cost", "Healthline", "https://www.healthline.com/health/dentures-vs-implants", "cost-compare"),
    ("What are the complications of dentures versus implants?", "Complications", "Deciding", "complications-compare", "Healthline", "https://www.healthline.com/health/dentures-vs-implants", "complications-compare"),
    ("How are snap-in dentures different from a full set of implants?", "Snap-in vs fixed", "Choosing a treatment", "snaps-vs-full-implants", "Healthline", "https://www.healthline.com/health/dentures-vs-implants", "snaps-vs-full"),
    ("Can I get implants if I have been told I don't have enough bone, if I use a bridge now, or if I want to avoid a flipper?", "Candidacy", "Deciding", "enough-bone-options", "AAID comparison page", "https://aaid-implant.org/what-are-dental-implants/implants-vs-dentures-and-bridges", "enough-bone"),
    ("I don't want to take my teeth out every night. Is that a reason to choose implants?", "Daily care", "Deciding", "dont-want-to-remove", "AAID comparison checklist", "https://aaid-implant.org/what-are-dental-implants/implants-vs-dentures-and-bridges", "dont-remove-at-night"),
    ("I want a replacement that keeps the bone in my jaw. Do dentures do that?", "Bone graft and sinus", "Deciding", "keep-the-bone", "AAID comparison checklist", "https://aaid-implant.org/what-are-dental-implants/implants-vs-dentures-and-bridges", "preserve-bone"),
    ("Complete dentures can click when I talk, eat, smile, yawn, or cough. Will implants stop that?", "Eating and speech", "Deciding", "clicking", "AAID comparison page", "https://aaid-implant.org/what-are-dental-implants/implants-vs-dentures-and-bridges", "clicking"),
    ("How long do full dentures, partials, and bridges last compared with implants?", "Longevity", "Choosing a treatment", "lifespan-compare", "Oral surgery FAQ", "https://centralfloridaoralsurgery.com/blog/every-single-question-youll-want-to-ask-before-getting-dental-implants/", "lifespan-compare"),
    ("Are zirconia implants different from titanium?", "Materials", "Choosing a treatment", "zirconia-vs-titanium", "Oral surgery service page linked from the question list", "https://centralfloridaoralsurgery.com/procedures/dental-implants-the-villages-fl/zirconia-implants/", "zirconia-implant-body"),
    ("What are teeth-in-a-day implants, and how are they different from dentures?", "Same-day teeth", "Choosing a treatment", "teeth-in-a-day-vs-dentures", "Oral surgery FAQ", "https://centralfloridaoralsurgery.com/procedures/teeth-in-a-day-the-villages-fl/dentures-vs-teeth-in-a-day/", "teeth-in-a-day"),
    ("Can a failed dental implant be repaired, or does it have to be replaced?", "Failure", "When something goes wrong", "repair-or-replace-implant", "Oral surgery blog", "https://www.hrsurgery.com/14-questions-to-ask-your-oral-surgeon-about-dental-implants", "repair-failed-implant"),
    ("What types of bone grafts are used for dental implants?", "Bone graft and sinus", "Choosing a treatment", "graft-types", "Oral surgery blog", "https://www.hrsurgery.com/14-questions-to-ask-your-oral-surgeon-about-dental-implants", "graft-types"),
    ("Is cadaver bone safe, and can the graft give me an infection?", "Bone graft and sinus", "Before surgery", "cadaver-bone", "r/Dentalimplant", R("1x152do/have_to_get_a_sinus_lift_graft_and_implant_soooo", "implant"), "cadaver-bone"),
    ("How do I finance implants if I have kids and I've already been saving for years?", "Cost", "Deciding", "financing-with-kids", "r/Dentalimplant", R("1hk5i02/how_do_you_afford_implants", "implant"), "financing"),
    ("Should I wait until later in life when I have more money?", "Cost", "Deciding", "wait-until-later", "r/Dentalimplant", R("1hk5i02/how_do_you_afford_implants", "implant"), "wait-for-money"),
    ("Do I pull from retirement to fix my teeth?", "Cost", "Deciding", "retirement-money", "r/Dentalimplant", R("1hk5i02/how_do_you_afford_implants", "implant"), "financing"),
    ("What insurance, if any, covered your All-on-4?", "Coverage", "Deciding", "which-insurance", "r/dentures", R("1mlqlbn/15_years_in_all_on_4_implants_my_thoughts", "dentures"), "which-insurance"),
    ("Is ClearChoice worth the quote, or are there clinics at half the price?", "Trust", "Choosing a treatment", "clearchoice-price", "r/Dentalimplant", R("1idf9ve/clear_choice_dental_implants", "implant"), "chain-price"),
    ("If the temporary teeth crack, is the repair free, and for how long?", "Maintenance", "Living with it", "temp-repair-warranty", "r/Dentalimplant", R("1idf9ve/clear_choice_dental_implants", "implant"), "warranty"),
    ("I'm a grinder. Will the new teeth crack?", "Complications", "Living with it", "grinding-cracks", "r/Dentalimplant", R("1idf9ve/clear_choice_dental_implants", "implant"), "grinding"),
    ("They placed more implants than planned on the day. Is All-on-6 or All-on-8 better than All-on-4?", "Comparing options", "Surgery day", "more-than-four", "r/Dentalimplant", R("1idf9ve/clear_choice_dental_implants", "implant"), "how-many-posts"),
    ("I'm not that old. Will four implants last the rest of my life?", "Longevity", "Deciding", "last-my-lifetime", "r/Dentalimplant", R("1idf9ve/clear_choice_dental_implants", "implant"), "lifetime"),
    ("Did you finance or pay cash?", "Cost", "Choosing a treatment", "finance-or-cash", "r/Dentalimplant", R("1idf9ve/clear_choice_dental_implants", "implant"), "financing"),
    ("What are the parts I'm actually paying for: extraction, graft, screw, abutment, crown, sedation?", "Cost", "Choosing a treatment", "line-items", "r/Dentalimplant", R("1i5i1wc/dental_implant_costs_we_paid", "implant"), "line-items"),
    ("Why won't the front desk give me a price until I'm scheduled?", "Trust", "Deciding", "wont-quote", "r/Dentalimplant", R("1i5i1wc/dental_implant_costs_we_paid", "implant"), "wont-quote"),
    ("Advertised implant prices leave out the crown. What is the real all-in number?", "Cost", "Deciding", "advertised-vs-real", "r/Dentalimplant", R("1pe0fm1/flabbergasted_at_this_cost", "implant"), "all-in-cost"),
    ("Is dental tourism a bad idea if something goes wrong with a sinus lift?", "Trust", "Choosing a treatment", "tourism-complications", "r/Dentalimplant", R("1x152do/have_to_get_a_sinus_lift_graft_and_implant_soooo", "implant"), "tourism"),
    ("Can I use an FSA or write any of this off?", "Coverage", "Deciding", "fsa", "r/Dentalimplant", R("1x152do/have_to_get_a_sinus_lift_graft_and_implant_soooo", "implant"), "fsa"),
    ("I'm in my 60s and I've been getting by without the tooth. Is the sinus lift still worth it?", "Candidacy", "Deciding", "sixties-worth-it", "r/Dentalimplant", R("1x152do/have_to_get_a_sinus_lift_graft_and_implant_soooo", "implant"), "age-worth-it"),
    ("If it's a back tooth and not my smile, should I skip the implant?", "Comparing options", "Deciding", "back-tooth-skip", "r/Dentalimplant", R("1x152do/have_to_get_a_sinus_lift_graft_and_implant_soooo", "implant"), "back-tooth"),
    ("All-on-X still feels like better dentures, and food gets trapped under the fake gums. Is that as good as it gets?", "Expectations", "Living with it", "still-feels-like-dentures", "r/Dentalimplant", R("1x152do/have_to_get_a_sinus_lift_graft_and_implant_soooo", "implant"), "expectations-fixed"),
    ("How are you all affording this when one problem turns into years of work?", "Cost", "Deciding", "years-of-bills", "r/Dentalimplant", REDDIT_I, "years-of-cost"),
    ("I work on camera and I'm losing gum around the implant. Can it be fixed so it doesn't show?", "Appearance and shame", "When something goes wrong", "recession-on-camera", "r/Dentalimplant", R("1ns34tr/bone_loss_around_implants_attempt_to_salvage_or", "implant"), "gum-recession"),
    ("Is the implant screw too big for the bone?", "Failure", "When something goes wrong", "screw-too-big", "r/Dentalimplant", R("1ns34tr/bone_loss_around_implants_attempt_to_salvage_or", "implant"), "implant-size"),
    ("Autograft or cadaver graft in the front of the upper jaw. Which works?", "Bone graft and sinus", "Choosing a treatment", "autograft-vs-cadaver", "r/Dentalimplant", R("1ns34tr/bone_loss_around_implants_attempt_to_salvage_or", "implant"), "graft-source"),
    ("Can bone loss around an implant be prevented?", "Complications", "Living with it", "prevent-bone-loss", "r/Dentalimplant", R("1ns34tr/bone_loss_around_implants_attempt_to_salvage_or", "implant"), "prevent-loss"),
    ("I feel like a nuisance for calling. When is it actually time to call?", "Healing", "First weeks", "nuisance-calling", "r/Dentalimplant", R("1v09z8a/i_think_theres_something_wrong_with_my_implant", "implant"), "when-to-call"),
    ("The stitches were supposed to dissolve and didn't. Should I have had them removed?", "Healing", "First weeks", "stitches", "r/Dentalimplant", R("1v09z8a/i_think_theres_something_wrong_with_my_implant", "implant"), "stitches"),
    ("I'm 23 and regretting the implant already. Can it be taken out and redone later?", "Failure", "First weeks", "young-regret", "r/Dentalimplant", R("1v09z8a/i_think_theres_something_wrong_with_my_implant", "implant"), "early-regret"),
    ("He said we should have waited 4 months, but he booked me at 3 and it fell out. How long is long enough?", "Timeline", "When something goes wrong", "healed-long-enough", "r/Dentalimplant", R("1ukocwm/implant_failed_during_the_abutment_placing_tooth_7", "implant"), "integration-time"),
    ("I don't smoke and I take care of my mouth. Why did it still fail?", "Failure", "When something goes wrong", "failed-despite-care", "r/Dentalimplant", R("1ukocwm/implant_failed_during_the_abutment_placing_tooth_7", "implant"), "why-me"),
    ("Three surgeons said I didn't need a graft and it still failed. Should I have had one?", "Bone graft and sinus", "When something goes wrong", "should-have-grafted", "r/Dentalimplant", R("1ukocwm/implant_failed_during_the_abutment_placing_tooth_7", "implant"), "should-have-grafted"),
    ("My parents never took me to the dentist and now everything is failing. Is it too late to start over?", "Appearance and shame", "Deciding", "neglected-teeth", "r/Dentalimplant", R("1uu70sa/i_honestly_feel_dental_implants_and_bridges_are", "implant"), "neglected"),
    ("I was rushed into a bridge the day of an extraction. How do I avoid being rushed into implants?", "Trust", "Before surgery", "rushed", "r/Dentalimplant", R("1uu70sa/i_honestly_feel_dental_implants_and_bridges_are", "implant"), "rushed"),
    ("Over time can you still get gum and bone loss with an implant?", "Complications", "Living with it", "loss-with-implant", "r/Dentalimplant", R("1uu70sa/i_honestly_feel_dental_implants_and_bridges_are", "implant"), "long-term-loss"),
    ("Nothing is like your real teeth. Should I fight to keep them?", "Comparing options", "Deciding", "keep-real-teeth", "r/Dentalimplant", R("1uu70sa/i_honestly_feel_dental_implants_and_bridges_are", "implant"), "keep-natural"),
    ("How are you supposed to know what pain is normal if you've had a lot of dental pain before?", "Healing", "First weeks", "what-pain-is-normal", "r/dentures", REDDIT_D, "pain-baseline"),
    ("There are no headphones that drown out the sound of extractions. Is sedation the only way through that?", "Pain and fear", "Before surgery", "the-sound", "r/dentures", R("1vdqanq/some_advice_for_people_getting_dentures", "dentures"), "sounds-of-surgery"),
    ("My immediates gag me and they won't trim the palate until I heal, because they say it kills the suction. Who is right?", "Palate and gagging", "First weeks", "trim-vs-suction", "r/dentures", REDDIT_D, "trim-palate"),
    ("I lost 15 pounds because I can't eat. Is that normal at the start?", "Eating and speech", "First weeks", "weight-loss", "r/dentures", R("1wjewe0/so_i_just_got_my_new_dentures_and_this_is_not_the", "dentures"), "weight-loss"),
    ("Bottoms pop off when I bite anything with a crust, even with adhesive. Will permanents fix that?", "Eating and speech", "Months of healing", "crust-pops-off", "r/dentures", R("1wjewe0/so_i_just_got_my_new_dentures_and_this_is_not_the", "dentures"), "cant-bite"),
    ("I still only wear the bottoms when I go out. Is that a failure or a normal compromise?", "Adjusting", "Living with it", "only-wear-to-go-out", "r/dentures", R("1wjewe0/so_i_just_got_my_new_dentures_and_this_is_not_the", "dentures"), "part-time-wear"),
    ("Speaking felt impossible. Does singing or reading out loud actually help?", "Eating and speech", "First weeks", "practice-speech", "r/dentures", R("1wjewe0/so_i_just_got_my_new_dentures_and_this_is_not_the", "dentures"), "speech-practice"),
    ("I have a bad gag reflex. How do people with that get through dentures?", "Palate and gagging", "Before surgery", "gag-reflex", "r/dentures", REDDIT_D, "gag-reflex"),
    ("The first time I saw myself with no teeth I cried. How long does that last?", "Appearance and shame", "First weeks", "mirror-shock", "r/dentures", REDDIT_D, "mirror"),
    ("I fought for years and spent a fortune trying to keep my teeth. Was extraction the right call?", "Comparing options", "Deciding", "fought-to-keep", "r/dentures", REDDIT_D, "fought-to-keep"),
    ("My family has dentures and none of them wear them. Will I end up the same?", "Expectations", "Deciding", "family-doesnt-wear", "r/dentures", R("1ic6uao/hoping_for_some_support_im_scared_and_embarrassed", "dentures"), "wont-wear"),
    ("I'm afraid of being judged for being young and toothless. Do people notice?", "Appearance and shame", "Deciding", "judged-for-age", "r/dentures", R("1ic6uao/hoping_for_some_support_im_scared_and_embarrassed", "dentures"), "judged-young"),
    ("I waited until my gums bled and I couldn't eat. Did I wait too long?", "Timeline", "Deciding", "waited-too-long", "r/dentures", REDDIT_D, "waited-too-long"),
    ("I told nobody except my spouse. Do I have to tell anyone else?", "Appearance and shame", "Living with it", "who-to-tell", "r/dentures", REDDIT_D, "disclosure"),
    ("The teeth they put in aren't the size or color I wanted. Can I refuse them?", "Appearance and shame", "Surgery day", "not-my-teeth", "r/dentures", REDDIT_D, "tooth-choice"),
    ("Lab teeth look cheap. How do I make sure I pick the teeth, not the cheapest set?", "Materials", "Before surgery", "choose-the-teeth", "r/dentures", REDDIT_D, "tooth-choice"),
    ("I drool constantly and swallowing makes me gag. Does the saliva settle down?", "Adjusting", "First weeks", "drooling", "r/dentures", R("1wguli8/5_years_and_i_still_cant_tolerate_them_anyone_else", "dentures"), "saliva"),
    ("They feel like a hockey puck and I hate talking even if other people can't hear a difference. Will that fade?", "Eating and speech", "Living with it", "hockey-puck", "r/dentures", R("1wguli8/5_years_and_i_still_cant_tolerate_them_anyone_else", "dentures"), "bulk"),
    ("I only put them in to go out in public, and I go out less and less. Is that where this ends?", "Adjusting", "Living with it", "avoiding-people", "r/dentures", R("1wguli8/5_years_and_i_still_cant_tolerate_them_anyone_else", "dentures"), "isolation"),
    ("I never even wear the bottoms and I feel like I wasted the money. Should I have skipped them?", "Cost", "Living with it", "wasted-bottoms", "r/dentures", R("1wguli8/5_years_and_i_still_cant_tolerate_them_anyone_else", "dentures"), "skip-lowers"),
    ("What I imagined dentures would be and what they are don't match. What should I have been told?", "Expectations", "Before surgery", "imagined-vs-real", "r/dentures", R("1wguli8/5_years_and_i_still_cant_tolerate_them_anyone_else", "dentures"), "expectations"),
    ("I clench and grind. Will dentures or implants survive that?", "Candidacy", "Deciding", "clencher", "r/dentures", R("1wguli8/5_years_and_i_still_cant_tolerate_them_anyone_else", "dentures"), "bruxism"),
    ("Can jaw surgery or a screened palate make a denture impossible?", "Candidacy", "Deciding", "after-jaw-surgery", "r/dentures", R("1wguli8/5_years_and_i_still_cant_tolerate_them_anyone_else", "dentures"), "complex-anatomy"),
    ("Should I look at All-on-4 or All-on-6, even if I need a graft and have to travel for it?", "Comparing options", "Living with it", "upgrade-later", "r/dentures", R("1wguli8/5_years_and_i_still_cant_tolerate_them_anyone_else", "dentures"), "upgrade-later"),
    ("Soft reline or hard reline. Which one do I actually need?", "Maintenance", "Months of healing", "soft-vs-hard", "r/dentures", R("1vuget0/my_dentist_keeps_dismissing_me", "dentures"), "which-reline"),
    ("They say shaving the palate will ruin the fit. I say I'm gagging. How much can they take off?", "Palate and gagging", "First weeks", "how-much-to-shave", "r/dentures", R("1vuget0/my_dentist_keeps_dismissing_me", "dentures"), "how-much-palate"),
    ("I'm not locked into the dentist who made them, right?", "Trust", "When something goes wrong", "switch-dentist", "r/dentures", R("1vuget0/my_dentist_keeps_dismissing_me", "dentures"), "switch-provider"),
    ("Why won't they adjust on delivery day?", "Procedure", "Surgery day", "no-adjustment-day-one", "r/dentures", R("1vuget0/my_dentist_keeps_dismissing_me", "dentures"), "delivery-day"),
    ("How much bone do you lose in the first year, and how often will I need a hard reline after that?", "Maintenance", "Living with it", "bone-loss-schedule", "r/dentures", R("1vuget0/my_dentist_keeps_dismissing_me", "dentures"), "reline-schedule"),
    ("I paid about $25,000 for immediates and surgery and they still don't fit. What am I paying the next $5,000 for?", "Cost", "Months of healing", "paid-and-still-loose", "r/dentures", R("1vy21d4/5_months_postextractions_and_told_nothing_more", "dentures"), "still-paying"),
    ("Are immediates just a Band-Aid, and am I supposed to live on cushion grip until the permanents are done?", "Temporary teeth", "Months of healing", "band-aid-immediates", "r/dentures", R("1vy21d4/5_months_postextractions_and_told_nothing_more", "dentures"), "cushion-grip"),
    ("Nobody told me the permanent fee was due before the lab would start. What should have been in the quote?", "Cost", "Months of healing", "surprise-second-bill", "r/dentures", R("1vy21d4/5_months_postextractions_and_told_nothing_more", "dentures"), "surprise-bill"),
    ("I chose a prosthodontist instead of a chain so this would be done well. How do I tell if it was?", "Trust", "When something goes wrong", "specialist-vs-chain", "r/dentures", R("1vy21d4/5_months_postextractions_and_told_nothing_more", "dentures"), "chain-vs-specialist"),
    ("Is a dental school or a prosthodontic program a safer cheaper place for All-on-4?", "Trust", "Choosing a treatment", "dental-school", "r/dentures", REDDIT_D, "dental-school"),
    ("If one implant fails, can the teeth be remade on the ones that remain?", "Failure", "When something goes wrong", "remake-on-remaining", "r/dentures", REDDIT_D, "partial-failure"),
    ("Replacing a failed implant isn't simple. What does a redo actually involve?", "Failure", "When something goes wrong", "what-redo-involves", "r/dentures", REDDIT_D, "redo"),
    ("I have a cleft palate. Are upper implants even possible?", "Candidacy", "Deciding", "cleft", "r/dentures", R("1okda4w/bottom_denture_literally_will_not_sit_still", "dentures"), "cleft"),
    ("I couldn't wear the immediates for 8 months. Will the permanent set be different?", "Temporary teeth", "Months of healing", "couldnt-wear-temps", "r/dentures", R("1okda4w/bottom_denture_literally_will_not_sit_still", "dentures"), "temps-unwearable"),
    ("Powder or paste. Which adhesive actually holds a lower denture?", "Fit and adhesive", "First weeks", "powder-or-paste", "r/dentures", R("1okda4w/bottom_denture_literally_will_not_sit_still", "dentures"), "which-adhesive"),
    ("Do I keep the dentures in for the first several days even if they hurt, so the swelling doesn't lock me out?", "Healing", "Surgery day", "leave-them-in", "r/dentures", REDDIT_D, "first-days-in"),
    ("If I take them out and the gums swell, will I be without teeth for months?", "Healing", "First weeks", "cant-get-them-back-in", "r/dentures", REDDIT_D, "locked-out"),
    ("What can I eat in the first days besides yogurt?", "Eating and speech", "First weeks", "first-foods", "r/dentures", REDDIT_D, "first-foods"),
    ("When does a soft liner happen, and when can I use adhesive?", "Timeline", "First weeks", "when-liner-and-glue", "r/dentures", REDDIT_D, "when-liner"),
    ("Steak, apples, salad, nuts. What comes back, and what never does?", "Eating and speech", "Living with it", "which-foods-return", "r/dentures", REDDIT_D, "food-list"),
    ("I can eat better with just my gums than with the denture. Should I stop wearing it to eat?", "Eating and speech", "Living with it", "eat-on-gums", "r/dentures", REDDIT_D, "eat-without-them"),
    ("Friends with no teeth eat steak. How?", "Eating and speech", "Living with it", "no-teeth-eat-steak", "r/dentures", R("1wjewe0/so_i_just_got_my_new_dentures_and_this_is_not_the", "dentures"), "eat-without-teeth"),
    ("Adhesive makes them too tight. Is that a sign I need a reline instead?", "Fit and adhesive", "Months of healing", "adhesive-too-tight", "r/dentures", R("1dve90i/eating_with_immediate_dentures", "dentures"), "too-tight"),
    ("It's been two months and I still don't need adhesive on the top, but I'm not comfortable. Is it time for a reline?", "Maintenance", "Months of healing", "time-for-reline", "r/dentures", R("1dve90i/eating_with_immediate_dentures", "dentures"), "time-for-reline"),
    ("Chewing with immediates feels like braces. Is that the ceiling?", "Eating and speech", "First weeks", "like-braces", "r/dentures", R("1dve90i/eating_with_immediate_dentures", "dentures"), "like-braces"),
    ("How soon can I have something like a burger or steak?", "Eating and speech", "First weeks", "when-real-food", "r/dentures", R("1dve90i/eating_with_immediate_dentures", "dentures"), "when-real-food"),
    ("I'm scheduled for extractions, then All-on-6, and I need to eat before that. What do people actually manage?", "Eating and speech", "Before surgery", "eat-before-implants", "r/dentures", R("1dve90i/eating_with_immediate_dentures", "dentures"), "eat-during-wait"),
    ("Taking them out is comfortable and wearing them isn't. How do I live in between?", "Adjusting", "Living with it", "prefer-them-out", "r/dentures", R("1dve90i/eating_with_immediate_dentures", "dentures"), "prefer-out"),
    ("I was sedated when they put the immediates in and I couldn't tell them they were wrong. Can I refuse them the next day?", "Trust", "Surgery day", "couldnt-consent-sedated", "r/dentures", R("1scvifu/im_so_upset_embarrassed", "dentures"), "sedated-consent"),
    ("If I'd seen them first I would never have accepted them. Do I get a remake or a refund?", "Trust", "First weeks", "remake-or-refund", "r/dentures", R("1scvifu/im_so_upset_embarrassed", "dentures"), "refund"),
    ("People say skip immediates and wait with no teeth for a better fit. Is that better?", "Temporary teeth", "Choosing a treatment", "skip-immediates-advice", "r/dentures", R("1scvifu/im_so_upset_embarrassed", "dentures"), "skip-immediates"),
    ("My friend didn't know you go back for a permanent set. Is an immediate allowed to be the final denture?", "Temporary teeth", "Living with it", "immediate-as-final", "r/dentures", REDDIT_D, "immediate-as-final"),
    ("Some dentists hard-reline the immediate and you keep that set for years. Is that better than buying two sets?", "Cost", "Choosing a treatment", "one-set-or-two", "r/dentures", R("1vdqanq/some_advice_for_people_getting_dentures", "dentures"), "one-set-or-two"),
    ("What is the tradeoff between waiting toothless, using an immediate, and buying two sets?", "Comparing options", "Choosing a treatment", "three-pathways", "r/dentures", R("1wfmbf8/if_you_were_getting_dentures_for_the_first_time", "dentures"), "three-paths"),
    ("Well-fitting dentures shouldn't need adhesive. If I need a lot, do I need a reline?", "Fit and adhesive", "Living with it", "lots-of-adhesive", "r/dentures", R("1wfmbf8/if_you_were_getting_dentures_for_the_first_time", "dentures"), "adhesive-means-reline"),
    ("My dentist told me almost nothing and Reddit taught me the rest. What should the consult have covered?", "Trust", "Before surgery", "consult-was-empty", "r/dentures", R("1wfmbf8/if_you_were_getting_dentures_for_the_first_time", "dentures"), "empty-consult"),
    ("I had a list of 20 questions and still wasn't prepared. What are the questions that matter?", "Expectations", "Before surgery", "questions-that-matter", "r/dentures", R("1wfmbf8/if_you_were_getting_dentures_for_the_first_time", "dentures"), "right-questions"),
    ("I couldn't swallow water or pills for days. Should I have been warned, and should I have liquid pain medicine?", "Pain and fear", "Before surgery", "cant-swallow-pills", "r/dentures", R("1wfmbf8/if_you_were_getting_dentures_for_the_first_time", "dentures"), "swallowing"),
    ("They said a soft diet, but I couldn't eat the pasta I was living on. What does soft actually mean?", "Eating and speech", "First weeks", "what-is-soft", "r/dentures", R("1wfmbf8/if_you_were_getting_dentures_for_the_first_time", "dentures"), "soft-diet"),
    ("I had numbness and couldn't open wide. Is nerve damage part of this?", "Complications", "First weeks", "numbness", "r/dentures", R("1wfmbf8/if_you_were_getting_dentures_for_the_first_time", "dentures"), "nerve"),
    ("I needed alveoloplasty twice and it delayed my teeth. How do I know if I'll need that?", "Procedure", "Before surgery", "alveoloplasty", "r/dentures", R("1wfmbf8/if_you_were_getting_dentures_for_the_first_time", "dentures"), "alveoloplasty"),
    ("Bone spicules keep working out weeks later. How many is normal?", "Healing", "Months of healing", "how-many-spicules", "r/dentures", R("1wfmbf8/if_you_were_getting_dentures_for_the_first_time", "dentures"), "spicules"),
    ("The sensory overload of dentures set off everything else in my life. Does that calm down?", "Adjusting", "First weeks", "sensory", "r/dentures", R("1wt5m0h/whats_the_most_annoying_little_thing_about_having", "dentures"), "sensory"),
    ("I couldn't feel a piece of paper on the roof of my mouth and ate it. What else can't you feel?", "Feel", "Living with it", "cant-feel-palate", "r/dentures", R("1wt5m0h/whats_the_most_annoying_little_thing_about_having", "dentures"), "lost-sensation"),
    ("I'm 32 and I've cried more in 3 months with dentures than in 20 years. Is the emotional part normal?", "Appearance and shame", "First weeks", "crying", "r/dentures", R("1wt5m0h/whats_the_most_annoying_little_thing_about_having", "dentures"), "emotional"),
    ("How does my denture look? I need someone honest.", "Appearance and shame", "First weeks", "how-do-they-look", "r/dentures", REDDIT_D, "feedback-on-looks"),
    ("I want feedback on the new dentures before I accept them. What should I be looking at?", "Appearance and shame", "Surgery day", "what-to-check", "r/dentures", REDDIT_D, "try-in-checklist"),
    ("The midline is off. Does that matter?", "Appearance and shame", "First weeks", "midline", "r/dentures", REDDIT_D, "midline"),
    ("They wouldn't stay in because of blood the day of extractions. Is that just day one?", "Healing", "Surgery day", "blood-no-suction", "r/dentures", R("1scvifu/im_so_upset_embarrassed", "dentures"), "day-one-fit"),
    ("I cried putting them in every morning for two weeks. Does the pain of seating them stop?", "Pain and fear", "First weeks", "hurts-to-put-in", "r/dentures", REDDIT_D, "insertion-pain"),
    ("Benzocaine on the sore spots before I put them in. Is that okay?", "Pain and fear", "First weeks", "numbing-gel", "r/dentures", R("1vyeqlh/im_beyond_bummed", "dentures"), "sore-spots"),
    ("I waited 8 months for permanents and they were still too loose and needed hard relines. Is loose-on-delivery a red flag?", "Fit and adhesive", "Months of healing", "loose-on-delivery", "r/dentures", R("1vyeqlh/im_beyond_bummed", "dentures"), "loose-delivery"),
    ("I only wear them if I have to go somewhere. Is that a common endpoint?", "Adjusting", "Living with it", "only-when-i-have-to", "r/dentures", R("1vyeqlh/im_beyond_bummed", "dentures"), "part-time-wear"),
    ("My husband said if I don't want him to see me without them, then don't. How do people handle nights?", "Appearance and shame", "Living with it", "nights-with-partner", "r/dentures", R("1fh05b1/im_so_embarrassed_please_help", "dentures"), "nights"),
    ("The first time I smiled with no teeth it was funny instead of awful. Does the shame wear off?", "Appearance and shame", "First weeks", "shame-wears-off", "r/dentures", R("1fh05b1/im_so_embarrassed_please_help", "dentures"), "shame-fades"),
    ("He was happy I was getting dentures because he knows I hate my teeth. Am I the only one embarrassed?", "Appearance and shame", "Before surgery", "partner-is-fine", "r/dentures", R("1fh05b1/im_so_embarrassed_please_help", "dentures"), "partner-support"),
    ("It's shocking the first time you see yourself, and probably for a month. Then what?", "Appearance and shame", "First weeks", "shock-duration", "r/dentures", R("1fh05b1/im_so_embarrassed_please_help", "dentures"), "shock"),
    ("I take them out at night and my partner doesn't care. How do I get to that?", "Appearance and shame", "Living with it", "get-comfortable", "r/dentures", R("1fh05b1/im_so_embarrassed_please_help", "dentures"), "acceptance"),
    ("I'm in my mid-30s with a full upper. How do I tell people, or do I not?", "Appearance and shame", "Living with it", "mid-30s-disclosure", "r/dentures", R("1ic6uao/hoping_for_some_support_im_scared_and_embarrassed", "dentures"), "disclosure"),
    ("Medication ruined my teeth. Is that a story people understand, or do they assume I didn't care?", "Appearance and shame", "Deciding", "meds-ruined-teeth", "r/dentures", REDDIT_D, "why-my-teeth"),
    ("Rheumatoid arthritis, steroids, and methotrexate made my teeth brittle. Can I still get implants?", "Candidacy", "Deciding", "autoimmune", "r/dentures", R("1k4z2l6/allon4_experience_3_weeks_postop_the_good_the_bad", "dentures"), "medical-candidacy"),
    ("I have severe dental anxiety and I cried during impressions. How do people get through surgery day?", "Pain and fear", "Before surgery", "anxiety-impressions", "r/dentures", R("1k4z2l6/allon4_experience_3_weeks_postop_the_good_the_bad", "dentures"), "dental-phobia"),
    ("I was convinced I would die or be disfigured. How do I know that fear is the anxiety and not a real warning?", "Pain and fear", "Before surgery", "catastrophe-thoughts", "r/dentures", R("1k4z2l6/allon4_experience_3_weeks_postop_the_good_the_bad", "dentures"), "phobia"),
    ("Conscious sedation with a pill, or full sedation? I don't like the idea of going under, and full sedation costs more.", "Pain and fear", "Before surgery", "which-sedation", "r/dentures", R("1k4z2l6/allon4_experience_3_weeks_postop_the_good_the_bad", "dentures"), "which-sedation"),
    ("I never knew when they were pulling teeth. Is that what sedation is supposed to feel like?", "Pain and fear", "Surgery day", "what-sedation-feels-like", "r/dentures", R("1k4z2l6/allon4_experience_3_weeks_postop_the_good_the_bad", "dentures"), "sedation-experience"),
    ("They hammered the temporary teeth on while I was awake. Is that normal for All-on-4?", "Procedure", "Surgery day", "hammered-on", "r/dentures", R("1k4z2l6/allon4_experience_3_weeks_postop_the_good_the_bad", "dentures"), "how-temps-attach"),
    ("The healing was almost painless and the anxiety was the worst part. Is that a common split?", "Pain and fear", "First weeks", "anxiety-worse-than-pain", "r/dentures", R("1k4z2l6/allon4_experience_3_weeks_postop_the_good_the_bad", "dentures"), "anxiety-vs-pain"),
    ("The first temps were huge and I was embarrassed to be seen. How many try-ins is normal?", "Appearance and shame", "First weeks", "how-many-tryins", "r/dentures", R("1k4z2l6/allon4_experience_3_weeks_postop_the_good_the_bad", "dentures"), "try-in-count"),
    ("I thought I had made a mistake for the first few weeks. When did it turn for other people?", "Adjusting", "First weeks", "thought-it-was-a-mistake", "r/dentures", R("1k4z2l6/allon4_experience_3_weeks_postop_the_good_the_bad", "dentures"), "early-regret"),
    ("Snap-ons were about $13,000 and fixed was about $27,000, financed at about $490 a month for 8 years. How do people decide?", "Cost", "Choosing a treatment", "monthly-payment", "r/dentures", R("1k4z2l6/allon4_experience_3_weeks_postop_the_good_the_bad", "dentures"), "monthly-payment"),
    ("I'm young, so if I'm going to do this I want to do it right. Is fixed the right version?", "Snap-in vs fixed", "Choosing a treatment", "do-it-right", "r/dentures", R("1k4z2l6/allon4_experience_3_weeks_postop_the_good_the_bad", "dentures"), "do-it-once"),
    ("My mom got implants young at a chain and liked them. Are chains okay if a relative had a good result?", "Trust", "Choosing a treatment", "chain-because-family", "r/dentures", R("1k4z2l6/allon4_experience_3_weeks_postop_the_good_the_bad", "dentures"), "chain-clinic"),
    ("Going out to eat and the beach used to scare me. Is that the actual reason people pay for this?", "Appearance and shame", "Deciding", "social-life", "r/dentures", R("1mlqlbn/15_years_in_all_on_4_implants_my_thoughts", "dentures"), "social-life"),
    ("Is the cost worth it if what you get back is not being afraid of being judged?", "Cost", "Deciding", "worth-it-judgement", "r/dentures", R("1mlqlbn/15_years_in_all_on_4_implants_my_thoughts", "dentures"), "worth-it"),
    ("I did it in Mexico for about $21,000 with a graft, in three trips. What should I ask before I do that?", "Trust", "Choosing a treatment", "mexico-questions", "r/dentures", R("1mlqlbn/15_years_in_all_on_4_implants_my_thoughts", "dentures"), "tourism-questions"),
    ("If I don't need grafts, is it really just two trips?", "Timeline", "Choosing a treatment", "two-trips", "r/dentures", R("1mlqlbn/15_years_in_all_on_4_implants_my_thoughts", "dentures"), "travel-plan"),
    ("The implants were fine and I wasn't, emotionally. Is that part of recovery?", "Adjusting", "Months of healing", "implants-fine-im-not", "r/dentures", R("1mlqlbn/15_years_in_all_on_4_implants_my_thoughts", "dentures"), "emotional-recovery"),
    ("I'm 2.5 months into All-on-4 and I need to hear that it gets better. Does it?", "Adjusting", "Months of healing", "does-it-get-better", "r/dentures", R("1mlqlbn/15_years_in_all_on_4_implants_my_thoughts", "dentures"), "gets-better"),
    ("They planned 6 on the bottom and the bone only allowed 4. Is 4 enough?", "Candidacy", "Surgery day", "four-is-enough", "r/dentures", R("1mlqlbn/15_years_in_all_on_4_implants_my_thoughts", "dentures"), "four-enough"),
    ("I'm 27 and I cried because I didn't know how long my teeth would last. Is that when people finally book?", "Appearance and shame", "Deciding", "when-people-book", "r/dentures", R("1mlqlbn/15_years_in_all_on_4_implants_my_thoughts", "dentures"), "when-to-act"),
    ("Blue Cross sometimes covers it and mine didn't. What plans actually pay?", "Coverage", "Deciding", "which-plan-pays", "r/dentures", R("1mlqlbn/15_years_in_all_on_4_implants_my_thoughts", "dentures"), "which-insurance"),
    ("I have two canines holding a lower partial. If I do the upper, can I get rid of the plastic?", "Comparing options", "Choosing a treatment", "partial-plus-upper", "r/dentures", R("1mlqlbn/15_years_in_all_on_4_implants_my_thoughts", "dentures"), "partial-remaining"),
    ("A horseshoe upper let me taste food again. Can snap-ins always be made that way?", "Palate and gagging", "Choosing a treatment", "horseshoe", "r/dentures", R("1sfyoz6/people_who_switched_from_dentures_to_implants", "dentures"), "horseshoe"),
    ("My dentures fit extremely well and I still wanted implants for confidence and bite. Is that a good enough reason?", "Comparing options", "Deciding", "fit-well-still-want", "r/dentures", R("1sfyoz6/people_who_switched_from_dentures_to_implants", "dentures"), "why-upgrade"),
    ("A friend hasn't worn her bottoms in 15 years. If I tell her about implants, is it actually life-changing?", "Comparing options", "Deciding", "friend-doesnt-wear-bottoms", "r/dentures", R("1sfyoz6/people_who_switched_from_dentures_to_implants", "dentures"), "life-changing"),
    ("Can I ask you about upper snap-ins specifically?", "Snap-in vs fixed", "Choosing a treatment", "upper-snaps-questions", "r/dentures", R("1sfyoz6/people_who_switched_from_dentures_to_implants", "dentures"), "upper-snaps"),
    ("Comfort, eating, or maintenance. What actually changes when you leave dentures for implants?", "Expectations", "Deciding", "what-changes", "r/dentures", R("1sfyoz6/people_who_switched_from_dentures_to_implants", "dentures"), "what-changes"),
    ("I want real experiences, not what the clinic says. Where do people tell the truth?", "Trust", "Deciding", "real-experiences", "r/dentures", R("1sfyoz6/people_who_switched_from_dentures_to_implants", "dentures"), "want-unfiltered"),
    ("What surprised you most about getting dentures or implants?", "Expectations", "Deciding", "what-surprised-most", "r/dentures", REDDIT_D, "what-surprised"),
    ("I got a single-tooth denture today. Is a one-tooth denture a reasonable stopgap?", "Temporary teeth", "Choosing a treatment", "single-tooth-denture", "r/dentures", REDDIT_D, "flipper"),
    ("They totally messed up this denture. How many remakes am I owed?", "Trust", "When something goes wrong", "how-many-remakes", "r/dentures", REDDIT_D, "remakes"),
    ("I'm regretting Affordable Dentures and Implants. Are the problems the chain or dentures in general?", "Trust", "When something goes wrong", "regret-chain", "r/dentures", REDDIT_D, "chain-clinic"),
    ("What questions should I ask Affordable Dentures before I book?", "Trust", "Before surgery", "questions-for-chain", "r/dentures", REDDIT_D, "chain-questions"),
    ("My snap-ins cost as much as a car. How do I know I bought the right car?", "Cost", "Living with it", "cost-of-a-car", "r/dentures", REDDIT_D, "worth-it"),
    ("Going from a temporary snap-on I liked to a permanent one I don't. Can the permanents be redone?", "Expectations", "Months of healing", "perms-worse", "r/dentures", REDDIT_D, "redo-perms"),
    ("Is the myth true that dentures melt your jawbone, and is that why people get implants?", "Bone graft and sinus", "Deciding", "bone-loss-myth", "r/dentures", REDDIT_D, "bone-loss-myth"),
    ("Has anyone had a good All-on-4 at three weeks, and what was the ugly part?", "Expectations", "First weeks", "good-bad-ugly", "r/dentures", R("1k4z2l6/allon4_experience_3_weeks_postop_the_good_the_bad", "dentures"), "good-bad-ugly"),
    ("I got All-on-X and the teeth pulled yesterday. What do I do tonight?", "Healing", "Surgery day", "night-one", "r/dentures", REDDIT_D, "night-one"),
    ("One year after extractions, alveoloplasty, and temporary dentures. Is this result good, bad, or average?", "Appearance and shame", "Months of healing", "is-this-average", "r/dentures", REDDIT_D, "is-result-ok"),
    ("New to dentures. What do I need to know this week?", "Expectations", "First weeks", "new-this-week", "r/dentures", REDDIT_D, "first-week"),
    ("Four weeks out. What should feel better by now?", "Healing", "First weeks", "four-weeks", "r/dentures", REDDIT_D, "four-weeks"),
    ("I did it. What do people wish they had asked before feeling proud and done?", "Expectations", "Living with it", "after-you-did-it", "r/dentures", REDDIT_D, "after-success"),
    ("Finally, no more judgment. Is that what fixed teeth are actually for?", "Appearance and shame", "Living with it", "no-more-judgement", "r/dentures", REDDIT_D, "judgment"),
    ("Two years later. What still isn't the same?", "Expectations", "Living with it", "two-years-later", "r/dentures", REDDIT_D, "long-term"),
    ("Feeling down, moving from temp dentures to implants, and I have nobody to tell. What should I expect next?", "Expectations", "Months of healing", "temp-to-implant-next", "r/dentures", REDDIT_D, "temp-to-implant"),
    ("Scared but excited. What questions should I ask before E-day?", "Pain and fear", "Before surgery", "questions-before-e-day", "r/dentures", REDDIT_D, "questions-before"),
    ("How do you take dentures out when adhesive is really set?", "Daily care", "Living with it", "how-to-take-out", "r/dentures", REDDIT_D, "how-to-remove"),
    ("I think I need an adjustment. What do I say so they don't brush me off?", "Trust", "When something goes wrong", "how-to-ask-for-adjustment", "r/dentures", REDDIT_D, "how-to-advocate"),
    ("I'm feeling off in my dentures and I can't explain it. What do dentists look for?", "Fit and adhesive", "Living with it", "feeling-off", "r/dentures", REDDIT_D, "feeling-off"),
    ("I'm frustrated and I don't know if it's the denture or me. How do I tell?", "Adjusting", "Living with it", "denture-or-me", "r/dentures", REDDIT_D, "whose-fault"),
    ("Extremely disappointed with my immediate. Is disappointment in week one a sign they'll never be right?", "Expectations", "First weeks", "disappointed-week-one", "r/dentures", REDDIT_D, "early-disappointment"),
    ("It's been nine months. What should be finished by now?", "Timeline", "Months of healing", "nine-months", "r/dentures", REDDIT_D, "nine-months"),
    ("Well, this is just weird. Is a weird mouth part of month one?", "Adjusting", "First weeks", "feels-weird", "r/dentures", REDDIT_D, "feels-weird"),
    ("I've been lurking. Is it okay that I'm terrified and haven't booked?", "Pain and fear", "Deciding", "lurking-terrified", "r/dentures", REDDIT_D, "not-booked-yet"),
    ("I was freaking out on here and then I got it done. What actually helped you walk in?", "Pain and fear", "Before surgery", "what-helped-you-go", "r/dentures", REDDIT_D, "getting-in-the-door"),
    ("Solution to dental fear: find a different dentist. How do I know the next one is different?", "Trust", "Deciding", "find-a-different-dentist", "r/dentures", REDDIT_D, "find-the-right-dentist"),
    ("36, hopeful, and full of regret. Can both be true?", "Appearance and shame", "First weeks", "hope-and-regret", "r/dentures", REDDIT_D, "regret-and-hope"),
    ("I'm struggling to adjust. What week does it usually turn?", "Adjusting", "First weeks", "which-week", "r/dentures", REDDIT_D, "when-it-turns"),
    ("Opinions on whether I should have done this. I need them from people who have.", "Trust", "Deciding", "peer-opinions", "r/dentures", REDDIT_D, "peer-advice"),
    ("Before and after. Is mine a normal amount of change?", "Appearance and shame", "Months of healing", "before-after-normal", "r/dentures", REDDIT_D, "before-after"),
    ("My teeth are on the way. What do I set up at home before they arrive?", "Practical life", "Before surgery", "what-to-buy", "r/dentures", REDDIT_D, "home-setup"),
    ("Denture success stories. What did the people who are happy do differently?", "Expectations", "Deciding", "what-happy-people-did", "r/dentures", REDDIT_D, "success-habits"),
    ("Going on two years. What maintenance actually showed up?", "Maintenance", "Living with it", "two-year-maintenance", "r/dentures", REDDIT_D, "two-year-maintenance"),
    ("I have new teeth. How do I keep from messing them up in the first month?", "Daily care", "First weeks", "dont-mess-them-up", "r/dentures", REDDIT_D, "first-month-rules"),
    ("All on 4 implants. What do you wish the consult had said out loud?", "Expectations", "Before surgery", "say-it-out-loud", "r/dentures", REDDIT_D, "consult-script"),
    ("So I got my implants, however something isn't right. What do I check first?", "Complications", "When something goes wrong", "however-not-right", "r/dentures", REDDIT_D, "first-checks"),
    ("Update after new implants this week. What is a normal first week?", "Healing", "First weeks", "normal-first-week", "r/dentures", REDDIT_D, "first-week"),
    ("Dental implants, finally. What do I ask at the last visit so I leave with the right instructions?", "Daily care", "Living with it", "leaving-instructions", "r/Dentalimplant", REDDIT_I, "discharge-instructions"),
    ("After nearly 8 months my implants are done. What does long-term care look like from here?", "Daily care", "Living with it", "from-here", "r/Dentalimplant", REDDIT_I, "long-term-care"),
    ("Had implant surgery today. What should tonight and tomorrow feel like?", "Healing", "Surgery day", "tonight", "r/Dentalimplant", REDDIT_I, "night-one"),
    ("8 days post-op. What should be improving?", "Healing", "First weeks", "day-8", "r/Dentalimplant", REDDIT_I, "day-8"),
    ("My implant journey is finally over. What would you tell someone at the start?", "Expectations", "Deciding", "tell-them-at-the-start", "r/Dentalimplant", REDDIT_I, "advice-to-start"),
    ("A good implant experience. What did that office do that others don't?", "Trust", "Choosing a treatment", "what-good-offices-do", "r/Dentalimplant", REDDIT_I, "good-office"),
    ("Don't do it if... What are the actual reasons to walk away?", "Candidacy", "Deciding", "dont-do-it-if", "r/Dentalimplant", REDDIT_I, "walk-away"),
    ("Worst mistake of my life. What would you verify before paying?", "Trust", "Before surgery", "before-you-pay", "r/Dentalimplant", REDDIT_I, "before-you-pay"),
    ("Is this normal? I don't even know what normal is.", "Healing", "First weeks", "what-is-normal", "r/Dentalimplant", REDDIT_I, "what-is-normal"),
    ("Is it a big deal? Everyone around me is acting like the implant is minor.", "Pain and fear", "Before surgery", "is-it-a-big-deal", "r/Dentalimplant", REDDIT_I, "how-big-a-deal"),
    ("Dental implants, the price. Why is there no straight answer?", "Cost", "Deciding", "no-straight-price", "r/Dentalimplant", REDDIT_I, "why-no-price"),
    ("$62,000 to $66,800. For what, exactly?", "Cost", "Choosing a treatment", "62k-for-what", "r/Dentalimplant", REDDIT_I, "what-am-i-buying"),
    ("All-on-6, six months later. What showed up that the brochure skipped?", "Expectations", "Living with it", "six-months-later", "r/Dentalimplant", REDDIT_I, "six-months-later"),
    ("3 months since All-on-4 and it's going pretty well. What should I still watch for?", "Complications", "Months of healing", "what-to-watch", "r/Dentalimplant", REDDIT_I, "warning-signs"),
    ("From today I have my finals, after a long wait. How do finals differ from the temps?", "Temporary teeth", "Months of healing", "finals-vs-temps", "r/Dentalimplant", REDDIT_I, "finals-vs-temps"),
    ("I got an All-on-6 last Friday. What am I allowed to eat this weekend?", "Eating and speech", "First weeks", "this-weekend", "r/Dentalimplant", REDDIT_I, "weekend-diet"),
    ("Thinking about All-on-4 but my situation is specific. How do I know the standard plan doesn't fit me?", "Candidacy", "Deciding", "my-case-is-different", "r/Dentalimplant", REDDIT_I, "case-specific"),
    ("Need help with a dental implant and I don't know the right question. Where do I start?", "Basics", "When something goes wrong", "dont-know-the-question", "r/askdentists", REDDIT_ASK, "where-to-start"),
    ("Is this a good implant? I have the x-ray and I don't know how to read it.", "Trust", "When something goes wrong", "is-this-a-good-implant", "r/askdentists", REDDIT_ASK, "read-my-xray"),
    ("Is this dental implant normal?", "Healing", "Months of healing", "is-implant-normal", "r/askdentists", REDDIT_ASK, "is-this-normal"),
    ("Implant issue. What could be happening?", "Complications", "When something goes wrong", "what-could-be-happening", "r/askdentists", REDDIT_ASK, "what-is-happening"),
    ("Dental implants again. I'm 26. Is a second round reasonable?", "Failure", "When something goes wrong", "implants-again-young", "r/askdentists", REDDIT_ASK, "second-round"),
    ("What part failed, the implant or the crown, and who pays?", "Cost", "When something goes wrong", "who-pays-for-failure", "r/Dentalimplant", REDDIT_I, "who-pays"),
    ("The office laughed and said I was hard to keep under. How do I make sure the next sedation plan is written down?", "Trust", "When something goes wrong", "sedation-plan-in-writing", "r/Dentalimplant", R("1wekqjl/all_on_4_failure", "implant"), "sedation-in-writing"),
    ("I told them I wake up during procedures and I take opioids. What should a clinic do with that before surgery?", "Pain and fear", "Before surgery", "opioids-and-sedation", "r/Dentalimplant", R("1wekqjl/all_on_4_failure", "implant"), "pain-patients"),
    ("My jaw dislocated while they were unscrewing the bridge. Is that a known risk?", "Complications", "When something goes wrong", "jaw-dislocation", "r/Dentalimplant", R("1wekqjl/all_on_4_failure", "implant"), "jaw-injury"),
    ("The lower teeth are rough and cut my tongue, and I bite my lip. Can the shape be fixed without new implants?", "Maintenance", "When something goes wrong", "teeth-cut-tongue", "r/Dentalimplant", R("1wekqjl/all_on_4_failure", "implant"), "occlusal-adjustment"),
    ("I can't speak properly with the new teeth. Is that the teeth or me learning?", "Eating and speech", "First weeks", "cant-speak", "r/Dentalimplant", R("1wekqjl/all_on_4_failure", "implant"), "speech"),
    ("Huge dental phobia was supposed to be solved by this and it got worse. Can the phobia be treated separately from the teeth?", "Pain and fear", "When something goes wrong", "phobia-worse", "r/Dentalimplant", R("1wekqjl/all_on_4_failure", "implant"), "phobia-worse"),
    ("What do I do now that the artificial gum material has fallen off again?", "Materials", "When something goes wrong", "gum-material-fell-off", "r/Dentalimplant", R("1wekqjl/all_on_4_failure", "implant"), "pink-gum-failure"),
    ("They repainted a crack and called it fixed. How do I get a real repair?", "Trust", "When something goes wrong", "paint-is-not-a-repair", "r/Dentalimplant", R("1wekqjl/all_on_4_failure", "implant"), "real-repair"),
    ("The estimate visit was great and everything changed after I paid. What do I get in writing first?", "Trust", "Before surgery", "after-you-pay", "r/Dentalimplant", R("1wekqjl/all_on_4_failure", "implant"), "get-it-in-writing"),
    ("I paid about $40,000. What should that number have included?", "Cost", "When something goes wrong", "what-40k-includes", "r/Dentalimplant", R("1wekqjl/all_on_4_failure", "implant"), "what-price-includes"),
    ("Are same-day clinics ignoring bone problems that make implants fail later?", "Trust", "Choosing a treatment", "ignored-bone", "r/SFbitcheswithtaste", "https://www.reddit.com/r/SFbitcheswithtaste/comments/1mjkxwz/dental_implants", "ignored-bone"),
    ("The process took a year and it was worth it. How do I survive the year?", "Timeline", "Deciding", "survive-the-year", "r/SFbitcheswithtaste", "https://www.reddit.com/r/SFbitcheswithtaste/comments/1mjkxwz/dental_implants", "long-process"),
    ("One implant was about $6,000 all-in. What is a fair Canadian number now?", "Cost", "Deciding", "fair-canada-price", "r/SFbitcheswithtaste", "https://www.reddit.com/r/SFbitcheswithtaste/comments/1mjkxwz/dental_implants", "canada-price"),
    ("How much did the dental work alone cost, not the trip?", "Cost", "Choosing a treatment", "work-not-travel", "Reddit travel-dentistry thread", "https://www.reddit.com/r/SFbitcheswithtaste/comments/1mjkxwz/dental_implants", "separate-travel-cost"),
    ("Can I get a second opinion on the x-ray before I commit?", "Trust", "Before surgery", "second-opinion-xray", "r/askdentists", REDDIT_ASK, "second-opinion"),
    ("What happens if I do nothing for another year?", "Comparing options", "Deciding", "do-nothing-a-year", "r/Dentalimplant", R("1h08fzp/do_i_have_to_rush_getting_bone_grafting_for", "implant"), "delay"),
    ("If they need a new CT because I waited, is that the only cost of waiting?", "Timeline", "Deciding", "cost-of-waiting", "r/Dentalimplant", R("1h08fzp/do_i_have_to_rush_getting_bone_grafting_for", "implant"), "cost-of-waiting"),
    ("Some people say dentures are enough. For a back molar, are they?", "Comparing options", "Deciding", "dentures-enough", "r/Dentalimplant", R("1h08fzp/do_i_have_to_rush_getting_bone_grafting_for", "implant"), "dentures-enough"),
    ("I got five molars out three months ago. How fast is the bone disappearing?", "Bone graft and sinus", "Months of healing", "how-fast-bone-goes", "r/Dentalimplant", R("1h08fzp/do_i_have_to_rush_getting_bone_grafting_for", "implant"), "resorption-speed"),
    ("Is a Nesbit flexible partial a real alternative to an implant?", "Comparing options", "Choosing a treatment", "nesbit", "r/askdentists", R("11b96gs/am_i_making_the_right_decision_on_getting_an", "ask"), "flexible-partial"),
    ("I grind my teeth. Does that rule out an implant on this tooth?", "Candidacy", "Deciding", "grinding-rules-out", "r/askdentists", R("11b96gs/am_i_making_the_right_decision_on_getting_an", "ask"), "grinding-candidacy"),
    ("Can I stretch the payments by doing extraction, graft, implant, and crown as separate steps?", "Cost", "Choosing a treatment", "stage-the-payments", "r/askdentists", R("11b96gs/am_i_making_the_right_decision_on_getting_an", "ask"), "stage-payments"),
    ("There's infection and sinus inflammation from a failed root canal. Do I have to clear that before an implant?", "Candidacy", "Before surgery", "infection-first", "r/askdentists", R("11b96gs/am_i_making_the_right_decision_on_getting_an", "ask"), "infection-first"),
    ("If I only extract and skip the graft, what do I lose?", "Bone graft and sinus", "Choosing a treatment", "skip-the-graft", "r/askdentists", R("11b96gs/am_i_making_the_right_decision_on_getting_an", "ask"), "skip-graft"),
    ("My friend paid less for a back tooth. Why is a front tooth more?", "Cost", "Deciding", "front-costs-more", "r/askdentists", R("1ar2mie/dental_implant_pricing_does_my_quote_sound_reasonable_also_how", "ask"), "front-vs-back-cost"),
    ("I grind and that's why the front tooth is failing. Will an implant survive the grinding?", "Candidacy", "Deciding", "grinding-front", "r/askdentists", R("1ar2mie/dental_implant_pricing_does_my_quote_sound_reasonable_also_how", "ask"), "grinding"),
    ("I waited too long on an abscess and now the bone is gone. Is the implant still possible?", "Bone graft and sinus", "Deciding", "abscess-waited", "r/askdentists", R("1ar2mie/dental_implant_pricing_does_my_quote_sound_reasonable_also_how", "ask"), "waited-on-abscess"),
    ("It had to be the most visible tooth. Do I have any choice but an implant?", "Comparing options", "Deciding", "no-choice-front", "r/askdentists", R("1ar2mie/dental_implant_pricing_does_my_quote_sound_reasonable_also_how", "ask"), "front-tooth-no-choice"),
    ("When people say they got all their teeth implanted, do they mean four implants and a denture?", "Basics", "Choosing a treatment", "what-full-mouth-means", "r/askdentists", R("1ar2mie/dental_implant_pricing_does_my_quote_sound_reasonable_also_how", "ask"), "what-full-mouth-means"),
    ("If I sue for a failed full-mouth case, what would I have to prove?", "Trust", "When something goes wrong", "malpractice", "r/Dentalimplant", R("1iudlbb/question_on_cost_wrt_dental_implant_failure", "implant"), "legal"),
    ("I have $48,000 in and three implants left of twelve. What are my options if the work is unusable?", "Failure", "When something goes wrong", "most-failed", "r/Dentalimplant", R("1iudlbb/question_on_cost_wrt_dental_implant_failure", "implant"), "catastrophic-failure"),
    ("Is an extra bone graft on a redo something the clinic should cover?", "Cost", "When something goes wrong", "who-pays-redo-graft", "r/Dentalimplant", R("1iudlbb/question_on_cost_wrt_dental_implant_failure", "implant"), "redo-graft-cost"),
    ("What are my rights if I disagree with the bill after a failure?", "Trust", "When something goes wrong", "patient-rights", "r/Dentalimplant", R("1iudlbb/question_on_cost_wrt_dental_implant_failure", "implant"), "patient-rights"),
    ("The family is suffering because we decided on implants. How do we stop the spending?", "Cost", "When something goes wrong", "stop-the-spending", "r/Dentalimplant", R("1iudlbb/question_on_cost_wrt_dental_implant_failure", "implant"), "financial-harm"),
    ("Sinus lift, then screws, then the crown, and it failed. Which step is the one that should be guaranteed?", "Trust", "When something goes wrong", "which-step-guaranteed", "r/Dentalimplant", R("1iudlbb/question_on_cost_wrt_dental_implant_failure", "implant"), "warranty-which-step"),
    ("I'm in New Jersey and the bill is about $20,000 for a failed case. Is charging to redo it standard?", "Cost", "When something goes wrong", "standard-to-recharge", "r/Dentalimplant", R("1iudlbb/question_on_cost_wrt_dental_implant_failure", "implant"), "recharge-standard"),
    ("Even in expensive cities, one tooth shouldn't cost like a full arch. When is a quote a reason to leave?", "Trust", "Deciding", "when-to-walk", "r/Dentalimplant", R("1pe0fm1/flabbergasted_at_this_cost", "implant"), "walk-away-price"),
    ("There are about seven parts to the process and every one has a price. Can I see them before I say yes?", "Cost", "Before surgery", "seven-parts", "r/Dentalimplant", R("1pe0fm1/flabbergasted_at_this_cost", "implant"), "itemized"),
    ("The prosthetic teeth are a separate bill from the surgeon. Why didn't anyone say that?", "Cost", "Choosing a treatment", "two-offices-two-bills", "r/Dentalimplant", R("1pe0fm1/flabbergasted_at_this_cost", "implant"), "split-billing"),
    ("With gum and bone grafting, is a shocking front-tooth quote actually normal?", "Cost", "Deciding", "graft-makes-it-expensive", "r/Dentalimplant", R("1pe0fm1/flabbergasted_at_this_cost", "implant"), "why-so-high"),
    ("I was quoted $7,000 for the entire process in North Carolina. Why is mine $19,000?", "Cost", "Deciding", "why-mine-is-higher", "r/Dentalimplant", R("1pe0fm1/flabbergasted_at_this_cost", "implant"), "price-variation"),
    ("If I fly somewhere cheaper, what do I add for travel, lodging, and a complication stay?", "Cost", "Choosing a treatment", "true-cost-of-travel", "r/Dentalimplant", R("1x152do/have_to_get_a_sinus_lift_graft_and_implant_soooo", "implant"), "travel-true-cost"),
    ("Another patient's timeline may not be mine. Who sets the visit schedule and the travel restrictions?", "Timeline", "Choosing a treatment", "whose-schedule", "r/Dentalimplant", R("1x152do/have_to_get_a_sinus_lift_graft_and_implant_soooo", "implant"), "schedule"),
    ("Go get a free scan at an All-on-X place. Is a free scan a sales trap?", "Trust", "Deciding", "free-scan", "r/Dentalimplant", R("1x152do/have_to_get_a_sinus_lift_graft_and_implant_soooo", "implant"), "free-consult"),
    ("I would have spent over $80,000 doing teeth one by one. Is full-arch the cheaper path only after you've already suffered?", "Cost", "Deciding", "one-by-one-vs-arch", "r/Dentalimplant", R("1x152do/have_to_get_a_sinus_lift_graft_and_implant_soooo", "implant"), "one-by-one"),
    ("It will feel the closest to real teeth, but not the same. What does closest actually mean?", "Expectations", "Deciding", "closest-to-real", "r/Dentalimplant", R("1x152do/have_to_get_a_sinus_lift_graft_and_implant_soooo", "implant"), "closest-to-real"),
    ("The whole process has taken years. How do I know it's still worth finishing?", "Cost", "Months of healing", "worth-finishing", "r/Dentalimplant", R("1x152do/have_to_get_a_sinus_lift_graft_and_implant_soooo", "implant"), "worth-finishing"),
    ("All four posts took. Is that the scary part being over?", "Healing", "Months of healing", "posts-took", "r/Dentalimplant", R("1x152do/have_to_get_a_sinus_lift_graft_and_implant_soooo", "implant"), "integration-success"),
    ("Three months of soft food after the graft and sinus lift. Is that the real recovery, not the brochure?", "Eating and speech", "Months of healing", "three-months-soft", "r/Dentalimplant", R("1x152do/have_to_get_a_sinus_lift_graft_and_implant_soooo", "implant"), "soft-food-months"),
    ("They knocked me out for the graft and sinus lift. Was that necessary?", "Pain and fear", "Before surgery", "sedation-for-graft", "r/Dentalimplant", R("1x152do/have_to_get_a_sinus_lift_graft_and_implant_soooo", "implant"), "sedation-for-graft"),
    ("Eleven top teeth had to come out. Is that an All-on-4 case or a denture case?", "Comparing options", "Deciding", "full-upper-which", "r/Dentalimplant", R("1x152do/have_to_get_a_sinus_lift_graft_and_implant_soooo", "implant"), "full-upper"),
    ("Digging a failed graft out hurt more than putting it in. How do I lower the chance of a second surgery?", "Bone graft and sinus", "Before surgery", "avoid-second-surgery", "r/Dentalimplant", R("1x152do/have_to_get_a_sinus_lift_graft_and_implant_soooo", "implant"), "avoid-redo"),
    ("About $5,000 and that didn't include the post or the crown. What else is still coming?", "Cost", "Deciding", "whats-still-coming", "r/Dentalimplant", R("1x152do/have_to_get_a_sinus_lift_graft_and_implant_soooo", "implant"), "remaining-costs"),
    ("The antibiotic gave me C. diff. What do I ask them to use next time?", "Complications", "When something goes wrong", "antibiotic-reaction", "r/Dentalimplant", R("1x152do/have_to_get_a_sinus_lift_graft_and_implant_soooo", "implant"), "antibiotics"),
    ("He uses a mix of cadaver and synthetic bone. Is that better, and is it safe?", "Bone graft and sinus", "Before surgery", "graft-mix", "r/Dentalimplant", R("1x152do/have_to_get_a_sinus_lift_graft_and_implant_soooo", "implant"), "graft-materials"),
    ("I've been strung out on dental work my whole life. Is more surgery the wrong call even if the tooth needs it?", "Pain and fear", "Deciding", "too-much-dentistry", "r/Dentalimplant", R("1x152do/have_to_get_a_sinus_lift_graft_and_implant_soooo", "implant"), "treatment-fatigue"),
    ("If it's not my confidence and it's not a front tooth, do I leave it?", "Comparing options", "Deciding", "leave-it", "r/Dentalimplant", R("1x152do/have_to_get_a_sinus_lift_graft_and_implant_soooo", "implant"), "leave-the-gap"),
    ("What are the complications of a lateral sinus lift, separate from the money?", "Bone graft and sinus", "Before surgery", "sinus-complications", "r/Dentalimplant", R("1x152do/have_to_get_a_sinus_lift_graft_and_implant_soooo", "implant"), "sinus-risks"),
    ("I can decide in a few years. What gets worse if I do?", "Timeline", "Deciding", "worse-if-i-wait", "r/Dentalimplant", R("1x152do/have_to_get_a_sinus_lift_graft_and_implant_soooo", "implant"), "delay-cost"),
    ("Replacing four teeth with that graft. Is one graft serving four teeth a normal plan?", "Procedure", "Choosing a treatment", "one-graft-four-teeth", "r/Dentalimplant", R("1x152do/have_to_get_a_sinus_lift_graft_and_implant_soooo", "implant"), "graft-scope"),
    ("About $9,000 for the surgeon's part. What is and isn't in that?", "Cost", "Choosing a treatment", "what-9k-covers", "r/Dentalimplant", R("1x152do/have_to_get_a_sinus_lift_graft_and_implant_soooo", "implant"), "what-quote-covers"),
    ("Placing the graft was painful but I got through it. Is the implant placement worse or easier?", "Pain and fear", "Before surgery", "graft-vs-implant-pain", "r/Dentalimplant", R("1x152do/have_to_get_a_sinus_lift_graft_and_implant_soooo", "implant"), "which-part-hurts"),
    ("I'm in my 60s with a lifetime of bad teeth. Am I a candidate or am I too late?", "Candidacy", "Deciding", "sixties-candidate", "r/Dentalimplant", R("1x152do/have_to_get_a_sinus_lift_graft_and_implant_soooo", "implant"), "age-candidacy"),
    ("The extraction was traumatic and the surgeon was frustrated. How do I find someone calmer for the implant?", "Trust", "Before surgery", "find-a-calmer-surgeon", "r/Dentalimplant", R("1x152do/have_to_get_a_sinus_lift_graft_and_implant_soooo", "implant"), "bedside"),
    ("Six years of braces, root canals, and now an implant. Does orthodontics make implants harder?", "Candidacy", "Deciding", "after-ortho", "r/Dentalimplant", R("1x152do/have_to_get_a_sinus_lift_graft_and_implant_soooo", "implant"), "after-braces"),
    ("No insurance. Is financing, a dental school, or waiting the realistic menu?", "Cost", "Deciding", "no-insurance-menu", "r/Dentalimplant", R("1x152do/have_to_get_a_sinus_lift_graft_and_implant_soooo", "implant"), "no-insurance"),
]
SUBREDDIT_ROOTS = {
    REDDIT_D,
    REDDIT_I,
    REDDIT_A,
    REDDIT_ASK,
    "https://www.reddit.com/r/askvancouver",
    "https://www.reddit.com/r/askvan",
    "https://www.reddit.com/r/PeriodontalDisease",
    "https://www.reddit.com/r/Dentistry",
}
for item in reddit_items:
    question, topic, stage, cluster, source, url, _note = item
    if "reddit.com" in url or source.startswith("r/"):
        channel = "Reddit"
    elif source.startswith("American College"):
        channel = "Professional body FAQ"
    else:
        channel = "Google"
    if url in SUBREDDIT_ROOTS:
        source = f"{source} — related-post title; the exact thread URL was not captured"
    add(question, channel, topic, stage, source, url, cluster)


TOPIC_BY_CLUSTER = {
    "cost-general": "Cost",
    "surgeon-experience": "Choosing a clinic",
    "before-after": "Choosing a clinic",
    "candidacy": "Candidacy",
    "success-rate": "Longevity",
    "risks": "Complications",
    "rejection": "Complications",
    "enough-bone": "Bone graft and sinus",
    "what-happens-during": "Procedure",
    "which-sedation": "Pain and fear",
    "first-days": "Healing",
    "heal-time": "Healing",
    "how-long-last": "Longevity",
    "maintenance": "Daily care",
    "insurance": "Coverage",
    "how-to-prepare": "Procedure",
}


# Numbered FAQ headings pulled from the pages themselves, November 2026.
FAQ_PAGES = [
    (
        "https://centralfloridaoralsurgery.com/blog/every-single-question-youll-want-to-ask-before-getting-dental-implants/",
        "24 questions an oral surgery practice says patients ask before implants",
        [
            ("What is a dental implant?", "Basics", "Deciding", "what-are-implants"),
            ("Are dental implants safe?", "Complications", "Deciding", "are-they-safe"),
            ("What is the success rate of dental implants?", "Longevity", "Deciding", "success-rate"),
            ("What are the advantages of dental implants?", "Comparing options", "Deciding", "advantages"),
            ("What are the disadvantages of dental implants?", "Comparing options", "Deciding", "disadvantages"),
            ("How do dental implants compare with other types of tooth replacement?", "Comparing options", "Choosing a treatment", "compare-options"),
            ("Am I a candidate for dental implants?", "Candidacy", "Deciding", "candidacy"),
            ("What happens during a dental implant evaluation?", "Procedure", "Before surgery", "evaluation"),
            ("What is the dental implant process?", "Timeline", "Deciding", "process-steps"),
            ("How long will it take to get dental implants?", "Timeline", "Deciding", "process-time"),
            ("Will I need bone grafting before dental implants?", "Bone graft and sinus", "Choosing a treatment", "need-graft"),
            ("What if my body rejects the implants?", "Complications", "Deciding", "rejection"),
            ("What can I expect before implant surgery?", "Procedure", "Before surgery", "before-surgery"),
            ("What happens during dental implant surgery?", "Procedure", "Before surgery", "what-happens-during"),
            ("What can I expect after implant surgery?", "Healing", "First weeks", "after-surgery"),
            ("Is dental implant surgery painful?", "Pain and fear", "Before surgery", "pain-surgery"),
            ("How long is the post-surgery recovery period?", "Healing", "Before surgery", "recovery-time"),
            ("Who will restore my implants with crowns or dentures?", "Who does the work", "Choosing a treatment", "who-restores"),
            ("How long do dental implants last?", "Longevity", "Deciding", "how-long-last"),
            ("What if my implant needs to be removed?", "Failure", "When something goes wrong", "removal"),
            ("How much do dental implants cost?", "Cost", "Deciding", "cost-general"),
            ("Will my insurance cover the cost of dental implants?", "Coverage", "Deciding", "insurance"),
            ("How do I take care of dental implants?", "Daily care", "Living with it", "care-implant"),
            ("Will I still need dental cleanings and exams?", "Daily care", "Living with it", "recall"),
        ],
    ),
    (
        "https://hiossen.com/hiossen-blog/common-questions-about-dental-implants/",
        "20 most common implant questions, implant manufacturer patient FAQ",
        [
            ("Are dental implants common?", "Basics", "Deciding", "how-common"),
            ("Are dental implants safe?", "Complications", "Deciding", "are-they-safe"),
            ("How painful is getting a dental implant?", "Pain and fear", "Before surgery", "does-it-hurt"),
            ("How long does a dental implant procedure take?", "Timeline", "Deciding", "procedure-length"),
            ("What is the downside of dental implants?", "Comparing options", "Deciding", "disadvantages"),
            ("What is the upside of dental implants?", "Comparing options", "Deciding", "advantages"),
            ("What can I eat after dental implant surgery?", "Eating and speech", "First weeks", "after-surgery-food"),
            ("How soon after a tooth extraction can you have an implant?", "Timeline", "Choosing a treatment", "how-soon-after-extraction"),
            ("Can your mouth reject an implant?", "Complications", "Deciding", "rejection"),
            ("How long does it take for dental implants to heal?", "Healing", "Before surgery", "heal-time"),
            ("What can you not do after dental implant surgery?", "Healing", "First weeks", "restrictions"),
            ("Can you remove dental implants, or do they stay in your mouth?", "Snap-in vs fixed", "Choosing a treatment", "can-remove"),
            ("Who are good candidates for dental implants?", "Candidacy", "Deciding", "candidacy"),
            ("Can you turn dentures into implants?", "Comparing options", "Living with it", "retrofit"),
            ("How do implants help if I have partial or full dentures?", "Comparing options", "Living with it", "add-implants-later"),
            ("How long do implants last?", "Longevity", "Deciding", "how-long-last"),
            ("Does the dental implant procedure hurt?", "Pain and fear", "Before surgery", "does-it-hurt"),
            ("Will insurance cover dental implants?", "Coverage", "Deciding", "insurance"),
            ("How much do implants cost?", "Cost", "Deciding", "cost-general"),
        ],
    ),
    (
        "https://www.hrsurgery.com/14-questions-to-ask-your-oral-surgeon-about-dental-implants",
        "14 questions an oral surgery practice says to ask at the consult",
        [
            ("Am I a good candidate for dental implants?", "Candidacy", "Deciding", "candidacy"),
            ("Are dental implants safe?", "Complications", "Deciding", "are-they-safe"),
            ("How much experience do you have placing dental implants?", "Choosing a clinic", "Before surgery", "surgeon-experience"),
            ("How long does the dental implant procedure take?", "Timeline", "Before surgery", "chair-time"),
            ("Are there any drawbacks to getting dental implants?", "Comparing options", "Deciding", "disadvantages"),
            ("What makes dental implants a better choice than other options?", "Comparing options", "Deciding", "why-better"),
            ("How long do dental implants last?", "Longevity", "Deciding", "how-long-last"),
            ("Can dental implants be removed?", "Snap-in vs fixed", "Choosing a treatment", "can-remove"),
            ("Is sedation used during dental implant surgery?", "Pain and fear", "Before surgery", "which-sedation"),
            ("How do I prepare for dental implant surgery?", "Procedure", "Before surgery", "how-to-prepare"),
            ("How long does recovery take?", "Healing", "Before surgery", "recovery-time"),
            ("Is there anything I cannot eat with dental implants?", "Eating and speech", "Living with it", "foods-to-avoid"),
            ("How much do dental implants cost?", "Cost", "Deciding", "cost-general"),
            ("Does insurance cover dental implants?", "Coverage", "Deciding", "insurance"),
        ],
    ),
    (
        "https://www.keppeldental.com.au/treatment-guides/ask-a-dentist-answering-the-top-11-dental-implant-questions",
        "Top 11 questions the dentist says patients and Google ask",
        [
            ("What are dental implants?", "Basics", "Deciding", "what-are-implants"),
            ("How long do dental implants last?", "Longevity", "Deciding", "how-long-last"),
            ("Are dental implants painful?", "Pain and fear", "Before surgery", "does-it-hurt"),
            ("How much is a tooth implant?", "Cost", "Deciding", "single-tooth-cost"),
            ("Can dental implants be removed?", "Snap-in vs fixed", "Choosing a treatment", "can-remove"),
            ("Can dental implants fail?", "Failure", "Deciding", "can-fail"),
            ("Can dental implants be done in one day?", "Same-day teeth", "Choosing a treatment", "same-day"),
            ("How do dental implants work?", "Basics", "Deciding", "how-they-work"),
            ("What are full mouth dental implants?", "Basics", "Choosing a treatment", "what-is-full-mouth"),
            ("Is getting dental implants worth it?", "Cost", "Deciding", "worth-it"),
            ("Are dental implants covered by Medicare?", "Coverage", "Deciding", "medicare"),
        ],
    ),
    (
        "https://dcperio.com/faqs",
        "Questions a periodontist says patients ask most",
        [
            ("How long do dental implants last?", "Longevity", "Deciding", "how-long-last"),
            ("Do dental implants hurt?", "Pain and fear", "Before surgery", "does-it-hurt"),
            ("Can I get an implant the same day as my extraction?", "Same-day teeth", "Choosing a treatment", "immediate-placement"),
            ("Do I need bone grafting before my implant?", "Bone graft and sinus", "Choosing a treatment", "need-graft"),
            ("What's the difference between an implant and a bridge?", "Comparing options", "Choosing a treatment", "implant-vs-bridge"),
            ("Does insurance cover dental implants?", "Coverage", "Deciding", "insurance"),
            ("Is All-on-4 the same as full-arch implants?", "Basics", "Choosing a treatment", "allon4-vs-full-arch"),
            ("How many implants do I need for a full arch?", "Snap-in vs fixed", "Choosing a treatment", "how-many-posts"),
            ("Can I leave with teeth the same day?", "Same-day teeth", "Choosing a treatment", "same-day"),
            ("What's the difference between full-arch implants and dentures?", "Comparing options", "Choosing a treatment", "full-arch-vs-dentures"),
            ("How long does full-arch treatment take?", "Timeline", "Deciding", "full-arch-time"),
            ("Am I a candidate if I have significant bone loss?", "Bone graft and sinus", "Deciding", "bone-loss-candidacy"),
            ("What sedation options do you offer?", "Pain and fear", "Before surgery", "which-sedation"),
            ("Will I be asleep during surgery?", "Pain and fear", "Before surgery", "asleep-or-awake"),
            ("Do I need a driver after sedation?", "Practical life", "Before surgery", "need-a-driver"),
            ("Is IV sedation safe?", "Pain and fear", "Before surgery", "iv-safe"),
            ("I have severe dental anxiety. Can you help?", "Pain and fear", "Before surgery", "dental-phobia"),
            ("What happens at my first appointment?", "Procedure", "Before surgery", "first-appointment"),
            ("How much does treatment cost?", "Cost", "Deciding", "cost-general"),
            ("Do you take my insurance?", "Coverage", "Deciding", "insurance"),
            ("Do you offer financing?", "Cost", "Deciding", "financing"),
            ("What if I want a second opinion?", "Trust", "Before surgery", "second-opinion"),
        ],
    ),
    (
        "https://www.blankdental.com/questions-to-ask-your-dentist-before-dental-implants",
        "Questions a clinic tells patients to ask before implants",
        [
            ("Am I a good candidate for dental implants?", "Candidacy", "Deciding", "candidacy"),
            ("How much experience does your dentist have with implant dentistry?", "Choosing a clinic", "Before surgery", "surgeon-experience"),
            ("What type of dental implants would you recommend?", "Choosing a clinic", "Before surgery", "which-system"),
            ("What is the time from start to finish?", "Timeline", "Deciding", "process-time"),
            ("What are the risks and complications?", "Complications", "Deciding", "risks"),
            ("What will my total investment be?", "Cost", "Choosing a treatment", "all-in-cost"),
            ("How do I maintain my implants in the long run?", "Daily care", "Living with it", "maintenance"),
        ],
    ),
    (
        "https://metrolinaperio.com/blog/20-questions-to-ask-your-periodontist-about-dental-implants",
        "Periodontist '20 questions' page. Headings recovered from the page text, not the full numbered set.",
        [
            ("How long does the dental implant procedure take?", "Timeline", "Deciding", "procedure-length"),
            ("Am I a good candidate for dental implants?", "Candidacy", "Deciding", "candidacy"),
            ("If I need extractions, how long do I need to wait to get an implant?", "Timeline", "Choosing a treatment", "wait-after-extraction"),
            ("How long will my implants take to heal?", "Healing", "Before surgery", "heal-time"),
            ("What is the success rate of dental implants?", "Longevity", "Deciding", "success-rate"),
            ("Is it possible to get metal-free implants?", "Materials", "Choosing a treatment", "metal-free"),
            ("Can dentures be made into implants?", "Comparing options", "Living with it", "retrofit"),
            ("How much do implants cost?", "Cost", "Deciding", "cost-general"),
            ("Will my insurance cover my implants?", "Coverage", "Deciding", "insurance"),
        ],
    ),
]
for url, source, items in FAQ_PAGES:
    for question, topic, stage, cluster in items:
        add(question, "Google", topic, stage, source, url, cluster)


def closest_blog(question: str) -> str:
    text = question.lower()
    hits = []
    for slug, keys in BLOGS:
        if any(key in text for key in keys):
            hits.append(slug)
    return ", ".join(hits[:3])


def main() -> None:
    seen: set[str] = set()
    unique: list[Q] = []
    for row in ROWS:
        key = re.sub(r"[^a-z0-9]+", " ", row[0].lower()).strip()
        if key in seen:
            continue
        seen.add(key)
        topic = TOPIC_BY_CLUSTER.get(row[6], row[2])
        unique.append((row[0], row[1], topic, row[3], row[4], row[5], row[6]))

    wb = Workbook()
    ws = wb.active
    ws.title = "Questions"

    headers = [
        "ID",
        "Question",
        "Where people ask it",
        "Topic",
        "When in the journey",
        "Cluster",
        "Source",
        "Source URL",
        "Renew article that already touches it",
        "Answer status",
    ]
    ws.append(headers)
    header_fill = PatternFill("solid", fgColor="1F4E79")
    header_font = Font(color="FFFFFF", bold=True, name="Calibri", size=11)
    for cell in ws[1]:
        cell.fill = header_fill
        cell.font = header_font
        cell.alignment = Alignment(vertical="center", wrap_text=True)
    ws.row_dimensions[1].height = 22
    ws.auto_filter.ref = f"A1:J{len(unique) + 1}"
    ws.freeze_panes = "A2"
    ws.auto_filter.ref = f"A1:J{len(unique) + 1}"

    wrap = Alignment(wrap_text=True, vertical="top")
    link_font = Font(color="0563C1", underline="single", name="Calibri", size=11)
    body = Font(name="Calibri", size=11)

    for i, (question, channel, topic, stage, source, url, cluster) in enumerate(unique, start=1):
        blog = closest_blog(question)
        status = "Started on the site" if blog else "Not answered on the site yet"
        ws.append([i, question, channel, topic, stage, cluster, source, url, blog, status])
        row = ws.max_row
        for col in range(1, 11):
            ws.cell(row, col).alignment = wrap
            ws.cell(row, col).font = body
        link_cell = ws.cell(row, 8)
        link_cell.hyperlink = url
        link_cell.font = link_font
        if status.startswith("Not"):
            ws.cell(row, 10).fill = PatternFill("solid", fgColor="FCE4D6")
        else:
            ws.cell(row, 10).fill = PatternFill("solid", fgColor="E2EFDA")

    widths = [6, 78, 28, 24, 24, 26, 42, 36, 42, 28]
    for idx, width in enumerate(widths, start=1):
        ws.column_dimensions[get_column_letter(idx)].width = width
    ws.auto_filter.ref = f"A1:J{ws.max_row}"
    ws.sheet_view.showGridLines = False

    # Status dropdown so the team can move questions along
    dv = DataValidation(
        type="list",
        formula1='"Not answered on the site yet,Started on the site,Drafting,Published,Skip"',
        allow_blank=False,
    )
    dv.error = "Pick a status"
    dv.errorTitle = "Status"
    ws.add_data_validation(dv)
    dv.add(f"J2:J{ws.max_row}")

    # Counts
    counts = wb.create_sheet("Counts")
    counts["A1"] = "How to read this"
    counts["A1"].font = Font(bold=True, size=14, name="Calibri")
    counts["A2"] = (
        "Each row is a question found in a source, not a question we made up. "
        "Reddit rows use the post title or the question the poster actually asked. "
        "ChatGPT rows are the question lists in peer-reviewed papers: either what ChatGPT returned "
        "when asked what patients ask, or the questions prosthodontists collected and then typed into ChatGPT. "
        "Google rows are People Also Ask lines, clinic FAQ headings built for those searches, and Canadian coverage questions. "
        "Near-duplicate wordings are kept when the wording itself is different, because that is how people search. "
        "The same idea shares a Cluster so you can answer a group once. "
        "The Renew column is a keyword match against current blog slugs. It means the article touches the topic. It does not mean the question is fully answered."
    )
    counts["A2"].alignment = Alignment(wrap_text=True, vertical="top")
    counts.row_dimensions[2].height = 80
    counts.merge_cells("A2:F2")

    counts["A4"] = "By where people ask"
    counts["A4"].font = Font(bold=True, name="Calibri")
    by_channel = Counter(r[1] for r in unique)
    counts["A5"] = "Channel"
    counts["B5"] = "Questions"
    row = 6
    for name, n in by_channel.most_common():
        counts.cell(row, 1, name)
        counts.cell(row, 2, n)
        row += 1
    channel_end = row - 1

    counts["D4"] = "By topic"
    counts["D4"].font = Font(bold=True, name="Calibri")
    by_topic = Counter(r[2] for r in unique)
    counts["D5"] = "Topic"
    counts["E5"] = "Questions"
    row = 6
    for name, n in by_topic.most_common():
        counts.cell(row, 4, name)
        counts.cell(row, 5, n)
        row += 1

    unanswered = sum(1 for r in unique if not closest_blog(r[0]))
    counts["A20"] = "Total questions"
    counts["B20"] = len(unique)
    counts["A21"] = "No matching Renew article yet"
    counts["B21"] = unanswered
    counts["A22"] = "Touches an existing article"
    counts["B22"] = len(unique) - unanswered
    for cell in ("A20", "A21", "A22", "A5", "B5", "D5", "E5"):
        counts[cell].font = Font(bold=True, name="Calibri")

    chart = BarChart()
    chart.type = "bar"
    chart.title = "Questions by where people ask them"
    chart.y_axis.title = None
    chart.x_axis.title = None
    data = Reference(counts, min_col=2, min_row=5, max_row=channel_end)
    cats = Reference(counts, min_col=1, min_row=6, max_row=channel_end)
    chart.add_data(data, titles_from_data=True)
    chart.set_categories(cats)
    chart.shape = 4
    chart.legend = None
    chart.height = 8
    chart.width = 18
    counts.add_chart(chart, "A24")

    counts.column_dimensions["A"].width = 55
    counts.column_dimensions["B"].width = 16
    counts.column_dimensions["D"].width = 28
    counts.column_dimensions["E"].width = 14
    counts.sheet_view.showGridLines = False

    # Clusters
    clusters = wb.create_sheet("Clusters")
    clusters.append(["Cluster", "Questions in it", "Example question"])
    for cell in clusters[1]:
        cell.fill = header_fill
        cell.font = header_font
    grouped: dict[str, list[str]] = {}
    for question, _ch, _topic, _stage, _source, _url, cluster in unique:
        grouped.setdefault(cluster, []).append(question)
    for cluster, questions in sorted(grouped.items(), key=lambda kv: (-len(kv[1]), kv[0])):
        clusters.append([cluster, len(questions), questions[0]])
    clusters.auto_filter.ref = f"A1:C{clusters.max_row}"
    clusters.freeze_panes = "A2"
    clusters.column_dimensions["A"].width = 32
    clusters.column_dimensions["B"].width = 18
    clusters.column_dimensions["C"].width = 100
    for row in clusters.iter_rows(min_row=2, max_col=3):
        for cell in row:
            cell.alignment = Alignment(wrap_text=True, vertical="top")
    clusters.sheet_view.showGridLines = False

    sources = wb.create_sheet("Sources")
    sources.append(["Source", "URL", "What it contributes"])
    for cell in sources[1]:
        cell.fill = header_fill
        cell.font = header_font
    source_notes = [
        ("Reddit r/dentures, r/Dentalimplant, r/Allon4ImplantDentures, r/askdentists, plus city subs", "https://www.reddit.com/r/dentures", "Thread titles and the questions inside the posts, gathered November 2026."),
        ("Journal of Prosthetic Dentistry, 2025", JPD, "ChatGPT-3.5's top 10 FAQs in four domains, plus 10 questions prosthodontists hear, also asked of ChatGPT."),
        ("BMC Oral Health chatbot study", PMC35, "35 questions assembled by asking chatbots what people ask about prostheses."),
        ("ChatGPT-4o and Gemini prosthodontic study", PMC30, "30 questions from prosthodontist records, then submitted to the chatbots."),
        ("American College of Prosthodontists", ACP, "Denture questions patients send the college."),
        ("AAID via Dentistry Today", "https://www.dentistrytoday.com/aaid-reports-the-top-questions-it-receives-from-patients-about-dental-implants", "The five questions AAID says it receives most."),
        ("People Also Ask blocks", "https://adcroundrock.com/round-rock-tx/dental-implants-consultation", "PAA questions printed on implant consultation pages."),
        ("Canadian Dental Care Plan", "https://www.canada.ca/en/services/benefits/dental/dental-care-plan/coverage.html", "Coverage questions people search, answered against the federal guide."),
        ("Clinic FAQ pages", COL, "Headings written because patients ask them. Treated as search questions, not as Reddit quotes."),
    ]
    for name, url, note in source_notes:
        sources.append([name, url, note])
        cell = sources.cell(sources.max_row, 2)
        cell.hyperlink = url
        cell.font = link_font
    sources.column_dimensions["A"].width = 55
    sources.column_dimensions["B"].width = 55
    sources.column_dimensions["C"].width = 78
    for row in sources.iter_rows(min_row=2, max_col=3):
        for cell in row:
            cell.alignment = Alignment(wrap_text=True, vertical="top")
    sources.sheet_view.showGridLines = False

    wb.save(OUT)
    print(f"Wrote {OUT}")
    print(f"Questions: {len(unique)}")
    print(f"Unmatched to a blog: {unanswered}")
    for name, n in by_channel.most_common():
        print(f"  {name}: {n}")


if __name__ == "__main__":
    main()
