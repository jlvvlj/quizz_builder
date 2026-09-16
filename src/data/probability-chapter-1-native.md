@@ cards-1
The sample space Ω, which is the set of all possible outcomes of an experiment.

The probability law, which assigns to a set A of possible outcomes (also called an event) a nonnegative number P(A) (called the probability of A) that encodes our knowledge or belief about the collective “likelihood” of the elements of A. The probability law must satisfy certain properties to be introduced shortly.

@@ examples-1
Consider two alternative games, both involving ten successive coin tosses:

Game 1: We receive $1 each time a head comes up.

Game 2: We receive $1 for every coin toss, up to and including the first time a head comes up. Then, we receive $2 for every coin toss, up to the second time a head comes up. More generally, the dollar amount per toss is doubled each time a head comes up.

In game 1, it is only the total number of heads in the ten-toss sequence that matters, while in game 2, the order of heads and tails is also important. Thus, in a probabilistic model for game 1, we can work with a sample space consisting of eleven possible outcomes, namely, 0, 1, …, 10. In game 2, a finer grain description of the experiment is called for, and it is more appropriate to let the sample space consist of every possible ten-long sequence of heads and tails.

@@ probability-laws-math-3
There are many natural properties of a probability law which have not been included in the above axioms for the simple reason that they can be derived from them. For example, note that the normalization and additivity axioms imply that

$$ 1=P(\Omega)=P(\Omega\cup\varnothing)=P(\Omega)+P(\varnothing)=1+P(\varnothing),

and this shows that the probability of the empty event is 0:

$$ P(\varnothing)=0.

As another example, consider three disjoint events A₁, A₂, and A₃. We can use the additivity axiom for two disjoint events repeatedly, to obtain

$$ \begin{aligned}P(A_1\cup A_2\cup A_3)&=P\bigl(A_1\cup(A_2\cup A_3)\bigr)\\&=P(A_1)+P(A_2\cup A_3)\\&=P(A_1)+P(A_2)+P(A_3).\end{aligned}

Proceeding similarly, we obtain that the probability of the union of finitely many disjoint events is always equal to the sum of the probabilities of these events. More such properties will be considered shortly.

@@ cards-2
1. Nonnegativity: P(A) ≥ 0, for every event A.

2. Additivity: If A and B are two disjoint events, then the probability of their union satisfies

$$ P(A\cup B)=P(A)+P(B).

Furthermore, if the sample space has an infinite number of elements and A₁, A₂, … is a sequence of disjoint events, then the probability of their union satisfies

$$ P(A_1\cup A_2\cup\cdots)=P(A_1)+P(A_2)+\cdots

3. Normalization: The probability of the entire sample space Ω is equal to 1, that is, P(Ω) = 1.

@@ cards-3
If the sample space consists of a finite number of possible outcomes, then the probability law is specified by the probabilities of the events that consist of a single element. In particular, the probability of any event {s₁, s₂, …, sₙ} is the sum of the probabilities of its elements:

$$ P(\{s_1,s_2,\ldots,s_n\})=P(\{s_1\})+P(\{s_2\})+\cdots+P(\{s_n\}).

@@ cards-4
If the sample space consists of n possible outcomes which are equally likely (i.e., all single-element events have the same probability), then the probability of any event A is given by

$$ P(A)=\frac{\text{Number of elements of }A}{n}.

@@ examples-2
Coin tosses. Consider an experiment involving a single coin toss. There are two possible outcomes, heads (H) and tails (T). The sample space is Ω = {H, T}, and the events are

$$ \{H,T\},\quad\{H\},\quad\{T\},\quad\varnothing.

If the coin is fair, i.e., if we believe that heads and tails are “equally likely,” we should assign equal probabilities to the two possible outcomes and specify that P({H}) = P({T}) = 0.5. The additivity axiom implies that

$$ P(\{H,T\})=P(\{H\})+P(\{T\})=1,

which is consistent with the normalization axiom. Thus, the probability law is given by

$$ \begin{gathered}P(\{H,T\})=1,\quad P(\{H\})=0.5,\\P(\{T\})=0.5,\quad P(\varnothing)=0,\end{gathered}

and satisfies all three axioms.

Consider another experiment involving three coin tosses. The outcome will now be a 3-long string of heads or tails. The sample space is

$$ \Omega=\{HHH,HHT,HTH,HTT,THH,THT,TTH,TTT\}.

We assume that each possible outcome has the same probability of 1/8. Let us construct a probability law that satisfies the three axioms. Consider, as an example, the event

$$ A=\{\text{exactly 2 heads occur}\}=\{HHT,HTH,THH\}.

Using additivity, the probability of A is the sum of the probabilities of its elements:

$$ \begin{aligned}P(\{HHT,HTH,THH\})&=P(\{HHT\})+P(\{HTH\})+P(\{THH\})\\&=\frac18+\frac18+\frac18\\&=\frac38.\end{aligned}

Similarly, the probability of any event is equal to 1/8 times the number of possible outcomes contained in the event. This defines a probability law that satisfies the three axioms.

@@ examples-3
Dice. Consider the experiment of rolling a pair of 4-sided dice (cf. Fig. 1.4). We assume the dice are fair, and we interpret this assumption to mean that each of the sixteen possible outcomes [ordered pairs (i, j), with i, j = 1, 2, 3, 4], has the same probability of 1/16. To calculate the probability of an event, we must count the number of elements of event and divide by 16 (the total number of possible outcomes). Here are some event probabilities calculated in this way:

$$ P(\{\text{the sum of the rolls is even}\})=\frac8{16}=\frac12,

$$ P(\{\text{the sum of the rolls is odd}\})=\frac8{16}=\frac12,

$$ P(\{\text{the first roll is equal to the second}\})=\frac4{16}=\frac14,

$$ P(\{\text{the first roll is larger than the second}\})=\frac6{16}=\frac38,

$$ P(\{\text{at least one roll is equal to 4}\})=\frac7{16}.

@@ examples-4
A wheel of fortune is continuously calibrated from 0 to 1, so the possible outcomes of an experiment consisting of a single spin are the numbers in the interval Ω = [0, 1]. Assuming a fair wheel, it is appropriate to consider all outcomes equally likely, but what is the probability of the event consisting of a single element? It cannot be positive, because then, using the additivity axiom, it would follow that events with a sufficiently large number of elements would have probability larger than 1. Therefore, the probability of any event that consists of a single element must be 0.

In this example, it makes sense to assign probability b − a to any subinterval [a, b] of [0, 1], and to calculate the probability of a more complicated set by evaluating its “length.” This assignment satisfies the three probability axioms and qualifies as a legitimate probability law.

