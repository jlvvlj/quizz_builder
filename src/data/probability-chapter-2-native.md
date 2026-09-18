# Discrete Random Variables

@@ basic-concepts | 2.1 | Basic Concepts | section | 56-58
In many probabilistic models, the outcomes are of a numerical nature, e.g., if they correspond to instrument readings or stock prices. In other experiments, the outcomes are not numerical, but they may be associated with some numerical values of interest. For example, if the experiment is the selection of students from a given population, we may wish to consider their grade point average. When dealing with such numerical values, it is often useful to assign probabilities to them. This is done through the notion of a random variable.

Given an experiment and the corresponding set of possible outcomes (the sample space), a random variable associates a particular number with each outcome. We refer to this number as the numerical value or the experimental value of the random variable. Mathematically, a random variable is a real-valued function of the experimental outcome.

@figure 1

Figure 2.1: (a) Visualization of a random variable. It is a function that assigns a numerical value to each possible outcome of the experiment. (b) An example of a random variable. The experiment consists of two rolls of a 4-sided die, and the random variable is the maximum of the two rolls. If the outcome of the experiment is $(4,2)$, the experimental value of this random variable is $4$.

Here are some examples of random variables: in a sequence of five coin tosses, the number of heads; in two rolls of a die, the sum, the number of sixes, or the second roll raised to the fifth power; in message transmission, the time needed, the number of symbols received in error, or the delivery delay. The sequence of heads and tails itself is not a random variable unless it is assigned a numerical value.

@page 57

> Main Concepts Related to Random Variables

Starting with a probabilistic model of an experiment: a random variable is a real-valued function of the outcome; a function of a random variable defines another random variable; we can associate with each random variable certain averages, such as the mean and variance; a random variable can be conditioned on an event or another random variable; and there is a notion of independence from an event or another random variable.

@endcard

A random variable is called discrete if its range (the set of values that it can take) is finite or at most countably infinite. For example, the random variables involving the coin tosses and die rolls above can take at most a finite number of numerical values, and are therefore discrete.

A random variable that can take an uncountably infinite number of values is not discrete. For an example, consider the experiment of choosing a point $a$ from the interval $[-1,1]$. The random variable that associates the numerical value $a^{2}$ to the outcome $a$ is not discrete. On the other hand, the random variable that associates with $a$ the numerical value

$$\operatorname{sgn}(a)=\begin{cases}1&\text{if }a>0,\\0&\text{if }a=0,\\-1&\text{if }a<0\end{cases}$$

is discrete.

@page 58

> Concepts Related to Discrete Random Variables

A discrete random variable is a real-valued function of the outcome of the experiment that can take a finite or countably infinite number of values. It has an associated probability mass function (PMF), which gives the probability of each numerical value it can take. A function of a random variable defines another random variable, whose PMF can be obtained from the PMF of the original random variable.

@endcard

### Everyday example: counting deliveries

A courier's daily log contains addresses, delivery times, and customer names. Define $X$ as the number of late deliveries in that log. Each possible log produces exactly one number: $0,1,2,\ldots$. The log is the outcome; the count is the value of the random variable. Defining $Y=5X$ makes the total compensation, at five dollars per late delivery, another random variable.

@summary A random variable assigns a number to an outcome. Discrete describes its possible numerical values, not necessarily the underlying sample space.

@@ pmf-introduction | 2.2 | Intro | introduction | 58-60
The most important way to characterize a random variable is through the probabilities of the values that it can take. For a discrete random variable $X$, these are captured by the probability mass function (PMF for short) of $X$, denoted $p_{X}$. In particular, if $x$ is any possible value of $X$, the probability mass of $x$, denoted $p_{X}(x)$, is the probability of the event $\{X=x\}$ consisting of all outcomes that give rise to a value of $X$ equal to $x$:

$$p_{X}(x)=P(\{X=x\}).$$

For example, let the experiment consist of two independent tosses of a fair coin, and let $X$ be the number of heads obtained. Then the PMF of $X$ is

$$p_{X}(x)=\begin{cases}1/4&\text{if }x=0\text{ or }x=2,\\1/2&\text{if }x=1,\\0&\text{otherwise.}\end{cases}$$

@page 59

We will use upper case characters to denote random variables, and lower case characters to denote real numbers such as the numerical values of a random variable. The notation $P(X=x)$ means the probability of the event $\{X=x\}$.

Note that

$$\sum_{x} p_{X}(x)=1,$$

where in the summation above, $x$ ranges over all the possible numerical values of $X$. This follows from the additivity and normalization axioms, because the events $\{X=x\}$ are disjoint and form a partition of the sample space, as $x$ ranges over all possible values of $X$. By a similar argument, for any set $S$ of real numbers, we also have

$$P(X\in S)=\sum_{x\in S}p_{X}(x).$$

For example, if $X$ is the number of heads obtained in two independent tosses of a fair coin, the probability of at least one head is

$$P(X>0)=\sum_{x>0}p_{X}(x)=\frac{1}{2}+\frac{1}{4}=\frac{3}{4}.$$

> Calculation of the PMF of a Random Variable X

For each possible value $x$ of $X$: collect all the possible outcomes that give rise to the event $\{X=x\}$; add their probabilities to obtain $p_{X}(x)$.

@endcard

@figure 2

Figure 2.2: (a) To calculate the PMF, group together the outcomes that produce the same value of $X$. (b) For the maximum of two independent fair 4-sided die rolls, there are four possible values. The outcomes $(1,2),(2,2),(2,1)$ all produce $X=2$. Each has probability $1/16$, so $p_{X}(2)=3/16$. Similarly the masses at $1,3,4$ are $1/16,5/16,7/16$.

### Everyday example: orders per minute

Suppose a café receives zero orders with probability $0.2$, one with probability $0.5$, and two with probability $0.3$. This is a valid PMF because the probabilities are nonnegative and sum to one. The probability of at least one order is $0.5+0.3=0.8$. Add probabilities for values satisfying the event; do not add the order counts themselves.

@summary The PMF assigns a probability to each possible value. Add its entries over the values of interest to find an event probability.

@@ bernoulli | 2.2 | The Bernoulli Random Variable | subsection | 59-60
Consider the toss of a biased coin, which comes up a head with probability $p$, and a tail with probability $1-p$. The Bernoulli random variable takes the two values $1$ and $0$, depending on whether the outcome is a head or a tail:

$$p_{X}(k)=\begin{cases}p&\text{if }k=1,\\1-p&\text{if }k=0,\\0&\text{otherwise.}\end{cases}$$

For all its simplicity, the Bernoulli random variable is very important. In practice, it is used to model generic probabilistic situations with just two outcomes, such as a telephone that can be free or busy; a person who can be healthy or sick with a certain disease; or a preference for or against a political candidate. Combining multiple Bernoulli random variables produces more complicated random variables.

### Everyday example: a successful payment

Define $X=1$ when a card payment succeeds and $X=0$ when it fails. If a payment succeeds with probability $p=0.98$, then $p_{X}(1)=0.98$ and $p_{X}(0)=0.02$. These numbers describe a single attempt. Counting successful payments across several attempts requires another model.

@summary Bernoulli models one success-or-failure trial, with success encoded as one and failure as zero.

@@ binomial | 2.2 | The Binomial Random Variable | subsection | 61-61
A biased coin is tossed $n$ times. At each toss, the coin comes up a head with probability $p$, and a tail with probability $1-p$, independently of prior tosses. Let $X$ be the number of heads in the $n$-toss sequence. We refer to $X$ as a binomial random variable with parameters $n$ and $p$.

Its PMF is obtained by counting the sequences with exactly $k$ successes. Each such sequence has probability $p^{k}(1-p)^{n-k}$, and there are $\binom{n}{k}$ such sequences:

$$p_{X}(k)=P(X=k)=\binom{n}{k} p^{k}(1-p)^{n-k},\qquad k=0,1,\ldots,n.$$

Here $k$ denotes a possible integer value of the random variable. The normalization property, specialized to the binomial random variable, is written as

$$\sum_{k=0}^{n}\binom{n}{k} p^{k}(1-p)^{n-k}=1.$$

@figure 3

Figure 2.3: The PMF of a binomial random variable. If $p=1/2$, the PMF is symmetric around $n/2$. Otherwise, the PMF is skewed towards $0$ if $p<1/2$, and towards $n$ if $p>1/2$.

### Everyday example: five deliveries

Five deliveries each arrive on time with probability $0.8$, independently. Let $X$ count the on-time deliveries. Exactly four arrive on time with probability

$$P(X=4)=\binom{5}{4}(0.8)^{4}(0.2)=0.4096.$$

The factor $5$ accounts for the five possible positions of the late delivery. The binomial model requires a fixed number of trials, the same success probability, and independence; shared traffic disruption could violate the last assumption.

@summary Binomial counts successes in a fixed number of independent Bernoulli trials with the same success probability.

@@ geometric | 2.2 | The Geometric Random Variable | subsection | 61-62
Suppose that we repeatedly and independently toss a biased coin with probability of a head $p$, where $0<p<1$. The geometric random variable is the number $X$ of tosses needed for a head to come up for the first time. Its PMF is given by

