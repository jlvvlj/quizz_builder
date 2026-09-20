# General Random Variables

@@ pdfs-introduction | 3.1 | Intro | introduction | 100-104
Random variables with a continuous range of possible experimental values are quite common – the velocity of a vehicle traveling along the highway could be one example. If such a velocity is measured by a digital speedometer, the speedometer's reading is a discrete random variable. But if we also wish to model the exact velocity, a continuous random variable is called for. Models involving continuous random variables can be useful for several reasons. Besides being finer-grained and possibly more accurate, they allow the use of powerful tools from calculus and often admit an insightful analysis that would not be possible under a discrete model.

All of the concepts and methods introduced in Chapter 2, such as expectation, PMFs, and conditioning, have continuous counterparts. Developing and interpreting these counterparts is the subject of this chapter.

A random variable $X$ is called continuous if its probability law can be described in terms of a nonnegative function $f_{X}$, called the probability density function of $X$, or PDF for short, which satisfies

$$P(X\in B)=\int_{B}f_{X}(x)\,dx,$$

for every subset $B$ of the real line.

The integral $\int_{B}f_{X}(x)\,dx$ is to be interpreted in the usual calculus/Riemann sense and we implicitly assume that it is well-defined. For highly unusual functions and sets, this integral can be harder – or even impossible – to define, but such issues belong to a more advanced treatment of the subject. In any case, it is comforting to know that mathematical subtleties of this type do not arise if $f_{X}$ is a piecewise continuous function with a finite number of points of discontinuity, and $B$ is the union of a finite or countable number of intervals.

In particular, the probability that the value of $X$ falls within an interval is

$$P(a\le X\le b)=\int_{a}^{b}f_{X}(x)\,dx,$$

and can be interpreted as the area under the graph of the PDF. For any single value $a$, we have $P(X=a)=\int_{a}^{a}f_{X}(x)\,dx=0$. For this reason, including or excluding the endpoints of an interval has no effect on its probability:

$$P(a\le X\le b)=P(a<X<b)=P(a\le X<b)=P(a<X\le b).$$

Note that to qualify as a PDF, a function $f_{X}$ must be nonnegative, i.e., $f_{X}(x)\ge 0$ for every $x$, and must also satisfy the normalization equation

$$\int_{-\infty}^{\infty}f_{X}(x)\,dx=P(-\infty<X<\infty)=1.$$

@page 101

@figure 1

Figure 3.1: Illustration of a PDF. The probability that $X$ takes value in an interval $[a,b]$ is $\int_{a}^{b}f_{X}(x)\,dx$, which is the shaded area in the figure.

Graphically, this means that the entire area under the graph of the PDF must be equal to 1.

To interpret the PDF, note that for an interval $[x,x+\delta]$ with very small length $\delta$, we have

$$P\left([x,x+\delta]\right)=\int_{x}^{x+\delta}f_{X}(t)\,dt\approx f_{X}(x)\cdot\delta,$$

so we can view $f_{X}(x)$ as the "probability mass per unit length" near $x$. It is important to realize that even though a PDF is used to calculate event probabilities, $f_{X}(x)$ is not the probability of any particular event. In particular, it is not restricted to be less than or equal to one.

@figure 2

Figure 3.2: Interpretation of the PDF $f_{X}(x)$ as "probability mass per unit length" around $x$. If $\delta$ is very small, the probability that $X$ takes value in the interval $[x,x+\delta]$ is the shaded area in the figure, which is approximately equal to $f_{X}(x)\cdot\delta$.

### Example 3.1. Continuous Uniform Random Variable.

A gambler spins a wheel of fortune, continuously calibrated between 0 and 1, and observes the resulting number. Assuming that all subintervals of $[0,1]$ of the same length are equally likely, this experiment can be modeled in terms a random variable $X$ with PDF

$$f_{X}(x)=\begin{cases}c&\text{if }0\le x\le 1,\\0&\text{otherwise,}\end{cases}$$

@page 102

for some constant $c$. This constant can be determined by using the normalization property

$$1=\int_{-\infty}^{\infty}f_{X}(x)\,dx=\int_{0}^{1}c\,dx=c\int_{0}^{1}dx=c$$

so that $c=1$.

More generally, we can consider a random variable $X$ that takes values in an interval $[a,b]$, and again assume that all subintervals of the same length are equally likely. We refer to this type of random variable as uniform or uniformly distributed. Its PDF has the form

$$f_{X}(x)=\begin{cases}c&\text{if }a\le x\le b,\\0&\text{otherwise,}\end{cases}$$

where $c$ is a constant. This is the continuous analog of the discrete uniform random variable discussed in Chapter 2. For $f_{X}$ to satisfy the normalization property, we must have

$$1=\int_{a}^{b}c\,dx=c\int_{a}^{b}dx=c(b-a),$$

so that

$$c=\frac{1}{b-a}.$$

@figure 3

Figure 3.3: The PDF of a uniform random variable.

Note that the probability $P(X\in I)$ that $X$ takes value in a set $I$ is

$$P(X\in I)=\int_{[a,b]\cap I}\frac{1}{b-a}\,dx=\frac{1}{b-a}\int_{[a,b]\cap I}dx=\frac{\text{length of }[a,b]\cap I}{\text{length of }[a,b]}.$$

The uniform random variable bears a relation to the discrete uniform law, which involves a sample space with a finite number of equally likely outcomes. The difference is that to obtain the probability of various events, we must now calculate the "length" of various subsets of the real line instead of counting the number of outcomes contained in various events.

### Example 3.2. Piecewise Constant PDF.

Alvin's driving time to work is between 15 and 20 minutes if the day is sunny, and between 20 and 25 minutes if the day is rainy, with all times being equally likely in each case. Assume that a day is sunny with probability $2/3$ and rainy with probability $1/3$. What is the PDF of the driving time, viewed as a random variable $X$?

@page 103

We interpret the statement that "all times are equally likely" in the sunny and the rainy cases, to mean that the PDF of $X$ is constant in each of the intervals $[15,20]$ and $[20,25]$. Furthermore, since these two intervals contain all possible driving times, the PDF should be zero everywhere else:

$$f_{X}(x)=\begin{cases}c_{1}&\text{if }15\le x<20,\\c_{2}&\text{if }20\le x\le 25,\\0&\text{otherwise,}\end{cases}$$

where $c_{1}$ and $c_{2}$ are some constants. We can determine these constants by using the given probabilities of a sunny and of a rainy day:

$$\frac{2}{3}=P(\text{sunny day})=\int_{15}^{20}f_{X}(x)\,dx=\int_{15}^{20}c_{1}\,dx=5c_{1},$$

$$\frac{1}{3}=P(\text{rainy day})=\int_{20}^{25}f_{X}(x)\,dx=\int_{20}^{25}c_{2}\,dx=5c_{2},$$

so that

$$c_{1}=\frac{2}{15},\qquad c_{2}=\frac{1}{15}.$$

Generalizing this example, consider a random variable $X$ whose PDF has the piecewise constant form

$$f_{X}(x)=\begin{cases}c_{i}&\text{if }a_{i}\le x<a_{i+1},\ \ i=1,2,\ldots,n-1,\\0&\text{otherwise,}\end{cases}$$

where $a_{1},a_{2},\ldots,a_{n}$ are some scalars with $a_{i}<a_{i+1}$ for all $i$, and $c_{1},c_{2},\ldots,c_{n}$ are some nonnegative constants. The constants $c_{i}$ may be determined by additional problem data, as in the case of the preceding driving context. Generally, the $c_{i}$ must be such that the normalization property holds:

$$1=\int_{a_{1}}^{a_{n}}f_{X}(x)\,dx=\sum_{i=1}^{n-1}\int_{a_{i}}^{a_{i+1}}c_{i}\,dx=\sum_{i=1}^{n-1}c_{i}(a_{i+1}-a_{i}).$$

@figure 4

Figure 3.4: A piecewise constant PDF involving three intervals.

@page 104

### Example 3.3. A PDF can be arbitrarily large.

Consider a random variable $X$ with PDF

$$f_{X}(x)=\begin{cases}\dfrac{1}{2\sqrt{x}}&\text{if }0<x\le 1,\\0&\text{otherwise.}\end{cases}$$

Even though $f_{X}(x)$ becomes infinitely large as $x$ approaches zero, this is still a valid PDF, because

$$\int_{-\infty}^{\infty}f_{X}(x)\,dx=\int_{0}^{1}\frac{1}{2\sqrt{x}}\,dx=\sqrt{x}\,\Big\rvert_{0}^{1}=1.$$

> Summary of PDF Properties

Let $X$ be a continuous random variable with PDF $f_{X}$.

$f_{X}(x)\ge 0$ for all $x$.

$\int_{-\infty}^{\infty}f_{X}(x)\,dx=1$.

If $\delta$ is very small, then $P\left([x,x+\delta]\right)\approx f_{X}(x)\cdot\delta$.

For any subset $B$ of the real line,

$$P(X\in B)=\int_{B}f_{X}(x)\,dx.$$

@endcard

@summary A continuous random variable is described by a PDF whose area over a set gives the probability of that set. The PDF is a density, not a probability: it must be nonnegative and integrate to one, but its values can exceed one.

@@ expectation | 3.1 | Expectation | subsection | 104-107
The expected value or mean of a continuous random variable $X$ is defined by

$$E[X]=\int_{-\infty}^{\infty}xf_{X}(x)\,dx.$$

One has to deal with the possibility that the integral $\int_{-\infty}^{\infty}xf_{X}(x)\,dx$ is infinite or undefined. More concretely, we will say that the expectation is well-defined if $\int_{-\infty}^{\infty}|x|f_{X}(x)\,dx<\infty$. In that case, it is known that the integral $\int_{-\infty}^{\infty}xf_{X}(x)\,dx$ takes a finite and unambiguous value.

For an example where the expectation is not well-defined, consider a random variable $X$ with PDF $f_{X}(x)=c/(1+x^{2})$, where $c$ is a constant chosen to enforce the normalization condition. The expression $|x|f_{X}(x)$ is approximately the same as $1/|x|$ when $|x|$ is large. Using the fact $\int_{1}^{\infty}(1/x)\,dx=\infty$, one can show that $\int_{-\infty}^{\infty}|x|f_{X}(x)\,dx=\infty$. Thus, $E[X]$ is left undefined, despite the symmetry of the PDF around zero.

Throughout, in lack of an indication to the contrary, we implicitly assume that the expected value of the random variables of interest is well-defined.

@page 105

This is similar to the discrete case except that the PMF is replaced by the PDF, and summation is replaced by integration. As in Chapter 2, $E[X]$ can be interpreted as the "center of gravity" of the probability law and, also, as the anticipated average value of $X$ in a large number of independent repetitions of the experiment. Its mathematical properties are similar to the discrete case – after all, an integral is just a limiting form of a sum.

If $X$ is a continuous random variable with given PDF, any real-valued function $Y=g(X)$ of $X$ is also a random variable. Note that $Y$ can be a continuous random variable: for example, consider the trivial case where $Y=g(X)=X$. But $Y$ can also turn out to be discrete. For example, suppose that $g(x)=1$ for $x>0$, and $g(x)=0$, otherwise. Then $Y=g(X)$ is a discrete random variable. In either case, the mean of $g(X)$ satisfies the expected value rule

$$E\left[g(X)\right]=\int_{-\infty}^{\infty}g(x)f_{X}(x)\,dx,$$

in complete analogy with the discrete case.

The $n$th moment of a continuous random variable $X$ is defined as $E[X^{n}]$, the expected value of the random variable $X^{n}$. The variance, denoted by $\operatorname{var}(X)$, is defined as the expected value of the random variable $\left(X-E[X]\right)^{2}$.

We now summarize this discussion and list a number of additional facts that are practically identical to their discrete counterparts.

> Expectation of a Continuous Random Variable and its Properties

Let $X$ be a continuous random variable with PDF $f_{X}$.

The expectation of $X$ is defined by

$$E[X]=\int_{-\infty}^{\infty}xf_{X}(x)\,dx.$$

The expected value rule for a function $g(X)$ has the form

$$E\left[g(X)\right]=\int_{-\infty}^{\infty}g(x)f_{X}(x)\,dx.$$

The variance of $X$ is defined by

$$\operatorname{var}(X)=E\left[\left(X-E[X]\right)^{2}\right]=\int_{-\infty}^{\infty}\left(x-E[X]\right)^{2}f_{X}(x)\,dx.$$

@page 106

We have

$$0\le\operatorname{var}(X)=E[X^{2}]-\left(E[X]\right)^{2}.$$

If $Y=aX+b$, where $a$ and $b$ are given scalars, then

$$E[Y]=aE[X]+b,\qquad \operatorname{var}(Y)=a^{2}\operatorname{var}(X).$$

@endcard

