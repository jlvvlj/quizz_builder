@@ everyday-c2-basic-concepts-a
The outcome of Rotation 1 is the whole manifest — who showed, who did not, who checked a bag. X, the number of passengers who show, assigns one number to that entire record. Different manifests give the same X, which is the point: a random variable is a function of the outcome, and functions lose detail on purpose. Compensation C = 600X is then a second random variable built from the first, and it is discrete because X takes only the 191 values 0 through 190.

@@ everyday-c2-basic-concepts-b
The outcome of Priya's week is the full list of 50 trials and what each did. X, the number that converted, is a function of that list. Many different weeks produce X = 5, and for a revenue forecast that is all she needs. R = 180X is a function of X and therefore a random variable too, and both are discrete even though the underlying week contains timestamps that are not.

@@ everyday-c2-basic-concepts-c
The outcome of a match is the pair of goal counts. The goal difference D = home − away is a random variable on that outcome, and so is the indicator that pays \$1 when the home team wins. The market prices functions of the outcome, not the outcome itself, which is why one match supports dozens of contracts: each is a different function of the same underlying result.

@@ everyday-c2-basic-concepts-d
The outcome of a 40-email wave is which contacts replied and which did not. X, the number of replies, is a function of that. Lena also cares about M, the number of meetings, which is a function of the same outcome and not of X alone — two waves with four replies each can produce different meeting counts. Both are discrete, and neither is the outcome.

@@ everyday-c2-basic-concepts-e
The outcome for one cell is its whole history: when the promoter switched on, when each transcript appeared, when each decayed. X, the number of transcripts present at the moment of imaging, is one number extracted from all of that. It is discrete because transcripts come in whole copies, even though the history behind it runs in continuous time.

@@ everyday-c2-pmf-introduction-a
Three passengers are on the standby list and each independently clears with probability 0.6. Let X be how many clear. There are eight patterns of cleared and not, and grouping them by count gives the PMF: P(X=0) = 0.4³ = 0.064; P(X=1) = 3 × 0.6 × 0.4² = 0.288; P(X=2) = 3 × 0.6² × 0.4 = 0.432; P(X=3) = 0.6³ = 0.216. The factors of 3 are the number of patterns in each group, and the four masses sum to one. With two seats free, the chance someone is turned away is P(X=3) = 0.216.

@@ everyday-c2-pmf-introduction-b
Four trials arrive through referral, each converting independently with probability 0.22. Grouping the sixteen possible outcomes by how many convert gives P(X=0) = 0.78⁴ ≈ 0.370, P(X=1) = 4 × 0.22 × 0.78³ ≈ 0.418, P(X=2) = 6 × 0.22² × 0.78² ≈ 0.177, and the remaining mass at three and four. The coefficients 1, 4, 6, 4, 1 count the patterns, not the conversions — a distinction worth holding on to, because adding conversion counts instead of probabilities is the most common way this calculation goes wrong.

@@ everyday-c2-pmf-introduction-c
A three-way election has outcomes A, B and C, and the market prices them at \$0.50, \$0.30 and \$0.20. That list is a PMF: nonnegative masses summing to one. The probability that A or C wins is 0.50 + 0.20 = 0.70, obtained by adding masses over the set of interest. Adding the candidates' vote shares instead would be meaningless, which is the same trap in different clothing.

@@ everyday-c2-pmf-introduction-d
Lena writes to three close contacts, each replying independently with probability 0.70. Grouping the eight reply patterns by count gives P(X=0) = 0.027, P(X=1) = 3 × 0.7 × 0.09 = 0.189, P(X=2) = 3 × 0.49 × 0.3 = 0.441, P(X=3) = 0.343. The chance of at least two replies is 0.441 + 0.343 = 0.784, found by summing masses over the values that satisfy the event.

@@ everyday-c2-pmf-introduction-e
A cell has two copies of a gene, each transcribing in a given window with probability 0.25, independently. Let X be the number of active alleles. Grouping the four states gives P(X=0) = 0.5625, P(X=1) = 2 × 0.25 × 0.75 = 0.375, P(X=2) = 0.0625. The factor of 2 counts which allele is the active one, and the three masses sum to one. The chance of any transcription at all is 0.4375, not 0.50.