$$p_{X}(k)=(1-p)^{k-1}p,\qquad k=1,2,\ldots,$$

since $(1-p)^{k-1}p$ is the probability of the sequence consisting of $k-1$ successive tails followed by a head. This is a legitimate PMF because

$$\sum_{k=1}^{\infty}p_{X}(k)=\sum_{k=1}^{\infty}(1-p)^{k-1}p=p\sum_{k=0}^{\infty}(1-p)^{k}=p\frac{1}{1-(1-p)}=1.$$

More generally, we can interpret the geometric random variable in terms of repeated independent trials until the first success. Each trial has probability of success $p$ and the number of trials until (and including) the first success is modeled by the geometric random variable.

@figure 4

Figure 2.4: The PMF $p_{X}(k)=(1-p)^{k-1}p$, for $k=1,2,\ldots$, of a geometric random variable. It decreases as a geometric progression with parameter $1-p$.

### Everyday example: retrying a connection

A connection succeeds independently with probability $0.8$ on each attempt. To succeed for the first time on attempt three, the first two must fail and the third must succeed: $P(X=3)=(0.2)^{2}(0.8)=0.032$. The count includes the successful attempt, so the smallest possible value is one, not zero.

@summary Geometric counts trials through the first success. A value of k requires k−1 failures followed by one success.

@@ poisson | 2.2 | The Poisson Random Variable | subsection | 62-63
A Poisson random variable takes nonnegative integer values. Its PMF is given by

$$p_{X}(k)=e^{-\lambda}\frac{\lambda^{k}}{k!},\qquad k=0,1,2,\ldots,$$

where $\lambda$ is a positive parameter characterizing the PMF. It is a legitimate PMF because

$$\sum_{k=0}^{\infty}e^{-\lambda}\frac{\lambda^{k}}{k!}=e^{-\lambda}\left(1+\lambda+\frac{\lambda^{2}}{2!}+\frac{\lambda^{3}}{3!}+\cdots\right)=e^{-\lambda}e^{\lambda}=1.$$

Think of a binomial random variable with very small $p$ and very large $n$: for example, the number of typographical errors among many words, when each word has a very small probability of being misspelled, or the number of cars involved in accidents in a city on a given day. A Poisson random variable can approximate these counts when the rare-event assumptions are suitable.

@figure 5

Figure 2.5: The Poisson PMF for different values of $\lambda$. If $\lambda<1$, the PMF decreases monotonically. If $\lambda>1$, it first increases and then decreases as $k$ increases.

More precisely, the Poisson PMF with parameter $\lambda$ is a good approximation for a binomial PMF with parameters $n$ and $p$, provided $\lambda=np$, $n$ is very large, and $p$ is very small, i.e.,

$$e^{-\lambda}\frac{\lambda^{k}}{k!}\approx\frac{n!}{(n-k)!k!}p^{k}(1-p)^{n-k},\qquad k=0,1,\ldots,n.$$

For example, let $n=100$ and $p=0.01$. The probability of $k=5$ successes using the binomial PMF is

$$\frac{100!}{95!5!}(0.01)^{5}(0.99)^{95}\approx0.00290.$$

Using the Poisson PMF with $\lambda=np=1$, this probability is approximated by

$$e^{-1}\frac{1}{5!}\approx0.00306.$$

### Everyday example: support requests

If requests in a short time interval are reasonably modeled by a Poisson count with $\lambda=3$, the chance of receiving no requests is $e^{-3}\approx0.0498$. The parameter describes the average count in the chosen interval; changing the interval changes the appropriate parameter.

@summary Poisson models nonnegative counts and approximates binomial counts for many independent trials with small success probabilities and λ=np.

@@ functions-of-random-variables | 2.3 | Functions of Random Variables | section | 63-65
Consider a probability model of today’s weather, let the random variable $X$ be the temperature in degrees Celsius, and consider the transformation $Y=1.8X+32$, which gives the temperature in degrees Fahrenheit. In this example, $Y$ is a linear function of $X$, of the form

$$Y=g(X)=aX+b,$$

where $a$ and $b$ are scalars. We may also consider nonlinear functions of the general form $Y=g(X)$. For example, to display positive temperatures on a logarithmic scale, we could use $g(X)=\log X$.

If $Y=g(X)$ is a function of a random variable $X$, then $Y$ is also a random variable, since it provides a numerical value for each possible outcome. This is because every outcome in the sample space defines a numerical value $x$ for $X$ and hence also the numerical value $y=g(x)$ for $Y$. If $X$ is discrete with PMF $p_{X}$, then $Y$ is also discrete, and its PMF $p_{Y}$ can be calculated using the PMF of $X$. In particular, to obtain $p_{Y}(y)$ for any $y$, we add the probabilities of all values of $x$ such that $g(x)=y$:

$$p_{Y}(y)=\sum_{\{x\mid g(x)=y\}}p_{X}(x).$$

@page 64

### Example 2.1. Absolute values and squares

Let $Y=|X|$, where

$$p_{X}(x)=\begin{cases}1/9&\text{if }x\text{ is an integer in }[-4,4],\\0&\text{otherwise.}\end{cases}$$

The possible values of $Y$ are $0,1,2,3,4$. To compute $p_{Y}(y)$, we must add $p_{X}(x)$ over all values with $|x|=y$. Only $x=0$ gives $y=0$, whereas two values of $X$ give each positive value of $Y$:

$$p_{Y}(0)=p_{X}(0)=\frac{1}{9},\qquad p_{Y}(1)=p_{X}(-1)+p_{X}(1)=\frac{2}{9}.$$

Thus,

$$p_{Y}(y)=\begin{cases}2/9&\text{if }y=1,2,3,4,\\1/9&\text{if }y=0,\\0&\text{otherwise.}\end{cases}$$

For another related example, let $Z=X^{2}$. We can view it as the square of $X$ or the square of $Y$. Applying either transformation rule gives

$$p_{Z}(z)=\sum_{\{x\mid x^{2}=z\}}p_{X}(x)=\sum_{\{y\mid y^{2}=z\}}p_{Y}(y)=\begin{cases}2/9&\text{if }z=1,4,9,16,\\1/9&\text{if }z=0,\\0&\text{otherwise.}\end{cases}$$

@figure 7

Figure 2.7: The PMFs of $X$ and $Y=|X|$ in Example 2.1. Opposite values merge into one absolute value, so their probabilities add.

### Everyday example: a parking fee

Parking lasts one, two, or three hours with probabilities $0.5,0.3,0.2$. A fee rule charges five dollars for up to two hours and eight dollars for three hours. Both one-hour and two-hour stays produce the same fee, so $P(Y=5)=0.5+0.3=0.8$ and $P(Y=8)=0.2$.

@summary Transform the values, then collect probabilities of all original values that produce the same new value.

@@ expectation-mean-variance | 2.4 | Expectation, Mean, and Variance | section | 65-76
The PMF of a random variable $X$ provides us with several numbers, the probabilities of all the possible values of $X$. It would be desirable to summarize this information in a single representative number. This is accomplished by the expectation of $X$, which is a weighted (in proportion to probabilities) average of the possible values of $X$.

As motivation, suppose you spin a wheel of fortune many times. At each spin, one of the numbers $m_{1},m_{2},\ldots,m_{n}$ comes up with corresponding probability $p_{1},p_{2},\ldots,p_{n}$, and this is your monetary reward from that spin. Suppose that you spin the wheel $k$ times, and that $k_{i}$ is the number of times that the outcome is $m_{i}$. Then, the total amount received is $m_{1}k_{1}+m_{2}k_{2}+\cdots+m_{n}k_{n}$. The amount received per spin is

$$M=\frac{m_{1}k_{1}+m_{2}k_{2}+\cdots+m_{n}k_{n}}{k}.$$

If the number of spins $k$ is very large, and if we are willing to interpret probabilities as relative frequencies, it is reasonable to anticipate that $m_{i}$ comes up a fraction of times that is roughly equal to $p_{i}$:

$$p_{i}\approx\frac{k_{i}}{k},\qquad i=1,\ldots,n.$$

Thus, the amount of money per spin that you expect to receive is

$$M=\frac{m_{1}k_{1}+m_{2}k_{2}+\cdots+m_{n}k_{n}}{k}\approx m_{1}p_{1}+m_{2}p_{2}+\cdots+m_{n}p_{n}.$$

@page 66

> Expectation

We define the expected value (also called the expectation or the mean) of a random variable $X$, with PMF $p_{X}(x)$, by

$$E[X]=\sum_{x} xp_{X}(x).$$

@endcard

### Example 2.2. Mean number of heads

Consider two independent coin tosses, each with a $3/4$ probability of a head, and let $X$ be the number of heads obtained. This is a binomial random variable with parameters $n=2$ and $p=3/4$. Its PMF is

$$p_{X}(k)=\begin{cases}(1/4)^{2}&\text{if }k=0,\\2(1/4)(3/4)&\text{if }k=1,\\(3/4)^{2}&\text{if }k=2.\end{cases}$$

So the mean is

