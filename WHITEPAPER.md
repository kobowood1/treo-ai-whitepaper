---
title: "Treo: One Learner Model for the Student, the Teacher and the Parent"
subtitle: "A responsible AI learning platform for grades 8–12 STEM"
author: "Kofi Obo Wood"
date: "Version 1.0 · October 27, 2026"
---

> **Status.** Treo is at the prototype stage. This paper describes the design, the evidence behind it, what the prototype does today, and how we will test whether it works. Anything not yet built is labeled as roadmap.

## Abstract

Three people decide whether a teenager masters algebra or physics: the student, the teacher and the parent. Each sees only part of the picture. The student sees today's problem. The teacher sees answers from 150 students across five classes, usually after it is too late to help. The parent often sees only a grade. Most AI tools in schools serve one of these people in isolation, and recent evidence shows that a general-purpose chatbot can raise practice scores while lowering what students actually learn.

Treo takes a different approach. It keeps **one learner model** for each student: an estimate of their mastery of each concept on a standards-aligned prerequisite graph. Every exchange updates it. That model drives three views. The student gets a **Socratic tutor** that asks rather than tells, and accepts typed, photographed or spoken work. The teacher gets a **copilot** that traces errors to root causes and drafts feedback the teacher approves. The parent gets **plain-language guidance** in the family's language, shared only as the school allows.

Each school runs its own isolated Treo instance, so student data is never pooled across customers. This paper sets out the problem, the research Treo builds on, its design principles and architecture, its safeguards, a public evaluation plan, the current prototype, and the business model that will carry it into schools.

## 1. The problem: three people, three partial views

American students are losing ground in mathematics at the point where it matters most for STEM careers. In 2024 the average twelfth-grade NAEP mathematics score was 3 points below 2019 and 3 points below 2005. Fewer students reached Proficient and more fell below Basic [1].

Schools cannot hire their way out. In fall 2024, 74% of U.S. public schools had difficulty filling at least one teaching vacancy with a fully certified teacher, and 66% of high schools reported difficulty filling physical-science positions [2]. Half of public schools reported feeling understaffed, including 16% in mathematics [3].

The deeper problem is information. Learning breaks down in small, specific ways: a sign error that is really a gap in negative numbers, or a physics mistake that is really an algebra mistake. Each of the three people holds a piece of that information, and none holds all of it.

| Person | What they see | What they miss |
|---|---|---|
| Student | The problem in front of them | Why they are stuck, and what to practice |
| Teacher | Answers from five classes of 25–35 students | Which error type, and which prerequisite is behind it, early enough to act |
| Parent | A grade, often weeks later | What their child is working on and how to help tonight |

Closing this gap is a matter of scale, not of goodwill. A teacher cannot diagnose 150 students' reasoning every day. A parent cannot reconstruct today's lesson. Software can keep track, if it is designed to support people rather than replace them.

## 2. What the evidence says about AI and learning

Four findings shape Treo's design.

**Tutoring works, and well-designed software can approach it.** Bloom's classic studies found that one-to-one tutoring dramatically outperformed classroom instruction [4]. VanLehn's later review put the effect of human tutoring at about 0.79 standard deviations and found step-based intelligent tutoring systems nearly as effective, at about 0.76 [5]. Cognitive Tutor Algebra I, studied at scale across many U.S. schools, showed effects of roughly 0.2 standard deviations in high schools in its second year of use [6]. Personalized, step-level support is not new. What is new is the ability to offer it in natural language, across subjects, at low cost.

**Design decides whether AI helps or harms.** In a field experiment with nearly 1,000 high school mathematics students, unrestricted access to a GPT-4 chat interface raised practice grades by 48%. When access was removed, those students performed 17% worse than students who never had it. A version with tutoring safeguards raised practice grades by 127% and largely avoided the harm [7]. At Harvard, an AI tutor built on research-based teaching practices (active learning, managing cognitive load, scaffolding one step at a time, timely feedback) produced learning gains more than double those of an in-class active-learning session, in less time. The estimated effect was between 0.63 and 1.3 standard deviations [8]. The lesson is direct: an AI that gives answers can hollow out learning, while an AI that makes students think can accelerate it.

**AI is most reliable when it strengthens the adult in the loop.** In a randomized trial with more than 700 tutors and 1,000 students in underserved communities, giving human tutors an AI copilot raised students' likelihood of mastering topics by 4 percentage points, and by 9 points for students of lower-rated tutors. It cost about $20 per tutor per year [9]. Separately, U.S. teachers who use AI weekly estimate it saves them 5.9 hours a week, roughly six weeks over a school year [10].