@@ examples-5
Romeo and Juliet have a date at a given time, and each will arrive at the meeting place with a delay between 0 and 1 hour, with all pairs of delays being equally likely. The first to arrive will wait for 15 minutes and will leave if the other has not yet arrived. What is the probability that they will meet?

Let us use as sample space the square Ω = [0, 1] × [0, 1], whose elements are the possible pairs of delays for the two of them. Our interpretation of “equally likely” pairs of delays is to let the probability of a subset of Ω be equal to its area. This probability law satisfies the three probability axioms. The event that Romeo and Juliet will meet is the shaded region in Fig. 1.5, and its probability is calculated to be 7/16.

@@ cards-5
Consider a probability law, and let A, B, and C be events.

(a) If A ⊂ B, then P(A) ≤ P(B).

$$ \text{(b)}\quad P(A\cup B)=P(A)+P(B)-P(A\cap B).

$$ \text{(c)}\quad P(A\cup B)\le P(A)+P(B).

$$ \text{(d)}\quad P(A\cup B\cup C)=P(A)+P(A^c\cap B)+P(A^c\cap B^c\cap C).

@@ conditional-probability-law-math-1
To verify the additivity axiom, we write for any two disjoint events A₁ and A₂,

$$ \begin{aligned}P(A_1\cup A_2\mid B)&=\frac{P((A_1\cup A_2)\cap B)}{P(B)}\\&=\frac{P((A_1\cap B)\cup(A_2\cap B))}{P(B)}\\&=\frac{P(A_1\cap B)+P(A_2\cap B)}{P(B)}\\&=\frac{P(A_1\cap B)}{P(B)}+\frac{P(A_2\cap B)}{P(B)}\\&=P(A_1\mid B)+P(A_2\mid B),\end{aligned}

where for the second equality, we used the fact that A₁ ∩ B and A₂ ∩ B are disjoint sets, and for the third equality we used the additivity axiom for the (unconditional) probability law. The argument for a countable collection of disjoint sets is similar.

@@ cards-6
The conditional probability of an event A, given an event B with P(B) > 0, is defined by

$$ P(A\mid B)=\frac{P(A\cap B)}{P(B)},

and specifies a new (conditional) probability law on the same sample space Ω. In particular, all known properties of probability laws remain valid for conditional probability laws.

Conditional probabilities can also be viewed as a probability law on a new universe B, because all of the conditional probability is concentrated on B.

In the case where the possible outcomes are finitely many and equally likely, we have

$$ P(A\mid B)=\frac{\text{number of elements of }A\cap B}{\text{number of elements of }B}.

@@ examples-6
We toss a fair coin three successive times. We wish to find the conditional probability P(A | B) when A and B are the events

$$ A=\{\text{more heads than tails come up}\},\quad B=\{\text{1st toss is a head}\}.

The sample space consists of eight sequences,

$$ \Omega=\{HHH,HHT,HTH,HTT,THH,THT,TTH,TTT\},

which we assume to be equally likely. The event B consists of the four elements HHH, HHT, HTH, HTT, so its probability is

$$ P(B)=\frac48.

The event A ∩ B consists of the three elements outcomes HHH, HHT, HTH, so its probability is

$$ P(A\cap B)=\frac38.

Thus, the conditional probability P(A | B) is

$$ P(A\mid B)=\frac{P(A\cap B)}{P(B)}=\frac{3/8}{4/8}=\frac34.

Because all possible outcomes are equally likely here, we can also compute P(A | B) using a shortcut. We can bypass the calculation of P(B) and P(A ∩ B), and simply divide the number of elements shared by A and B (which is 3) with the number of elements of B (which is 4), to obtain the same result 3/4.

@@ examples-7
A fair 4-sided die is rolled twice and we assume that all sixteen possible outcomes are equally likely. Let X and Y be the result of the 1st and the 2nd roll, respectively. We wish to determine the conditional probability P(A | B) where

$$ A=\{\max(X,Y)=m\},\quad B=\{\min(X,Y)=2\},

and m takes each of the values 1, 2, 3, 4.

As in the preceding example, we can first determine the probabilities P(A ∩ B) and P(B) by counting the number of elements of A ∩ B and B, respectively, and dividing by 16. Alternatively, we can directly divide the number of elements of A ∩ B with the number of elements of B; see Fig. 1.7.

@@ examples-8
A conservative design team, call it C, and an innovative design team, call it N, are asked to separately design a new product within a month. From past experience we know that:

(a) The probability that team C is successful is 2/3.

(b) The probability that team N is successful is 1/2.

(c) The probability that at least one team is successful is 3/4.

If both teams are successful, the design of team N is adopted. Assuming that exactly one successful design is produced, what is the probability that it was designed by team N?

There are four possible outcomes here, corresponding to the four combinations of success and failure of the two teams:

SS: both succeed. FF: both fail. SF: C succeeds, N fails. FS: C fails, N succeeds.

We are given that the probabilities of these outcomes satisfy

$$ \begin{gathered}P(SS)+P(SF)=\frac23,\quad P(SS)+P(FS)=\frac12,\\P(SS)+P(SF)+P(FS)=\frac34.\end{gathered}

From these relations, together with the normalization equation P(SS) + P(SF) + P(FS) + P(FF) = 1, we can obtain the probabilities of all the outcomes:

$$ P(SS)=\frac5{12},\quad P(SF)=\frac14,\quad P(FS)=\frac1{12},\quad P(FF)=\frac14.

The desired conditional probability is

$$ P(\{FS\}\mid\{SF,FS\})=\frac{1/12}{1/4+1/12}=\frac14.

@@ conditional-probability-modeling-math-2
The multiplication rule can be verified by writing

$$ P\left(\bigcap_{i=1}^{n} A_i\right)=P(A_1)\frac{P(A_1\cap A_2)}{P(A_1)}\frac{P(A_1\cap A_2\cap A_3)}{P(A_1\cap A_2)}\cdots\frac{P\left(\bigcap_{i=1}^{n} A_i\right)}{P\left(\bigcap_{i=1}^{n-1} A_i\right)},

and by using the definition of conditional probability to rewrite the right-hand side above as

$$ P(A_1)P(A_2\mid A_1)P(A_3\mid A_1\cap A_2)\cdots P\left(A_n\mid\bigcap_{i=1}^{n-1} A_i\right).

@@ cards-7
Assuming that all of the conditioning events have positive probability, we have

$$ P\left(\bigcap_{i=1}^{n} A_i\right)=P(A_1)P(A_2\mid A_1)P(A_3\mid A_1\cap A_2)\cdots P\left(A_n\mid\bigcap_{i=1}^{n-1} A_i\right).

@@ examples-9
Radar detection. If an aircraft is present in a certain area, a radar correctly registers its presence with probability 0.99. If it is not present, the radar falsely registers an aircraft presence with probability 0.10. We assume that an aircraft is present with probability 0.05. What is the probability of false alarm (a false indication of aircraft presence), and the probability of missed detection (nothing registers, even though an aircraft is present)?