$$E[X]=0\left(\frac{1}{4}\right)^{2}+1\left(2\frac{1}{4}\frac{3}{4}\right)+2\left(\frac{3}{4}\right)^{2}=\frac{24}{16}=\frac{3}{2}.$$

It is useful to view the mean of $X$ as a representative value of $X$, which lies somewhere in the middle of its range. It need not be a possible value: one and a half heads is an average, not an outcome of two tosses.

### When an expectation exists

When dealing with random variables that take a countably infinite number of values, one has to deal with the possibility that the infinite sum $\sum_{x} xp_{X}(x)$ is not well-defined. More concretely, we will say that the expectation is well-defined if $\sum_{x}|x|p_{X}(x)<\infty$. In that case, the infinite sum converges to a finite value that is independent of the order in which the various terms are summed.

For an example where the expectation is not well-defined, consider a random variable $X$ that takes the value $2^{k}$ with probability $2^{-k}$, for $k=1,2,\ldots$. For a more subtle example, consider $X$ taking the values $2^{k}$ and $-2^{k}$, each with probability $2^{-k}$, for $k=2,3,\ldots$. The expectation is again undefined, even though the PMF is symmetric around zero. Symmetry alone does not justify saying that $E[X]=0$.

@figure 8

Figure 2.8: Interpretation of the mean as a center of gravity. Given a bar with a weight $p_{X}(x)$ placed at each point $x$ with $p_{X}(x)>0$, the center of gravity $c$ is the point at which the sum of the torques from the weights to its left equals the sum of the torques from the weights to its right:

$$\sum_{x}(x-c)p_{X}(x)=0,\qquad c=\sum_{x} xp_{X}(x)=E[X].$$

@page 67

There are many other quantities that can be associated with a random variable and its PMF. For example, we define the 2nd moment of the random variable $X$ as the expected value of the random variable $X^{2}$. More generally, we define the $n$th moment as $E[X^{n}]$, the expected value of the random variable $X^{n}$. With this terminology, the 1st moment of $X$ is just the mean.

The most important quantity associated with a random variable $X$, other than the mean, is its variance, which is denoted by $\operatorname{var}(X)$ and is defined as the expected value of the random variable $(X-E[X])^{2}$, i.e.,

$$\operatorname{var}(X)=E[(X-E[X])^{2}].$$

Since $(X-E[X])^{2}$ can only take nonnegative values, the variance is always nonnegative. The variance provides a measure of dispersion of $X$ around its mean. Another measure of dispersion is the standard deviation of $X$, which is defined as the square root of the variance and is denoted by $\sigma_{X}$:

$$\sigma_{X}=\sqrt{\operatorname{var}(X)}.$$

The standard deviation is often easier to interpret, because it has the same units as $X$. For example, if $X$ measures length in meters, the units of variance are square meters, while the units of standard deviation are meters.

One way to calculate $\operatorname{var}(X)$ is to calculate the PMF of the random variable $(X-E[X])^{2}$ and then use the definition of expected value. This is a function of $X$, so its PMF is obtained by collecting the probabilities of the original values that yield each squared deviation.

@page 68

### Example 2.3. Variance through squared deviations

Let $X$ be uniform on the integers from $-4$ to $4$: every value has probability $1/9$. Symmetry and direct calculation both give

$$E[X]=\sum_{x} xp_{X}(x)=\frac{1}{9}\sum_{x=-4}^{4}x=0.$$

Let $Z=(X-E[X])^{2}=X^{2}$. The PMF of $Z$ assigns probability $1/9$ to zero and $2/9$ to each of $1,4,9,16$. Consequently,

$$\operatorname{var}(X)=E[Z]=\sum_{z} zp_{Z}(z)=0\frac{1}{9}+1\frac{2}{9}+4\frac{2}{9}+9\frac{2}{9}+16\frac{2}{9}=\frac{60}{9}.$$

There is an easier method that uses the PMF of $X$ directly, without finding the PMF of the transformed random variable.

> Expected Value Rule for Functions of Random Variables

Let $X$ be a random variable with PMF $p_{X}(x)$, and let $g(X)$ be a real-valued function of $X$. Then, the expected value of the random variable $g(X)$ is given by

$$E[g(X)]=\sum_{x} g(x)p_{X}(x).$$

@endcard

@page 69

To verify this rule, write $Y=g(X)$ and use $p_{Y}(y)=\sum_{\{x\mid g(x)=y\}}p_{X}(x)$. Every value of $x$ appears in the group for its corresponding value $y=g(x)$:

$$\begin{aligned}E[g(X)]&=E[Y]=\sum_{y} yp_{Y}(y)\\&=\sum_{y} y\sum_{\{x\mid g(x)=y\}}p_{X}(x)\\&=\sum_{y}\sum_{\{x\mid g(x)=y\}}yp_{X}(x)\\&=\sum_{y}\sum_{\{x\mid g(x)=y\}}g(x)p_{X}(x)\\&=\sum_{x}g(x)p_{X}(x).\end{aligned}$$

Using the expected value rule, we can write the variance of $X$ as

$$\operatorname{var}(X)=E[(X-E[X])^{2}]=\sum_{x}(x-E[X])^{2}p_{X}(x).$$

Similarly, the $n$th moment is given by

$$E[X^{n}]=\sum_{x}x^{n}p_{X}(x),$$

and there is no need to calculate the PMF of $X^{n}$.

### Example 2.3 (continued). The direct calculation

For $X$ uniform on $-4,-3,\ldots,4$, we already know that $E[X]=0$. Applying the expected value rule directly gives the same variance:

$$\begin{aligned}\operatorname{var}(X)&=\sum_{x}(x-E[X])^{2}p_{X}(x)\\&=\frac{1}{9}\sum_{x=-4}^{4}x^{2}\\&=\frac{16+9+4+1+0+1+4+9+16}{9}=\frac{60}{9}.\end{aligned}$$

@page 70

Since every term in $\sum_{x}(x-E[X])^{2}p_{X}(x)$ is nonnegative, the sum is zero if and only if $(x-E[X])^{2}p_{X}(x)=0$ for every $x$. This condition implies that for any $x$ with $p_{X}(x)>0$, we must have $x=E[X]$. The experimental value then equals the mean with probability one.

> Variance

The variance of a random variable $X$ is defined by

$$\operatorname{var}(X)=E[(X-E[X])^{2}]$$

and can be calculated as

$$\operatorname{var}(X)=\sum_{x}(x-E[X])^{2}p_{X}(x).$$

It is always nonnegative. Its square root is denoted by $\sigma_{X}$ and is called the standard deviation.

@endcard

Let us now use the expected value rule for functions in order to derive some important properties of the mean and the variance. We start with a random variable $X$ and define a new random variable $Y$, of the form $Y=aX+b$, where $a$ and $b$ are given scalars. We have

$$E[Y]=\sum_{x}(ax+b)p_{X}(x)=a\sum_{x}xp_{X}(x)+b\sum_{x}p_{X}(x)=aE[X]+b.$$

Furthermore,

$$\begin{aligned}\operatorname{var}(Y)&=\sum_{x}(ax+b-E[aX+b])^{2}p_{X}(x)\\&=\sum_{x}(ax+b-aE[X]-b)^{2}p_{X}(x)\\&=a^{2}\sum_{x}(x-E[X])^{2}p_{X}(x)=a^{2}\operatorname{var}(X).\end{aligned}$$

@page 71

> Mean and Variance of a Linear Function of a Random Variable

Let $Y=aX+b$, where $a$ and $b$ are given scalars. Then,

$$E[Y]=aE[X]+b,\qquad\operatorname{var}(Y)=a^{2}\operatorname{var}(X).$$

@endcard

> Variance in Terms of Moments Expression

$$\operatorname{var}(X)=E[X^{2}]-(E[X])^{2}.$$

@endcard

This expression is verified by expanding the square and summing each term:

$$\begin{aligned}\operatorname{var}(X)&=\sum_{x}(x-E[X])^{2}p_{X}(x)\\&=\sum_{x}\bigl(x^{2}-2xE[X]+(E[X])^{2}\bigr)p_{X}(x)\\&=\sum_{x}x^{2}p_{X}(x)-2E[X]\sum_{x}xp_{X}(x)+(E[X])^{2}\sum_{x}p_{X}(x)\\&=E[X^{2}]-2(E[X])^{2}+(E[X])^{2}\\&=E[X^{2}]-(E[X])^{2}.\end{aligned}$$

### Example 2.4. Mean and Variance of the Bernoulli

Consider a biased coin that comes up a head with probability $p$ and a tail with probability $1-p$. The Bernoulli variable $X$ is one for a head and zero for a tail. Its mean, second moment, and variance are

$$\begin{aligned}E[X]&=1p+0(1-p)=p,\\E[X^{2}]&=1^{2}p+0^{2}(1-p)=p,\\\operatorname{var}(X)&=E[X^{2}]-(E[X])^{2}=p-p^{2}=p(1-p).\end{aligned}$$

@page 72

### Example 2.5. Discrete Uniform Random Variable

What is the mean and variance of the roll of a fair six-sided die? Every integer from one to six has probability $1/6$. Symmetry around $3.5$ gives $E[X]=3.5$, and

