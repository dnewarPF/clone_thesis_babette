import React, {useMemo, useState} from "react";
import styled from "styled-components";
import {Link, useLocation, useNavigate} from "react-router-dom";
import {supabase} from "../../utils/supabaseClient";

const Page = styled.main`
    min-height: 100vh;
    background: radial-gradient(circle at top, rgba(32, 32, 32, 0.75), #060606 65%);
    color: #ffffff;
    display: flex;
    justify-content: center;
    padding: clamp(2rem, 6vw, 5rem);
`;

const Wrapper = styled.section`
    width: 100%;
    max-width: 860px;
    background: rgba(12, 12, 12, 0.92);
    border-radius: 24px;
    padding: clamp(2rem, 4vw, 3.5rem);
    box-shadow: 0 24px 48px rgba(0, 0, 0, 0.45);
    display: grid;
    gap: 1.75rem;
`;

const Title = styled.h1`
    margin: 0;
    font-size: clamp(2rem, 4vw, 3rem);
    font-weight: 700;
`;

const Paragraph = styled.p`
    margin: 0;
    font-size: 1.05rem;
    line-height: 1.6rem;
    color: #dddddd;
`;

const SummaryList = styled.ul`
    margin: 0;
    padding-left: 1.25rem;
    display: grid;
    gap: 0.65rem;
    font-size: 0.95rem;
    color: #cfcfcf;
`;

const Form = styled.form`
    display: grid;
    gap: 1.5rem;
`;

const QuestionGroup = styled.div`
    display: grid;
    gap: 0.8rem;
`;

const QuestionLabel = styled.label`
    font-weight: 600;
    font-size: 1rem;
    color: #f1f1f1;
`;

const RadioGroup = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
`;

const RadioOption = styled.label`
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.45rem 0.9rem;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.08);
    cursor: pointer;
    transition: background 0.2s ease, transform 0.2s ease;

    &:hover {
        background: rgba(255, 255, 255, 0.12);
        transform: translateY(-1px);
    }

    input {
        accent-color: #e50914;
        cursor: pointer;
    }
`;

const TextArea = styled.textarea`
    width: 100%;
    min-height: 140px;
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.14);
    background: rgba(8, 8, 8, 0.7);
    color: #ffffff;
    padding: 0.9rem 1rem;
    resize: vertical;
    font-size: 0.95rem;
    line-height: 1.5rem;

    &:focus-visible {
        outline: 2px solid #e50914;
        outline-offset: 2px;
    }
`;

const SubmitRow = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1rem;
`;

const Actions = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    align-items: center;
`;

const SubmitButton = styled.button`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.85rem 2.4rem;
    border-radius: 999px;
    border: none;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    cursor: pointer;
    background: ${({disabled}) => (disabled ? "#3f3f3f" : "#e50914")};
    color: ${({disabled}) => (disabled ? "#9f9f9f" : "#0b0b0b")};
    transition: transform 0.2s ease, background 0.2s ease;

    &:hover {
        transform: ${({disabled}) => (disabled ? "none" : "translateY(-3px)")};
        background: ${({disabled}) => (disabled ? "#3f3f3f" : "#f6121d")};
    }

    &:focus-visible {
        outline: 3px solid #ffffff;
        outline-offset: 4px;
    }
`;

const SecondaryLink = styled(Link)`
    font-size: 0.9rem;
    color: #9f9f9f;
    text-decoration: underline;

    &:hover {
        color: #ffffff;
    }
`;

const RestartButton = styled.button`
    background: none;
    border: none;
    font-size: 0.9rem;
    color: #9f9f9f;
    text-decoration: underline;
    cursor: pointer;
    padding: 0;

    &:hover {
        color: #ffffff;
    }

    &:focus-visible {
        outline: 2px solid #ffffff;
        outline-offset: 3px;
    }
`;

const ErrorMessage = styled.div`
    padding: 0.75rem 1rem;
    border-radius: 10px;
    background: rgba(229, 9, 20, 0.2);
    border: 1px solid rgba(229, 9, 20, 0.5);
    color: #ffe0e0;
    font-size: 0.9rem;
`;

const SuccessMessage = styled.div`
    padding: 0.75rem 1rem;
    border-radius: 10px;
    background: rgba(22, 163, 74, 0.2);
    border: 1px solid rgba(22, 163, 74, 0.4);
    color: #d1f5dc;
    font-size: 0.9rem;