A sequential representation of the sample space is appropriate here, as shown in Fig. 1.8. Let A and B be the events

$$ A=\{\text{an aircraft is present}\},

$$ B=\{\text{the radar registers an aircraft presence}\},

and consider also their complements

$$ A^c=\{\text{an aircraft is not present}\},

$$ B^c=\{\text{the radar does not register an aircraft presence}\}.

The given probabilities are recorded along the corresponding branches of the tree describing the sample space, as shown in Fig. 1.8. Each event of interest corresponds to a leaf of the tree and its probability is equal to the product of the probabilities associated with the branches in a path from the root to the corresponding leaf. The desired probabilities of false alarm and missed detection are

$$ \begin{aligned}P(\text{false alarm})&=P(A^c\cap B)=P(A^c)P(B\mid A^c)\\&=0.95\cdot0.10=0.095,\end{aligned}

$$ \begin{aligned}P(\text{missed detection})&=P(A\cap B^c)=P(A)P(B^c\mid A)\\&=0.05\cdot0.01=0.0005.\end{aligned}

@@ examples-10
Three cards are drawn from an ordinary 52-card deck without replacement (drawn cards are not placed back in the deck). We wish to find the probability that none of the three cards is a heart. We assume that at each step, each one of the remaining cards is equally likely to be picked. By symmetry, this implies that every triplet of cards is equally likely to be drawn. A cumbersome approach, that we will not use, is to count the number of all card triplets that do not include a heart, and divide it with the number of all possible card triplets. Instead, we use a sequential description of the sample space in conjunction with the multiplication rule (cf. Fig. 1.10).

Define the events

$$ A_i=\{\text{the }i\text{th card is not a heart}\},\quad i=1,2,3.

We will calculate P(A₁ ∩ A₂ ∩ A₃), the probability that none of the three cards is a heart, using the multiplication rule,

$$ P(A_1\cap A_2\cap A_3)=P(A_1)P(A_2\mid A_1)P(A_3\mid A_1\cap A_2).

We have

$$ P(A_1)=\frac{39}{52},

since there are 39 cards that are not hearts in the 52-card deck. Given that the first card is not a heart, we are left with 51 cards, 38 of which are not hearts, and

$$ P(A_2\mid A_1)=\frac{38}{51}.

Finally, given that the first two cards drawn are not hearts, there are 37 cards which are not hearts in the remaining 50-card deck, and

$$ P(A_3\mid A_1\cap A_2)=\frac{37}{50}.

These probabilities are recorded along the corresponding branches of the tree describing the sample space, as shown in Fig. 1.10. The desired probability is now obtained by multiplying the probabilities recorded along the corresponding path of the tree:

$$ P(A_1\cap A_2\cap A_3)=\frac{39}{52}\cdot\frac{38}{51}\cdot\frac{37}{50}.

Note that once the probabilities are recorded along the tree, the probability of several other events can be similarly calculated. For example,

$$ P(\text{1st is not a heart and 2nd is a heart})=\frac{39}{52}\cdot\frac{13}{51},

$$ P(\text{1st two are not hearts and 3rd is a heart})=\frac{39}{52}\cdot\frac{38}{51}\cdot\frac{13}{50}.

@@ examples-11
A class consisting of 4 graduate and 12 undergraduate students is randomly divided into 4 groups of 4. What is the probability that each group includes a graduate student? We interpret randomly to mean that given the assignment of some students to certain slots, any of the remaining students is equally likely to be assigned to any of the remaining slots. We then calculate the desired probability using the multiplication rule, based on the sequential description shown in Fig. 1.11. Let us denote the four graduate students by 1, 2, 3, 4, and consider the events

$$ A_1=\{\text{students 1 and 2 are in different groups}\},

$$ A_2=\{\text{students 1, 2, and 3 are in different groups}\},

$$ A_3=\{\text{students 1, 2, 3, and 4 are in different groups}\}.

We will calculate P(A₃) using the multiplication rule:

$$ \begin{aligned}P(A_3)&=P(A_1\cap A_2\cap A_3)\\&=P(A_1)P(A_2\mid A_1)P(A_3\mid A_1\cap A_2).\end{aligned}

We have

$$ P(A_1)=\frac{12}{15},

since there are 12 student slots in groups other than the one of student 1, and there are 15 student slots overall, excluding student 1. Similarly,

$$ P(A_2\mid A_1)=\frac8{14},

since there are 8 student slots in groups other than the one of students 1 and 2, and there are 14 student slots, excluding students 1 and 2. Also,

$$ P(A_3\mid A_1\cap A_2)=\frac4{13},

since there are 4 student slots in groups other than the one of students 1, 2, and 3, and there are 13 student slots, excluding students 1, 2, and 3. Thus, the desired probability is

$$ \frac{12}{15}\cdot\frac8{14}\cdot\frac4{13},

and is obtained by multiplying the conditional probabilities along the corresponding path of the tree of Fig. 1.11.

@@ cards-8
Let A₁, …, Aₙ be disjoint events that form a partition of the sample space (each possible outcome is included in one and only one of the events A₁, …, Aₙ) and assume that P(Aᵢ) > 0, for all i = 1, …, n. Then, for any event B, we have

$$ \begin{aligned}P(B)&=P(A_1\cap B)+\cdots+P(A_n\cap B)\\&=P(A_1)P(B\mid A_1)+\cdots+P(A_n)P(B\mid A_n).\end{aligned}

@@ cards-9
Let A₁, A₂, …, Aₙ be disjoint events that form a partition of the sample space, and assume that P(Aᵢ) > 0, for all i. Then, for any event B such that P(B) > 0, we have

$$ \begin{aligned}P(A_i\mid B)&=\frac{P(A_i)P(B\mid A_i)}{P(B)}\\&=\frac{P(A_i)P(B\mid A_i)}{P(A_1)P(B\mid A_1)+\cdots+P(A_n)P(B\mid A_n)}.\end{aligned}

@@ examples-12
You enter a chess tournament where your probability of winning a game is 0.3 against half the players (call them type 1), 0.4 against a quarter of the players (call them type 2), and 0.5 against the remaining quarter of the players (call them type 3). You play a game against a randomly chosen opponent. What is the probability of winning?

Let Aᵢ be the event of playing with an opponent of type i. We have

$$ P(A_1)=0.5,\quad P(A_2)=0.25,\quad P(A_3)=0.25.

Let also B be the event of winning. We have

$$ P(B\mid A_1)=0.3,\quad P(B\mid A_2)=0.4,\quad P(B\mid A_3)=0.5.

Thus, by the total probability theorem, the probability of winning is

