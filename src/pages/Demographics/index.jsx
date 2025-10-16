import React, {useEffect, useMemo, useState} from "react";
import styled from "styled-components";
import {useNavigate} from "react-router-dom";
import {supabase} from "../../utils/supabaseClient";

const Page = styled.main`
    min-height: 100vh;
    background: #050505;
    color: #ffffff;
    display: flex;
    justify-content: center;
    padding: clamp(2rem, 6vw, 5rem);
`;

const Wrapper = styled.section`
    width: 100%;
    max-width: 720px;
    background: rgba(16, 16, 16, 0.92);
    border-radius: 22px;
    padding: clamp(2rem, 4vw, 3.5rem);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
    display: grid;
    gap: 1.75rem;
`;

const Title = styled.h1`
    margin: 0;
    font-size: clamp(2rem, 3.5vw, 2.8rem);
    font-weight: 700;
`;

const Paragraph = styled.p`
    margin: 0;
    font-size: 1.05rem;
    line-height: 1.65rem;
    color: #dddddd;
`;

const QuestionnaireCard = styled.section`
    padding: 1.5rem clamp(1.5rem, 3vw, 2.25rem);
    border-radius: 18px;
    background: rgba(12, 12, 12, 0.9);
    border: 1px solid rgba(255, 255, 255, 0.08);
    display: grid;
    gap: 1.4rem;
`;

const QuestionsGrid = styled.div`
    display: grid;
    gap: 1.2rem;
`;

const FieldGroup = styled.div`
    display: grid;
    gap: 0.55rem;
`;

const FieldLabel = styled.label`
    font-size: 0.95rem;
    font-weight: 500;
    color: #f3f3f3;
    display: flex;
    align-items: center;
    gap: 0.35rem;
`;

const Required = styled.span`
    color: #e50914;
`;

const TextInput = styled.input`
    width: 100%;
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.14);
    background: rgba(10, 10, 10, 0.74);
    color: #ffffff;
    padding: 0.75rem 0.9rem;
    font-size: 0.95rem;

    &:focus-visible {
        outline: 2px solid #e50914;
        outline-offset: 2px;
    }

    &[aria-invalid="true"] {
        border-color: rgba(229, 9, 20, 0.6);
        box-shadow: 0 0 0 1px rgba(229, 9, 20, 0.25);
    }
`;

const SelectInput = styled.select`
    width: 100%;
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.14);
    background: rgba(10, 10, 10, 0.74);
    color: #ffffff;
    padding: 0.75rem 0.9rem;
    font-size: 0.95rem;
    appearance: none;

    &:focus-visible {
        outline: 2px solid #e50914;
        outline-offset: 2px;
    }

    &[aria-invalid="true"] {
        border-color: rgba(229, 9, 20, 0.6);
        box-shadow: 0 0 0 1px rgba(229, 9, 20, 0.25);
    }
`;

const HelperText = styled.span`
    font-size: 0.85rem;
    color: #bdbdbd;
`;

const FeedbackMessage = styled.div`
    margin-top: 0.25rem;
    padding: 0.75rem 0.95rem;
    border-radius: 12px;
    font-size: 0.9rem;
    line-height: 1.5;
    background: ${({variant}) =>
        variant === "error" ? "rgba(229, 9, 20, 0.18)" : "rgba(22, 163, 74, 0.18)"};
    border: 1px solid
        ${({variant}) =>
            variant === "error" ? "rgba(229, 9, 20, 0.45)" : "rgba(22, 163, 74, 0.45)"};
    color: ${({variant}) => (variant === "error" ? "#ffd6d6" : "#dcfce7")};
`;

const ButtonRow = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 0.85rem;
    align-items: center;
`;

const PrimaryButton = styled.button`
    padding: 0.85rem 2.4rem;
    border-radius: 999px;
    border: none;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    cursor: pointer;
    background: #e50914;
    color: #0b0b0b;
    transition: transform 0.2s ease, background 0.2s ease;

    &:hover {
        transform: translateY(-3px);
        background: #f6121d;
    }

    &:focus-visible {
        outline: 3px solid #ffffff;
        outline-offset: 4px;
    }

    &:disabled {
        background: #3a3a3a;
        color: #b7b7b7;
        cursor: not-allowed;
        transform: none;
    }
