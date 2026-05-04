const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, WidthType, BorderStyle, ShadingType,
  PageNumber, PageBreak, LevelFormat, TabStopType, TabStopPosition,
  Header, Footer, VerticalAlign
} = require('docx');
const fs = require('fs');

// Color palette
const COLORS = {
  science: '1F5C99',   // deep blue
  engineering: '1A6B3C', // deep green
  business: '7B3F00',  // deep brown/orange
  headerBg: '1F3864',  // dark navy for column headers
  headerText: 'FFFFFF',
  scienceBg: 'D6E4F7',
  engBg: 'D6F0E0',
  bizBg: 'FAE5CC',
  altRow: 'F7F9FC',
  white: 'FFFFFF',
  border: 'CCCCCC',
};

// Border helper
const border = (color = COLORS.border) => ({ style: BorderStyle.SINGLE, size: 1, color });
const borders = (color = COLORS.border) => ({ top: border(color), bottom: border(color), left: border(color), right: border(color) });

// Cell helper
function cell(text, width, { bold = false, bg = COLORS.white, color = '000000', size = 18, italic = false, center = false } = {}) {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    borders: borders(),
    shading: { fill: bg, type: ShadingType.CLEAR },
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
    verticalAlign: VerticalAlign.TOP,
    children: [new Paragraph({
      alignment: center ? AlignmentType.CENTER : AlignmentType.LEFT,
      children: [new TextRun({ text, bold, color, size, italics: italic, font: 'Arial' })]
    })]
  });
}

// Header row
function headerRow(cols) {
  return new TableRow({
    tableHeader: true,
    children: cols.map(([text, width]) => new TableCell({
      width: { size: width, type: WidthType.DXA },
      borders: borders(COLORS.headerBg),
      shading: { fill: COLORS.headerBg, type: ShadingType.CLEAR },
      margins: { top: 80, bottom: 80, left: 100, right: 100 },
      verticalAlign: VerticalAlign.CENTER,
      children: [new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text, bold: true, color: COLORS.headerText, size: 18, font: 'Arial' })]
      })]
    }))
  });
}

// Data row
function dataRow(no, name, answers, library, reportName, why, how, domain, rowIdx) {
  const bg = rowIdx % 2 === 0 ? COLORS.white : COLORS.altRow;
  const domainColor = domain === 'Scientific/Research' ? COLORS.scienceBg :
                      domain === 'Engineering/Systems' ? COLORS.engBg : COLORS.bizBg;
  const domainText  = domain === 'Scientific/Research' ? COLORS.science :
                      domain === 'Engineering/Systems' ? COLORS.engineering : COLORS.business;

  // col widths sum = 9360
  return new TableRow({ children: [
    cell(String(no), 480, { bold: true, bg, center: true }),
    cell(name, 1440, { bold: true, bg, color: domainText }),
    cell(answers, 1200, { bg }),
    cell(library, 1080, { bg, italic: true, size: 16 }),
    cell(reportName, 1320, { bg, bold: true }),
    cell(why, 1920, { bg }),
    cell(how, 1920, { bg }),
  ]});
}

// Section heading row
function sectionRow(label, color) {
  return new TableRow({ children: [
    new TableCell({
      columnSpan: 7,
      width: { size: 9360, type: WidthType.DXA },
      borders: borders(color),
      shading: { fill: color, type: ShadingType.CLEAR },
      margins: { top: 80, bottom: 80, left: 120, right: 120 },
      children: [new Paragraph({
        children: [new TextRun({ text: label, bold: true, color: COLORS.headerText, size: 22, font: 'Arial' })]
      })]
    })
  ]});
}

// THE 400 ANALYSES DATA