`;

const InfoMessage = styled.div`
    padding: 0.75rem 1rem;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: #f3f3f3;
    font-size: 0.9rem;
`;

const Required = styled.span`
    color: #e50914;
`;

const likertScale = [
    {value: "1", label: "1"},
    {value: "2", label: "2"},
    {value: "3", label: "3"},
    {value: "4", label: "4"},
    {value: "5", label: "5"}
];

const infoOptions = [
    {value: "preview", label: "Video preview"},
    {value: "ratings", label: "Ratings"},
    {value: "adjectives", label: "Keywords"},
    {value: "none", label: "Something else"}
];

function Questionnaire() {
    const location = useLocation();
    const navigate = useNavigate();
    const selections = location.state?.selections ?? [];
    const sessionId = location.state?.sessionId ?? null;
    const participantPid = location.state?.pid ?? null;

    const sortedSelections = useMemo(
        () =>
            selections
                .slice()
                .sort((a, b) => a.round - b.round)
                .map((entry) => ({
                    ...entry,
                    displayRound: entry.round + 1
                })),
        [selections]
    );

    const [answers, setAnswers] = useState({
        satisfaction: "",
        easeOfUse: "",
        infoClarity: "",
        mostHelpful: "",
        additionalFeedback: ""
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    const handleRestart = () => {
        navigate("/");
    };

    const handleRadioChange = (field) => (event) => {
        const value = event.target.value;
        setAnswers((prev) => ({...prev, [field]: value}));
    };

    const handleTextChange = (event) => {
        const {name, value} = event.target;
        setAnswers((prev) => ({...prev, [name]: value}));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!sessionId) {
            setSubmitError("Session information is missing. Please restart the experiment.");
            return;
        }

        const requiredFields = ["satisfaction", "easeOfUse", "infoClarity", "mostHelpful"];
        const missing = requiredFields.filter((field) => !answers[field]);
        if (missing.length) {
            setSubmitError("Please answer all required questions before submitting.");
            return;
        }

        try {
            setIsSubmitting(true);
            setSubmitError(null);

            const {data: sessionData, error: sessionError} = await supabase
                .from("sessions")
                .select("id, participant_id")
                .eq("id", sessionId)
                .single();

            if (sessionError || !sessionData?.participant_id) {
                throw sessionError || new Error("No participant linked to this session.");
            }

            const selectionSummary = sortedSelections.map((entry) => ({
                round: entry.displayRound,
                movieId: entry.movieId,
                title: entry.title,
                decisionTimeSeconds: entry.decisionTimeSeconds
            }));
            const totalDecisionTimeSeconds = selectionSummary.reduce(
                (total, entry) => total + (entry.decisionTimeSeconds ?? 0),
                0
            );

            const answersPayload = {
                satisfaction: Number(answers.satisfaction),
                easeOfUse: Number(answers.easeOfUse),
                infoClarity: Number(answers.infoClarity),
                mostHelpful: answers.mostHelpful,
                additionalFeedback: answers.additionalFeedback.trim() || null,
                sessionId,
                selectionSummary,
                totalDecisionTimeSeconds
            };

            const {error: insertError} = await supabase.from("questionnaires").insert([
                {
                    participant_id: sessionData.participant_id,
                    answers_json: answersPayload
                }
            ]);

            if (insertError) {
                throw insertError;
            }

            setSubmitSuccess(true);
            navigate("/completion", {
                replace: true,
                state: {
                    pid: participantPid ?? null,
                    roundsCompleted: sortedSelections.length || null,
                    totalDecisionTimeSeconds
                }
            });
        } catch (err) {
            console.error("Failed to save questionnaire responses", err);
            setSubmitError("We could not save your answers. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const formDisabled = isSubmitting || submitSuccess || !sessionId;

    return (
        <Page>
            <Wrapper>
                <Title>Thank you for completing the experiment</Title>
                <Paragraph>
                    We appreciate your participation. Please answer the short questionnaire below so we can understand
                    how the different variables affected your choices.
                </Paragraph>
                {sortedSelections.length ? (
                    <>
                        <Paragraph><strong>Summary of your choices:</strong></Paragraph>
                        <SummaryList>
                            {sortedSelections.map((entry) => (
                                <li key={entry.round}>
                                    Round {entry.displayRound}: {entry.title} - {entry.decisionTimeSeconds}s
                                </li>
                            ))}
                        </SummaryList>
                    </>
                ) : (
                    <Paragraph>
                        We could not retrieve any choices. This page might have been opened directly. If you would like to
                        run the experiment again, please return to the start screen.
                    </Paragraph>
                )}

                {!sessionId ? (
                    <InfoMessage role="alert">
                        Session information is missing, so answers cannot be saved. Please restart the experiment to
                        submit the questionnaire.
                    </InfoMessage>
                ) : null}

                <Form onSubmit={handleSubmit}>
                    <QuestionGroup>
                        <QuestionLabel>
                            How satisfied were you with the overall experiment experience? <Required>*</Required>
                        </QuestionLabel>
                        <RadioGroup>
                            {likertScale.map((option) => (
                                <RadioOption key={`satisfaction-${option.value}`}>
                                    <input
                                        type="radio"
                                        name="satisfaction"
                                        value={option.value}
                                        checked={answers.satisfaction === option.value}
                                        onChange={handleRadioChange("satisfaction")}
                                        disabled={formDisabled}
                                    />
                                    <span>{option.label}</span>
                                </RadioOption>
                            ))}
                        </RadioGroup>
                    </QuestionGroup>

                    <QuestionGroup>
                        <QuestionLabel>
                            How easy was it to choose a movie in each round? <Required>*</Required>
                        </QuestionLabel>
                        <RadioGroup>
                            {likertScale.map((option) => (
                                <RadioOption key={`ease-${option.value}`}>
                                    <input
                                        type="radio"
                                        name="easeOfUse"
                                        value={option.value}
                                        checked={answers.easeOfUse === option.value}
                                        onChange={handleRadioChange("easeOfUse")}
                                        disabled={formDisabled}
                                    />
                                    <span>{option.label}</span>
                                </RadioOption>
                            ))}
                        </RadioGroup>
                    </QuestionGroup>

                    <QuestionGroup>
                        <QuestionLabel>
                            How clear was the information presented for each movie? <Required>*</Required>
                        </QuestionLabel>
                        <RadioGroup>
                            {likertScale.map((option) => (
                                <RadioOption key={`clarity-${option.value}`}>
                                    <input
                                        type="radio"
                                        name="infoClarity"
                                        value={option.value}
                                        checked={answers.infoClarity === option.value}
                                        onChange={handleRadioChange("infoClarity")}
                                        disabled={formDisabled}
                                    />
                                    <span>{option.label}</span>
                                </RadioOption>
                            ))}
                        </RadioGroup>
                    </QuestionGroup>

                    <QuestionGroup>
                        <QuestionLabel>
                            Which element influenced your decision the most? <Required>*</Required>
                        </QuestionLabel>
                        <RadioGroup>
                            {infoOptions.map((option) => (
                                <RadioOption key={`most-${option.value}`}>
                                    <input
                                        type="radio"
                                        name="mostHelpful"
                                        value={option.value}
                                        checked={answers.mostHelpful === option.value}
                                        onChange={handleRadioChange("mostHelpful")}
                                        disabled={formDisabled}
                                    />
                                    <span>{option.label}</span>
                                </RadioOption>
                            ))}
                        </RadioGroup>
                    </QuestionGroup>

                    <QuestionGroup>
                        <QuestionLabel>Do you have any additional feedback?</QuestionLabel>
                        <TextArea
                            name="additionalFeedback"
                            value={answers.additionalFeedback}
                            onChange={handleTextChange}
                            placeholder="Share anything that stood out to you, or suggestions for improvement."
                            disabled={formDisabled}
                        />
                    </QuestionGroup>

                    <SubmitRow>
                        {submitError ? <ErrorMessage role="alert">{submitError}</ErrorMessage> : null}
                        {submitSuccess ? (
                            <SuccessMessage role="status">
                                Thank you! We have saved your questionnaire responses.
                            </SuccessMessage>
                        ) : null}
                        <Actions>
                            <SubmitButton type="submit" disabled={formDisabled}>
                                {submitSuccess ? "Submitted" : isSubmitting ? "Saving..." : "Submit questionnaire"}
                            </SubmitButton>
                            <SecondaryLink to="/">Back to start</SecondaryLink>
                            <RestartButton type="button" onClick={handleRestart}>
                                Restart experiment
                            </RestartButton>
                        </Actions>
                    </SubmitRow>
                </Form>
            </Wrapper>
        </Page>
    );
}

export default Questionnaire;