@@ everyday-c2-bernoulli-a
Let X be 1 if a booked passenger shows and 0 if not, with P(X=1) = 0.95. That single indicator carries everything the overbooking model knows about one traveller. Its usefulness is that indicators add: the number who show across 190 passengers is a sum of 190 such variables, which is how a two-valued model becomes a statement about a full aircraft.

@@ everyday-c2-bernoulli-b
For one trial, X = 1 on conversion and 0 otherwise, with p depending on channel — 0.04, 0.09 or 0.22. A single account is either a customer or not, and nothing in between, so every weekly number Priya reports is a sum of these indicators. The Bernoulli is the atom of the funnel, not a simplification of it.

@@ everyday-c2-bernoulli-c
A prediction-market contract pays \$1 if the event happens and \$0 if it does not: it is a Bernoulli random variable you can buy. Its expectation is p, so a fair price is p dollars, and the quoted \$0.62 is the market's estimate of p. Nowhere else does the Bernoulli appear so literally — the instrument and the concept are the same object.

@@ everyday-c2-bernoulli-d
For a single weak-tie contact, X = 1 if they reply and 0 otherwise, with p = 0.08. The indicator says nothing about when the reply comes or how warm it is; it is the coarsest useful description of one attempt. Lena's campaign is 140 of these with three different values of p, which is why she reasons in tiers rather than in people.

@@ everyday-c2-bernoulli-e
At a given instant the promoter is either engaged or not: X = 1 with probability 0.25. This is not an approximation of a graded state — the promoter genuinely occupies one configuration or the other, and the graded expression seen in a population is the average of many such indicators. The two-state description is the physically accurate one, and the smooth curve is what averaging does to it.

@@ everyday-c2-binomial-a
Each of 190 booked passengers shows independently with probability 0.95, so X is binomial with n = 190 and p = 0.95. Then

$$ P(X=k)=\binom{190}{k}(0.95)^{k}(0.05)^{190-k}.

The mean is 180.5 against 180 seats, so bumping is not a rare event but the ordinary case. The independence assumption is the fragile one: a rail strike correlates the absences, and the binomial then understates both tails.

@@ everyday-c2-binomial-b
Fifty trials each convert independently with probability 0.09, so the weekly count is binomial with mean 4.5 and standard deviation about 2.0. A week with seven conversions and a week with two are both unremarkable, roughly one standard deviation either side. Priya's dashboard shows this swing as a trend line, and the binomial says it is noise until the sample is much larger.

@@ everyday-c2-binomial-c
Hold twenty independent contracts each fairly priced at \$0.62. The number resolving YES is binomial with n = 20 and p = 0.62, mean 12.4. The chance of nine or fewer paying is about 12 percent — a losing week that arrives roughly one month in eight for a trader who is perfectly calibrated. Confusing that with a broken model is how good strategies get abandoned.

@@ everyday-c2-binomial-d
Twelve messages, each answered independently with probability 0.35, give a binomial count with mean 4.2. The chance of no reply at all is 0.65¹² ≈ 0.006, and the chance of one or fewer is about 4 percent. So a wave producing a single reply is unlucky rather than diagnostic, and rewriting the email on that evidence is premature.

@@ everyday-c2-binomial-e
Image a hundred genetically identical cells under the same signal and count how many express. If each does so independently with probability p, the count is binomial, and its spread is the visible signature of single-cell variation. The arrow diagram predicts a single number; the binomial predicts a distribution with standard deviation √(100p(1−p)), which is what the microscope actually shows.

@@ everyday-c2-geometric-a
A standby passenger clears on any given departure with probability 0.22, independently. The number of departures until she boards is geometric: P(X=k) = (0.78)^(k−1)(0.22). Boarding on the third attempt has probability 0.78² × 0.22 ≈ 0.134. The count includes the successful departure, so the smallest value is one, not zero — and the mean, 1/0.22 ≈ 4.5 departures, is why standby on a thin route is a poor plan.

@@ everyday-c2-geometric-b
A rep closes any given qualified call with probability 0.12. The number of calls up to and including the first close is geometric with mean 1/0.12 ≈ 8.3. The chance of going twelve calls without a close is 0.88¹² ≈ 0.22 — better than one week in five for a rep doing nothing wrong. Sales managers who read a dry spell as a performance problem are misreading the geometric tail.