$$ \begin{aligned}P(B)&=P(A_1)P(B\mid A_1)+P(A_2)P(B\mid A_2)+P(A_3)P(B\mid A_3)\\&=0.5\cdot0.3+0.25\cdot0.4+0.25\cdot0.5\\&=0.375.\end{aligned}

@@ examples-13
We roll a fair four-sided die. If the result is 1 or 2, we roll once more but otherwise, we stop. What is the probability that the sum total of our rolls is at least 4?

Let Aᵢ be the event that the result of first roll is i, and note that P(Aᵢ) = 1/4 for each i. Let B be the event that the sum total is at least 4. Given the event A₁, the sum total will be at least 4 if the second roll results in 3 or 4, which happens with probability 1/2. Similarly, given the event A₂, the sum total will be at least 4 if the second roll results in 2, 3, or 4, which happens with probability 3/4. Also, given the event A₃, we stop and the sum total remains below 4. Therefore,

$$ P(B\mid A_1)=\frac12,\quad P(B\mid A_2)=\frac34,\quad P(B\mid A_3)=0,\quad P(B\mid A_4)=1.

By the total probability theorem,

$$ P(B)=\frac14\cdot\frac12+\frac14\cdot\frac34+\frac14\cdot0+\frac14\cdot1=\frac9{16}.

@@ examples-14
Alice is taking a probability class and at the end of each week she can be either up-to-date or she may have fallen behind. If she is up-to-date in a given week, the probability that she will be up-to-date (or behind) in the next week is 0.8 (or 0.2, respectively). If she is behind in a given week, the probability that she will be up-to-date (or behind) in the next week is 0.6 (or 0.4, respectively). Alice is (by default) up-to-date when she starts the class. What is the probability that she is up-to-date after three weeks?

Let Uᵢ and Bᵢ be the events that Alice is up-to-date or behind, respectively, after i weeks. According to the total probability theorem, the desired probability P(U₃) is given by

$$ \begin{aligned}P(U_3)&=P(U_2)P(U_3\mid U_2)+P(B_2)P(U_3\mid B_2)\\&=P(U_2)\cdot0.8+P(B_2)\cdot0.6.\end{aligned}

The probabilities P(U₂) and P(B₂) can also be calculated using the total probability theorem:

$$ \begin{aligned}P(U_2)&=P(U_1)P(U_2\mid U_1)+P(B_1)P(U_2\mid B_1)\\&=P(U_1)\cdot0.8+P(B_1)\cdot0.6,\\P(B_2)&=P(U_1)P(B_2\mid U_1)+P(B_1)P(B_2\mid B_1)\\&=P(U_1)\cdot0.2+P(B_1)\cdot0.4.\end{aligned}

Finally, since Alice starts her class up-to-date, we have

$$ P(U_1)=0.8,\quad P(B_1)=0.2.

We can now combine the preceding three equations to obtain

$$ P(U_2)=0.8\cdot0.8+0.2\cdot0.6=0.76,

$$ P(B_2)=0.8\cdot0.2+0.2\cdot0.4=0.24,

and by using the above probabilities in the formula for P(U₃):

$$ P(U_3)=0.76\cdot0.8+0.24\cdot0.6=0.752.

The calculations use the stated 0.6 probability of catching up and 0.4 probability of remaining behind.

Note that we could have calculated the desired probability P(U₃) by constructing a tree description of the experiment, by calculating the probability of every element of U₃ using the multiplication rule on the tree, and by adding. In experiments with a sequential character one may often choose between using the multiplication rule or the total probability theorem for calculation of various probabilities. However, there are cases where the calculation based on the total probability theorem is more convenient. For example, suppose we are interested in the probability P(U₂₀) that Alice is up-to-date after 20 weeks. Calculating this probability using the multiplication rule is very cumbersome, because the tree representing the experiment is 20-stages deep and has 2²⁰ leaves. On the other hand, with a computer, a sequential calculation using the total probability formulas

$$ P(U_{i+1})=P(U_i)\cdot0.8+P(B_i)\cdot0.6,

$$ P(B_{i+1})=P(U_i)\cdot0.2+P(B_i)\cdot0.4,

and the initial conditions P(U₁) = 0.8, P(B₁) = 0.2 is very simple.

@@ examples-15
Let us return to the radar detection problem of Example 1.9 and Fig. 1.8. Let

$$ A=\{\text{an aircraft is present}\},

$$ B=\{\text{the radar registers an aircraft presence}\}.

We are given that

$$ P(A)=0.05,\quad P(B\mid A)=0.99,\quad P(B\mid A^c)=0.1.

Applying Bayes’ rule, with A₁ = A and A₂ = Aᶜ, we obtain

$$ \begin{aligned}P(\text{aircraft present}\mid\text{radar registers})&=P(A\mid B)\\&=\frac{P(A)P(B\mid A)}{P(B)}\\&=\frac{P(A)P(B\mid A)}{P(A)P(B\mid A)+P(A^c)P(B\mid A^c)}\\&=\frac{0.05\cdot0.99}{0.05\cdot0.99+0.95\cdot0.1}\\&\approx0.3426.\end{aligned}

@@ examples-16
Let us return to the chess problem of Example 1.12. Here Aᵢ is the event of getting an opponent of type i, and

$$ P(A_1)=0.5,\quad P(A_2)=0.25,\quad P(A_3)=0.25.

Also, B is the event of winning, and

$$ P(B\mid A_1)=0.3,\quad P(B\mid A_2)=0.4,\quad P(B\mid A_3)=0.5.

Suppose that you win. What is the probability P(A₁ | B) that you had an opponent of type 1?

Using Bayes’ rule, we have

$$ \begin{aligned}P(A_1\mid B)&=\frac{P(A_1)P(B\mid A_1)}{P(A_1)P(B\mid A_1)+P(A_2)P(B\mid A_2)+P(A_3)P(B\mid A_3)}\\&=\frac{0.5\cdot0.3}{0.5\cdot0.3+0.25\cdot0.4+0.25\cdot0.5}\\&=0.4.\end{aligned}

@@ examples-17
Consider an experiment involving two successive rolls of a 4-sided die in which all 16 possible outcomes are equally likely and have probability 1/16.

(a) Are the events

$$ A_i=\{\text{1st roll results in }i\},\quad B_j=\{\text{2nd roll results in }j\},

independent? We have

$$ P(A_i\cap B_j)=P(\{\text{the result of the two rolls is }(i,j)\})=\frac1{16},

$$ P(A_i)=\frac{\text{number of elements of }A_i}{\text{total number of possible outcomes}}=\frac4{16},

$$ P(B_j)=\frac{\text{number of elements of }B_j}{\text{total number of possible outcomes}}=\frac4{16}.