### Example 3.4. Mean and Variance of the Uniform Random Variable.

Consider the case of a uniform PDF over an interval $[a,b]$, as in Example 3.1. We have

$$\begin{aligned}E[X]&=\int_{-\infty}^{\infty}xf_{X}(x)\,dx\\&=\int_{a}^{b}x\cdot\frac{1}{b-a}\,dx\\&=\frac{1}{b-a}\cdot\frac{1}{2}x^{2}\Big\rvert_{a}^{b}\\&=\frac{1}{b-a}\cdot\frac{b^{2}-a^{2}}{2}\\&=\frac{a+b}{2},\end{aligned}$$

as one expects based on the symmetry of the PDF around $(a+b)/2$.

To obtain the variance, we first calculate the second moment. We have

$$\begin{aligned}E[X^{2}]&=\int_{a}^{b}\frac{x^{2}}{b-a}\,dx\\&=\frac{1}{b-a}\int_{a}^{b}x^{2}\,dx\\&=\frac{1}{b-a}\cdot\frac{1}{3}x^{3}\Big\rvert_{a}^{b}\\&=\frac{b^{3}-a^{3}}{3(b-a)}\\&=\frac{a^{2}+ab+b^{2}}{3}.\end{aligned}$$

Thus, the variance is obtained as

$$\operatorname{var}(X)=E[X^{2}]-\left(E[X]\right)^{2}=\frac{a^{2}+ab+b^{2}}{3}-\frac{(a+b)^{2}}{4}=\frac{(b-a)^{2}}{12},$$

after some calculation.

@page 107

Suppose now that $[a,b]=[0,1]$, and consider the function $g(x)=1$ if $x\le 1/3$, and $g(x)=2$ if $x>1/3$. The random variable $Y=g(X)$ is a discrete one with PMF $p_{Y}(1)=P(X\le 1/3)=1/3$, $p_{Y}(2)=1-p_{Y}(1)=2/3$. Thus,

$$E[Y]=\frac{1}{3}\cdot 1+\frac{2}{3}\cdot 2=\frac{5}{3}.$$

The same result could be obtained using the expected value rule:

$$E[Y]=\int_{0}^{1}g(x)f_{X}(x)\,dx=\int_{0}^{1/3}dx+\int_{1/3}^{1}2\,dx=\frac{5}{3}.$$

@summary The mean of a continuous random variable integrates $x$ against its PDF, and the expected value rule integrates $g(x)$ against it. Variance, the linearity of expectation, and $\operatorname{var}(aX+b)=a^{2}\operatorname{var}(X)$ carry over unchanged from the discrete case.

@@ exponential-random-variable | 3.1 | Exponential Random Variable | subsection | 107-109
An exponential random variable has a PDF of the form

$$f_{X}(x)=\begin{cases}\lambda e^{-\lambda x}&\text{if }x\ge 0,\\0&\text{otherwise,}\end{cases}$$

where $\lambda$ is a positive parameter characterizing the PDF. This is a legitimate PDF because

$$\int_{-\infty}^{\infty}f_{X}(x)\,dx=\int_{0}^{\infty}\lambda e^{-\lambda x}\,dx=-e^{-\lambda x}\Big\rvert_{0}^{\infty}=1.$$

Note that the probability that $X$ exceeds a certain value falls exponentially. Indeed, for any $a\ge 0$, we have

$$P(X\ge a)=\int_{a}^{\infty}\lambda e^{-\lambda x}\,dx=-e^{-\lambda x}\Big\rvert_{a}^{\infty}=e^{-\lambda a}.$$

An exponential random variable can be a very good model for the amount of time until a piece of equipment breaks down, until a light bulb burns out, or until an accident occurs. For the time being we will simply view it as an example of a random variable that is fairly tractable analytically.

@figure 5

Figure 3.5: The PDF $\lambda e^{-\lambda x}$ of an exponential random variable.

@page 108

The mean and the variance can be calculated to be

$$E[X]=\frac{1}{\lambda},\qquad \operatorname{var}(X)=\frac{1}{\lambda^{2}}.$$

These formulas can be verified by straightforward calculation, as we now show. We have, using integration by parts,

$$\begin{aligned}E[X]&=\int_{0}^{\infty}x\lambda e^{-\lambda x}\,dx\\&=(-xe^{-\lambda x})\Big\rvert_{0}^{\infty}+\int_{0}^{\infty}e^{-\lambda x}\,dx\\&=0-\frac{e^{-\lambda x}}{\lambda}\bigg\rvert_{0}^{\infty}\\&=\frac{1}{\lambda}.\end{aligned}$$

Using again integration by parts, the second moment is

$$\begin{aligned}E[X^{2}]&=\int_{0}^{\infty}x^{2}\lambda e^{-\lambda x}\,dx\\&=(-x^{2}e^{-\lambda x})\Big\rvert_{0}^{\infty}+\int_{0}^{\infty}2xe^{-\lambda x}\,dx\\&=0+\frac{2}{\lambda}E[X]\\&=\frac{2}{\lambda^{2}}.\end{aligned}$$

Finally, using the formula $\operatorname{var}(X)=E[X^{2}]-\left(E[X]\right)^{2}$, we obtain

$$\operatorname{var}(X)=\frac{2}{\lambda^{2}}-\frac{1}{\lambda^{2}}=\frac{1}{\lambda^{2}}.$$

### Example 3.5.

The time until a small meteorite first lands anywhere in the Sahara desert is modeled as an exponential random variable with a mean of 10 days. The time is currently midnight. What is the probability that a meteorite first lands some time between 6am and 6pm of the first day?

Let $X$ be the time elapsed until the event of interest, measured in days. Then, $X$ is exponential, with mean $1/\lambda=10$, which yields $\lambda=1/10$. The desired probability is

$$P(1/4\le X\le 3/4)=P(X\ge 1/4)-P(X>3/4)=e^{-1/40}-e^{-3/40}=0.0476,$$

where we have used the formula $P(X\ge a)=P(X>a)=e^{-\lambda a}$.

@page 109

Let us also derive an expression for the probability that the time when a meteorite first lands will be between 6am and 6pm of some day. For the $k$th day, this set of times corresponds to the event $k-(3/4)\le X\le k-(1/4)$. Since these events are disjoint, the probability of interest is

$$\begin{aligned}\sum_{k=1}^{\infty}P\left(k-\frac{3}{4}\le X\le k-\frac{1}{4}\right)&=\sum_{k=1}^{\infty}\left(P\left(X\ge k-\frac{3}{4}\right)-P\left(X>k-\frac{1}{4}\right)\right)\\&=\sum_{k=1}^{\infty}\left(e^{-(4k-3)/40}-e^{-(4k-1)/40}\right).\end{aligned}$$

We omit the remainder of the calculation, which involves using the geometric series formula.

@summary The exponential PDF $\lambda e^{-\lambda x}$ on $[0,\infty)$ has $P(X\ge a)=e^{-\lambda a}$, mean $1/\lambda$, and variance $1/\lambda^{2}$. It models the time until an event such as a breakdown or an arrival.

@@ cumulative-distribution-functions | 3.2 | Cumulative Distribution Functions | section | 109-114
We have been dealing with discrete and continuous random variables in a somewhat different manner, using PMFs and PDFs, respectively. It would be desirable to describe all kinds of random variables with a single mathematical concept. This is accomplished by the cumulative distribution function, or CDF for short. The CDF of a random variable $X$ is denoted by $F_{X}$ and provides the probability $P(X\le x)$. In particular, for every $x$ we have

$$F_{X}(x)=P(X\le x)=\begin{cases}\displaystyle\sum_{k\le x}p_{X}(k)&X\text{: discrete,}\\\displaystyle\int_{-\infty}^{x}f_{X}(t)\,dt&X\text{: continuous.}\end{cases}$$

Loosely speaking, the CDF $F_{X}(x)$ "accumulates" probability "up to" the value $x$.

Any random variable associated with a given probability model has a CDF, regardless of whether it is discrete, continuous, or other. This is because $\{X\le x\}$ is always an event and therefore has a well-defined probability. Figures 3.6 and 3.7 illustrate the CDFs of various discrete and continuous random variables. From these figures, as well as from the definition, some general properties of the CDF can be observed.

@page 110

@figure 6

Figure 3.6: CDFs of some discrete random variables. The CDF is related to the PMF through the formula $F_{X}(x)=P(X\le x)=\sum_{k\le x}p_{X}(k)$, and has a staircase form, with jumps occurring at the values of positive probability mass. Note that at the points where a jump occurs, the value of $F_{X}$ is the larger of the two corresponding values (i.e., $F_{X}$ is continuous from the right).

> Properties of a CDF

The CDF $F_{X}$ of a random variable $X$ is defined by

$$F_{X}(x)=P(X\le x),\qquad\text{for all }x,$$

and has the following properties.

$F_{X}$ is monotonically nondecreasing:

$$\text{if }x\le y,\text{ then }F_{X}(x)\le F_{X}(y).$$

$F_{X}(x)$ tends to 0 as $x\to-\infty$, and to 1 as $x\to\infty$.

If $X$ is discrete, then $F_{X}$ has a piecewise constant and staircase-like form.

If $X$ is continuous, then $F_{X}$ has a continuously varying form.

@page 111

If $X$ is discrete and takes integer values, the PMF and the CDF can be obtained from each other by summing or differencing:

$$F_{X}(k)=\sum_{i=-\infty}^{k}p_{X}(i),$$

$$p_{X}(k)=P(X\le k)-P(X\le k-1)=F_{X}(k)-F_{X}(k-1),$$

for all integers $k$.

If $X$ is continuous, the PDF and the CDF can be obtained from each other by integration or differentiation:

$$F_{X}(x)=\int_{-\infty}^{x}f_{X}(t)\,dt,$$

$$f_{X}(x)=\frac{dF_{X}}{dx}(x).$$

(The latter relation is valid for those $x$ for which the CDF has a derivative.)

@endcard

Because the CDF is defined for any type of random variable, it provides a convenient means for exploring the relations between continuous and discrete random variables. This is illustrated in the following example, which shows that there is a close relation between the geometric and the exponential random variables.

### Example 3.6. The Geometric and Exponential CDFs.

Let $X$ be a geometric random variable with parameter $p$; that is, $X$ is the number of trials to obtain the first success in a sequence of independent Bernoulli trials, where the probability of success is $p$. Thus, for $k=1,2,\ldots$, we have $P(X=k)=p(1-p)^{k-1}$ and the CDF is given by

$$F^{\mathrm{geo}}(n)=\sum_{k=1}^{n}p(1-p)^{k-1}=p\frac{1-(1-p)^{n}}{1-(1-p)}=1-(1-p)^{n},\qquad\text{for }n=1,2,\ldots$$

Suppose now that $X$ is an exponential random variable with parameter $\lambda>0$. Its CDF is given by

$$F^{\mathrm{exp}}(x)=P(X\le x)=0,\qquad\text{for }x\le 0,$$

and

$$F^{\mathrm{exp}}(x)=\int_{0}^{x}\lambda e^{-\lambda t}\,dt=-e^{-\lambda t}\Big\rvert_{0}^{x}=1-e^{-\lambda x},\qquad\text{for }x>0.$$

@page 112

@figure 7

Figure 3.7: CDFs of some continuous random variables. The CDF is related to the PDF through the formula $F_{X}(x)=P(X\le x)=\int_{-\infty}^{x}f_{X}(t)\,dt$. Thus, the PDF $f_{X}$ can be obtained from the CDF by differentiation: $f_{X}(x)=dF_{X}(x)/dx$. For a continuous random variable, the CDF has no jumps, i.e., it is continuous.

To compare the two CDFs above, let $\delta=-\ln(1-p)/\lambda$, so that

$$e^{-\lambda\delta}=1-p.$$

Then we see that the values of the exponential and the geometric CDFs are equal for all $x=n\delta$, where $n=1,2,\ldots$, i.e.,

$$F^{\mathrm{exp}}(n\delta)=F^{\mathrm{geo}}(n),\qquad n=1,2,\ldots,$$

as illustrated in Figure 3.8.

If $\delta$ is very small, there is close proximity of the exponential and the geometric CDFs, provided that we scale the values taken by the geometric random variable by $\delta$. This relation is best interpreted by viewing $X$ as time, either continuous, in the case of the exponential, or $\delta$-discretized, in the case of the geometric. In particular, suppose that $\delta$ is a small number, and that every $\delta$ seconds, we flip a coin with the probability of heads being a small number $p$. Then, the time of the first occurrence of heads is well approximated by an exponential random variable. The parameter $\lambda$ of this exponential is such that $e^{-\lambda\delta}=1-p$ or $\lambda=-\ln(1-p)/\delta$.

@page 113

@figure 8

