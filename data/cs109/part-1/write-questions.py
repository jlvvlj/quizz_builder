#!/usr/bin/env python3
"""Author CS109 Part 1's quiz questions and check every numeric answer before writing them.

Each question comes from Part 1's own lessons; the lesson it tests is recorded with it. Answers
that are numbers are recomputed here, so a wrong figure fails the script instead of reaching the
quiz. Running it rewrites questions.json.
"""
import hashlib, json, math
from fractions import Fraction as F
from pathlib import Path

C = math.comb
def close(a, b, tol=0.0006): assert abs(a - b) < tol, (a, b)

# Checks for the numbers quoted below.
close(2180 / 3070, 0.710)
assert F(6, 36) == F(1, 6)
assert F(5, 6) == F(len({2, 4, 6} | {1, 2, 3}), 6)
assert 2 ** 4 - 1 == 15
assert F(3, 50) / F(14, 50) == F(3, 14)
close(0.1 * 0.5 + 0.3 * 0.2 + 0.6 * 0.05, 0.14)
close(0.95 * 0.01 / (0.95 * 0.01 + 0.07 * 0.99), 0.12, 0.002)
assert 45 + 95 == 140 and round(45 / 140, 2) == 0.32  # 1000 people: 50 sick, 90% / 10% positive
close(0.16 / (0.5 * 0.1 + 0.3 * 0.4 + 0.2 * 0.8), 0.485)
assert F(1, 2) ** 5 == F(1, 32)
close(1 - 0.1 ** 3, 0.999)
close(math.log(0.00001), -11.51, 0.005)
close(0.6 ** 10, 0.006, 0.0005); close(0.4 ** 10, 0.0001, 0.00001)
assert C(10, 4) == 210; close(C(10, 4) * 0.6 ** 4 * 0.4 ** 6, 0.111)
assert 100 * 100 == 10_000 and 20 + 15 == 35
assert math.factorial(5) == 120 and math.factorial(4) == 24
assert math.factorial(11) // (math.factorial(4) ** 2 * math.factorial(2)) == 34_650
assert C(5, 3) == 10 and 3 * math.factorial(4) // math.factorial(2) == 36
assert C(8000, 2) == 31_996_000 and 2 * C(4, 2) + C(4, 3) == 16 == C(6, 3) - C(4, 1)
close(0.20 * 0.10 + 0.01 * 0.90, 0.029); close(0.02 / 0.029, 0.69, 0.005)
close(1 - math.prod((17000 - 150 - i) / (17000 - i) for i in range(100)), 0.59, 0.005)
import itertools
medals = [0.4, 0.6, 0.9, 0.2, 0.1]
close(sum(math.prod(q if i in won else 1 - q for i, q in enumerate(medals)) for won in itertools.combinations(range(5), 3)), 0.289)
close(C(5, 3) * 0.44 ** 3 * 0.56 ** 2, 0.267); close(0.4 * 0.6 * 0.9, 0.216)
assert math.perm(45, 10) == math.factorial(45) // math.factorial(35) and 52 - 7 == 45 and 5 * 2 == 10

STEPS = [
    (1, 'Notation'),
    (2, 'Probability and equally likely outcomes'),
    (3, 'Axioms and the probability of “or”'),
    (4, 'Conditional probability and the law of total probability'),
    (5, 'Bayes’ theorem'),
    (6, 'Independence and the probability of “and”'),
    (7, 'De Morgan’s law and log probabilities'),
    (8, 'Many coin flips'),
    (9, 'Counting and combinatorics'),
    (10, 'Applications'),
]