@@ everyday-c2-geometric-c
Backing independent outcomes each with probability 0.35 of resolving YES, the number of positions until the first winner is geometric with mean about 2.9. The chance of six straight losers is 0.65⁶ ≈ 0.075. Bankroll rules exist because that run happens often enough to matter, and the geometric is what turns "unlucky" into a number that can be planned around.

@@ everyday-c2-geometric-d
Suppose each follow-up to a familiar contact draws a reply with probability 0.35, independently. Then the number of messages until the first reply is geometric with mean about 2.9, and the chance of getting nothing after four is 0.65⁴ ≈ 0.18. The independence assumption is doing heavy lifting and is doubtful here: a fourth unanswered nudge is weaker evidence of bad luck than the model claims, because silence is informative.

@@ everyday-c2-geometric-e
A lineage acquires a particular mutation in any given division with probability 3 × 10⁻⁸. The number of divisions until it appears is geometric with mean 1/(3 × 10⁻⁸) ≈ 33 million. In a culture of 10⁹ cells that event is nonetheless commonplace, which is the whole difficulty with antibiotic resistance: a per-division probability that is negligible becomes a near-certainty once the population is large.

@@ everyday-c2-poisson-a
Passengers arrive at check-in at about 2 per minute, so the count in a minute is Poisson with λ = 2. The chance of five or more in one minute is about 0.053, which is how the desk plan is sized. The Poisson is the right model when arrivals are many, independent, and individually unlikely at any instant — true for a concourse, false the moment a delayed inbound releases 180 people at once.

@@ everyday-c2-poisson-b
Tally sees about 12 signups a day, and the daily count is Poisson with λ = 12, standard deviation √12 ≈ 3.5. So a day with 8 and a day with 16 are both within one standard deviation, and the week-to-week wobble on the chart is mostly this. A product change is detectable only when it moves the mean by more than the noise, which for λ = 12 means several days of data.

@@ everyday-c2-poisson-c
Goals arrive roughly as a Poisson process, with home teams averaging about 1.6 per match and away teams 1.1. So the chance the home side fails to score is e^(−1.6) ≈ 0.202. This is one of the few places the Poisson is empirically defended rather than assumed: the fit to a century of results is good, and the deviations that remain — low-scoring draws are a little too common — are themselves a known correction.

@@ everyday-c2-poisson-d
Lena receives about 1.5 unsolicited introduction requests a week, so the weekly count is Poisson with λ = 1.5. The chance of a week with none is e^(−1.5) ≈ 0.223, and the chance of four or more is about 0.066. A quiet fortnight is unremarkable; two busy weeks in a row is worth noticing.

@@ everyday-c2-poisson-e
Under constitutive expression, transcript counts across cells follow a Poisson distribution, and this is measured rather than assumed. That fact is a strong claim about the mechanism: it holds when initiation events are independent and rare. Bursty genes break it — their counts are overdispersed, with variance well above the mean — and the departure from Poisson is precisely how bursting was discovered.

@@ everyday-c2-functions-of-random-variables-a
If X passengers are bumped, compensation is C = 600X, and the PMF of C is the PMF of X with relabelled values — a linear function shifts the labels and leaves the masses alone. Fuel cost is different: it rises with total load, but the rate changes at the point where a heavier aircraft needs a longer runway, so two values of X can map to the same cost. When g is not one-to-one, masses merge, and the PMF of the output has to be built by adding them.

@@ everyday-c2-functions-of-random-variables-b
Revenue R = 180X relabels the values of X without touching its probabilities. Commission is not linear: it pays nothing below eight conversions and accelerates above twelve, so several values of X map to zero commission and their masses combine into a single large mass at zero. That spike is invisible if you reason about the mean alone, and it is exactly what makes quota schemes distort behaviour near the threshold.

@@ everyday-c2-functions-of-random-variables-c
A contract bought at \$0.62 pays +\$0.38 if the event happens and −\$0.62 if not, so the payoff is a function of a Bernoulli variable taking two values. Across a book of twenty positions the payoff is a function of the count, and it is linear — which is why a trader's profit distribution has the same shape as the count distribution, merely rescaled and shifted.

@@ everyday-c2-functions-of-random-variables-d
If X replies arrive and each converts to a meeting with probability 0.68, the meeting count is not a deterministic function of X — it is random given X. But total time spent is: each reply costs about forty minutes of follow-up, so T = 40X exactly, and its PMF is X's with new labels. Distinguishing the two cases is the whole content of this section.