Figure 3.8: Relation of the geometric and the exponential CDFs. We have $F^{\mathrm{exp}}(n\delta)=F^{\mathrm{geo}}(n)$, $n=1,2,\ldots$, if the interval $\delta$ is such that $e^{-\lambda\delta}=1-p$. As $\delta$ approaches 0, the exponential random variable can be interpreted as the "limit" of the geometric.

Sometimes, in order to calculate the PMF or PDF of a discrete or continuous random variable, respectively, it is more convenient to first calculate the CDF and then use the preceding relations. The systematic use of this approach for the case of a continuous random variable will be discussed in Section 3.6. The following is a discrete example.

### Example 3.7. The Maximum of Several Random Variables.

You are allowed to take a certain test three times, and your final score will be the maximum of the test scores. Thus,

$$X=\max\{X_{1},X_{2},X_{3}\},$$

where $X_{1},X_{2},X_{3}$ are the three test scores and $X$ is the final score. Assume that your score in each test takes one of the values from 1 to 10 with equal probability $1/10$, independently of the scores in other tests. What is the PMF $p_{X}$ of the final score?

We calculate the PMF indirectly. We first compute the CDF $F_{X}(k)$ and then obtain the PMF as

$$p_{X}(k)=F_{X}(k)-F_{X}(k-1),\qquad k=1,\ldots,10.$$

@page 114

We have

$$\begin{aligned}F_{X}(k)&=P(X\le k)\\&=P(X_{1}\le k,\,X_{2}\le k,\,X_{3}\le k)\\&=P(X_{1}\le k)P(X_{2}\le k)P(X_{3}\le k)\\&=\left(\frac{k}{10}\right)^{3},\end{aligned}$$

where the third equality follows from the independence of the events $\{X_{1}\le k\}$, $\{X_{2}\le k\}$, $\{X_{3}\le k\}$. Thus the PMF is given by

$$p_{X}(k)=\left(\frac{k}{10}\right)^{3}-\left(\frac{k-1}{10}\right)^{3},\qquad k=1,\ldots,10.$$

@summary The CDF $F_{X}(x)=P(X\le x)$ describes discrete and continuous random variables alike: it is nondecreasing, runs from 0 to 1, is a staircase in the discrete case and continuous in the continuous case, and yields the PMF by differencing or the PDF by differentiation.

@@ normal-introduction | 3.3 | Intro | introduction | 114-116
A continuous random variable $X$ is said to be normal or Gaussian if it has a PDF of the form

$$f_{X}(x)=\frac{1}{\sqrt{2\pi}\,\sigma}e^{-(x-\mu)^{2}/2\sigma^{2}},$$

where $\mu$ and $\sigma$ are two scalar parameters characterizing the PDF, with $\sigma$ assumed nonnegative. It can be verified that the normalization property

$$\frac{1}{\sqrt{2\pi}\,\sigma}\int_{-\infty}^{\infty}e^{-(x-\mu)^{2}/2\sigma^{2}}\,dx=1$$

holds.

@figure 9

Figure 3.9: A normal PDF and CDF, with $\mu=1$ and $\sigma^{2}=1$. We observe that the PDF is symmetric around its mean $\mu$, and has a characteristic bell-shape. As $x$ gets further from $\mu$, the term $e^{-(x-\mu)^{2}/2\sigma^{2}}$ decreases very rapidly. In this figure, the PDF is very close to zero outside the interval $[-1,3]$.

@page 115

The mean and the variance can be calculated to be

$$E[X]=\mu,\qquad \operatorname{var}(X)=\sigma^{2}.$$

To see this, note that the PDF is symmetric around $\mu$, so its mean must be $\mu$. Furthermore, the variance is given by

$$\operatorname{var}(X)=\frac{1}{\sqrt{2\pi}\,\sigma}\int_{-\infty}^{\infty}(x-\mu)^{2}e^{-(x-\mu)^{2}/2\sigma^{2}}\,dx.$$

Using the change of variables $y=(x-\mu)/\sigma$ and integration by parts, we have

$$\begin{aligned}\operatorname{var}(X)&=\frac{\sigma^{2}}{\sqrt{2\pi}}\int_{-\infty}^{\infty}y^{2}e^{-y^{2}/2}\,dy\\&=\frac{\sigma^{2}}{\sqrt{2\pi}}\left(-ye^{-y^{2}/2}\right)\bigg\rvert_{-\infty}^{\infty}+\frac{\sigma^{2}}{\sqrt{2\pi}}\int_{-\infty}^{\infty}e^{-y^{2}/2}\,dy\\&=\frac{\sigma^{2}}{\sqrt{2\pi}}\int_{-\infty}^{\infty}e^{-y^{2}/2}\,dy\\&=\sigma^{2}.\end{aligned}$$

The last equality above is obtained by using the fact

$$\frac{1}{\sqrt{2\pi}}\int_{-\infty}^{\infty}e^{-y^{2}/2}\,dy=1,$$

which is just the normalization property of the normal PDF for the case where $\mu=0$ and $\sigma=1$.

The normal random variable has several special properties. The following one is particularly important and will be justified in Section 3.6.

> Normality is Preserved by Linear Transformations

If $X$ is a normal random variable with mean $\mu$ and variance $\sigma^{2}$, and if $a$, $b$ are scalars, then the random variable

$$Y=aX+b$$

is also normal, with mean and variance

$$E[Y]=a\mu+b,\qquad \operatorname{var}(Y)=a^{2}\sigma^{2}.$$

@endcard

@summary The normal PDF is the bell-shaped curve determined by its mean $\mu$ and variance $\sigma^{2}$. A linear function $aX+b$ of a normal random variable is again normal, with mean $a\mu+b$ and variance $a^{2}\sigma^{2}$.

@@ standard-normal | 3.3 | The Standard Normal Random Variable | subsection | 116-118
A normal random variable $Y$ with zero mean and unit variance is said to be standard normal. Its CDF is denoted by $\Phi$,

$$\Phi(y)=P(Y\le y)=P(Y<y)=\frac{1}{\sqrt{2\pi}}\int_{-\infty}^{y}e^{-t^{2}/2}\,dt.$$

It is recorded in a table, and is a very useful tool for calculating various probabilities involving normal random variables.

Note that the table only provides the values of $\Phi(y)$ for $y\ge 0$, because the omitted values can be found using the symmetry of the PDF. For example, if $Y$ is a standard normal random variable, we have

$$\begin{aligned}\Phi(-0.5)&=P(Y\le-0.5)=P(Y\ge 0.5)=1-P(Y<0.5)\\&=1-\Phi(0.5)=1-.6915=0.3085.\end{aligned}$$

Let $X$ be a normal random variable with mean $\mu$ and variance $\sigma^{2}$. We "standardize" $X$ by defining a new random variable $Y$ given by

$$Y=\frac{X-\mu}{\sigma}.$$

Since $Y$ is a linear transformation of $X$, it is normal. Furthermore,

$$E[Y]=\frac{E[X]-\mu}{\sigma}=0,\qquad \operatorname{var}(Y)=\frac{\operatorname{var}(X)}{\sigma^{2}}=1.$$

Thus, $Y$ is a standard normal random variable. This fact allows us to calculate the probability of any event defined in terms of $X$: we redefine the event in terms of $Y$, and then use the standard normal table.

@figure 10

Figure 3.10: The PDF $f_{Y}(y)=\frac{1}{\sqrt{2\pi}}e^{-y^{2}/2}$ of the standard normal random variable. Its corresponding CDF, which is denoted by $\Phi(y)$, is recorded in a table.

@page 117

### Example 3.8. Using the Normal Table.

The annual snowfall at a particular geographic location is modeled as a normal random variable with a mean of $\mu=60$ inches, and a standard deviation of $\sigma=20$. What is the probability that this year's snowfall will be at least 80 inches?

Let $X$ be the snow accumulation, viewed as a normal random variable, and let

$$Y=\frac{X-\mu}{\sigma}=\frac{X-60}{20},$$

be the corresponding standard normal random variable. We want to find

$$P(X\ge 80)=P\left(\frac{X-60}{20}\ge\frac{80-60}{20}\right)=P\left(Y\ge\frac{80-60}{20}\right)=P(Y\ge 1)=1-\Phi(1),$$

where $\Phi$ is the CDF of the standard normal. We read the value $\Phi(1)$ from the table:

$$\Phi(1)=0.8413,$$

so that

$$P(X\ge 80)=1-\Phi(1)=0.1587.$$

Generalizing the approach in the preceding example, we have the following procedure.

> CDF Calculation of the Normal Random Variable

The CDF of a normal random variable $X$ with mean $\mu$ and variance $\sigma^{2}$ is obtained using the standard normal table as

$$P(X\le x)=P\left(\frac{X-\mu}{\sigma}\le\frac{x-\mu}{\sigma}\right)=P\left(Y\le\frac{x-\mu}{\sigma}\right)=\Phi\left(\frac{x-\mu}{\sigma}\right),$$

where $Y$ is a standard normal random variable.

@endcard

The normal random variable is often used in signal processing and communications engineering to model noise and unpredictable distortions of signals. The following is a typical example.

### Example 3.9. Signal Detection.

A binary message is transmitted as a signal that is either $-1$ or $+1$. The communication channel corrupts the transmission with additive normal noise with mean $\mu=0$ and variance $\sigma^{2}$. The receiver concludes that the signal $-1$ (or $+1$) was transmitted if the value received is $<0$ (or $\ge 0$, respectively). What is the probability of error?

An error occurs whenever $-1$ is transmitted and the noise $N$ is at least 1 so that $N+S=N-1\ge 0$, or whenever $+1$ is transmitted and the noise $N$ is smaller

@page 118

@figure 11

Figure 3.11: The signal detection scheme of Example 3.9. The area of the shaded region gives the probability of error in the two cases where $-1$ and $+1$ is transmitted.

than $-1$ so that $N+S=N+1<0$. In the former case, the probability of error is

$$\begin{aligned}P(N\ge 1)&=1-P(N<1)=1-P\left(\frac{N-\mu}{\sigma}<\frac{1-\mu}{\sigma}\right)\\&=1-\Phi\left(\frac{1-\mu}{\sigma}\right)=1-\Phi\left(\frac{1}{\sigma}\right).\end{aligned}$$

In the latter case, the probability of error is the same, by symmetry. The value of $\Phi(1/\sigma)$ can be obtained from the normal table. For $\sigma=1$, we have $\Phi(1/\sigma)=\Phi(1)=0.8413$, and the probability of the error is 0.1587.

The normal random variable plays an important role in a broad range of probabilistic models. The main reason is that, generally speaking, it models well the additive effect of many independent factors, in a variety of engineering, physical, and statistical contexts. Mathematically, the key fact is that the sum of a large number of independent and identically distributed (not necessarily normal) random variables has an approximately normal CDF, regardless of the CDF of the individual random variables. This property is captured in the celebrated central limit theorem.

@summary Standardizing $X$ into $Y=(X-\mu)/\sigma$ turns any normal probability into a value of the standard normal CDF $\Phi$, which is read from a table. Symmetry supplies the negative arguments the table omits.

@@ conditioning-on-an-event | 3.4 | Conditioning on an Event | section | 118-124
The conditional PDF of a continuous random variable $X$, conditioned on a particular event $A$ with $P(A)>0$, is a function $f_{X\mid A}$ that satisfies

$$P(X\in B\mid A)=\int_{B}f_{X\mid A}(x)\,dx,$$

@page 119

for any subset $B$ of the real line. It is the same as an ordinary PDF, except that it now refers to a new universe in which the event $A$ is known to have occurred.

An important special case arises when we condition on $X$ belonging to a subset $A$ of the real line, with $P(X\in A)>0$. We then have

$$P(X\in B\mid X\in A)=\frac{P(X\in B\text{ and }X\in A)}{P(X\in A)}=\frac{\int_{A\cap B}f_{X}(x)\,dx}{P(X\in A)}.$$

This formula must agree with the earlier one, and therefore,

$$f_{X\mid A}(x\mid A)=\begin{cases}\dfrac{f_{X}(x)}{P(X\in A)}&\text{if }x\in A,\\0&\text{otherwise.}\end{cases}$$

We are using here the simpler notation $f_{X\mid A}(x)$ in place of $f_{X\mid X\in A}$, which is more accurate.

As in the discrete case, the conditional PDF is zero outside the conditioning set. Within the conditioning set, the conditional PDF has exactly the same shape as the unconditional one, except that it is scaled by the constant factor $1/P(X\in A)$. This normalization ensures that $f_{X\mid A}$ integrates to 1, which makes it a legitimate PDF.

@figure 13

Figure 3.13: The unconditional PDF $f_{X}$ and the conditional PDF $f_{X\mid A}$, where $A$ is the interval $[a,b]$. Note that within the conditioning event $A$, $f_{X\mid A}$ retains the same shape as $f_{X}$, except that it is scaled along the vertical axis.