We observe that P(Aᵢ ∩ Bⱼ) = P(Aᵢ)P(Bⱼ), and the independence of Aᵢ and Bⱼ is verified. Thus, our choice of the discrete uniform probability law (which might have seemed arbitrary) models the independence of the two rolls.

(b) Are the events

$$ A=\{\text{1st roll is a 1}\},\quad B=\{\text{sum of the two rolls is a 5}\},

independent? The answer here is not quite obvious. We have

$$ P(A\cap B)=P(\{\text{the result of the two rolls is }(1,4)\})=\frac1{16},

and also

$$ P(A)=\frac{\text{number of elements of }A}{\text{total number of possible outcomes}}=\frac4{16}.

The event B consists of the outcomes (1, 4), (2, 3), (3, 2), and (4, 1), and

$$ P(B)=\frac{\text{number of elements of }B}{\text{total number of possible outcomes}}=\frac4{16}.

Thus, we see that P(A ∩ B) = P(A)P(B), and the events A and B are independent.

(c) Are the events

$$ A=\{\text{maximum of the two rolls is 2}\},\quad B=\{\text{minimum of the two rolls is 2}\},

independent? Intuitively, the answer is “no” because the minimum of the two rolls tells us something about the maximum. For example, if the minimum is 2, the maximum cannot be 1. More precisely, to verify that A and B are not independent, we calculate

$$ P(A\cap B)=P(\{\text{the result of the two rolls is }(2,2)\})=\frac1{16},

and also

$$ P(A)=\frac{\text{number of elements of }A}{\text{total number of possible outcomes}}=\frac3{16},

$$ P(B)=\frac{\text{number of elements of }B}{\text{total number of possible outcomes}}=\frac5{16}.

We have P(A)P(B) = 15/(16)², so that P(A ∩ B) ≠ P(A)P(B), and A and B are not independent.

@@ conditional-independence-math-1
The definition of the conditional probability and the multiplication rule yield

$$ \begin{aligned}P(A\cap B\mid C)&=\frac{P(A\cap B\cap C)}{P(C)}\\&=\frac{P(C)P(B\mid C)P(A\mid B\cap C)}{P(C)}\\&=P(B\mid C)P(A\mid B\cap C).\end{aligned}

After canceling the factor P(B | C), assumed nonzero, we see that conditional independence is the same as the condition

$$ P(A\mid B\cap C)=P(A\mid C).

In words, this relation states that if C is known to have occurred, the additional knowledge that B also occurred does not change the probability of A.

@@ cards-10
Two events A and B are said to be independent if

$$ P(A\cap B)=P(A)P(B).

If in addition, P(B) > 0, independence is equivalent to the condition

$$ P(A\mid B)=P(A).

If A and B are independent, so are A and Bᶜ.

Two events A and B are said to be conditionally independent, given another event C with P(C) > 0, if

$$ P(A\cap B\mid C)=P(A\mid C)P(B\mid C).

If in addition, P(B ∩ C) > 0, conditional independence is equivalent to the condition

$$ P(A\mid B\cap C)=P(A\mid C).

Independence does not imply conditional independence, and vice versa.

@@ examples-18
Consider two independent fair coin tosses, in which all four possible outcomes are equally likely. Let

$$ H_1=\{\text{1st toss is a head}\},

$$ H_2=\{\text{2nd toss is a head}\},

$$ D=\{\text{the two tosses have different results}\}.

The events H₁ and H₂ are (unconditionally) independent. But

$$ P(H_1\mid D)=\frac12,\quad P(H_2\mid D)=\frac12,\quad P(H_1\cap H_2\mid D)=0,

so that P(H₁ ∩ H₂ | D) ≠ P(H₁ | D)P(H₂ | D), and H₁, H₂ are not conditionally independent.

@@ examples-19
There are two coins, a blue and a red one. We choose one of the two at random, each being chosen with probability 1/2, and proceed with two independent tosses. The coins are biased: with the blue coin, the probability of heads in any given toss is 0.99, whereas for the red coin it is 0.01.

Let B be the event that the blue coin was selected. Let also Hᵢ be the event that the ith toss resulted in heads. Given the choice of a coin, the events H₁ and H₂ are independent, because of our assumption of independent tosses. Thus,

$$ P(H_1\cap H_2\mid B)=P(H_1\mid B)P(H_2\mid B)=0.99\cdot0.99.

On the other hand, the events H₁ and H₂ are not independent. Intuitively, if we are told that the first toss resulted in heads, this leads us to suspect that the blue coin was selected, in which case, we expect the second toss to also result in heads. Mathematically, we use the total probability theorem to obtain

$$ \begin{aligned}P(H_1)&=P(B)P(H_1\mid B)+P(B^c)P(H_1\mid B^c)\\&=\frac12\cdot0.99+\frac12\cdot0.01=\frac12,\end{aligned}

as should be expected from symmetry considerations. Similarly, we have P(H₂) = 1/2. Now notice that

$$ \begin{aligned}P(H_1\cap H_2)&=P(B)P(H_1\cap H_2\mid B)+P(B^c)P(H_1\cap H_2\mid B^c)\\&=\frac12\cdot0.99\cdot0.99+\frac12\cdot0.01\cdot0.01\approx\frac12.\end{aligned}

Thus, P(H₁ ∩ H₂) ≠ P(H₁)P(H₂), and the events H₁ and H₂ are dependent, even though they are conditionally independent given B.

@@ cards-11
We say that the events A₁, A₂, …, Aₙ are independent if

$$ P\left(\bigcap_{i\in S}A_i\right)=\prod_{i\in S}P(A_i),\quad\text{for every subset }S\text{ of }\{1,2,\ldots,n\}.

@@ examples-20
Pairwise independence does not imply independence. Consider two independent fair coin tosses, and the following events:

$$ H_1=\{\text{1st toss is a head}\},

$$ H_2=\{\text{2nd toss is a head}\},

$$ D=\{\text{the two tosses have different results}\}.

The events H₁ and H₂ are independent, by definition. To see that H₁ and D are independent, we note that

$$ P(D\mid H_1)=\frac{P(H_1\cap D)}{P(H_1)}=\frac{1/4}{1/2}=\frac12=P(D).

Similarly, H₂ and D are independent. On the other hand, we have

$$ P(H_1\cap H_2\cap D)=0\ne\frac12\cdot\frac12\cdot\frac12=P(H_1)P(H_2)P(D),

and these three events are not independent.

@@ examples-21
The equality P(A₁ ∩ A₂ ∩ A₃) = P(A₁)P(A₂)P(A₃) is not enough for independence. Consider two independent rolls of a fair die, and the following events:

$$ A=\{\text{1st roll is 1, 2, or 3}\},

$$ B=\{\text{1st roll is 3, 4, or 5}\},

$$ C=\{\text{the sum of the two rolls is 9}\}.

We have

$$ P(A\cap B)=\frac16\ne\frac12\cdot\frac12=P(A)P(B),