**Families act on specific, timely information.** Weekly automated text alerts telling parents about missed assignments, grades and absences reduced course failures by 27% and raised class attendance by 12% in middle and high schools. More than 32,000 messages cost $63 to send [11]. Parents do not need to become teachers. They need to know what is happening and what to do.

**What follows for design.** An AI that answers questions for students is easy to build and risky to deploy. An AI that diagnoses, asks, and hands clear information to the adults around the student is harder to build and better supported by evidence. Treo is built on the second approach.

## 3. Design principles

1. **Socratic by default.** Treo never gives the final answer to a problem in progress. It asks the next question, reveals one step at a time and checks understanding, protecting the productive struggle that drives learning [7], [8], [12].
2. **One learner model, three views.** The tutor, the teacher's copilot and the parent's guide read the same model, so they never contradict each other about what a student knows.
3. **Root cause over right answer.** Every error is classified as computational, procedural or conceptual and traced on a prerequisite graph to the concept most likely behind it. This draws on decades of work on knowledge tracing [13] and on feedback that targets the task and the process, not just the result [14].
4. **The teacher decides.** Every recommendation and every draft of feedback can be inspected, edited or rejected. Nothing reaches a student's record without teacher approval.
5. **Families as partners, with the school in control.** Parents get short, plain-language guidance in their own language. The school decides what is shared.
6. **Privacy by architecture.** Each school gets its own instance. Student data stays there, is never pooled across schools, is never used for advertising, and is deleted at contract end.

## 4. Architecture

![Figure 1. Treo's architecture: three users read one shared learner model inside each school's own instance.](figures/fig1-architecture.svg)

Treo has three engines beneath the shared learner model.

### 4.1 The learner model and the prerequisite graph

Every STEM concept is a node in a directed graph, linked to the concepts that must be mastered first and aligned to Common Core mathematics and NGSS science standards. Each student carries a mastery estimate between 0 and 1 for every node.

The graph is what lets Treo find a root cause. For example, a student who keeps getting slope-intercept problems wrong may be missing slope as a rate of change, or two-step equations, or operations with negative numbers. The graph tells Treo where to look, and the student's evidence tells it which one.

The production graph will extend open, standards-aligned learning graphs such as *os-taxonomy*, which maps 1,590 topics and 3,221 prerequisite links for the primary years [15], to secondary mathematics and physical science. Any graph we derive from it will be published under the same open license.

### 4.2 The evidence loop

![Figure 2. The evidence loop: each exchange produces evidence that updates the learner model, which shapes the next question and feeds the teacher and parent views.](figures/fig2-evidence-loop.svg)

After every exchange, a separate assessment step reads the latest turns and writes a structured evidence record. The record names the concepts with evidence, the error type (computational, procedural, conceptual or none), the prerequisite most likely behind the error, and one sentence a teacher could verify from the transcript. The model returns this record through a forced, schema-checked tool call rather than free text.

The server then caps how far any mastery estimate can move in one exchange, at 0.15. One lucky or unlucky answer cannot swing the picture, and the model's judgement is never applied unchecked. The approach follows the logic of knowledge tracing [13]. Because the evidence is written in natural language and can cite photographed work, it captures reasoning that multiple-choice items cannot.

### 4.3 The tutoring engine

The tutor combines four things:

- retrieval from the school's approved curriculum;
- an agent loop that can pause to ask the student a clarifying question;
- a system prompt that encodes the teaching rules in Section 3;
- layered memory: raw interaction traces, then summaries, then synthesized understanding, each traceable to its evidence.

Open-source systems such as *DeepTutor* show that this architecture is feasible at scale [16]. Treo's contribution is the K–12 layer on top: grounding in a school's own curriculum, a learner model teachers can inspect, the parent layer, and child-safety controls.

### 4.4 Multimodal input and a research track beyond text

Students reason with pictures, gestures and speech, not only typed text. Treo accepts photographs of handwritten work today and will add spoken explanations. It will also add a small set of generated visuals: number lines, balance scales, graphs and force diagrams.

