@@ probability-events-and-experiments | a | One departure, two ways to list it
Nadia's experiment is one departure of Rotation 1. She could describe its sample space S by the number of booked passengers who show, 0 through 190, or by which specific passengers show. Either is a legitimate S, because in both exactly one element occurs. What she cannot do is mix them: a list containing both "183 show" and "passenger Ives is absent" fails, because two of its elements can happen at once. The event "more people show than there are seats" is then a subset of S — in the first description, the show-counts 181 through 190.

@@ probability-events-and-experiments | b | Where a funnel stops being a sample space
Priya's experiment is one visitor arriving at Tally's site. Listing the visitor's fate as {bounced, started a trial, converted} looks complete until you notice that converting requires having started a trial, so two of the three can hold together. A proper sample space stops at the final state: S = {bounced, trialled and lapsed, trialled and paid}. "Started a trial" is then not an outcome but an event, the subset {trialled and lapsed, trialled and paid}.

@@ probability-events-and-experiments | c | The outcomes a market is written on
An election market is written on the experiment of one election. With three candidates, S = {A wins, B wins, C wins}, and every contract is an event, a subset of S: "A wins" is {A wins}, and "A or B wins" is {A wins, B wins}. The list works as a sample space only because exactly one candidate wins. "A coalition governs" cannot be added as a fourth outcome, because a coalition can govern whichever candidate wins; an exchange writes it as a separate market instead.

@@ probability-events-and-experiments | d | The four fates of one email
For a single message, Lena's sample space is S = {never opened, opened and ignored, replied no, replied yes}. Exactly one of these happens per message. "Opened" is not on the list because it is not an outcome; it is an event — the subset {opened and ignored, replied no, replied yes} — and events are subsets of S, not elements of it.

@@ probability-events-and-experiments | e | One cell, exactly one fate
Watch one progenitor cell for a day and it ends up differentiated, still a progenitor, or dead: S = {differentiated, progenitor, dead}. The three exclude one another and exhaust the possibilities. "Expressed the reporter at some point" is not a fourth outcome, and it is not an event of this S either, because no subset of these three fates records it. Asking about it needs a finer sample space, in which each outcome records both the cell's fate and whether the reporter fired.

@@ probability-definition-of-probability | a | Where a 0.95 show rate comes from
Nadia's 0.95 show rate is the definition of probability applied to her records: of every passenger booked on the route over the past two years, the fraction who showed. Tens of thousands of trials is a long way toward the limit in the definition, so the number is a good estimate — of a world like those two years. On the morning a rail strike keeps a third of the passengers off the airport train, the trials she counted stop describing the experiment she is running, and nothing in the count warns her.

@@ probability-definition-of-probability | b | A conversion rate is a count over a count
Tally's 9 percent organic conversion rate is count(converted) / n over the last two quarters' organic trials. Using it as next quarter's probability treats next quarter as more trials of the same experiment. A competitor's launch or a pricing change quietly makes it a different experiment, and the ratio carries on reporting the old one, which is the ordinary way a business forecast goes wrong.

@@ probability-definition-of-probability | c | A price is a belief
Nobody can run an election a million times, so a contract trading at \$0.62 is not a count(E) / n. It is the other meaning of probability: a measure of belief — here, the market's — updated as evidence arrives. The price is still a probability in the full sense, obeying the same rules, and when a trader says it is wrong, they mean that their own belief, built from different information, differs from it.

@@ probability-definition-of-probability | d | Reply rates from past campaigns
Lena's tier reply rates come from campaigns she ran before, when she was asking for advice rather than money: count(replied) / n within each tier. That is a probability from data. Applying it to a fundraise is a decision that the new asks are more trials of the same experiment, which is doubtful — close contacts may reply faster and commit less. Her first twenty replies are the new trials that will tell her.

@@ probability-definition-of-probability | e | Two readings of "probability 0.3"
Say "this cell expresses the gene with probability 0.3" and there are two readings. Across a large field of identical cells, 30 percent express it: count over n, the definition directly. For one particular cell, 0.3 measures what you do not know about its molecular state; with every molecule's position in hand, you might predict it outright. Single-cell biology lives in the gap between the two readings.

@@ probability-simulating-probability | a | Simulating a hundred thousand departures
Nadia does not need a formula for the chance that more than 180 of 190 booked passengers show. She can simulate: for each passenger draw a random number and count them as showing if it is below 0.95, total the shows, and repeat for 100,000 imagined departures. The fraction of runs with more than 180 shows is her estimate, and the definition of probability says it approaches the true value as the runs pile up. Simulation also makes it easy to change one assumption — families who all miss the flight together, say — that a formula makes hard.

@@ probability-simulating-probability | b | Ten thousand simulated weeks
Priya wants to know how often a week of 50 trials, each converting with probability 0.09, produces eight or more customers. She simulates 10,000 weeks: 50 random draws each, count the conversions, keep a tally of the weeks at eight or above. The fraction wobbles in its second decimal place from one run of the simulation to the next, a reminder that a simulated probability is always an estimate, however many weeks she simulates.

@@ probability-simulating-probability | c | Playing the tournament a million times
A bracket-pricing desk simulates the tournament: it plays each of the 63 games with its model's win probabilities, records the champion, and repeats a million times. The share of simulated tournaments each team wins is that team's price. Nobody could list the 2⁶³ possible brackets, and the simulation never needs to; it only needs to generate one outcome at a time.

@@ probability-simulating-probability | d | Rehearsing a wave before sending it
Lena can simulate a wave before sending it: for each of her twelve familiar contacts, draw a reply with probability 0.35, count the replies, and repeat the wave 5,000 times. The fraction of simulated waves with no replies at all tells her how surprised to be if the real one goes quiet. If she only simulates a hundred waves, she should trust the answer much less.

@@ probability-simulating-probability | e | Ten thousand virtual cells
Stochastic simulation is how single-cell biology works out probabilities it cannot solve by hand. A simulation plays one cell's reactions forward — a promoter switching on, a transcript made, a protein decaying — each step drawn at random with the right rates, and it records whether the cell ends up expressing. Run it for 10,000 virtual cells and the fraction expressing estimates the probability in exactly the sense of the definition: count(E) over n, with n as large as the computer allows.

@@ probability-probability-from-datasets | a | Two years of manifests
Nadia's dataset is two years of manifests on this route, one row per booked passenger, with a column for whether they showed. Treating each row as one trial, P(show) is the fraction of rows marked as shown. The estimate is only as good as the rows are like tomorrow's passengers: a year of rows from a different season, or from a route with more business travellers, estimates a different probability.

@@ probability-probability-from-datasets | b | One row per trial
Tally's database has one row per trial, with the channel it came from and whether it converted. P(converts) is the count of converted rows over all rows, and at 50 new rows a week it takes months to reach a number worth trusting. Counting only the referral rows gives the referral rate: a dataset answers a question about a subset by counting within it, which is where conditional probability, later in this part, begins.

@@ probability-probability-from-datasets | c | Checking prices against what happened
An exchange's record of settled contracts is a dataset for checking its own prices. Take every contract that traded near \$0.62 and count how many resolved YES; if prices are good probabilities, about 62 percent did. Here each "trial" is a whole contract rather than one repeat of a single event, and this is how a market's calibration is measured.

@@ probability-probability-from-datasets | d | Sixty rows are not three thousand
Lena's past campaigns form a dataset of 400 messages, each row a contact's tier and whether they replied. Her estimate of the close-contact reply rate is the number of close-contact replies over the number of close-contact messages. With only 60 such rows the estimate is rough — a handful of different replies would move it by several points — the same caution the elephant example raises about 3,070 births, at a much smaller n.

@@ probability-probability-from-datasets | e | A field of cells is a table
An imaging experiment is a dataset of cells: one row per segmented cell, with its fluorescence and a call of whether it expresses. The fraction of rows called expressing estimates P(expresses) for a cell of this type in these conditions. Pooling fields imaged on different days adds rows, but it also mixes experiments, and a pooled estimate can describe no single day's cells.

@@ equally-likely | a | The last seat, at random
The gate agent gives the one remaining seat to a passenger chosen at random from the standby list. With eleven people waiting, the sample space has eleven equally likely outcomes, so each named passenger's chance is 1/11, and if four of them are travelling for work, the chance the seat goes to one of those is |E| / |S| = 4/11. The equally likely rule turns the question into counting, which is why the Counting section later in this part exists.