# (lesson, question, correct answer, [three wrong answers], explanation)
Q = {1: [
    ('probability-events-and-experiments', 'S', 'The sample space: the set of all possible outcomes of an experiment', ['An event we ascribe meaning to', 'The probability of an event', 'The number of trials performed'], 'S is the set every outcome of the experiment belongs to; events are subsets of it.'),
    ('probability-events-and-experiments', 'E ⊆ S', 'E is an event: a subset of the sample space', ['E is the sample space itself', 'E is an outcome that always occurs', 'E has probability 1'], 'An event is any subset of S that we ascribe meaning to.'),
    ('probability-definition-of-probability', 'count(E) / n, as n → ∞', 'P(E): the fraction of n trials that produce E, in the limit', ['The number of outcomes in E', 'P(E) for equally likely outcomes only', 'The probability that E never occurs'], 'The definition of probability is the limit of the fraction of trials in which the event occurs.'),
    ('equally-likely', '|E| / |S|', 'P(E) when every outcome in S is equally likely', ['P(E) for any sample space', 'The probability of the complement of E', 'The number of outcomes in E'], 'Counting outcomes gives the probability only when every outcome has the same probability.'),
    ('axioms-provable-identities', 'Eᶜ', 'The complement of E: every outcome in S that is not in E', ['The event that E happens twice', 'An event mutually exclusive with S', 'The conditional version of E'], 'Eᶜ contains exactly the outcomes of S outside E, so P(Eᶜ) = 1 − P(E).'),
    ('prob-or-intro', 'P(E or F)', 'The probability that E, F, or both occur', ['The probability that exactly one of E and F occurs', 'The probability that both E and F occur', 'P(E) + P(F) in every case'], '“Or” includes the outcomes where both events occur.'),
    ('prob-and-intro', 'P(E and F)', 'The probability that both E and F occur', ['The probability that E or F occurs', 'P(E) × P(F) in every case', 'The probability that E occurs given F'], 'P(E and F), also written P(EF), P(E ∩ F) or P(E, F), is the probability both happen.'),
    ('cond-prob-intro', 'P(E | F)', 'The probability of E given that F has already happened', ['The probability of E and F together', 'The probability of F given E', 'The probability of E divided by that of F'], 'Conditioning on F restricts the sample space to the outcomes consistent with F.'),
    ('cond-prob-conditioning-on-multiple-events', 'P(E | F, G)', 'The probability of E given that both F and G have occurred', ['The probability of E, F and G together', 'The probability of E given F or G', 'The probability of E and F given G'], 'A comma after the bar means every listed event is conditioned on.'),
    ('bayes-theorem-intro', 'P(U | E) in Bayes’ theorem', 'The posterior: the updated belief in U after seeing the evidence E', ['The prior: the belief in U before any evidence', 'The likelihood of the evidence given U', 'The normalization constant'], 'Bayes’ theorem turns the prior P(U) into the posterior P(U | E).'),
    ('bayes-theorem-intro', 'P(E | U) in Bayes’ theorem', 'The likelihood: the probability of the evidence if U is true', ['The posterior', 'The prior', 'The normalization constant'], 'The likelihood is usually the easy direction to know, which is why Bayes’ theorem is useful.'),
    ('log-probabilities-intro', 'log P(E), with no base written', 'The natural logarithm of P(E), with base e', ['The base-10 logarithm of P(E)', 'The base-2 logarithm of P(E)', 'The probability that E occurs e times'], 'In this course a log with no written base is the natural log.'),
    ('combinatorics-combinations-of-distinct-objects', 'n choose r', 'n! / (r!(n − r)!): the number of ways to choose r of n distinct objects when order does not matter', ['n! / (n − r)!: the number of ordered selections', 'rⁿ: the number of ways to fill r buckets', 'n! / r!: the orderings of the chosen objects'], 'Dividing out the r! orders of the chosen objects and the (n − r)! orders of the rest leaves the unordered selections.'),
    ('combinatorics-bucketing-with-distinct-objects', 'rⁿ, in bucketing', 'The number of ways to place n distinct items into r containers', ['The number of ways to choose r of n items', 'The number of orderings of n items', 'The number of ways to place r items into n containers'], 'Each of the n items is one step with r choices, and the step rule multiplies them.'),
], 2: [
    ('probability-events-and-experiments', 'What is the sample space for flipping two coins?', '{(H, H), (H, T), (T, H), (T, T)}', ['{H, T}', '{(H, H), (H, T), (T, T)}', '{HH, TT}'], 'Each outcome records both coins; (H, T) and (T, H) are different outcomes.'),
    ('probability-events-and-experiments', 'Which set is the event “at least one head” on two coin flips?', '{(H, H), (H, T), (T, H)}', ['{(H, H)}', '{(H, T), (T, H)}', '{(H, H), (H, T), (T, H), (T, T)}'], 'The event collects every outcome of the sample space with at least one head.'),
    ('probability-probability-from-datasets', 'Of 3,070 elephants born in Myanmar, 2,180 were male. What is the estimated probability that a newborn elephant is male?', 'About 0.710', ['About 0.5', 'About 0.290', 'About 2.180'], 'The definition of probability estimates P(E) as count(E) / n = 2,180 / 3,070 ≈ 0.710.'),
    ('probability-definition-of-probability', 'How is a 32% chance of rain properly stated as a probability?', 'The probability of rain is 0.32', ['The probability of rain is 32', 'The probability of rain is 3.2', 'The probability of rain is 0.032'], 'Percentages are probabilities multiplied by 100.'),
    ('probability-simulating-probability', 'How do you estimate P(E) by simulation?', 'Run many trials and take the fraction that produced an outcome in E', ['Run one trial and check whether E occurred', 'Count the outcomes in E and divide by the number of events', 'Average the probabilities of every outcome'], 'By the definition of probability, the fraction of simulated trials in E approaches P(E) as trials grow.'),
    ('probability-simulating-probability', 'You can only simulate 80 trials of an experiment. What does the lesson advise?', 'Be rather skeptical of the estimated probability', ['The estimate is exact once you have more than 50 trials', 'Simulation cannot estimate probabilities at all', 'Round the estimate to the nearest tenth and trust it'], 'The lesson warns that with fewer than 100 trials you should be rather skeptical of the estimate.'),
    ('equally-likely', 'Two fair, distinct dice are rolled. What is the probability that they sum to 7?', '1/6', ['1/11', '7/36', '1/12'], 'Six of the 36 equally likely outcomes sum to 7: (1,6), (2,5), (3,4), (4,3), (5,2), (6,1).'),
    ('equally-likely', 'Why is {2, 3, …, 12} a buggy sample space for P(sum of two dice is 7)?', 'Its outcomes are not equally likely, so |E| / |S| does not apply', ['It leaves out some possible sums', 'It contains sums that cannot happen', 'A sample space must contain pairs, not numbers'], 'A sum of 2 is far less likely than a sum of 7, so counting sums does not give probabilities.'),
    ('equally-likely', 'A random number is drawn uniformly from 0 to 1. What is the probability it lands between 0.3 and 0.7?', '0.4', ['0.3', '0.7', '0.5'], 'For equally likely continuous outcomes, the probability is the size of the event over the size of S: 0.4 / 1.'),
    ('equally-likely', 'In a sample space S of equally likely outcomes, what is the probability of any one outcome?', '1 / |S|', ['|S|', '1 / 2', '|S| − 1'], 'The outcomes are equally likely and their probabilities sum to 1.'),
], 3: [
    ('axioms-intro', 'What does axiom 1 of probability state?', '0 ≤ P(E) ≤ 1', ['P(S) = 1', 'P(E or F) = P(E) + P(F)', 'P(Eᶜ) = 1 − P(E)'], 'Every probability lies between 0 and 1.'),
    ('axioms-intro', 'What does axiom 2 of probability state?', 'P(S) = 1', ['0 ≤ P(E) ≤ 1', 'P(∅) = 1', 'P(E) + P(F) = 1'], 'Every outcome is in the sample space, so it has probability 1.'),
    ('axioms-intro', 'What does axiom 3 of probability state?', 'If E and F are mutually exclusive, P(E or F) = P(E) + P(F)', ['For any E and F, P(E or F) = P(E) + P(F)', 'If E and F are independent, P(E and F) = P(E)P(F)', 'P(E or F) = P(E) + P(F) − P(E and F)'], 'Probabilities of mutually exclusive events add.'),
    ('axioms-provable-identities', 'Which identity follows from the axioms for the complement of E?', 'P(Eᶜ) = 1 − P(E)', ['P(Eᶜ) = P(E)', 'P(Eᶜ) = 1 / P(E)', 'P(Eᶜ) = P(S) + P(E)'], 'E and Eᶜ are mutually exclusive and together cover S, so P(E) + P(Eᶜ) = 1.'),
    ('axioms-provable-identities', 'If E ⊆ F, what must be true?', 'P(E) ≤ P(F)', ['P(E) ≥ P(F)', 'P(E) = P(F)', 'P(E) + P(F) = 1'], 'An event contained in another cannot be more likely.'),
    ('prob-or-mutually-exclusive-events', 'When are two events mutually exclusive?', 'When no outcome is in both of them', ['When knowing one tells you nothing about the other', 'When together they cover the sample space', 'When they have the same probability'], 'Mutually exclusive events cannot both happen: E ∩ F = ∅.'),
    ('prob-or-or-with-non-mutually-exclusive-events', 'On one fair die roll, what is P(even or three or less)?', '5/6', ['1', '1/2', '2/3'], 'The event is {1, 2, 3, 4, 6}. Adding 1/2 + 1/2 would count the outcome 2 twice.'),
    ('prob-or-or-with-non-mutually-exclusive-events', 'For any two events E and F, P(E or F) equals', 'P(E) + P(F) − P(E and F)', ['P(E) + P(F)', 'P(E) × P(F)', 'P(E) + P(F) + P(E and F)'], 'Inclusion–exclusion subtracts the outcomes that adding would count twice.'),
    ('prob-or-inclusion-exclusion-with-three-events', 'In inclusion–exclusion for three events, what is the sign of P(E₁ and E₂ and E₃)?', 'Plus: it is added back', ['Minus: it is subtracted', 'It does not appear', 'It is subtracted twice'], 'Add single events, subtract pairs, then add the triple back.'),
    ('prob-or-inclusion-exclusion-with-events', 'How many probability terms does inclusion–exclusion have for n events?', '2ⁿ − 1', ['n', 'n²', 'n!'], 'There is one term for every non-empty subset of the n events.'),
], 4: [
    ('cond-prob-intro', 'What is the definition of P(E | F)?', 'P(E and F) / P(F)', ['P(E) / P(F)', 'P(E and F) / P(E)', 'P(E) × P(F)'], 'Restrict to the universe where F happened and ask how much of it is also in E.'),
    ('cond-prob-intro', 'In a sample space of 50 equally likely hexagons, F has 14 and E and F share 3. What is P(E | F)?', '3/14', ['3/50', '14/50', '3/17'], 'P(E | F) = (3/50) / (14/50) = 3/14.'),
    ('cond-prob-intro', 'Once you condition on F, what becomes the sample space?', 'F', ['Fᶜ', 'E and F', 'S, unchanged'], 'Only outcomes consistent with F remain possible.'),
    ('cond-prob-conditional-probability-example', 'How can P(watches E | watched F) be estimated from viewing data?', 'People who watched both E and F, divided by people who watched F', ['People who watched E, divided by people who watched F', 'People who watched both, divided by all users', 'People who watched F, divided by people who watched E'], 'Both counts in the definition share the same total, which cancels.'),
    ('cond-prob-the-conditional-paradigm', 'Conditioned consistently on G, what is P(Eᶜ | G)?', '1 − P(E | G)', ['1 − P(E)', 'P(E | G)', '1 − P(G)'], 'Every rule of probability still holds inside the universe where G occurred.'),
    ('cond-prob-conditioning-on-multiple-events', 'Which expression equals P(E | F, G)?', 'P(E and F | G) / P(F | G)', ['P(E and F and G) / P(E)', 'P(E | F) × P(E | G)', 'P(E | G) / P(F | G)'], 'The definition of conditional probability, applied in the universe where G has occurred.'),
    ('law-total-intro', 'The law of total probability with a single background event F gives P(E) =', 'P(E | F)P(F) + P(E | Fᶜ)P(Fᶜ)', ['P(E | F) + P(E | Fᶜ)', 'P(E | F)P(F)', 'P(E and F) − P(E and Fᶜ)'], 'E splits into the part in F and the part outside it, and the chain rule expands each part.'),
    ('law-total-law-of-total-probability-many-background-events', 'What must the background events B₁, …, Bₙ satisfy for the law of total probability?', 'They are mutually exclusive and together cover the sample space', ['They are independent of E', 'They all have the same probability', 'Each one contains E'], 'Every outcome must fall in exactly one background event.'),
    ('law-total-law-of-total-probability-many-background-events', 'A population is 10% high-risk, 30% medium-risk and 60% low-risk, testing positive with probability 0.5, 0.2 and 0.05. What is P(positive)?', '0.14', ['0.75', '0.25', '0.05'], '0.5 × 0.1 + 0.2 × 0.3 + 0.05 × 0.6 = 0.05 + 0.06 + 0.03 = 0.14.'),
    ('cond-prob-conditional-probability-example', 'If F is the event that a user watched Amélie, what is P(watched Amélie | F)?', '1', ['0.03', '0.5', 'It cannot be known'], 'Given F, F is certain.'),
], 5: [
    ('bayes-theorem-intro', 'What is the classic form of Bayes’ theorem?', 'P(U | E) = P(E | U) P(U) / P(E)', ['P(U | E) = P(E | U) / P(U)', 'P(U | E) = P(E | U) P(E) / P(U)', 'P(U | E) = P(U) P(E)'], 'Write the “and” with the chain rule and divide by P(E).'),
    ('bayes-theorem-intro', 'In Bayes’ theorem, what is P(U) called?', 'The prior', ['The posterior', 'The likelihood', 'The evidence'], 'It is the belief in U before any evidence is seen.'),
    ('bayes-theorem-intro', 'In Bayes’ theorem, what is P(E) called?', 'The normalization constant', ['The prior', 'The posterior', 'The likelihood'], 'It makes the posterior probabilities sum to one.'),
    ('bayes-theorem-intro', 'When is Bayes’ theorem most useful?', 'When P(evidence | hidden state) is easy to know but you want P(hidden state | evidence)', ['When the two events are independent', 'When the prior is exactly 0.5', 'When the evidence is certain'], 'Hidden states cause observable evidence, so the likelihood is usually what you can estimate.'),
    ('bayes-theorem-probability-of-disease-using-bayes-theorem', 'A test is positive 95% of the time with a disease and 7% of the time without it, and 1% of people have the disease. What is P(disease | positive)?', 'About 0.12', ['About 0.95', 'About 0.93', 'About 0.01'], '0.95 × 0.01 / (0.95 × 0.01 + 0.07 × 0.99) = 0.0095 / 0.0788 ≈ 0.12.'),
    ('bayes-theorem-natural-frequency-intuition', 'Why can a positive test still leave the disease unlikely?', 'When the disease is rare, most positive results come from the much larger healthy group', ['The test is usually wrong for sick patients', 'Bayes’ theorem ignores the prior', 'A positive test lowers the probability of disease'], 'The lesson notes this happens when the probability a random person has the disease is low.'),
    ('bayes-theorem-natural-frequency-intuition', 'Of 1,000 people, 50 have a disease. The test is positive for 90% of the sick and 10% of the healthy. What fraction of those who test positive are sick?', 'About 0.32', ['0.90', '0.50', 'About 0.05'], '45 sick people test positive and 95 healthy ones do: 45 / 140 ≈ 0.32.'),
    ('bayes-theorem-bayes-with-the-general-law-of-total-probability', 'With mutually exclusive, exhaustive events B₁, …, Bₙ, the denominator of P(Bᵢ | E) is', 'Σⱼ P(E | Bⱼ) P(Bⱼ)', ['Σⱼ P(Bⱼ | E)', 'P(E | Bᵢ) P(Bᵢ)', 'Πⱼ P(E | Bⱼ)'], 'The general law of total probability expands P(E) over the background events.'),
    ('bayes-theorem-bayes-with-the-general-law-of-total-probability', 'A phone is in location 1, 2 or 3 with prior 0.5, 0.3, 0.2. A signal is seen with probability 0.1, 0.4 and 0.8 from each. Given the signal, what is P(location 3)?', 'About 0.48', ['0.2', '0.8', 'About 0.33'], 'P(signal) = 0.05 + 0.12 + 0.16 = 0.33, and 0.16 / 0.33 ≈ 0.48.'),
    ('bayes-theorem-intro', 'With a single hypothesis U, Bayes’ denominator expanded by the law of total probability is', 'P(E | U) P(U) + P(E | Uᶜ) P(Uᶜ)', ['P(E | U) + P(E | Uᶜ)', 'P(U | E) + P(Uᶜ | E)', 'P(E | U) P(U)'], 'The evidence can arise with U or without it.'),
], 6: [
    ('independence-intro', 'Which statement defines E as independent of F?', 'P(E | F) = P(E)', ['P(E and F) = 0', 'P(E | F) = P(F)', 'P(E or F) = P(E) + P(F)'], 'Knowing F does not change the belief in E.'),
    ('independence-alternative-definition', 'If E and F are independent, P(E and F) equals', 'P(E) × P(F)', ['P(E) + P(F)', 'P(E | F) × P(F | E)', '0'], 'The chain rule gives P(E | F)P(F), and independence makes P(E | F) = P(E).'),
    ('independence-independence-is-symmetric', 'If E is independent of F, what follows?', 'F is independent of E', ['F is dependent on E', 'E and F are mutually exclusive', 'P(E) = P(F)'], 'Bayes’ theorem shows the definition is symmetric.'),
    ('independence-independence-and-complements', 'If A and B are independent, which pair is also independent?', 'A and Bᶜ', ['A and A', 'A and (A and B)', 'None: complements break independence'], 'Independence carries over to any complements: A with Bᶜ, Aᶜ with B, and Aᶜ with Bᶜ.'),
    ('independence-generalized-independence', 'What is the probability of 5 heads on 5 independent flips of a fair coin?', '1/32', ['5/2', '1/5', '1/10'], '(1/2)⁵ = 1/32.'),
    ('independence-generalized-independence', 'What does it take for events E₁, …, Eₙ to be independent?', 'Every subset of them multiplies: the “and” of any subset is the product of their probabilities', ['Each pair of events multiplies', 'The “and” of all n events multiplies', 'No two events share an outcome'], 'Independence of several events is a condition on every subset, not only pairs.'),
    ('independence-parallel-networks-example', 'Three independent parallel routers each work with probability 0.9. What is the probability that at least one works?', '0.999', ['0.729', '0.9', '0.27'], '1 − P(all fail) = 1 − 0.1³ = 0.999.'),
    ('independence-conditional-independence', 'E₁, E₂, E₃ are conditionally independent given F. What follows?', 'P(E₁, E₂, E₃ | F) = P(E₁ | F) P(E₂ | F) P(E₃ | F)', ['P(E₁, E₂, E₃) = P(E₁) P(E₂) P(E₃)', 'The events are mutually exclusive', 'F is independent of each Eᵢ'], 'Conditional independence does not imply independence once you stop conditioning on F.'),
    ('prob-and-and-with-dependent-events', 'For any events E and F, the chain rule gives P(E and F) =', 'P(E | F) × P(F)', ['P(E) × P(F)', 'P(E | F) + P(F)', 'P(E) / P(F)'], 'Rearrange the definition of conditional probability.'),
    ('prob-and-and-with-dependent-events', 'The chain rule for n events gives P(E₁ and … and Eₙ) =', 'P(E₁) P(E₂ | E₁) P(E₃ | E₁, E₂) ⋯ P(Eₙ | E₁, …, Eₙ₋₁)', ['P(E₁) P(E₂) ⋯ P(Eₙ)', 'P(E₁ | E₂) P(E₂ | E₃) ⋯', 'P(E₁) + P(E₂) + ⋯ + P(Eₙ)'], 'Each factor is conditioned on everything before it.'),
    ('independence-intro', 'Two events each have positive probability and are mutually exclusive. Are they independent?', 'No: learning that one occurred makes the other impossible', ['Yes: they share no outcomes', 'Yes, always', 'Only if their probabilities are equal'], 'If E occurs, P(F | E) = 0, which differs from P(F) > 0.'),
], 7: [
    ('demorgans-de-morgan-s-law-for-or', 'De Morgan’s law for “or” states that P(E₁ or ⋯ or Eₙ) =', '1 − P(E₁ᶜ and ⋯ and Eₙᶜ)', ['1 − P(E₁ᶜ or ⋯ or Eₙᶜ)', 'P(E₁ᶜ and ⋯ and Eₙᶜ)', 'P(E₁) × ⋯ × P(Eₙ)'], 'At least one event occurs exactly when not all of them fail to occur.'),
    ('demorgans-de-morgan-s-law-for-and', 'De Morgan’s law for “and” states that P(E₁ and ⋯ and Eₙ) =', '1 − P(E₁ᶜ or ⋯ or Eₙᶜ)', ['1 − P(E₁ᶜ and ⋯ and Eₙᶜ)', 'P(E₁ᶜ or ⋯ or Eₙᶜ)', 'P(E₁) + ⋯ + P(Eₙ)'], 'All events occur exactly when none of them fails.'),
    ('demorgans-intro', 'You need P(E or F) and E and F are independent. How does De Morgan’s law help?', 'It turns the “or” into an “and” of complements, which independence makes a product', ['It removes the need for complements', 'It makes the events mutually exclusive', 'It turns the “or” into a sum of the two probabilities'], 'P(E or F) = 1 − P(Eᶜ)P(Fᶜ) when E and F are independent.'),
    ('log-probabilities-intro', 'If P(E) = 0.00001, what is log P(E), with the natural log?', 'About −11.51', ['About −5', 'About 0.00001', 'About 11.51'], 'ln(0.00001) ≈ −11.51.'),
    ('log-probabilities-properties-of-logarithms', 'Which property of logarithms is correct?', 'log(xy) = log x + log y', ['log(xy) = log x × log y', 'log(x + y) = log x + log y', 'log(xy) = y log x'], 'The log of a product is the sum of the logs.'),
    ('log-probabilities-products-become-addition', 'What is log Πᵢ P(Eᵢ)?', 'Σᵢ log P(Eᵢ)', ['Πᵢ log P(Eᵢ)', 'log Σᵢ P(Eᵢ)', 'Σᵢ P(Eᵢ)'], 'Products of probabilities become sums of log probabilities.'),
    ('log-probabilities-logs-of-probabilities-are-negative', 'Since 0 ≤ P(E) ≤ 1, what range must log P(E) lie in?', '−∞ ≤ log P(E) ≤ 0', ['0 ≤ log P(E) ≤ 1', '−1 ≤ log P(E) ≤ 1', '0 ≤ log P(E) ≤ ∞'], 'log(1) = 0, and the log falls toward −∞ as the probability approaches 0.'),
    ('log-probabilities-representing-very-small-probabilities', 'Why do programs work with log probabilities?', 'Floating point cannot represent very small probabilities, but their logs are easy to store', ['Logs make probabilities positive', 'Logs make every probability equal', 'Floating point cannot store numbers above 1'], 'Python cannot represent a probability below 2.225e-308, yet its log, −307.652, is easy to store; the probability of a whole document is that small.'),
], 8: [
    ('many-flips-warmups', 'Ten flips, each heads with probability 0.6. What is P(all ten are heads)?', 'About 0.006', ['0.6', 'About 0.06', '0.1'], 'Independent flips multiply: 0.6¹⁰ ≈ 0.006.'),
    ('many-flips-warmups', 'Ten flips, each heads with probability 0.6. What is P(all ten are tails)?', 'About 0.0001', ['0.4', 'About 0.006', 'About 0.04'], '(1 − 0.6)¹⁰ = 0.4¹⁰ ≈ 0.0001.'),
    ('many-flips-warmups', 'What is the probability of k heads followed by n − k tails, in that order?', 'pᵏ (1 − p)ⁿ⁻ᵏ', ['(n choose k) pᵏ (1 − p)ⁿ⁻ᵏ', 'pᵏ + (1 − p)ⁿ⁻ᵏ', 'k p (1 − p)'], 'One specific ordering: multiply p for each head and 1 − p for each tail.'),
    ('many-flips-exactly-heads', 'How many orderings of 10 flips have exactly 4 heads?', '210', ['40', '1,024', '5,040'], '10! / (4! 6!) = (10 choose 4) = 210.'),
    ('many-flips-exactly-heads', 'What is the probability of exactly k heads in n flips?', '(n choose k) pᵏ (1 − p)ⁿ⁻ᵏ', ['pᵏ (1 − p)ⁿ⁻ᵏ', 'k / n', '(n choose k) pⁿ'], 'Add the probability pᵏ(1 − p)ⁿ⁻ᵏ of each of the (n choose k) mutually exclusive orderings.'),
    ('many-flips-exactly-heads', 'Ten flips, each heads with probability 0.6. What is P(exactly 4 heads)?', 'About 0.111', ['0.4', 'About 0.0053', 'About 0.251'], '210 × 0.6⁴ × 0.4⁶ ≈ 0.111.'),
    ('many-flips-more-than-heads', 'What is the probability of more than k heads in n flips?', 'Σᵢ₌ₖ₊₁ⁿ (n choose i) pⁱ (1 − p)ⁿ⁻ⁱ', ['1 − (n choose k) pᵏ (1 − p)ⁿ⁻ᵏ', '(n choose k+1) pᵏ⁺¹', 'Πᵢ₌ₖ₊₁ⁿ (n choose i) pⁱ'], 'Add the probabilities of exactly i heads for every i above k.'),
    ('many-flips-more-than-heads', 'Why can the probabilities of “exactly i heads” for different i be added?', 'The events are mutually exclusive: ten flips cannot have exactly 4 and exactly 5 heads', ['The flips are independent', 'Each event has the same probability', 'They are conditionally independent'], 'Addition of probabilities needs mutually exclusive events.'),
], 9: [
    ('counting-counting-with-steps', 'Two strings are each hashed into one of 100 buckets. How many ways can they be stored?', '10,000', ['200', '100', '4,950'], 'Step rule: 100 choices for the first string times 100 for the second.'),
    ('counting-counting-with-steps', 'Each point of a 19 × 19 Go board is empty, black or white. How many board configurations are there?', '3³⁶¹', ['361³', '3 × 361', '2³⁶¹'], 'Each of the 361 points is one step with 3 choices.'),
    ('counting-counting-with-steps', 'Each pixel can take one of about 17 million colours. Roughly how many distinct 12-pixel pictures are there?', 'About 10⁸⁶', ['About 2 × 10⁸', 'About 10¹²', 'About 10⁸⁰'], '(17 million)¹² ≈ 10⁸⁶ — more than the atoms in the observable universe.'),
    ('counting-counting-with-or-the-mutually-exclusive-case', '20 routes pass through Mt Kilimanjaro, 15 through Mombasa, and none through both. How many routes are there?', '35', ['300', '20', '5'], 'The sets are mutually exclusive, so the counts add: 20 + 15.'),
    ('counting-counting-with-or-the-general-case', 'For sets A and B that may overlap, |A or B| =', '|A| + |B| − |A and B|', ['|A| + |B|', '|A| × |B|', '|A| + |B| + |A and B|'], 'Inclusion–exclusion subtracts the outcomes counted in both sets.'),
    ('combinatorics-permutations-of-distinct-objects', 'How many orderings of the letters in “BAYES” are there?', '120', ['25', '60', '5'], 'Five distinct letters: 5! = 120.'),
    ('combinatorics-permutations-of-distinct-objects', 'A 4-digit passcode leaves 4 smudges over 4 distinct digits. How many passcodes are possible?', '24', ['256', '4', '16'], 'Each digit is used once, so the orderings are 4! = 24.'),
    ('combinatorics-permutations-of-indistinct-objects', 'How many distinct orderings of “MISSISSIPPI” are there?', '34,650', ['39,916,800', '1,663,200', '11'], '11! / (1! 4! 4! 2!) = 34,650.'),
    ('combinatorics-permutations-of-indistinct-objects', 'How many distinct bit strings use three 0’s and two 1’s?', '10', ['120', '12', '5'], '5! / (3! 2!) = 10.'),
    ('combinatorics-permutations-of-indistinct-objects', 'A 4-digit passcode leaves 3 smudges over 3 digits. How many passcodes are possible?', '36', ['24', '12', '81'], 'One digit repeats: 3 choices of which, times 4! / 2! = 12 orderings each.'),
    ('combinatorics-combinations-of-distinct-objects', 'How many ways are there to choose 2 villagers from a district of 8,000?', '31,996,000', ['63,992,000', '16,000', '8,000²'], '(8000 choose 2) = 8000 × 7999 / 2 = 31,996,000.'),
    ('combinatorics-combinations-of-distinct-objects', 'Choose 3 of 6 books, but not both the 8th and 9th edition of the same text. How many selections are there?', '16', ['20', '12', '4'], 'All selections minus the forbidden ones: (6 choose 3) − (4 choose 1) = 20 − 4.'),
    ('combinatorics-bucketing-with-distinct-objects', 'How many ways are there to hash 10 different strings into 5 buckets?', '5¹⁰', ['10⁵', '(10 choose 5)', '5 × 10'], 'Each string is one step with 5 buckets to choose from.'),
], 10: [
    ('bacteria-evolution', '10% of bacteria carry a mutation. Mutated bacteria survive antibiotics with probability 0.20, others with probability 0.01. What is P(survive)?', '0.029', ['0.21', '0.020', '0.10'], 'Law of total probability: 0.20 × 0.10 + 0.01 × 0.90 = 0.029.'),
    ('bacteria-evolution', 'In the same population, what is the probability that a surviving bacterium carries the mutation?', 'About 0.69', ['0.10', '0.20', 'About 0.029'], 'Bayes: 0.20 × 0.10 / 0.029 ≈ 0.69, up from 10% before the antibiotics.'),
    ('random-walks', 'A random walk steps right with probability p and left otherwise. What is P(back at 0 after 2 steps)?', '2p(1 − p)', ['p(1 − p)', 'p²', '(1 − p)²'], 'Two paths return to 0: (Left, Right) and (Right, Left).'),
    ('random-walks', 'A DNA letter starts at A and each mutation changes it to one of the other three letters with equal probability. What is P(A again after 2 mutations)?', '1/3', ['1/9', '1/4', '2/3'], '3 of the 9 equally likely two-step sequences return to A.'),
    ('monty-hall', 'In the Monty Hall game with 3 doors, what is the probability of winning by switching?', '2/3', ['1/2', '1/3', '1'], 'Staying wins only if the first pick was right (1/3); switching wins otherwise.'),
    ('server-example', 'n independent routers each work with probability p. Which expression gives P(a path exists)?', '1 − (1 − p)ⁿ', ['pⁿ', 'np', '(1 − p)ⁿ'], 'By De Morgan, a path fails only if every router fails.'),
    ('serendipity', 'You see 100 people from 17,000 students, 150 of them your friends. About how likely is it you see at least one friend?', 'About 0.59', ['About 0.009', 'About 0.15', 'About 0.99'], '1 − Π (17,000 − 150 − i) / (17,000 − i) over the 100 people seen ≈ 0.59.'),
    ('pr-rain-city', 'How does Google combine P(rain | district) into one probability of rain for the city?', 'Σᵢ P(R | Dᵢ) P(Dᵢ), the law of total probability', ['Σᵢ P(R | Dᵢ)', 'Πᵢ P(R | Dᵢ)', 'The largest P(R | Dᵢ)'], 'The districts are mutually exclusive and cover the city.'),
    ('binomial-diff-p', 'The UK competes in 5 independent Olympic events, winning a medal in each with probability 0.4, 0.6, 0.9, 0.2 and 0.1. What is P(exactly 3 medals)?', 'About 0.289', ['About 0.267', '0.216', '0.6'], 'Add the probability of each of the (5 choose 3) = 10 mutually exclusive ways to win exactly three events; each multiplies pᵢ for a win and 1 − pᵢ for a loss.'),
    ('binomial-diff-p', 'Why can’t the UK’s number of medals be modeled with the Many Coin Flips formula (n choose k) pᵏ (1 − p)ⁿ⁻ᵏ?', 'The probability of success differs from event to event', ['The events are not mutually exclusive', 'There are fewer than 10 events', 'A medal count cannot be zero'], 'The outcome rows are the same, but each row now has its own probability, so they must be added one by one.'),
    ('poker', 'In Texas Hold’em you see 7 cards, and 5 opponents each hold 2 unseen cards. How many ways are there to deal the remaining 45 cards into those 10 open slots?', '45 × 44 × ⋯ × 36 = 45! / 35!', ['10!', '45¹⁰', '(45 choose 10)'], 'Step rule: 45 choices for the first slot, 44 for the second, and so on down to 36 for the tenth.'),
    ('poker', 'How does a Monte Carlo simulation estimate the probability that your poker hand wins?', 'Deal the unknown cards at random many times and take the fraction of deals you win', ['Count the cards that beat your hand and divide by 52', 'Multiply the probabilities of each opponent losing', 'Evaluate one random deal of the remaining cards'], 'P(win) ≈ Count(times you win) / N trials; with N = 10,000 or more the estimate is very accurate.'),
    ('netflix-genres', 'Liking movies T₁, T₂, T₃ is conditionally independent given liking the genre G. What is P(likes T₁, T₂ and T₃ | G)?', 'p₁ p₂ p₃', ['p₁ + p₂ + p₃', '1 − (1 − p₁)(1 − p₂)(1 − p₃)', 'max(p₁, p₂, p₃)'], 'Conditionally independent events multiply within the universe where G holds.'),
]}