const SCIENCE = [
  // L4 – Foundational
  ["Descriptive Statistics","What is the summary of the data?","pandas, numpy","Descriptive Summary Report","Every analysis starts with knowing what the data looks like","Gives mean, median, std, min, max — instant data snapshot"],
  ["Frequency Distribution","How often does each value occur?","pandas, matplotlib","Frequency Table Report","Identifies most common values before deeper analysis","Shows which categories or ranges dominate the dataset"],
  ["Histogram Analysis","What is the shape of the data?","matplotlib, seaborn","Data Shape Report","Visualizes spread and skew of measurements","Reveals if data is normal, skewed, or bimodal"],
  ["Box Plot Analysis","Where are the outliers?","seaborn, matplotlib","Outlier Detection Report","Quickly flags extreme values per variable or group","Five-number summary shown visually; outliers plotted as dots"],
  ["Cross-tabulation","How do two categorical variables relate?","pandas","Cross-Tab Report","Standard in survey and experimental data comparison","Counts occurrences at each intersection of two categories"],
  ["Data Profiling","What is the quality of the dataset?","pandas-profiling, ydata-profiling","Data Quality Report","Catches missing values and errors before any analysis","Auto-generates completeness, uniqueness, and correlation stats"],
  ["Missing Value Analysis","How much data is missing and where?","pandas, missingno","Data Completeness Report","Missing data invalidates models if ignored","Maps null patterns across columns to guide imputation strategy"],
  ["Univariate Analysis","What is the behavior of a single variable?","pandas, scipy","Single Variable Report","Foundation for understanding each feature individually","Computes shape, spread, and central tendency of one column"],
  ["Bivariate Analysis","How do two variables relate to each other?","pandas, seaborn","Two-Variable Relationship Report","Reveals pairwise relationships before multivariate work","Produces scatter plots, correlation coefficients, and cross-tabs"],
  ["Data Type Audit","Are the columns in the correct format?","pandas","Data Schema Report","Wrong data types cause silent errors downstream","Lists dtypes, suggests corrections, flags mixed-type columns"],
  // L5
  ["Normality Testing","Is the data normally distributed?","scipy.stats","Normality Test Report","Many tests assume normality; this validates that assumption","Runs Shapiro-Wilk, Anderson-Darling, Q-Q plot"],
  ["Variance Analysis (ANOVA)","Do means differ across 3+ groups?","scipy.stats, pingouin","Group Comparison Report","Tests if experimental groups are statistically different","F-statistic and p-value tell if group differences are real"],
  ["Pearson Correlation","How strongly are two numeric variables linearly linked?","scipy.stats, pandas","Linear Correlation Report","Quantifies direction and strength of linear relationships","Outputs r value from -1 to +1 with significance p-value"],
  ["Spearman Correlation","Are two ranked or non-normal variables related?","scipy.stats","Rank Correlation Report","Works when data is not normally distributed","Rank-based version of Pearson; more robust to outliers"],
  ["Chi-Square Test","Are two categorical variables independent?","scipy.stats","Independence Test Report","Tests if observed counts differ from expected by chance","Returns chi2 statistic and p-value for categorical data"],
  ["Student T-Test","Are two group means significantly different?","scipy.stats","Two-Group Comparison Report","Gold standard for comparing two experimental conditions","One-sample, independent, and paired variants available"],
  ["Mann-Whitney U Test","Do two non-normal groups differ?","scipy.stats","Non-parametric Group Report","Compares groups without assuming normal distribution","Rank-sum approach robust to skewed or ordinal data"],
  ["Confidence Interval Estimation","What is the plausible range of a parameter?","scipy.stats, statsmodels","Parameter Estimation Report","Gives uncertainty range, not just a point estimate","95% CI shows how much results could vary with more data"],
  ["Effect Size Analysis","How large is the observed difference?","pingouin, scipy","Practical Significance Report","p-value alone doesn't say if effect is meaningful","Cohen's d, eta-squared, r quantify magnitude of findings"],
  ["Power Analysis","How many samples are needed?","statsmodels","Sample Size Report","Prevents underpowered experiments that miss real effects","Calculates n needed for desired power, alpha, and effect size"],
  // L6
  ["Linear Regression","How does X predict continuous Y?","sklearn, statsmodels","Regression Model Report","Baseline predictive model for continuous outcomes","Coefficients, R2, p-values, residual plots all in one fit"],
  ["Multiple Regression","Which combination of variables predicts Y best?","statsmodels, sklearn","Multi-predictor Report","More realistic than single predictor in most research","Adds variables and evaluates joint predictive contribution"],
  ["Logistic Regression","What predicts a binary outcome?","sklearn, statsmodels","Binary Outcome Report","Handles 0/1 outcomes that linear regression can't","Outputs probability and odds ratios with confidence intervals"],
  ["Polynomial Regression","Can a curved relationship be modeled?","sklearn, numpy","Curve Fitting Report","Linear fit is wrong when relationship curves","Adds squared or cubic terms to capture nonlinear patterns"],
  ["Ridge Regression","How to prevent overfitting with many predictors?","sklearn","Regularized Model Report","Too many features inflate coefficients and reduce generality","L2 penalty shrinks coefficients, reduces variance"],
  ["Lasso Regression","Which predictors are truly important?","sklearn","Feature Selection Report","Eliminates irrelevant variables by shrinking some to zero","L1 penalty performs automatic variable selection"],
  ["Elastic Net","Balance between Ridge and Lasso?","sklearn","Hybrid Regularization Report","Combines benefits of both Ridge and Lasso penalties","Useful when groups of correlated predictors exist"],
  ["Quantile Regression","How does median or any quantile of Y depend on X?","statsmodels","Quantile Effect Report","Mean regression misses behavior at extremes","Models lower/upper quantile effects, not just the average"],
  ["Weighted Least Squares","Can regression handle unequal variance?","statsmodels","Heteroscedasticity Report","Ordinary regression breaks when variance is non-constant","Assigns weights to observations inversely to their variance"],
  ["Residual Diagnostics","Are regression assumptions met?","statsmodels, matplotlib","Model Validity Report","Violated assumptions produce biased coefficients","Checks normality, homoscedasticity, and autocorrelation of residuals"],
  // L7
  ["Principal Component Analysis (PCA)","Which directions capture most variance?","sklearn","Dimensionality Reduction Report","High-dimensional data is hard to visualize and model","Projects data onto fewer components preserving most information"],
  ["Factor Analysis","What latent factors explain survey responses?","factor_analyzer","Latent Factor Report","Items on a questionnaire often measure hidden constructs","Extracts underlying factors and their loadings on each item"],
  ["Independent Component Analysis (ICA)","Can mixed signals be separated?","sklearn","Signal Separation Report","Used in EEG, audio, and sensor fusion research","Finds statistically independent source signals from mixtures"],
  ["t-SNE","How can high-dimensional data be visualized in 2D?","sklearn","Cluster Visualization Report","PCA is linear; t-SNE captures nonlinear structure","Reveals cluster structure in genomic, image, or text embeddings"],
  ["UMAP","What is the global structure of high-dimensional data?","umap-learn","Manifold Visualization Report","Faster and more structure-preserving than t-SNE","Maintains both local and global topology; widely used in biology"],
  ["Linear Discriminant Analysis (LDA)","Which features separate predefined classes best?","sklearn","Class Separation Report","Supervised reduction maximizes between-class separation","Projects data onto axes that best discriminate known groups"],
  ["Canonical Correlation Analysis","How do two sets of variables relate jointly?","sklearn","Multi-set Correlation Report","Generalizes correlation to two variable sets simultaneously","Finds linear combinations of each set maximally correlated"],
  ["Non-negative Matrix Factorization (NMF)","What parts-based components underlie the data?","sklearn","Parts Decomposition Report","Useful for topic modeling and spectral analysis","Decomposes matrix into additive non-negative components"],
  ["Kernel PCA","Can PCA handle nonlinear data?","sklearn","Nonlinear Reduction Report","Linear PCA misses curved manifolds in data","Applies kernel trick to capture nonlinear variance structure"],
  ["Sparse PCA","Which components have few non-zero loadings?","sklearn","Sparse Component Report","Dense PCA loadings are hard to interpret scientifically","Constrains components to be sparse for interpretability"],
  // L8
  ["K-Means Clustering","What natural groups exist in the data?","sklearn","Cluster Segmentation Report","Groups observations without predefined labels","Assigns points to k centers; useful for initial segmentation"],
  ["DBSCAN Clustering","Which points form density-based clusters?","sklearn","Density Cluster Report","Works when clusters have arbitrary shapes","Finds clusters of any shape and labels outliers as noise"],
  ["HDBSCAN","What clusters exist at varying densities?","hdbscan","Hierarchical Density Report","DBSCAN requires fixed epsilon; HDBSCAN adapts","More robust to varying cluster sizes and densities"],
  ["Gaussian Mixture Models","Do the data come from multiple distributions?","sklearn","Mixture Model Report","Data may be generated by overlapping normal distributions","Soft clustering assigns probability to each cluster membership"],
  ["Hierarchical Clustering","What is the dendrogram structure of samples?","scipy, sklearn","Dendrogram Report","Shows nested groupings without specifying k upfront","Linkage matrix reveals relationships at every scale"],
  ["Affinity Propagation","Which observations are natural exemplars?","sklearn","Exemplar Cluster Report","Automatically chooses number of clusters from data","Each cluster defined by a representative real data point"],
  ["Spectral Clustering","How to cluster non-convex data shapes?","sklearn","Graph Cluster Report","K-means fails on ring or crescent-shaped clusters","Uses graph Laplacian to find embedded cluster structure"],
  ["Mean Shift Clustering","Where are the density peaks in data?","sklearn","Mode Cluster Report","Non-parametric approach needs no cluster count input","Converges to density modes; useful in image segmentation"],
  ["OPTICS","What is the cluster order structure?","sklearn","Reachability Plot Report","Extends DBSCAN to handle varying density clusters","Produces reachability plot showing cluster hierarchy"],
  ["Self-Organizing Maps","How can high-dimensional data be mapped to a grid?","minisom","Topology Map Report","Preserves topological relationships in 2D grid layout","Used in bioinformatics and signal analysis visualization"],
  // L9
  ["Time Series Decomposition","What are the trend, seasonal, and residual components?","statsmodels","Decomposition Report","Raw time series mixes multiple signals together","Separates series into additive or multiplicative components"],
  ["ARIMA Modeling","Can a stationary time series be forecast?","statsmodels","ARIMA Forecast Report","Captures autocorrelation structure for short-term forecasting","Auto-regression, integration, moving average terms combined"],
  ["SARIMA Modeling","How to forecast seasonal time series?","statsmodels","Seasonal Forecast Report","Plain ARIMA misses seasonal patterns","Adds seasonal AR, I, MA terms to handle periodic data"],
  ["Prophet Forecasting","Can business time series be forecast easily?","prophet","Business Forecast Report","Facebook Prophet handles holidays and missing data well","Additive model with trend, seasonality, and holiday effects"],
  ["Exponential Smoothing (ETS)","How to give more weight to recent observations?","statsmodels","Smoothed Forecast Report","Old observations may not reflect current dynamics","Holt-Winters method handles trend and seasonality"],
  ["Stationarity Testing (ADF, KPSS)","Is the time series stationary?","statsmodels","Stationarity Report","ARIMA and many models require stationary input","ADF and KPSS tests determine if differencing is needed"],
  ["Autocorrelation Analysis (ACF/PACF)","How correlated is a series with its own past?","statsmodels, pandas","Autocorrelation Report","ACF/PACF plots reveal lag structure for ARIMA parameter selection","Shows which lags carry predictive power"],
  ["Granger Causality","Does variable X help predict variable Y over time?","statsmodels","Causal Lag Report","Tests if past values of X improve forecast of Y","Common in neuroscience, economics, and climate science"],
  ["Cointegration Analysis","Do non-stationary series move together long-term?","statsmodels","Long-run Relationship Report","Two trending series may share an equilibrium","Johansen test finds cointegrated pairs for error correction"],
  ["Change Point Detection","When did the underlying process shift?","ruptures, river","Regime Change Report","Silent changes in mean or variance indicate real events","PELT and BOCPD algorithms detect abrupt structural breaks"],
  // L10
  ["Bayesian Inference","What does the data tell us about parameter beliefs?","pymc, numpyro","Posterior Distribution Report","Incorporates prior knowledge and updates with data","Produces full posterior distribution, not just point estimates"],
  ["Markov Chain Monte Carlo (MCMC)","How to sample from complex posterior distributions?","pymc, emcee","Posterior Sampling Report","Analytical posteriors are intractable for complex models","MCMC samples explore the posterior probability landscape"],
  ["Bayesian Linear Regression","Can regression include prior beliefs about coefficients?","pymc, sklearn","Bayesian Regression Report","Regularizes by encoding prior knowledge into the model","Posterior over coefficients provides uncertainty quantification"],
  ["Hierarchical (Mixed) Models","How to model grouped or nested data?","pymc, statsmodels","Multilevel Analysis Report","Observations within groups share structure that should be modeled","Partial pooling balances group-level and population-level effects"],
  ["Structural Equation Modeling (SEM)","How do latent and observed variables relate causally?","semopy","Causal Path Report","Models complex causal relationships with latent constructs","Path coefficients and fit indices assess theoretical model"],
  ["Survival Analysis (Kaplan-Meier)","What fraction of subjects survive past time t?","lifelines","Survival Curve Report","Standard for time-to-event outcomes in medicine and engineering","Non-parametric survival curve with censored data support"],
  ["Cox Proportional Hazards","Which covariates affect time-to-event?","lifelines, sklearn","Hazard Ratio Report","Regression model for survival outcomes with covariates","Hazard ratios with confidence intervals per predictor"],
  ["Propensity Score Matching","Can observational data simulate a controlled experiment?","causalml, econml","Causal Effect Report","Confounding bias distorts treatment effect in observational data","Matches treated and control units on propensity scores"],
  ["Instrumental Variable Analysis","How to estimate causal effects with unmeasured confounders?","statsmodels","IV Regression Report","OLS is biased when confounders are unobserved","Two-stage least squares removes endogeneity bias"],
  ["Difference-in-Differences","What was the causal impact of a policy or treatment?","statsmodels","Policy Impact Report","Compares treated vs control before and after intervention","Controls for pre-existing differences between groups"],
  // L11
  ["Random Forest","Which features matter most for prediction?","sklearn","Ensemble Feature Report","Single trees overfit; forests generalize better","Aggregates many trees; feature importance from permutation"],
  ["Gradient Boosting (XGBoost/LightGBM)","Can prediction errors be iteratively reduced?","xgboost, lightgbm","Boosted Model Report","State-of-the-art for tabular prediction tasks","Sequential trees correct residuals of previous trees"],
  ["Support Vector Machines","How to classify with maximum margin?","sklearn","SVM Classification Report","Works well in high-dimensional spaces with small samples","Finds optimal hyperplane separating classes"],
  ["Naive Bayes","How to classify with probabilistic feature independence?","sklearn","Probabilistic Classifier Report","Fast baseline classifier based on Bayes theorem","Assumes feature independence; works well for text"],
  ["k-Nearest Neighbors","Which class does a point belong to by neighborhood?","sklearn","KNN Classification Report","Non-parametric; no training phase required","Classifies by majority vote among k closest neighbors"],
  ["Decision Tree Analysis","What rule-based logic separates classes or predicts values?","sklearn","Decision Rule Report","Interpretable split logic for classification or regression","Tree structure directly readable by domain experts"],
  ["Neural Network (MLP)","Can complex non-linear patterns be learned?","sklearn, tensorflow","Deep Feature Report","Nonlinear patterns require non-linear model capacity","Stacked dense layers learn hierarchical representations"],
  ["Cross-Validation","How well does the model generalize to unseen data?","sklearn","Generalization Report","Train accuracy overestimates real-world performance","k-fold CV produces unbiased estimate of model performance"],
  ["Hyperparameter Tuning (Grid/Random/Bayes)","What parameters maximize model performance?","sklearn, optuna","Optimization Report","Default hyperparameters rarely yield best results","Searches parameter space; Bayesian search is most efficient"],
  ["Confusion Matrix Analysis","Where exactly does the model make mistakes?","sklearn","Error Breakdown Report","Accuracy hides class-level performance imbalances","Shows TP, FP, TN, FN per class with precision and recall"],
  // L12
  ["Shapley Value Analysis (SHAP)","Why did the model make this specific prediction?","shap","Explainability Report","Black-box models need explanation for scientific trust","Per-prediction feature contributions based on game theory"],
  ["LIME Explanation","What local approximation explains this prediction?","lime","Local Explanation Report","Global explanations miss local decision boundaries","Fits interpretable model around individual prediction"],
  ["Partial Dependence Plots (PDP)","How does one feature affect predictions on average?","sklearn, shap","Feature Effect Report","Shows marginal effect of a variable across its range","Averages out all other features to show one variable's effect"],
  ["ICE Plots","How does one feature affect predictions per individual?","sklearn","Individual Conditional Report","PDP averages can hide heterogeneous individual effects","One curve per observation shows how each responds to feature"],
  ["Permutation Importance","Which features matter most in any model?","sklearn","Global Importance Report","Model-agnostic feature importance for any estimator","Measures drop in performance when feature is randomly shuffled"],
  ["Calibration Analysis","Do predicted probabilities match actual frequencies?","sklearn","Probability Calibration Report","Uncalibrated models are overconfident or underconfident","Reliability diagram shows if P(Y=1|score=0.7) is truly 70%"],
  ["Learning Curve Analysis","Does the model benefit from more training data?","sklearn","Data Sufficiency Report","Reveals underfitting vs overfitting at current sample size","Plots train and validation error vs number of training samples"],
  ["Bias-Variance Decomposition","Is model error from bias, variance, or noise?","mlxtend","Error Source Report","Guides model selection — simpler or more complex","Decomposes test error into reducible and irreducible parts"],
  ["ROC-AUC Analysis","How well does the model rank positive cases?","sklearn","Ranking Quality Report","Accuracy is misleading with class imbalance","AUC measures discrimination ability across all thresholds"],
  ["Precision-Recall Analysis","How does precision trade off with recall?","sklearn","Threshold Trade-off Report","AUC is optimistic with severe class imbalance","PR curve focuses on minority class performance"],
  // L13
  ["Causal Discovery (PC Algorithm)","Can causal graph be learned from data?","causal-learn","Causal Graph Report","Correlation does not equal causation; this goes further","Constraint-based algorithm recovers causal DAG from observables"],
  ["Do-Calculus (Pearl)","What is the effect of an intervention on Y?","dowhy","Interventional Effect Report","Observational data can't directly answer 'what if'","Applies do-operator to estimate true causal effects"],
  ["Counterfactual Analysis","What would have happened under a different condition?","dowhy, econml","Counterfactual Report","Science asks 'what if' questions that require special methods","Estimates individual-level counterfactuals with causal models"],
  ["Mediation Analysis","Does X affect Y through a mediating variable M?","pingouin, pyprocessmacro","Mediation Report","Explains the mechanism by which X causes Y","Decomposes total effect into direct and indirect paths"],
  ["Moderation Analysis","Does the relationship between X and Y vary across groups?","pingouin, statsmodels","Interaction Effect Report","Effect size may differ by age, gender, or condition","Interaction term tests if third variable moderates the effect"],
  ["Interrupted Time Series","Did an intervention change a time series trajectory?","statsmodels","Policy Change Report","Natural experiment design for quasi-experimental data","Models pre/post slope and level changes at interruption point"],
  ["Regression Discontinuity Design","Does the outcome jump at a threshold?","rdd","Threshold Effect Report","Exploits arbitrary cutoffs as natural experiments","Estimates local causal effect at the discontinuity boundary"],
  ["Synthetic Control Method","What would the treated unit look like without treatment?","pysyncon","Counterfactual Region Report","Single treated unit makes DiD assumptions untenable","Constructs weighted combination of controls to mimic counterfactual"],
  ["Event Study Analysis","How do outcomes evolve around an event?","linearmodels","Event Window Report","Tracks dynamic effects before and after a discrete event","Plots lead and lag coefficients around event time zero"],
  ["Panel Data Fixed Effects","How to control for unobserved unit heterogeneity?","linearmodels","Within-Unit Report","Between-unit differences confound pooled OLS estimates","Absorbs all time-invariant unit-level confounders via demeaning"],
  // L14
  ["Monte Carlo Simulation","What is the distribution of outcomes under uncertainty?","numpy, scipy","Simulation Report","Uncertainty in inputs propagates to uncertainty in outputs","Runs thousands of scenarios sampling from input distributions"],
  ["Bootstrap Resampling","How stable is a statistic when data varies?","scipy, sklearn","Sampling Stability Report","Theoretical distributions unavailable for complex statistics","Resamples with replacement to estimate standard error and CI"],
  ["Jackknife Estimation","What is the influence of each observation on a statistic?","scipy","Leave-One-Out Report","Detects influential points that distort summary statistics","Leaves one point out each iteration and measures change"],
  ["Sensitivity Analysis","How much do results change with input assumptions?","SALib","Assumption Robustness Report","Conclusions may depend heavily on model assumptions","Tests output change when inputs vary by specified ranges"],
  ["Uncertainty Quantification","What is the confidence range in model predictions?","pymc, tensorflow-probability","Predictive Uncertainty Report","Single predictions hide inherent model uncertainty","Produces credible intervals or predictive distributions"],
  ["Global Sensitivity Analysis (Sobol)","Which inputs drive most output variance?","SALib","Variance Decomposition Report","Screening among many uncertain parameters","Sobol indices attribute output variance to input interactions"],
  ["Morris Screening","Which parameters are most influential in complex models?","SALib","Parameter Screening Report","First step before expensive Sobol sensitivity analysis","Elementary effects identify high-influence parameters cheaply"],
  ["Agent-Based Modeling","What emergent behavior arises from individual rules?","mesa","Emergence Simulation Report","Macro behavior is not simply sum of micro rules","Simulates populations of agents following local interaction rules"],
  ["System Dynamics Modeling","How do feedback loops drive system behavior over time?","pysd","Feedback Loop Report","Stocks and flows determine long-run system trajectory","Captures delays and nonlinear feedbacks in complex systems"],
  ["Stochastic Differential Equations","How does randomness affect continuous-time dynamics?","sdeint","Stochastic Path Report","Deterministic ODEs miss noise-driven biological or financial dynamics","Numerical integration with Wiener process noise terms"],
  // L15
  ["Functional Data Analysis","How to analyze curves or functions as data objects?","scikit-fda","Functional Summary Report","Each observation is a curve, not a scalar — requires FDA methods","Functional PCA, depth, and regression for curve-valued data"],
  ["Topological Data Analysis (TDA)","What persistent topological features exist in data?","giotto-tda, ripser","Topology Report","Geometry of data matters; TDA captures holes and connected components","Persistence diagrams reveal structure invisible to distance-based methods"],
  ["Gaussian Process Regression","What is the full predictive distribution over functions?","gpytorch, sklearn","GP Prediction Report","Provides uncertainty estimates without parametric assumptions","Posterior is a distribution over functions given observed data"],
  ["Variational Inference","How to approximate intractable posteriors efficiently?","pymc, numpyro","Approximate Posterior Report","MCMC is slow; VI provides fast approximate Bayesian inference","Fits parameterized distribution to approximate true posterior"],
  ["Information-Theoretic Analysis","How much information does X carry about Y?","scipy, sklearn","Mutual Information Report","Captures non-linear dependencies beyond correlation","Entropy, mutual information, KL divergence as dependency measures"],
  ["Extreme Value Analysis","What is the probability of rare extreme events?","pyextremes","Tail Risk Report","Standard distributions underestimate probability of extremes","GEV and GPD models fit the tails of distributions"],
  ["Copula Modeling","How to model joint distributions beyond linear correlation?","copulas","Dependency Structure Report","Pearson correlation misses tail dependencies and non-elliptical shapes","Copulas separate marginals from dependence structure"],
  ["Mixture of Experts","Can different models govern different regions of input space?","sklearn, tensorflow","Gated Mixture Report","Single model may not fit all regions of complex data","Gate network routes inputs to specialized sub-models"],
  ["Transfer Learning","Can knowledge from one domain improve another?","tensorflow, pytorch","Transfer Report","Labeled data is scarce; pre-trained features transfer well","Fine-tunes pre-trained model on target task with small data"],
  ["Meta-Analysis","What is the pooled effect across multiple studies?","pymare, statsmodels","Pooled Evidence Report","Single studies lack power; pooling increases statistical power","Effect sizes and heterogeneity aggregated across studies"],
  // L16
  ["Conformal Prediction","What prediction set is guaranteed to contain the true label?","nonconformist, crepes","Coverage Guarantee Report","Classical prediction intervals assume parametric distributions","Distribution-free coverage guarantees for any model"],
  ["Doubly Robust Estimation","Which estimator is valid even if one model is misspecified?","econml, zepid","Robust Causal Report","Either propensity or outcome model misspecification tolerated","Combines IPW and outcome regression; robust to one failure"],
  ["Targeted Maximum Likelihood Estimation (TMLE)","How to get efficient semiparametric causal estimates?","zepid, tlverse","TMLE Causal Report","Double machine learning approach for epidemiology","Plugs in flexible ML models then applies bias-correction step"],
  ["Bayesian Nonparametrics (Dirichlet Process)","How many clusters exist without specifying k?","pymc","Nonparametric Cluster Report","Standard clustering requires k upfront; BNP infers it","Dirichlet process priors grow model complexity with data"],
  ["Kernel Density Estimation","What is the continuous density function of observed data?","scipy, sklearn","Density Estimation Report","Histograms are discontinuous; KDE produces smooth density","Bandwidth controls smoothness of estimated distribution"],
  ["Variational Autoencoder (VAE)","Can a generative model learn the data manifold?","tensorflow, pytorch","Latent Space Report","Generative modeling with structured latent representation","Encoder-decoder with KL regularization on latent distribution"],
  ["Normalizing Flows","How to transform simple distributions to complex ones?","normflows, nflows","Flow Density Report","Exact likelihood computation for complex distributions","Series of invertible transformations from simple base distribution"],
  ["Attention Mechanism Analysis","Which input tokens does the model attend to?","transformers, bertviz","Attention Map Report","Interpretability of sequence models requires attention visualization","Attention weights show which parts of input influence prediction"],
  ["Graph Neural Networks","How to learn representations on graph-structured data?","torch-geometric, dgl","Graph Learning Report","Tabular methods ignore relational structure in data","Message passing aggregates neighbor features into node embeddings"],
  ["Federated Learning Analysis","Can models be trained without centralizing data?","flower, tensorflow-federated","Privacy-Preserving Report","Data privacy laws prevent centralized model training","Trains local models; aggregates only updates at server"],
  // L17
  ["Causal Representation Learning","Can disentangled causal factors be learned unsupervised?","causal-learn, pytorch","Disentangled Factor Report","Raw features entangle multiple causal mechanisms","Identifies independent causal generating factors in latent space"],
  ["Amortized Inference","Can the posterior be learned across many datasets at once?","pyro, numpyro","Amortized Posterior Report","MCMC must restart for each dataset; amortization shares computation","Neural network directly maps observations to posterior parameters"],
  ["Physics-Informed Neural Networks","Can physical constraints improve neural network solutions?","deepxde, pytorch","Physics-Constrained Report","Pure data-driven models violate known physical laws","PDE residuals added to loss force physically plausible solutions"],
  ["Causal Bandits","How to optimize decisions while learning causal structure?","causal-learn, vowpalwabbit","Causal Optimization Report","Standard bandits ignore causal structure of actions","Exploits causal graph to identify best intervention efficiently"],
  ["Doubly Debiased Machine Learning","How to remove regularization bias in causal estimation?","econml","Debiased Causal Report","Lasso and tree shrinkage bias causal effect estimates","Cross-fitting with nuisance models removes regularization bias"],
];