Longer term, our white paper *Beyond the Word* argues that models grounded in perception will reason about the physical world more reliably than text-only models [17]. Inside Treo, that research direction is pursued practically. We adapt open multimodal foundation models to read student work and to explain physical science through visual and audio simulation. Deeper perceptual training is a research track run with university partners. It is not something the product depends on.

### 4.5 The teacher and parent views

Both views are generated from the session and the learner model through structured outputs with fixed fields.

- **Teacher view:** a short summary, misconceptions with error types, the likely root cause, one 5–10 minute teaching move, and a draft message to the student. The draft stays a draft until the teacher approves it.
- **Parent view:** what the student worked on this week, where they got stuck in everyday words, three things to try at home (ideally drawn from the student's interests), and a conversation starter. It is written in the family's home language, and shown only if the school allows it.

## 5. Safeguards

| Risk | Safeguard | Status |
|---|---|---|
| The AI does the thinking for the student | Socratic mode by default. Before each release, an automated evaluation sends adversarial student messages (such as "just tell me the answer" and deliberate sign errors) and fails the release if any reply leaks a final answer. | Teaching rules in the prototype; evaluation suite before the pilot |
| Inaccurate or invented content | Answers grounded in approved curriculum; release testing for accuracy, bias, hallucination and age-appropriateness, scored against the domains of the EDSAFE / ASU Learning Sciences Benchmark [18] | Before the pilot |
| Over-confident judgments about a student | Mastery changes capped per exchange; every judgment carries verifiable evidence; teachers can see and override the model | In the prototype |
| Feedback reaching a student unreviewed | Teacher approval required for anything entering a student record | In the prototype |
| Privacy | One instance per school; the school is the data controller under FERPA; school-authorized consent, written data-retention and information-security policies under the amended COPPA Rule [19]; no advertising; no third-party sharing beyond processors | The prototype stores no data; per-school instances and policies before the pilot |
| Parent visibility becoming surveillance | The school controls sharing; parents see learning guidance, not raw transcripts or scores | In the prototype |
| Inequity across language and background | Plain-language output, a home-language parent view, simpler English for multilingual learners, and bias review in every release cycle | Language features in the prototype; bias review before the pilot |

These safeguards follow federal guidance. The Department of Education's July 2025 guidance on AI calls for attention to privacy and for "engaging affected stakeholders, especially parents" [20].

## 6. How we will know if it works

Treo will be evaluated in a way districts and researchers can trust. The first full pilot runs in the 2027–28 school year.

**Research questions**

1. Do students using Treo's Socratic tutor gain more on concept assessments than comparable students without it?
2. Does Treo's root-cause diagnosis match an expert teacher's diagnosis of the same student work?
3. Does the teacher copilot save time without lowering the quality of feedback?
4. Does the parent guide increase family engagement in ways linked to student outcomes?

**Design and measures**

| Question | Measure | Comparison |
|---|---|---|
| Learning | Pre- and post-tests on targeted concepts; delayed retention test 4–6 weeks later | Matched classes or randomized sections not using Treo |
| Diagnosis | Agreement between Treo's root-cause label and blind ratings by two experienced teachers | Agreement between the two teachers |
| Teacher time | Time logs; share of drafts approved unchanged, edited or rejected | Baseline weeks before Treo |
| Families | Guide opens, reported at-home actions, attendance and assignment completion | Families not receiving guides |
| Safety | Socratic evaluation pass rate; flagged incidents per 1,000 sessions | Release-over-release trend |

**What would count as failure.** No learning gain over comparison classes, a lower delayed-retention score (the pattern in [7]), diagnosis agreement well below teacher–teacher agreement, or teachers rejecting most drafts. We will publish the results either way, together with the evaluation protocol, before scaling past the pilot schools.

## 7. The prototype today

A working prototype runs now. Built on Claude, it implements the full loop on a 10-concept graph covering middle and early high school algebra and Newton's second law:

- a Socratic tutor that accepts typed answers and photographs of handwritten work;
- a learner model that updates after every exchange, with capped changes, error types and a highlighted root-cause concept;
- a teacher view with misconceptions, root cause, a suggested teaching move, and draft feedback with Approve and Reject controls;
- a parent view written in the family's home language (Spanish in one demo case), with a teacher-controlled sharing switch.

The prototype uses fictional students only and stores no data. It does not yet include the dedicated per-school deployment, the full grade 8–12 graph, voice input, generated visuals, or a class-level dashboard. Those are on the roadmap below.

## 8. Product and business model

**Customers.** Treo is sold to public, charter and private schools and districts. The district or school buys it; teachers decide whether it sticks. There are 99,297 public schools and 19,186 operating districts in the United States [21].

**Deployment.** Each school receives a dedicated instance on standard U.S. cloud infrastructure. It has its own data store and encryption keys, on shared, autoscaled compute.

**Pricing (planning assumptions, to be validated in pilots).**

| Plan | Price | Includes |
|---|---|---|
| Pilot | No license fee; school covers cloud cost | One school, one semester, research-grade evaluation |
| School | $25 per student per year, $7,500 minimum | Dedicated instance; student, teacher and parent views; curriculum grounding |
| District (5+ schools) | $20 per student per year | Adds a district dashboard and single sign-on |
| Onboarding | $3,000 one-time per school | Curriculum loading, teacher training, data-privacy agreement |

**Who pays.**

- **Existing federal grants.** Department of Education guidance confirms that existing formula and discretionary grant funds may pay for AI-enhanced high-impact tutoring and AI-based instructional materials [20].
- **Competitive grants.** The Department's April 2026 final priority on AI asks grantees to integrate AI-driven tools that personalize learning and support differentiated instruction. It names adaptive learning, virtual teaching assistants, tutoring and data analytics [22].
- **Families.** From January 2027, families in participating states can use scholarships funded by the new federal scholarship tax credit for qualified K–12 expenses [23].
- **National priority.** Executive Order 14277 directs that educators be equipped "to utilize AI in their classrooms to improve educational outcomes" [24].

**Five-year plan (projections, not forecasts).** About 700 partner schools, $8.4 million in annual revenue and about 85 U.S. employees by 2031. Revenue is partner schools × 500 students × the blended license price, plus onboarding fees. Spending runs ahead of revenue until year four, funded by grants, venture competitions and a seed round in 2028.

## 9. Roadmap

![Figure 3. Treo's roadmap: four phases, each opened by a gate.](figures/fig3-roadmap.svg)

## 10. Open questions and an invitation

Some of Treo's hardest questions are open:

- **Error types.** How fine-grained should they be before teachers stop finding them useful?
- **The parent guide.** How should it adapt for families with little time or low trust in school communication?
- **Diagnosis reliability.** Can a learner model built from natural-language evidence match the reliability of item-based assessment?
- **The multimodal model.** How much does it improve diagnosis on handwritten and spoken work?

We are looking for:

- **Pilot schools** in grades 8–12 mathematics and physical science for the 2027–28 school year;
- **Learning scientists and teachers** to review the prerequisite graph and the evaluation design;
- **Research partners** for the multimodal model.

To get involved, contact Kofi Obo Wood through the Treo website.

## About the author

Kofi Obo Wood is a technical product manager and AI engineer who builds AI learning systems. He holds an M.S. in User Experience from Arizona State University and a B.Sc. in Mechanical Engineering from Kwame Nkrumah University of Science and Technology. He has worked on:

- AI learning platforms used at institutional scale;
- AI avatar simulations for professional education;
- an AI leadership simulation for professional military education;
- an enterprise retrieval-augmented knowledge assistant.

He contributed to *Future-Proofing Human Flourishing: The Case for a Learning Sciences Benchmark for AI* [18]. Treo is an independent project.

## References

[1] National Center for Education Statistics. *2024 NAEP Mathematics Assessment, Grade 12 results* (released September 9, 2025). <https://www.nationsreportcard.gov/reports/mathematics/2024/g12/>

[2] National Center for Education Statistics. "Most U.S. Public Elementary and Secondary Schools Faced Hiring Challenges for the Start of the 2024–25 Academic Year." Press release, October 17, 2024. <https://nces.ed.gov/learn/press-release/most-u-s-public-elementary-and-secondary-schools-faced-hiring-challenges-start-2024-25-academic-year>

[3] National Center for Education Statistics. "Public School Leaders Report No Overall Change in the Number of Teaching Positions Since Last School Year." Press release, December 12, 2024. <https://nces.ed.gov/learn/press-release/public-school-leaders-reports-suggest-no-overall-change-number-teaching-positions-last-school-year>

[4] Bloom, B. S. (1984). The 2 sigma problem: The search for methods of group instruction as effective as one-to-one tutoring. *Educational Researcher*, 13(6), 4–16.

[5] VanLehn, K. (2011). The relative effectiveness of human tutoring, intelligent tutoring systems, and other tutoring systems. *Educational Psychologist*, 46(4), 197–221.

[6] Pane, J. F., Griffin, B. A., McCaffrey, D. F., & Karam, R. (2014). Effectiveness of Cognitive Tutor Algebra I at scale. *Educational Evaluation and Policy Analysis*, 36(2), 127–144.

[7] Bastani, H., Bastani, O., Sungu, A., Ge, H., Kabakcı, Ö., & Mariman, R. (2025). Generative AI without guardrails can harm learning: Evidence from high school mathematics. *Proceedings of the National Academy of Sciences*, 122(26), e2422633122. <https://doi.org/10.1073/pnas.2422633122>

[8] Kestin, G., Miller, K., Klales, A., Milbourne, T., & Ponti, G. (2025). AI tutoring outperforms in-class active learning: An RCT introducing a novel research-based design in an authentic educational setting. *Scientific Reports*, 15, 17458. <https://doi.org/10.1038/s41598-025-97652-6>

[9] Wang, R. E., Ribeiro, A. T., Robinson, C. D., Loeb, S., & Demszky, D. (2025). Tutor CoPilot: A human-AI approach for scaling real-time expertise. <https://arxiv.org/abs/2410.03017>

[10] Gallup and the Walton Family Foundation. "Teachers Using AI Tools Save Hours a Week." June 24, 2025. <https://news.gallup.com/poll/691967/teachers-using-ai-tools-save-hours-week.aspx>

[11] Bergman, P., & Chan, E. W. (2021). Leveraging parents through low-cost technology: The impact of high-frequency information on student achievement. *Journal of Human Resources*, 56(1), 125–158. <https://doi.org/10.3368/jhr.56.1.1118-9837R1>

[12] Kapur, M. (2016). Examining productive failure, productive success, unproductive failure, and unproductive success in learning. *Educational Psychologist*, 51(2), 289–299.

[13] Corbett, A. T., & Anderson, J. R. (1994). Knowledge tracing: Modeling the acquisition of procedural knowledge. *User Modeling and User-Adapted Interaction*, 4(4), 253–278.

[14] Hattie, J., & Timperley, H. (2007). The power of feedback. *Review of Educational Research*, 77(1), 81–112.

[15] Marble (Generative Spark, Inc.). *os-taxonomy* v1: an open graph of primary-years learning. ODbL 1.0 (database) and CC BY-SA 4.0 (content). <https://github.com/withmarbleapp/os-taxonomy>

[16] HKUDS. *DeepTutor*: lifelong personalized tutoring. Apache-2.0. <https://github.com/HKUDS/DeepTutor>

[17] Wood, K. O. *Beyond the Word: A Research Proposal for Perceptual AI via Self-Supervised Audio-Visual Learning.* White paper, 2025.

[18] EDSAFE AI Alliance and Arizona State University Mary Lou Fulton College for Teaching and Learning Innovation. *Future-Proofing Human Flourishing: The Case for a Learning Sciences Benchmark for AI.* <https://www.edsafeai.org/future-proofing-human-flourishing>

[19] Federal Trade Commission. Amendments to the Children's Online Privacy Protection Rule (published April 22, 2025; effective June 23, 2025; compliance by April 22, 2026).

[20] U.S. Department of Education. Guidance on the use of federal grant funds to improve education outcomes using AI, July 22, 2025. <https://www.ed.gov/about/news/press-release/us-department-of-education-issues-guidance-artificial-intelligence-use-schools-proposes-additional-supplemental-priority>

[21] National Center for Education Statistics. Common Core of Data, 2023–24 summary tables. <https://nces.ed.gov/ccd/tables/202324_summary_2.asp>

[22] U.S. Department of Education. "Final Priority and Definitions—Advancing Artificial Intelligence in Education." FR Doc. 2026-07087 (April 13, 2026). <https://public-inspection.federalregister.gov/2026-07087.pdf>

[23] Holland & Knight. "Education Freedom Tax Credit to Take Effect in 2027." August 21, 2026 (summary of IRC §25F). <https://www.hklaw.com/en/insights/publications/2026/08/education-freedom-tax-credit-to-take-effect-in-2027>

[24] Executive Order 14277, "Advancing Artificial Intelligence Education for American Youth." 90 Fed. Reg. 17519 (April 28, 2025). <https://www.govinfo.gov/content/pkg/FR-2025-04-28/html/2025-07368.htm>