### Example 3.10. The exponential random variable is memoryless.

Alvin goes to a bus stop where the time $T$ between two successive buses has an exponential PDF with parameter $\lambda$. Suppose that Alvin arrives $t$ secs after the preceding bus arrival and let us express this fact with the event $A=\{T>t\}$. Let $X$ be the time that Alvin has to wait for the next bus to arrive. What is the conditional CDF $F_{X\mid A}(x\mid A)$?

@page 120

We have

$$\begin{aligned}P(X>x\mid A)&=P(T>t+x\mid T>t)\\&=\frac{P(T>t+x\text{ and }T>t)}{P(T>t)}\\&=\frac{P(T>t+x)}{P(T>t)}\\&=\frac{e^{-\lambda(t+x)}}{e^{-\lambda t}}\\&=e^{-\lambda x},\end{aligned}$$

where we have used the expression for the CDF of an exponential random variable derived in Example 3.6.

Thus, the conditional CDF of $X$ is exponential with parameter $\lambda$, regardless the time $t$ that elapsed between the preceding bus arrival and Alvin's arrival. This is known as the memorylessness property of the exponential. Generally, if we model the time to complete a certain operation by an exponential random variable $X$, this property implies that as long as the operation has not been completed, the remaining time up to completion has the same exponential CDF, no matter when the operation started.

For a continuous random variable, the conditional expectation is defined similar to the unconditional case, except that we now need to use the conditional PDF. We summarize the discussion so far, together with some additional properties in the table that follows.

> Conditional PDF and Expectation Given an Event

The conditional PDF $f_{X\mid A}$ of a continuous random variable $X$ given an event $A$ with $P(A)>0$, satisfies

$$P(X\in B\mid A)=\int_{B}f_{X\mid A}(x)\,dx.$$

If $A$ be a subset of the real line with $P(X\in A)>0$, then

$$f_{X\mid A}(x)=\begin{cases}\dfrac{f_{X}(x)}{P(X\in A)}&\text{if }x\in A,\\0&\text{otherwise,}\end{cases}$$

and

$$P(X\in B\mid X\in A)=\int_{B}f_{X\mid A}(x)\,dx,$$

for any set $B$.

@page 121

The corresponding conditional expectation is defined by

$$E[X\mid A]=\int_{-\infty}^{\infty}xf_{X\mid A}(x)\,dx.$$

The expected value rule remains valid:

$$E\left[g(X)\mid A\right]=\int_{-\infty}^{\infty}g(x)f_{X\mid A}(x)\,dx.$$

If $A_{1},A_{2},\ldots,A_{n}$ are disjoint events with $P(A_{i})>0$ for each $i$, that form a partition of the sample space, then

$$f_{X}(x)=\sum_{i=1}^{n}P(A_{i})f_{X\mid A_{i}}(x)$$

(a version of the total probability theorem), and

$$E[X]=\sum_{i=1}^{n}P(A_{i})E[X\mid A_{i}]$$

(the total expectation theorem). Similarly,

$$E\left[g(X)\right]=\sum_{i=1}^{n}P(A_{i})E\left[g(X)\mid A_{i}\right].$$

@endcard

To justify the above version of the total probability theorem, we use the total probability theorem from Chapter 1, to obtain

$$P(X\le x)=\sum_{i=1}^{n}P(A_{i})P(X\le x\mid A_{i}).$$

This formula can be rewritten as

$$\int_{-\infty}^{x}f_{X}(t)\,dt=\sum_{i=1}^{n}P(A_{i})\int_{-\infty}^{x}f_{X\mid A_{i}}(t)\,dt.$$

We take the derivative of both sides, with respect to $x$, and obtain the desired relation

$$f_{X}(x)=\sum_{i=1}^{n}P(A_{i})f_{X\mid A_{i}}(x).$$

@page 122

If we now multiply both sides by $x$ and then integrate from $-\infty$ to $\infty$, we obtain the total expectation theorem for continuous random variables.

The total expectation theorem can often facilitate the calculation of the mean, variance, and other moments of a random variable, using a divide-and-conquer approach.

### Example 3.11. Mean and Variance of a Piecewise Constant PDF.

Suppose that the random variable $X$ has the piecewise constant PDF

$$f_{X}(x)=\begin{cases}1/3&\text{if }0\le x\le 1,\\2/3&\text{if }1<x\le 2,\\0&\text{otherwise,}\end{cases}$$

Consider the events

$$A_{1}=\left\{X\text{ lies in the first interval }[0,1]\right\},$$

$$A_{2}=\left\{X\text{ lies in the second interval }(1,2]\right\}.$$

We have from the given PDF,

$$P(A_{1})=\int_{0}^{1}f_{X}(x)\,dx=\frac{1}{3},\qquad P(A_{2})=\int_{1}^{2}f_{X}(x)\,dx=\frac{2}{3}.$$

Furthermore, the conditional mean and second moment of $X$, conditioned on $A_{1}$ and $A_{2}$, are easily calculated since the corresponding conditional PDFs $f_{X\mid A_{1}}$ and $f_{X\mid A_{2}}$ are uniform. We recall from Example 3.4 that the mean of a uniform random variable on an interval $[a,b]$ is $(a+b)/2$ and its second moment is $(a^{2}+ab+b^{2})/3$. Thus,

$$E[X\mid A_{1}]=\frac{1}{2},\qquad E[X\mid A_{2}]=\frac{3}{2},$$

$$E\left[X^{2}\mid A_{1}\right]=\frac{1}{3},\qquad E\left[X^{2}\mid A_{2}\right]=\frac{7}{3}.$$

@figure 14

Figure 3.14: Piecewise constant PDF for Example 3.11.

@page 123

We now use the total expectation theorem to obtain

$$E[X]=P(A_{1})E[X\mid A_{1}]+P(A_{2})E[X\mid A_{2}]=\frac{1}{3}\cdot\frac{1}{2}+\frac{2}{3}\cdot\frac{3}{2}=\frac{7}{6},$$

$$E[X^{2}]=P(A_{1})E[X^{2}\mid A_{1}]+P(A_{2})E[X^{2}\mid A_{2}]=\frac{1}{3}\cdot\frac{1}{3}+\frac{2}{3}\cdot\frac{7}{3}=\frac{15}{9}.$$

The variance is given by

$$\operatorname{var}(X)=E[X^{2}]-\left(E[X]\right)^{2}=\frac{15}{9}-\frac{49}{36}=\frac{11}{36}.$$

Note that this approach to the mean and variance calculation is easily generalized to piecewise constant PDFs with more than two pieces.

The next example illustrates a divide-and-conquer approach that uses the total probability theorem to calculate a PDF.

### Example 3.12.

The metro train arrives at the station near your home every quarter hour starting at 6:00 AM. You walk into the station every morning between 7:10 and 7:30 AM, with the time in this interval being a uniform random variable. What is the PDF of the time you have to wait for the first train to arrive?

@figure 15

Figure 3.15: The PDFs $f_{X}$, $f_{Y\mid A}$, $f_{Y\mid B}$, and $f_{Y}$ in Example 3.12.

The time of your arrival, denoted by $X$, is a uniform random variable on the interval from 7:10 to 7:30. Let $Y$ be the waiting time. We calculate the PDF $f_{Y}$ using a divide-and-conquer strategy. Let $A$ and $B$ be the events

$$A=\{7{:}10\le X\le 7{:}15\}=\{\text{you board the 7:15 train}\},$$

@page 124

$$B=\{7{:}15<X\le 7{:}30\}=\{\text{you board the 7:30 train}\}.$$

Conditioned on the event $A$, your arrival time is uniform on the interval from 7:10 to 7:15. In that case, the waiting time $Y$ is also uniform and takes values between 0 and 5 minutes. Similarly, conditioned on $B$, $Y$ is uniform and takes values between 0 and 15 minutes. The PDF of $Y$ is obtained using the total probability theorem,

$$f_{Y}(y)=P(A)f_{Y\mid A}(y)+P(B)f_{Y\mid B}(y),$$

In particular,

$$f_{Y}(y)=\frac{1}{4}\cdot\frac{1}{5}+\frac{3}{4}\cdot\frac{1}{15}=\frac{1}{10},\quad\text{for }0\le y\le 5,$$

and

$$f_{Y}(y)=\frac{1}{4}\cdot 0+\frac{3}{4}\cdot\frac{1}{15}=\frac{1}{20},\quad\text{for }5<y\le 15.$$

@summary Conditioning on an event rescales the PDF over the conditioning set and zeroes it elsewhere. The total probability and total expectation theorems then let a PDF, a mean, or a variance be assembled piece by piece from the conditional ones.

@@ multiple-continuous-introduction | 3.5 | Intro | introduction | 124-128
We will now extend the notion of a PDF to the case of multiple random variables. In complete analogy with discrete random variables, we introduce joint, marginal, and conditional PDFs. Their intuitive interpretation as well as their main properties parallel the discrete case.

We say that two continuous random variables associated with a common experiment are jointly continuous and can be described in terms of a joint PDF $f_{X,Y}$, if $f_{X,Y}$ is a nonnegative function that satisfies

$$P\left((X,Y)\in B\right)=\iint_{(x,y)\in B}f_{X,Y}(x,y)\,dx\,dy,$$

for every subset $B$ of the two-dimensional plane. The notation above means that the integration is carried over the set $B$. In the particular case where $B$ is a rectangle of the form $B=[a,b]\times[c,d]$, we have

$$P(a\le X\le b,\,c\le Y\le d)=\int_{c}^{d}\int_{a}^{b}f_{X,Y}(x,y)\,dx\,dy.$$

Furthermore, by letting $B$ be the entire two-dimensional plane, we obtain the normalization property

$$\int_{-\infty}^{\infty}\int_{-\infty}^{\infty}f_{X,Y}(x,y)\,dx\,dy=1.$$

@page 125

To interpret the PDF, we let $\delta$ be very small and consider the probability of a small rectangle. We have

$$P(a\le X\le a+\delta,\,c\le Y\le c+\delta)=\int_{c}^{c+\delta}\int_{a}^{a+\delta}f_{X,Y}(x,y)\,dx\,dy\approx f_{X,Y}(a,c)\cdot\delta^{2},$$

so we can view $f_{X,Y}(a,c)$ as the "probability per unit area" in the vicinity of $(a,c)$.

The joint PDF contains all conceivable probabilistic information on the random variables $X$ and $Y$, as well as their dependencies. It allows us to calculate the probability of any event that can be defined in terms of these two random variables. As a special case, it can be used to calculate the probability of an event involving only one of them. For example, let $A$ be a subset of the real line and consider the event $\{X\in A\}$. We have

$$P(X\in A)=P\left(X\in A\text{ and }Y\in(-\infty,\infty)\right)=\int_{A}\int_{-\infty}^{\infty}f_{X,Y}(x,y)\,dy\,dx.$$

Comparing with the formula

$$P(X\in A)=\int_{A}f_{X}(x)\,dx,$$

we see that the marginal PDF $f_{X}$ of $X$ is given by

$$f_{X}(x)=\int_{-\infty}^{\infty}f_{X,Y}(x,y)\,dy.$$

Similarly,

$$f_{Y}(y)=\int_{-\infty}^{\infty}f_{X,Y}(x,y)\,dx.$$

### Example 3.13. Two-Dimensional Uniform PDF.

Romeo and Juliet have a date at a given time, and each will arrive at the meeting place with a delay between 0 and 1 hour. Let $X$ and $Y$ denote the delays of Romeo and Juliet, respectively. Assuming that no pairs $(x,y)$ in the square $[0,1]\times[0,1]$ are more likely than others, a natural model involves a joint PDF of the form

$$f_{X,Y}(x,y)=\begin{cases}c&\text{if }0\le x\le 1\text{ and }0\le y\le 1,\\0&\text{otherwise,}\end{cases}$$

where $c$ is a constant. For this PDF to satisfy the normalization property

$$\int_{-\infty}^{\infty}\int_{-\infty}^{\infty}f_{X,Y}(x,y)\,dx\,dy=\int_{0}^{1}\int_{0}^{1}c\,dx\,dy=1,$$

@page 126

we must have

$$c=1.$$

This is an example of a uniform PDF on the unit square. More generally, let us fix some subset $S$ of the two-dimensional plane. The corresponding uniform joint PDF on $S$ is defined to be

$$f_{X,Y}(x,y)=\begin{cases}\dfrac{1}{\text{area of }S}&\text{if }(x,y)\in S,\\0&\text{otherwise.}\end{cases}$$

For any set $A\subset S$, the probability that the experimental value of $(X,Y)$ lies in $A$ is