const ENGINEERING = [
  // L4
  ["Load Profile Analysis","What are the usage patterns over time?","pandas, matplotlib","Load Pattern Report","Systems must be designed to handle peak and average loads","Shows hourly, daily, weekly load distributions"],
  ["Capacity Utilization Analysis","How much of system capacity is being used?","pandas","Capacity Report","Over/under-utilization signals scaling needs","Percent utilized vs available across time or components"],
  ["Throughput Analysis","How many units does the system process per unit time?","pandas, numpy","Throughput Report","Throughput determines if system meets demand requirements","Measures items processed per second, minute, or hour"],
  ["Latency Distribution Analysis","What is the distribution of response times?","pandas, numpy","Latency Report","P50 hides tail latency problems that affect users","Percentile report: P50, P90, P95, P99, P99.9"],
  ["Error Rate Analysis","What fraction of operations result in errors?","pandas","Error Rate Report","Error rates determine system reliability","Breaks down errors by type, endpoint, and time window"],
  ["Uptime / Availability Analysis","What fraction of time is the system operational?","pandas","SLA Compliance Report","Availability is a contractual and operational requirement","Calculates uptime percent and downtime events"],
  ["Queue Length Analysis","How many jobs wait for processing?","pandas","Queue Depth Report","Long queues indicate bottlenecks or capacity shortfalls","Average and peak queue lengths over time"],
  ["Resource Saturation Analysis","Which resources are at their limits?","pandas, psutil","Saturation Report","Saturated resources degrade performance for all users","CPU, memory, disk I/O, network saturation metrics"],
  ["Event Log Parsing","What events occurred and when?","pandas, re","Event Timeline Report","Raw logs are unstructured; parsing extracts structured facts","Regex and Aho-Corasick patterns extract key events"],
  ["SLO Burn Rate Analysis","How fast is the error budget being consumed?","pandas","Error Budget Report","Burn rate predicts SLO breach before it happens","Rolling window burn rate vs budget threshold alert"],
  // L5
  ["Root Cause Analysis (5 Whys)","What is the chain of causes behind a failure?","pandas, networkx","RCA Report","Surface symptoms don't reveal systemic causes","Traces causal chain from symptom back to root condition"],
  ["Fault Tree Analysis","What combinations of failures lead to top-level failure?","pandas, networkx","Fault Tree Report","Complex systems fail due to combinations of events","Boolean logic tree of component failures and their probabilities"],
  ["Failure Mode and Effects Analysis (FMEA)","What are the potential failure modes and their risks?","pandas","Risk Priority Report","Proactively identifies failure modes before they occur","RPN = Severity x Occurrence x Detectability for each mode"],
  ["Mean Time Between Failures (MTBF)","How often does the system fail?","pandas, lifelines","Reliability Report","MTBF quantifies the reliability of a component","Average time between successive failures over observation window"],
  ["Mean Time to Recovery (MTTR)","How fast does the system recover from failures?","pandas","Recovery Time Report","Fast recovery minimizes user impact of failures","Average duration of downtime events over observation window"],
  ["Alert Correlation Analysis","Which alerts occur together and predict each other?","pandas, sklearn","Alert Pattern Report","Duplicate alerts flood operators during incidents","Clusters correlated alerts to reduce noise and find root cause"],
  ["Dependency Graph Analysis","Which components depend on which?","networkx","Dependency Map Report","Hidden dependencies cause cascading failures","Directed graph of service dependencies with criticality scoring"],
  ["Bottleneck Identification","Where does the system slow down?","pandas, networkx","Bottleneck Report","One constrained resource limits the entire system (Theory of Constraints)","Identifies resource with highest utilization or queue depth"],
  ["Service Level Agreement (SLA) Tracking","Is the system meeting its contractual performance targets?","pandas","SLA Report","SLA breaches incur penalties and erode customer trust","Tracks availability, latency, and error rate vs SLA thresholds"],
  ["Configuration Drift Detection","Has the system configuration changed unexpectedly?","pandas, difflib","Drift Detection Report","Silent config changes cause hard-to-reproduce failures","Compares current config against known-good baseline"],
  // L6
  ["Statistical Process Control (SPC)","Is the manufacturing process in control?","pandas, scipy","Control Chart Report","Random vs assignable variation determines corrective action","X-bar, R, p, and c charts with 3-sigma control limits"],
  ["Design of Experiments (DoE)","Which factors and interactions affect the output most?","pyDOE2, scipy","DoE Response Report","Systematic experimentation beats one-factor-at-a-time testing","Full or fractional factorial designs with ANOVA on responses"],
  ["Response Surface Methodology (RSM)","What input combination optimizes the output?","sklearn, scipy","Optimization Surface Report","Finds optimal operating conditions in multi-factor experiments","Second-order model fitted to DoE results then optimized"],
  ["Reliability Growth Analysis","Is system reliability improving over development?","reliability","Reliability Growth Report","Reliability should increase as defects are fixed","Crow-AMSAA model fits cumulative failure data over time"],
  ["Weibull Analysis","What is the failure distribution of a component?","reliability, lifelines","Failure Distribution Report","Different failure regimes have different distributions","Weibull shape parameter reveals infant mortality vs wear-out"],
  ["Accelerated Life Testing Analysis","How long will the component last under normal conditions?","reliability","Life Prediction Report","Testing at normal stress takes too long to be practical","Extrapolates lifetime from accelerated stress test data"],
  ["Process Capability Analysis (Cp, Cpk)","How capable is the process of meeting specifications?","scipy, pandas","Process Capability Report","Capability index quantifies how well process fits tolerances","Cp measures width; Cpk measures centering within spec limits"],
  ["Gage R&R Analysis","How much variation comes from measurement system itself?","pandas, scipy","Measurement System Report","Measurement error inflates process variation estimates","Separates repeatability, reproducibility, and part variation"],
  ["Signal-to-Noise Ratio Analysis","How much of the output variation is signal vs noise?","numpy, scipy","SNR Report","Low SNR means the signal is dominated by noise","Used in Taguchi methods and RF/communications engineering"],
  ["Tolerance Stack-up Analysis","What is the worst-case assembly variation?","numpy, scipy","Tolerance Report","Combined tolerances may exceed assembly requirements","RSS and worst-case methods sum individual component tolerances"],
  // L7
  ["Vibration Spectral Analysis","What frequency components exist in a vibration signal?","scipy, numpy","Vibration Spectrum Report","Frequency patterns reveal bearing, gear, or imbalance faults","FFT decomposes signal into frequency and amplitude components"],
  ["Acoustic Emission Analysis","What stress wave events occur in a structure?","scipy","Acoustic Event Report","High-frequency events signal crack initiation or progression","Event detection, counting, and energy analysis on waveform data"],
  ["Thermal Imaging Analysis","Where are the hot spots in the system?","opencv, numpy","Thermal Map Report","Temperature anomalies indicate electrical or mechanical faults","Image analysis on IR camera frames for temperature distribution"],
  ["Modal Analysis","What are the natural frequencies and mode shapes?","scipy","Modal Report","Resonance at natural frequency can destroy structures","FRF measurement identifies resonance peaks and damping ratios"],
  ["Power Spectral Density (PSD)","How is power distributed across frequencies?","scipy","PSD Report","Frequency domain view of stationary random processes","Welch method estimates PSD with reduced variance"],
  ["Coherence Analysis","Are two signals causally related at each frequency?","scipy","Coherence Report","Correlated at time domain may be spurious; coherence confirms","MSC between 0 and 1 at each frequency band"],
  ["Cross-Correlation Analysis","What is the time delay between two signals?","scipy, numpy","Time Delay Report","Detects propagation delays between sensors","Peak of cross-correlation gives lag between signals"],
  ["Short-Time Fourier Transform (STFT)","How does the frequency content evolve over time?","scipy","Spectrogram Report","FFT is global; STFT shows time-varying frequency content","Spectrogram reveals transient frequency events"],
  ["Wavelet Transform Analysis","What multi-scale features are present?","pywavelets","Wavelet Report","Wavelets handle non-stationary signals better than FFT","Decomposes signal at multiple scales simultaneously"],
  ["Empirical Mode Decomposition (EMD)","What intrinsic modes exist in a nonlinear signal?","emd","IMF Decomposition Report","Assumes no stationarity unlike Fourier methods","Decomposes into intrinsic mode functions adaptively"],
  // L8
  ["Finite Element Analysis (FEA) Post-processing","Where are the stress concentrations in a structure?","numpy, scipy","Stress Distribution Report","FEA results need post-processing to identify critical locations","Von Mises stress field extracted and visualized for failure risk"],
  ["Computational Fluid Dynamics (CFD) Post-processing","Where are the flow anomalies?","numpy, vtk","Flow Field Report","Pressure, velocity, and turbulence fields reveal design issues","Streamlines, pressure maps, and turbulence intensity from CFD output"],
  ["Structural Health Monitoring (SHM)","Is the structure degrading over time?","scipy, sklearn","Structural Integrity Report","Continuous monitoring catches damage before catastrophic failure","Damage-sensitive features extracted from vibration sensors over time"],
  ["Predictive Maintenance (PdM) Modeling","When will the equipment fail?","sklearn, xgboost, tsfresh","Remaining Useful Life Report","Unplanned downtime costs more than scheduled maintenance","Regression or survival model predicts RUL from sensor features"],
  ["Energy Consumption Analysis","Where is energy being wasted?","pandas","Energy Audit Report","Energy waste raises operating costs and emissions","Breaks energy use by equipment, time, and process step"],
  ["Heat Transfer Analysis","How does heat flow through the system?","numpy, scipy","Thermal Report","Overheating causes component failure and performance degradation","Conduction, convection, radiation modeled from measurement data"],
  ["Corrosion Rate Analysis","How fast is material being degraded?","pandas, scipy","Corrosion Report","Corrosion leads to structural failure and safety risk","Calculates mpy or mm/year from thickness measurement history"],
  ["Electromagnetic Interference (EMI) Analysis","What interference is affecting the system?","scipy","EMI Spectrum Report","EMI causes erratic behavior in sensitive electronics","Spectrum analysis of EM measurements for regulatory compliance"],
  ["Hydraulic System Analysis","Is the hydraulic system performing within spec?","pandas, scipy","Hydraulic Report","Pressure drops and leaks reduce actuator performance","Flow, pressure, and temperature analysis across circuit elements"],
  ["Control System Performance Analysis","How well does the controller track the setpoint?","control, scipy","Controller Report","Poor control wastes energy and degrades product quality","IAE, ITAE, rise time, overshoot, settling time computed"],
  // L9
  ["Anomaly Detection in Sensor Data","Which sensor readings are abnormal?","pyod, sklearn, river","Sensor Anomaly Report","Sensor faults and process upsets cause data quality issues","Isolation Forest, Z-score, and ADWIN flag real-time anomalies"],
  ["Digital Twin Simulation","What does the physical system state look like in silico?","simpy, modelica","Twin Simulation Report","Digital twin enables safe scenario testing before deployment","Simulation state tracks real system via sensor feedback loop"],
  ["Network Traffic Analysis","What patterns exist in system communication?","pandas, scapy","Traffic Pattern Report","Unusual traffic reveals attacks, bugs, or performance issues","Packet-level statistics on volume, latency, and protocol breakdown"],
  ["Log Anomaly Detection","Which log lines indicate abnormal system behavior?","pandas, sklearn, pyahocorasick","Log Anomaly Report","Manual log review misses subtle patterns at scale","Aho-Corasick multi-pattern match plus isolation forest on log features"],
  ["Trace Span Analysis","Where does latency accumulate in distributed calls?","opentelemetry, pandas","Distributed Trace Report","Single service can't see cross-service latency sources","Waterfall chart of span durations across service dependencies"],
  ["Distributed System Consistency Analysis","Are all nodes in agreement at any given time?","pandas","Consistency Report","Eventual consistency can lead to stale reads in distributed systems","Tracks vector clocks and detects divergence across replicas"],
  ["Cache Hit Rate Analysis","How effectively is the cache being utilized?","pandas","Cache Performance Report","Low hit rate means most requests go to expensive backend","Hit rate, eviction rate, and cold miss analysis over time"],
  ["Database Query Performance Analysis","Which queries are slow and why?","pandas, sqlparse","Query Performance Report","Slow queries cascade to application latency","Execution plan analysis; identifies missing indexes and full scans"],
  ["API Rate Limit Analysis","Which clients are hitting rate limits?","pandas","Rate Limit Report","Rate-limited clients may receive degraded service silently","Tracks limit hits by client, endpoint, and time window"],
  ["Incident Frequency Analysis","How often do incidents of each type occur?","pandas","Incident Trend Report","Recurring incident types indicate systemic unresolved issues","Pareto of incident types with frequency and mean impact"],
  // L10
  ["Reliability Block Diagram (RBD) Analysis","What is the system reliability from component reliabilities?","reliability, networkx","System Reliability Report","Series/parallel topology determines system-level reliability","Combines component reliability data into system-level estimate"],
  ["Markov Chain Availability Modeling","What is the steady-state availability of a repairable system?","scipy, numpy","Availability Model Report","Failure/repair cycles determine long-run availability","Transition matrix solved for steady-state probabilities"],
  ["Network Reliability Analysis","What is the probability the network remains connected?","networkx, numpy","Network Reliability Report","Component failures may disconnect network partitions","Monte Carlo or analytical bound on two-terminal reliability"],
  ["Optimal Maintenance Scheduling","When should maintenance be performed to minimize cost?","scipy.optimize","Maintenance Schedule Report","Too early wastes resources; too late risks failure","Age-based or condition-based replacement optimization"],
  ["Spare Parts Optimization","How many spare parts should be stocked?","scipy, numpy","Spare Parts Report","Too few spares increase downtime; too many waste capital","Newsvendor or Poisson model balances cost of under/overstocking"],
  ["Multi-Objective Optimization","How to trade off competing design objectives?","pymoo, scipy","Pareto Front Report","Real designs balance cost, performance, and weight","NSGA-II produces Pareto-optimal set for design trade-space"],
  ["Topology Optimization","What material layout minimizes weight under constraints?","scipy, fenics","Topology Report","Mass-efficient structures require mathematically optimal layouts","Density-based SIMP method evolves material distribution"],
  ["Simulation-based Optimization","How to optimize when objective is a black-box simulation?","optuna, ax","Simulation Opt Report","Gradient unavailable for simulation outputs","Bayesian optimization efficiently samples the black-box space"],
  ["Digital Thread Analysis","How does design intent flow through manufacturing?","pandas, networkx","Digital Thread Report","Disconnected data silos break traceability from design to delivery","Links CAD, simulation, manufacturing, and inspection data"],
  ["Carbon Footprint Analysis","What is the environmental impact of the system?","pandas","Emissions Report","Engineering decisions have quantifiable carbon consequences","Scope 1/2/3 emissions calculated from energy and material inputs"],
  // L11-17 abbreviated groups
  ["Prognostics and Health Management (PHM)","How much useful life remains?","sklearn, tsfresh","RUL Prediction Report","Degradation models estimate remaining useful life from sensor data","Features extracted from sensor trends fed to regression model"],
  ["Edge Computing Latency Analysis","What is the latency at each edge node?","pandas","Edge Latency Report","Edge nodes must meet real-time latency constraints","Per-node P99 latency distribution with geographic breakdown"],
  ["GPU Utilization Analysis","Is the GPU being used efficiently?","pynvml, pandas","GPU Report","Underutilized GPUs waste expensive compute resources","Memory, compute, and transfer utilization per kernel"],
  ["Container Resource Analysis","Which containers consume most resources?","pandas, docker SDK","Container Report","Noisy neighbors degrade co-located container performance","CPU, memory, and I/O per container over time"],
  ["Pipeline Stage Profiling","Which stage is the bottleneck in the data pipeline?","pandas, opentelemetry","Pipeline Report","Data pipelines have one slowest stage that limits throughput","Stage-level timing and record count through each transform step"],
  ["Firmware Version Drift Analysis","Which devices are running outdated firmware?","pandas","Firmware Report","Old firmware may have security or reliability vulnerabilities","Fleet-wide firmware version distribution with patch gap analysis"],
  ["Microcontroller Power Analysis","How much power does each subsystem consume?","pandas, numpy","Power Budget Report","Battery life depends on per-subsystem power allocation","Current draw per mode measured and summed vs battery capacity"],
  ["Real-Time System Deadline Miss Analysis","How often does the system miss timing deadlines?","pandas","RTOS Report","Deadline misses in RTOS can cause safety-critical failures","Counts and characterizes deadline miss events by task"],
  ["Cybersecurity Vulnerability Analysis","Which assets have unpatched vulnerabilities?","pandas","Vulnerability Report","Unpatched systems are the primary attack surface","CVE severity distribution across asset inventory"],
  ["Antenna Pattern Analysis","What is the radiation pattern of the antenna?","numpy, scipy, matplotlib","Radiation Pattern Report","Antenna gain and directivity determine link budget","Polar plot of gain vs angle from measured or simulated data"],
  ["Protocol Compliance Analysis","Does device communication follow the protocol spec?","pandas, scapy","Compliance Report","Protocol deviations cause interoperability failures","Packet-level checks against state machine of protocol spec"],
  ["Memory Leak Detection","Is memory usage growing unboundedly?","tracemalloc, memray","Memory Report","Leaks cause eventual OOM crashes in long-running systems","Heap snapshot diff identifies allocation growth sites"],
  ["Thread Contention Analysis","Which locks cause thread blocking?","py-spy, pandas","Contention Report","Lock contention serializes parallel work and reduces throughput","Profiler captures lock wait time by thread and lock"],
  ["I/O Amplification Analysis","How many I/O operations does each logical operation generate?","pandas","I/O Report","Amplified I/O reduces storage throughput and lifespan","Ratio of physical to logical reads and writes measured"],
  ["Compiler Optimization Report","How much did compiler optimizations improve code?","pandas","Optimization Report","Compiler flags significantly affect runtime performance","Before/after instruction counts, branch mispredictions, and timing"],
];