$$\operatorname{var}(X)=\frac{1}{6}(1^{2}+2^{2}+3^{2}+4^{2}+5^{2}+6^{2})-(3.5)^{2}=\frac{35}{12}.$$

A discrete uniformly distributed random variable takes one out of a range of contiguous integer values, with equal probability. For integers $a<b$, its PMF is

$$p_{X}(k)=\begin{cases}\dfrac{1}{b-a+1}&\text{if }k=a,a+1,\ldots,b,\\0&\text{otherwise.}\end{cases}$$

The mean is $E[X]=(a+b)/2$, since the PMF is symmetric around $(a+b)/2$. To calculate the variance, first take $a=1$ and $b=n$. Using the sum of squares gives

$$E[X^{2}]=\frac{1}{n}\sum_{k=1}^{n}k^{2}=\frac{1}{6}(n+1)(2n+1).$$

Therefore,

$$\begin{aligned}\operatorname{var}(X)&=\frac{1}{6}(n+1)(2n+1)-\frac{1}{4}(n+1)^{2}\\&=\frac{1}{12}(n+1)(4n+2-3n-3)=\frac{n^{2}-1}{12}.\end{aligned}$$

For general $a$ and $b$, shifting the uniform variable on $[1,b-a+1]$ by $a-1$ does not change its variance. Substituting $n=b-a+1$ gives

$$\operatorname{var}(X)=\frac{(b-a+1)^{2}-1}{12}=\frac{(b-a)(b-a+2)}{12}.$$

@figure 9

Figure 2.9: PMF of the discrete random variable uniformly distributed between integers $a$ and $b$. Its mean is $(a+b)/2$, and its variance is $(b-a)(b-a+2)/12$.

@page 73

### Example 2.6. The Mean of the Poisson

For a Poisson random variable with PMF $p_{X}(k)=e^{-\lambda}\lambda^{k}/k!$, the mean can be calculated as follows:

$$\begin{aligned}E[X]&=\sum_{k=0}^{\infty}k e^{-\lambda}\frac{\lambda^{k}}{k!}\\&=\sum_{k=1}^{\infty}k e^{-\lambda}\frac{\lambda^{k}}{k!}\\&=\lambda\sum_{k=1}^{\infty}e^{-\lambda}\frac{\lambda^{k-1}}{(k-1)!}\\&=\lambda\sum_{m=0}^{\infty}e^{-\lambda}\frac{\lambda^{m}}{m!}=\lambda.\end{aligned}$$

The first term is zero; cancel $k$ against $k!$, then set $m=k-1$. The remaining sum is one by the normalization of the Poisson PMF. A similar calculation gives $\operatorname{var}(X)=\lambda$.

@page 74

Expected values often provide a convenient vehicle for choosing optimally between several candidate decisions that result in different expected rewards. If we view the expected reward of a decision as its average payoff over a large number of trials, it is reasonable to choose a decision with maximum expected reward.

### Example 2.7. The Quiz Problem

In a quiz game, question one is answered correctly with probability $0.8$ and pays 100 dollars; question two is answered correctly with probability $0.5$ and pays 200 dollars. A wrong answer to the first attempted question ends the game. A correct answer allows the second question to be attempted. Which order maximizes the expected total prize $X$?

@figure 10

Figure 2.10: Sequential descriptions of the quiz game when question one or question two is attempted first. The branch probabilities specify the probabilities of the second answer after a correct first answer.

Answer question one first: $p_{X}(0)=0.2$, $p_{X}(100)=0.8(0.5)$, and $p_{X}(300)=0.8(0.5)$. The expected prize is

$$E[X]=0.8(0.5)(100)+0.8(0.5)(300)=160.$$

Answer question two first: $p_{X}(0)=0.5$, $p_{X}(200)=0.5(0.2)$, and $p_{X}(300)=0.5(0.8)$. The expected prize is

$$E[X]=0.5(0.2)(200)+0.5(0.8)(300)=140.$$

Thus, attempting the easier question one first is preferable. For general success probabilities $p_{1},p_{2}$ and prizes $v_{1},v_{2}$, the two expected prizes are

$$\begin{aligned}E[X\text{, order }1,2]&=p_{1}(1-p_{2})v_{1}+p_{1}p_{2}(v_{1}+v_{2})=p_{1}v_{1}+p_{1}p_{2}v_{2},\\E[X\text{, order }2,1]&=p_{2}(1-p_{1})v_{2}+p_{2}p_{1}(v_{2}+v_{1})=p_{2}v_{2}+p_{2}p_{1}v_{1}.\end{aligned}$$

Question one should be first exactly when

$$p_{1}v_{1}+p_{1}p_{2}v_{2}\ge p_{2}v_{2}+p_{2}p_{1}v_{1}.$$

When both probabilities are less than one, this is equivalent to

$$\frac{p_{1}v_{1}}{1-p_{1}}\ge\frac{p_{2}v_{2}}{1-p_{2}}.$$

The index $pv/(1-p)$ combines reward and risk. This comparison concerns expected reward; it does not guarantee the best prize in any one game.

@page 75

Unless $g(X)$ is a linear function, it is not generally true that $E[g(X)]$ equals $g(E[X])$.

### Example 2.8. Average Speed Versus Average Time

If the weather is good, which happens with probability $0.6$, Alice walks the two miles to class at speed $V=5$ miles per hour. Otherwise she drives her motorcycle at $V=30$ miles per hour. The travel time is $T=2/V$, so its PMF is

$$p_{T}(t)=\begin{cases}0.6&\text{if }t=2/5\text{ hours},\\0.4&\text{if }t=2/30\text{ hours}.\end{cases}$$

The correct average time is

$$E[T]=0.6\frac{2}{5}+0.4\frac{2}{30}=\frac{4}{15}\text{ hours}=16\text{ minutes}.$$

But $E[V]=0.6(5)+0.4(30)=15$ miles per hour, and dividing distance by this average would give $2/15$ hours, only eight minutes. In this example,

$$E\left[\frac{2}{V}\right]\ne\frac{2}{E[V]}.$$

### Everyday example: reliable arrival times

Two buses both take an average of ten minutes to arrive. One takes nine or eleven minutes with equal probability; the other takes five or fifteen. Both means are ten, but their variances are one and twenty-five square minutes. Their standard deviations are one and five minutes. The first bus is more predictable even though neither has a smaller mean wait.

@summary Expectation is a probability-weighted average; variance measures squared spread. Transform values before averaging. Adding a constant shifts the mean but leaves variance unchanged; multiplying by a scales variance by a².

@@ joint-pmf-introduction | 2.5 | Intro | introduction | 76-78
Probabilistic models often involve several random variables of interest. For example, in a medical diagnosis context, the results of several tests may be significant, or in a networking context, the workloads of several gateways may be of interest. All of these random variables are associated with the same experiment, sample space, and probability law, and their values may relate in interesting ways. This motivates us to consider probabilities involving simultaneously the numerical values of several random variables and to investigate their mutual couplings.

Consider two discrete random variables $X$ and $Y$ associated with the same experiment. The joint PMF of $X$ and $Y$ is defined by

$$p_{X,Y}(x,y)=P(X=x,Y=y)$$

for all pairs of numerical values $(x,y)$ that $X$ and $Y$ can take. Here $P(X=x,Y=y)$ abbreviates $P(\{X=x\}\cap\{Y=y\})$, or $P(X=x\text{ and }Y=y)$.

The joint PMF determines the probability of any event that can be specified in terms of the random variables $X$ and $Y$. For example, if $A$ is the set of all pairs $(x,y)$ that have a certain property, then

$$P((X,Y)\in A)=\sum_{(x,y)\in A}p_{X,Y}(x,y).$$

In fact, we can calculate the PMFs of $X$ and $Y$ by using the formulas

$$p_{X}(x)=\sum_{y} p_{X,Y}(x,y),\qquad p_{Y}(y)=\sum_{x}p_{X,Y}(x,y).$$

The formula for $p_{X}(x)$ can be verified using the calculation

$$p_{X}(x)=P(X=x)=\sum_{y} P(X=x,Y=y)=\sum_{y}p_{X,Y}(x,y),$$

where the second equality follows because $\{X=x\}$ is the union of the disjoint events $\{X=x,Y=y\}$ as $y$ ranges over the values of $Y$. We refer to $p_{X}$ and $p_{Y}$ as marginal PMFs to distinguish them from the joint PMF.

@figure 11

Figure 2.11: The joint PMF is represented by a table where each square gives $p_{X,Y}(x,y)$. Sum a column to get $p_{X}(x)$; sum a row to get $p_{Y}(y)$. In the displayed table, $p_{X}(2)=6/20$ and $p_{Y}(2)=7/20$.

### Everyday example: an order with a drink

Let $X$ indicate whether an order includes a sandwich and $Y$ indicate whether it includes a drink. Suppose the four probabilities for $(X,Y)=(0,0),(1,0),(0,1),(1,1)$ are $0.1,0.2,0.3,0.4$. The probability of a sandwich is $0.2+0.4=0.6$; the probability of a drink is $0.3+0.4=0.7$. The joint entry $0.4$ describes both together, which cannot in general be recovered from the two marginal probabilities alone.

