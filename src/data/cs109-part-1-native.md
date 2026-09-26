# Core Probability

@applications 1.15

@@ probability-intro | 1.1 | Intro | introduction | probability
What does it mean when someone makes a claim like "the probability that you find a pearl in an oyster is 1 in 5,000?" or "the probability that it will rain tomorrow is 52%"? In this section we start by defining some key terminology: "events" and "experiments." We then define probability, and finally, we introduce some core axioms and provable identities.


@@ probability-events-and-experiments | 1.1 | Events and Experiments | subsection | probability
When we speak about probabilities, there is always an implied context, which we formally call the "experiment". For example: flipping two coins is something that probability folks would call an experiment. In order to precisely speak about probability, we must first define two sets: the set of all possible outcomes of an experiment, and the subset that we consider to be our event (what is a set?).

> Definition: Sample Space, $S$

A Sample Space is the set of all possible outcomes of an experiment. For example:

- Coin flip: $S = \{\text{Heads}, \text{Tails}\}$
- Flipping two coins: $S$ = {(H, H), (H, T), (T, H), (T, T)}
- Roll of 6-sided die: $S$ = {1, 2, 3, 4, 5, 6}
- The number of emails you receive in a day: $S = \{x|x ∈ ℤ, x ≥ 0\}$ (non-neg. ints)
- YouTube hours in a day: $S = \{x|x ∈ ℝ,0 ≤ x ≤ 24\}$

@endcard

The Sample Space is the background outcomes from which you get the really exciting outcomes: events!

> Definition: Event, $E$

An Event is some subset of $S$ that we ascribe meaning to. In set notation $E ⊆ S$. For example:

- Heads on a coin flip: $E$ = {Heads}
- At least 1 head on 2 coin flips = {(H, H), (H, T), (T, H)}
- Roll of die is 3 or less: $E$ = {1, 2, 3}
- You receive less than 20 emails in a day: $E={x|x∈ℤ,0≤x<20}$ (non-neg. ints)
- Wasted day (≥ 5 YouTube hours): $E={x|x∈ℝ,5≤x≤24}$

Events are often represented as capital letters, such as $E$ of $F$.

@endcard


@@ probability-definition-of-probability | 1.1 | Definition of Probability | subsection | probability
It wasn't until the 20th century that humans figured out a way to precisely define what the word probability means:

$$\begin{aligned}
P(\text{Event}) 
  = \lim_{n \rightarrow \infty}
    \frac
        {\text{count}(\text{Event})}
        {n}
\end{aligned}$$

In English this reads: let's say you perform n trials of an "experiment" which could result in a particular "Event" occurring. The probability of the event occurring, $P(\text{Event})$, is the ratio of trials that result in the event, written as $\text{count}(\text{Event})$, to the number of trials performed, $n$. In the limit, as your number of trials approaches infinity, the ratio will converge to the true probability. People also apply other semantics to the concept of a probability. One common meaning ascribed is that $P(E)$ is a measure of the chance of event $E$ occurring.

Measure of uncertainty: It is tempting to think of probability as representing some natural randomness in the world. That might be the case. But perhaps the world isn't random. I propose a deeper way of thinking about probability. There is so much that we as humans don't know, and probability is our robust language for expressing our belief that an event will happen given our limited knowledge. This interpretation acknowledges your own uncertainty of an event. Perhaps if you knew the position of every water molecule, you could perfectly predict tomorrow's weather. But we don't have such knowledge and as such we use probability to talk about the chance of rain tomorrow given the information that we have access to.

Origins of probabilities: The different interpretations of probability are reflected in the many origins of probabilities that you will encounter in the wild (and not so wild) world. Some probabilities are calculated analytically using mathematical proofs. Some probabilities are calculated from data, experiments or simulations. Some probabilities are just made up to represent a belief. Most probabilities are generated from a combination of the above. For example, someone will make up a prior belief, that belief will be mathematically updated using data and evidence.

Probabilities and percentages: You might hear people refer to a probability as a percent. That the probability of rain tomorrow is 32%. The proper way to state this would be to say that 0.32 is the probability of rain. Percentages are simply probabilities multiplied by 100. "Percent" is Latin for "out of one hundred".


@@ probability-simulating-probability | 1.1 | Simulating Probability | subsection | probability
Consider the probability of rolling a "5" or a "6" on a fair six-sided dice. The definition of probability above says that: if you were to keep rolling a dice, as the number of times you roll, $n$, approaches infinity the ratio of the count of times you saw an outcome of either a 5 or a 6 to the number of rolls, will approach the true probability of the event that you get a 5 or a 6. Lets take it out for a spin. When you hit the "Start rolling" button we will start simulating dice rolls. You can speed up the simulation to try to see what happens after thousands of rolls. Notice how the estimated probability approaches the 2/6 = 0.33 repeating....

Define: Event $E$ is the event that you roll either a 5 or a 6 on a six-sided dice:

@interactive probability-1

This demonstration is useful to give you a sense for what probabilities are. More! You can use this "simulation" approach to calculate probabilities yourself. This is especially true for those of you who are able to code. If you can generate trials from the sample space, you can put that simulation in a for loop, run the simulation many times, and simply estimate your probability of an event $E$ to be the fraction of simulations that produced an outcome from the event $E$. By the definition of probability, as your number of simulations approaches infinity, the estimate becomes more accurate. Of course, a probability computed via simulations will always be an estimate as you can not run infinite simulations!

At this point many students would like to know: "how many simulations are necessary to get a good estimate of the probability?" We will be able to answer that question later in the course (see Central Limit Theorem, in Part 4). For now, its sufficient to say: for most events, simulate as much as you can. If you are unable to simulate more than 100 trials you should be rather skeptical of your probability.


@@ probability-probability-from-datasets | 1.1 | Probability from Datasets | subsection | probability
The same logic that allows us to estimate probabilities from simulations also suggests that we should be able to estimate probabilities from many datasets. If we have a dataset with many rows (tending towards infinity), and you assume that each "row" or datapoint in your dataset is one simulated experiment, then the probability of an event $E$ can be estimated by counting in the dataset. Here is an example:

> Example: Is a newborn elephant male?

Use the definition of probability to approximate the answer to the question: "What is the probability a newborn elephant child is male?" Contrary to what you might think the gender outcomes of a newborn elephant are not equally likely between male and female. You have data from a report in Animal Reproductive Science which states that 3,070 elephants were born in Myanmar of which 2,180 were male . Humans also don't have a 50/50 sex ratio at birth .

Answer: The Experiment is: A single elephant birth in Myanmar.

The sample space is the set of possible sexes assigned at birth, {Male, Female, Intersex}.

E is the event that a new-born elephant child is male, which in set notation is the subset {Male} of the sample space. The outcomes are not equally likely.

By the definition of probability, the ratio — of trials that result in the event, to the total number of trials — will tend to our desired probability:

$$\begin{aligned}
P(\text{Born Male}) &= P(E) \\
		&= \lim_{n \rightarrow \infty}\frac{\text{count}(E)}{n} \\
	    &\approx \frac{2,180}{3,070} \\
	    &\approx 0.710\end{aligned}$$

Since 3,000 is quite a bit less than infinity, this is an approximation. It turns out, however, to be a rather good one. A few important notes: there is no guarantee that our estimate applies to elephants outside Myanmar. Later in the class we will develop language for "how confident we can be in a number like 0.71 after 3,000 trials?" Using tools from later in class we can say that we have 98% confidence that the true probability is within 0.02 of 0.710.

@endcard


@@ equally-likely | 1.2 | Equally Likely Outcomes | section | equally_likely
Some (but not all) sample spaces have a special property: equally likely outcomes. We like those sample spaces because there is a way to calculate probability questions about those sample spaces simply by counting. Here are a few examples of sample spaces with equally likely outcomes:

- Coin flip: S = {Head, Tails}
- Flipping two coins: S = {(H, H), (H, T), (T, H), (T, T)}
- Roll of 6-sided die: S = {1, 2, 3, 4, 5, 6}

Because every outcome is equally likely, and the probability of the sample space must be 1, we can prove that each outcome must have probability:

$$\begin{aligned}
P(\text{an outcome}) = \frac{1}{|S|}
\end{aligned}$$

Where |$S$| is the size of the sample space, or, put in other words, the total number of outcomes of the experiment. It is worth reminding yourself that this is only true in the special case where every outcome has the same likelihood.

> Definition: Probability of Equally Likely Outcomes

If $S$ is a sample space with equally likely outcomes, for an
event $E$ that is a subset of the outcomes in $S$:

$$\begin{aligned}
P(E) &= \frac{\text{number of outcomes in $E$}}{\text{number of outcomes in $S$}} 
= \frac{|E|}{|S|}
\end{aligned}$$

@endcard

There is some art form to setting up a problem to calculate a probability based on the equally likely outcome rule. (1) The first step is to explicitly define your sample space and to argue that all outcomes in your sample space are equally likely. (2) Next, you need to count the number of elements in the sample space and (3) finally you need to count the size of the event space. The event space must be all elements of the sample space that you defined in part (1). The first step leaves you with a lot of choice! For example, you can decide to make indistinguishable objects distinct, as long as your calculation of the size of the event space makes the exact same assumptions.

Example: What is the probability that the sum of two dice is equal to 7?

> Buggy Solution

You could define your sample space to be all the possible sum values of two dice (2 through 12). However, this sample space fails the “equally likely” test. You are not equally likely to have a sum of 2 as you are to have a sum of 7.

@endcard

> Solution

Consider the sample space from the previous section where we thought of the dice as distinct and enumerated all of the outcomes in the sample space. The first number is the roll on die 1 and the second number is the roll on die 2. Note that (1, 2) is distinct from (2, 1). Since each outcome is equally likely, and the sample space has exactly 36 outcomes, the likelihood of any one outcome is $\frac{1}{36}$. Here is a visualization of all outcomes:

@interactive equally-likely-1

The event (sum of dice is 7) is the subset of the sample space where the sum of the two dice is 7. Each outcome in the event is highlighted in blue. There are 6 such outcomes: (1, 6), (2, 5), (3, 4), (4, 3), (5, 2), (6, 1). Notice that (1, 6) is a different outcome than (6, 1). To make the outcomes equally likely we had to make the dice distinct.

$$\begin{aligned}
P(\text{Sum of two dice is 7}) 
&= \frac{|E|}{|S|}
&& \text{Since outcomes are equally likely} \\
&= \frac{6}{36} = \frac{1}{6}
&& \text{There are 6 outcomes in the event}
\end{aligned}$$

@endcard

Interestingly, this idea also applies to continuous sample spaces. Consider the sample space of all the outcomes of the computer function “random” which produces a real-valued number between 0 and 1, where all real-valued numbers are equally likely. Now consider the event $E$ that the number generated is in the range [0.3 to 0.7]. Since the sample space is equally likely, $P(E)$ is the ratio of the size of $E$ to the size of $S$. In this case $P(E) = \frac{0.4}{1} = 0.4$.


@@ axioms-intro | 1.3 | Intro | introduction | axioms
Here are some basic truths about probabilities that we accept as axioms:

> Definition: Axioms of Probability

| Axiom | What it says |
|---|---|
| Axiom 1: $0 \le P(E) \le 1$ | All probabilities are numbers between 0 and 1. |
| Axiom 2: $P(S) = 1$ | All outcomes must be from the sample space. |
| Axiom 3: if $E$ and $F$ are mutually exclusive, then $P(E \text{ or } F) = P(E) + P(F)$ | The probability of “or” for mutually exclusive events. |

@endcard

These three axioms are formally called the Kolmogorov axioms and they are considered to be the foundation of probability theory. They are also useful identities!

You can convince yourself of the first axiom by thinking about the math definition of probability. As you perform trials of an experiment it is not possible to get more outcomes that satisfy the event than trials performed (thus probabilities are less than 1) and it's not possible to get less than 0 occurrences of the event (thus probabilities are greater than 0).

The second axiom makes sense too. If your event is the sample space, then each trial must produce the event. This is sort of like saying; the probability of you eating cake (event) if you eat cake (sample space that is the same as the event) is 1.

The third axiom is more complex and in this course we dedicate a whole section to understanding it: Probability of “or”. It applies to events that have a special property called "mutual exclusion": the events do not share any outcomes.

These axioms have great historical significance. In the early 1900s it was not clear if probability was somehow different than other fields of math -- perhaps the set of techniques and systems of proofs from other fields of mathematics couldn't apply. Kolmogorov's great success was to show to the world that the tools of mathematics did in fact apply to probability. From the foundation provided by this set of axioms mathematicians built the edifice of probability theory.


@@ axioms-provable-identities | 1.3 | Provable Identities | subsection | axioms
Here are two equations which can be directly proved given the three axioms given above.

> Two identities

| Identity | What it says |
|---|---|
| Identity 1: $P(E^C) = 1 - P(E)$ | The probability of event $E$ not happening. |
| Identity 2: if $E \subseteq F$, then $P(E) \le P(F)$ | Events which are subsets. |

@endcard

This first identity is especially useful. For any event, you can calculate the probability of the event not occurring which we write in probability notation as $E^C$, if you know the probability of it occurring -- and vice versa. We can also use this identity to show you what it looks like to prove a theorem in probability:

> Proof: Probability of Complement (Identity 1)

$$\begin{aligned}
P(S) &= P(E \text{ or } E^C) && \text{$E$ or $E^C$ covers every outcome in the sample space} \\
P(S) &= P(E) + P(E^C) && \text{Events $E$ and $E^C$ are mututally exclusive} \\
1 &= P(E) + P(E^C) && \text{Axiom 2 of probability} \\
P(E^C) &= 1 - P(E) && \text{By re-arranging}
\end{aligned}$$

@endcard


@@ prob-or-intro | 1.4 | Intro | introduction | prob_or
The equation for calculating the probability of either event E or event F happening, written $P(E \text{ or } F)$ or equivalently as $P(E \cup F)$, is deeply analogous to counting the size of two sets. As in counting, the equation that you can use depends on whether or not the events are “mutually exclusive”. If events are mutually exclusive, it is very straightforward to calculate the probability of either event happening. Otherwise, you need the more complex “inclusion exclusion” formula.


@@ prob-or-mutually-exclusive-events | 1.4 | Mutually exclusive events | subsection | prob_or
Two events: $E$, $F$ are considered to be mutually exclusive (in set notation $E \cap F = \emptyset$) if there are no outcomes that are in both events (recall that an event is a set of outcomes which is a subset of the sample space). In English, mutually exclusive means that two events can’t both happen.

Mutual exclusion can be visualized. Consider the following visual sample space where each outcome is a hexagon. The set of all the fifty hexagons is the full sample space:

@figure 2999e3cf-e397-446e-8349-1eb242a09cc8 | A sample space of fifty hexagons, with event E shaded blue and event F shaded green; the two events share no hexagon.

Example of two events: E, F, which are mutually exclusive

Both events $E$ and $F$ are subsets of the same sample space. Visually, we can note that the two sets do not overlap. They are mutually exclusive: there is no outcome that is both in $E$ and in $F$.


@@ prob-or-or-with-mutually-exclusive-events | 1.4 | Or with Mutually Exclusive Events | subsection | prob_or
> Definition: Probability of or for mutually exclusive events

If two events: $E$, $F$ are mutually exclusive then the probability of $E$ or $F$ occurring is:

$$\begin{aligned}
P(E \text{ or } F) = P(E) + P(F)
\end{aligned}$$

This property applies regardless of how you calculate the probability of $E$ or $F$. Moreover, the idea extends to more than two events. Let’s say you have $n$ events $E_1$, $E_2$, … $E_n$ where each event is mutually exclusive of one another (in other words, no outcome is in more than one event):