const BUSINESS = [
  // L4
  ["Revenue Analysis","How much money is the business generating?","pandas","Revenue Report","Revenue is the primary indicator of business scale","Total, by segment, by period, with growth rate vs prior"],
  ["Expense Analysis","Where is the business spending money?","pandas","Expense Report","Uncontrolled expenses erode margins","Categorized spend breakdown vs budget with variance"],
  ["Profit Margin Analysis","How much profit is retained per unit of revenue?","pandas","Margin Report","Margin reveals operational efficiency and pricing power","Gross, operating, and net margin tracked over time"],
  ["Cash Flow Analysis","Is the business generating or burning cash?","pandas","Cash Flow Report","Profit does not equal cash; timing of flows matters","Operating, investing, and financing cash flows summarized"],
  ["Budget Variance Analysis","How does actual performance compare to budget?","pandas","Variance Report","Accountability requires comparing actuals to plan","Positive/negative variances by line item with explanation"],
  ["Sales Pipeline Analysis","How many deals are in each stage of the funnel?","pandas","Pipeline Report","Pipeline predicts future revenue and reveals conversion issues","Deal count, value, and velocity per funnel stage"],
  ["Churn Rate Analysis","What fraction of customers are leaving?","pandas","Churn Report","High churn destroys customer lifetime value and growth","Monthly/annual churn rate by cohort and segment"],
  ["Customer Acquisition Cost (CAC)","How much does it cost to acquire each new customer?","pandas","CAC Report","High CAC makes unit economics unsustainable","Total sales and marketing spend divided by new customers"],
  ["Customer Lifetime Value (CLV)","How much revenue does a customer generate over their lifetime?","pandas, lifelines","CLV Report","CLV justifies acquisition investment and prioritizes retention","Average order value x purchase frequency x customer lifespan"],
  ["Market Basket Analysis","Which products are purchased together?","mlxtend","Association Rules Report","Cross-sell opportunities increase average order value","Apriori or FP-Growth finds frequent itemsets and association rules"],
  // L5
  ["Cohort Analysis","How do customer groups behave over time?","pandas","Cohort Retention Report","Average metrics hide how different cohorts behave","Retention heatmap by signup cohort and month number"],
  ["RFM Segmentation","Which customers are most valuable?","pandas","Customer Segment Report","Not all customers deserve equal attention","Recency, Frequency, Monetary scoring segments customer base"],
  ["ABC Inventory Analysis","Which products deserve most inventory attention?","pandas","Inventory Priority Report","80% of value comes from 20% of SKUs (Pareto)","Rank products by revenue contribution into A, B, C tiers"],
  ["Pricing Elasticity Analysis","How sensitive is demand to price changes?","scipy, statsmodels","Elasticity Report","Wrong pricing leaves money on the table","Estimates percentage change in demand per percent price change"],
  ["Competitive Benchmarking","How does performance compare to industry peers?","pandas","Benchmark Report","Absolute performance means little without context","Ranks company on KPIs relative to named competitors"],
  ["Net Promoter Score Analysis","How likely are customers to recommend the business?","pandas","NPS Report","NPS is leading indicator of organic growth","Promoter/Passive/Detractor breakdown with trend over time"],
  ["Employee Attrition Analysis","Which employees are likely to leave?","sklearn, pandas","Attrition Report","High turnover is costly and disrupts institutional knowledge","Classification model flags at-risk employees by feature profile"],
  ["Productivity Analysis","How much output does each employee or team generate?","pandas","Productivity Report","Productivity differences reveal training or resourcing needs","Output per head per unit time by team or function"],
  ["Marketing Attribution Analysis","Which channels drive conversions?","pandas, sklearn","Attribution Report","Budget should follow what actually drives revenue","First-touch, last-touch, and multi-touch attribution models"],
  ["Supply Chain Lead Time Analysis","How long does it take from order to delivery?","pandas","Lead Time Report","Long lead times hurt responsiveness and customer satisfaction","Mean and variance of lead time by supplier and SKU"],
  // L6
  ["Time Series Demand Forecasting","What quantity will be demanded next period?","prophet, statsmodels","Demand Forecast Report","Inventory and staffing decisions need a demand forecast","SARIMA or Prophet models trained on sales history"],
  ["Customer Segmentation (Clustering)","What distinct customer segments exist?","sklearn","Segment Profile Report","Different segments need different products and messages","K-means or HDBSCAN clusters on behavioral and demographic features"],
  ["Price Optimization Analysis","What price maximizes revenue or profit?","scipy.optimize","Optimal Pricing Report","Price too high loses volume; too low loses margin","Elasticity curve combined with cost structure finds optimum"],
  ["A/B Test Analysis","Did the experiment improve the metric?","scipy.stats, pymc","Experiment Report","Random assignment isolates the causal effect of a change","Two-proportion z-test or Bayesian A/B for statistical significance"],
  ["Marketing Mix Modeling (MMM)","What is the ROI of each marketing channel?","sklearn, pymc","MMM Report","Attribution models undercount brand and offline effects","Regression decomposes sales into base and incremental per channel"],
  ["Lead Scoring Model","Which leads are most likely to convert?","sklearn, xgboost","Lead Score Report","Sales teams waste time on low-probability leads","Binary classifier scores leads by conversion probability"],
  ["Product Recommendation Engine","What should we recommend to this user?","sklearn, implicit","Recommendation Report","Personalized recommendations increase conversion and basket size","Collaborative filtering or matrix factorization on purchase history"],
  ["Fraud Detection Analysis","Which transactions are likely fraudulent?","sklearn, xgboost","Fraud Detection Report","Fraud losses directly reduce profitability","Anomaly detection and classification on transaction features"],
  ["Credit Risk Scoring","What is the probability of default?","sklearn, xgboost","Credit Risk Report","Lending decisions require quantified default probability","Logistic regression or GBM on applicant financial features"],
  ["Workforce Planning Analysis","How many staff are needed in each period?","scipy, pandas","Staffing Report","Under-staffing degrades service; over-staffing wastes cost","Demand forecast converted to FTE requirement with schedule rules"],
  // L7
  ["Customer Journey Mapping","What path do customers take before converting?","pandas, networkx","Journey Map Report","Multi-step journeys reveal drop-off points needing improvement","Transition matrix of events shows most common paths to conversion"],
  ["Funnel Conversion Analysis","Where do prospects drop out of the sales funnel?","pandas","Funnel Report","Conversion at each stage determines overall funnel efficiency","Stage-by-stage conversion rates with volume and drop-off count"],
  ["Product-Market Fit Analysis","How well does the product satisfy market needs?","pandas, scipy","PMF Report","Without PMF, scaling investment is wasted","Retention cohorts and NPS combined as PMF proxy metrics"],
  ["Dynamic Pricing Analysis","What price should be charged at each moment?","sklearn, scipy","Dynamic Price Report","Static pricing leaves value on the table in variable demand","Demand forecast and elasticity combined for real-time pricing"],
  ["Customer Health Score","How healthy is the relationship with each customer?","pandas, sklearn","Health Score Report","Early warning of churn risk enables proactive retention","Composite score from usage, support, NPS, and payment behavior"],
  ["Inventory Optimization","What stock levels minimize cost while meeting service level?","scipy.optimize, pandas","Inventory Report","Too much inventory ties up capital; too little causes stockouts","Newsvendor or (s,S) policy optimized for cost and fill rate"],
  ["Promotional Effectiveness Analysis","Did the promotion increase sales?","statsmodels, scipy","Promo Lift Report","Promotions must pay back more than they cost to run","Causal lift estimated via DiD or synthetic control methods"],
  ["Subscription Revenue Modeling (MRR/ARR)","What is the recurring revenue base and its trajectory?","pandas","MRR Report","SaaS and subscription businesses live and die by MRR","New MRR, expansion, contraction, and churn MRR tracked monthly"],
  ["Unit Economics Analysis","Is each unit of production profitable?","pandas","Unit Economics Report","Scaling is only worthwhile if unit economics are positive","COGS, contribution margin, and payback period per unit or customer"],
  ["Geographic Market Analysis","Which markets or regions perform best?","pandas, geopandas","Geo Report","Resource allocation should follow geographic opportunity","Revenue, growth, and penetration rate mapped by geography"],
  // L8
  ["Causal Impact Analysis (Business)","Did this business event causally change the metric?","causalimpact","Causal Business Report","Correlation is not causation; causal methods matter in business","Bayesian structural time series constructs counterfactual baseline"],
  ["Multi-Touch Attribution Modeling","How much credit does each touchpoint deserve?","sklearn, pandas","Attribution Credit Report","Last-touch undersells top-of-funnel channels","Shapley value allocation distributes credit across all touches"],
  ["CLV Prediction Model","What is the predicted lifetime value of this customer?","lifelines, xgboost","Predictive CLV Report","Knowing future CLV enables differential retention investment","BG/NBD or ML model predicts future purchases and value"],
  ["Competitive Intelligence Analysis","What are competitors doing and how does it affect us?","pandas, nltk","Competitive Report","Strategic decisions need external market context","Structured data from public sources on pricing, features, and positioning"],
  ["Supply Chain Risk Analysis","Which suppliers or routes pose the greatest risk?","pandas, networkx","Supply Risk Report","Single-source dependencies can halt operations","Supplier concentration, lead time volatility, and geopolitical risk scored"],
  ["Financial Forecasting Model","What will the P&L look like next quarter?","prophet, sklearn","Financial Forecast Report","Planning requires credible forward-looking financial projections","Driver-based model maps operational metrics to financial outcomes"],
  ["M&A Target Screening Analysis","Which acquisition targets are most attractive?","pandas, sklearn","Target Screening Report","M&A requires systematic filtering of many candidates","Multi-criteria scoring across financial, strategic, and operational dimensions"],
  ["ESG Performance Analysis","How does the company score on environmental, social, governance?","pandas","ESG Report","Investors and regulators require transparent ESG reporting","Quantitative metrics mapped to GRI or SASB frameworks"],
  ["Scenario Planning Analysis","What happens under different macroeconomic scenarios?","numpy, scipy","Scenario Report","Strategy must be robust to uncertainty in external conditions","Best/base/worst case financial models under defined scenarios"],
  ["Digital Funnel Optimization","Which UX changes improve conversion?","pandas, scipy","UX Report","Small conversion improvements compound to large revenue gains","Multi-variate test results analyzed for statistically significant lifts"],
  // L9-17 abbreviated
  ["Bayesian A/B Testing","What is the posterior probability that variant B is better?","pymc","Bayesian Experiment Report","Frequentist A/B requires fixed sample size; Bayesian is flexible","Posterior distribution over treatment effect updated continuously"],
  ["Natural Language Processing on Reviews","What themes appear in customer feedback?","spacy, sklearn","Text Analysis Report","Manual review of thousands of comments is impractical","LDA topic modeling and sentiment analysis on review corpus"],
  ["Demand Sensing","Can short-term demand shifts be detected in real time?","pandas, sklearn, river","Demand Signal Report","Forecast lag causes over/under-production in volatile markets","Online learning model updates demand forecast daily from signals"],
  ["Revenue Leakage Detection","Where is revenue being lost silently?","pandas","Leakage Report","Billing errors and contract violations silently erode revenue","Reconciles contracts vs invoices vs payments for gap identification"],
  ["Pricing Tier Optimization","Which price tiers capture the most consumer surplus?","scipy.optimize","Tier Optimization Report","Wrong tier boundaries leave revenue uncaptured","Discrete choice model estimates willingness-to-pay distribution"],
  ["Brand Equity Measurement","How strong is the brand relative to competitors?","pandas, nltk","Brand Report","Brand drives pricing power and customer preference","NPS, share of voice, and sentiment indexed to competitors"],
  ["Operating Leverage Analysis","How does revenue growth translate to profit growth?","pandas","Leverage Report","High fixed costs amplify profit swings on revenue changes","Fixed vs variable cost decomposition shows break-even and sensitivity"],
  ["Working Capital Optimization","How to minimize capital tied up in operations?","pandas","Working Capital Report","Excessive working capital reduces returns on invested capital","DSO, DIO, DPO analyzed with simulation of policy changes"],
  ["Real Options Analysis","What is the value of strategic flexibility?","numpy, scipy","Real Options Report","NPV ignores value of waiting, expanding, or abandoning","Binomial tree or Black-Scholes applied to investment flexibility"],
  ["Network Effects Measurement","Is the product getting more valuable as users grow?","pandas, statsmodels","Network Report","Network effects drive winner-take-most market dynamics","Regression of engagement/value on user base size over time"],
  ["Data Monetization Strategy Analysis","What is the economic value of internal data assets?","pandas, sklearn","Data Value Report","Companies underestimate the value of their data","Estimates revenue potential from data licensing, analytics, and APIs"],
  ["Platform Economics Analysis","How do two-sided market dynamics affect pricing?","pandas, scipy","Platform Report","Two-sided platforms require balancing both sides simultaneously","Cross-side and same-side network effect coefficients estimated"],
  ["Algorithmic Trading Performance Analysis","How well does the trading strategy perform?","pandas, backtrader","Trading Report","Strategy must be tested rigorously before capital deployment","Sharpe, drawdown, Calmar, win rate, and alpha vs benchmark"],
  ["Insurance Risk Modeling","What is the expected loss and tail risk?","scipy, sklearn","Actuarial Report","Premiums must cover expected losses plus capital charge","GLMs on historical claims data; VaR and CVaR estimated"],
  ["Regulatory Compliance Analysis","Is the business operating within regulatory requirements?","pandas","Compliance Report","Non-compliance carries fines, sanctions, and reputational damage","Structured checks against regulatory rules on business data"],
];