@@ equally-likely | b | Picking an account for an interview
Priya picks one of the week's 50 trials at random for a customer interview. Each trial is equally likely, so if 10 came through referral, the chance of drawing a referral account is 10/50 = 0.2. The equally likely assumption is doing real work and it is worth stating: if she picks from the top of a list sorted by activity, it is false, and her interview is no longer representative.

@@ equally-likely | c | Every bracket equally likely, briefly
Suppose all 2⁶³ ways a 64-team bracket can finish were equally likely. Then any particular completed bracket has probability |E| / |S| = 1/2⁶³, about one in 9.2 × 10¹⁸, which is why nobody has ever filled one in perfectly. The assumption is plainly wrong — seeds differ in strength — so it is the dice problem's buggy solution again: a sample space whose outcomes are not equally likely. It still gives a baseline against which a real model's skill can be measured.

@@ equally-likely | d | One contact, drawn blindly
Lena picks one of her 140 contacts blindly. Each has probability 1/140, so the chance she draws a close contact is 20/140 ≈ 0.14. She will not choose this way, and the arithmetic shows why: a blind draw lands on a weak tie half the time, and weak ties reply only 8 percent of the time.

@@ equally-likely | e | One cell out of 240
Select one cell from the imaging field at random. With 240 cells equally likely, the probability of landing on an expressing cell is the count of expressing cells over 240. Here the equally likely assumption is unusually easy to defend, because the field of view was positioned without reference to which cells were bright.

@@ axioms-intro | a | Why the three axioms are not negotiable
Nadia assigns each of the 191 possible show-counts, 0 through 190, a probability. Axiom 1 says each lies between 0 and 1; axiom 2 says they sum to 1, because some show-count must happen; axiom 3 says the chance of a group of show-counts is the sum of theirs. Her model obeys all three because anything else gives a schedule she cannot act on: a probability above one means nothing for staffing, and a list summing to 0.9 means she has forgotten an outcome.

@@ axioms-intro | b | A blended rate that has to add up
Every trial is attributed to exactly one channel, so the channels split visitors into mutually exclusive groups, and axiom 3 lets the conversions through each channel be added: 0.50 × 0.04 + 0.30 × 0.09 + 0.20 × 0.22 = 0.091. If Priya's dashboard shows a different blended rate, either some trials sit in two channels or some sit in none. The axiom is the check that catches it, and it fails loudly rather than quietly.

@@ axioms-intro | c | Axiom 2 with a price attached
The YES contract trades at \$0.62 and the NO contract at \$0.40. Sell one of each: you collect \$1.02 today, and at resolution exactly one of them pays \$1.00, so you keep two cents whatever happens. The two prices had to sum to a dollar because YES and NO together make up the whole sample space, and a market that lets them drift apart hands money to whoever notices. Axiom 3 is enforced the same way: quote three candidates at 0.50, 0.30 and 0.25 and the same trade collects a nickel.

@@ axioms-intro | d | Three tiers that cover everyone once
Lena's 140 contacts split into 20 close, 50 familiar and 70 weak ties, groups that exclude one another and cover everyone. For a contact drawn at random, axiom 2 says the three chances sum to one — 20/140 + 50/140 + 70/140 = 1 — and axiom 3 lets her combine them: the chance of a close or familiar contact is 20/140 + 50/140 = 0.5. A spreadsheet whose tiers add to more than 140 has put someone in two of them.

@@ axioms-intro | e | Fractions over a cell's fates
Across a field of cells, the fractions differentiated, still progenitor and dead are each between 0 and 1 and sum to one, because every cell ends in exactly one of those states. If the three measured fractions come to 1.04, nature has not broken an axiom; a cell has been double-counted by the segmentation, and the arithmetic is what reveals it.

@@ axioms-provable-identities | a | A smaller event cannot be likelier
Every passenger who is bumped has lost the seat they booked, but a passenger can also lose it to a cancelled flight. So "bumped" is a subset of "lost the booked seat", and by identity 2 its probability can never be the larger of the two. A report showing a higher bump rate than lost-seat rate has an error in it, and Nadia can say so without knowing either number.

@@ axioms-provable-identities | b | At least one customer, through the complement
The chance that at least one of the week's 50 trials converts is awkward to compute directly: one conversion, two, all the way to fifty. Its complement is simple. If each trial converts at 9 percent, independently of the others, none converts with probability 0.91⁵⁰ ≈ 0.009, and identity 1 gives the answer as 1 − 0.009 ≈ 0.991. A week without a single customer is a genuine alarm, not bad luck.

@@ axioms-provable-identities | c | A narrower contract cannot be worth more
"A wins and turnout exceeds 60%" is a subset of "A wins", so by identity 2 its contract can never be worth more. If it ever trades higher, the mistake is not an opinion about politics but an arithmetic error, and it can be taken apart for a certain profit: sell the narrower contract, buy the broader one, and whatever happens you receive at least as much as you owe.

@@ axioms-provable-identities | d | Planning for silence
A familiar contact replies 35 percent of the time, so by identity 1 the chance of silence is 1 − 0.35 = 0.65. It is the complement Lena plans around: a follow-up is needed in almost two thirds of cases, not one third. Planning from the complement rather than the headline rate is the everyday use of identity 1.

@@ axioms-provable-identities | e | A subset that came out larger
Cells that expressed the reporter and then differentiated are a subset of the cells that expressed the reporter, so their fraction can never be larger. When an analysis reports 14 percent for the first and 12 percent for the second, identity 2 says the segmentation or the gating has gone wrong, before anyone looks at an image.

@@ prob-or-mutually-exclusive-events | a | On time, or very late
"The flight departs on time" and "the flight departs more than an hour late" are mutually exclusive: no departure is both. "The inbound aircraft is late" and "the flight departs late" are not; they happen together all the time. Treating them as exclusive is the mistake that makes delays look rarer on a dashboard than they are on the apron.

@@ prob-or-mutually-exclusive-events | b | Exclusive by bookkeeping
Tally's three channels are mutually exclusive by design: every trial is attributed to paid, organic or referral, never two. That is a choice in how the data is recorded, not a fact about customers — a visitor who clicked an ad after a friend's recommendation arguably arrived through both — and the attribution rule is what makes the channels exclusive.

@@ prob-or-mutually-exclusive-events | c | Contracts that can and cannot overlap
The candidate contracts in one election are mutually exclusive: exactly one candidate wins, so no outcome is in two of them. A contract on the winner and a contract on turnout above 60 percent are not; plenty of outcomes are in both. An exchange can only insist that prices sum to a dollar across contracts of the first kind.

@@ prob-or-mutually-exclusive-events | d | Opened and replied are not exclusive
For one message, "replied yes" and "never opened" are mutually exclusive. "Opened" and "replied" are not, and in Lena's data they are not even nested the way you would expect: a reply can arrive from someone the tracker never counted as opening, because blocked images leave a real read untraced.

@@ prob-or-mutually-exclusive-events | e | Two colours in one cell
Differentiated and dead are mutually exclusive fates for one cell at the end of the day. Expressing a green-tagged gene and expressing a red-tagged one are not: a cell can transcribe both, and the co-expressing cells are the overlap. Adding the two counts as though the colours were exclusive counts every co-expressing cell twice.

@@ prob-or-or-with-mutually-exclusive-events | a | A range of show-counts
A departure has exactly one show-count, so different show-counts are mutually exclusive. The chance that more people show than the 180 seats can hold is therefore the sum of the probabilities of every show-count from 181 to 190: one question about a range becomes ten probabilities added together.

@@ prob-or-or-with-mutually-exclusive-events | b | Converting through paid or referral
Of all visitors, 0.50 × 0.04 = 0.02 convert through paid ads and 0.20 × 0.22 = 0.044 through referral. No visitor is attributed to both, so the fraction converting through paid or referral is simply 0.02 + 0.044 = 0.064.

@@ prob-or-or-with-mutually-exclusive-events | c | Adding two candidates' prices
With three candidates quoted at \$0.50, \$0.30 and \$0.20, a contract on "A or B wins" is worth \$0.80, because the two outcomes are mutually exclusive and their probabilities add. If the combined contract trades at \$0.85, selling it and buying A and B separately locks in a nickel whoever wins: the rule is enforced by that trade.