$$P\left((X,Y)\in A\right)=\iint_{(x,y)\in A}f_{X,Y}(x,y)\,dx\,dy=\frac{1}{\text{area of }S}\iint_{(x,y)\in A\cap S}dx\,dy=\frac{\text{area of }A\cap S}{\text{area of }S}.$$

### Example 3.14.

We are told that the joint PDF of the random variables $X$ and $Y$ is a constant $c$ on the set $S$ shown in Figure 3.16 and is zero outside. Find the value of $c$ and the marginal PDFs of $X$ and $Y$.

The area of the set $S$ is equal to 4 and, therefore, $f_{X,Y}(x,y)=c=1/4$, for $(x,y)\in S$. To find the marginal PDF $f_{X}(x)$ for some particular $x$, we integrate (with respect to $y$) the joint PDF over the vertical line corresponding to that $x$. The resulting PDF is shown in the figure. We can compute $f_{Y}$ similarly.

@figure 16

Figure 3.16: The joint PDF in Example 3.14 and the resulting marginal PDFs.

@page 127

### Example 3.15. Buffon's Needle.

This is a famous example, which marks the origin of the subject of geometrical probability, that is, the analysis of the geometrical configuration of randomly placed objects.

A surface is ruled with parallel lines, which are at distance $d$ from each other. Suppose that we throw a needle of length $l$ on the surface at random. What is the probability that the needle will intersect one of the lines?

@figure 17

Figure 3.17: Buffon's needle. The length of the line segment between the midpoint of the needle and the point of intersection of the axis of the needle with the closest parallel line is $x/\sin\theta$. The needle will intersect the closest parallel line if and only if this length is less than $l/2$.

We assume here that $l<d$ so that the needle cannot intersect two lines simultaneously. Let $X$ be the distance from the midpoint of the needle to the nearest of the parallel lines, and let $\Theta$ be the acute angle formed by the axis of the needle and the parallel lines. We model the pair of random variables $(X,\Theta)$ with a uniform joint PDF over the rectangle $[0,d/2]\times[0,\pi/2]$, so that

$$f_{X,\Theta}(x,\theta)=\begin{cases}4/(\pi d)&\text{if }x\in[0,d/2]\text{ and }\theta\in[0,\pi/2],\\0&\text{otherwise.}\end{cases}$$

As can be seen from Figure 3.17, the needle will intersect one of the lines if and only if

$$X\le\frac{l}{2}\sin\Theta,$$

so the probability of intersection is

$$\begin{aligned}P\left(X\le(l/2)\sin\Theta\right)&=\iint_{x\le(l/2)\sin\theta}f_{X,\Theta}(x,\theta)\,dx\,d\theta\\&=\frac{4}{\pi d}\int_{0}^{\pi/2}\int_{0}^{(l/2)\sin\theta}dx\,d\theta\\&=\frac{4}{\pi d}\int_{0}^{\pi/2}\frac{l}{2}\sin\theta\,d\theta\\&=\frac{2l}{\pi d}(-\cos\theta)\Big\rvert_{0}^{\pi/2}\\&=\frac{2l}{\pi d}.\end{aligned}$$

The probability of intersection can be empirically estimated, by repeating the experiment a large number of times. Since it is equal to $2l/\pi d$, this provides us with a method for the experimental evaluation of $\pi$.

@summary Two random variables are jointly continuous when a joint PDF gives the probability of a region as an integral over it. Integrating the joint PDF along one variable recovers the marginal PDF of the other, and a uniform joint PDF turns probability into a ratio of areas.

@@ multiple-expectation | 3.5 | Expectation | subsection | 128-128
If $X$ and $Y$ are jointly continuous random variables, and $g$ is some function, then $Z=g(X,Y)$ is also a random variable. We will see in Section 3.6 methods for computing the PDF of $Z$, if it has one. For now, let us note that the expected value rule is still applicable and

$$E\left[g(X,Y)\right]=\int_{-\infty}^{\infty}\int_{-\infty}^{\infty}g(x,y)f_{X,Y}(x,y)\,dx\,dy.$$

As an important special case, for any scalars $a$, $b$, we have

$$E[aX+bY]=aE[X]+bE[Y].$$

@summary The expected value rule extends to a function of two jointly continuous random variables by integrating $g(x,y)$ against the joint PDF, and expectation remains linear.

@@ conditioning-one-on-another | 3.5 | Conditioning One Random Variable on Another | subsection | 128-133
Let $X$ and $Y$ be continuous random variables with joint PDF $f_{X,Y}$. For any fixed $y$ with $f_{Y}(y)>0$, the conditional PDF of $X$ given that $Y=y$, is defined by

$$f_{X\mid Y}(x\mid y)=\frac{f_{X,Y}(x,y)}{f_{Y}(y)}.$$

This definition is analogous to the formula $p_{X\mid Y}=p_{X,Y}/p_{Y}$ for the discrete case.

When thinking about the conditional PDF, it is best to view $y$ as a fixed number and consider $f_{X\mid Y}(x\mid y)$ as a function of the single variable $x$. As a function of $x$, the conditional PDF $f_{X\mid Y}(x\mid y)$ has the same shape as the joint PDF $f_{X,Y}(x,y)$, because the normalizing factor $f_{Y}(y)$ does not depend on $x$. Note that the normalization ensures that

$$\int_{-\infty}^{\infty}f_{X\mid Y}(x\mid y)\,dx=1,$$

so for any fixed $y$, $f_{X\mid Y}(x\mid y)$ is a legitimate PDF.

@figure 18

Figure 3.18: Visualization of the conditional PDF $f_{X\mid Y}(x\mid y)$. Let $X,Y$ have a joint PDF which is uniform on the set $S$. For each fixed $y$, we consider the joint PDF along the slice $Y=y$ and normalize it so that it integrates to 1.

@page 129

### Example 3.16. Circular Uniform PDF.

John throws a dart at a circular target of radius $r$. We assume that he always hits the target, and that all points of impact $(x,y)$ are equally likely, so that the joint PDF of the random variables $X$ and $Y$ is uniform. Following Example 3.13, and since the area of the circle is $\pi r^{2}$, we have

$$f_{X,Y}(x,y)=\begin{cases}\dfrac{1}{\text{area of the circle}}&\text{if }(x,y)\text{ is in the circle},\\0&\text{otherwise,}\end{cases}$$

$$f_{X,Y}(x,y)=\begin{cases}\dfrac{1}{\pi r^{2}}&\text{if }x^{2}+y^{2}\le r^{2},\\0&\text{otherwise.}\end{cases}$$

@figure 19

Figure 3.19: Circular target for Example 3.16.

To calculate the conditional PDF $f_{X\mid Y}(x\mid y)$, let us first calculate the marginal PDF $f_{Y}(y)$. For $|y|>r$, it is zero. For $|y|\le r$, it can be calculated as follows:

$$\begin{aligned}f_{Y}(y)&=\int_{-\infty}^{\infty}f_{X,Y}(x,y)\,dx\\&=\frac{1}{\pi r^{2}}\int_{x^{2}+y^{2}\le r^{2}}dx\\&=\frac{1}{\pi r^{2}}\int_{-\sqrt{r^{2}-y^{2}}}^{\sqrt{r^{2}-y^{2}}}dx\\&=\frac{2}{\pi r^{2}}\sqrt{r^{2}-y^{2}}.\end{aligned}$$

Note that the marginal $f_{Y}(y)$ is not a uniform PDF.

@page 130

The conditional PDF is

$$\begin{aligned}f_{X\mid Y}(x\mid y)&=\frac{f_{X,Y}(x,y)}{f_{Y}(y)}\\&=\frac{\dfrac{1}{\pi r^{2}}}{\dfrac{2}{\pi r^{2}}\sqrt{r^{2}-y^{2}}}\\&=\frac{1}{2\sqrt{r^{2}-y^{2}}}.\end{aligned}$$

Thus, for a fixed value of $y$, the conditional PDF $f_{X\mid Y}$ is uniform.

To interpret the conditional PDF, let us fix some small positive numbers $\delta_{1}$ and $\delta_{2}$, and condition on the event $B=\{y\le Y\le y+\delta_{2}\}$. We have

$$\begin{aligned}P(x\le X\le x+\delta_{1}\mid y\le Y\le y+\delta_{2})&=\frac{P(x\le X\le x+\delta_{1}\text{ and }y\le Y\le y+\delta_{2})}{P(y\le Y\le y+\delta_{2})}\\&\approx\frac{f_{X,Y}(x,y)\delta_{1}\delta_{2}}{f_{Y}(y)\delta_{2}}=f_{X\mid Y}(x\mid y)\delta_{1}.\end{aligned}$$

In words, $f_{X\mid Y}(x\mid y)\delta_{1}$ provides us with the probability that $X$ belongs in a small interval $[x,x+\delta_{1}]$, given that $Y$ belongs in a small interval $[y,y+\delta_{2}]$. Since $f_{X\mid Y}(x\mid y)\delta_{1}$ does not depend on $\delta_{2}$, we can think of the limiting case where $\delta_{2}$ decreases to zero and write

$$P(x\le X\le x+\delta_{1}\mid Y=y)\approx f_{X\mid Y}(x\mid y)\delta_{1},\qquad(\delta_{1}\text{ small}),$$

and, more generally,

$$P(X\in A\mid Y=y)=\int_{A}f_{X\mid Y}(x\mid y)\,dx.$$

Conditional probabilities, given the zero probability event $\{Y=y\}$, were left undefined in Chapter 1. But the above formula provides a natural way of defining such conditional probabilities in the present context. In addition, it allows us to view the conditional PDF $f_{X\mid Y}(x\mid y)$ (as a function of $x$) as a description of the probability law of $X$, given that the event $\{Y=y\}$ has occurred.

As in the discrete case, the conditional PDF $f_{X\mid Y}$, together with the marginal PDF $f_{Y}$ are sometimes used to calculate the joint PDF. Furthermore, this approach can be also used for modeling: instead of directly specifying $f_{X,Y}$, it is often natural to provide a probability law for $Y$, in terms of a PDF $f_{Y}$, and then provide a conditional probability law $f_{X\mid Y}(x,y)$ for $X$, given any possible value $y$ of $Y$.

### Example 3.17.

Let $X$ be exponentially distributed with mean 1. Once we observe the experimental value $x$ of $X$, we generate a normal random variable $Y$ with zero mean and variance $x+1$. What is the joint PDF of $X$ and $Y$?

@page 131

We have $f_{X}(x)=e^{-x}$, for $x\ge 0$, and

$$f_{Y\mid X}(y\mid x)=\frac{1}{\sqrt{2\pi(x+1)}}e^{-y^{2}/2(x+1)}.$$

Thus,

$$f_{X,Y}(x,y)=f_{X}(x)f_{Y\mid X}(y\mid x)=e^{-x}\frac{1}{\sqrt{2\pi(x+1)}}e^{-y^{2}/2(x+1)},$$

for all $x\ge 0$ and all $y$.

Having defined a conditional probability law, we can also define a corresponding conditional expectation by letting

$$E[X\mid Y=y]=\int_{-\infty}^{\infty}xf_{X\mid Y}(x\mid y)\,dx.$$

The properties of (unconditional) expectation carry though, with the obvious modifications, to conditional expectation. For example the conditional version of the expected value rule

$$E[g(X)\mid Y=y]=\int_{-\infty}^{\infty}g(x)f_{X\mid Y}(x\mid y)\,dx$$

remains valid.

> Summary of Facts About Multiple Continuous Random Variables

Let $X$ and $Y$ be jointly continuous random variables with joint PDF $f_{X,Y}$.

The joint, marginal, and conditional PDFs are related to each other by the formulas

$$f_{X,Y}(x,y)=f_{Y}(y)f_{X\mid Y}(x\mid y),$$

$$f_{X}(x)=\int_{-\infty}^{\infty}f_{Y}(y)f_{X\mid Y}(x\mid y)\,dy.$$

The conditional PDF $f_{X\mid Y}(x\mid y)$ is defined only for those $y$ for which $f_{Y}(y)>0$.

@page 132

They can be used to calculate probabilities:

$$P\left((X,Y)\in B\right)=\iint_{(x,y)\in B}f_{X,Y}(x,y)\,dx\,dy,$$

$$P(X\in A)=\int_{A}f_{X}(x)\,dx,$$

$$P(X\in A\mid Y=y)=\int_{A}f_{X\mid Y}(x\mid y)\,dx.$$

They can also be used to calculate expectations:

$$E[g(X)]=\int g(x)f_{X}(x)\,dx,$$

$$E\left[g(X,Y)\right]=\iint g(x,y)f_{X,Y}(x,y)\,dx\,dy,$$

$$E\left[g(X)\mid Y=y\right]=\int g(x)f_{X\mid Y}(x\mid y)\,dx,$$

$$E\left[g(X,Y)\mid Y=y\right]=\int g(x,y)f_{X\mid Y}(x\mid y)\,dx.$$