questions, reader = [], {u['id']: u['readerChapter'] for u in json.loads((Path(__file__).resolve().parents[3] / 'src/data/cs109-part-1-source.json').read_text())['units']}
for step, rows in Q.items():
    for i, (lesson, question, correct, wrong, explanation) in enumerate(rows, 1):
        assert lesson in reader, lesson
        options = list(wrong)
        options.insert(int(hashlib.sha256(f'{step}-{i}'.encode()).hexdigest(), 16) % 4, correct)  # a stable slot per question
        assert len(set(options)) == 4 and correct in options, question
        questions.append({'id': f'CS109-P1-{step:02d}-{i:02d}', 'step': step, 'group': STEPS[step - 1][1],
                          'question': question, 'options': options, 'correct_answer': correct, 'explanation': explanation,
                          'lesson': lesson, 'reader_chapter': reader[lesson]})
course = {'title': 'Core Probability', 'source': 'Probability for Computer Science (Stanford CS109 course reader, spring 2026), Part 1',
          'proposed_mode': 'multiple_choice', 'choice_count': 4,
          'steps': [{'number': n, 'title': t, 'question_count': sum(q['step'] == n for q in questions)} for n, t in STEPS],
          'questions': questions}
(Path(__file__).parent / 'questions.json').write_text(json.dumps(course, ensure_ascii=False, indent=2) + '\n')
print(f"Wrote {len(questions)} questions: " + ', '.join(f"{s['number']}·{s['question_count']}" for s in course['steps']))