@@ everyday-c2-functions-of-random-variables-e
If each transcript yields about 40 protein copies, then protein count is 40X, a linear function whose PMF is X's relabelled. The fate decision is not linear: the cell differentiates only above 8,000 copies, so every X below 200 maps to the same outcome. That threshold collapses a wide distribution of transcript counts into two fates, and it is why single-cell variation produces discrete, visibly different cells rather than a smear.

@@ everyday-c2-expectation-mean-variance-a
With 190 booked at p = 0.95, the expected number who show is 190 × 0.95 = 180.5. Selling ten extra seats earns roughly ten fares; the expected compensation cost is 600 × E[bumped], and E[bumped] is the expected excess over 180, which is a little under one passenger. The trade is profitable in expectation and the variance is what makes it uncomfortable — standard deviation √(190 × 0.95 × 0.05) ≈ 3.0 means days when five are bumped are entirely ordinary.

@@ everyday-c2-expectation-mean-variance-b
Expected revenue per trial is the conversion probability times ARPU: 0.09 × \$180 = \$16.20 a month, against a \$1,400 acquisition cost. The mean says the channel pays back in about seven months. The variance says a quarter built on twenty trials can miss badly, and it is the variance that decides whether Priya can plan on the average at all.

@@ everyday-c2-expectation-mean-variance-c
A contract bought at \$0.62 when the true probability is 0.68 has expected profit 0.68 × 0.38 − 0.32 × 0.62 = \$0.0600 per dollar staked. That edge is small and the variance is large: the payoff is either +0.38 or −0.62, a standard deviation of about \$0.47. Expectation says the bet is good; variance says it takes hundreds of such bets before the goodness is visible, and both halves are needed to size a position.

@@ everyday-c2-expectation-mean-variance-d
Twelve emails to familiar contacts yield on average 12 × 0.35 = 4.2 replies, and at 0.55 × 0.68 per reply that is about 1.6 meetings. Lena needs perhaps fifteen meetings to close the round, so roughly nine waves. The variance matters more than usual here because she runs few waves: with so few repetitions, the average is a poor guide to any single outcome.

@@ everyday-c2-expectation-mean-variance-e
For a Poisson transcript count, mean and variance are equal, so their ratio — the Fano factor — is one. Biologists quote that ratio precisely because departures from it are informative: a Fano factor above one signals bursting, below one signals some regulatory feedback damping the noise. Here variance is not a nuisance around the mean; it is the measurement that identifies the mechanism.

@@ everyday-c2-joint-pmf-introduction-a
Let X be the passengers connecting to flight P and Y those connecting to flight Q, both drawn from the same arriving load. They are dependent: a seat filled by a P-connector is not available to a Q-connector. The joint PMF gives P(X=x, Y=y) for each pair, and summing a row or column recovers the marginal for one flight alone. The marginals cannot be recombined into the joint — knowing each flight's connector distribution separately does not tell you how often both are heavy at once, which is the question the ramp actually asks.

@@ everyday-c2-joint-pmf-introduction-b
Let X be deals closed this quarter and Y the average contract value. They are dependent, because a quarter that closes many deals usually closed smaller ones — discounting scales with volume. The joint PMF holds that relationship; the two marginals do not. Forecasting revenue as E[X] times E[Y] ignores it and, when the dependence is negative, overstates the number.

@@ everyday-c2-joint-pmf-introduction-c
The pair (home goals, away goals) is the joint PMF from which every match market is read. Modelled as independent Poissons with λ = 1.6 and 1.1, P(2,1) = e^(−1.6)(1.6²/2) × e^(−1.1)(1.1) ≈ 0.0863. Summing the cells where home exceeds away prices the home win; summing along diagonals prices the draw; summing where the total exceeds 2.5 prices the over. One table, a dozen tradeable contracts.

@@ everyday-c2-joint-pmf-introduction-d
Let X be opens and Y replies across a wave of twelve. They are strongly dependent — a reply nearly always follows a read — but not deterministically, because the tracker misses reads and invents others. The joint PMF holds both facts at once, and the marginal for Y alone is what Lena would get from counting replies while ignoring her tracker entirely.