`;

const SecondaryButton = styled.button`
    padding: 0.85rem 2rem;
    border-radius: 999px;
    border: 1px solid rgba(255, 255, 255, 0.25);
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    cursor: pointer;
    background: transparent;
    color: #f5f5f5;
    transition: background 0.2s ease, color 0.2s ease;

    &:hover {
        background: rgba(255, 255, 255, 0.12);
        color: #ffffff;
    }

    &:focus-visible {
        outline: 3px solid #ffffff;
        outline-offset: 4px;
    }
`;

function Demographics() {
    const navigate = useNavigate();
    const [age, setAge] = useState("");
    const [gender, setGender] = useState("");
    const [origin, setOrigin] = useState("");
    const [experience, setExperience] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [participantPid, setParticipantPid] = useState(null);
    const [demographicsId, setDemographicsId] = useState(null);
    const [touched, setTouched] = useState(false);

    useEffect(() => {
        if (typeof window === "undefined") {
            return;
        }

        try {
            const storedAnswers = sessionStorage.getItem("demographicsAnswers");
            const storedPid = sessionStorage.getItem("participantPid");
            const storedDemographicsId = sessionStorage.getItem("demographicsId");

            if (storedPid) {
                setParticipantPid(storedPid);
            }

            if (storedDemographicsId) {
                setDemographicsId(storedDemographicsId);
            }

            if (storedAnswers) {
                const parsed = JSON.parse(storedAnswers);
                if (parsed?.age) {
                    setAge(String(parsed.age));
                }
                if (parsed?.gender) {
                    setGender(parsed.gender);
                }
                if (parsed?.origin) {
                    setOrigin(parsed.origin);
                }
                if (parsed?.experience) {
                    setExperience(parsed.experience);
                }
                setHasSubmitted(true);
            }
        } catch (storageError) {
            console.warn("Unable to restore stored demographics answers", storageError);
        }
    }, []);

    const genderOptions = useMemo(
        () => [
            {value: "", label: "Select an option"},
            {value: "female", label: "Female"},
            {value: "male", label: "Male"},
            {value: "non_binary", label: "Non-binary / Other"},
            {value: "prefer_not_to_say", label: "Prefer not to say"}
        ],
        []
    );

    const experienceOptions = useMemo(
        () => [
            {value: "", label: "Select an option"},
            {value: "none", label: "Never used"},
            {value: "limited", label: "Occasionally"},
            {value: "regular", label: "Regularly"},
            {value: "expert", label: "Daily / expert"}
        ],
        []
    );

    const isFormValid =
        age.trim() !== "" && gender !== "" && origin.trim() !== "" && experience !== "";

    const navigateToInstructions = (pid, demographicsRecordId) => {
        navigate("/instructions", {
            state: {pid, demographicsId: demographicsRecordId ?? null, from: "demographics"}
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setTouched(true);
        setSubmitError(null);

        if (!isFormValid && !(hasSubmitted && participantPid)) {
            setSubmitError("Please complete all required questions before continuing.");
            return;
        }

        if (hasSubmitted && participantPid) {
            navigateToInstructions(participantPid, demographicsId);
            return;
        }

        setIsSubmitting(true);

        const pid =
            participantPid ??
            (crypto.randomUUID?.() ??
                `participant-${Date.now()}-${Math.random().toString(16).slice(2)}`);

        const payload = {
            pid,
            age: Number(age),
            gender,
            origin: origin.trim(),
            experience,
            user_agent: typeof navigator !== "undefined" ? navigator.userAgent : "unknown"
        };

        try {
            const {data, error} = await supabase.from("demographics").insert([payload]).select().single();

            if (error) {
                throw error;
            }

            if (typeof window !== "undefined") {
                sessionStorage.setItem(
                    "demographicsAnswers",
                    JSON.stringify({
                        age: payload.age,
                        gender: payload.gender,
                        origin: payload.origin,
                        experience: payload.experience
                    })
                );
                sessionStorage.setItem("participantPid", pid);
                if (data?.id) {
                    sessionStorage.setItem("demographicsId", String(data.id));
                }
            }

            setParticipantPid(pid);
            setDemographicsId(data?.id ?? null);
            setHasSubmitted(true);
            setIsSubmitting(false);

            navigateToInstructions(pid, data?.id ?? null);
        } catch (err) {
            console.error("Failed to store demographics questionnaire", err);
            const supabaseMessage =
                err?.message || err?.error_description || err?.details || err?.hint || null;
            setSubmitError(
                supabaseMessage
                    ? `Saving the questionnaire failed: ${supabaseMessage}`
                    : "Saving the questionnaire failed. Please check your connection and try again."
            );
            setIsSubmitting(false);
        }
    };

    return (
        <Page>
            <Wrapper as="form" onSubmit={handleSubmit} noValidate>
                <div>
                    <Title>Demographic information</Title>
                    <Paragraph>
                        Before we begin, please answer a few background questions. Your responses are stored anonymously
                        and only used to interpret the experiment results.
                    </Paragraph>
                </div>

                <QuestionnaireCard>
                    <QuestionsGrid>
                        <FieldGroup>
                            <FieldLabel htmlFor="age">
                                Age<Required>*</Required>
                            </FieldLabel>
                            <TextInput
                                id="age"
                                type="number"
                                inputMode="numeric"
                                min="10"
                                max="120"
                                placeholder="e.g., 28"
                                value={age}
                                onChange={(event) => {
                                    setAge(event.target.value);
                                    if (submitError) {
                                        setSubmitError(null);
                                    }
                                }}
                                aria-invalid={touched && age.trim() === ""}
                            />
                            <HelperText>Enter your age in years.</HelperText>
                        </FieldGroup>
                        <FieldGroup>
                            <FieldLabel htmlFor="gender">
                                Gender<Required>*</Required>
                            </FieldLabel>
                            <SelectInput
                                id="gender"
                                value={gender}
                                onChange={(event) => {
                                    setGender(event.target.value);
                                    if (submitError) {
                                        setSubmitError(null);
                                    }
                                }}
                                aria-invalid={touched && gender === ""}
                            >
                                {genderOptions.map((option) => (
                                    <option key={option.value || "placeholder"} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </SelectInput>
                        </FieldGroup>
                        <FieldGroup>
                            <FieldLabel htmlFor="origin">
                                Background<Required>*</Required>
                            </FieldLabel>
                            <TextInput
                                id="origin"
                                type="text"
                                placeholder="e.g., Dutch, Turkish, Surinamese..."
                                value={origin}
                                onChange={(event) => {
                                    setOrigin(event.target.value);
                                    if (submitError) {
                                        setSubmitError(null);
                                    }
                                }}
                                aria-invalid={touched && origin.trim() === ""}
                            />
                            <HelperText>Your cultural or ethnic background, in your own words.</HelperText>
                        </FieldGroup>
                        <FieldGroup>
                            <FieldLabel htmlFor="experience">
                                Experience with streaming platforms<Required>*</Required>
                            </FieldLabel>
                            <SelectInput
                                id="experience"
                                value={experience}
                                onChange={(event) => {
                                    setExperience(event.target.value);
                                    if (submitError) {
                                        setSubmitError(null);
                                    }
                                }}
                                aria-invalid={touched && experience === ""}
                            >
                                {experienceOptions.map((option) => (
                                    <option key={option.value || "placeholder"} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </SelectInput>
                        </FieldGroup>
                    </QuestionsGrid>

                    {submitError ? (
                        <FeedbackMessage role="alert" variant="error">
                            {submitError}
                        </FeedbackMessage>
                    ) : (
                        hasSubmitted &&
                        !isSubmitting && (
                            <FeedbackMessage variant="success">
                                Your answers have been saved. You can continue to the instructions.
                            </FeedbackMessage>
                        )
                    )}
                </QuestionnaireCard>

                <ButtonRow>
                    <PrimaryButton
                        type="submit"
                        disabled={isSubmitting || (!hasSubmitted && !isFormValid)}
                    >
                        {isSubmitting ? "Saving..." : "Continue to instructions"}
                    </PrimaryButton>
                    <SecondaryButton type="button" onClick={() => navigate("/consent")} disabled={isSubmitting}>
                        Back to consent
                    </SecondaryButton>
                </ButtonRow>
            </Wrapper>
        </Page>
    );
}

export default Demographics;