$$\begin{aligned}
P&(E_1 \text{ or } E_2 \text{ or } \dots \text{ or } E_n) \\
&= P(E_1) + P(E_2) + \dots + P(E_n) \\
&= \sum_{i=1}^n P(E_i)
\end{aligned}$$

@endcard

You may have noticed that this is one of the axioms of probability. Though it might seem intuitive, it is one of three rules that we accept without proof.

At this point we know how to compute the probability of the “or” of events if and only if they have the mutual exclusion property. What if they don’t?


@@ prob-or-or-with-non-mutually-exclusive-events | 1.4 | Or with Non-Mutually Exclusive Events | subsection | prob_or
Unfortunately, not all events are mutually exclusive. If you want to calculate $P(E \text{ or } F)$ where the events $E$ and $F$ are not mutually exclusive you can not simply add the probabilities. As a simple sanity check, consider the event $E$: getting heads on a coin flip, where $P(E) = 0.5$. Now imagine the sample space $S$, getting either a heads or a tails on a coin flip. These events are not mutually exclusive (the outcome heads is in both). If you incorrectly assumed they were mutually exclusive and tried to calculate $P(E \text{ or } S)$ you would get this buggy derivation:

> Buggy derivation: Incorrectly assuming mutual exclusion

Calculate the probability of $E$, getting an even number on a dice roll (2, 4 or 6), or $F$, getting three or less (1, 2, 3) on the same dice roll.

$$\begin{aligned}
P&(E \text{ or } F) \\
&= P(E) + P(F) && \text{Incorrectly assumes mutual exclusion} \\
&= 0.5 + 0.5 && \text{substitute the probabilities of E and S} \\
&= 1.0 && \text{uh oh!}
\end{aligned}$$

The probability can’t be one since the outcome 5 is neither three or less nor even. The problem is that we double counted the probability of getting a 2, and the fix is to subtract out the probability of that doubly counted case.

@endcard

What went wrong? If two events are not mutually exclusive, simply adding their probabilities double counts the probability of any outcome which is in both events. There is a formula for calculating or of two non-mutually exclusive events: it is called the “inclusion exclusion” principle.

> Definition: Inclusion Exclusion principle

For any two events: $E$, $F$:

$$\begin{aligned}
P(E \text{ or } F) = P(E) + P(F) - P(E \text{ and } F)
\end{aligned}$$

This formula does have a version for more than two events, but it gets rather complex. See the next two sections for more details.

@endcard

Note that the inclusion exclusion principle also applies for mutually exclusive events. If two events are mutually exclusive $P(E \text{ and } F) = 0$ since it’s not possible for both $E$ and $F$ to occur. As such the formula $P(E) + P(F) - P(E \text{ and } F)$ reduces to $P(E) + P(F)$.


@@ prob-or-inclusion-exclusion-with-three-events | 1.4 | Inclusion-Exclusion with Three Events | subsection | prob_or
What does the inclusion exclusion property look like if we have three events, that are not mutually exclusive, and we want to know the probability of or, $P(E_1 \text{ or } E_2 \text{ or } E_3)$?

Recall that if they are mutually exclusive, we simply add the probabilities. If they are not mutually exclusive, you need to use the inclusion exclusion formula for three events:

$$\begin{aligned}
P(E_1 &\text{ or } E_2 \text{ or } E_3) = \\
& + P(E_1) \\
&+ P(E_2) \\
&+ P(E_3) \\
& -P(E_1 \text{ and } E_2) \\
 &-P(E_1 \text{ and } E_3) \\
 &-P(E_2 \text{ and } E_3) \\
 & +P(E_1 \text{ and } E_2 \text{ and } E_3)
\end{aligned}$$

In words, to get the probability of three events, you: (1) add the probability of the events on their own. (2) Then you need to subtract off the probability of every pair of events co-occurring. (3) Finally, you add in the probability of all three events co-occurring.


@@ prob-or-inclusion-exclusion-with-events | 1.4 | Inclusion-Exclusion with $n$ Events | subsection | prob_or
Before we explore the general formula, let’s look at one more example. Inclusion-exclusion with four events:

$$\begin{aligned}
P(&E_1 \text{ or } E_2 \text{ or } E_3 \text{ or } E_4) =\\
&+ P(E_1)\\
&+ P(E_2)\\
&+ P(E_3)\\
&+ P(E_4)\\
&- P(E_1 \text{ and } E_2) \\
&- P(E_1 \text{ and } E_3) \\
&- P(E_1 \text{ and } E_4) \\
&- P(E_2 \text{ and } E_3) \\
&- P(E_2 \text{ and } E_4) \\
&- P(E_3 \text{ and } E_4) \\
&+ P(E_1 \text{ and } E_2 \text{ and } E_3)\\
&+ P(E_1 \text{ and } E_2 \text{ and } E_4)\\
&+ P(E_1 \text{ and } E_3 \text{ and } E_4)\\
&+ P(E_2 \text{ and } E_3 \text{ and } E_4)\\
&- P(E_1 \text{ and } E_2 \text{ and } E_3 \text{ and } E_4)
\end{aligned}$$

Do you see the pattern? For $n$ events, $E_1, E_2, \dots E_n$: add all the probabilities of the events on their own. Then subtract all pairs of events. Then add all subsets of 3 events. Then subtract all subset of 4 events. Continue this process, up until subset of size $n$, adding the subsets if the size of subsets is odd, else subtracting them. The alternating addition and subtraction is where the name inclusion exclusion comes from. This is a complex process and you should first check if there is an easier way to calculate your probability. This can be written up mathematically — but it is a rather hard pattern to express in notation:

$$\begin{aligned}
P(E_1 \text{ or } E_2 \text{ or } \cdots \text{ or } E_n) = \sum\limits_{r=1}^n (-1)^{r+1} Y_r \\
\text{s.t. } Y_r = \sum\limits_{1 \leq i_1 < \cdots < i_r \leq n} P(E_{i_1} \text{ and } \cdots \text{ and } E_{i_r})
\end{aligned}$$

The notation for $Y_r$ is especially hard to parse. $Y_r$ sums over all ways of selecting a subset of $r$ events. For each selection of $r$ events, calculate the probability of the “and” of those events. $(-1)^{r+1}$ is saying: alternate between addition and subtraction, starting with addition.

It is not especially important to follow the math notation here. The main take away is that the general inclusion exclusion principle gets incredibly complex with multiple events. Often, the way to make progress in this situation is to find a way to solve your problem using another method.

The formulas for calculating the or of events that are not mutually exclusive often require calculating the probability of the and of events. Learn more in the section Probability of “and”.


@@ cond-prob-intro | 1.5 | Intro | introduction | cond_prob
In English, a conditional probability states “what is the chance of an event $E$ happening given that I have already observed some other event $F$”. It is a critical idea in machine learning and probability because it allows us to update our probabilities in the face of new evidence.

When you condition on an event happening you are entering the universe where that event has taken place. Formally, once you condition on $F$ the only outcomes that are now possible are the ones which are consistent with $F$. In other words your sample space will now be reduced to $F$. As an aside, in the universe where $F$ has taken place, all rules of probability still hold!

> Definition: Conditional Probability.

The probability of $E$ given that event $F$ already happened:

$$\begin{aligned}
P(E \mid F) = \frac{P(E \text{ and } F)}{P(F)}
\end{aligned}$$

$P(E|F)$ can be read as the probability of $E$ conditioned on $F$

@endcard

Let’s use a visualization to get an intuition for why the conditional probability formula is true. Again consider events $E$ and $F$ which have outcomes that are subsets of a sample space with 50 equally likely outcomes, each one drawn as a hexagon:

@figure db6d277f-2f83-4665-901b-81bd04e47777 | A sample space of fifty hexagons, with event E outlined in red and event F in green; the three hexagons they share are labelled E ∩ F.

Conditioning on $F$ means that we have entered the world where $F$ has happened (and $F$, which has 14 equally likely outcomes, has become our new sample space). Given that event $F$ has occurred, the conditional probability that event $E$ occurs is the subset of the outcomes of $E$ that are consistent with $F$. In this case we can visually see that those are the three outcomes in $E \text{ and } F$. Thus we have the:

$$\begin{aligned}
P(E \mid F) = \frac{P(E \text{ and } F)}{P(F)} = \frac{3/50}{14/50} = \frac{3}{14} \approx 0.21
\end{aligned}$$

Even though the visual example (with equally likely outcome spaces) is useful for gaining intuition, conditional probability applies regardless of whether the sample space has equally likely outcomes!


@@ cond-prob-conditional-probability-example | 1.5 | Conditional Probability Example | subsection | cond_prob
Let’s use a real world example to better understand conditional probability: movie recommendation. Imagine a streaming service like Netflix wants to figure out the probability that a user will watch a movie $E$ (for example, Life is Beautiful), based on knowing that they watched a different movie $F$ (say Amélie). To start let’s answer the simpler question, what is the probability that a user watches the movie Life is Beautiful, $E$? We can solve this problem using the definition of probability and a dataset of movie watching :