@summary Joint PMFs describe pairs of values. Sum over the other variable to obtain a marginal PMF.

@@ functions-of-multiple-random-variables | 2.5 | Functions of Multiple Random Variables | subsection | 77-77
When there are multiple random variables of interest, it is possible to generate new random variables by considering functions involving several of these random variables. In particular, a function $Z=g(X,Y)$ of the random variables $X$ and $Y$ defines another random variable. Its PMF can be calculated from the joint PMF $p_{X,Y}$ according to

$$p_{Z}(z)=\sum_{\{(x,y)\mid g(x,y)=z\}}p_{X,Y}(x,y).$$

Furthermore, the expected value rule for functions naturally extends and takes the form

$$E[g(X,Y)]=\sum_{x,y}g(x,y)p_{X,Y}(x,y).$$

In the special case where $g$ is linear and of the form $aX+bY+c$, where $a,b,c$ are given scalars, we have

$$E[aX+bY+c]=aE[X]+bE[Y]+c.$$

### Everyday example: the total bill

Let $X$ and $Y$ indicate a sandwich and a drink, with joint probabilities $0.1,0.2,0.3,0.4$ for $(0,0),(1,0),(0,1),(1,1)$. A sandwich costs six dollars and a drink costs three, so $Z=6X+3Y$. The bill takes values $0,6,3,9$ with those probabilities. Its mean is $6(0.6)+3(0.7)=5.7$ dollars. Linearity works even when sandwich and drink choices are dependent.

@summary To transform several random variables, group pairs producing the same result. For a mean, weight the transformed value by the joint probability. Linearity does not require independence.

@@ more-than-two-random-variables | 2.5 | More than Two Random Variables | subsection | 78-80
The joint PMF of three random variables $X,Y,Z$ is defined in analogy with the above as

$$p_{X,Y,Z}(x,y,z)=P(X=x,Y=y,Z=z),$$

for all possible triplets of numerical values $(x,y,z)$. Corresponding marginal PMFs are analogously obtained by equations such as

$$p_{X,Y}(x,y)=\sum_{z}p_{X,Y,Z}(x,y,z),\qquad p_{X}(x)=\sum_{y}\sum_{z}p_{X,Y,Z}(x,y,z).$$

The expected value rule for functions takes the form

$$E[g(X,Y,Z)]=\sum_{x,y,z}g(x,y,z)p_{X,Y,Z}(x,y,z),$$

and if $g$ is linear and of the form $aX+bY+cZ+d$, then

$$E[aX+bY+cZ+d]=aE[X]+bE[Y]+cE[Z]+d.$$

For any random variables $X_{1},\ldots,X_{n}$ and scalars $a_{1},\ldots,a_{n}$, this extends to

$$E[a_{1}X_{1}+\cdots+a_{n}X_{n}]=a_{1}E[X_{1}]+\cdots+a_{n}E[X_{n}].$$

@page 79

### Example 2.9. Mean of the Binomial

A class has 300 students, each with probability $1/3$ of getting an A, independently of the other students. Let $X_{i}=1$ if student $i$ gets an A, and $X_{i}=0$ otherwise. Each is Bernoulli with mean $1/3$ and variance $2/9$. The number receiving an A is $X=X_{1}+\cdots+X_{300}$. Therefore,

$$E[X]=\sum_{i=1}^{300}E[X_{i}]=\sum_{i=1}^{300}\frac{1}{3}=100.$$

For $n$ students and probability $p$, the same calculation gives $E[X]=np$. Independence makes the count binomial, but the expectation of a sum equals the sum of expectations regardless of independence.

### Example 2.10. The Hat Problem

Suppose $n$ people throw their hats in a box and then each picks up one hat at random. What is the expected number $X$ who recover their own hat? Define $X_{i}=1$ if person $i$ recovers their own hat, and zero otherwise. Since $P(X_{i}=1)=1/n$,

$$E[X_{i}]=1\frac{1}{n}+0\left(1-\frac{1}{n}\right)=\frac{1}{n}.$$

Now $X=X_{1}+\cdots+X_{n}$, so

$$E[X]=E[X_{1}]+\cdots+E[X_{n}]=n\frac{1}{n}=1.$$

The indicators are dependent: picking one hat affects what remains. Linearity still applies. The answer is one regardless of the number of people.

@page 80

> Summary of Facts About Joint PMFs

Let $X$ and $Y$ be random variables associated with the same experiment. Their joint PMF is $p_{X,Y}(x,y)=P(X=x,Y=y)$. The marginal PMFs follow by summing the joint PMF over the other variable:

$$p_{X}(x)=\sum_{y}p_{X,Y}(x,y),\qquad p_{Y}(y)=\sum_{x}p_{X,Y}(x,y).$$

A function $g(X,Y)$ defines another random variable, with

$$E[g(X,Y)]=\sum_{x,y}g(x,y)p_{X,Y}(x,y).$$

If $g$ is linear, then $E[aX+bY+c]=aE[X]+bE[Y]+c$. These facts extend to more than two random variables.

@endcard

### Everyday example: total daily sales

Three shops expect to sell 20, 30, and 15 items. The expected total is 65 even if the same weather affects all three. To calculate the distribution or variance of the total, their dependence can matter; to add their expected sales, it does not.

@summary Marginalization and expected-value rules extend to any finite number of variables. Indicator variables turn counts into sums, often avoiding a difficult full-PMF calculation.

@@ conditioning-introduction | 2.6 | Intro | introduction | 80-81
If we have a probabilistic model and we are also told that a certain event $A$ has occurred, we can capture this knowledge by employing the conditional instead of the original (unconditional) probabilities. Conditional probabilities are like ordinary probabilities (satisfy the three axioms) except that they refer to a new universe in which event $A$ is known to have occurred. In the same spirit, we can talk about conditional PMFs which provide the probabilities of the possible values of a random variable, conditioned on the occurrence of some event.

Conditioning changes the information available. The random variable still assigns numbers to outcomes, but the probabilities used to describe those numbers now reflect the known event. Conditional PMFs, their averages, and their normalization use the same principles as ordinary PMFs.

### Everyday example: a delivery update

Before a parcel leaves the depot, its arrival time may span the whole afternoon. Once you learn it is already on your street, the arrival-time distribution changes. You have not defined a new parcel or a new measurement; you have updated the probabilities using the information received.

@summary Conditioning updates a distribution to reflect known information. Work within that conditional distribution using the usual probability rules.

@@ conditioning-on-an-event | 2.6 | Conditioning a Random Variable on an Event | subsection | 81-81
The conditional PMF of a random variable $X$, conditioned on a particular event $A$ with $P(A)>0$, is defined by

$$p_{X\mid A}(x)=P(X=x\mid A)=\frac{P(\{X=x\}\cap A)}{P(A)}.$$

Note that the events $\{X=x\}\cap A$ are disjoint for different values of $x$, their union is $A$, and, therefore,

$$P(A)=\sum_{x}P(\{X=x\}\cap A).$$

Combining the above two formulas, we see that

$$\sum_{x}p_{X\mid A}(x)=1,$$

so $p_{X\mid A}$ is a legitimate PMF.

As an example, let $X$ be the roll of a fair die and let $A$ be the event that the roll is an even number. Then, by applying the preceding formula, we obtain

$$\begin{aligned}p_{X\mid A}(x)&=P(X=x\mid\text{roll is even})\\&=\frac{P(X=x\text{ and }X\text{ is even})}{P(\text{roll is even})}\\&=\begin{cases}1/3&\text{if }x=2,4,6,\\0&\text{otherwise.}\end{cases}\end{aligned}$$

The conditional PMF is calculated similarly to its unconditional counterpart: to obtain $p_{X\mid A}(x)$, we add the probabilities of the outcomes that give rise to $X=x$ and belong to the conditioning event $A$, and then normalize by dividing by $P(A)$.

@figure 12

Figure 2.12: Visualization and calculation of the conditional PMF. For each $x$, add the probabilities in the intersection $\{X=x\}\cap A$ and normalize by dividing by $P(A)$.

### Everyday example: only express parcels

Let $X$ be delivery time and $A$ the event that the parcel uses express service. To find the probability of next-day delivery for express parcels, divide the probability of a parcel being both express and next-day by the probability of express service. If those probabilities are $0.24$ and $0.3$, the conditional probability is $0.24/0.3=0.8$.

@summary Keep outcomes in the known event and divide their probabilities by that event’s probability. The resulting masses sum to one.

@@ conditioning-on-another-variable | 2.6 | Conditioning one Random Variable on Another | subsection | 82-86
Let $X$ and $Y$ be two random variables associated with the same experiment. If we know that the experimental value of $Y$ is some particular $y$ (with $p_{Y}(y)>0$), this provides partial knowledge about the value of $X$. This knowledge is captured by the conditional PMF $p_{X\mid Y}$ of $X$ given $Y$, which is defined by specializing the definition of $p_{X\mid A}$ to events $A$ of the form $\{Y=y\}$:

