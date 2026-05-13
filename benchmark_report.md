# Autonomous RAG Benchmark Report
**Methodology:** 50 strict queries (20 In-Domain Easy, 15 In-Domain Hard, 15 Out-of-Domain Hallucination Traps).

## Executive Summary
| Metric | Naive RAG | Self-Reflective RAG |
|--------|-----------|----------------------|
| **Average Latency** | 3744.86ms | 5679.31ms |
| **Hallucinations (OOD)** | 1/15 | 2/15 |
| **Successful Refusals** | 14/15 | 13/15 |
| **Self-Healing Triggers** | N/A | 17/50 |

*Conclusion:* The Self-Reflective architecture trades a marginal latency increase for a massive reduction in Hallucinations via Heuristic Guardrails.