We have the following versions of the total expectation theorem:

$$E[X]=\int E[X\mid Y=y]f_{Y}(y)\,dy,$$

$$E\left[g(X)\right]=\int E\left[g(X)\mid Y=y\right]f_{Y}(y)\,dy,$$

$$E\left[g(X,Y)\right]=\int E\left[g(X,Y)\mid Y=y\right]f_{Y}(y)\,dy.$$

@endcard

To justify the first version of the total expectation theorem, we observe that

$$\begin{aligned}\int E[X\mid Y=y]f_{Y}(y)\,dy&=\int\left[\int xf_{X\mid Y}(x\mid y)\,dx\right]f_{Y}(y)\,dy\\&=\iint xf_{X\mid Y}(x\mid y)f_{Y}(y)\,dx\,dy\\&=\iint xf_{X,Y}(x,y)\,dx\,dy\end{aligned}$$

@page 133

$$\begin{aligned}&=\int x\left[\int f_{X,Y}(x,y)\,dy\right]dx\\&=\int xf_{X}(x)\,dx\\&=E[X].\end{aligned}$$

The other two versions are justified similarly.

@summary The conditional PDF $f_{X\mid Y}(x\mid y)=f_{X,Y}(x,y)/f_{Y}(y)$ is the joint PDF along the slice $Y=y$, renormalized to integrate to one. It defines conditional probabilities given a zero-probability event and supports conditional expectation and the total expectation theorem.

@@ continuous-bayes | 3.5 | Inference and the Continuous Bayes' Rule | subsection | 133-135
In many situations, we have a model of an underlying but unobserved phenomenon, represented by a random variable $X$ with PDF $f_{X}$, and we make noisy measurements $Y$. The measurements are supposed to provide information about $X$ and are modeled in terms of a conditional PDF $f_{Y\mid X}$. For example, if $Y$ is the same as $X$, but corrupted by zero-mean normally distributed noise, one would let the conditional PDF $f_{Y\mid X}(y\mid x)$ of $Y$, given that $X=x$, be normal with mean equal to $x$. Once the experimental value of $Y$ is measured, what information does this provide on the unknown value of $X$?

This setting is similar to that encountered in Chapter 1, when we introduced the Bayes rule and used it to solve inference problems. The only difference is that we are now dealing with continuous random variables.

Note that the information provided by the event $\{Y=y\}$ is described by the conditional PDF $f_{X\mid Y}(x\mid y)$. It thus suffices to evaluate the latter PDF. A calculation analogous to the original derivation of the Bayes' rule, based on the formulas $f_{X}f_{Y\mid X}=f_{X,Y}=f_{Y}f_{X\mid Y}$, yields

$$f_{X\mid Y}(x\mid y)=\frac{f_{X}(x)f_{Y\mid X}(y\mid x)}{f_{Y}(y)}=\frac{f_{X}(x)f_{Y\mid X}(y\mid x)}{\displaystyle\int f_{X}(t)f_{Y\mid X}(y\mid t)\,dt},$$

which is the desired formula.

### Example 3.18.

A lightbulb produced by the General Illumination Company is known to have an exponentially distributed lifetime $Y$. However, the company has been experiencing quality control problems. On any given day, the parameter $\lambda$ of the PDF of $Y$ is actually a random variable, uniformly distributed in the interval $[0,1/2]$. We test a lightbulb and record the experimental value $y$ of its lifetime. What can we say about the underlying parameter $\lambda$?

We model the parameter $\lambda$ as a random variable $X$, with a uniform distribution. All available information about $X$ is contained in the conditional PDF $f_{X\mid Y}(x\mid y)$. We view $y$ as a constant (equal to the observed value of $Y$) and concentrate on the dependence of the PDF on $x$. Note that $f_{X}(x)=2$, for $0\le x\le 1/2$. By the continuous Bayes rule, we have

$$f_{X\mid Y}(x\mid y)=\frac{2xe^{-xy}}{\int_{0}^{1/2}2te^{-ty}\,dt},\qquad\text{for }0\le x\le\frac{1}{2}.$$

@page 134

In some cases, the unobserved phenomenon is inherently discrete. For example, if a binary signal is observed in the presence of noise with a normal distribution. Or if a medical diagnosis is to be made on the basis of continuous measurements like temperature and blood counts. In such cases, a somewhat different version of Bayes' rule applies.

Let $X$ be a discrete random variable that takes values in a finite set $\{1,\ldots,n\}$ and which represents the different discrete possibilities for the unobserved phenomenon of interest. The PMF $p_{X}$ of $X$ is assumed to be known. Let $Y$ be a continuous random variable which, for any given value $x$, is described by a conditional PDF $f_{Y\mid X}(y\mid x)$. We are interested in the conditional PMF of $X$ given the experimental value $y$ of $Y$.

Instead of working with conditioning event $\{Y=y\}$ which has zero probability, let us instead condition on the event $\{y\le Y\le y+\delta\}$, where $\delta$ is a small positive number, and then take the limit as $\delta$ tends to zero. We have, using the Bayes rule

$$\begin{aligned}P(X=x\mid Y=y)&\approx P(X=x\mid y\le Y\le y+\delta)\\&=\frac{p_{X}(x)P(y\le Y\le y+\delta\mid X=x)}{P(y\le Y\le y+\delta)}\\&\approx\frac{p_{X}(x)f_{Y\mid X}(y\mid x)\delta}{f_{Y}(y)\delta}\\&=\frac{p_{X}(x)f_{Y\mid X}(y\mid x)}{f_{Y}(y)}.\end{aligned}$$

The denominator can be evaluated using a version of the total probability theorem introduced in Section 3.4. We have

$$f_{Y}(y)=\sum_{i=1}^{n}p_{X}(i)f_{Y\mid X}(y\mid i).$$

### Example 3.19.

Let us revisit the signal detection problem considered in Example 3.9. A signal $S$ is transmitted and we are given that $P(S=1)=p$ and $P(S=-1)=1-p$. The received signal is $Y=N+S$, where $N$ is zero mean normal noise, with variance $\sigma^{2}$, independent of $S$. What is the probability that $S=1$, as a function of the observed value $y$ of $Y$?

Conditioned on $S=s$, the random variable $Y$ has a normal distribution with mean $s$ and variance $\sigma^{2}$. Applying the formula developed above, we obtain

$$P(S=1\mid Y=y)=\frac{p_{S}(1)f_{Y\mid S}(y\mid 1)}{f_{Y}(y)}=\frac{\frac{p}{\sqrt{2\pi}\,\sigma}e^{-(y-1)^{2}/2\sigma^{2}}}{\frac{p}{\sqrt{2\pi}\,\sigma}e^{-(y-1)^{2}/2\sigma^{2}}+\frac{1-p}{\sqrt{2\pi}\,\sigma}e^{-(y+1)^{2}/2\sigma^{2}}}.$$

@summary The continuous Bayes' rule turns a prior PDF and a measurement model into the posterior PDF $f_{X\mid Y}$, the denominator being the total probability integral. When the unobserved quantity is discrete, the same limiting argument gives a posterior PMF with a sum in the denominator.

@@ independence | 3.5 | Independence | subsection | 135-136
In full analogy with the discrete case, we say that two continuous random variables $X$ and $Y$ are independent if their joint PDF is the product of the marginal PDFs:

$$f_{X,Y}(x,y)=f_{X}(x)f_{Y}(y),\qquad\text{for all }x,y.$$

Comparing with the formula $f_{X,Y}(x,y)=f_{X\mid Y}(x\mid y)f_{Y}(y)$, we see that independence is the same as the condition

$$f_{X\mid Y}(x\mid y)=f_{X}(x),\qquad\text{for all }x\text{ and all }y\text{ with }f_{Y}(y)>0,$$

or, symmetrically,

$$f_{Y\mid X}(y\mid x)=f_{Y}(y),\qquad\text{for all }y\text{ and all }x\text{ with }f_{X}(x)>0.$$

If $X$ and $Y$ are independent, then any two events of the form $\{X\in A\}$ and $\{Y\in B\}$ are independent. Indeed,

$$\begin{aligned}P(X\in A\text{ and }Y\in B)&=\int_{x\in A}\int_{y\in B}f_{X,Y}(x,y)\,dy\,dx\\&=\int_{x\in A}\int_{y\in B}f_{X}(x)f_{Y}(y)\,dy\,dx\\&=\int_{x\in A}f_{X}(x)\,dx\int_{y\in B}f_{Y}(y)\,dy\\&=P(X\in A)P(Y\in B).\end{aligned}$$

A converse statement is also true.

A calculation similar to the discrete case shows that if $X$ and $Y$ are independent, then

$$E[g(X)h(Y)]=E[g(X)]E[h(Y)],$$

for any two functions $g$ and $h$. Finally, the variance of the sum of independent random variables is again equal to the sum of the variances.

@page 136

> Independence of Continuous Random Variables

Suppose that $X$ and $Y$ are independent, that is,

$$f_{X,Y}(x,y)=f_{X}(x)f_{Y}(y),\qquad\text{for all }x,y.$$

We then have the following properties.

The random variables $g(X)$ and $h(Y)$ are independent, for any functions $g$ and $h$.

We have

$$E[XY]=E[X]E[Y],$$

and, more generally,

$$E\left[g(X)h(Y)\right]=E\left[g(X)\right]E\left[h(Y)\right],$$

We have

$$\operatorname{var}(X+Y)=\operatorname{var}(X)+\operatorname{var}(Y).$$

@endcard

@summary Independence of continuous random variables means the joint PDF factors into the marginals, equivalently that conditioning changes nothing. It makes events about $X$ and about $Y$ independent, factors expectations of products, and adds variances.

@@ joint-cdfs | 3.5 | Joint CDFs | subsection | 136-137
If $X$ and $Y$ are two random variables associated with the same experiment, we define their joint CDF by

$$F_{X,Y}(x,y)=P(X\le x,\,Y\le y).$$

As in the case of one random variable, the advantage of working with the CDF is that it applies equally well to discrete and continuous random variables. In particular, if $X$ and $Y$ are described by a joint PDF $f_{X,Y}$, then

$$F_{X,Y}(x,y)=P(X\le x,\,Y\le y)=\int_{-\infty}^{x}\int_{-\infty}^{y}f_{X,Y}(s,t)\,ds\,dt.$$

Conversely, the PDF can be recovered from the CDF by differentiating:

$$f_{X,Y}(x,y)=\frac{\partial^{2}F_{X,Y}}{\partial x\partial y}(x,y).$$

### Example 3.20.

Let $X$ and $Y$ be described by a uniform PDF on the unit square. The joint CDF is given by

$$F_{X,Y}(x,y)=P(X\le x,\,Y\le y)=xy,\qquad\text{for }0\le x,y\le 1.$$

@page 137

We then verify that

$$\frac{\partial^{2}F_{X,Y}}{\partial x\partial y}(x,y)=\frac{\partial^{2}(xy)}{\partial x\partial y}(x,y)=1=f_{X,Y}(x,y),$$

for all $(x,y)$ in the unit square.

@summary The joint CDF $F_{X,Y}(x,y)=P(X\le x,Y\le y)$ applies to discrete and continuous pairs alike; integrating the joint PDF twice gives it, and the mixed second partial derivative gives the joint PDF back.

@@ more-than-two-random-variables | 3.5 | More than Two Random Variables | subsection | 137-137
The joint PDF of three random variables $X$, $Y$, and $Z$ is defined in analogy with the above. For example, we have

$$P\left((X,Y,Z)\in B\right)=\iiint_{(x,y,z)\in B}f_{X,Y,Z}(x,y,z)\,dx\,dy\,dz,$$

for any set $B$. We also have relations such as

$$f_{X,Y}(x,y)=\int f_{X,Y,Z}(x,y,z)\,dz,$$

and

$$f_{X}(x)=\iint f_{X,Y,Z}(x,y,z)\,dy\,dz.$$

One can also define conditional PDFs by formulas such as

$$f_{X,Y\mid Z}(x,y\mid z)=\frac{f_{X,Y,Z}(x,y,z)}{f_{Z}(z)},\qquad\text{for }f_{Z}(z)>0,$$

$$f_{X\mid Y,Z}(x\mid y,z)=\frac{f_{X,Y,Z}(x,y,z)}{f_{Y,Z}(y,z)},\qquad\text{for }f_{Y,Z}(y,z)>0.$$

There is an analog of the multiplication rule:

$$f_{X,Y,Z}(x,y,z)=f_{X\mid Y,Z}(x\mid y,z)f_{Y\mid Z}(y\mid z)f_{Z}(z).$$

Finally, we say that the three random variables $X$, $Y$, and $Z$ are independent if

$$f_{X,Y,Z}(x,y,z)=f_{X}(x)f_{Y}(y)f_{Z}(z),\qquad\text{for all }x,y,z.$$