$$p_{X\mid Y}(x\mid y)=P(X=x\mid Y=y).$$

Using the definition of conditional probabilities, we have

$$p_{X\mid Y}(x\mid y)=\frac{P(X=x,Y=y)}{P(Y=y)}=\frac{p_{X,Y}(x,y)}{p_{Y}(y)}.$$

Let us fix some $y$, with $p_{Y}(y)>0$ and consider $p_{X\mid Y}(x\mid y)$ as a function of $x$. This function is a valid PMF for $X$: it assigns nonnegative values to each possible $x$, and these values add to one. Furthermore, this function of $x$ has the same shape as $p_{X,Y}(x,y)$ except that it is normalized by dividing by $p_{Y}(y)$, which enforces the normalization property

$$\sum_{x}p_{X\mid Y}(x\mid y)=1.$$

@figure 13

Figure 2.13: For each $y$, view the joint PMF along the slice $Y=y$ and renormalize so that the conditional probabilities, summed over $x$, equal one. Different values of $y$ can produce differently shaped conditional PMFs.

@page 83

The conditional PMF is often convenient for the calculation of the joint PMF, using a sequential approach and the formula

$$p_{X,Y}(x,y)=p_{Y}(y)p_{X\mid Y}(x\mid y),$$

or its counterpart

$$p_{X,Y}(x,y)=p_{X}(x)p_{Y\mid X}(y\mid x).$$

Choose a value for the first variable, then multiply by the probability of the second value conditional on that first choice.

### Example 2.11. Questions and wrong answers

Professor May B. Right answers each question incorrectly with probability $1/4$, independently of other questions. She is asked zero, one, or two questions with equal probability $1/3$. Let $X$ be the number asked and $Y$ the number answered incorrectly. Given $X=x$, the wrong-answer count is binomial with $x$ trials and success probability $1/4$.

For one question, answered incorrectly,

$$p_{X,Y}(1,1)=p_{X}(1)p_{Y\mid X}(1\mid1)=\frac{1}{3}\frac{1}{4}=\frac{1}{12}.$$

All nonzero joint probabilities are $p_{X,Y}(0,0)=16/48$, $p_{X,Y}(1,0)=12/48$, $p_{X,Y}(1,1)=4/48$, $p_{X,Y}(2,0)=9/48$, $p_{X,Y}(2,1)=6/48$, and $p_{X,Y}(2,2)=1/48$. Therefore,

$$P(\text{at least one wrong answer})=\frac{4}{48}+\frac{6}{48}+\frac{1}{48}=\frac{11}{48}.$$

@figure 14

Figure 2.14: Sequential calculation of the joint PMF in Example 2.11. Multiply the probability of the number of questions by the conditional probability of the number answered incorrectly; the table collects the resulting joint probabilities.

### Example 2.12. Counting ones and twos

Consider four independent rolls of a fair six-sided die. Let $X$ count ones and $Y$ count twos. The marginal PMF of $Y$ is binomial:

$$p_{Y}(y)=\binom{4}{y}\left(\frac{1}{6}\right)^{y}\left(\frac{5}{6}\right)^{4-y},\qquad y=0,1,\ldots,4.$$

Given $Y=y$, the remaining $4-y$ rolls each take a value in $1,3,4,5,6$ with equal probability $1/5$. Thus,

$$p_{X\mid Y}(x\mid y)=\binom{4-y}{x}\left(\frac{1}{5}\right)^{x}\left(\frac{4}{5}\right)^{4-y-x}.$$

Multiplying yields

$$p_{X,Y}(x,y)=\binom{4}{y}\left(\frac{1}{6}\right)^{y}\left(\frac{5}{6}\right)^{4-y}\binom{4-y}{x}\left(\frac{1}{5}\right)^{x}\left(\frac{4}{5}\right)^{4-y-x},$$

for nonnegative integers $x,y$ with $x+y\le4$, and zero otherwise. Equivalently,

$$p_{X,Y}(x,y)=\frac{4!}{x!y!(4-x-y)!}\left(\frac{1}{6}\right)^{x+y}\left(\frac{4}{6}\right)^{4-x-y}.$$

@page 84

The conditional PMF can also be used to calculate the marginal PMFs. In particular, we have by using the definitions,

$$p_{X}(x)=\sum_{y}p_{X,Y}(x,y)=\sum_{y}p_{Y}(y)p_{X\mid Y}(x\mid y).$$

This is the total probability theorem applied to the partition defined by the possible values of $Y$: solve within each group, then weight the groups by their probabilities.

@page 85

### Example 2.13. Message length and travel time

A transmitter sends messages through a computer network. Let $X$ be travel time in seconds and $Y$ message length in bytes. Length is $10^{2}$ bytes with probability $5/6$ and $10^{4}$ bytes with probability $1/6$:

$$p_{Y}(y)=\begin{cases}5/6&\text{if }y=10^{2},\\1/6&\text{if }y=10^{4}.\end{cases}$$

Travel time is $10^{-4}Y$ seconds with probability $1/2$, $10^{-3}Y$ seconds with probability $1/3$, and $10^{-2}Y$ seconds with probability $1/6$. Therefore,

$$p_{X\mid Y}(x\mid10^{2})=\begin{cases}1/2&x=10^{-2},\\1/3&x=10^{-1},\\1/6&x=1,\end{cases}\qquad p_{X\mid Y}(x\mid10^{4})=\begin{cases}1/2&x=1,\\1/3&x=10,\\1/6&x=100.\end{cases}$$

To find the unconditional PMF, weight each conditional PMF by the message-length probability:

$$\begin{aligned}p_{X}(10^{-2})&=\frac{5}{6}\frac{1}{2}=\frac{5}{12},\\p_{X}(10^{-1})&=\frac{5}{6}\frac{1}{3}=\frac{5}{18},\\p_{X}(1)&=\frac{5}{6}\frac{1}{6}+\frac{1}{6}\frac{1}{2}=\frac{2}{9},\\p_{X}(10)&=\frac{1}{6}\frac{1}{3}=\frac{1}{18},\\p_{X}(100)&=\frac{1}{6}\frac{1}{6}=\frac{1}{36}.\end{aligned}$$

One second can arise from either message length, so both contributions must be included. The five masses sum to one. Conditional PMFs can also involve several variables, as in $p_{X,Y\mid Z}(x,y\mid z)$ or $p_{X\mid Y,Z}(x\mid y,z)$.

@page 86

> Summary of Facts About Conditional PMFs

Conditional PMFs are similar to ordinary PMFs, but refer to a universe where the conditioning event is known to have occurred. For $P(A)>0$,

$$p_{X\mid A}(x)=P(X=x\mid A),\qquad\sum_{x}p_{X\mid A}(x)=1.$$

The multiplication rule reconstructs a joint PMF:

$$p_{X,Y}(x,y)=p_{Y}(y)p_{X\mid Y}(x\mid y).$$

The total probability rule reconstructs a marginal PMF:

$$p_{X}(x)=\sum_{y}p_{Y}(y)p_{X\mid Y}(x\mid y).$$

These rules extend naturally to more than two random variables.

@endcard

### Everyday example: delivery service tiers

Let $Y$ identify standard or express service, and $X$ the delivery time. The overall chance of next-day arrival is the express share times its next-day rate, plus the standard share times its next-day rate. An unweighted average of the two rates is wrong unless the service shares are equal.

@summary Normalize a slice of a joint PMF to condition. Multiply a conditional PMF by the conditioning variable’s marginal to recover the joint. Sum these products to recover a marginal.

@@ conditional-expectation | 2.6 | Conditional Expectation | subsection | 86-89
A conditional PMF can be thought of as an ordinary PMF over a new universe determined by the conditioning event. In the same spirit, a conditional expectation is the same as an ordinary expectation, except that it refers to the new universe, and all probabilities and PMFs are replaced by their conditional counterparts.

@page 87

> Summary of Facts About Conditional Expectations

For an event $A$ with $P(A)>0$, the conditional expectation and the conditional expected value of a function are

$$E[X\mid A]=\sum_{x}xp_{X\mid A}(x),\qquad E[g(X)\mid A]=\sum_{x}g(x)p_{X\mid A}(x).$$

Given a value $y$ of $Y$ with $p_{Y}(y)>0$,

$$E[X\mid Y=y]=\sum_{x}xp_{X\mid Y}(x\mid y).$$

The total expectation theorem states

$$E[X]=\sum_{\{y\mid p_{Y}(y)>0\}}p_{Y}(y)E[X\mid Y=y].$$

If disjoint events $A_{1},\ldots,A_{n}$ form a partition of the sample space, with $P(A_{i})>0$ for all $i$, then

$$E[X]=\sum_{i=1}^{n}P(A_{i})E[X\mid A_{i}].$$

@endcard

The unconditional average can be obtained by averaging the conditional averages. To verify this, substitute the total probability formula for $p_{X}(x)$:

$$\begin{aligned}E[X]&=\sum_{x}xp_{X}(x)\\&=\sum_{x}x\sum_{y}p_{Y}(y)p_{X\mid Y}(x\mid y)\\&=\sum_{y}p_{Y}(y)\sum_{x}xp_{X\mid Y}(x\mid y)\\&=\sum_{y}p_{Y}(y)E[X\mid Y=y].\end{aligned}$$