$$ P(A\cap C)=\frac1{36}\ne\frac12\cdot\frac4{36}=P(A)P(C),

$$ P(B\cap C)=\frac1{12}\ne\frac12\cdot\frac4{36}=P(B)P(C).

Thus the three events A, B, and C are not independent, and indeed no two of these events are independent. On the other hand, we have

$$ P(A\cap B\cap C)=\frac1{36}=\frac12\cdot\frac12\cdot\frac4{36}=P(A)P(B)P(C).

@@ examples-22
Network connectivity. A computer network connects two nodes A and B through intermediate nodes C, D, E, F, as shown in Fig. 1.14(a). For every pair of directly connected nodes, say i and j, there is a given probability pᵢⱼ that the link from i to j is up. We assume that link failures are independent of each other. What is the probability that there is a path connecting A and B in which all links are up?

This is a typical problem of assessing the reliability of a system consisting of components that can fail independently. Such a system can often be divided into subsystems, where each subsystem consists in turn of several components that are connected either in series or in parallel; see Fig. 1.14(b).

Let a subsystem consist of components 1, 2, …, m, and let pᵢ be the probability that component i is up (“succeeds”). Then, a series subsystem succeeds if all of its components are up, so its probability of success is the product of the probabilities of success of the corresponding components, i.e.,

$$ P(\text{series subsystem succeeds})=p_1p_2\cdots p_m.

A parallel subsystem succeeds if any one of its components succeeds, so its probability of failure is the product of the probabilities of failure of the corresponding components, i.e.,

$$ \begin{aligned}P(\text{parallel subsystem succeeds})&=1-P(\text{parallel subsystem fails})\\&=1-(1-p_1)(1-p_2)\cdots(1-p_m).\end{aligned}

Returning now to the network of Fig. 1.14(a), we can calculate the probability of success (a path from A to B is available) sequentially, using the preceding formulas, and starting from the end. Let us use the notation X → Y to denote the event that there is a (possibly indirect) connection from node X to node Y. Then,

$$ \begin{aligned}P(C\to B)&=1-\bigl(1-P(C\to E\text{ and }E\to B)\bigr)\bigl(1-P(C\to F\text{ and }F\to B)\bigr)\\&=1-(1-p_{CE}p_{EB})(1-p_{CF}p_{FB})\\&=1-(1-0.8\cdot0.9)(1-0.85\cdot0.95)\\&\approx0.946,\end{aligned}

$$ P(A\to C\text{ and }C\to B)=P(A\to C)P(C\to B)\approx0.9\cdot0.946\approx0.851,

$$ P(A\to D\text{ and }D\to B)=P(A\to D)P(D\to B)=0.75\cdot0.95=0.7125,

and finally we obtain the desired probability

$$ \begin{aligned}P(A\to B)&=1-\bigl(1-P(A\to C\text{ and }C\to B)\bigr)\bigl(1-P(A\to D\text{ and }D\to B)\bigr)\\&\approx1-(1-0.851)(1-0.7125)\\&\approx0.957.\end{aligned}

@@ independent-trials-math-3
Let us now consider the probability

$$ p(k)=P(k\text{ heads come up in an }n\text{-toss sequence}),

which will play an important role later. We showed above that the probability of any given sequence that contains k heads is pᵏ(1 − p)ⁿ⁻ᵏ, so we have

$$ p(k)=\binom{n}{k}p^k(1-p)^{n-k},

where

$$ \binom{n}{k}=\text{number of distinct }n\text{-toss sequences that contain }k\text{ heads}.

The numbers C(n, k) (called “n choose k”) are known as the binomial coefficients, while the probabilities p(k) are known as the binomial probabilities. Using a counting argument, to be given in Section 1.6, one finds that

$$ \binom{n}{k}=\frac{n!}{k!(n-k)!},\quad k=0,1,\ldots,n,

where for any positive integer i we have

$$ i!=1\cdot2\cdots(i-1)\cdot i,

and, by convention, 0! = 1. An alternative verification is sketched in the theoretical problems. Note that the binomial probabilities p(k) must add to 1, thus showing the binomial formula

$$ \sum_{k=0}^{n}\binom{n}{k}p^k(1-p)^{n-k}=1.

@@ examples-23
Grade of service. An internet service provider has installed c modems to serve the needs of a population of n customers. It is estimated that at a given time, each customer will need a connection with probability p, independently of the others. What is the probability that there are more customers needing a connection than there are modems?

Here we are interested in the probability that more than c customers simultaneously need a connection. It is equal to

$$ \sum_{k=c+1}^{n}p(k),

where

$$ p(k)=\binom{n}{k}p^k(1-p)^{n-k}

are the binomial probabilities.

This example is typical of problems of sizing the capacity of a facility to serve the needs of a homogeneous population, consisting of independently acting customers. The problem is to select the size c to achieve a certain threshold probability (sometimes called grade of service) that no user is left unserved.

@@ cards-12
Consider a process that consists of r stages. Suppose that:

(a) There are n₁ possible results for the first stage.

(b) For every possible result of the first stage, there are n₂ possible results at the second stage.

(c) More generally, for all possible results of the first i − 1 stages, there are nᵢ possible results at the ith stage.

Then, the total number of possible results of the r-stage process is

$$ n_1\cdot n_2\cdots n_r.

@@ examples-24
The number of telephone numbers. A telephone number is a 7-digit sequence, but the first digit has to be different from 0 or 1. How many distinct telephone numbers are there? We can visualize the choice of a sequence as a sequential process, where we select one digit at a time. We have a total of 7 stages, and a choice of one out of 10 elements at each stage, except for the first stage where we only have 8 choices. Therefore, the answer is

$$ 8\cdot\underbrace{10\cdot10\cdots10}_{\text{6 times}}=8\cdot10^6.

@@ examples-25
The number of subsets of an n-element set. Consider an n-element set {s₁, s₂, …, sₙ}. How many subsets does it have (including itself and the empty set)? We can visualize the choice of a subset as a sequential process where we examine one element at a time and decide whether to include it in the set or not. We have a total of n stages, and a binary choice at each stage. Therefore the number of subsets is

$$ \underbrace{2\cdot2\cdots2}_{n\text{ times}}=2^n.

@@ examples-26
Let us count the number of words that consist of four distinct letters. This is the problem of counting the number of 4-permutations of the 26 letters in the alphabet. The desired number is

$$ \frac{n!}{(n-k)!}=\frac{26!}{22!}=26\cdot25\cdot24\cdot23=358{,}800.

@@ examples-27
You have n₁ classical music CDs, n₂ rock music CDs, and n₃ country music CDs. In how many different ways can you arrange them so that the CDs of the same type are contiguous?