@@ everyday-c2-joint-pmf-introduction-e
Let X be transcript count and Y protein count in one cell. They are dependent, since protein is translated from transcripts, but the dependence is loose: translation and degradation add their own randomness, so a cell with twelve transcripts has a distribution of protein levels, not a fixed one. The joint PMF over the pair is what a two-channel single-cell measurement estimates, and its shape is what separates transcriptional from translational noise.

@@ everyday-c2-functions-of-multiple-random-variables-a
The ramp cares about X + Y, the total connecting passengers, and separately about max(X, Y), which sizes the single busiest transfer. Both are random variables built from the same joint PMF, and each is obtained by summing joint probabilities over the cells where the function takes a given value. Neither can be computed from the marginals alone when X and Y are dependent.

@@ everyday-c2-functions-of-multiple-random-variables-b
Revenue is X times Y — deals closed times average value — a function of two dependent variables. Its PMF comes from summing the joint probabilities over every pair whose product hits a given figure. Because the dependence is negative, the spread of the product is narrower than treating the two as independent would suggest, which is one of the few places dependence works in a forecaster's favour.

@@ everyday-c2-functions-of-multiple-random-variables-c
From the pair (home, away) come two of the most traded functions: the difference, which settles the match result, and the sum, which settles over/under. Both are computed by summing the joint PMF over the appropriate diagonals of the table. The same joint distribution supports both, and a trader who prices them from separate models will eventually quote a pair that cannot both be right.

@@ everyday-c2-functions-of-multiple-random-variables-d
If Lena runs two waves producing X and Y replies, total meetings depend on X + Y, and her calendar constraint depends on max over the weeks. Both are functions of the pair. Waves in consecutive weeks are not independent — a contact who ignored the first is in the second — so the joint PMF, not the marginals, is what the calculation needs.

@@ everyday-c2-functions-of-multiple-random-variables-e
Total transcript output is the sum over the two alleles. If they are independent, the PMF of the sum is a convolution of the two; if they share a regulator, it is not, and the sum has a wider spread than independence predicts. Measuring the spread of the total against the spread of each allele separately is how the shared component is quantified.

@@ everyday-c2-more-than-two-random-variables-a
Write Xᵢ = 1 if passenger i shows. The total is X₁ + ⋯ + X₁₉₀, and expectation passes straight through a sum whether or not the terms are independent: E[total] = 190 × 0.95 = 180.5. That linearity is what makes the overbooking mean trivial to compute even on a morning when a rail strike has made the indicators strongly dependent. Variance is where dependence bites; the mean never notices.

@@ everyday-c2-more-than-two-random-variables-b
Each deal in the pipeline is an indicator that closes with its own probability. The forecast is the sum of those probabilities, regardless of whether deals are independent — the same linearity, and the reason stage-weighted forecasting gets the mean roughly right even though its independence assumption is wrong. What it gets wrong is the confidence interval.

@@ everyday-c2-more-than-two-random-variables-c
Total profit is the sum of per-contract payoffs, and its expectation is the sum of the individual edges whatever the correlations between markets. Correlation changes the risk entirely and the expected profit not at all. Traders who check only the expectation of a book learn this the expensive way.

@@ everyday-c2-more-than-two-random-variables-d
Lena's total replies is a sum of 140 indicators with three different values of p, so the expected total is 20 × 0.70 + 50 × 0.35 + 70 × 0.08 = 37.1. Linearity holds even though contacts at the same firm are dependent. It is the spread around 37 that the dependence inflates.

@@ everyday-c2-more-than-two-random-variables-e
The number of cells in a colony that differentiate is a sum of per-cell indicators. Expectation adds across them regardless of whether neighbouring cells influence one another, so the mean fraction is easy. The variance is not, and contact-mediated signalling shows up there — a colony whose cells talk produces patches rather than a random scatter, at the same mean.

@@ everyday-c2-conditioning-introduction-a
Before boarding, X — the number of passengers who show — has its full binomial distribution. Once the gate reports 172 checked in with ten minutes to go, that distribution is replaced by a conditional one supported on much narrower values. Nothing about the passengers changed; the set of outcomes still consistent with what is known has shrunk, and the PMF is recomputed inside it.

@@ everyday-c2-conditioning-introduction-b
At the start of the quarter the conversion count has its full distribution. Six weeks in, with three closed and eleven still live, Marcus is looking at a conditional PMF — the same model restricted to outcomes consistent with what has happened. The commit he made in week one and the number he should quote now are both correct, conditioned on different information.