@@ prob-or-or-with-mutually-exclusive-events | d | Close or familiar
Each of Lena's contacts sits in exactly one tier, so the chance a blindly chosen contact is close or familiar is 20/140 + 50/140 = 0.5. The addition is safe only because no contact is in two tiers; if a former colleague is also a close friend, she has to decide which tier they belong to before the arithmetic works.

@@ prob-or-or-with-mutually-exclusive-events | e | Leaving the progenitor pool
A cell ends the day in exactly one fate, so P(differentiated or dead) = P(differentiated) + P(dead). If 12 percent differentiate and 5 percent die, 17 percent leave the progenitor pool, and that is the number that decides whether the population grows.

@@ prob-or-or-with-non-mutually-exclusive-events | a | Overweight or oversized
If 8 percent of bags are overweight and 5 percent oversized, the fraction flagged at the desk is P(overweight or oversized) = 0.08 + 0.05 − P(overweight and oversized). It equals 13 percent only if no bag is both. Some bags are both — a heavy bag is often a big one — so the true figure is lower, and adding the two percentages overstates the problem.

@@ prob-or-or-with-non-mutually-exclusive-events | b | Two features, counted once
Thirty percent of trials opened the scheduling view and 25 percent invited a teammate. The fraction doing at least one is not 55 percent: accounts doing both are counted twice, so it is 0.30 + 0.25 − P(both). If 15 percent did both, it is 40 percent.

@@ prob-or-or-with-non-mutually-exclusive-events | c | The winner or the turnout
"A wins" trades at \$0.62, "turnout exceeds 60%" at \$0.40, and "A wins and turnout exceeds 60%" at \$0.30. A contract paying if either happens is worth 0.62 + 0.40 − 0.30 = \$0.72, not \$1.02: the outcomes where both happen would otherwise be paid for twice. Leaving out the subtraction on a portfolio of related positions is a common way to misprice it.

@@ prob-or-or-with-non-mutually-exclusive-events | d | At least one of two asks landing
Lena asks two separate contacts to reach the same investor, with success probabilities 0.35 and 0.25. The chance that at least one works is 0.35 + 0.25 − P(both). If the two act independently, as a later section makes precise, P(both) = 0.35 × 0.25 = 0.0875, giving about 0.51 — noticeably less than the naive 0.60, and the gap widens as she adds more parallel asks.

@@ prob-or-or-with-non-mutually-exclusive-events | e | Expressing either allele
If each allele transcribes with probability 0.25 in a given window, the fraction of cells with at least one active allele is not 0.50. Subtracting the both-active cases, 0.25 × 0.25 = 0.0625 if the alleles act independently, gives 0.4375. The difference between 0.50 and 0.4375 is exactly the double-counted population, and at higher rates it grows large enough to change what an experiment appears to show.

@@ cond-prob-intro | a | What the 06:40 report changes
Before the day starts, Nadia gives Rotation 1 an 85 percent chance of leaving on time. At 06:40 the inbound aircraft is reported 25 minutes late, and that number is no longer right — not because the original estimate was careless, but because the sample space has shrunk to the days consistent with a late inbound. On those days the flight leaves on time only 45 percent of the time. The new figure is a probability in exactly the same sense as the old one; it lives in the universe where the late inbound has already happened.

@@ cond-prob-intro | b | A trial that invited three teammates
Across all trials, 9 percent convert. Told that an account invited three teammates in its first week, Priya should not still say 9 percent: she has entered the universe of trials that did that, and that subset converts at a different rate. Conditioning does not change any account's behaviour; it changes which accounts she is averaging over.

@@ cond-prob-intro | c | The price after the debate
A contract sits at \$0.62 on the morning of a debate and \$0.71 the next day. Nothing about the election changed overnight except what is known, and the new price is the probability restricted to the outcomes consistent with the debate having gone as it did. Every price move is a conditioning step, which is why traders describe their work as updating rather than predicting.

@@ cond-prob-intro | d | Knowing the message was opened
A weak-tie contact replies 8 percent of the time. Once Lena knows the message was opened yesterday and not answered, the relevant universe is no longer all weak ties: it is the ones who read and did not respond, whose eventual reply rate is lower. The information moved her into a smaller sample space, and the number moves with it.

@@ cond-prob-intro | e | Given that the reporter is bright
Across a field, 12 percent of cells differentiate. Restricted to the cells whose reporter crossed the threshold, the fraction is much higher. The cells did not change; the question did. Conditioning is how a single-cell measurement becomes informative about fate, and it is the entire logic of a reporter assay.

@@ cond-prob-conditional-probability-example | a | Bags on staff tickets
Of 190 booked passengers, 8 are travelling on staff tickets and 3 of those check a bag, while 66 passengers in total check a bag. Then P(checks a bag | staff ticket) = P(bag and staff) / P(staff) = (3/190) / (8/190) = 3/8 = 0.375, above the overall 66/190 ≈ 0.347. As with the movies, the counts do the work: the number in both events over the number in the condition.

@@ cond-prob-conditional-probability-example | b | Conversion within a channel
Referral traffic is 20 percent of visitors, and 4.4 percent of all visitors both came by referral and converted. The definition gives P(converts | referral) = 0.044 / 0.20 = 0.22. The same division, run on Priya's table of trials, is the count of referral trials that converted over the count of referral trials — the Netflix calculation with channels in place of movies.

@@ cond-prob-conditional-probability-example | c | A conditional market is a ratio of two prices
If "wins Iowa and the nomination" trades at \$0.31 and "wins Iowa" at \$0.48, the conditional market — nomination given Iowa — should trade near 0.31 / 0.48 ≈ \$0.65. Here the definition of conditional probability is not being illustrated; it is being quoted as a price. When the three markets drift out of that relation, the discrepancy is a trade.

@@ cond-prob-conditional-probability-example | d | Replies among those who opened
Of Lena's 50 familiar contacts, 21 open a message and 14 of those reply. The reply rate among openers is P(reply | opened) = 14/21 ≈ 0.67, against an unconditional 14/50 = 0.28. Both numbers are correct and they answer different questions: the first tells her whether her message persuades, the second whether her subject line gets read.

@@ cond-prob-conditional-probability-example | e | Expression given an active promoter
A promoter is ON a quarter of the time, and a transcript appears in a given minute with probability 0.15 overall, always while the promoter is ON. Then P(transcript | ON) = P(transcript and ON) / P(ON) = 0.15 / 0.25 = 0.6. The conditional probability is what a two-state model of transcription is built from, because it describes the gene only in the state where it can be transcribed.

@@ cond-prob-the-conditional-paradigm | a | Every rule, on late-inbound days
Given that the inbound is late, the flight either leaves on time or it does not, so the complement rule holds inside that universe: P(not on time | late inbound) = 1 − 0.45 = 0.55. Nadia can use every rule she knows on late-inbound days, as long as every term in the calculation is conditioned on the same event.

@@ cond-prob-the-conditional-paradigm | b | Inclusion–exclusion within referral traffic
Among referral trials, 40 percent open the scheduling view, 35 percent invite a teammate and 20 percent do both. Inclusion–exclusion works inside the referral universe exactly as it does outside it: P(either | referral) = 0.40 + 0.35 − 0.20 = 0.55. It only fails when the three numbers come from different universes — one from referral trials, one from all trials.

@@ cond-prob-the-conditional-paradigm | c | Prices still sum to a dollar after the news
After a debate, traders condition on it. The candidate prices must still sum to a dollar — the second axiom, now written P(A wins | debate) + P(B wins | debate) + P(C wins | debate) = 1. If a market marks A up after the debate and leaves B and C where they were, the prices no longer sum to one and the update is only half done.

@@ cond-prob-the-conditional-paradigm | d | Fates of a message that was read
Given that a message was actually read, its possible fates narrow to three — ignored, replied no, replied yes — and their conditional probabilities sum to one. If 45 percent of read messages are ignored and 20 percent get a no, then 35 percent get a yes: the complement rule, applied inside the universe of read messages.

@@ cond-prob-the-conditional-paradigm | e | Fates of a cell in G2
Conditioned on a cell being in the G2 phase, its fates still exclude one another and sum to one. If G2 cells differentiate 30 percent of the time and die 5 percent of the time, 65 percent stay progenitors. Mixing a G2 rate and a whole-population rate in one sum is the error the paradigm rules out.

