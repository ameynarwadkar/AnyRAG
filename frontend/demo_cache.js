/**
 * Pre-cached demo responses for the AnyRAG portfolio demo.
 * Each entry mirrors the exact shape of a real /v1/ask API response.
 * 
 * The corpus is a set of Numerical Linear Algebra lecture PDFs,
 * so all responses are grounded in that domain.
 */
const DEMO_CACHE = {
    "What are the boundary conditions for the discretised BVP?": {
        question: "What are the boundary conditions for the discretised BVP?",
        refinement: {
            query_type: "lookup",
            rewritten_queries: ["boundary conditions discretised BVP boundary value problem u0 un+1"]
        },
        retrieval_path: "hybrid",
        generation: {
            answer: "<strong>Boundary Conditions for the Discretised BVP</strong><br><br>The boundary conditions for the discretised boundary value problem (BVP) are defined as:<br>&bull; u0 = 0<br>&bull; un+1 = 0 [1]<br><br><strong>Physical Interpretation:</strong><br>These conditions mathematically enforce that the vertical displacement of the string is strictly zero at both of its endpoints. This corresponds exactly to the fixed-end boundary conditions specified in the original continuous ODE formulation [1].",
            citations: [
                { document_number: 1, claim: "u0 = 0 and un+1 = 0", supported: true, verification_reason: "Directly stated in the discretised BVP formulation." }
            ],
            confidence: "high",
            confidence_metrics: {
                retrieval_confidence: 0.95,
                citation_coverage: 1.0,
                completeness: 0.90,
                composite_score: 0.95
            }
        },
        sources: [
            { source_file: "NLA_L1_post", chunk_id: "Page_4", section_heading: "Discretised BVP", cross_score: 8.42 },
            { source_file: "NLA_L1_post", chunk_id: "Page_3", section_heading: "Discretising the ODE", cross_score: 6.18 },
            { source_file: "NLA_L1_post", chunk_id: "Page_2", section_heading: "1D Example from Structural Mechanics", cross_score: 3.91 }
        ]
    },

    "What is the 1D Laplacian matrix and how is it defined?": {
        question: "What is the 1D Laplacian matrix and how is it defined?",
        refinement: {
            query_type: "conceptual",
            rewritten_queries: ["1D Laplacian matrix definition tridiagonal diagonal off-diagonal entries equation 1.2"]
        },
        retrieval_path: "hybrid",
        generation: {
            answer: "<strong>The 1D Laplacian Matrix (A)</strong><br><br>Based on Definition 1.1.3, the 1D Laplacian Matrix is a highly structured <strong>tridiagonal matrix</strong> defined by the following characteristics:<br>&bull; <strong>Main Diagonal:</strong> All entries are 2.<br>&bull; <strong>Off-Diagonals (Sub/Super):</strong> All adjacent entries are -1.<br>&bull; <strong>Other Entries:</strong> All other elements are 0 [1].<br><br><strong>Origin and Application:</strong><br>This matrix structure directly arises from applying a finite difference approximation (using Taylor series expansions) to discretise the second derivative in the ODE boundary value problem [2]. Ultimately, it allows the continuous BVP to be solved computationally as a linear system of the form Au = b, consisting of n equations for n unknowns [1].",
            citations: [
                { document_number: 1, claim: "Tridiagonal matrix with 2 on diagonal and -1 on off-diagonals", supported: true, verification_reason: "Definition 1.1.3 explicitly states this structure in equation (1.2)." },
                { document_number: 2, claim: "Arises from finite difference discretisation", supported: true, verification_reason: "The derivation using Taylor series is shown on the preceding page." }
            ],
            confidence: "high",
            confidence_metrics: {
                retrieval_confidence: 0.92,
                citation_coverage: 1.0,
                completeness: 0.88,
                composite_score: 0.93
            }
        },
        sources: [
            { source_file: "NLA_L1_post", chunk_id: "Page_4", section_heading: "Definition 1.1.3 - 1D Laplacian Matrix", cross_score: 9.15 },
            { source_file: "NLA_L1_post", chunk_id: "Page_3", section_heading: "Discretising the ODE", cross_score: 7.33 },
            { source_file: "NLA_L1_post", chunk_id: "Page_5", section_heading: "Solving the Linear System", cross_score: 4.67 }
        ]
    },

    "Which matrix is described as ill-conditioned and what algorithmic issue is highlighted?": {
        question: "Which matrix is described as ill-conditioned and what algorithmic issue is highlighted?",
        refinement: {
            query_type: "compound",
            rewritten_queries: [
                "ill-conditioned matrix Hilbert matrix example",
                "orthogonalisation Gram-Schmidt modified algorithm numerical stability issue"
            ]
        },
        retrieval_path: "hybrid",
        generation: {
            answer: "Based on the provided context, here are the details regarding the ill-conditioned matrix and the associated algorithmic challenges:<br><br><strong>The Ill-Conditioned Matrix:</strong><br>&bull; The <strong>Hilbert matrix</strong> is specifically cited as being \"notorious for being ill-conditioned\" [1].<br><br><strong>The Algorithmic Issue:</strong><br>The core issue involves numerical instability during <strong>orthogonalisation</strong>:<br>&bull; When applying either the Classical Gram-Schmidt or the Modified Gram-Schmidt algorithms to ill-conditioned matrices, both methods are highly susceptible to losing orthogonality due to floating-point rounding errors [1][2].<br>&bull; Consequently, these standard algorithms may fail to produce reliably orthogonal vectors, suggesting that more robust algorithms (like Householder reflections) are required for such matrices [2].",
            citations: [
                { document_number: 1, claim: "Hilbert matrix is notorious for being ill-conditioned", supported: true, verification_reason: "Explicitly named as the ill-conditioned example." },
                { document_number: 2, claim: "Both Gram-Schmidt variants are susceptible to instability", supported: true, verification_reason: "The text discusses susceptibility of both methods." }
            ],
            confidence: "high",
            confidence_metrics: {
                retrieval_confidence: 0.88,
                citation_coverage: 1.0,
                completeness: 0.85,
                composite_score: 0.91
            }
        },
        sources: [
            { source_file: "NLA_L3_post", chunk_id: "Page_4", section_heading: "Ill-conditioned Matrices", cross_score: 8.91 },
            { source_file: "NLA_L3_post", chunk_id: "Page_3", section_heading: "Orthogonalisation Methods", cross_score: 7.05 },
            { source_file: "NLA_L3_post", chunk_id: "Page_5", section_heading: "Numerical Stability", cross_score: 4.22 }
        ]
    },

    "What method does Google use in Example 1.5.5?": {
        question: "What method does Google use in Example 1.5.5?",
        refinement: {
            query_type: "lookup",
            rewritten_queries: ["Google Example 1.5.5 PowerMethod PageRank eigenvalue"]
        },
        retrieval_path: "hybrid",
        generation: {
            answer: "In <strong>Example 1.5.5</strong>, Google's approach relies on the <strong>Power Method</strong> [1].<br><br><strong>Context (Google PageRank):</strong><br>This method is fundamental to the underlying mechanics of Google's PageRank algorithm. Because the web graph is overwhelmingly massive, computing the dominant eigenvalue (which corresponds to page importance) via direct factorization is impossible. Instead, the Power Method provides an highly efficient, iterative approach to approximate this dominant eigenpair [1].",
            citations: [
                { document_number: 1, claim: "Google uses the PowerMethod in Example 1.5.5", supported: true, verification_reason: "Directly stated in the example text." }
            ],
            confidence: "high",
            confidence_metrics: {
                retrieval_confidence: 0.97,
                citation_coverage: 1.0,
                completeness: 0.92,
                composite_score: 0.96
            }
        },
        sources: [
            { source_file: "NLA_L2_post", chunk_id: "Page_12", section_heading: "Example 1.5.5 - Google PageRank", cross_score: 9.54 },
            { source_file: "NLA_L2_post", chunk_id: "Page_11", section_heading: "Power Iteration Method", cross_score: 5.88 }
        ]
    },

    "What is a sparse matrix vs a dense matrix?": {
        question: "What is a sparse matrix vs a dense matrix?",
        refinement: {
            query_type: "conceptual",
            rewritten_queries: ["sparse matrix dense matrix definition nnz nonzero elements"]
        },
        retrieval_path: "hybrid",
        generation: {
            answer: "<strong>Sparse vs. Dense Matrices</strong><br><br>Definition 1.1.4 provides a formal distinction between sparse and dense matrices for a matrix A of size m &times; n [1]:<br><br>1. <strong>Sparse Matrix:</strong> A matrix is considered sparse if nnz(A) (the number of non-zero elements) is strictly much less than the total number of elements (m &times; n). These matrices contain mostly zeros.<br>2. <strong>Dense Matrix:</strong> A matrix is considered dense if this condition is not met (i.e., a significant proportion of its elements are non-zero) [1].<br><br><strong>Computational Significance:</strong><br>The text emphasizes that exploiting the structure of sparse matrices (by not storing or computing the zeros) is critical for efficient numerical methods, serving as a central theme of the course [1].",
            citations: [
                { document_number: 1, claim: "Definition of sparse and dense matrices via nnz(A)", supported: true, verification_reason: "Definition 1.1.4 provides these exact definitions." }
            ],
            confidence: "high",
            confidence_metrics: {
                retrieval_confidence: 0.94,
                citation_coverage: 1.0,
                completeness: 0.90,
                composite_score: 0.94
            }
        },
        sources: [
            { source_file: "NLA_L1_post", chunk_id: "Page_5", section_heading: "Definition 1.1.4 - Sparse and Dense", cross_score: 9.21 },
            { source_file: "NLA_L1_post", chunk_id: "Page_4", section_heading: "1D Laplacian Matrix", cross_score: 5.14 },
            { source_file: "NLA_L1_post", chunk_id: "Page_6", section_heading: "Solving the Linear System", cross_score: 3.77 }
        ]
    },

    "What is the likelihood function and what does it measure?": {
        question: "What is the likelihood function and what does it measure?",
        refinement: {
            query_type: "conceptual",
            rewritten_queries: ["likelihood function definition statistical measure model fit quality observed data"]
        },
        retrieval_path: "hybrid",
        generation: {
            answer: "<strong>The Likelihood Function</strong><br><br>The likelihood function serves as a rigorous statistical metric for <strong>measuring the quality of a model's fit</strong> against observed empirical data [1].<br><br><strong>Mathematical Formulation:</strong><br>In practice, it is often more mathematically convenient to use the natural logarithm of the likelihood (the log-likelihood). The text defines this relationship as:<br>log p(y|X,w) = -W + c (where c is a constant) [1].<br><br>This equivalence elegantly connects probabilistic estimation frameworks to deterministic optimization objectives, allowing for robust parameter estimation.",
            citations: [
                { document_number: 1, claim: "Likelihood function measures quality of model fit", supported: true, verification_reason: "Directly stated in the text's definition." },
                { document_number: 1, claim: "log p(y|X,w) = -W + c", supported: true, verification_reason: "The mathematical expression is present in the source." }
            ],
            confidence: "high",
            confidence_metrics: {
                retrieval_confidence: 0.91,
                citation_coverage: 1.0,
                completeness: 0.87,
                composite_score: 0.92
            }
        },
        sources: [
            { source_file: "NLA_L2_post", chunk_id: "Page_4", section_heading: "Likelihood Function", cross_score: 8.76 },
            { source_file: "NLA_L2_post", chunk_id: "Page_5", section_heading: "Maximum Likelihood Estimation", cross_score: 5.43 }
        ]
    },

    "What are the key differences between direct and iterative solvers for linear systems?": {
        question: "What are the key differences between direct and iterative solvers for linear systems?",
        refinement: {
            query_type: "compound",
            rewritten_queries: [
                "direct solvers linear systems LU factorisation Gaussian elimination exact solution",
                "iterative solvers linear systems convergence approximation Krylov methods"
            ]
        },
        retrieval_path: "hybrid",
        generation: {
            answer: "I don't have enough confident information in the retrieved documents to answer this question accurately without hallucinating.<br><br><strong>What I found tangentially related:</strong><br>&bull; NLA_L1_post - Solving the Linear System<br>&bull; NLA_L1_post - 1D Laplacian Matrix<br><br>These documents matched some keywords but do not seem to directly answer your query. You may want to check them manually.",
            citations: [],
            confidence: "low",
            confidence_metrics: {
                retrieval_confidence: 0.0,
                citation_coverage: 0.0,
                completeness: 0.0,
                composite_score: 0.0
            }
        },
        sources: [
            { source_file: "NLA_L1_post", chunk_id: "Page_5", section_heading: "Solving the Linear System", cross_score: -2.84 },
            { source_file: "NLA_L1_post", chunk_id: "Page_4", section_heading: "1D Laplacian Matrix", cross_score: -3.11 }
        ]
    }
};

/**
 * Static corpus stats shown in the manage pane during demo mode.
 */
const DEMO_CORPUS_STATS = [
    { source_file: "NLA_L1_POST", count: 12 },
    { source_file: "NLA_L2_POST", count: 14 },
    { source_file: "NLA_L3_POST", count: 10 }
];

/**
 * Sample questions displayed as clickable cards in the hero section.
 */
const DEMO_SAMPLE_QUESTIONS = [
    "What are the boundary conditions for the discretised BVP?",
    "What is the 1D Laplacian matrix and how is it defined?",
    "Which matrix is described as ill-conditioned and what algorithmic issue is highlighted?",
    "What method does Google use in Example 1.5.5?",
    "What is a sparse matrix vs a dense matrix?",
    "What is the likelihood function and what does it measure?",
    "What are the key differences between direct and iterative solvers for linear systems?"
];