@@ everyday-c2-conditioning-introduction-c
The pre-match distribution of total goals conditions on nothing. At half-time with the score 1–0 it is replaced by a distribution over what the remaining forty-five minutes will add. In-play markets are precisely this conditioning done continuously, and the price path is the sequence of conditional distributions.

@@ everyday-c2-conditioning-introduction-d
Lena's prior on total replies across all three waves is the full distribution. Once wave one returns six replies from twelve messages, the conditional distribution for the remaining waves shifts up — and shifts her estimate of her own reply rate at the same time. The second effect is the one a fixed-parameter model misses.

@@ everyday-c2-conditioning-introduction-e
Across all cells, transcript count has one distribution. Restricted to cells where the promoter was observed to engage at least once in the window, the distribution is different and shifted upward. The conditional PMF is what a live-imaging experiment reports, and comparing it with the unconditional one is how the ON-state output rate is estimated.

@@ everyday-c2-conditioning-on-an-event-a
Condition on the event that the inbound aircraft is more than twenty minutes late. Within that event, the PMF of missed connections shifts markedly: what was a distribution concentrated near zero now has real mass at four and above. The conditional PMF is a proper PMF — its masses are the originals restricted to the event and divided by the event's probability, so they sum to one again.

@@ everyday-c2-conditioning-on-an-event-b
Condition on the event that a trial invited at least two teammates in week one. Within that subset, the conversion count has a different and higher-centred PMF. Dividing by the probability of the conditioning event is what renormalises it, and skipping that division is the arithmetic slip that makes conditional rates look smaller than they are.

@@ everyday-c2-conditioning-on-an-event-c
Condition the total-goals PMF on a sending-off in the first forty-five minutes. The masses redistribute — fewer goals from the reduced side, more from the other — and the renormalised distribution is what the in-play over/under is repriced against. The conditioning event has probability around 0.04, and everything inside it is rescaled by that.

@@ everyday-c2-conditioning-on-an-event-d
Restricted to contacts whose message registered an open, the PMF of replies per wave is higher-centred. But the conditioning event is itself unreliable here, since pre-fetching fires opens for people who never read. Conditioning on a noisy event gives a conditional PMF that is correct given the event as defined, and the event as defined is not the event Lena cares about.

@@ everyday-c2-conditioning-on-an-event-e
Condition the transcript-count PMF on the cell having at least one transcript. This removes the mass at zero and rescales the rest by 1/(1 − e^(−λ)), which for λ = 1.2 means dividing by about 0.699. Any assay that can only see cells it detects reports this conditional distribution rather than the true one, and the zero-truncation is a systematic bias, not noise.

@@ everyday-c2-conditioning-on-another-variable-a
Let D be the inbound delay in ten-minute bands and M the missed connections. For each value of D there is a conditional PMF of M, and together they describe how delay translates into misconnects. E[M | D = d] rises with d, and the whole table is what the operations team uses to decide whether to hold the departing flight — a decision made per value of D, not on the average delay.

@@ everyday-c2-conditioning-on-another-variable-b
Let C be the channel and X the conversions from a fixed number of trials. Conditioning on C gives three different PMFs with means 4, 9 and 22 percent of the trials. The unconditional PMF is the channel-weighted mixture, and it has a larger spread than any of the three components — a fact that makes the blended number a poor description of any actual cohort.

@@ everyday-c2-conditioning-on-another-variable-c
If the two goal counts are modelled as independent, the conditional PMF of away goals given home goals is just the away marginal, and that independence is the model's central and most questioned assumption. Real matches show mild negative dependence at high scorelines, and correct-score markets are where the discrepancy shows up first.

@@ everyday-c2-conditioning-on-another-variable-d
Let T be the tier and X the replies from a wave of twelve. The conditional PMFs have means 8.4, 4.2 and 1.0 across close, familiar and weak. Lena plans wave by wave using these, not using the blended mean of 3.2, because no wave she actually sends is drawn from the mixture.

@@ everyday-c2-conditioning-on-another-variable-e
For each transcript count X, protein count Y has its own conditional PMF, roughly centred at 40X but with real spread from translation and degradation. The full picture is this family of conditional distributions, and E[Y | X = x] is the translation efficiency curve that a paired measurement sets out to estimate.