@@ law-total-intro | a | On time, with or without a late inbound
On 20 percent of days the inbound aircraft is late. When it is, Rotation 1 leaves on time 45 percent of the time; when it is not, 95 percent. The law of total probability puts the two cases together: P(on time) = 0.45 × 0.20 + 0.95 × 0.80 = 0.09 + 0.76 = 0.85, the 85 percent Nadia starts each day with.

@@ law-total-intro | b | Referral and everything else
Referral is 20 percent of traffic and converts at 22 percent; the other 80 percent converts at about 5.9 percent. Splitting visitors into referral and not referral, P(converts) = 0.22 × 0.20 + 0.059 × 0.80 ≈ 0.044 + 0.047 = 0.091, the blended rate on Priya's dashboard. The background event is a channel, and its complement covers everyone else.

@@ law-total-intro | c | How often a poll shows the candidate ahead
Before polling, the candidate's chance of really being ahead is 0.55. A poll of this size shows them ahead 80 percent of the time when they are, and 35 percent of the time when they are not. So the poll shows them ahead with probability 0.80 × 0.55 + 0.35 × 0.45 = 0.44 + 0.1575 = 0.5975. That number is the denominator of the update Bayes' theorem will make.

@@ law-total-intro | d | How often the tracker reports an open
Thirty percent of Lena's contacts genuinely read a given message. The tracker reports an open for 95 percent of genuine readers, but image pre-fetching also reports one for 30 percent of people who never looked. The chance an open is reported is 0.95 × 0.30 + 0.30 × 0.70 = 0.285 + 0.21 = 0.495 — close to half the list, most of it not what it seems.

@@ law-total-intro | e | How often a well is bright
Eight in a thousand members of a screening library are genuine hits. The reporter fires for 93 percent of true hits and for 3 percent of non-hits. The chance a well is bright is 0.93 × 0.008 + 0.03 × 0.992 = 0.00744 + 0.02976 = 0.0372, and four fifths of that comes from the non-hits.

@@ law-total-law-of-total-probability-many-background-events | a | Three causes of one warning light
A cockpit warning for a hydraulic fault comes from a genuine component failure, a wiring fault or a bad sensor, historically 20, 30 and 50 percent of such warnings. Given a failed component the ground test also fails 95 percent of the time; for wiring, 40 percent; for a bad sensor, 5 percent. The three causes partition the warnings, so P(test fails) = 0.95 × 0.20 + 0.40 × 0.30 + 0.05 × 0.50 = 0.19 + 0.12 + 0.025 = 0.335.

@@ law-total-law-of-total-probability-many-background-events | b | Three channels, one blended rate
Traffic splits 50 / 30 / 20 across paid, organic and referral, converting at 4, 9 and 22 percent. The channels are Priya's background events B₁, B₂, B₃, so P(converts) = 0.04 × 0.50 + 0.09 × 0.30 + 0.22 × 0.20 = 0.02 + 0.027 + 0.044 = 0.091. Each term is one channel's contribution, and referral, a fifth of the traffic, supplies nearly half of it.

@@ law-total-law-of-total-probability-many-background-events | c | Which nominee the party picks
A party's contract pays if it wins the general election, and it has not yet chosen between three nominees — Ruiz, Chen and Park — with nomination chances 0.50, 0.30 and 0.20. Against the opponent, each would win with probability 0.60, 0.45 and 0.30. Conditioning on the nominee, P(party wins) = 0.60 × 0.50 + 0.45 × 0.30 + 0.30 × 0.20 = 0.30 + 0.135 + 0.06 = 0.495.

@@ law-total-law-of-total-probability-many-background-events | d | Replies across three tiers
A contact drawn at random from Lena's list is close with probability 20/140, familiar 50/140 and a weak tie 70/140, and the three tiers reply at 0.70, 0.35 and 0.08. The chance a random contact replies is 0.70 × 20/140 + 0.35 × 50/140 + 0.08 × 70/140 = 0.100 + 0.125 + 0.040 = 0.265. The weak ties are half the list and supply less than a sixth of the replies.

@@ law-total-law-of-total-probability-many-background-events | e | Brightness across the cell cycle
Half of the cells in a field are in G1, 30 percent in S and 20 percent in G2, and a cell's reporter crosses the threshold with probability 0.10, 0.30 and 0.50 in those phases, because later phases carry more copies of the gene. The phases partition the cells, so P(bright) = 0.10 × 0.50 + 0.30 × 0.30 + 0.50 × 0.20 = 0.05 + 0.09 + 0.10 = 0.24.

@@ bayes-theorem-intro | a | Was the inbound late?
Nadia reviews a morning when Rotation 1 left on time and asks whether its inbound had been late. The unobserved event U is a late inbound, with prior 0.20; the evidence E is an on-time departure, which happens 45 percent of the time after a late inbound and 85 percent of the time overall. Bayes' theorem gives P(U | E) = 0.45 × 0.20 / 0.85 ≈ 0.11. An on-time departure makes a late inbound about half as likely as it was, but does not rule it out.

@@ bayes-theorem-intro | b | Which channel produced this customer
A customer has just converted. Given only that, how likely is it they came by referral? The unobserved event is the channel, with prior 0.20; the evidence is the conversion, with likelihood 0.22 given referral and probability 0.091 overall. So P(referral | converted) = 0.22 × 0.20 / 0.091 ≈ 0.48. Referral supplies a fifth of the traffic and nearly half the customers, which is the attribution argument every growth team has, settled by Bayes' theorem.

@@ bayes-theorem-intro | c | Updating on a poll
The candidate's prior chance of really being ahead is 0.55. The poll shows them ahead, which happens 80 percent of the time when they are and 59.75 percent of the time overall. The posterior is P(ahead | poll shows ahead) = 0.80 × 0.55 / 0.5975 ≈ 0.74. The move from 0.55 to 0.74 is the whole trade, and it is smaller than the poll's headline suggests because the poll is far from a perfect test.

@@ bayes-theorem-probability-of-disease-using-bayes-theorem | d | An open that may not be an open
The tracker is a noisy test for "the contact read the message". It reports an open for 95 percent of genuine readers and for 30 percent of people who never looked, and 30 percent of contacts genuinely read. Exactly as with the mammogram, P(read | open reported) = 0.95 × 0.30 / 0.495 ≈ 0.58. Nearly half of Lena's "opens" are noise, and a follow-up rule keyed to that signal is wrong four times in ten.

@@ bayes-theorem-probability-of-disease-using-bayes-theorem | e | A bright cell in a screening library
The reporter is a test for "this library member is a genuine hit". It fires for 93 percent of true hits and 3 percent of non-hits, and eight in a thousand members are hits. So P(hit | bright) = 0.93 × 0.008 / 0.0372 = 0.20. Four out of five primary hits are false, from an assay that is right 93 percent of the time on hits: the low base rate does the damage, exactly as a low disease rate does for the mammogram, and it is why a confirmation screen is not optional.

@@ bayes-theorem-natural-frequency-intuition | d | A thousand messages
Imagine Lena sends 1,000 messages. About 300 are genuinely read, and the tracker reports 285 of those as opened. Of the 700 never read, image pre-fetching reports 210 as opened. So 495 opens are reported, of which only 285 are real reads: 285 / 495 ≈ 0.58. Counting people rather than multiplying probabilities gives the same answer, and makes it obvious where the false opens come from.

@@ bayes-theorem-natural-frequency-intuition | e | A hundred thousand library members
Imagine a library of 100,000 members, of which 800 are genuine hits. The reporter lights up for 744 of those hits, and for 2,976 of the 99,200 non-hits. Of the 3,720 bright wells, only 744 are real: 744 / 3,720 = 0.20. In counts, the problem is plain: the non-hits are so numerous that even a small false-positive rate buries the true hits.

@@ bayes-theorem-bayes-with-the-general-law-of-total-probability | a | Which fault caused the warning
The hydraulic warning has three possible causes with priors 0.20, 0.30 and 0.50, and the ground test fails with probability 0.95, 0.40 and 0.05 under them, 0.335 overall. If it fails, P(component | test fails) = 0.95 × 0.20 / 0.335 ≈ 0.57, wiring ≈ 0.36, sensor ≈ 0.07. The failed component is the single most likely cause but still short of certain, which is why the manual calls for a second test rather than a part swap.