We break down the problem in two stages, where we first select the order of the CD types, and then the order of the CDs of each type. There are 3! ordered sequences of the types of CDs (such as classical/rock/country, rock/country/classical, etc), and there are n₁! (or n₂!, or n₃!) permutations of the classical (or rock, or country, respectively) CDs. Thus for each of the 3! CD type sequences, there are n₁!n₂!n₃! arrangements of CDs, and the desired total number is 3!n₁!n₂!n₃!.

@@ combinations-math-3
It is worth observing that counting arguments sometimes lead to formulas that are rather difficult to derive algebraically. One example is the binomial formula

$$ \sum_{k=0}^{n}\binom{n}{k}p^k(1-p)^{n-k}=1

discussed in Section 1.5. Here is another example. Since C(n, k) is the number of k-element subsets of a given n-element subset, the sum over k of C(n, k) counts the number of subsets of all possible cardinalities. It is therefore equal to the number of all subsets of an n-element set, which is 2ⁿ, and we obtain

$$ \sum_{k=0}^{n}\binom{n}{k}=2^n.

@@ examples-28
The number of combinations of two out of the four letters A, B, C, and D is found by letting n = 4 and k = 2. It is

$$ \binom42=\frac{4!}{2!2!}=6,

consistently with the listing given earlier.

@@ partitions-math-1
We have n distinct objects and we are given nonnegative integers n₁, n₂, …, nᵣ, whose sum is equal to n. The n items are to be divided into r disjoint groups, with the ith group containing exactly nᵢ items. Let us count in how many ways this can be done.

We form the groups one at a time. We have C(n, n₁) ways of forming the first group. Having formed the first group, we are left with n − n₁ objects. We need to choose n₂ of them in order to form the second group, and we have C(n − n₁, n₂) choices, etc. Using the Counting Principle for this r-stage process, the total number of choices is

$$ \binom{n}{n_1}\binom{n-n_1}{n_2}\binom{n-n_1-n_2}{n_3}\cdots\binom{n-n_1-\cdots-n_{r-1}}{n_r},

which is equal to

$$ \frac{n!}{n_1!(n-n_1)!}\frac{(n-n_1)!}{n_2!(n-n_1-n_2)!}\cdots\frac{(n-n_1-\cdots-n_{r-1})!}{(n-n_1-\cdots-n_{r-1}-n_r)!n_r!}.

We note that several terms cancel and we are left with

$$ \frac{n!}{n_1!n_2!\cdots n_r!}.

This is called the multinomial coefficient and is usually denoted by

$$ \binom{n}{n_1,n_2,\ldots,n_r}.

@@ cards-13
Permutations of n objects:

$$ n!

k-permutations of n objects:

$$ \frac{n!}{(n-k)!}

Combinations of k out of n objects:

$$ \binom{n}{k}=\frac{n!}{k!(n-k)!}

Partitions of n objects into r groups with the ith group having nᵢ objects:

$$ \binom{n}{n_1,n_2,\ldots,n_r}=\frac{n!}{n_1!n_2!\cdots n_r!}.

@@ examples-29
Anagrams. How many different letter sequences can be obtained by rearranging the letters in the word TATTOO? There are six positions to be filled by the available letters. Each rearrangement corresponds to a partition of the set of the six positions into a group of size 3 (the positions that get the letter T), a group of size 1 (the position that gets the letter A), and a group of size 2 (the positions that get the letter O). Thus, the desired number is

$$ \frac{6!}{1!2!3!}=\frac{1\cdot2\cdot3\cdot4\cdot5\cdot6}{1\cdot1\cdot2\cdot1\cdot2\cdot3}=60.

It is instructive to rederive this answer using an alternative argument. (This argument can also be used to rederive the multinomial coefficient formula; see the theoretical problems.) Let us rewrite TATTOO in the form T₁AT₂T₃O₁O₂ pretending for a moment that we are dealing with 6 distinguishable objects. These 6 objects can be rearranged in 6! different ways. However, any of the 3! possible permutations of T₁, T₂, and T₃, as well as any of the 2! possible permutations of O₁ and O₂, lead to the same word. Thus, when the subscripts are removed, there are only 6!/(3!2!) different words.

@@ examples-30
A class consisting of 4 graduate and 12 undergraduate students is randomly divided into four groups of 4. What is the probability that each group includes a graduate student? This is the same as Example 1.11 in Section 1.3, but we will now obtain the answer using a counting argument.

We first determine the nature of the sample space. A typical outcome is a particular way of partitioning the 16 students into four groups of 4. We take the term “randomly” to mean that every possible partition is equally likely, so that the probability question can be reduced to one of counting.

According to our earlier discussion, there are

$$ \binom{16}{4,4,4,4}=\frac{16!}{4!4!4!4!}

different partitions, and this is the size of the sample space.

Let us now focus on the event that each group contains a graduate student. Generating an outcome with this property can be accomplished in two stages:

(a) Take the four graduate students and distribute them to the four groups; there are four choices for the group of the first graduate student, three choices for the second, two for the third. Thus, there is a total of 4! choices for this stage.

(b) Take the remaining 12 undergraduate students and distribute them to the four groups (3 students in each). This can be done in

$$ \binom{12}{3,3,3,3}=\frac{12!}{3!3!3!3!}

different ways.

By the Counting Principle, the event of interest can materialize in

$$ \frac{4!12!}{3!3!3!3!}

different ways. The probability of this event is

$$ \frac{\dfrac{4!12!}{3!3!3!3!}}{\dfrac{16!}{4!4!4!4!}}.

After some cancellations, we can see that this is the same as the answer 12 · 8 · 4/(15 · 14 · 13) obtained in Example 1.11.

@@ figures-1
Examples of Venn diagrams. (a) The shaded region is S ∩ T. (b) The shaded region is S ∪ T. (c) The shaded region is S ∩ Tᶜ. (d) Here, T ⊂ S. The shaded region is the complement of S. (e) The sets S, T, and U are disjoint. (f) The sets S, T, and U form a partition of the set Ω.

@@ figures-2
The main ingredients of a probabilistic model.

@@ figures-3
Two equivalent descriptions of the sample space of an experiment involving two rolls of a 4-sided die. The possible outcomes are all the ordered pairs of the form (i, j), where i is the result of the first roll, and j is the result of the second. These outcomes can be arranged in a 2-dimensional grid as in the figure on the left, or they can be described by the tree on the right, which reflects the sequential character of the experiment. Here, each possible outcome corresponds to a leaf of the tree and is associated with the unique path from the root to that leaf. The shaded area on the left is the event {(1, 4), (2, 4), (3, 4), (4, 4)} that the result of the second roll is 4. That same event can be described as a set of leaves, as shown on the right. Note also that every node of the tree can be identified with an event, namely, the set of all leaves downstream from that node. For example, the node labeled by a 1 can be identified with the event {(1, 1), (1, 2), (1, 3), (1, 4)} that the result of the first roll is 1.