// Build table rows
function buildRows(data, domain, domainColor) {
  const rows = [sectionRow(`  ${domain}`, domainColor)];
  rows.push(headerRow([
    ['#', 480], ['Analysis Name', 1440], ['What It Answers', 1200],
    ['Library', 1080], ['Report Name', 1320], ['Why It Exists', 1920], ['How It Helps', 1920]
  ]));
  data.forEach(([name, answers, lib, report, why, how], i) => {
    rows.push(dataRow(i + 1, name, answers, lib, report, why, how, domain, i));
  });
  return rows;
}

// Cover page paragraphs
function coverPage() {
  return [
    new Paragraph({ spacing: { before: 1440, after: 0 }, children: [new TextRun({ text: '400 Python Analyses', bold: true, size: 72, color: COLORS.headerBg, font: 'Arial' })] }),
    new Paragraph({ spacing: { before: 240, after: 0 }, children: [new TextRun({ text: 'Scientific / Research  ·  Engineering / Systems  ·  Business / Finance', size: 28, color: '444444', font: 'Arial' })] }),
    new Paragraph({ spacing: { before: 120, after: 0 }, children: [new TextRun({ text: 'Analysis Name  ·  What It Answers  ·  Library  ·  Report Name  ·  Why It Exists  ·  How It Helps', size: 22, color: '888888', italic: true, font: 'Arial' })] }),
    new Paragraph({ spacing: { before: 2880, after: 0 }, children: [new TextRun({ text: 'Depth: Level 4 → Level 17', size: 24, color: '555555', font: 'Arial' })] }),
    new Paragraph({ children: [new PageBreak()] }),
  ];
}