@@ everyday-c2-conditional-expectation-a
E[M | D] is a number for each delay band; treating D as random makes it a random variable. The total expectation theorem recovers the overall mean: E[M] = Σ P(D = d) E[M | D = d]. The season's average misconnect count is therefore a weighted average of the per-band figures, and improving the worst band matters in proportion to how often it occurs — which is what the weighting makes precise.

@@ everyday-c2-conditional-expectation-b
E[X | channel] takes values 0.04, 0.09 and 0.22 per trial. Weighting by the channel shares gives E[X] = 0.50 × 0.04 + 0.30 × 0.09 + 0.20 × 0.22 = 0.091 per trial. Priya already knew the blended rate from the dashboard; the total expectation theorem shows it is not an independent fact but a consequence of the three conditional rates and the traffic mix.

@@ everyday-c2-conditional-expectation-c
E[total goals | score at half-time] varies by state, and averaging over the half-time distribution returns the pre-match expectation. That consistency is not optional: a set of in-play prices that does not average back to the pre-match price is arbitrageable, and the total expectation theorem is the constraint being violated.

@@ everyday-c2-conditional-expectation-d
E[replies | tier] is 8.4, 4.2 and 1.0 per twelve-message wave. Weighting by how many waves Lena sends to each tier gives her overall expectation. The theorem also tells her where effort pays: shifting one wave from weak ties to familiar contacts moves the total by 3.2 expected replies, which is the calculation behind her sequencing.

@@ everyday-c2-conditional-expectation-e
E[X | promoter ON] is much larger than E[X | promoter OFF], and the observed population mean is the ON-fraction-weighted average of the two. With the promoter ON a quarter of the time, a population mean of 3 transcripts implies an ON-state rate near 12. This is how a bulk number is decomposed into a switching rate and an output rate — the total expectation theorem run backwards.

@@ everyday-c2-independence-introduction-a
X and Y, the indicators for two unrelated passengers showing up, are independent if the joint PMF factors: P(X=x, Y=y) = P(X=x)P(Y=y) for every pair. That is a stronger statement than the two being uncorrelated, and it is what lets the whole 190-passenger count be treated as binomial. It is also an assumption about the model, testable against the record and false on strike days.

@@ everyday-c2-independence-introduction-b
Conversion indicators for trials at unrelated companies factor, so the joint PMF is the product of the marginals. Two seats at the same company do not factor: one champion drives both. Priya's pipeline model assumes factorisation throughout, which is why a quarter dominated by one large account behaves nothing like the forecast.

@@ everyday-c2-independence-introduction-c
Goal counts in unrelated matches factor, so a parlay price is the product of the two contract prices. Two markets on the same match never factor, and the correct-score and over/under markets on one game are the clearest case: knowing one constrains the other sharply. Multiplying them is the standard way an accumulator is mispriced.

@@ everyday-c2-independence-introduction-d
Reply indicators for a former colleague and a university friend factor. For two partners at the same fund they do not, because the firm forms a view and both partners hold it. Lena's expected reply count is unaffected by this; the chance that she gets zero replies from a wave is substantially higher than the independent model says.

@@ everyday-c2-independence-introduction-e
Expression indicators for two distant cells factor to a good approximation. For two cells in contact they do not, since signalling couples them. The distinction matters for the variance of a colony-level count and not at all for its mean, which is the general shape of what independence buys and what it does not.

@@ everyday-c2-independence-from-an-event-a
X, the number who show, is independent of an event A when P(X=x | A) = P(X=x) for every x — the event teaches nothing about the variable. "The catering truck was late" is such an event. "There is a rail strike" is not: conditioning on it moves every mass in the distribution, which is precisely why it cannot be ignored in the dispatch decision.

@@ everyday-c2-independence-from-an-event-b
The number of conversions this week is independent of the event that the office fire alarm was tested on Tuesday: the conditional PMF equals the unconditional one. It is not independent of the event that a competitor announced a price cut. Independence from an event is a statement that the conditional PMF is unchanged, value by value — a stronger requirement than the means happening to match.

@@ everyday-c2-independence-from-an-event-c
A contract's payoff distribution is independent of an event when conditioning on that event leaves the price unchanged. Most news is of this kind, and a market that twitches at every headline is treating independent events as informative. Distinguishing the two is the job, and the test is whether the conditional distribution genuinely differs.