$$\begin{aligned}
P(E) &= \lim_{n \rightarrow \infty} \frac{\text{count}(E)}{n} \\
&\approx \frac{\text{\# people who watched movie } E}{\text{\# people on Netflix}} \\
&= \frac{1,234,231}{50,923,123} \\
&\approx 0.02
\end{aligned}$$

In fact we can do this for many movies $E$:

@interactive cond-prob-1

Now for a more interesting question. What is the probability that a user will watch the movie Life is Beautiful ($E$), given they watched Amélie ($F$)? We can use the definition of conditional probability.

$$\begin{aligned}
P(E\mid F) &= \frac{P(E \text{ and } F)}{P(F)} && \text{Def of Cond Prob} \\
&\approx \frac{
 (\text{\# who watched } E \text{ and } F)/ (\text{\# of people on Netflix})
}{
 (\text{\# who watched movie } F)/(\text{\# people on Netflix})
} && \text{Def of Prob}
\\
&\approx \frac{\text{\# of people who watched both } E \text{ and } F}{\text{\# of people who watched movie } F}
&& \text{Simplifying}
\end{aligned}$$

If we let $F$ be the event that someone watches the movie Amélie, we can now calculate $P(E\mid F)$, the conditional probability that someone watches movie $E$:

@interactive cond-prob-2

Why do some probabilities go up, some probabilities go down, and some probabilities are unchanged after we observe that the person has watched Amélie ($F$)? If you know someone watched Amélie, they are more likely to watch Life is Beautiful, and less likely to watch Star Wars. We have new information on the person!


@@ cond-prob-the-conditional-paradigm | 1.5 | The Conditional Paradigm | subsection | cond_prob
When you condition on an event you enter the universe where that event has taken place. In that new universe all the laws of probability still hold. Thus, as long as you condition consistently on the same event, every one of the tools we have learned still apply. Let’s look at a few of our old friends when we condition consistently on an event (in this case $G$):

| Name of rule | Original rule | Rule conditioned on $G$ |
|---|---|---|
| Axiom of probability 1 | $0 \le P(E) \le 1$ | $0 \le P(E|G) \le 1$ |
| Axiom of probability 2 | $P(S) = 1$ | $P(S|G) = 1$ |
| Axiom of probability 3 | $P(E \text{ or } F) = P(E) + P(F)$ for mutually exclusive events | $P(E \text{ or } F|G) = P(E|G) + P(F|G)$ for mutually exclusive events |
| Identity 1 | $P(E^C) = 1 - P(E)$ | $P(E^C|G) = 1 - P(E|G)$ |


@@ cond-prob-conditioning-on-multiple-events | 1.5 | Conditioning on Multiple Events | subsection | cond_prob
The conditional paradigm also applies to the definition of conditional probability! Again if we consistently condition on some event $G$ occurring, the rule still holds:

$$\begin{aligned}
P(E \mid F, G) = \frac{P(E \text{ and } F \mid G)}{P(F \mid G)}
\end{aligned}$$

The term $P(E \mid F, G)$ is new notation for conditioning on multiple events. You should read that term as “The probability of E occurring, given that both F and G have occurred”. This equation states that the definition for conditional probability of $E \mid F$ still applies in the universe where $G$ has occurred. Do you think that $P(E \mid F, G)$ should be equal to $P(E \mid F)$? The answer is: sometimes yes and sometimes no.


@@ law-total-intro | 1.6 | Intro | introduction | law_total
An astute person once observed that when looking at a picture, like the one we saw for conditional probability:

@figure c5986956-cef8-4c02-b06b-8fa33f03b2ad | A sample space of fifty hexagons, with event E outlined in red and event F in green; the hexagons they share are labelled E ∩ F.

that event $E$ can be thought of as having two parts, the part that is in $F$, $(E \text{ and } F)$, and the part that isn’t, $(E \text{ and } F^c)$. This is true because $F$ and $F^c$ are (a) mutually exclusive sets of outcomes which (b) together cover the entire sample space. After further investigation this proved to be mathematically true, and there was much rejoicing:

$$\begin{aligned}
P(E) &= P(E \text{ and } F) + P(E \text{ and } F^c)
\end{aligned}$$

This observation proved to be particularly useful when it was combined with the chain rule and gave rise to a tool so useful, it was given the big name, law of total probability:

$$\begin{aligned}
P(E) &= P(E \text{ and } F) + P(E \text{ and } F^c) \\
&= P(E | F) P(F) + P(E | F^c) P(F^c) \\
\end{aligned}$$

> The Law of Total Probability (LOTP)

If we combine our above observation with the chain rule, we get a very useful formula the Law of Total Probability of LOTP for short:

$$\begin{aligned}
P(E) &= P(E | F) P(F) + P(E | F^c) P(F^c)
\end{aligned}$$

@endcard

There is a more general version of the rule. If you can divide your sample space into any number of mutually exclusive events: $B_1, B_2, \dots B_n$ such that every outcome in the sample space falls into one of those events, then:

$$\begin{aligned}
P(E) 
&= \sum_{i=1}^n P(E \text{ and } B_i) \quad\quad\text{Extension of our observation}\\
&= \sum_{i=1}^n P(E | B_i) P(B_i) \quad\quad\text{Using chain rule on each term}
\end{aligned}$$


@@ law-total-law-of-total-probability-many-background-events | 1.6 | Law of Total Probability: Many Background Events | subsection | law_total
The events $F$ and $F^C$ are always mutually exclusive and they always cover the entire sample space, no matter what $F$ represents! If you can find more than two background events that are also mutually exclusive, and their union covers the entire sample space (the universe of outcomes) then you can use the generalized version of the law of total probability.

To generalize the law of total probability, imagine we can divide the sample space into several mutually exclusive background events $( B_1, B_2, \dots, B_n )$, where these sets are collectively exhaustive. Collectively exhaustive is a formal way to say that exactly one of these events will occur. In this case, any event $E$ can be decomposed by considering the likelihood of $E$ within each of these disjoint sets.

@figure e55a0df2-eeee-4da8-819a-f30ce17dd8e1 | A sample space cut into four disjoint regions B1 to B4, with an event E that overlaps several of them.

In the image above, you could compute $P(E)$ to be equal to

$$\begin{aligned}
P\Big[(E \text{ and } B_1) \text{ }\text{ or }\text{ }(E \text{ and } B_2)\text{ }  \text{ or }\text{ }\dots\text{ } \text{ or }\text{ }(E \text{ and } B_n)\big]
\end{aligned}$$

There are many real world cases where it is much easier to think of the probability of an event $E$ in the context of a background event $B_i$. Suppose you are trying to determine the likelihood that a randomly selected individual will test positive for a certain disease, $P(E)$. The population can be divided into three mutually exclusive background groups:

- $B_1$: Individuals who are high-risk (e.g., individuals with a known exposure to the disease),
- $B_2$: Individuals who are medium-risk (e.g., individuals with a family history of the disease but no direct exposure),
- $B_3$: Individuals who are low-risk (e.g., the general population without known risk factors).

Each of these groups has a different probability of testing positive for the disease, and the total probability of a random individual testing positive can be broken down as follows:

$$\begin{aligned}
P&(E) \\
&= P(E \text{ and } B_1) + P(E \text{ and } B_2) + P(E \text{ and } B_3) && \text{LOTP}\\
&= P(E | B_1)P(B_1) + P(E | B_2)P(B_2) + P(E | B_3)P(B_3) && \text{Chain Rule}\\
&= \sum_{i=1}^{3} P(E \mid B_i)P(B_i) && \text{Sum Notation}
\end{aligned}$$

Where:

- $P(E | B_1)$ is the probability of testing positive in the high-risk group
- $P(E | B_2)$ is the probability of testing positive in the medium-risk groups,
- $P(E | B_3)$ is the probability of testing positive in the low-risk group.
- $P(B_1), P(B_2), P(B_3)$ are the probabilities of a person being in the high-risk, medium-risk, and low-risk groups.

This use of the Law of Total Probability works because everyone belongs to one and only one background event $(B_1, B_2, B_3)$. In other words the events $B_i$ span the sample space. Moreover, each person is in only one of the sets, and as such they are mutually exclusive. This use of the Law of Total Probability is helpful because it is easier to think of the probability of $E$, testing positive, in the context of the background events, where you know how at-risk the patient is.


@@ bayes-theorem-intro | 1.7 | Intro | introduction | bayes_theorem
Bayes' Theorem is one of the most important equations in probability for computer scientists. In a nutshell, Bayes' theorem provides a way to convert a conditional probability from one direction, say $P(E|F)$, to the other direction, $P(F|E)$.

Bayes' theorem is a mathematical identity which we can derive ourselves. Start with the definition of conditional probability and then expand the and term using the chain rule:

$$\begin{aligned}
P(F|E) 
&= \frac{P(F \text{ and } E)}{P(E)} && \text{Def of }
\text{conditional probability} \\
&= \frac{P(E | F) \cdot P(F)}{P(E)} && \text{Substitute the }
\text{chain rule} \text{ for $P(F \text{ and } E)$}
\end{aligned}$$

Recall the chain rule: $P(F \text{ and } E) = P(E|F) \cdot P(F)$.

This theorem makes no assumptions about E or F so it will apply for any two events. Bayes' theorem is exceptionally useful because it turns out to be the ubiquitous way to answer the question: "how can I update a belief about something, which is not directly observable, given evidence." This is for good reason. For many "noisy" measurements it is straightforward to estimate the probability of the noisy observation given the true state of the world. However, what you would really like to know is the conditional probability the other way around: what is the probability of the true state of the world given evidence. There are countless real world situations that fit this situation:

> Example 1: Medical tests

What you want to know: Probability of a disease given a test result

What is easier to know: Probability of a test result given the true state of disease

Causality: We believe that diseases influence test results

Example 2: Student ability

What you want to know: Student knowledge of a subject given their answers

What is easier to know: Likelihood of answers given a student's knowledge of a subject

Causality: We believe that ability influences answers

Example 3: Cell phone location

What you want to know: Where is a cell phone, given noisy measure of distance to tower

What is easier to know: Error in noisy measure, given the true distance to tower

Causality: We believe that cell phone location influences distance measure

@endcard

There is a pattern here: in each example we care about knowing some unobservable -- or hard to observe -- state of the world. This state of the world "causes" some easy-to-observe evidence. For example: having the flu (something we would like to know) causes a fever (something we can easily observe), not the other way around. Let's define some events.

Define $U$ to be the unobserved event.

Define $E$ for the event that I observe my evidence.

This makes it clear that Bayes' theorem allows us to calculate an updated belief in the unobserved event given evidence: $P(U|E)$

> Definition: Bayes' Theorem

The most common form of Bayes' Theorem is Bayes' Theorem Classic:

$$\begin{aligned}
P(U|E) = \frac{P(E | U) \cdot P(U)}{P(E)}
\end{aligned}$$

There are names for the different terms in the Bayes' Rule formula. The term $P(U|E)$ is often called the "posterior": it is your updated belief of $B$ after you take into account evidence $E$. The term $P(U)$ is often called the "prior": it was your belief before seeing any evidence. The term $P(E|U)$ is called the likelihood term and $P(E)$ is often called the normalization constant.

There are several techniques for handling the case where the denominator is not known. One technique is to use the law of total probability to expand out the term, resulting in another formula, called Bayes' Theorem with Law of Total Probability:

$$\begin{aligned}
P&(U|E) \\
&= \frac{P(E | U) \cdot P(U)}{P(E)} && \text{Bayes}\\
&= \frac{P(E | U) \cdot P(U)}{P(E|U)\cdot P(U) + P(E|U^C) \cdot P(U^C)} && \text{LOTP}
\end{aligned}$$

Recall the law of total probability which is responsible for our new denominator:

$$\begin{aligned}
P(E) = P(E|U)\cdot P(U) + P(E|U^C) \cdot P(U^C)
\end{aligned}$$

@endcard

A common scenario for applying the Bayes' Rule formula is when you want to know the probability of something “unobservable” given an “observed” event! For example, you want to know the probability that a student understands a concept, given that you observed them solving a particular problem. It turns out it is much easier to first estimate the probability that a student can solve a problem given that they understand the concept and then to apply Bayes' Theorem. Intuitively, you can think about this as updating a belief given evidence.


@@ bayes-theorem-probability-of-disease-using-bayes-theorem | 1.7 | Probability of Disease using Bayes' Theorem | subsection | bayes_theorem
Here we work through a classic application of Bayes' theorem: what is the probability that someone has a disease given a "noisy" test. The noisy test has a known probability of giving a positive result when the patient has the illness (which is often not exactly 1.0) and a known probability of giving a positive result when the patient does not have the illness (which is often not exactly 0.0).

For example, consider the Mammogram test for breast cancer. The mammogram test returns a positive result 95% of the time for patients who have breast cancer. The test returns a positive result 7% of the time for people who do not have breast cancer. Because the test is noisy, a "positive" Mammogram result does not guarantee that the patient has breast cancer.

@interactive bayes-theorem-1


@@ bayes-theorem-natural-frequency-intuition | 1.7 | Natural Frequency Intuition | subsection | bayes_theorem
One way to build intuition for Bayes Theorem is to think about "natural frequences". Let's take another approach to answer the probability question in the above example on belief of disease given a test. In this take, we are going to imagine we have a population of 1000 people. Let's think about how many of those have the disease and test positive and how many don't have the disease and test positive. This population starts from the same numbers as the calculator above. Feel free to change them!

There are many possibilities for how many people have the disease, but one very plausible number is 1000, the number of people in our population, multiplied by the probability of the disease:

$1000 \times P(\text{Disease})$ people have the disease

$1000 \times [1 - P(\text{Disease})]$ people do not have the disease

We can count what fraction of the people who have the disease test positive, and what fraction of people who do not have the disease test positive. Here is an interactive demo:

@interactive bayes-theorem-2

The unintuitive result where you observe a positive test result, but you still think the patient is unlikely (probability < 0.5) to have the disease often occurs when the "Probability a randomly chosen person has the disease" is low.


@@ bayes-theorem-bayes-with-the-general-law-of-total-probability | 1.7 | Bayes' with the General Law of Total Probability | subsection | bayes_theorem
In the examples we have seen so far in this section, we have expanded the denominator of Bayes' Theorem $P(E)$ using the standard version of the law of total probability (LOTP):

$$\begin{aligned}
P(E) = P(E|U)\cdot P(U) + P(E|U^C) \cdot P(U^C)
\end{aligned}$$

You can also expand the denominator using the more general version of the Law of Total Probability if you have a set of events which are mutually exclusive and collectively exhaustive. In that case you can expand the $P(E)$ using the law of total probability:

> Definition: Bayes' Theorem with the General Law of Total Probability

If a set of events $B_j$ are mutually exclusive and collectively exhaustive (eg at least one of the events must occur) then:

$$\begin{aligned}
P(B_i | E) &= \frac{P(E|B_i) \cdot P(B_i)}{P(E)}
&& \text{Bayes Theorem} \\
 &= \frac{P(E|B_i) \cdot P(B_i)}{\sum_{j=1}^n P(E|B_j) \cdot P(B_j)}
&& \text{LOTP} \\
\end{aligned}$$

@endcard

For example say we are trying to track a phone which could be in any one of n discrete locations and we have prior beliefs $P(B_1)\dots P(B_n)$ as to whether the phone is in location $B_i$. Now we gain some evidence (such as a particular signal strength from a particular cell tower) that we call $E$ and we need to update all of our probabilities to be $P(B_i|E)$. We should use Bayes' Theorem!

The probability of the observation, assuming that the the phone is in location $B_i$, $P(E|B_i)$, is something that can be given to you by an expert. In this case the probability of getting a particular signal strength given a location $B_i$ will be determined by the distance between the cell tower and location $B_i$ .

Since we are assuming that the phone must be in exactly one of the locations, we can find the probability of any of the event $B_i$ given $E$ by first applying Bayes' Theorem and then applying the general version of the law of total probability..


@@ independence-intro | 1.8 | Intro | introduction | independence
So far we have talked about mutual exclusion as an important "property" that two or more events can have. In this section we will introduce you to a second property: independence. Independence is perhaps one of the most important properties to consider! Like for mutual exclusion, if you can establish that this property applies (either by logic, or by declaring it as an assumption) it will make analytic probability calculations much easier!

> Definition: Independence

Two events are said to be independent if knowing the outcome of one event does not change your belief about whether or not the other event will occur. For example, you might say that two separate dice rolls are independent of one another: the outcome of the first dice gives you no information about the outcome of the second -- and vice versa.

$$P(E|F) = P(E)$$

@endcard


@@ independence-alternative-definition | 1.8 | Alternative Definition | subsection | independence
Another definition of independence can be derived by using an equation called the chain rule, which we will learn about later, in the context where two events are independent. Consider two independent events A and B:

$$\begin{aligned}
P(A,B) \\
&= P(A) \cdot P(B|A) && \text{Chain Rule} \\
&= P(A) \cdot P(B) && \text{Independence}
\end{aligned}$$


@@ independence-independence-is-symmetric | 1.8 | Independence is Symmetric | subsection | independence
This definition is symmetric. If $E$ is independent of $F$, then $F$ is independent of $E$.

> Proof: Independence is Symmetric

We can prove that $P(F | E) = P(F)$ implies $P(E | F) = P(E)$ starting with a law called Bayes' Theorem which we will cover shortly:

$$\begin{aligned}
P&(E | F) \\ 
&= \frac{P(F|E) \cdot P(E)}{P(F)} && \text{Bayes Theorem} \\
&= \frac{P(F) \cdot P(E)}{P(F)} && P(F | E) = P(F) \\
&= P(E) && \text{Cancel}
\end{aligned}$$

@endcard


@@ independence-independence-and-complements | 1.8 | Independence and Complements | subsection | independence
If you are told that two events $A$ and $B$ are independent, the independence property is preserved when considering any complements of the events. As such:

$$\begin{aligned}
A &\text{ is independent of } B^C \\
A^C &\text{ is independent of } B \\
A^C &\text{ is independent of } B^C
\end{aligned}$$

> Proof: Independence of Complements

If events A and B are independent, we can prove that A and $B^C$ are also independent. Formally we want to show that: $P(A B^C) = P(A)\cdot P(B^C)$. This starts with a rule called the Law of Total Probability (LOTP) that states: $P(A) = P(AB) + P(AB^C)$

$$\begin{aligned}
P (AB^C ) &= P (A) - P (AB) && \text{LOTP} \\
&= P (A) - P (A)P (B) &&\text{Independence}\\
&= P (A)[1 - P (B)]&&\text{Algebra}\\
&= P (A)P(B^C)&&\text{Identity 1}\\
\end{aligned}$$

This logic can be extended to also prove that if $A$ and $B$ are independent $A^C$ and $B^C$ are also independent.

@endcard


@@ independence-generalized-independence | 1.8 | Generalized Independence | subsection | independence
Events $E_1$, $E_2$ , … , $E_n$ are independent if for every subset of $r$ events that you can select from the $n$ events (where $r ≤ n$), the events in that subset are independent. In other words the joint probability of the events (the probability of the "and" of each of the events), is the product of the probability of the events. Formally, for every subset $E_{i_1}$, $E_{i_2}$, $\dots$ , $E_{i_r}$ then: $$

$$P(E_{i_1}, E_{i_2}, \dots, E_{i_r}) = \prod_{j=1}^r P(E_{i_j})$$

If you are told that a set of events are independent, the the probability of the "and" of any subset can be computed using multiplication.

> Example: Five independent coin flips

consider the probability of getting 5 heads on 5 coin flips where we assume that each coin flip is independent of one another.

Solution: Let $H_i$ be the event of getting a heads on the $i$th coin flip.

@endcard


@@ independence-parallel-networks-example | 1.8 | Parallel Networks Example | subsection | independence
Networks, such as the internet, are used to send information. Often there are multiple paths (mediated by routers) between two computers and as long as one path is functional, information can be sent. Consider a parallel network with n independent routers, each with probability $p_i$ of functioning (where $1 ≤ i ≤ n$). Let $E$ be the event that there is a functional path. What is $P(E)$?

@figure b41edceb-99b0-4ea3-92e5-1ac49913df51 | Server A connects to server B through n routers in parallel; router i works with probability p_i.

A simple network that connects two computers, A and B.

> Solution

Let $F_i$ be the event that router $i$ fails. Note that the problem states that routers are independent, and as such we assume that the events $F_i$ are all independent of one another.

$$\begin{aligned}
P(E) \\
&= P(\text{At least one router works}) \\
&= 1 - P(\text{All routers fail}) \\
&= 1 - P(F_1 \text{ and } F_2 \text{ and } \dots \text{ and } F_n) \\
&= 1 - \prod_{i=1}^n P(F_i) && \text{Independence of } F_i\\
&= 1 - \prod_{i=1}^n [1 - p_i]
\end{aligned}$$

Where $p_i$ is the probability that router $i$ is functional. A critical part of this solution was to change the problem from being the probability that at least one router works, into one minus the probability that all routers fail. That technique has a formal name called De Morgan's Law.

@endcard


@@ independence-how-to-establish-independence | 1.8 | How to Establish Independence | subsection | independence
How can you show that two or more events are independent? The default option is to show it mathematically. If you can show that $P(E | F) = P(E)$ then you have proven that the two events are independent. When working with probabilities that come from data, very few things will exactly match the mathematical definition of independence. That can happen for two reasons: first, events that are calculated from data or simulation are not perfectly precise and it can be impossible to know if a discrepancy between $P(E)$ and $P(E|F)$ is due to inaccuracy in estimating probabilities, or dependence of events. Second, in our complex world many things actually influence each other, even if just a tiny amount. Despite that we often make the wrong, but useful, independence assumption. Since independence makes it so much easier for humans and machines to calculate composite probabilities, you may declare the events to be independent. It could mean your resulting calculation is slightly incorrect — but this "modeling assumption" might make it feasible to come up with a result.

Independence is a property which is often "assumed" if you think it is reasonable that one event is unlikely to influence your belief that the other will occur (or if the influence is negligible). Let's work through an example to better understand.


@@ independence-conditional-independence | 1.8 | Conditional Independence | subsection | independence
We saw earlier that the laws of probability still held if you consistently conditioned on an event. As such, the definition of independence also transfers to the universe of conditioned events. We use the terminology "conditional independence" to refer to events that are independent when consistently conditioned. For example if someone claims that events E₁, E₂, E₃ are conditionally independent given event F. This implies that

$$P(E_1, E_2, E_3 | F) = P(E_1|F) \cdot P(E_2|F) \cdot P(E_3|F)$$

Which can be written more succinctly in product notation

$$P(E_1, E_2, E_3 | F) = \prod_{i=1}^3 P(E_i|F)$$

> Warning

While the rules of probability stay the same when conditioning on an event, the independence property between events might change. Events that were dependent can become independent when conditioning on an event. Events that were independent can become dependent. For example, if events E₁, E₂, E₃ are conditionally independent given event F it is not necessarily true that

$$P(E_1,E_2,E_3) = \prod_{i=1}^3 P(E_i)$$

As we are no longer conditioning on F.

@endcard


@@ prob-and-intro | 1.9 | Intro | introduction | prob_and
The probability of the and of two events, say $E$ and $F$, written $P(E \text{ and } F)$, is the probability of both events happening. You might see equivalent notations $P(EF)$, $P(E∩F)$ and $P(E,F)$ to mean the probability of and. How you calculate the probability of event $E$ and event $F$ happening depends on whether or not the events are "independent". In the same way that mutual exclusion makes it easy to calculate the probability of the or of events, independence is a property that makes it easy to calculate the probability of the and of events.


@@ prob-and-and-with-independent-events | 1.9 | And with Independent Events | subsection | prob_and
If events are independent then calculating the probability of and becomes simple multiplication:

> Definition: Probability of and for independent events.

If two events: $E$, $F$ are independent then the probability of $E$ and $F$ occurring is:

$$\begin{aligned}
P(E \text{ and } F)=P(E)⋅P(F)
\end{aligned}$$

This property applies regardless of how the probabilities of E and F were calculated and whether or not the events are mutually exclusive.

The independence principle extends to more than two events. For $n$ events $E_1$, $E_2$, … $E_n$ that are mutually independent of one another — the independence equation also holds for all subsets of the events.

$$\begin{aligned}
P(E_1 \text{ and } E_2 \text{ and } \dots \text{ and } E_n) = \prod_{i=1}^n P(E_i)
\end{aligned}$$

@endcard

We can prove this equation by combining the definition of conditional probability and the definition of independence.

> Proof: If $E$ is independent of $F$ then $P(E \text{ and } F) = P(E) \cdot P(F)$

$$\begin{aligned}
	P(E|F) &= \frac{P(E \text{ and } F)}{P(F)} && \text{Definition of }
	\text{conditional probability} 
	\\
	P(E) &=  \frac{P(E \text{ and } F)}{P(F)} && \text{Definition of }
	\text{independence} \\
	P(E \text{ and } F) &= P(E) \cdot P(F) && \text{Rearranging terms}
	\end{aligned}$$

@endcard

See the section on independence to learn about when you can assume that two events are independent.


@@ prob-and-and-with-dependent-events | 1.9 | And with Dependent Events | subsection | prob_and
Events which are not independent are called dependent events. How can you calculate the probability of the and of dependent events? There is a direct formula called the chain rule which can be directly derived from the definition of conditional probability:

> Definition: The Chain Rule

The formula in the definition of conditional probability can be re-arranged to derive a general way of calculating the probability of the and of any two events:

$$\begin{aligned}
P(E \text{ and } F) = P(E | F) \cdot P(F)
\end{aligned}$$

The chain rule states that the probability of observing events $E$ and $F$ is the probability of observing $F$, multiplied by the probability of observing $E$, given that you have observed $F$. There is nother special about $E$ that says it should go first. Equivalently:

$$\begin{aligned}
P(E \text{ and } F) = P(F \text{ and } E) =  P(F | E) \cdot P(E)
\end{aligned}$$

It generalizes to more than two events:

$$\begin{aligned}
P&(E_1 \text{ and } E_2 \text{ and } \dots \text{ and } E_n) \\
= &P(E_1) \cdot P(E_2|E_1) \cdot P(E_3 |E_1 \text{ and } E_2) \cdots  \\  &P(E_n|E_1 \dots E_{n−1})
\end{aligned}$$

@endcard


@@ demorgans-intro | 1.10 | Intro | introduction | demorgans
De Morgan's Laws are a pair of very helpful formulas to convert from an expression of the probability of and of events into the probability of or of events (and vice versa).

If, for example, you need the probability of or and you know the events are independent (which makes the probability of and easy), you can use De Morgan's Law for or to first convert the or expression into an and expression.


@@ demorgans-de-morgan-s-law-for-or | 1.10 | De Morgan's Law for or | subsection | demorgans
> Definition: De Morgan's Law for or

$$\begin{aligned}
P&(E_1 \text{ or } E_2 \text{ or } \cdots E_n)\\
&= 1 - P\Big((E_1 \text{ or } E_2 \text{ or } \cdots E_n)^C\Big) \\
&= 1 -P(E_1^C \text{ and } E_2^C \text{ and } \cdots E_n^C)
\end{aligned}$$

@endcard

One way to gain intuition is pictorially. Consider the events $E$ and $F$ depicted below. The area in white can either be expressed as $P(E \text{ or } F)$ or as $1 - P(E^C \text{ and } F^C)$

@figure b458b867-0e7e-42a7-863a-92bc3605e9d3 | A Venn diagram of events E and F inside the sample space S: the area outside both events is shaded, and E or F is white.


@@ demorgans-de-morgan-s-law-for-and | 1.10 | De Morgan's Law for and | subsection | demorgans
> Definition: De Morgan's Law for and

$$\begin{aligned}
P&(E_1 \text{ and } E_2 \text{ and } \cdots E_n)\\
&= 1 - P\Big((E_1 \text{ and } E_2 \text{ and } \cdots E_n)^C\Big) \\
&= 1 -P(E_1^C \text{ or } E_2^C \text{ or } \cdots E_n^C)
\end{aligned}$$

@endcard

Again, we can gain intuition from a picture of arbitrary events $E$ and $F$. The area in white can be written as $P(E \text{ and } F)$ or as $1 - P(E^C \text{ or } F^C)$

@figure 575c0a68-df24-4f57-a460-5bc8272629a2 | A Venn diagram of events E and F inside the sample space S: everything except the overlap of E and F is shaded, and E and F is white.


@@ log-probabilities-intro | 1.11 | Intro | introduction | log_probabilities
A log probability $\log P(E)$ is simply the log function applied to a probability. Recall that a logarithm is the inverse of an exponent; $\log_b a = x$ means that $b^x = a$. In this course, if a log doesn't have a written base, the default base is Euler's number $e$.

For example if $P(E) = 0.00001$ then $\log P(E) = \log(0.00001) \approx -11.51$. Note that in this course, the default base is the natural base e. There are many reasons why log probabilities are an essential tool for digital probability: (a) computers can be rather limited when representing very small numbers and (b) logs have the wonderful ability to turn multiplication into addition, and computers are much faster at addition.


@@ log-probabilities-properties-of-logarithms | 1.11 | Properties of Logarithms | subsection | log_probabilities
> Properties of logarithms

$\log(1) = 0$

$\log(e) = 1$

$\log(0) = -\infty$

Log of the product: $\log (xy) = \log x + \log y$

Log of an exponent: $\log(x^c) = c \cdot \log x$

Log of a fraction: $\log(\frac{1}{x^c}) = -c \cdot \log(x)$

Change of Base: $\log_b a = \frac{\log_x a}{\log_x b}$ for any $x$

@endcard


@@ log-probabilities-products-become-addition | 1.11 | Products become Addition | subsection | log_probabilities
Since the log of the product is the sum of the logs, the product of probabilities $P(E)$ and $P(F)$ becomes addition in logarithmic space:

$$\log (P(E) \cdot P(F) ) = \log P(E) + \log P(F)$$

This is especially convenient because computers are much more efficient when adding than when multiplying. It can also make derivations easier to write. This is especially helpful when you are dealing with many probabilities multiplied together:

$$\log \prod_i P(E_i) = \sum_i \log P(E_i)$$


@@ log-probabilities-representing-very-small-probabilities | 1.11 | Representing Very Small Probabilities | subsection | log_probabilities
Computers have the power to process many events and consider the probability of very unlikely situations. While computers are capable of doing all the computation, the floating point representation means that computers cannot represent decimals to perfect precision. In fact, Python is unable to represent any probability smaller than 2.225e-308. On the other hand the log of that same number, -307.652, is very easy for a computer to store.

Why would you care? Often in the digital world, computers are asked to reason about the probability of data, or a whole dataset. For example, perhaps your data is words and you want to reason about the probability that a given author would write these specific words. While this probability is very small (we are talking about an exact document) it might be larger than the probability that a different author would write a specific document with specific words. For these sorts of small probabilities, if you use computers, you would need to use log probabilities.


@@ log-probabilities-logs-of-probabilities-are-negative | 1.11 | Logs of Probabilities are Negative | subsection | log_probabilities
In our earlier example $\log(0.00001) \approx -11.51$ produced a negative number. That is not a coincidence. The log of any probability will be a negative number. The higher the probability, the closer that negative number will be to zero:

$$\begin{aligned}
0 &\leq  P(E) \leq 1 && \text{Axiom 1 of probability} \\
-\infty &\leq \log P(E) \leq 0 && \text{Rule for log probabilities}
\end{aligned}$$

Here is a graph of $x$ and $\log(x)$ in the range of values that a probability can take on: $0 < x < 1$:

@interactive log-probabilities-1

Notice that all of the log of all values are negative. What is hard to show on this chart is that as $x$ gets closer and closer to 0, then $\log(x)$ gets closer to $-\infty$.

Recall that $\log a = x$, with the implied natural base e, is the same as the statement $e ^ x = a$. In other words $x$ is the exponent of $e$ that produces $a$. If $a$ is a number between 0 and 1, what power should you raise $e$ to in order to produce b? If you raise $e^0$ it produces 1. To produce a number less than 1, you must raise e to a power less than 0.


@@ many-flips-intro | 1.12 | Intro | introduction | many_flips
In this section we are going to consider the number of heads on $n$ coin flips. This thought experiment is going to be a basis for much probability theory! It goes far beyond coin flips.

Say a coin comes up heads with probability $p$. Most coins are fair and as such come up heads with probability $p=0.5$. There are many events for which coin flips are a great analogy that have different values of $p$ so let's leave $p$ as a variable. You can try simulating flipping coins here. Note that H is short for Heads and T is short for Tails. We think of each coin as distinct:

> Coin Flip Simulator

@interactive many-flips-1

@endcard

Using the math in this section we will be able to calculate the probability of different numbers of heads. For example, if you flip $n=10$ coins which have a $p=0.6$ probability of landing heads, the probability of getting exactly 7 heads is 0.215. This section is organized into the following lessons:

- Warmups: We calculate the probability of a few exact outcomes.
- Exactly k heads. We derive the general formula.
- More than k heads. We explore this interesting related problem


@@ many-flips-warmups | 1.12 | Warmups | subsection | many_flips
In all of these warmups we are going to consider the probability of different outcomes when you flip a coin n times and each time the probability of heads is $p$. In each solution we will consider the case where $n=10$ and $p=0.6$.

What is the probability that all $n$ flips are heads?

> All $n$ flips are heads

This question is asking what is the probability of getting the outcome:

H, H, H, H, H, H, H, H, H, H

Where each flip lands in heads (H). Each coin flip is independent so we can use the rule for probability of and with independent events. As such, the probability of $k$ heads is $p$ multiplied $k$ times: $p^k$.

If $n=10$ and $p=0.6$ then the probability of $n$ heads $= p^n =0.6^{10}≈ 0.006$

@endcard

What is the probability that all $n$ flips are tails?

> All $n$ flips are tails

Lets say $n=10$ this question is asking what is the probability of getting:

T, T, T, T, T, T, T, T, T, T

Each coin flip is independent. The probability of tails (T) on any coin flip is $1−p$. Again, since the coin flips are independent, the probability of tails n times on $n$ flips is $(1−p)$ multiplied by itself n times: $(1−p)^n$. If $n=10$ and $p=0.6$ then the probability of $n$ tails is around 0.0001.

@endcard

First $k$ heads then $n−k$ tails

> First $k$ heads, then $n-k$ tails

Lets say $n=10$ and $k=4$, this question is asking what is the probability of getting:

H, H, H, H, T, T, T, T, T, T

The coins are still independent! The first $k$ heads occur with probability $p^k$ the run of $n−k$ tails occurs with probability $(1−p)^{n−k}$. The probability of $k$ heads then $n−k$ tails is the product of those two terms:

$$\begin{aligned}
p^k \cdot (1-p)^{n-k}
\end{aligned}$$

@endcard


@@ many-flips-exactly-heads | 1.12 | Exactly $k$ heads | subsection | many_flips
Next lets try to figure out the probability of exactly $k$ heads in the $n$ flips. Importantly we don't care where in the $n$ flips that we get the heads, as long as there are $k$ of them. Note that this question is different than the question of first $k$ heads and then $n−k$ tails which requires that the $k$ heads come first! That particular result does generate exactly $k$ coin flips, but there are others.

There are many others! Let's ask the computer to list the ways we could generate exactly $k$ heads within $n$ coin flips. The output region is scrollable:

@interactive many-flips-2

Let's call each of these rows an "ordering" since each row is a unique way to order the 4 heads and 6 tails. Let N be the number of unique orderings.

Exactly how many unique orderings are there with $k=4$ heads in $n=10$ flips? $N=210$. Why? Each ordering listed above is a permutation of the list [H, H, H, H, T, T, T, T, T, T]. As such, the question "how many orderings are there?" is analogous to the question, how many distinct orderings of characters are possible for the string "HHHHTTTTT"? Because H characters are indistinct from one another (and same for T) we can solve this problem using Permutations of Indistinct Objects:

$$\begin{aligned}
\text{Num Orderings} = \frac{n!}{k! (n-k)!} = {n \choose k}
\end{aligned}$$

Each of these orderings can be thought of as one event, or outcome, of flipping 10 coins. Let's name $E_i$ to be the event that we get the exact outcome in the $i$th row. $E_1$ is the event that we get [H, H, H, H, T, T, T, T, T, T], $E_2$ is the event that we get [H, H, H, T, H, T, T, T, T, T], and so on.

The probability of exactly $k=4$ heads is the probability of the or of each of these events $E_i$. If you flip a coin 10 times, it is not possible to have more than one of the $E_i$ events occur (e.g. both $E_1$ and $E_2$ can't be true if you flip 10 coins). In other words, each of these events $E_i$ is "mutually exclusive" and as such:

$$\begin{aligned}
	P(\text{exactly $k$ heads}) 
	&= P(E_1 \text{ or } E_2 \text{ or } \ldots \text{ or } E_N) \\
	 &= \sum_{i=1}^N P(E_i)
\end{aligned}$$

The next question is, what is the probability of each of these events $E_i$?

Here is an arbitrarily chosen ordering which satisfies the event of exactly $k=4$ heads in $n=10$ coin flips. It is $E_{128}$, the ordering on row 128 in the list above:

T, H, T, T, H, T, T, H, H, T

What is the probability of event $E_{128}$, the exact sequence of heads and tails in the example above? Each coin flip is still independent, so we multiply $p$ for each heads and $1−p$ for each tails.

$$\begin{aligned}
P(E_{128}) = (1-p) \cdot p \cdot (1-p) \cdot (1-p) \cdot p \cdot (1-p) \cdot (1-p) \cdot p \cdot p \cdot (1-p)
\end{aligned}$$

If you rearrange these multiplication terms you get:

$$\begin{aligned}
	P(E_{128}) &= p \cdot p \cdot p \cdot p \cdot (1-p) \cdot (1-p) \cdot (1-p) \cdot (1-p) \cdot (1-p) \cdot (1-p)\\
	&= p^4 \cdot (1-p)^{6}
\end{aligned}$$

There is nothing too special about row 128. If you chose any row, you would get $k$ independent heads and $n−k$ independent tails. For any row i:

$$\begin{aligned}
P(E_i)=p^k⋅(1−p)^{n−k}
\end{aligned}$$

Now we are ready to calculate the probability of exactly $k$ heads:

$$\begin{aligned}
P(\text{exactly $k$ heads}) 
	&= \sum_{i=1}^N P(E_i) && \text{Mutual Exclusion}\\
	&= \sum_{i=1}^N p^k \cdot (1-p)^{n-k} && \text{Sub in }P(E_i) \\
	&= N \cdot p^k \cdot (1-p)^{n-k} && \text{Sum $N$ times}  \\
	&= {n \choose k} \cdot p^k \cdot (1-p)^{n-k} && \text{Perm of indistinct objects} 
\end{aligned}$$

Let's bring that back to the example of getting exactly $k=4$ heads out of $n=10$ where the probability of getting a heads on any one flip is $p=0.6$. The probability of exactly $k$ heads is:

$$\begin{aligned}
P(\text{exactly $k$ heads}) 
&= {n \choose k} \cdot p^k \cdot (1-p)^{n-k} &&\text{Just derived!}\\
	&= {10 \choose 4} \cdot 0.6^4 \cdot (1-0.6)^{10-4} && \text{Sub in $n$, $k$, $p$} \\
	&= 210 \cdot 0.6^4 \cdot 0.4^6 && \text{Simplify} \\
	&= 0.111
\end{aligned}$$

Here is what that equation looks like for different values of $k$. You can also edit the values of $n$ and $p$.

We are done! This result is truly useful. Care about the probability of number of voters who vote for a candidate? Care about the number of people who get a disease? Care about the number of people who click on an ad? This derivation is the basis for all of those problems! Later in this course, in Part 2, we will formalize this incredible result into the Binomial Random Variable.


@@ many-flips-more-than-heads | 1.12 | More than $k$ heads | subsection | many_flips
There are many cases where you care about the probability of more than $k$ heads. We can derive a solution based on the formula for exactly $k$ heads.

If you want the probability of getting more than $k=4$ heads out of $n=10$ coin flips it is the probability of the or of each of the events where you get exactly $i$ heads for $i=5,6,7,8,9,10$. Note that all the events where you get exactly $i$ heads are mutually exclusive from the events where you get exactly $j$ heads when $i≠j$. For example if you flip a coin 10 times, it is not possible to get exactly 4 heads and to also get exactly 5 heads. As such the probability of or becomes addition:

$$\begin{aligned}
P&(\text{more than $k$ heads}) \\
	&= \sum_{i=k+1}^n P(\text{exactly $i$ heads}) && \text{Mutual Exclusion}\\
	&= \sum_{i=k+1}^n {n \choose i} \cdot p^i \cdot (1-p)^{n-i} && \text{Substitution}\\
\end{aligned}$$


@@ counting-intro | 1.13 | Intro | introduction | counting
Although you may have thought you had a pretty good grasp on the notion of counting at the age of three, it turns out that you had to wait until now to learn how to really count. Aren’t you glad you took this course now?!!! But seriously, counting is like the foundation of a house (where the house is all the great things we will do later in this course, such as machine learning). Houses are awesome. Foundations, on the other hand, are pretty much just concrete in a hole. But don’t make a house without a foundation. It won’t turn out well.


@@ counting-counting-with-steps | 1.13 | Counting with Steps | subsection | counting
> Definition: Step Rule of Counting (aka Product Rule of Counting)

If an experiment has two steps, where the first step can result in one of $m$ outcomes and the second step can result in one of $n$ outcomes regardless of the outcome of the first part, then the total number of outcomes for the experiment is $m⋅n$.

@endcard

Rewritten using set notation, the Step Rule of Counting states that if an experiment with two parts has an outcome from set $A$ in the first part, where $|A|=m$, and an outcome from set $B$ in the second part (where the number of outcomes in $B$ is the same regardless of the outcome of the first part), where $|B|=n$, then the total number of outcomes of the experiment is $|A||B|=m⋅n$.

> Simple Example: Hashing Buckets

Consider a hash table with 100 buckets. Two arbitrary strings are independently hashed and added to the table. How many possible ways are there for the strings to be stored in the table? Each string can be hashed to one of 100 buckets. Since the results of hashing the first string do not impact the hash of the second, there are 100 * 100 = 10,000 ways that the two strings may be stored in the hash table.

@endcard

The step rule scales nicely if there are many parts to an experiment:

> Definition: Step Rule of Counting with Many Steps

If an experiment has $k$ parts, where the first step has $n_1$ outcomes and the $i$th step has $n_i$ outcomes (regardless of the result of any earlier steps), then the total number of outcomes of the experiment is:

$$\begin{aligned}
\text{Number of Outcomes} = \prod_{i=1}^k n_i
\end{aligned}$$

@endcard

Peter Norvig, the author of the canonical textbook "Artificial Intelligence", made the following compelling point on why computer scientists need to know how to count. To start, let's set a baseline for a really big number: The number of atoms in the observable universe, often estimated to be around 10 to the 80th power ($10^{80}$). There certainly are a lot of atoms in the universe. As a leading expert said,

“Space is big. Really big. You just won’t believe how vastly, hugely, mind-bogglingly big it is. I mean, you may think it’s a long way down the road to the chemist, but that’s just peanuts to space.” - Douglas Adams

This number is often used to demonstrate tasks that computers will never be able to solve. Problems can quickly grow to an absurd size, and we can understand why using the Step Rule of Counting.

There is an art project to display every possible picture. Surely that would take a long time, because there must be many possible pictures. But how many? We will assume the color model known as True Color, in which each pixel can be one of $2^{24}$ ≈ 17 million distinct colors.

How many distinct pictures can you generate from (a) a smartphone camera shown with 12 million pixels, (b) a grid with 300 pixels, and (c) a grid with just 12 pixels?

@figure 7eb92d05-0b62-443d-ab93-424c28bc4e7d | Three images of decreasing resolution: (a) a camera with 12 million pixels, (b) a grid of 300 coloured pixels, and (c) a grid of 12 coloured pixels.

Answer: We can use the step rule of counting. An image can be created one pixel at a time, step by step. Each time we choose a pixel you can select its color out of 17 million choices. An array of n pixels produces (17 million)$^n$ different pictures. (17 million)$^{12}$ ≈ $10^{86}$, so the tiny 12-pixel grid produces a million times more pictures than the number of atoms in the universe! How about the 300 pixel array? It can produce $10^{2167}$ pictures. You may think the number of atoms in the universe is big, but that’s just peanuts to the number of pictures in a 300-pixel array. And 12M pixels? $10^{86696638}$ pictures.

> Example: Unique states of Go

A Go board has 19 × 19 points where a user can place a stone. Each of the points can be empty or occupied by black or white stone. By the Step Rule of Counting, we can compute the number of unique board configurations.

@figure dcc0d47c-e49f-4df6-8c7c-023149e1d434 | A Go board in play, each point empty or holding a black or a white stone.

In Go there are 19x19 points. Each point can have a black stone, white stone, or no stone at all.

Here we are going to construct the board one point at a time, step by step. Each time we add a point we have a unique choice where we can decide to make the point one of three options: {Black, White, No Stone}. Using this construction we can apply the Step Rule of Counting. If there was only one point, there would be three unique board configurations. If there were four points you would have 3⋅3⋅3⋅$3=81$ unique combinations. In Go there are $3^{(19×19)} \approx 10^{172}$ possible board positions. The way we constructed our board didn't take into account which ones were illegal by the rules of Go. It turns out that "only" about $10^{170}$ of those positions are legal. That is about the square of the number of atoms in the universe. In other words: to match the number of Go board configurations, you’d need one universe of atoms for each atom in our universe.

As a computer scientist this sort of result can be very important. While computers are powerful, an algorithm which needed to store each configuration of the board would not be a reasonable approach. No computer can store more information than atoms in the universe squared!

@endcard


@@ counting-counting-with-or | 1.13 | Counting with Or | subsection | counting
If you want to consider the total number of unique outcomes, when outcomes can come from two or more sources (for example source $A$ or source $B$), then the equation you use depends on whether or not there exists outcomes which are in both $A$ and $B$. If not, you can use the simpler "Mutually Exclusive Counting" rule. Otherwise you need to use the slightly more involved Inclusion Exclusion rule. Formally, the or of two sets is called the union.


@@ counting-counting-with-or-the-mutually-exclusive-case | 1.13 | Counting with Or, the Mutually Exclusive Case | subsection | counting
> Definition: Counting the "or" of two sets, Mutually Exclusive case.

If the outcome of an experiment can either be drawn from set $A$ or set $B$, where none of the outcomes in set $A$ are the same as any of the outcomes in set $B$ (called mutual exclusion), then:

$$\begin{aligned}
&\text{Number of outcomes}\\
&=|A \text{ or } B|\\
&=|A|+|B|
\end{aligned}$$

@endcard

> Example: Routes from Nairobi to Dar Es Salaam

A route finding algorithm needs to find routes from Nairobi to Dar Es Salaam. It finds routes that either pass through Mt Kilimanjaro or Mombasa. There are 20 routes that pass through Mt Kilimanjaro, 15 routes that pass through Mombasa and 0 routes which pass through both Mt Kilimanjaro and Mombasa. How many routes are there total?

Solution: Routes can come from either Mt Kilimanjaro or Mombasa. The two sets of routes are mutually exclusive as there are zero routes which are in both groups. As such the total number of routes is addition: 20 + 15 = 35.

@endcard

If you can show that two groups are mutually exclusive counting becomes simple addition. Of course not all sets are mutually exclusive. In the example above, imagine there had been a single route which went through both Mt Kilimanjaro and Mombasa. We would have double counted that route because it would be included in both the sets. If sets are not mutually exclusive, counting the or is still addition, we simply need to take into account any double counting.

If you have more than two sets, and they are all mutually exclusive (no one outcome is in more than one set) then this rule will generalize:

> Definition: Counting the "or" of many sets, Mutually Exclusive case.

If the outcome of an experiment can come from set $S_1$ or $S_2$ or $\cdots$ or $S_n$ and there is no outcome which is in more than one set (in other words, the sets are mutually exclusive), then:

$$\begin{aligned}
&\text{Number of outcomes}\\
&=|S_1 \text{ or } S_2 \text{ or } \cdots \text{ or } S_n|\\
&=\sum_{i=1}^n |S_i|
\end{aligned}$$

@endcard


@@ counting-counting-with-or-the-general-case | 1.13 | Counting with Or, the General Case | subsection | counting
If you want to count using the "or" of different sets of outcomes, but the sets are not mutually exclusive, you will need to use the more complicated general case which is called Inclusion-Exclusion:

> Definition: Counting the "or" of two sets, Inclusion-Exclusion Case

If the outcome of an experiment can either be drawn from set $A$ or set $B$, and sets $A$ and $B$ may potentially overlap (i.e., it is not the case that $A$ and $B$ are mutually exclusive), then the number of outcomes of the experiment is:

$$\begin{aligned}
&\text{Number of outcomes} \\
&= |A \text{ or } B|\\
&=|A|+|B|−|A \text{ and } B|
\end{aligned}$$

@endcard

If you have more than two sets, and they are not mutually exclusive, the equation gets substantially more complex. If there are three sets, the inclusion exclusion rule is:

@interactive counting-1

To calculate the size of union (aka counting with or), of three sets you: (1) add the size of each set on their own. (2) Then you need to subtract off the size of the intersection (aka the and) of every possible pair of sets. (3) Finally, you add in the count of elements in all three sets.

If there are more than three sets the general rule of Inclusion-Exclusion gets even more complex. If you change the number of sets in the equation above you can explore how the formula expands. As a rule of thumb, if you find yourself needing to use this Inclusion-Exclusion rule when you have more than three sets, it might be a sign that you want to look for another approach to solve your problem.


@@ combinatorics-intro | 1.14 | Intro | introduction | combinatorics
Counting problems can be approached from the basic building blocks described in the first section: Counting. However some counting problems are so ubiquitous in the world of probability that it is worth knowing a few higher level counting abstractions. When solving problems, if you can find the analogy from these canonical examples you can build off of the corresponding combinatorics formulas:

- Permutations of Distinct Objects
- Permutations with Indistinct Objects
- Combinations with Distinct Objects
- Bucketing with Distinct Objects

While these are by no means the only common counting paradigms, it is a helpful set.


@@ combinatorics-permutations-of-distinct-objects | 1.14 | Permutations of Distinct Objects | subsection | combinatorics
> Definition: Permutation rule

A permutation is an ordered arrangement of $n$ distinct objects. The number of ways those $n$ objects can be permuted is:

$$\begin{aligned}
\text{Total ways} 
&= n \cdot (n - 1) \cdot (n - 2) \cdots 1 \\
&= n!
\end{aligned}$$

@endcard

This changes slightly if you are permuting a subset of distinct objects, or if some of your objects are indistinct. We will handle those cases shortly! Note that unique is a synonym for distinct.

> Example: How many unique orderings of characters are possible for the string “BAYES”?

Solution: Since the order of characters is important, we are considering all permutations of the 5 distinct characters B, A, Y, E, and S: $5!$ = 120. Here is the full list:

BAYES, BAYSE, BAEYS, BAESY, BASYE, BASEY, BYAES, BYASE, BYEAS, BYESA, BYSAE, BYSEA, BEAYS, BEASY, BEYAS, BEYSA, BESAY, BESYA, BSAYE, BSAEY, BSYAE, BSYEA, BSEAY, BSEYA, ABYES, ABYSE, ABEYS, ABESY, ABSYE, ABSEY, AYBES, AYBSE, AYEBS, AYESB, AYSBE, AYSEB, AEBYS, AEBSY, AEYBS, AEYSB, AESBY, AESYB, ASBYE, ASBEY, ASYBE, ASYEB, ASEBY, ASEYB, YBAES, YBASE, YBEAS, YBESA, YBSAE, YBSEA, YABES, YABSE, YAEBS, YAESB, YASBE, YASEB, YEBAS, YEBSA, YEABS, YEASB, YESBA, YESAB, YSBAE, YSBEA, YSABE, YSAEB, YSEBA, YSEAB, EBAYS, EBASY, EBYAS, EBYSA, EBSAY, EBSYA, EABYS, EABSY, EAYBS, EAYSB, EASBY, EASYB, EYBAS, EYBSA, EYABS, EYASB, EYSBA, EYSAB, ESBAY, ESBYA, ESABY, ESAYB, ESYBA, ESYAB, SBAYE, SBAEY, SBYAE, SBYEA, SBEAY, SBEYA, SABYE, SABEY, SAYBE, SAYEB, SAEBY, SAEYB, SYBAE, SYBEA, SYABE, SYAEB, SYEBA, SYEAB, SEBAY, SEBYA, SEABY, SEAYB, SEYBA, SEYAB

@endcard

> Example: A passcode with 4 smudges

a smartphone has a 4-digit passcode. Suppose there are 4 smudges over 4 digits on the screen. How many distinct passcodes are possible?

Solution: Since the order of digits in the code is important, we should use permutations. And since there are exactly four smudges we know that each number in the passcode is distinct. Thus, we can plug in the permutation formula: $4!$ = 24.

@endcard


@@ combinatorics-permutations-of-indistinct-objects | 1.14 | Permutations of Indistinct Objects | subsection | combinatorics
> Definition: Permutations of Indistinct Objects

Generally when there are $n$ objects and:

$n_1$ are the same (indistinguishable) and

$n_2$ are the same and

...

$n_r$ are the same, then the number of distinct permutations is:

$$\begin{aligned}
\text{Total} = \frac{n!}{n_1!n_2!\cdots n_r!}
\end{aligned}$$

@endcard

> Example: How many distinct bit strings can be formed from three 0’s and two 1’s?

Solution: 5 total digits would give 5! permutations. But that is assuming the 0’s and 1’s are distinguishable (to make that explicit, let’s give each one a subscript). Here are the $3! \cdot 2!$ = 12 different ways that we could have arrived at the identical string “01100” if we thought of each 0 and 1 as unique.

| 0 | 1 | 1 | 0 | 0 |
|---|---|---|---|---|
| $0_1$ | $1_1$ | $1_2$ | $0_2$ | $0_3$ |
| $0_1$ | $1_1$ | $1_2$ | $0_3$ | $0_2$ |
| $0_2$ | $1_1$ | $1_2$ | $0_1$ | $0_3$ |
| $0_2$ | $1_1$ | $1_2$ | $0_3$ | $0_1$ |
| $0_3$ | $1_1$ | $1_2$ | $0_1$ | $0_2$ |
| $0_3$ | $1_1$ | $1_2$ | $0_2$ | $0_1$ |
| $0_1$ | $1_2$ | $1_1$ | $0_2$ | $0_3$ |
| $0_1$ | $1_2$ | $1_1$ | $0_3$ | $0_2$ |
| $0_2$ | $1_2$ | $1_1$ | $0_1$ | $0_3$ |
| $0_2$ | $1_2$ | $1_1$ | $0_3$ | $0_1$ |
| $0_3$ | $1_2$ | $1_1$ | $0_1$ | $0_2$ |
| $0_3$ | $1_2$ | $1_1$ | $0_2$ | $0_1$ |

Since identical digits are indistinguishable, all the listed permutations are the same. For any given
permutation, there are 3! ways of rearranging the 0’s and 2! ways of rearranging the 1’s (resulting in
indistinguishable strings). We have over-counted. Using the formula for permutations of indistinct
objects, we can correct for the over-counting:

$$\begin{aligned}
\text{Total} = \frac{5!}{3! \cdot 2!} = \frac{120}{6 \cdot 2} = 10
\end{aligned}$$

@endcard

> Example: Orderings of MISSISSIPPI

How many distinct orderings of characters are possible for the string “MISSISSIPPI”?

Solution: In the case of the string "MISSISSIPPI", we should separate the characters into four distinct groups of indistinct characters: one "M", four "I"s, four "S"s, and two "P"s. The number of distinct orderings are:

$$\begin{aligned}
\frac{11!}{1!4!4!2!} = 34,650
\end{aligned}$$

@endcard

> Example: A passcode with 3 smudges

Consider the 4-digit passcode smart-phone from before. How many distinct passcodes are possible if there are 3 smudges over 3 digits on the screen?

Solution: One of 3 digits is repeated, but we don't know which one. We can solve this by making three cases, one for each digit that could be repeated (each with the same number of permutations). Let $A, B, C$ represent the 3 digits, with $C$ repeated twice. We can initially pretend the two $C$’s are distinct $[A,B,C₁,C₂]$. Then each case will have 4! permutations: However, then we need to eliminate the double-counting of the permutations of the identical digits (one $A$, one $B$, and two $C$’s): 

$$\begin{aligned}
\frac{4!}{2!\cdot 1!\cdot 1!}
\end{aligned}$$

Adding up the three cases for the different repeated digits gives

$$\begin{aligned}
3 \cdot \frac{4!}{2!\cdot 1!\cdot 1!} = 3 \cdot 12 = 36
\end{aligned}$$

Part B: What if there are 2 smudges over 2 digits on the screen?

Solution: There are two possibilities: 2 digits used twice each, or 1 digit used 3 times, and other digit used once.

$$\begin{aligned}
\frac{4!}{2!\cdot 2!} + 2 \cdot \frac{4!}{3!\cdot 1!} = 6 + (2 \cdot 4) = 6 + 8 = 14
\end{aligned}$$

@endcard

You can use the power of computers to enumerate all permutations. Here is sample python code which uses the built in itertools library:

```python
import itertools

# get all 4! = 24 permutations of 1,2,3,4 as a list:
list(itertools.permutations([1,2,3,4]))
# [(1, 2, 3, 4), (1, 2, 4, 3), (1, 3, 2, 4), (1, 3, 4, 2), (1, 4, 2, 3), (1, 4, 3, 2), (2, 1, 3, 4), (2, 1, 4, 3), (2, 3, 1, 4), (2, 3, 4, 1), (2, 4, 1, 3), (2, 4, 3, 1), (3, 1, 2, 4), (3, 1, 4, 2), (3, 2, 1, 4), (3, 2, 4, 1), (3, 4, 1, 2), (3, 4, 2, 1), (4, 1, 2, 3), (4, 1, 3, 2), (4, 2, 1, 3), (4, 2, 3, 1), (4, 3, 1, 2), (4, 3, 2, 1)]

# get all 3!/2! = 3 unique permutations of 1,1,2 as a set:
set(itertools.permutations([1,1,2]))
# {(1, 1, 2), (1, 2, 1), (2, 1, 1)}
```


@@ combinatorics-combinations-of-distinct-objects | 1.14 | Combinations of Distinct Objects | subsection | combinatorics
> Definition: Combinations

A combination is an unordered selection of r objects from a set of n objects. If all objects
are distinct, and objects are not “replaced” once selected, then the number of ways of making the selection is:

$$\begin{aligned}
&= \frac{n!}{r!(n-r)!} \\&= {n \choose r}
\end{aligned}$$

Notice the new notation, $n \choose r$. That expression is read as "n choose r" and it is defined to be $\frac{n!}{r!(n-r)!}$.

@endcard

Here are all the 10 = ${5 \choose 3}$ ways of choosing three items from a list of 5 unique numbers:

```python
# Get all ways of choosing three numbers from [1,2,3,4,5]
list(itertools.combinations([1,2,3,4,5], 3))
# [(1, 2, 3), (1, 2, 4), (1, 2, 5), (1, 3, 4), (1, 3, 5), (1, 4, 5), (2, 3, 4), (2, 3, 5), (2, 4, 5), (3, 4, 5)]
```

Notice how order doesn't matter. Since (1, 2, 3) is in the set of combinations, we don't also include (3, 2, 1) as this is considered to be the same selection. Note that this formula does not work if some of the objects are indistinct from one another.

How did we get the formula $\frac{n!}{r!(n-r)!}$? Consider this general way to select r unordered objects from a set of $n$ objects, e.g., “7 choose 3”:

- First consider permutations of all $n$ objects. There are $n!$ ways to do that.
- Then select the first $r$ in the permutation. There is one way to do that.
- Note that the order of $r$ selected objects is irrelevant. There are $r!$ ways to permute them. The selection remains unchanged.
- Note that the order of $(n − r)$ unselected objects is irrelevant. There are $(n − r)!$ ways to permute them. The selection remains unchanged.

$$\begin{aligned}
\text{Total} = \frac{n!}{r! \cdot (n-r)!} = {n \choose r}
\end{aligned}$$

> Example: Choosing 2 villagers from 8,000

In the Hunger Games, how many ways are there of choosing 2 villagers from a district which has a population of 8,000?

Solution: This is a straightforward combinations problem. All the people are distinct and the order of the two chosen villagers doesn't matter: ${8000 \choose 2}$ = 31,996,000.

@endcard

> Example: Part A: How many ways are there to select 3 books from a set of 6?

Solution: If each of the books are distinct, then this is another straightforward combination problem. There are $\binom{6}{3} = \frac{6!}{3!3!} = 20$ ways.

Part B: How many ways are there to select 3 books if there are two books that should not both be chosen together? For example, if you are choosing 3 out of 6 probability books, don't choose both the 8th and 9th edition of the Ross textbook.

Solution: This problem is easier to solve if we split it up into cases. Consider the following three different cases:

Case 1: Select the 8th Ed. and 2 other non-9th Ed. books: There are $\binom{4}{2}$ ways of doing so.

Case 2: Select the 9th Ed. and 2 other non-8th Ed. books: There are $\binom{4}{2}$ ways of doing so.

Case 3: Select 3 books from the 4 remaining books that are neither the 8th nor the 9th edition: There are $\binom{4}{3}$ ways of doing so.

Using our old friend the Sum Rule of Counting, we can add the cases:

$$\begin{aligned}
\text{Total} = 2 \cdot \binom{4}{2} + \binom{4}{3} = 16
\end{aligned}$$

Alternatively, we could have calculated all the ways of selecting 3 books from 6, and then subtract the "forbidden" ones (i.e., the selections that break the constraint).

Forbidden Case: Select 8th edition and 9th edition and 1 other book. There are $\binom{4}{1}$ ways of doing so (which equals 4).

$$\begin{aligned}
\text{Total}
&= \text{all\_ways\_to\_choose\_3} - \text{forbidden} \\
&= {6 \choose 3} - {4 \choose 1} \\
&= 20 - 4 \\
&= 16
\end{aligned}$$

Two different ways to get the same right answer!

@endcard


@@ combinatorics-bucketing-with-distinct-objects | 1.14 | Bucketing with Distinct Objects | subsection | combinatorics
In this section we are going to be counting the many different ways that we can think of stuffing elements into containers. (It turns out that Jacob Bernoulli was into voting and ancient Rome. And in ancient Rome they used urns for ballot boxes. For this reason many books introduce this through counting ways to put balls in urns.) This “bucketing” or “group assignment” process is a useful metaphor for many counting problems.

The most common case that we will want to consider is when all of the items you are putting into buckets are distinct. In that case you can think of bucketing as a series of steps, and employ the step rule of counting. The first step? You put the first distinct item into a bucket (there are number-of-buckets ways to do this). Second step? You put the second distinct item into a bucket (again, there are number-of-buckets ways to do this).

> Definition: Bucketing of Distinct Items

Suppose you want to place $n$ distinguishable items into $r$ containers. The ways of doing so is:

$$\begin{aligned}
r^n
\end{aligned}$$

This can be derived using the step rule of counting. In each step we will place one of our items into the $r$ containers. There are $n$ steps and for each step there are $r$ outcomes. As such the total number of ways to place $n$ distinct items in $r$ buckets is $r \cdot r \cdots r$, where $r$ is multiplied by itself $n$ times: $r^n$

@endcard

> Example: 10 distinct strings into 5 buckets

Say you want to put 10 distinguishable balls into 5 urns (No! Wait! Don't say that! Not urns!). Okay, fine. No urns. Say we are going to put 10 different strings into 5 buckets of a hash table. How many possible ways are there of doing this?

Solution: You can think of this as 10 independent experiments each with 5 outcomes. Using our rule for bucketing with distinct items, this comes out to $5^{10}$.

@endcard


@@ bacteria-evolution | 1.15 | Bacteria Evolution | section | bacteria_evolution
A wonderful property of modern life is that we have anti-biotics to kill bacterial infections. However, we only have a fixed number of anti-biotic medicines, and bacteria are evolving to become resistant to our anti-biotics. In this example we are going to use probability to understand evolution of anti-biotic resistence in bacteria.

Imagine you have a population of 1 million infectious bacteria in your gut, 10% of which have a mutation that makes them slightly more resistant to anti-biotics. You take a course of anti-biotics. The probability that bacteria with the mutation survives is 20%. The probability that bacteria without the mutation survives is 1%.

What is the probability that a randomly chosen bacterium survives the anti-biotics?

> Solution: Probability of survival

Let E be the event that our bacterium survives. Let M be the event that a bacteria has the mutation. By the Law of Total Probability (LOTP):

$$\begin{aligned}
	P(E) 
		&= P(E \text{ and } M) + P(E \text{ and } M^C)
			&& \text{LOTP} \\ 
		&= P(E | M)P(M) + P(E | M^C)P(M^C)
			&& \text{Chain Rule} \\ 	
		&= 0.20 \cdot 0.10 + 0.01 \cdot 0.90 
			&& \text{Substituting} \\ 
		&= 0.029
\end{aligned}$$

@endcard

What is the probability that a surviving bacterium has the mutation?

> Solution: Probability of the mutation given survival

Using the same events in the last section, this question is asking for P(M|E). We aren't giving the conditional probability in that direction, instead we know P(E|M). Such situations call for Bayes' Theorem:

$$\begin{aligned}
	P(M | E) 
		&=  \frac{P(E|M)P(M)}{P(E)} 
			&& \text{Bayes} \\
		&=  \frac{0.20 \cdot 0.10}{P(E)} 
			&& \text{Given} \\
		&=  \frac{0.20 \cdot 0.10}{0.029} 
			&& \text{Calculated} \\
		&\approx  0.69
	\end{aligned}$$

@endcard

After the course of anti-biotics, 69% of bacteria have the mutation, up from 10% before. If this population is allowed to reproduce you will have a much more resistant set of bacteria!


@@ pr-rain-city | 1.15 | Google Rain Prediction | section | pr_rain_city
Weather prediction services, such as the Google Weather "nowcast" will give you predictions for events such as "it rains tomorrow in San Francisco":

@figure 942fa218-d6d6-44b2-83ee-c9dcafa9f0c8 | A weather search result for San Francisco, with "Precipitation: 90%" and "Rain showers" circled.

A Google Weather prediction showing 90% chance of rain in San Francisco

But San Francisco is so large! And the weather can be so different depending on where you are!

The task of prediction the probability that "it rains tomorrow in San Francisco" is complicated because the probability of rain is highly dependent on where you are in San Francisco (for those of you who haven't spent too much time there, the different neighborhoods have very different microclimates). For example, it could be very sunny in Mission District and very Rainy in the Presidio!

@figure 296ce579-d1fc-4e83-b4d5-e10bfc79c159 | A map of San Francisco with the temperature in each neighbourhood, varying by several degrees across the city.

For each district Google can compute the probability of rain tomorrow (based off the chance of its models of how weather systems will move across the city). Moreover, because of the number of people who use their other services (such as Android phones), Google has a very good estimate of how likely a person is to be in each district. Using the Law of Total Probability, Google can combine these values to get the overall probability of rain tomorrow for a randomly sampled location.

Let $R$ be the event that it rains tomorrow in San Francisco (for a randomly selected location)

Let $D_i$ be the selected location

Here is an example of the sort of data Google will have access to:

| | Mission District | Presidio | $\dots$ | SOMA |
|---|---|---|---|---|
| $P(R|D_i)$ | 0.23 | 0.84 | $\dots$ | 0.52 |
| $P(D_i)$ | 0.15 | 0.02 | $\dots$ | 0.24 |

The overall probability of rain in San Francisco can then be calculated as:

$$\begin{aligned}
P&(R) \\
&= \sum_{\text{district } i} P(R \text{ and } D_i) \\
&= \sum_{\text{district } i} P(R|D_i) \cdot P(D_i)
\end{aligned}$$

In this example we only considered the law of total probability around the background event of location. In practice, Google Weather also uses time of day as a background event when giving a statement on the probability of rain tomorrow in San Francisco.


@@ random-walks | 1.15 | Random Walks | section | random_walks
Random walks are a common algorithm for traversing graphs. As a starting point, we'll examine how they behave for a simple example graph structure.

@figure 020047bf-7caa-46ae-acff-18a1f35a8b54 | A number line from -2 to 2, with a walker standing at the start position 0.

Consider the following algorithm for traversing a number line, like the one shown above:

> Random Walk Algorithm (for a number line)

- Start at position 0.
- For $n$ iterations: flip a coin with probability $p$ of getting heads. If you get heads, go right 1 unit; otherwise, go left.

@endcard

We would like to reason about the possible positions on the number line that we end up at after $n$ iterations. Let's start with the case $n = 2$. The possible end positions and moves that lead to them are:

| End position | Moves |
|---|---|
| $-2$ | (Left, Left) |
| $0$ | (Left, Right) or (Right, Left) |
| $2$ | (Right, Right) |

Note that we will only end up at even-numbered positions if we take an even number of steps.

Since each iteration of the algorithm is independent, we can multiply the probabilities of each individual move in a series of moves. This gives us $P(\text{End at 2}) = p^2$ and $P(\text{End at }-2) = (1-p)^2$.

To find the probability of ending at 0, we must consider both of the mutually exclusive paths back to 0:

$$\begin{aligned}
    P(\text{End at }0) &= P(\text{(Left, Right) or (Right, Left)}) \\
              &= P(\text{Left, Right}) + P(\text{Right, Left}) \\
              &= (1-p)p + p(1-p) = 2p(1-p)
\end{aligned}$$

A common pitfall is to only account for one of the two possible paths back to 0 and conclude $P(\text{End at }0) = p(1-p)$ instead. You can verify $2p(1-p)$ is correct by checking that the probabilities of all possible outcomes sum to 1.

There's an analogy here to flipping a coin twice and counting the number of heads. If the coin has probability $p$ of landing on heads, then $P(2\text{ heads}) = p^2$, $P(0 \text{ heads}) = (1 - p)^2$, and $P(1 \text{ head}) = 2p(1-p)$, which are the same probabilities as above.

Now, let's scale up: what if $n = 10$? Then the possible end positions are the even numbers from $-10$ to 10. Only one series of moves ends at position 10 (going right all 10 iterations) or position -10 (left all 10 iterations), but all other outcomes are composed of multiple paths.

For example, to land on position 2 after 10 iterations means the random walk must have gone right exactly 6 times and left exactly 4 times (we had to go right two more times than we went left). Here are all the possible series of moves that satisfy this:

@interactive random-walks-2

Each of these paths have probability $p^6(1-p)^4$. It would be the same pitfall again to say $P(\text{End at }2)$ is the probability of just one path, though; instead, we want to sum this probability as many times as there are mutually exclusive paths to this position, or equivalently, count the possible paths and then multiply that count by $p^6(1-p)^4$. The number of ways can we go right 6 times and left 4 times is the same as choosing 6 out of 10 total steps to be the steps where we go right, or $\binom{10}{6}$. Thus:

$$\begin{aligned}
 P(\text{End at }2) = \binom{10}{6}p^6(1-p)^4
\end{aligned}$$

If that expression looks familiar, that's because we derived it in Many Coin Flips! If we flip a coin 10 times with probability $p$ of heads each flip, then $P(6\text{ heads}) = \binom{10}{6}p^6(1-p)^4$. More explicitly, the number of moves to the right in an $n$-step random walk along a number line is described by the same probabilities as the number of heads seen in $n$ coin flips. The idea that both scenarios can be described by the same probabilities is formalized once we recognize that both are instances of the Binomial.

### DNA Mutations

Now let's look at a more complex graph to analyze a problem about DNA sequence mutations.

> Problem: DNA mutations

A species of bacteria is rapidly multiplying inside a dish. Each time a bacterium clones itself, it copies its DNA sequence (a very long ordered list made up of the letters A, C, G, and T). DNA copying is an error-prone process, so mutations sometimes occur -- i.e., at a certain position in the DNA sequence, the letter A changes to, say, a C. Each time a mutation occurs, the original letter changes to one of the three other letters with equal likelihood.

Assume that before any mutations occur, there is an A at a particular position in the DNA sequence. What is the probability that after $n$ mutations, there is an A at this position again?

@endcard

This problem might not sound like it's about a random walk at first, but it can be represented as one!

@interactive random-walks-3

The graph above shows the four DNA letters as four nodes, and the allowed "moves" or mutations as edges connecting the nodes. For example, the line from A to T allows mutations from A to T or from T to A. Our graph is fully connected because any letter can mutate to any other letter -- but not to themselves (by definition, the letter must change when a mutation occurs). We also know from the problem that all possible moves on this graph are equally likely.

With the problem scenario represented as this graph, we can re-frame the event of "mutating from A back to A after $n$ mutations" as the event that we start at node A on the graph, perform an $n$-step random walk, and find ourselves back at node A.

As you might guess, random walks on this graph is more complicated to analyze than the earlier number line example! But we can still start using the same tactic that works in so many probability problems, enumerating all the possible outcomes to get some intuition:

@interactive random-walks-4

### Simplest Case: Two Mutations

Let $N_i$ be the event that the $i$th letter in the random walk mutation sequence is $N$ ($N$ could be A, C, G, or T). For example, the first outcome listed above when $n = 2$ shows $A_0,C_1,A_2$. For $n = 2$, then, we want to find $P(A_2|A_0)$, given that we know the start (0th) letter is A.

Since each random walk sequence above is unique, these outcomes are mutually exclusive. If an event can be broken down into a set of mutually exclusive outcomes, then Probability of Or tells us the probability of the event is the sum of the probabilities of all the individual outcomes. So, what is the probability of a single outcome?

Let's take $A_0,C_1,A_2$ as an example. Since $P(A_0) = 1$, we are interested in $P(C_1,A_2|A_0)$. Using the Chain Rule with consistent conditioning on $A_0$:

$$\begin{aligned}
    P(C_1,A_2|A_0) &= P(C_1 | A_0) P(A_2 | A_0,C_1)
\end{aligned}$$

Note that whenever we use the Chain Rule, we get to decide in what order we "chain" the events; in this case, it's key to follow chronological order.

Next, let's observe that if a mutation always changes the letter (no consecutive repeat letters are allowed), and the three possible new letters are equally likely, then the probability of mutating to any specific different letter is 1/3. Formally, for $i > 0$:

$$\begin{aligned}
    P(A_i|C_{i-1}) = P(A_i|G_{i-1}) = P(A_i|T_{i-1}) = P(C_i|A_{i-1}) = P(C_i|G_{i-1}) = \dots = P(T_i|G_{i-1}) = \frac{1}{3}
\end{aligned}$$

$$\begin{aligned}
P(A_i|A_{i-1}) = P(C_i|C_{i-1}) = P(G_i|G_{i-1}) = P(T_i|T_{i-1}) = 0
\end{aligned}$$

This gives us a value for $P(C_1|A_0)$ in the Chain Rule above, but not $P(A_2|A_0,C_1)$. How can we reason about this term? We can recognize a case of Conditional Independence!

If we know that $C_1$ happened, does it matter that the starting letter was A for determining what the next mutation could be? No, our probability of mutating from $C_1$ to $A_2$ is unchanged by what letter came before $C_1$. Formally, we can say that $N_{i+2}$ is independent of $N_{i}$, conditioned on $N_{i+1}$. This means $P(A_2|A_0,C_1) = P(A_2|C_1)$. (They are not independent without conditioning on $C_1$, though! We verify this shortly when we find $P(A_2|A_0) \neq P(A_2|C_0)$: after two mutations, we're more likely to be back at the letter we started with than a different letter.) Thanks to Conditional Independence,

$$\begin{aligned}
P(C_1,A_2|A_0) =P(C_1 | A_0) P(A_2 | C_1) = \frac{1}{3} \cdot \frac{1}{3} = \frac{1}{9}
\end{aligned}$$

The same approach gives us that the probability of any outcome listed above for $n = 2$ is also $\frac{1}{9}$.

So, back to Probability of Or: $P(A_2 | A_0)$ is $\frac{1}{9}$ times the number of $A_0$-conditioned outcomes where $A_2$ happens. For $n = 2$, we can count 3 outcomes, corresponding to the three options of C, G, or T for the first mutation, and that gives us:

$$\begin{aligned}
    P(A_2|A_0) = 3 \cdot \frac{1}{9} = \frac{1}{3}
\end{aligned}$$

Interestingly, if we try this approach for $P(C_2|A_0)$, $P(G_2|A_0)$, $P(A_2|C_0)$, or any other two-mutation outcome with different start vs. end letters, we get $\frac{2}{9}$ instead of $\frac{1}{3}$. The difference arises from the step where we count outcomes that end with a particular letter. For example, there are only two valid outcomes where $C_2|A_0$ -- $A_0,G_1,C_2$ and $A_0,T_1, C_2$ -- because there are only two bases left that aren't A or C to choose as the middle letter.

This line of reasoning is parallel with another approach to this problem: pure counting. For $n = 2$ and given $A_0$, $|S| = 3 \cdot 3 = 9$ if we have 3 letter options for each of two mutation-steps, and counting $|E|$ is equivalent to our outcome-count above. When we found that any outcome had probability $\frac{1}{9}$, we proved equally likely outcomes, which is necessary for $P(E) = \frac{|E|}{|S|}$.

Either strategy for solving this problem faces the same challenge of increasing difficulty as $n$ grows: counting the size of the event space.

### Scaling Up To Larger $n$

Let's try to generalize our findings for $n = 2$ by seeing what changes when $n = 3$.

First, we'll choose an example outcome to find the probability of: $A_0,C_1,G_2,A_3$. Via the Chain Rule:

$$\begin{aligned}
    P(C_1,G_2,A_3|A_0) &= P(C_1|A_0) P(G_2|A_0,C_1) P(A_3|A_0,C_1,G_2) \\
                        &= P(C_1|A_0) P(G_2|C_1) P(A_3|G_2) \\
                        &= \left( \frac{1}{3} \right)^3 = \frac{1}{27}
\end{aligned}$$

Conditional Independence simplifies the Chain Rule again, so each term is still $\frac{1}{3}$. This suggests an inductive pattern: the probability of any single outcome, when all the outcomes start on one specific letter, is $\frac{1}{3^n}$ for any positive integer $n$.

Using the pure-counting approach instead, we could similarly find the size of the sample space to be $3^n$.

In either approach, where things get interesting is counting the size of the event space. Think through the constraints implied if the start and end letter are both A, and letters can't repeat consecutively -- it isn't possible for either of the intermediate letters in length-4 mutation sequences to be A, but they also have to be distinct. We have 3 choices for the first mutation and 2 choices for the second, so $|E| = 6$, giving us a total probability of $\frac{6}{27} = \frac{2}{9}$.

As an aside, it's neat how this is the same as the probability of $P(C_2|A_0)$, $P(G_2|A_0)$, or $P(T_2|A_0)$! To intuit why this is the case, you could ruminate on how the possible second-to-last mutations would relate to the probability of the final mutation being an A. Using the Law of Total Probability:

$$\begin{aligned}
    P(A_3 | A_0) &= P(A_3|A_0,C_2) P(C_2|A_0) + P(A_3|A_0,G_2) P(G_2|A_0) + P(A_3|A_0,T_2) P(T_2|A_0) \\
                  &= P(A_3|C_2) P(C_2|A_0) + P(A_3|G_2) P(G_2|A_0) + P(A_3|T_2) P(T_2|A_0) \\
                  &= \frac{1}{3} P(C_2|A_0) + \frac{1}{3} P(G_2|A_0) + \frac{1}{3} P(T_2|A_0) \\
                  &= \frac{1}{3} \cdot 3 \cdot P(C_2|A_0) = P(C_2|A_0)
\end{aligned}$$

The later steps use the fact that $P(C_2|A_0) = P(G_2|A_0) = P(T_2|A_0)$. What this says is: there are three possible letters you could mutate from to end on A, and each of those letters has equal probability (1/3) of being the second-to-last mutation, and those two factors cancel out.

Putting that aside aside...can we generalize our event space count? Even looking at $n = 4$, it's not obvious how. For $n = 4$, we must consider two subgroups of outcomes with $A_4$: outcomes with $A_2$, and outcomes with $C_2$, $G_2$, or $T_2$ instead. Counting these two groups separately and then adding those counts together is necessary because $A_2$ determines the number of choices for $N_1$ and $N_3$.

In the case of $A_2$: there are 3 possible letters for $N_1$ and for $N_3$, so 9 outcomes overall.

In the case of not-$A_2$: we have 3 options for $N_1$, 2 options for $N_2$ and $N_3$ since they can each be any letter besides $A$ or the letter we chose previously.

Putting these counts together, $|E| = 9 + 3 \cdot 2 \cdot 2 = 21$. Using $|S| = 3^4$, $P(A_4|A_0) = \frac{21}{81}$.

For $n = 5$, we'd again have to consider subgroups in our event space count: outcomes with $A_2$, $A_3$, or no intermediate As...

### Other Approaches: Code

Brute-force enumeration via code is one hack to calculate these probabilities for higher $n$:

```python
def get_next_letter(letter, letters=["A", "C", "G", "T"]):
    # if "A", return "C"; if "C", return "G"; etc.
    try:
        return letters[letters.index(letter) + 1]
    except:
        # if here, we don't have a "next letter" (we're at T, the end)
        return False

def get_next_outcome(outcome):
    # recursive function for getting next possible mutation sequence
    # ex: ["A", "A"] returns ["A", "C"]
    #     ["C", "T"] returns ["G", "A"] (so the previous letter updates)
    
    next_letter = get_next_letter(outcome[-1])
    if next_letter:
        # if here, last letter was not T, so just increment last letter
        return outcome[:-1] + [next_letter]
    else:
        # if here, the last letter was T, so we need to update multiple
        # letters to make the next outcome (maybe do multiple recursions).
        # like how in binary, 01011 + 1 -> 01100 (digits 1-3 updated)
        next_outcome = get_next_outcome(outcome[:-1])
        
        # analogous to the new 0s in the binary example: when we update
        # multiple letters, we put As where there were Ts at the end
        return next_outcome + ["A"]

def any_consecutive_letters(outcome):
    # check if an outcome follows the rule that no letters repeat consecutively
    for i in range(len(outcome) - 1):
        if outcome[i] == outcome[i+1]:
            return True
    return False

def count_outcomes(n, start_letter="A", end_event="A"):
    sample_space = 0  # |E|
    event_space = 0   # |S|

    # loop through all possible n-length sequences, starting with "all As"
    outcome = [start_letter] + ["A"] * n
    while True:
        # end condition for get_next_outcome() iterating through all sequences
        if outcome[0] != start_letter:
            break

        if not any_consecutive_letters(outcome): # is this outcome even valid?
            sample_space += 1
            if outcome[-1] == end_event: # if end letter is what we're looking for
                event_space += 1

        outcome = get_next_outcome(outcome)

    return event_space / sample_space
```

### Other Approaches: Recursion

If we really wanted to avoid counting event spaces, though, we could return to that aside from earlier. Recall the Law of Total Probability tells us (generalizing here):

$$\begin{aligned}
P(A_i|A_0) = P(C_{i-1}|A_0) = P(G_{i-1}|A_0) = P(T_{i-1}|A_0) \\
\end{aligned}$$

We can make this even more useful by observing that the probability of getting any of the four letters at a particular iteration must be 1, according to the second Axiom of Probability.

$$\begin{aligned}
    P(A_{i-1} | A_0) + P(C_{i-1} | A_0) + P(G_{i-1} | A_0) + P(T_{i-1} | A_0) &= 1 \\
    P(A_{i-1} | A_0) + P(C_{i-1} | A_0) + P(C_{i-1} | A_0) + P(C_{i-1} | A_0) &= 1 \\
    P(A_{i-1} | A_0) + 3 P(C_{i-1} | A_0) &= 1 \\
    P(C_{i-1} | A_0) &= \frac{1}{3} (1 - P(A_{i-1} | A_0))
\end{aligned}$$

Putting these together, we arrive at the following recursive relationship, which can be used to find $P(A_i|A_0)$ for any $i > 2$:

$$\begin{aligned}
    P(A_i | A_0) = \frac{1}{3} (1 - P(A_{i-1} | A_0))
\end{aligned}$$

This page contributed by Kelly.


@@ binomial-diff-p | 1.15 | Binomial with Different Probs | section | binomial_diff_p
A binomial distribution is a remarkably useful way to model the world. Recall that it is a model of the number of heads on $n$ coin flips if each coin flip is independent, and the probability of a heads on each coin is the same: $p$.

In this section we are going to explore what to do if you break the second assumption, that each coin has the same probability of success. Instead let $p_i$ be the probability that the $i$th coin is a heads.

We are going to write a pseudo-code function binomial_diff_p(p_list, k) that calculates the exact probability of exactly $k$ successes in $n$ independent events if each event $i$ has a different probability of success, p_list[i]. You will be passed in the success probabilities as a list called p_list which is of length $n$.

```python
def binomial_diff_p(p_list, k):
    # TODO: our code here
```

We are going to solve this problem in code, not via equations, because the solution is more elegant when expressed in python.

### Example Scenario

Here is an example use of your function. The UK is competing in 5 winter Olympic events. Their probabilities of winning a medal in each event are [0.4, 0.6, 0.9, 0.2, 0.1] respectively. Their chance of winning exactly three medals is:

```python
binomial_diff_p(p_list = [0.4, 0.6, 0.9, 0.2, 0.1], k = 3)
```

We can't model the number of medals they win as a Binomial because the probability of a win is not the same in each event.

### Approach

This solution is modeled after the derivation in the Many Coin Flips example. In that derivation, the idea was to think of all the unique ways that a list of $n$ heads and tails could have exactly $k$ heads. For example recall the list of all the ways of getting exactly $k=4$ heads in $n=10$ coin flips:

@interactive binomial-diff-p-1

Each of these outcome rows are mutually exclusive, so the probability of exactly $k$ heads is simply the sum of the probability of each outcome row. In the Many Coin Flips example the math simplified nicely because the probability of each outcome row was exactly the same.

Our approach will be the same to the extent that we can compute the probability of exactly $k$ heads as the sum of mutually exclusive outcome rows, and we will have the same set of outcome rows. The difference is that each outcome row will have a different probability because a heads in one position is not necessarily the same probability as a heads in a different one.

### Solution

Here we first create all the outcome rows with a H for success (heads) and a T for not-success (tails). If $n=10$ and $k=4$, then the set outcomes_with_k_successes will be exactly the one shown in the section above.

Next we are going to add up the probability of each of these (mutually exclusive) outcome rolls. The function pr_of_outcome computes the probability of each individual outcome row:

```python

from itertools import permutations
from math import factorial

def binomial_diff_p(p_list, k):
    n = len(p_list)
    total_prob = 0

    # create a list with k 1s, and n-k 0s
    # for example [1, 1, 1, 0, 0]
    template = ['H'] * k + ['T'] * (n-k)

    # get all permutations of the template list
    outcomes_with_k_successes = set(permutations(template))

    # each outcome is mutually exclusive. Add their probabilities
    for outcome in outcomes_with_k_successes:
        total_prob += pr_of_outcome(p_list, outcome)

    return total_prob

def pr_of_outcome(p_list, outcome):
   pr = 1
   n = len(p_list)
   for i in range(n):
      p_success = p_list[i]
      if outcome[i] == 1:
          pr *= p_success
      else:
          pr *= (1 - p_success)
   return pr
```


@@ netflix-genres | 1.15 | Netflix Genres | section | netflix_genres
When recommending movies, Netflix cares about estimating the probability that a user will like a given movie, based on their viewing history. In order to make this problem tractable, they classify movies into a (large number) of specific genres such a "Tearjerker" or "Quirky Romance".

The probability that a Netflix user likes a movie $T_i$ from the "Tearjerker" genre:

Given that they like the Tearjerker genre is $p_i = 0.4$.

Given that they do not like the Tearjerker genre is $q_i = 0.9$.

60% of Netflix users like the Tearjerker genre.

Netflix assumes that, given a user’s preference for the genre, liking movie $T_i$ and $T_j$ are conditionally independent events for any movies $i$ and $j$. You may express all your answers in terms of $q$s and $p$s.

### Questions

What is the probability that a user likes movies $T_1$, $T_2$ and $T_3$ given that they like the Tearjerker genre?

$$\begin{aligned}
p_1 \cdot p_2 \cdot p_3
\end{aligned}$$

What is the probability that they like movies $T_1$, $T_2$ or $T_3$ given that they like the Tearjerker genre?

> Solution

Let $L_i |G$ be the event that they like movie $T_i$ given that they like the Tearjerker genre.

$$\begin{aligned}
\text{Answer} 
&= P(L_1|G \text{ or } L_2|G \text{ or } L_3|G) \\
&= 1−P(L_1|G \text{ or } L_2|G \text{ or } L_3|G)^C \\
&= 1−P(L_1^C|G \text{ and } L_2^C |G \text{ and } L_3^C  |G) \\
&= 1−(1− p_1)(1− p_2)(1− p_3) 
\end{aligned}$$

Another approach is to use the inclusion/exclusion principle to expand the first line of the previous answer:

$$\begin{aligned}
\text{Answer} 
&= P(L_1|G \text{ or } L_2|G \text{ or } L_3|G)\\
&= p_1 + p_2 + p_3 
−(p_1\cdot p_2)
−(p_1\cdot p_3)
−(p_2 \cdot p_3) 
+ (p_1 \cdot p_2 \cdot p_3) 
\end{aligned}$$

@endcard

What is the probability that they like the Tearjerker genre given that they like $T_1$, $T_2$ and $T_3$.

$$\begin{aligned}
P(G& \mid L_1 L_2 L_3) \\
&= \frac{P(L_1 L_2 L_3 \mid G) P(G)}{P(L_1 L_2 L_3 \mid G) P(G) + P(L_1 L_2 L_3 \mid G^C) P(G^C)} \\
&= \frac{(p_1 p_2 p_3)(0.6)}{(p_1 p_2 p_3)(0.6) + (q_1 q_2 q_3)(0.4)}
\end{aligned}$$


@@ poker | 1.15 | Poker | section | poker
Texas Hold’em, the most popular form of poker, is a card game where each player receives two private cards (“hole cards”) and shares five community cards dealt face-up on the table (“the board”). Players build their best possible five-card hand using any combination of their own cards and the board. After each stage of dealing—the flop (3 cards), turn (1 card), and river (1 card)—players bet based on how strong they believe their final hand will be. Because opponents’ cards are hidden, poker becomes a game of probability, inference, and strategy, where deciding whether a hand is likely to win is just as important as the cards themselves.

@figure embedded-48b18597da2d8039 | A Texas hold’em table: five community cards face up in the middle, your two cards at the bottom, and the other players around the table.

Poker hand evaluation looks simple on the surface—there are only 52 cards, right? But even a small number of unknown cards creates combinatorial explosions.

For example, with five opponents:

- Each opponent has 2 unseen hole cards
- You must consider all possible ways to choose these cards without overlap
- The board may still have 1–2 cards left to reveal
- Every possible distribution leads to a different outcome

Even with just one community card left to be shown, the number of distinct ways to deal out all unknown cards is enormous. Computing your exact winning chances would require enumerating every valid arrangement of remaining cards and evaluating all hands—something a computer can do, but only with careful optimization.

This is why poker software rarely tries to evaluate every possible deal. Instead, it uses the same tool scientists and statisticians use to understand complex systems. Simulation. To know how strong your hand is, you want to compute:

$$\begin{aligned}
P(\text{your hand wins against } n \text{ opponents} \mid \text{current board, your hand})
\end{aligned}$$

This probability is usually impossible to compute exactly with a simple formula. But we can estimate it accurately using simulation.

### Probability Through Simulation

Monte-Carlo simulation is the idea that:

If you want to know the probability of something, simulate the process many times and count how often it happens.

At any point in a poker hand, some cards are known: Your 2 cards as well as the board cards shown (between 0 and 5 cards). All remaining cards in the deck are equally likely to appear in any open slot (cards on the board, or opponent cards). The key idea is to randomly deal the unknown cards many times and count the proportion of times you win.

Consider an example where 3 community cards are shown and there are five opponents. There are:

- 2 table cards still to come
- Each opponent still has 2 cards unknown

So one simulation trial does:

- Randomly select the remaining unseen cards
- Give each opponent 2 of them
- Complete the board
- Evaluate everybody’s best 5-card hand
- Record whether you win (including ties)

After $N$ simulations:

$$\begin{aligned}
P(\text{win}) = \frac{\text{Count(times you win)}}{N \text{ Trials}}
\end{aligned}$$

With $N$ = 10,000 or more, this estimate is very accurate.

### Probability Through Equally Likely Outcomes

Since each possible assignment of a deck of cards to the remaining open slots is equally likely, this problem has a special property: in theory we can calculate the probability that you win via counting the size of the sample space and the event space.

> All Five Community Cards Revealed

To explore this approach lets start with a simple scenario. All five community cards have been played.

In this situation you can see 7 cards (your two cards, and the five community cards).

Of the 52 cards in the deck $52-7 = 45$.

There are 10 cards which need to be revealed (2 cards for each of the 5 opponents).

The sample space is the set of all the ways that we could assign the 45 cards remaining in the deck to the 10 open slots. Without loss of generality assume that you currently have the King of Hearts and the 4 of Clubs. On the table are the following board cards:

@interactive poker-1

How many ways could you assign the remaining 45 cards to the 10 open slots? Here you can look through a few examples of outcomes from the sample space:

@interactive poker-2

You probably have a sense that there are quite a lot of ways. Imagine constructing one outcome in the sample space, $S$ using a 10 step process. We chose a card for the first open slot, the second, and so on until all the slots are filled.

There are 45 choices for the 1st open slot...

There are 44 cards left for the 2nd open slot...

There are 43 cards left for the 3rd open slot...

There are 42 cards left for the 4th open slot...

There are 41 cards left for the 5th open slot...

There are 40 cards left or the 6th open slot...

There are 39 cards left for the 7th open slot...

There are 38 cards left for the 8th open slot...

There are 37 cards left for the 9th open slot...

There are 36 cards left for the 10th open slot...

By the Step Rule of Counting there are:

$$\begin{aligned}
|S| = \prod_{i=1}^{10} i = 3628800
\end{aligned}$$

Out of those, how many have no opponents that beat you (or, if it is easier, at least one opponent that beats you)? You could come up with a way of counting that is based on your current hand. For example given the current situation described above, you currently have a pair of kings. While that would be possible for particular hand combinations, it can be really onerous to write a general solution.

@endcard


@@ serendipity | 1.15 | Serendipity | section | serendipity
@figure 5609e3bd-2c6d-4e9b-abed-1e2b455945e4 | A crowded city park on a sunny day, with the skyline in the background.

The word serendipity comes from the Persian fairy tale of the Three Princes of Serendip.

### Problem

What is the probability of a serendipitous encounter with a friend? Imagine you live in an area with a large general population (e.g. Stanford with 17,000 students). A small subset of the population are friends. What are the chances that you run into at least one friend if you see a handful of people from the population? Assume that seeing each person from the population is equally likely.

@interactive serendipity-1

### Terms

First let's define some useful terms: $p$ is the total population, $s$ is the number of people you see, and $f$ is the number of your friends. Let $E$ be the event that you see at least one friend, and let $E_i^C$ be the event that you don't know the $i$th person you see, given that you also didn't know anyone you saw before them.

### Solution

$$\begin{aligned}
P(E) &= 1 - P(E^C) \\
&= 1 - \prod_{i=0}^{s-1} P(E_i^C) \\
&= 1 - \prod_{i=0}^{s-1} \frac{p-f-i}{p-i}
\end{aligned}$$

You can calculate $P(E_i^C)$ using equally likely outcomes. There are $p-i$ folks left to choose from and there are $p-f-i$ who are not folks you know (notice that value is the size of the sample space minus the number of people you know).

$$P(E_i^C) = \frac{p-f-i}{p-i}$$

### Alternative Approach

Another way to solve this problem is using counting. Since each way of seeing $s$ people is equally likely, we can use the equally likely outcomes probability calculation:

$$P(E) = \frac{|E|}{|S|}$$

Where $S$ is the sample space (all the ways of seeing $s$ people) and $E$ is the event (all the ways of seeing $s$ people where at least one is a friend).

One way to approach this problem is to directly count all ways you see one or more friends. That is hard. You'd have to count ways of seeing exactly one friend, exactly two friends, etc. It is easier to calculate the ways that you see zero friends. If we can calculate the probability of seeing zero friends, our answer is just $1 - (\text{that probability})$.

Let the sample space $S$ be the set of ways that you could see $s$ people. The size of the sample space is the total population choose the number of people seen. The event space is the set of ways that you could see no friends. Its size is the number of non-friends (the population minus your friends) choose the number of people seen. Thus the probability of not seeing a friend is:

$$P(\text{not seen}) = \frac{\binom{p-f}{s}}{\binom{p}{s}}$$

The probability you see at least one friend is then:

$$P(\text{seen}) = 1 - \frac{\binom{p-f}{s}}{\binom{p}{s}}$$

With 17,000 students, 150 friends, and 100 people seen, that works out to about 0.59. Isn't that surprising?


@@ monty-hall | 1.15 | Monty Hall | section | monty_hall
Here is a demo of the Monty Hall game! Pick a door. The host, who knows where the prize is, then opens every other door except one, and never reveals the prize. You can stay with the door you picked or switch to the one left closed.

@interactive monty-hall-1

With $n$ doors, staying wins only when your first pick was right, which happens with probability $1/n$. Switching wins in every other case, with probability $(n-1)/n$. The host's actions "concentrate" the remaining probability into the other door.


@@ server-example | 1.15 | Router Example | section | server_example
Network reliability is a good example of De Morgan's law at work: you can go back and forth between the “and” and the “or” of events in order to make a computation far more tractable.

### Formalizing Network Reliability

Let $E$ be the event that a functional path from A to B exists. Let $R_i$ be the event that router $i$ functions correctly, where $P(R_i) = p$. The routers work independently of one another.

### Method 1: Inclusion–Exclusion

We define $E$ as the union of all router successes:

$$E = R_1 \cup R_2 \cup \dots \cup R_n$$

Inclusion–exclusion then expands $P(E)$ into one term for every non-empty group of routers: $2^n - 1$ terms in all.

### Method 2: Complement

We define $E^C$ as the event that no functional path exists.

First, the complement rule:

$$P(E) = 1 - P(E^C)$$

Second, De Morgan's law. A path fails only if all routers fail:

$$E^C = R_1^C \cap R_2^C \cap \dots \cap R_n^C$$

Third, independence. Since the routers are independent, the intersection becomes a product:

$$P(E^C) = P(R_1^C) \cdot P(R_2^C) \cdots P(R_n^C) = (1-p)^n$$

$$P(E) = 1 - (1-p)^n$$

@interactive server-example-1