The expected value rule for functions takes the form

$$E\left[g(X,Y,Z)\right]=\iiint g(x,y,z)f_{X,Y,Z}(x,y,z)\,dx\,dy\,dz,$$

and if $g$ is linear and of the form $aX+bY+cZ$, then

$$E[aX+bY+cZ]=aE[X]+bE[Y]+cE[Z].$$

Furthermore, there are obvious generalizations of the above to the case of more than three random variables. For example, for any random variables $X_{1},X_{2},\ldots,X_{n}$ and any scalars $a_{1},a_{2},\ldots,a_{n}$, we have

$$E[a_{1}X_{1}+a_{2}X_{2}+\cdots+a_{n}X_{n}]=a_{1}E[X_{1}]+a_{2}E[X_{2}]+\cdots+a_{n}E[X_{n}].$$

@summary Joint PDFs, marginals, conditional PDFs, the multiplication rule, independence, and the expected value rule all extend to three or more random variables, and expectation stays linear for any number of them.

@@ derived-distributions-introduction | 3.6 | Intro | introduction | 138-140
We have seen that the mean of a function $Y=g(X)$ of a continuous random variable $X$, can be calculated using the expected value rule

$$E[Y]=\int_{-\infty}^{\infty}g(x)f_{X}(x)\,dx,$$

without first finding the PDF $f_{Y}$ of $Y$. Still, in some cases, we may be interested in an explicit formula for $f_{Y}$. Then, the following two-step approach can be used.

> Calculation of the PDF of a Function $Y=g(X)$ of a Continuous Random Variable $X$

1. Calculate the CDF $F_{Y}$ of $Y$ using the formula

$$F_{Y}(y)=P\left(g(X)\le y\right)=\int_{\{x\mid g(x)\le y\}}f_{X}(x)\,dx.$$

2. Differentiate to obtain the PDF of $Y$:

$$f_{Y}(y)=\frac{dF_{Y}}{dy}(y).$$

@endcard

### Example 3.21.

Let $X$ be uniform on $[0,1]$. Find the PDF of $Y=\sqrt{X}$. Note that $Y$ takes values between 0 and 1. For every $y\in[0,1]$, we have

$$F_{Y}(y)=P(Y\le y)=P(\sqrt{X}\le y)=P(X\le y^{2})=y^{2},\quad 0\le y\le 1.$$

We then differentiate and obtain

$$f_{Y}(y)=\frac{dF_{Y}}{dy}(y)=\frac{d(y^{2})}{dy}=2y,\qquad 0\le y\le 1.$$

Outside the range $[0,1]$, the CDF $F_{Y}(y)$ is constant, with $F_{Y}(y)=0$ for $y\le 0$, and $F_{Y}(y)=1$ for $y\ge 1$. By differentiating, we see that $f_{Y}(y)=0$ for $y$ outside $[0,1]$.

### Example 3.22.

John Slow is driving from Boston to the New York area, a distance of 180 miles. His average speed is uniformly distributed between 30 and 60 miles per hour. What is the PDF of the duration of the trip?

@page 139

Let $X$ be the speed and let $Y=g(X)$ be the trip duration:

$$g(X)=\frac{180}{X}.$$

To find the CDF of $Y$, we must calculate

$$P(Y\le y)=P\left(\frac{180}{X}\le y\right)=P\left(\frac{180}{y}\le X\right).$$

We use the given uniform PDF of $X$, which is

$$f_{X}(x)=\begin{cases}1/30&\text{if }30\le x\le 60,\\0&\text{otherwise,}\end{cases}$$

and the corresponding CDF, which is

$$F_{X}(x)=\begin{cases}0&\text{if }x\le 30,\\(x-30)/30&\text{if }30\le x\le 60,\\1&\text{if }60\le x.\end{cases}$$

Thus,

$$\begin{aligned}F_{Y}(y)&=P\left(\frac{180}{y}\le X\right)\\&=1-F_{X}\left(\frac{180}{y}\right)\\&=\begin{cases}0&\text{if }y\le 180/60,\\1-\dfrac{\dfrac{180}{y}-30}{30}&\text{if }180/60\le y\le 180/30,\\1&\text{if }180/30\le y,\end{cases}\\&=\begin{cases}0&\text{if }y\le 3,\\2-(6/y)&\text{if }3\le y\le 6,\\1&\text{if }6\le y.\end{cases}\end{aligned}$$

Differentiating this expression, we obtain the PDF of $Y$:

$$f_{Y}(y)=\begin{cases}0&\text{if }y\le 3,\\6/y^{2}&\text{if }3\le y\le 6,\\0&\text{if }6\le y.\end{cases}$$

### Example 3.23.

Let $Y=g(X)=X^{2}$, where $X$ is a random variable with known PDF. For any $y\ge 0$, we have

$$\begin{aligned}F_{Y}(y)&=P(Y\le y)\\&=P(X^{2}\le y)\\&=P(-\sqrt{y}\le X\le\sqrt{y})\\&=F_{X}(\sqrt{y})-F_{X}(-\sqrt{y}),\end{aligned}$$

and therefore, by differentiating and using the chain rule,

$$f_{Y}(y)=\frac{1}{2\sqrt{y}}f_{X}(\sqrt{y})+\frac{1}{2\sqrt{y}}f_{X}(-\sqrt{y}),\qquad y\ge 0.$$

@page 140

@figure 20

Figure 3.20: The calculation of the PDF of $Y=180/X$ in Example 3.22. The arrows indicate the flow of the calculation.

@summary To find the PDF of $Y=g(X)$, first write the CDF $F_{Y}(y)$ as the probability of the set of $x$ with $g(x)\le y$, then differentiate. The event has to be translated into one about $X$ before any integration is done.

@@ linear-case | 3.6 | The Linear Case | subsection | 140-142
An important case arises when $Y$ is a linear function of $X$.

> The PDF of a Linear Function of a Random Variable

Let $X$ be a continuous random variable with PDF $f_{X}$, and let

$$Y=aX+b,$$

for some scalars $a\ne 0$ and $b$. Then,

$$f_{Y}(y)=\frac{1}{|a|}f_{X}\left(\frac{y-b}{a}\right).$$

@endcard

@page 141

@figure 21

Figure 3.21: The PDF of $aX+b$ in terms of the PDF of $X$. In this figure, $a=2$ and $b=5$. As a first step, we obtain the PDF of $aX$. The range of $Y$ is wider than the range of $X$, by a factor of $a$. Thus, the PDF $f_{X}$ must be stretched (scaled horizontally) by this factor. But in order to keep the total area under the PDF equal to 1, we need to scale the PDF (vertically) by the same factor $a$. The random variable $aX+b$ is the same as $aX$ except that its values are shifted by $b$. Accordingly, we take the PDF of $aX$ and shift it (horizontally) by $b$. The end result of these operations is the PDF of $Y=aX+b$ and is given mathematically by $f_{Y}(y)=\frac{1}{|a|}f_{X}\left(\frac{y-b}{a}\right)$. If $a$ were negative, the procedure would be the same except that the PDF of $X$ would first need to be reflected around the vertical axis ("flipped") yielding $f_{-X}$. Then a horizontal and vertical scaling (by a factor of $|a|$ and $1/|a|$, respectively) yields the PDF of $-|a|X=aX$. Finally, a horizontal shift of $b$ would again yield the PDF of $aX+b$.

To verify this formula, we use the two-step procedure. We only show the steps for the case where $a>0$; the case $a<0$ is similar. We have

$$\begin{aligned}F_{Y}(y)&=P(Y\le y)\\&=P(aX+b\le y)\\&=P\left(X\le\frac{y-b}{a}\right)\\&=F_{X}\left(\frac{y-b}{a}\right).\end{aligned}$$

We now differentiate this equality and use the chain rule, to obtain

$$f_{Y}(y)=\frac{dF_{Y}}{dy}(y)=\frac{1}{a}\cdot\frac{dF_{X}}{dx}\left(\frac{y-b}{a}\right)=\frac{1}{a}\cdot f_{X}\left(\frac{y-b}{a}\right).$$

### Example 3.24. A linear function of an exponential random variable.

Suppose that $X$ is an exponential random variable with PDF

$$f_{X}(x)=\begin{cases}\lambda e^{-\lambda x}&\text{if }x\ge 0,\\0&\text{otherwise,}\end{cases}$$

@page 142

where $\lambda$ is a positive parameter. Let $Y=aX+b$. Then,

$$f_{Y}(y)=\begin{cases}\dfrac{\lambda}{|a|}e^{-\lambda(y-b)/a}&\text{if }(y-b)/a\ge 0,\\0&\text{otherwise.}\end{cases}$$

Note that if $b=0$ and $a>0$, then $Y$ is an exponential random variable with parameter $\lambda/a$. In general, however, $Y$ need not be exponential. For example, if $a<0$ and $b=0$, then the range of $Y$ is the negative real axis.

### Example 3.25. A linear function of a normal random variable is normal.

Suppose that $X$ is a normal random variable with mean $\mu$ and variance $\sigma^{2}$, and let $Y=aX+b$, where $a$ and $b$ are some scalars. We have

$$f_{X}(x)=\frac{1}{\sqrt{2\pi}\,\sigma}e^{-(x-\mu)^{2}/2\sigma^{2}}.$$

Therefore,

$$\begin{aligned}f_{Y}(y)&=\frac{1}{|a|}f_{X}\left(\frac{y-b}{a}\right)\\&=\frac{1}{|a|}\frac{1}{\sqrt{2\pi}\,\sigma}e^{-((y-b)/a-\mu)^{2}/2\sigma^{2}}\\&=\frac{1}{\sqrt{2\pi}\,|a|\sigma}e^{-(y-b-a\mu)^{2}/2a^{2}\sigma^{2}}.\end{aligned}$$

We recognize this as a normal PDF with mean $a\mu+b$ and variance $a^{2}\sigma^{2}$. In particular, $Y$ is a normal random variable.

@summary A linear change of variable stretches the PDF horizontally by $a$, scales it vertically by $1/|a|$, and shifts it by $b$, giving $f_{Y}(y)=f_{X}((y-b)/a)/|a|$. Applied to a normal PDF it returns a normal PDF, which is why normality survives linear transformations.

@@ monotonic-case | 3.6 | The Monotonic Case | subsection | 142-146
The calculation and the formula for the linear case can be generalized to the case where $g$ is a monotonic function. Let $X$ be a continuous random variable and suppose that its range is contained in a certain interval $I$, in the sense that $f_{X}(x)=0$ for $x\notin I$. We consider the random variable $Y=g(X)$, and assume that $g$ is strictly monotonic over the interval $I$. That is, either