@@ everyday-c2-independence-from-an-event-d
Lena's reply count is not independent of the event that she sent during the first week of August — conditioning on it lowers every part of the distribution. Her open rate, oddly, is closer to independent of it, because pre-fetching happens whether or not anyone is at their desk. One statistic is sensitive to the event and the other is not, and that difference is itself diagnostic.

@@ everyday-c2-independence-from-an-event-e
Transcript count should be independent of which imaging session a cell was photographed in — if it is not, something about the session, temperature or focus, is affecting the measurement. Testing independence from a nuisance event is how batch effects are caught, and the test is exactly the condition that the conditional PMF equals the unconditional one.

@@ everyday-c2-independence-of-random-variables-a
Two passengers' show indicators are independent when the joint PMF factors into the product of the marginals for every pair of values. Under that assumption the variance of the total is the sum of the variances: 190 × 0.95 × 0.05 ≈ 9.0, giving a standard deviation of about 3.0. Drop independence and the mean is untouched while that standard deviation can double, which is the entire practical consequence.

@@ everyday-c2-independence-of-random-variables-b
Are deals closed and average contract value independent? If they were, the joint PMF would factor and revenue's variance would follow the simple rule. They are not — bigger quarters carry more discounting — so the factorisation fails and the product's distribution has to be computed from the joint PMF. Assuming independence here is comfortable and wrong in a direction that flatters the forecast.

@@ everyday-c2-independence-of-random-variables-c
A two-leg parlay is priced by multiplying, which asserts that the joint PMF of the two outcomes factors. For matches in different countries that is defensible. For two markets on one match it is plainly false, and the resulting price is wrong by the amount of the dependence. Independence of random variables is the assumption a parlay price is made of.

@@ everyday-c2-independence-of-random-variables-d
Replies from close contacts and replies from weak ties are plausibly independent, so the joint PMF factors and the variance of the total is the sum. That is what lets Lena treat her three tiers as separate experiments running in parallel. Within a tier, contacts who know each other break it, and the tiers were drawn to keep such clusters together for exactly that reason.

@@ everyday-c2-independence-of-random-variables-e
Two alleles transcribe independently when the joint PMF of their transcript counts factors. This is the null hypothesis the two-colour experiment tests, and it fails: the two counts are correlated because they share the cell's machinery. The size of the failure is the extrinsic noise, so here independence is not an assumption to be defended but a baseline whose violation is the measurement.

@@ everyday-c2-independence-of-several-variables-a
With 190 independent show indicators, the variance of the total is the sum of the individual variances — the property that makes the binomial variance np(1−p) ≈ 9.0. Across a season of flights, the average number who show has variance shrinking like 1/n, so Nadia's estimate of p gets sharper the longer she watches. That shrinking is the mechanism behind everything in Chapter 7.

@@ everyday-c2-independence-of-several-variables-b
The mean conversion rate over n independent weekly cohorts has variance equal to the single-week variance divided by n. Four weeks halves the standard deviation; sixteen quarters it. This is the arithmetic that says how long an A/B test must run, and it is why Priya cannot resolve a one-point difference on a single week of 50 trials.

@@ everyday-c2-independence-of-several-variables-c
Across twenty mutually independent positions, the variance of total profit is the sum of the per-position variances, so the standard deviation grows like √20 while the expected edge grows like 20. Edge accumulates faster than noise, which is the whole basis of the business — and it is also why the ratio only becomes comfortable after hundreds of positions, not twenty.

@@ everyday-c2-independence-of-several-variables-d
Lena's 140 attempts, treated as mutually independent, give a total reply count whose standard deviation is the root of the summed variances — about 5.0 around a mean of 37. That is a relative spread of roughly 13 percent, tolerable. Her twenty close contacts alone give a mean of 14 with a standard deviation near 2.0, and the fifteen-meeting target sits close enough to the edge that the spread decides the outcome.

@@ everyday-c2-independence-of-several-variables-e
Average an independent per-cell quantity over 10⁶ cells and the variance of the average is the single-cell variance divided by a million, so the standard deviation falls by a factor of a thousand. A quantity that varies wildly cell to cell reads as a clean, reproducible number in bulk. This is the whole answer to the question the scenario opened with, and Chapter 7 makes it a theorem.