@@ bayes-theorem-bayes-with-the-general-law-of-total-probability | b | All three channels, given a conversion
With priors 0.50, 0.30 and 0.20 for paid, organic and referral, and conversion rates 0.04, 0.09 and 0.22, a new customer came from paid with probability 0.02 / 0.091 ≈ 0.22, organic 0.027 / 0.091 ≈ 0.30, and referral 0.044 / 0.091 ≈ 0.48. The three posteriors sum to one, and they reverse the order of the priors: paid is half the traffic and the least likely source of any given customer.

@@ bayes-theorem-bayes-with-the-general-law-of-total-probability | c | Who was the nominee, given the party won
If the party wins, which nominee did it most likely pick? The priors for Ruiz, Chen and Park are 0.50, 0.30 and 0.20 and the chances of winning with each 0.60, 0.45 and 0.30, so P(Ruiz was the nominee | party won) = 0.60 × 0.50 / 0.495 ≈ 0.61, Chen ≈ 0.27 and Park ≈ 0.12. A win shifts belief toward the stronger nominee, and a market that trades both contracts has to keep them consistent with this.

@@ bayes-theorem-bayes-with-the-general-law-of-total-probability | d | Who replied
A reply arrives from someone on Lena's list, and she has not yet looked at the name. With tiers of 20, 50 and 70 contacts replying at 0.70, 0.35 and 0.08, P(close | reply) = 0.70 × (20/140) / 0.265 ≈ 0.38, familiar ≈ 0.47 and weak ≈ 0.15. The familiar tier sends the most replies without having the best rate, because it is large and still replies often.

@@ bayes-theorem-bayes-with-the-general-law-of-total-probability | e | Which phase a bright cell is in
A cell's reporter is bright. With phase priors 0.50, 0.30 and 0.20 for G1, S and G2 and brightness rates 0.10, 0.30 and 0.50, P(G2 | bright) = 0.50 × 0.20 / 0.24 ≈ 0.42, S ≈ 0.38 and G1 ≈ 0.21. Brightness is evidence about the cell cycle, and ignoring it confounds any comparison between bright and dim cells.

@@ independence-intro | a | Two passengers who do not know each other
Whether seat 14C shows up tells Nadia nothing about seat 31A, so she treats the two as independent: P(31A shows | 14C shows) = P(31A shows) = 0.95. Independence is a statement about her model, not an observation about the passengers, and it is the assumption doing all the work in the overbooking calculation. It is also the assumption that fails on the morning of a rail strike, when one absence makes another more likely.

@@ independence-intro | b | Two accounts in different companies
Two trials at unrelated companies convert independently: learning that one converted leaves Priya's estimate for the other at 9 percent. Two trials at the same company do not, because a champion's enthusiasm moves both. Her forecast treats her pipeline as independent, which is defensible only because most of her deals are at different firms — and stops being defensible the quarter one customer accounts for a third of the number.

@@ independence-intro | c | Two matches on a Saturday
Goals in a match in Manchester and a match in Madrid are independent: knowing the first score does not move the price of the second. Two markets on the same match are not independent, and treating them as if they were is the most reliable way to lose money on an accumulator. The test is not whether the events feel unrelated but whether knowing one would change your probability for the other.

@@ independence-intro | d | Two contacts who have never met
If Lena asks a former colleague and a university friend, their replies are plausibly independent: one answering tells her nothing about the other. If she asks two people at the same fund, the replies are not independent — they may well discuss it. The convenience of independent events is exactly what tempts people to assume independence where it does not hold.

@@ independence-intro | e | Two cells in the same dish
Two cells respond to a signal independently in the sense that neither one's machinery touches the other's. They are nonetheless not independent in the probabilistic sense, because both sit in the same medium at the same temperature with the same batch of reagent: learning that one responded makes it more likely the dish was a good one. Mechanistic separateness and independence are different claims, and the Conditional Independence lesson below is built on the difference.

@@ independence-generalized-independence | a | Three checks that must all pass
Dispatch requires the load sheet to balance, the de-icing certificate to be valid and the crew to be within duty hours. Treating the three as independent, the chance all pass is the product of the three probabilities. Independence of three events needs more than each pair to multiply — the triple has to multiply too — and the case where the pairs pass without the triple is exactly where a safety argument can look sound and be wrong.

@@ independence-generalized-independence | b | Three stages, checked in pairs
Signup speed, activation speed and payment might each look independent of the others in pairs while the three together are not. Priya sees this when accounts that both signed up quickly and activated quickly convert far better than the pairwise figures predict. Pairwise checks are cheap, and they are not sufficient, which is the practical content of the full definition.

@@ independence-generalized-independence | c | Three legs of an accumulator
A three-leg parlay is priced by multiplying, which assumes the three legs are independent as a group, not merely that no two are obviously linked. Legs can be unrelated in pairs and dependent together — three matches under one weather front, say. The parlay price is then wrong in a direction that favours whoever sold it, and the error is invisible to a pairwise check.

@@ independence-generalized-independence | d | Three asks, one shared context
Lena approaches three contacts who each know her separately, and in pairs their replies look independent. If all three were at a conference where her project came up, they are not independent as a group, and the chance that all three reply is not the product of the three rates. The correction is to ask what common cause could touch all three, not whether any two are linked.

@@ independence-generalized-independence | e | Three genes in one regulon
Three genes under a shared regulator can look independent in expression when tested in pairs while being dependent as a group, because the regulator's level ties all three together. Testing correlations in pairs and concluding the network is absent is a real failure in expression analysis, and it is the same point the definition of independence for several events makes.

@@ independence-parallel-networks-example | a | Two hydraulic systems
The aircraft has two hydraulic systems and can be dispatched as long as one works — a parallel network of two. If each fails with probability 0.004, independently, both fail with probability 0.004 × 0.004 = 0.000016, and the redundancy buys four orders of magnitude. That figure rests entirely on independence; a single technician servicing both, or one power bus feeding both, makes the true number far larger.

@@ independence-parallel-networks-example | b | Two paths into an account
A deal can close through the economic buyer or through the technical champion, and Priya treats those as parallel paths: the deal is lost only if both fail. With failure probabilities 0.6 and 0.7, that is 0.6 × 0.7 = 0.42, against 0.6 for a deal with a single contact. Working several contacts in one deal is redundancy, and it fails for the same reason redundancy does: a budget freeze takes both paths at once.

@@ independence-parallel-networks-example | c | Settled by either of two sources
A contract settles if either of two designated sources reports the event. Treating the sources as independent routers makes settlement near certain; but if both wire services take the same feed, the redundancy is nominal. Resolution disputes almost always come from paths that were assumed independent and were not.

@@ independence-parallel-networks-example | d | Two routes to one investor
Lena can reach an investor through two different intermediaries, and each route works only if both people on it pass the message on. With per-link probabilities 0.7 and 0.6, each route works with probability 0.42, so at least one works with probability 1 − (1 − 0.42)² ≈ 0.66. People are the routers here: links in a row multiply, parallel routes combine through their complements, and a third route raises the chance far more than pressing harder on one. Two routes through the same firm are one route.

@@ independence-parallel-networks-example | e | Two alleles as a backup
A cell needs the protein and has two copies of the gene. If each fails to express in a given window with probability 0.75, independently, both fail with probability 0.5625, so one copy gives the protein with probability 0.25 and two give 0.4375 — the backup helps, but far less than doubling. And if both copies share a regulator that is itself off, their failures are perfectly correlated and the second copy adds nothing.

@@ independence-conditional-independence | a | Two generators, one bird
Two generators fail independently in ordinary service, so the chance both fail on a given flight is the product of two small numbers, and the aircraft is dispatched on that basis. A bird strike breaks the calculation: a single event can take both, so unconditionally the failures are dependent. They are conditionally independent given that no common-cause event occurs, and fault-tree analysis exists to list the events that have to be conditioned on.

@@ independence-conditional-independence | b | Two cancellations and one bad release
Two customers cancelling in the same week look independent, and across a year they behave that way. In the week after a release that broke calendar sync, they are not: both cancellations have the same cause. Conditional on which release shipped, the two are independent again, which is why churn is read by cohort and by release rather than as a single monthly number.

@@ independence-conditional-independence | c | Two states, one national error
Wisconsin and Michigan look like separate contests, and a forecast that treats them as independent produces confident, narrow intervals. They share a national polling error: conditional on that error, they are close to independent, and unconditionally they are strongly linked. A model that misses this reports a 98 percent chance and is wrong, and the failure is not in any single state's poll but in the independence assumption stitching them together.