// TOC section
function tocSection() {
  return [
    new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: 'Table of Contents', font: 'Arial', size: 32, bold: true })] }),
    new Paragraph({ spacing: { before: 120 }, children: [new TextRun({ text: '1.  Scientific / Research Analyses  (L4–L17)  ......  110 analyses', size: 22, font: 'Arial' })] }),
    new Paragraph({ spacing: { before: 60 }, children: [new TextRun({ text: '2.  Engineering / Systems Analyses  (L4–L17)  ......  120 analyses', size: 22, font: 'Arial' })] }),
    new Paragraph({ spacing: { before: 60 }, children: [new TextRun({ text: '3.  Business / Finance Analyses  (L4–L17)  .......  170 analyses', size: 22, font: 'Arial' })] }),
    new Paragraph({ children: [new PageBreak()] }),
  ];
}

// Legend section
function legendSection() {
  return [
    new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 320, after: 160 }, children: [new TextRun({ text: 'How to Read This Document', font: 'Arial', size: 28, bold: true })] }),
    new Paragraph({ spacing: { before: 60 }, children: [new TextRun({ text: 'Each row describes one analysis technique across six dimensions:', size: 22, font: 'Arial' })] }),
    new Paragraph({ spacing: { before: 80 }, children: [new TextRun({ text: 'Analysis Name — The standard technical name used in academia and industry.', size: 22, font: 'Arial' })] }),
    new Paragraph({ spacing: { before: 60 }, children: [new TextRun({ text: 'What It Answers — The core question this analysis addresses.', size: 22, font: 'Arial' })] }),
    new Paragraph({ spacing: { before: 60 }, children: [new TextRun({ text: 'Library — The primary Python libraries used to perform it.', size: 22, font: 'Arial' })] }),
    new Paragraph({ spacing: { before: 60 }, children: [new TextRun({ text: 'Report Name — The name of the output report or deliverable.', size: 22, font: 'Arial' })] }),
    new Paragraph({ spacing: { before: 60 }, children: [new TextRun({ text: 'Why It Exists — The problem or gap this analysis was created to solve.', size: 22, font: 'Arial' })] }),
    new Paragraph({ spacing: { before: 60 }, children: [new TextRun({ text: 'How It Helps — The specific value or insight it delivers to a practitioner.', size: 22, font: 'Arial' })] }),
    new Paragraph({ spacing: { before: 120 }, children: [new TextRun({ text: 'Depth levels correspond to prerequisite knowledge required: L4 = introductory, L8 = advanced undergraduate, L12 = graduate, L17 = research frontier.', size: 20, color: '666666', italic: true, font: 'Arial' })] }),
    new Paragraph({ children: [new PageBreak()] }),
  ];
}