For the partition version, introduce a random variable $Y$ that takes value $i$ exactly when $A_{i}$ occurs. Then $p_{Y}(i)=P(A_{i})$ for $i=1,\ldots,n$ and zero otherwise. Since $\{Y=i\}=A_{i}$, substituting this variable into the theorem gives the partition formula.

@page 88

### Example 2.14. Average network transit time

Messages from Boston go to New York with probability $0.5$, Chicago with probability $0.3$, and San Francisco with probability $0.2$. Their conditional mean transit times are $0.05$, $0.1$, and $0.3$ seconds, respectively. Without finding the full transit-time PMF, total expectation gives

$$E[X]=0.5(0.05)+0.3(0.1)+0.2(0.3)=0.115\text{ seconds}.$$

### Example 2.15. Mean and Variance of the Geometric Random Variable

You write a software program over and over, and each time there is probability $p$ that it works correctly, independently from previous attempts. Let $X$ be the number of tries until it works. It is geometric, with $p_{X}(k)=(1-p)^{k-1}p$ for $k=1,2,\ldots$. Direct definitions would give

$$E[X]=\sum_{k=1}^{\infty}k(1-p)^{k-1}p,\qquad\operatorname{var}(X)=\sum_{k=1}^{\infty}(k-E[X])^{2}(1-p)^{k-1}p.$$

Condition on the first attempt instead. On $A_{1}=\{X=1\}$, the first attempt succeeds and $E[X\mid X=1]=1$. On $A_{2}=\{X>1\}$, one attempt has been spent and the remaining problem has the same distribution as at the start, so $E[X\mid X>1]=1+E[X]$. Hence

$$\begin{aligned}E[X]&=P(X=1)E[X\mid X=1]+P(X>1)E[X\mid X>1]\\&=p+(1-p)(1+E[X]),\end{aligned}$$

which gives

$$E[X]=\frac{1}{p}.$$

The same reasoning applied to the square gives

$$E[X^{2}\mid X=1]=1,\qquad E[X^{2}\mid X>1]=E[(1+X)^{2}]=1+2E[X]+E[X^{2}].$$

Thus,

$$E[X^{2}]=p+(1-p)(1+2E[X]+E[X^{2}]),$$

and solving yields

$$E[X^{2}]=\frac{1+2(1-p)E[X]}{p}=\frac{2}{p^{2}}-\frac{1}{p}.$$

Consequently,

$$\operatorname{var}(X)=E[X^{2}]-(E[X])^{2}=\frac{2}{p^{2}}-\frac{1}{p}-\frac{1}{p^{2}}=\frac{1-p}{p^{2}}.$$

### Everyday example: weekday and weekend waiting

A help desk's mean wait is four minutes on weekdays and ten minutes on weekends. If calls arrive with shares $0.8$ and $0.2$, the overall mean is $0.8(4)+0.2(10)=5.2$ minutes. Weight by the share of calls, not automatically by the number of days.

@summary A conditional expectation averages within a known group. Total expectation averages those group means using the groups’ probabilities.

@@ independence-introduction | 2.7 | Intro | introduction | 90-90
We now discuss concepts of independence related to random variables. These concepts are analogous to the concepts of independence between events. They are developed by simply introducing suitable events involving the possible values of various random variables, and by considering their independence.

Independence is a statement about the full distribution. Knowing the event or the other variable must leave all the probabilities unchanged. Having the same average alone is not enough to establish independence.

### Everyday example: separate random draws

Two separate bags each contain numbered tokens. Draw once from each bag without letting either draw affect the other. Learning the number from the first bag gives no information about the second. Drawing twice from the same bag without replacement is different: the first draw changes what remains.

@summary Independence means that learning one piece of information does not change the probabilities of the other variable’s values.

@@ independence-from-an-event | 2.7 | Independence of a Random Variable from an Event | subsection | 90-90
The independence of a random variable from an event is similar to the independence of two events. The idea is that knowing the occurrence of the conditioning event tells us nothing about the value of the random variable. More formally, we say that the random variable $X$ is independent of the event $A$ if

$$P(\{X=x\}\cap A)=P(X=x)P(A)=p_{X}(x)P(A),\qquad\text{for all }x,$$

which is the same as requiring that the two events $\{X=x\}$ and $A$ be independent, for any choice $x$. As long as $P(A)>0$, and using the definition $p_{X\mid A}(x)=P(\{X=x\}\cap A)/P(A)$ of the conditional PMF, we see that independence is the same as the condition

$$p_{X\mid A}(x)=p_{X}(x),\qquad\text{for all }x.$$

### Example 2.16. Even numbers of heads

Toss a fair coin independently twice. Let $X$ be the number of heads and $A$ the event that the number of heads is even. The unconditional PMF and the conditional PMF are

$$p_{X}(x)=\begin{cases}1/4&x=0,\\1/2&x=1,\\1/4&x=2,\end{cases}\qquad p_{X\mid A}(x)=\begin{cases}1/2&x=0,\\0&x=1,\\1/2&x=2.\end{cases}$$

Here $P(A)=1/2$. The two PMFs differ, so $X$ and $A$ are not independent. Interestingly, their means are both one; this shows why comparing means alone is insufficient.

Now let $Z=0$ if the first toss is a head and $Z=1$ if it is a tail. Conditional on an even number of heads, the outcomes are HH and TT with equal probability. Thus $Z$ is still equally likely to be zero or one, and it is independent of $A$.

### Everyday example: a promotion and order size

Let $X$ count items in an order and $A$ mean that the shopper saw a promotion. If the entire item-count PMF among shoppers who saw it is identical to the overall PMF, then $X$ is independent of $A$. An unchanged average item count by itself does not establish that.

@summary For a positive-probability event, compare the conditional and unconditional PMFs at every possible value, not just their means.

@@ independence-of-random-variables | 2.7 | Independence of Random Variables | subsection | 91-93
The notion of independence of two random variables is similar. We say that two random variables $X$ and $Y$ are independent if

$$p_{X,Y}(x,y)=p_{X}(x)p_{Y}(y),\qquad\text{for all }x,y.$$

This is the same as requiring that $\{X=x\}$ and $\{Y=y\}$ be independent for every $x$ and $y$. The identity $p_{X,Y}(x,y)=p_{X\mid Y}(x\mid y)p_{Y}(y)$ shows that independence is equivalent to

$$p_{X\mid Y}(x\mid y)=p_{X}(x),\qquad\text{for all }x\text{ and }y\text{ with }p_{Y}(y)>0.$$

Intuitively, independence means that the experimental value of $Y$ tells us nothing about the value of $X$.

There is a similar notion of conditional independence of two random variables, given an event $A$ with $P(A)>0$. The conditioning event defines a new universe and all probabilities or PMFs have to be replaced by their conditional counterparts. The variables are conditionally independent given $A$ if

$$P(X=x,Y=y\mid A)=P(X=x\mid A)P(Y=y\mid A),\qquad\text{for all }x,y,$$

or, equivalently,

$$p_{X,Y\mid A}(x,y)=p_{X\mid A}(x)p_{Y\mid A}(y).$$

This is also equivalent to

$$p_{X\mid Y,A}(x\mid y)=p_{X\mid A}(x),\qquad\text{when }p_{Y\mid A}(y)>0.$$

Conditional independence need not imply unconditional independence, and unconditional independence need not survive conditioning.

@figure 15

Figure 2.15: The displayed joint PMF is not independent: $P(X=1\mid Y=1)=0$, while $P(X=1)=3/20$. Conditional on $A=\{X\le2,Y\ge3\}$, however, $X$ and $Y$ are independent. For either $y=3$ or $y=4$, the conditional PMF of $X$ assigns probability $1/3$ to one and $2/3$ to two.

If $X$ and $Y$ are independent random variables, then $E[XY]=E[X]E[Y]$, as shown by the following calculation:

$$\begin{aligned}E[XY]&=\sum_{x}\sum_{y}xyp_{X,Y}(x,y)\\&=\sum_{x}\sum_{y}xyp_{X}(x)p_{Y}(y)\\&=\left(\sum_{x}xp_{X}(x)\right)\left(\sum_{y}yp_{Y}(y)\right)\\&=E[X]E[Y].\end{aligned}$$

A very similar calculation also shows that if $X$ and $Y$ are independent, then

$$E[g(X)h(Y)]=E[g(X)]E[h(Y)],$$

for any functions $g$ and $h$ for which the expectations are defined. In fact, this follows because independence of $X$ and $Y$ also implies independence of $g(X)$ and $h(Y)$.

Consider now the sum $Z=X+Y$ of two independent random variables. Using $E[X+Y]=E[X]+E[Y]$, we obtain

$$\begin{aligned}\operatorname{var}(Z)&=E[(X+Y-E[X+Y])^{2}]\\&=E[((X-E[X])+(Y-E[Y]))^{2}]\\&=E[(X-E[X])^{2}]+E[(Y-E[Y])^{2}]\\&\quad+2E[(X-E[X])(Y-E[Y])].\end{aligned}$$