@@ independence-conditional-independence | d | Two partners at the same fund
Two partners at one firm reply at rates that look independent until the firm decides it is not investing this quarter. Conditional on that decision, their replies are independent; unconditionally they move together. Lena's list looks more diversified than it is, and counting firms rather than people is the correction.

@@ independence-conditional-independence | e | Intrinsic and extrinsic noise
Put two differently coloured reporters on the same promoter in the same cell. Conditional on the cell's shared state — its ribosome count, its size, its point in the cycle — the two reporters fluctuate independently. Unconditionally they are correlated, because a cell rich in machinery makes more of both. Comparing how far the two colours diverge within a cell with how far cells diverge from one another separates the noise intrinsic to the gene from the noise the whole cell contributes; here conditional independence is not an illustration but the thing the experiment measures.

@@ prob-and-and-with-independent-events | a | Everyone shows
Each of 190 booked passengers shows with probability 0.95, independently of the others. The chance that all 190 show is 0.95¹⁹⁰ ≈ 0.00006. Each factor is close to one, and their product is still tiny, which is why a full flight almost never boards every booked passenger — and why airlines overbook.

@@ prob-and-and-with-independent-events | b | Three referral trials in a row
Three referral trials from unrelated companies each convert with probability 0.22. If they are independent, all three convert with probability 0.22 × 0.22 × 0.22 ≈ 0.011. A week in which three referral trials all convert is lucky, not a new baseline.

@@ prob-and-and-with-independent-events | c | Pricing a three-leg parlay
A parlay on three independent matches, with the chosen sides priced at 0.60, 0.55 and 0.70, wins only if all three do: 0.60 × 0.55 × 0.70 = 0.231. A fair payout on a \$1 stake is about \$4.33, and anything less is the bookmaker's margin.

@@ prob-and-and-with-independent-events | d | Needing two yeses
Lena needs both a close contact and a familiar one to agree, and the two have never met. If their answers are independent, both say yes with probability 0.70 × 0.35 = 0.245, about a third of the close contact's rate on its own. Every extra yes she needs multiplies in another factor below one.

@@ prob-and-and-with-independent-events | e | Two genes in the same minute
Two unlinked genes transcribe in a given minute with probabilities 0.2 and 0.3. If their promoters act independently, both transcribe in the same minute with probability 0.2 × 0.3 = 0.06. Observing co-transcription far more often than 6 percent of the time is how shared regulation is detected: the product is the benchmark that independence predicts.

@@ prob-and-and-with-dependent-events | a | Multiplying down the tree
A booked passenger shows with probability 0.95; given they show, they clear security in time with probability 0.97; given that, they board with probability 0.99. By the chain rule the chance of the whole path is 0.95 × 0.97 × 0.99 ≈ 0.912. Each factor is conditional on everything before it, which is why three numbers from three separate reports cannot be multiplied without checking they were measured that way.

@@ prob-and-and-with-dependent-events | b | The funnel is the chain rule
A visitor signs up with probability 0.06, activates given signup with probability 0.55, and pays given activation with probability 0.27. End to end that is 0.06 × 0.55 × 0.27 ≈ 0.0089. Every funnel chart is this product, and the common mistake is to measure each stage against all visitors rather than against the previous stage, which replaces conditional probabilities with unconditional ones and understates the result.

@@ prob-and-and-with-dependent-events | c | Chaining two markets
The chance a candidate wins Iowa is 0.48, and given Iowa the nomination is 0.65. The chain rule gives P(Iowa and nomination) = 0.48 × 0.65 ≈ 0.31, which should match the joint contract. The second factor must be conditional on the first, not its standalone probability; that is why correlated legs cannot be priced as a simple parlay.

@@ prob-and-and-with-dependent-events | d | Three stages, and very little at the end
A familiar contact opens with probability 0.42, replies given opening with probability 0.83, and offers an introduction given a reply with probability 0.55. That is 0.42 × 0.83 × 0.55 ≈ 0.19 per contact, so Lena needs roughly five familiar contacts per introduction. The chain rule makes the compounding visible where a per-stage dashboard hides it.

@@ prob-and-and-with-dependent-events | e | Four arrows multiplied
The signal is present with probability 0.7; the receptor binds given signal, 0.4; the factor is recruited given binding, 0.6; transcription follows given recruitment, 0.8. The chain rule gives 0.7 × 0.4 × 0.6 × 0.8 ≈ 0.13. A textbook arrow diagram draws this path as though it were certain; the chain rule prices it at about one cell in seven, which is roughly what single-cell measurements find.

@@ demorgans-de-morgan-s-law-for-or | a | Saying that nothing was flagged
"This bag was not flagged" means it was not overweight and not oversized: by De Morgan, the complement of (overweight or oversized) is (not overweight) and (not oversized). So P(flagged) = 1 − P(not overweight and not oversized), and the load controller can check two separate lists instead of building a combined one. Both procedures give the same answer, which is exactly what the law asserts.

@@ demorgans-de-morgan-s-law-for-or | b | A clean quarter
Marcus calls the quarter clean when no deal slipped and no deal closed at a discount. That is the complement of "a deal slipped or a deal was discounted", and De Morgan turns it into the "and" of two complements: every deal on time, and every deal at list price. The second form can be checked deal by deal, while the first requires knowing the union.

@@ demorgans-de-morgan-s-law-for-or | c | At least one goal
"At least one goal" is "the home team scores or the away team scores". By De Morgan its complement is "the home team does not score and the away team does not score", which is the form a bookmaker can price, because the two goal counts are modelled separately. With no-goal probabilities of 0.30 and 0.35, independent, P(at least one goal) = 1 − 0.30 × 0.35 = 0.895.

@@ demorgans-de-morgan-s-law-for-or | d | Complete silence
A contact has gone silent when the message was neither opened nor answered — the complement of (opened or replied), which De Morgan rewrites as (not opened) and (not replied). Lena's follow-up list is built from the second form because her tracker reports the two signals separately. The rewriting costs nothing and makes the list computable.

@@ demorgans-de-morgan-s-law-for-or | e | A silent cell
A cell is silent when neither allele is transcribing: the complement of (allele 1 or allele 2 active) is (allele 1 inactive) and (allele 2 inactive). With each allele inactive 75 percent of the time, independently, P(at least one active) = 1 − 0.75 × 0.75 = 0.4375. The imaging software evaluates the "and" form channel by channel, and checking that both descriptions pick out the same cells is a useful sanity test on a segmentation pipeline.

@@ demorgans-de-morgan-s-law-for-and | a | Stopping at the first failed check
"Every dispatch check passed" fails as soon as any single check fails: the complement of (balanced and de-iced and within duty hours) is (not balanced) or (not de-iced) or (out of hours). The dispatcher's checklist is written in the second form because it can stop at the first failure, while the first form can only be confirmed at the end.

@@ demorgans-de-morgan-s-law-for-and | b | Two warning signs in a deal
Marcus counts a deal as healthy only if the champion is engaged and the budget is approved. By De Morgan, a deal is at risk exactly when the champion has gone quiet or the budget is not approved, and his pipeline review is organised around those two warning signs rather than around the conjunction.

@@ demorgans-de-morgan-s-law-for-and | c | How a parlay loses
A two-leg parlay loses if either leg loses: the complement of (leg 1 wins and leg 2 wins) is (leg 1 loses or leg 2 loses). With independent legs at 0.60 and 0.55, the parlay wins with probability 0.33 and loses with probability 0.67, and inclusion–exclusion on the other side agrees: 0.40 + 0.45 − 0.40 × 0.45 = 0.67.

@@ demorgans-de-morgan-s-law-for-and | d | Two points of failure
An introduction happens only if the contact replies and the investor accepts. It fails if the contact never replies or the investor declines. De Morgan turns one fragile success into two failure routes, and Lena can work on each separately: a better message for the first, a better fit for the second.

@@ demorgans-de-morgan-s-law-for-and | e | Transcribed and translated
A cell makes the protein only if the gene is transcribed and the transcript is translated. Not making it means a block at transcription or a block at translation, or both. A knock-down screen reads which, and the two failure routes it distinguishes are the De Morgan decomposition of the one success.