@@ figures-4
Various events in the experiment of rolling a pair of 4-sided dice, and their probabilities, calculated according to the discrete uniform law.

@@ figures-5
The event M that Romeo and Juliet will arrive within 15 minutes of each other (cf. Example 1.5) is

$$ M=\{(x,y)\mid |x-y|\le1/4,\ 0\le x\le1,\ 0\le y\le1\},

and is shaded in the figure. The area of M is 1 minus the area of the two unshaded triangles, or 1 − (3/4) · (3/4) = 7/16. Thus, the probability of meeting is 7/16.

@@ figures-6
Visualization and verification of various properties of probability laws using Venn diagrams. If A ⊂ B, then B is the union of the two disjoint events A and Aᶜ ∩ B; see diagram (a). Therefore, by the additivity axiom, we have

$$ P(B)=P(A)+P(A^c\cap B)\ge P(A),

where the inequality follows from the nonnegativity axiom, and verifies property (a).

From diagram (b), we can express the events A ∪ B and B as unions of disjoint events:

$$ A\cup B=A\cup(A^c\cap B),\quad B=(A\cap B)\cup(A^c\cap B).

The additivity axiom yields

$$ P(A\cup B)=P(A)+P(A^c\cap B),\quad P(B)=P(A\cap B)+P(A^c\cap B).

Subtracting the second equality from the first and rearranging terms, we obtain P(A ∪ B) = P(A) + P(B) − P(A ∩ B), verifying property (b). Using also the fact P(A ∩ B) ≥ 0 (the nonnegativity axiom), we obtain P(A ∪ B) ≤ P(A) + P(B), verifying property (c).

From diagram (c), we see that the event A ∪ B ∪ C can be expressed as a union of three disjoint events:

$$ A\cup B\cup C=A\cup(A^c\cap B)\cup(A^c\cap B^c\cap C),

so property (d) follows as a consequence of the additivity axiom.

@@ figures-7
Sample space of an experiment involving two rolls of a 4-sided die (cf. Example 1.7). The conditioning event B = {min(X, Y) = 2} consists of the 5-element shaded set. The set A = {max(X, Y) = m} shares with B two elements if m = 3 or m = 4, one element if m = 2, and no element if m = 1. Thus, we have

$$ P(\{\max(X,Y)=m\}\mid B)=\begin{cases}2/5&\text{if }m=3\text{ or }m=4,\\1/5&\text{if }m=2,\\0&\text{if }m=1.\end{cases}

@@ figures-8
Sequential description of the sample space for the radar detection problem in Example 1.9.

@@ figures-9
Visualization of the multiplication rule. The intersection event A = A₁ ∩ A₂ ∩ ⋯ ∩ Aₙ is associated with a path on the tree of a sequential description of the experiment. We associate the branches of this path with the events A₁, …, Aₙ, and we record next to the branches the corresponding conditional probabilities.

The final node of the path corresponds to the intersection event A, and its probability is obtained by multiplying the conditional probabilities recorded along the branches of the path

$$ P(A_1\cap A_2\cap\cdots\cap A_n)=P(A_1)P(A_2\mid A_1)\cdots P(A_n\mid A_1\cap A_2\cap\cdots\cap A_{n-1}).

Note that any intermediate node along the path also corresponds to some intersection event and its probability is obtained by multiplying the corresponding conditional probabilities up to that node. For example, the event A₁ ∩ A₂ ∩ A₃ corresponds to the node shown in the figure, and its probability is

$$ P(A_1\cap A_2\cap A_3)=P(A_1)P(A_2\mid A_1)P(A_3\mid A_1\cap A_2).

@@ figures-10
Sequential description of the sample space of the 3-card selection problem in Example 1.10.

@@ figures-11
Sequential description of the sample space of the student problem in Example 1.11.

@@ figures-12
Visualization and verification of the total probability theorem. The events A₁, …, Aₙ form a partition of the sample space, so the event B can be decomposed into the disjoint union of its intersections Aᵢ ∩ B with the sets Aᵢ, i.e.,

$$ B=(A_1\cap B)\cup\cdots\cup(A_n\cap B).

Using the additivity axiom, it follows that

$$ P(B)=P(A_1\cap B)+\cdots+P(A_n\cap B).

Since, by the definition of conditional probability, we have

$$ P(A_i\cap B)=P(A_i)P(B\mid A_i),

the preceding equality yields

$$ P(B)=P(A_1)P(B\mid A_1)+\cdots+P(A_n)P(B\mid A_n).

For an alternative view, consider an equivalent sequential model, as shown on the right. The probability of the leaf Aᵢ ∩ B is the product P(Aᵢ)P(B | Aᵢ) of the probabilities along the path leading to that leaf. The event B consists of the three highlighted leaves and P(B) is obtained by adding their probabilities.

@@ figures-13
An example of the inference context that is implicit in Bayes’ rule. We observe a shade in a person’s X-ray (this is event B, the “effect”) and we want to estimate the likelihood of three mutually exclusive and collectively exhaustive potential causes: cause 1 (event A₁) is that there is a malignant tumor, cause 2 (event A₂) is that there is a nonmalignant tumor, and cause 3 (event A₃) corresponds to reasons other than a tumor. We assume that we know the probabilities P(Aᵢ) and P(B | Aᵢ), i = 1, 2, 3. Given that we see a shade (event B occurs), Bayes’ rule gives the conditional probabilities of the various causes as

$$ P(A_i\mid B)=\frac{P(A_i)P(B\mid A_i)}{P(A_1)P(B\mid A_1)+P(A_2)P(B\mid A_2)+P(A_3)P(B\mid A_3)},\quad i=1,2,3.

For an alternative view, consider an equivalent sequential model, as shown on the right. The probability P(A₁ | B) of a malignant tumor is the probability of the first highlighted leaf, which is P(A₁ ∩ B), divided by the total probability of the highlighted leaves, which is P(B).

@@ figures-14
(a) Network for Example 1.22. The number next to each link (i, j) indicates the probability that the link is up. (b) Series and parallel connections of three components in a reliability problem.

@@ figures-15
Sequential description of the sample space of an experiment involving three independent tosses of a biased coin. Along the branches of the tree, we record the corresponding conditional probabilities, and by the multiplication rule, the probability of obtaining a particular 3-toss sequence is calculated by multiplying the probabilities recorded along the corresponding path of the tree.

@@ figures-16
Illustration of the basic counting principle. The counting is carried out in r stages (r = 4 in the figure). The first stage has n₁ possible results. For every possible result of the first i − 1 stages, there are nᵢ possible results at the ith stage. The number of leaves is n₁n₂ ⋯ nᵣ. This is the desired count.