(a) $g(x)<g(x')$ for all $x,x'\in I$ satisfying $x<x'$ (monotonically increasing case), or

(b) $g(x)>g(x')$ for all $x,x'\in I$ satisfying $x<x'$ (monotonically decreasing case).

Furthermore, we assume that the function $g$ is differentiable. Its derivative will necessarily be nonnegative in the increasing case and nonpositive in the decreasing case.

@page 143

An important fact is that a monotonic function can be "inverted" in the sense that there is some function $h$, called the inverse of $g$, such that for all $x\in I$, we have $y=g(x)$ if and only if $x=h(y)$. For example, the inverse of the function $g(x)=180/x$ considered in Example 3.22 is $h(y)=180/y$, because we have $y=180/x$ if and only if $x=180/y$. Other such examples of pairs of inverse functions include

$$g(x)=ax+b,\qquad h(y)=\frac{y-b}{a},$$

where $a$ and $b$ are scalars with $a\ne 0$, and

$$g(x)=e^{ax},\qquad h(y)=\frac{\ln y}{a},$$

where $a$ is a nonzero scalar.

@figure 22

Figure 3.22: A monotonically increasing function $g$ (on the left) and its inverse (on the right). Note that the graph of $h$ has the same shape as the graph of $g$, except that it is rotated by 90 degrees and then reflected (this is the same as interchanging the $x$ and $y$ axes).

For monotonic functions $g$, the following is a convenient analytical formula for the PDF of the function $Y=g(X)$.

@page 144

> PDF Formula for a Monotonic Function of a Continuous Random Variable

Suppose that $g$ is monotonic and that for some function $h$ and all $x$ in the range $I$ of $X$ we have

$$y=g(x)\qquad\text{if and only if}\qquad x=h(y).$$

Assume that $h$ has first derivative $(dh/dy)(y)$. Then the PDF of $Y$ in the region where $f_{Y}(y)>0$ is given by

$$f_{Y}(y)=f_{X}\left(h(y)\right)\left\lvert\frac{dh}{dy}(y)\right\rvert.$$

@endcard

For a verification of the above formula, assume first that $g$ is monotonically increasing. Then, we have

$$F_{Y}(y)=P\left(g(X)\le y\right)=P\left(X\le h(y)\right)=F_{X}\left(h(y)\right),$$

where the second equality can be justified using the monotonically increasing property of $g$. By differentiating this relation, using also the chain rule, we obtain

$$f_{Y}(y)=\frac{dF_{Y}}{dy}(y)=f_{X}\left(h(y)\right)\frac{dh}{dy}(y).$$

Because $g$ is monotonically increasing, $h$ is also monotonically increasing, so its derivative is positive:

$$\frac{dh}{dy}(y)=\left\lvert\frac{dh}{dy}(y)\right\rvert.$$

This justifies the PDF formula for a monotonically increasing function $g$. The justification for the case of monotonically decreasing function is similar: we differentiate instead the relation

$$F_{Y}(y)=P\left(g(X)\le y\right)=P\left(X\ge h(y)\right)=1-F_{X}\left(h(y)\right),$$

and use the chain rule.

There is a similar formula involving the derivative of $g$, rather than the derivative of $h$. To see this, differentiate the equality $g\left(h(y)\right)=y$, and use the chain rule to obtain

$$\frac{dg}{dh}\left(h(y)\right)\cdot\frac{dh}{dy}(y)=1.$$

@page 145

Let us fix some $x$ and $y$ that are related by $g(x)=y$, which is the same as $h(y)=x$. Then,

$$\frac{dg}{dx}(x)\cdot\frac{dh}{dy}(y)=1,$$

which leads to

$$f_{Y}(y)=f_{X}(x)\Big/\left\lvert\frac{dg}{dx}(x)\right\rvert.$$

@figure 23

Figure 3.23: Calculating the probability $P\left(g(X)\le y\right)$. When $g$ is monotonically increasing (left figure), the event $\{g(X)\le y\}$ is the same as the event $\{X\le h(y)\}$. When $g$ is monotonically decreasing (right figure), the event $\{g(X)\le y\}$ is the same as the event $\{X\ge h(y)\}$.

### Example 3.22. (Continued)

To check the PDF formula, let us apply it to the problem of Example 3.22. In the region of interest, $x\in[30,60]$, we have $h(y)=180/y$, and

$$\frac{dF_{X}}{dh}\left(h(y)\right)=\frac{1}{30},\qquad\left\lvert\frac{dh}{dy}(y)\right\rvert=\frac{180}{y^{2}}.$$

Thus, in the region of interest $y\in[3,6]$, the PDF formula yields

$$f_{Y}(y)=f_{X}\left(h(y)\right)\left\lvert\frac{dh}{dy}(y)\right\rvert=\frac{1}{30}\cdot\frac{180}{y^{2}}=\frac{6}{y^{2}},$$

consistently with the expression obtained earlier.

### Example 3.26.

Let $Y=g(X)=X^{2}$, where $X$ is a continuous uniform random variable in the interval $(0,1]$. Within this interval, $g$ is monotonic, and its inverse

@page 146

is $h(y)=\sqrt{y}$. Thus, for any $y\in(0,1]$, we have

$$\left\lvert\frac{dh}{dy}(y)\right\rvert=\frac{1}{2\sqrt{y}},\qquad f_{X}(\sqrt{y})=1,$$

and

$$f_{Y}(y)=\begin{cases}\dfrac{1}{2\sqrt{y}}&\text{if }y\in(0,1],\\0&\text{otherwise.}\end{cases}$$

We finally note that if we interpret PDFs in terms of probabilities of small intervals, the content of our formulas becomes pretty intuitive.

@summary When $g$ is strictly monotonic with inverse $h$, the PDF of $Y=g(X)$ is $f_{X}(h(y))$ scaled by $|dh/dy|$, which measures how the transformation stretches an interval. The two-step CDF procedure justifies the formula in both the increasing and decreasing case.

@@ functions-of-two-random-variables | 3.6 | Functions of Two Random Variables | subsection | 146-149
The two-step procedure that first calculates the CDF and then differentiates to obtain the PDF also applies to functions of more than one random variable.

### Example 3.27.

Two archers shoot at a target. The distance of each shot from the center of the target is uniformly distributed from 0 to 1, independently of the other shot. What is the PDF of the distance of the losing shot from the center?

Let $X$ and $Y$ be the distances from the center of the first and second shots, respectively. Let also $Z$ be the distance of the losing shot:

$$Z=\max\{X,Y\}.$$

We know that $X$ and $Y$ are uniformly distributed over $[0,1]$, so that for all $z\in[0,1]$, we have

$$P(X\le z)=P(Y\le z)=z.$$

Thus, using the independence of $X$ and $Y$, we have for all $z\in[0,1]$,

$$\begin{aligned}F_{Z}(z)&=P\left(\max\{X,Y\}\le z\right)\\&=P(X\le z,\,Y\le z)\\&=P(X\le z)P(Y\le z)\\&=z^{2}.\end{aligned}$$

Differentiating, we obtain

$$f_{Z}(z)=\begin{cases}2z&\text{if }0\le z\le 1,\\0&\text{otherwise.}\end{cases}$$

### Example 3.28.

Let $X$ and $Y$ be independent random variables that are uniformly distributed on the interval $[0,1]$. What is the PDF of the random variable $Z=Y/X$?

@page 147

@figure 24

Figure 3.24: Illustration of the PDF formula for a monotonically increasing function $g$. Consider an interval $[x,x+\delta_{1}]$, where $\delta_{1}$ is a small number. Under the mapping $g$, the image of this interval is another interval $[y,y+\delta_{2}]$. Since $(dg/dx)(x)$ is the slope of $g$, we have $\delta_{2}/\delta_{1}\approx(dg/dx)(x)$, or in terms of the inverse function, $\delta_{1}/\delta_{2}\approx(dh/dy)(y)$. We now note that the event $\{x\le X\le x+\delta_{1}\}$ is the same as the event $\{y\le Y\le y+\delta_{2}\}$. Thus, $f_{Y}(y)\delta_{2}\approx P(y\le Y\le y+\delta_{2})=P(x\le X\le x+\delta_{1})\approx f_{X}(x)\delta_{1}$. We move $\delta_{1}$ to the left-hand side and use our earlier formula for the ratio $\delta_{2}/\delta_{1}$, to obtain $f_{Y}(y)\frac{dg}{dx}(x)=f_{X}(x)$. Alternatively, if we move $\delta_{2}$ to the right-hand side and use the formula for $\delta_{1}/\delta_{2}$, we obtain $f_{Y}(y)=f_{X}\left(h(y)\right)\cdot\frac{dh}{dy}(y)$.

We will find the PDF of $Z$ by first finding its CDF and then differentiating. We consider separately the cases $0\le z\le 1$ and $z>1$. As shown in Figure 3.25, we have

$$F_{Z}(z)=P\left(\frac{Y}{X}\le z\right)=\begin{cases}z/2&\text{if }0\le z\le 1,\\1-1/(2z)&\text{if }z>1,\\0&\text{otherwise.}\end{cases}$$

@page 148

By differentiating, we obtain

$$f_{Z}(z)=\begin{cases}1/2&\text{if }0\le z\le 1,\\1/(2z^{2})&\text{if }z>1,\\0&\text{otherwise.}\end{cases}$$

@figure 25

Figure 3.25: The calculation of the CDF of $Z=Y/X$ in Example 3.28. The value $P(Y/X\le z)$ is equal to the shaded subarea of the unit square. The figure on the left deals with the case where $0\le z\le 1$ and the figure on the right refers to the case where $z>1$.

### Example 3.29.

Romeo and Juliet have a date at a given time, and each, independently, will be late by an amount of time that is exponentially distributed with parameter $\lambda$. What is the PDF of the difference between their times of arrival?

Let us denote by $X$ and $Y$ the amounts by which Romeo and Juliet are late, respectively. We want to find the PDF of $Z=X-Y$, assuming that $X$ and $Y$ are independent and exponentially distributed with parameter $\lambda$. We will first calculate the CDF $F_{Z}(z)$ by considering separately the cases $z\ge 0$ and $z<0$.

For $z\ge 0$, we have

$$\begin{aligned}F_{Z}(z)&=P(X-Y\le z)\\&=1-P(X-Y>z)\\&=1-\int_{0}^{\infty}\left(\int_{z+y}^{\infty}f_{X,Y}(x,y)\,dx\right)dy\\&=1-\int_{0}^{\infty}\lambda e^{-\lambda y}\left(\int_{z+y}^{\infty}\lambda e^{-\lambda x}\,dx\right)dy\\&=1-\int_{0}^{\infty}\lambda e^{-\lambda y}e^{-\lambda(z+y)}\,dy\\&=1-e^{-\lambda z}\int_{0}^{\infty}\lambda e^{-2\lambda y}\,dy\\&=1-\frac{1}{2}e^{-\lambda z}.\end{aligned}$$

@page 149

@figure 26

Figure 3.26: The calculation of the CDF of $Z=X-Y$ in Example 3.29. To obtain the value $P(X-Y>z)$ we must integrate the joint PDF $f_{X,Y}(x,y)$ over the shaded area in the above figures, which correspond to $z\ge 0$ (left side) and $z<0$ (right side).

For the case $z<0$, we can use a similar calculation, but we can also argue using symmetry. Indeed, the symmetry of the situation implies that the random variables $Z=X-Y$ and $-Z=Y-X$ have the same distribution. We have

$$F_{Z}(z)=P(Z\le z)=P(-Z\ge-z)=P(Z\ge-z)=1-F_{Z}(-z).$$

With $z<0$, we have $-z\ge 0$ and using the formula derived earlier,

$$F_{Z}(z)=1-F_{Z}(-z)=1-\left(1-\frac{1}{2}e^{-\lambda(-z)}\right)=\frac{1}{2}e^{\lambda z}.$$

Combining the two cases $z\ge 0$ and $z<0$, we obtain

$$F_{Z}(z)=\begin{cases}1-\dfrac{1}{2}e^{-\lambda z}&\text{if }z\ge 0,\\\dfrac{1}{2}e^{\lambda z}&\text{if }z<0,\end{cases}$$

We now calculate the PDF of $Z$ by differentiating its CDF. We obtain

$$f_{Z}(z)=\begin{cases}\dfrac{\lambda}{2}e^{-\lambda z}&\text{if }z\ge 0,\\\dfrac{\lambda}{2}e^{\lambda z}&\text{if }z<0,\end{cases}$$

or

$$f_{Z}(z)=\frac{\lambda}{2}e^{-\lambda|z|}.$$

This is known as a two-sided exponential PDF, also known as the Laplace PDF.

@summary The same CDF-then-differentiate procedure handles functions of two random variables: express the event in the plane, integrate the joint PDF over it, then differentiate. A maximum, a ratio, and a difference of independent variables are all obtained this way.

@@ summary-and-discussion | 3.7 | Summary and Discussion | section | 150-150
Continuous random variables are characterized by PDFs and arise in many applications. PDFs are used to calculate event probabilities. This is similar to the use of PMFs for the discrete case, except that now we need to integrate instead of adding. Joint PDFs are similar to joint PMFs and are used to determine the probability of events that are defined in terms of multiple random variables. Finally, conditional PDFs are similar to conditional PMFs and are used to calculate conditional probabilities, given the value of the conditioning random variable.

We have also introduced a few important continuous probability laws and derived their mean and variance. A summary is provided in the table that follows.

> Summary of Results for Special Random Variables

Continuous Uniform Over $[a,b]$:

$$f_{X}(x)=\begin{cases}\dfrac{1}{b-a}&\text{if }a\le x\le b,\\0&\text{otherwise,}\end{cases}$$

$$E[X]=\frac{a+b}{2},\qquad \operatorname{var}(X)=\frac{(b-a)^{2}}{12}.$$

Exponential with Parameter $\lambda$:

$$f_{X}(x)=\begin{cases}\lambda e^{-\lambda x}&\text{if }x\ge 0,\\0&\text{otherwise,}\end{cases}\qquad F_{X}(x)=\begin{cases}1-e^{-\lambda x}&\text{if }x\ge 0,\\0&\text{otherwise,}\end{cases}$$

$$E[X]=\frac{1}{\lambda},\qquad \operatorname{var}(X)=\frac{1}{\lambda^{2}}.$$

Normal with Parameters $\mu$ and $\sigma^{2}$:

$$f_{X}(x)=\frac{1}{\sqrt{2\pi}\,\sigma}e^{-(x-\mu)^{2}/2\sigma^{2}},$$

$$E[X]=\mu,\qquad \operatorname{var}(X)=\sigma^{2}.$$

@endcard

@summary Continuous random variables replace sums by integrals throughout: PDFs give event probabilities, joint PDFs handle several variables, and conditional PDFs handle conditioning. The uniform, exponential, and normal laws and their means and variances are collected here.