@@ log-probabilities-representing-very-small-probabilities | a | Everyone shows, in logs
The chance that all 190 booked passengers show, each with probability 0.95, is 0.95¹⁹⁰ ≈ 0.0000585. Its log is 190 × log(0.95) ≈ −9.75: a product of 190 factors has become a sum of 190 equal terms, and the number stays readable. The probability of the exact pattern of shows across a whole season of departures would underflow a computer; its log would not.

@@ log-probabilities-representing-very-small-probabilities | b | One exact week
The probability of one exact week — a particular 4 of the 50 trials converting at 9 percent, and the other 46 not — is 0.09⁴ × 0.91⁴⁶ ≈ 8.6 × 10⁻⁷. In logs it is 4 log(0.09) + 46 log(0.91) ≈ −9.63 − 4.34 = −13.97. A forecasting model that compares whole years of such weeks can only work in logs.

@@ log-probabilities-representing-very-small-probabilities | c | Comparing brackets
If every game were a coin flip, a particular bracket would have probability 2⁻⁶³, with log −63 log 2 ≈ −43.7. A model that gives the favourite a 0.7 chance in every game puts its single most likely bracket at 0.7⁶³, with log 63 log(0.7) ≈ −22.5. In logs, "which of two unimaginably small numbers is bigger" becomes a comparison of −43.7 with −22.5.

@@ log-probabilities-representing-very-small-probabilities | d | A whole campaign as one number
The probability of one exact campaign outcome — who among Lena's 140 contacts replies and who does not — is a product of 140 factors, far too small to write down usefully. Its log is a sum of 140 terms, one per contact, so adding a contact adds one term instead of multiplying an already vanishing number by another.

@@ log-probabilities-representing-very-small-probabilities | e | Scoring a protein
A particular twenty-residue peptide, with each position equally likely to be any of twenty amino acids, has probability 20⁻²⁰ ≈ 9.5 × 10⁻²⁷, and log −20 log 20 ≈ −59.9. Sequence models score whole proteins by adding log probabilities position by position, because the probabilities themselves would underflow within a few dozen residues.

@@ many-flips-exactly-heads | a | Exactly k of 190 show
Each of 190 booked passengers is a coin flip that lands "shows" with probability 0.95. The chance that exactly k show is (190 choose k) × 0.95ᵏ × 0.05¹⁹⁰⁻ᵏ: the number of orderings of k shows and 190 − k no-shows, times the probability of any one of them. The single most likely count is 181, with probability about 0.13 — one more than the 180 seats.

@@ many-flips-exactly-heads | b | Exactly four customers
Fifty trials, each converting independently with probability 0.09, are fifty coin flips. The chance of exactly four conversions is (50 choose 4) × 0.09⁴ × 0.91⁴⁶ ≈ 0.20, and the chance of none is 0.91⁵⁰ ≈ 0.009. Priya's weekly number swings for no reason other than this, and reading a good week as evidence of a better product is the most common misuse of the formula.

@@ many-flips-exactly-heads | c | Twelve of twenty resolve yes
Hold twenty independent contracts each priced at \$0.62. The chance that exactly twelve resolve YES is (20 choose 12) × 0.62¹² × 0.38⁸ ≈ 0.18. Even the most likely single result has less than a one-in-five chance, which is why a well-calibrated trader should expect the count to miss any particular number most weeks.

@@ many-flips-exactly-heads | d | Twelve emails in a wave
Lena sends twelve messages to familiar contacts, each replying independently with probability 0.35. The chance of no replies is 0.65¹² ≈ 0.006, and of exactly one is 12 × 0.35 × 0.65¹¹ ≈ 0.04. A wave that produces one reply is not evidence that her message is wrong; the formula gives that outcome about 4 percent of the time, which is worth knowing before rewriting the email.

@@ many-flips-exactly-heads | e | A hundred cells, how many express
Image a hundred cells with the same construct and the same signal, each expressing independently with probability 0.3. The chance that exactly 30 express is (100 choose 30) × 0.3³⁰ × 0.7⁷⁰ ≈ 0.087. Genetically identical cells give a spread of counts, not a single number, and the width of that spread is the signature that a deterministic arrow diagram cannot produce.

@@ many-flips-more-than-heads | a | More than 180 show
Nadia's real question is not any single show-count but whether more than the 180 seats' worth show up. The show-counts 181 through 190 are mutually exclusive, so she adds their probabilities: the sum of (190 choose k) × 0.95ᵏ × 0.05¹⁹⁰⁻ᵏ for k from 181 to 190 comes to about 0.52. On this route, overbooking by ten seats means someone is bumped on roughly every other flight.

@@ many-flips-more-than-heads | b | A week of eight or more
The chance that eight or more of the week's 50 trials convert is the sum of the exactly-k probabilities for k from 8 to 50, or, more cheaply, one minus the sum for k from 0 to 7. It comes to about 0.08. One week in thirteen will look excellent for no reason at all.

@@ many-flips-more-than-heads | c | A bad week that means nothing
With twenty independent contracts priced at \$0.62, the chance that nine or fewer resolve YES is the sum of the exactly-k probabilities from 0 to 9, about 0.09. A perfectly calibrated trader has a week like that roughly once in eleven, and it says nothing about their skill.

@@ many-flips-more-than-heads | d | At least three replies
The chance that a wave of twelve familiar-contact messages brings at least three replies is one minus the chances of zero, one and two replies, about 0.85. Lena can plan her next step around three replies with reasonable confidence, and around five with much less.

@@ many-flips-more-than-heads | e | More than forty expressing
For a hundred cells each expressing with probability 0.3, more than 40 expressing has probability about 0.012, the sum of the exactly-k terms from 41 to 100. A field where 45 cells express is therefore surprising under the model, and it is a reason to ask whether the cells were really independent — cells in contact influence one another.

@@ counting-intro | a | Why equally likely outcomes send you counting
Once Nadia assumes every seating arrangement is equally likely, every probability becomes a ratio of two counts, and the only hard part is the counting. How many ways to seat 180 people, how many ways to split bags across three containers: these are not arithmetic exercises attached to the course, but the calculation the model demands.

@@ counting-intro | b | Counting the variants before testing them
Before Tally can test a pricing page it has to know how many versions exist: four feature tiers, three seat bands and two billing periods do not give nine options. Counting comes first because it sizes the problem, and a team that has not counted routinely commits to testing more variants than it has traffic to resolve.

@@ counting-intro | c | Numbers that explain why nobody wins
The reason no one has ever filled in a perfect 64-team bracket is a counting fact, not a sporting one, and the same is true of why a five-leg parlay pays what it pays. Counting is where a great deal of the intuition in this domain comes from, and the numbers are large enough to be genuinely surprising.

@@ counting-intro | d | How many routes exist at all
Before Lena asks whether a route to an investor will work, she needs to know how many routes there are. With 140 contacts, each with a network of their own, the number of two-step routes is large and the number that are actually usable is small. Counting the first tells her where to look; probability tells her which to use.

@@ counting-intro | e | Counting what a sequence could have been
A twenty-residue peptide drawn from twenty amino acids has 20²⁰ possible sequences, a number with twenty-seven digits. Counting is how biology establishes that something is not chance: a match that would need a search of that size to arise by accident is evidence of a mechanism, and the argument is entirely combinatorial.

@@ counting-counting-with-steps | a | Building a booking reference
A booking reference is six characters drawn from 34 symbols — the alphabet and the digits, less two letters that look like digits. That is 34⁶ = 1,544,804,416 references, which is why a six-character code is enough for an airline and a four-character one would not be. The step rule is doing the work: six steps, each with 34 choices, multiply.

@@ counting-counting-with-steps | b | Sizing a pricing test
Four feature tiers, three seat bands and two billing periods give 4 × 3 × 2 = 24 plan configurations, not 9. Test all of them against 50 trials a week and each configuration gets about two accounts, which will never resolve anything. Counting the configurations before designing the test is what stops Priya running an experiment that cannot conclude.

@@ counting-counting-with-steps | c | Counting a bracket
A 64-team tournament has 63 games, each with two possible winners, so there are 2⁶³ ≈ 9.2 × 10¹⁸ complete brackets. Each game is one step with two choices, and the step rule multiplies them.

@@ counting-counting-with-steps | d | Pairing templates with waves
Lena has three waves and four message templates, and she can pair any template with any wave: 3 × 4 = 12 combinations before she has written a word of new copy. The step rule also tells her what a fifth template costs: three more combinations to manage, not one.