The centered variables are independent, and each has mean zero, so

$$E[(X-E[X])(Y-E[Y])]=E[X-E[X]]E[Y-E[Y]]=0.$$

Consequently,

$$\operatorname{var}(X+Y)=\operatorname{var}(X)+\operatorname{var}(Y).$$

Unlike the corresponding addition of means, this variance rule is not valid for arbitrary dependent random variables.

@page 93

> Summary of Facts About Independent Random Variables

For $P(A)>0$, $X$ is independent of $A$ when $p_{X\mid A}(x)=p_{X}(x)$ for every $x$. Two random variables are independent when $p_{X,Y}(x,y)=p_{X}(x)p_{Y}(y)$ for every pair $(x,y)$.

For independent $X,Y$, functions $g(X),h(Y)$ are also independent, and

$$E[XY]=E[X]E[Y],\qquad E[g(X)h(Y)]=E[g(X)]E[h(Y)].$$

The variance of their sum is

$$\operatorname{var}(X+Y)=\operatorname{var}(X)+\operatorname{var}(Y).$$

@endcard

### Everyday example: two independent delays

A trip has a bus delay $X$ and a train delay $Y$. If independent, with variances four and nine square minutes, the total delay has variance thirteen and standard deviation $\sqrt{13}$ minutes. Add variances, not standard deviations. Shared bad weather could make independence inappropriate.

@summary Independence factors the joint PMF. It allows products of expectations and addition of variances; conditional independence must be assessed separately.

@@ independence-of-several-variables | 2.7 | Independence of Several Random Variables | subsection | 94-96
All of the above have natural extensions to the case of more than two random variables. For example, three random variables $X,Y,Z$ are said to be independent if

$$p_{X,Y,Z}(x,y,z)=p_{X}(x)p_{Y}(y)p_{Z}(z),\qquad\text{for all }x,y,z.$$

If $X,Y,Z$ are independent random variables, then any three random variables of the form $f(X),g(Y),h(Z)$ are also independent. Similarly, any two random variables of the form $g(X,Y)$ and $h(Z)$ are independent. On the other hand, two random variables of the form $g(X,Y)$ and $h(Y,Z)$ are usually not independent, because they are both affected by $Y$.

Another property that extends to multiple random variables is the following. If $X_{1},X_{2},\ldots,X_{n}$ are independent random variables, then

$$\operatorname{var}(X_{1}+X_{2}+\cdots+X_{n})=\operatorname{var}(X_{1})+\operatorname{var}(X_{2})+\cdots+\operatorname{var}(X_{n}).$$

### Example 2.17. Variance of the Binomial

Consider $n$ independent coin tosses, each with head probability $p$. Let $X_{i}$ be one for a head on toss $i$ and zero otherwise. Then $X=X_{1}+\cdots+X_{n}$ is binomial. Each Bernoulli variable has variance $p(1-p)$, so independence gives

$$\operatorname{var}(X)=\sum_{i=1}^{n}\operatorname{var}(X_{i})=np(1-p).$$

The formulas for the mean and variance of a weighted sum of random variables form the basis for estimating a mean by averaging independent samples.

### Example 2.18. Mean and Variance of the Sample Mean

To estimate an approval rating $p$, sample $n$ people independently. Let $X_{i}=1$ when person $i$ approves and $X_{i}=0$ otherwise. Model these as independent Bernoulli variables, each with mean $p$ and variance $p(1-p)$. The sample mean is

$$S_{n}=\frac{X_{1}+X_{2}+\cdots+X_{n}}{n}.$$

Linearity gives

$$E[S_{n}]=\frac{1}{n}\sum_{i=1}^{n}E[X_{i}]=\frac{1}{n}\sum_{i=1}^{n}p=p.$$

Independence and the squared scaling rule give

$$\operatorname{var}(S_{n})=\frac{1}{n^{2}}\sum_{i=1}^{n}\operatorname{var}(X_{i})=\frac{p(1-p)}{n}.$$

Thus the sample mean has the correct expected value, and its variance decreases as the sample size grows. Even when the $X_{i}$ are not Bernoulli, the same calculation gives

$$E[S_{n}]=E[X],\qquad\operatorname{var}(S_{n})=\frac{\operatorname{var}(X)}{n},$$

provided the $X_{i}$ are independent with common mean $E[X]$ and common variance $\operatorname{var}(X)$.

### Example 2.19. Estimating Probabilities by Simulation

When an event's probability is hard to calculate analytically, a physical or computer model can generate independent outcomes with the correct probabilities. Generate $n$ outcomes, count the number $m$ in the event $A$, and estimate $P(A)$ by $m/n$. For a biased coin, this is the fraction of tosses that produce heads.

Define an indicator $X_{i}$ for whether the $i$th simulated outcome belongs to $A$. Its PMF is

$$p_{X_{i}}(x_{i})=\begin{cases}P(A)&x_{i}=1,\\1-P(A)&x_{i}=0.\end{cases}$$

The estimate is the sample mean,

$$S_{n}=\frac{X_{1}+X_{2}+\cdots+X_{n}}{n},$$

with

$$E[S_{n}]=P(A),\qquad\operatorname{var}(S_{n})=\frac{P(A)(1-P(A))}{n}.$$

Increasing the number of independent simulations reduces variance. It does not correct a simulation that uses the wrong probability model.

### Everyday example: a satisfaction survey

For independent yes-or-no responses with $p=0.6$, a sample of 100 has variance $0.6(0.4)/100=0.0024$ for the approval fraction. A sample of 400 reduces this variance to $0.0006$ and halves the standard deviation. Four times as many independent responses halves this measure of uncertainty.

@summary Independence allows variances to add. An average of n independent observations has variance equal to an individual observation’s variance divided by n.

@@ summary-and-discussion | 2.8 | Summary and Discussion | section | 96-98
Random variables provide the natural tools for dealing with probabilistic models in which the outcome determines certain numerical values of interest. Discrete random variables can be described by their PMFs, means, and variances. Several useful special models summarize common situations.

> Summary of Results for Special Random Variables

Discrete uniform over the integers $a,a+1,\ldots,b$: all these values have the same probability; the PMF is zero elsewhere.

$$p_{X}(k)=\frac{1}{b-a+1},\qquad E[X]=\frac{a+b}{2},\qquad\operatorname{var}(X)=\frac{(b-a)(b-a+2)}{12}.$$

Bernoulli with parameter $p$: success or failure in one trial.

$$p_{X}(1)=p,\qquad p_{X}(0)=1-p,\qquad E[X]=p,\qquad\operatorname{var}(X)=p(1-p).$$

Binomial with parameters $n,p$: number of successes in $n$ independent Bernoulli trials.

$$p_{X}(k)=\binom{n}{k}p^{k}(1-p)^{n-k},\qquad k=0,1,\ldots,n.$$

$$E[X]=np,\qquad\operatorname{var}(X)=np(1-p).$$

Geometric with parameter $p$: number of trials through the first success in independent Bernoulli trials.

$$p_{X}(k)=(1-p)^{k-1}p,\qquad k=1,2,\ldots.$$

$$E[X]=\frac{1}{p},\qquad\operatorname{var}(X)=\frac{1-p}{p^{2}}.$$

Poisson with parameter $\lambda$: nonnegative counts; approximates a binomial PMF when $n$ is large, $p$ is small, and $\lambda=np$.

$$p_{X}(k)=e^{-\lambda}\frac{\lambda^{k}}{k!},\qquad k=0,1,\ldots.$$

$$E[X]=\lambda,\qquad\operatorname{var}(X)=\lambda.$$

@endcard

Conditional PMFs are often the starting point in probabilistic models and can be used to calculate other quantities of interest, such as marginal or joint PMFs and expectations, through a sequential or a divide-and-conquer approach. Given $p_{X\mid Y}(x\mid y)$, the joint PMF can be calculated by

$$p_{X,Y}(x,y)=p_{Y}(y)p_{X\mid Y}(x\mid y).$$

For three variables, first generate $Z$, then $Y$ given $Z$, then $X$ given both:

$$p_{X,Y,Z}(x,y,z)=p_{Z}(z)p_{Y\mid Z}(y\mid z)p_{X\mid Y,Z}(x\mid y,z).$$

The marginal PMF and the mean can be calculated by the total probability and total expectation rules:

$$p_{X}(x)=\sum_{y}p_{Y}(y)p_{X\mid Y}(x\mid y),$$

$$E[X]=\sum_{y}p_{Y}(y)E[X\mid Y=y].$$

### Choosing a model in everyday use

One payment succeeding or failing suggests Bernoulli. The number of successes in twenty independent payments with the same success probability suggests binomial. The number of attempts through the first success suggests geometric. The count of rare requests in an interval may suggest Poisson. A uniformly selected ticket number suggests discrete uniform. Check the assumptions before using the formula; a familiar-looking count alone does not establish the model.

@summary Start by defining the numerical quantity and its possible values. Use the PMF to compute probabilities and means. Use joint and conditional PMFs when several variables interact, and use independence only when justified.