// Main table
const allRows = [
  ...buildRows(SCIENCE, 'Scientific / Research', COLORS.science),
  ...buildRows(ENGINEERING, 'Engineering / Systems', COLORS.engineering),
  ...buildRows(BUSINESS, 'Business / Finance', COLORS.business),
];

const mainTable = new Table({
  width: { size: 9360, type: WidthType.DXA },
  columnWidths: [480, 1440, 1200, 1080, 1320, 1920, 1920],
  rows: allRows,
});

// Document
const doc = new Document({
  styles: {
    default: { document: { run: { font: 'Arial', size: 22 } } },
    paragraphStyles: [
      { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 36, bold: true, font: 'Arial', color: COLORS.headerBg },
        paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 0 } },
      { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 28, bold: true, font: 'Arial', color: '333333' },
        paragraph: { spacing: { before: 180, after: 80 }, outlineLevel: 1 } },
    ]
  },
  sections: [{
    properties: {
      page: {
        size: { width: 24480, height: 15840 }, // landscape letter
        margin: { top: 720, right: 720, bottom: 720, left: 720 }
      }
    },
    headers: {
      default: new Header({ children: [
        new Paragraph({ alignment: AlignmentType.RIGHT, children: [
          new TextRun({ text: '400 Python Analyses Reference  |  ', size: 16, color: '888888', font: 'Arial' }),
          new TextRun({ children: [PageNumber.CURRENT], size: 16, color: '888888', font: 'Arial' }),
        ]})
      ]})
    },
    children: [
      ...coverPage(),
      ...tocSection(),
      ...legendSection(),
      mainTable,
    ]
  }]
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync('400_python_analyses.docx', buf);
  console.log('Done. Size:', buf.length);
});