@@ counting-counting-with-steps | e | Counting codons
A codon is three bases, each one of four, so there are 4 × 4 × 4 = 64 codons coding for 20 amino acids plus a stop signal. The step rule gives the 64 immediately, and comparing it with 21 is what forces the genetic code to be redundant.

@@ counting-counting-with-or-the-mutually-exclusive-case | a | References that start with a letter or a digit
A booking reference starts with a letter or with a digit, never both. With 24 letters and 10 digits among the 34 symbols, there are 24 × 34⁵ references of the first kind and 10 × 34⁵ of the second, and because the two sets share nothing, the total is their sum: 34 × 34⁵ = 34⁶, as the step rule said.

@@ counting-counting-with-or-the-mutually-exclusive-case | b | Monthly or annual
Tally offers 12 monthly plans (four tiers, three seat bands) and 12 annual plans. A plan is billed monthly or annually, never both, so there are 12 + 12 = 24 plans — the same 24 the step rule gives with billing period as a third step. The two rules count the same set two ways.

@@ counting-counting-with-or-the-mutually-exclusive-case | c | Tonight's single bets
Tonight's board lists 7 football markets and 5 basketball markets. A single bet is on one market from either list, and no market is on both, so there are 7 + 5 = 12 possible single bets.

@@ counting-counting-with-or-the-mutually-exclusive-case | d | Close or familiar, as a count
Lena can open with one of her 20 close contacts or one of her 50 familiar ones. No one is in both tiers, so she has 20 + 50 = 70 possible first asks from those two tiers. If a contact were somehow in both, adding would count them twice, and the general case would apply.

@@ counting-counting-with-or-the-mutually-exclusive-case | e | Sense codons and stop codons
Every codon either codes for an amino acid or is a stop codon: 61 of one and 3 of the other, with no codon in both, adding to the 64 the step rule counted.

@@ combinatorics-permutations-of-distinct-objects | a | Assigning crew to positions
Four crew work a rotation, in four distinct positions: purser and three cabin stations. Once the four people are chosen, they can be assigned to the positions in 4! = 24 ways. Choosing them from a pool of twelve and assigning them at the same time gives 12 × 11 × 10 × 9 = 11,880 rosters; order matters because the positions differ.

@@ combinatorics-permutations-of-distinct-objects | b | Ordering the onboarding steps
Priya has settled on five onboarding steps; shown in sequence, they can appear in 5! = 120 orders. If she also chooses which five of twelve candidate steps to show, there are 12 × 11 × 10 × 9 × 8 = 95,040 sequences. Order matters because the first screen carries most of the attention, so two orderings of the same five steps are genuinely different products.

@@ combinatorics-permutations-of-distinct-objects | c | How a league table finishes
Twenty teams can finish in 20! orders, about 2.4 × 10¹⁸. A market on the top four in exact order is counting ordered choices of four: 20 × 19 × 18 × 17 = 116,280 possibilities. The same four teams in a different order is a different contract, which is why these markets pay far more than "top four in any order".

@@ combinatorics-permutations-of-distinct-objects | d | Which three to approach, and in what order
Lena will approach three of her twenty close contacts, and the order matters because an early yes gives her something to say to the next two. For three people already chosen there are 3! = 6 orders; choosing and ordering together gives 20 × 19 × 18 = 6,840 sequences. She is choosing a sequence, not a set, and momentum is why.

@@ combinatorics-permutations-of-distinct-objects | e | Ordering a signalling cascade
Four kinases act in a cascade, and the order determines the output: four known kinases can be arranged in 4! = 24 cascades. Given eight candidates, the number of ordered four-step cascades is 8 × 7 × 6 × 5 = 1,680. Establishing which ordering the cell actually uses is an experimental programme, and the count is a measure of how much work it is.

@@ combinatorics-permutations-of-indistinct-objects | a | Splitting bags across containers
A flight's 132 bags are loaded into three containers holding 44 each. Which container each bag goes to is a string of 132 letters with 44 of each, and the number of such strings is 132! / (44! 44! 44!) — a number with 61 digits. The bags are distinct; what is indistinct is the label each receives.

@@ combinatorics-permutations-of-indistinct-objects | b | Accounts across four reps
Priya's 120 accounts are divided among four reps, thirty each. Writing each account's rep as a letter gives a string of 120 letters with 30 of each, so there are 120! / (30!)⁴ possible territory maps, a number with 70 digits.

@@ combinatorics-permutations-of-indistinct-objects | c | Results on a ten-match card
A ten-match card finishes with 5 home wins, 3 draws and 2 away wins. The results form a string like MISSISSIPPI, with repeated letters, so the number of cards with those totals is 10! / (5! 3! 2!) = 2,520.

@@ combinatorics-permutations-of-indistinct-objects | d | Three outreach waves
Lena splits 140 contacts into three waves of 40, 50 and 50. Labelling each contact with their wave gives a string with 40, 50 and 50 repeated letters, so there are 140! / (40! 50! 50!) ways — a number with 65 digits.

@@ combinatorics-permutations-of-indistinct-objects | e | Fates of a colony
A colony of 240 cells resolves into 96 differentiated, 120 progenitor and 24 dead. The number of ways that split can arise is 240! / (96! 120! 24!), a number with 96 digits. That count sits in front of the probability of any one such arrangement, and it is why the observed fractions cluster tightly around their expected values as the colony grows.

@@ combinatorics-combinations-of-distinct-objects | a | Choosing crew for an audit
Four of the twelve crew are selected for a training audit, and the four are treated identically: there are no named positions. That is (12 choose 4) = 495 selections, against 11,880 when the positions were named — a factor of 4! = 24, the number of ways to order the same four people.

@@ combinatorics-combinations-of-distinct-objects | b | Which features make the release
Fifteen features are candidates and six will ship this quarter. Because they ship together, order does not matter, so there are (15 choose 6) = 5,005 possible releases. That number is why roadmap arguments do not resolve by listing every option.

@@ combinatorics-combinations-of-distinct-objects | c | A four-leg parlay
With twelve markets available, a four-leg parlay can be built in (12 choose 4) = 495 ways. The legs are unordered — a parlay pays the same whichever leg is listed first — so this is a combination rather than a permutation.

@@ combinatorics-combinations-of-distinct-objects | d | Five contacts to spend goodwill on
Lena can ask perhaps five of her thirty most plausible contacts before her ask becomes noise. The selection is one of (30 choose 5) = 142,506 possible sets. She is choosing a set rather than a sequence at this stage, and the number is a reminder that the selection matters more than the message.

@@ combinatorics-combinations-of-distinct-objects | e | A complex of three factors
Eight transcription factors are present and a functional complex needs three of them, with no ordering: the complex is the same however it assembled. That gives (8 choose 3) = 56 candidate complexes. Screening all 56 is feasible; screening the 336 ordered assemblies would not be, and knowing which count applies decides whether the experiment is possible.

@@ combinatorics-bucketing-with-distinct-objects | a | Bags into containers with no limit
If each of 132 bags can go into any of three containers, with no limit on how many a container takes, there are 3¹³² ways to load them, a number with 63 digits. Every bag is a distinct item and every container a bucket. The previous lesson's count, with exactly 44 per container, picks out a small slice of these.

@@ combinatorics-bucketing-with-distinct-objects | b | Accounts to reps with no quotas
If each of Tally's 120 accounts can go to any of four reps, with no quotas, there are 4¹²⁰ assignments, a number with 73 digits — one choice of rep per account, multiplied 120 times.

@@ combinatorics-bucketing-with-distinct-objects | c | Every possible card
Each of the 10 matches on a card ends in a home win, a draw or an away win: ten distinct items, each dropped into one of three buckets. There are 3¹⁰ = 59,049 possible cards, of which 2,520 have exactly 5 home wins, 3 draws and 2 away wins.

@@ combinatorics-bucketing-with-distinct-objects | d | Waves with no fixed size
If Lena can send each of her 140 contacts in any of three waves, with no fixed wave size, there are 3¹⁴⁰ possible plans. Fixing the sizes at 40, 50 and 50 leaves only the multinomial count from the previous lesson.

@@ combinatorics-bucketing-with-distinct-objects | e | Every possible colony
Each of 240 cells ends in one of three fates, so a colony has 3²⁴⁰ possible outcomes, a number with 115 digits. The multinomial count of the previous lesson groups these outcomes by how many cells took each fate.
