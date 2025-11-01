import React, {useEffect, useMemo, useState} from "react";
import styled from "styled-components";
import {useNavigate} from "react-router-dom";
import {supabase} from "../../utils/supabaseClient";
import {useExperimentPreload} from "../../utils/hooks/useExperimentPreload";

const Page = styled.main`
    min-height: 100vh;
    background: #000000;
    color: #ffffff;
    display: flex;
    justify-content: center;
    padding: clamp(2rem, 6vw, 5rem);
`;

const Wrapper = styled.section`
    width: 100%;
    max-width: 720px;
    display: grid;
    gap: clamp(0.6rem, 2.5vw, 0.9rem);
`;

const Title = styled.h1`
    margin: 0;
    font-size: clamp(2rem, 3.5vw, 2.8rem);
    font-weight: 700;
`;

const FormSection = styled.section`
    display: grid;
    gap: clamp(0.85rem, 2vw, 1.05rem);
    width: 100%;
    margin-top: -0.6rem;
`;

const QuestionsGrid = styled.div`
    display: grid;
    gap: 0.9rem;
    width: 100%;
`;

const FieldGroup = styled.div`
    display: grid;
    gap: 0.55rem;
    width: 100%;
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
    padding: 0.85rem 1rem;
    font-size: 0.95rem;
    min-height: 3.1rem;
    box-sizing: border-box;

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
    padding: 0.85rem 2.4rem 0.85rem 1rem;
    font-size: 0.95rem;
    min-height: 3.1rem;
    box-sizing: border-box;
    appearance: none;
    background-image: linear-gradient(45deg, transparent 50%, #ffffff 50%), linear-gradient(135deg, #ffffff 50%, transparent 50%);
    background-position: calc(100% - 1.3rem) center, calc(100% - 0.9rem) center;
    background-size: 0.55rem 0.55rem, 0.55rem 0.55rem;
    background-repeat: no-repeat;

    &:focus-visible {
        outline: 2px solid #e50914;
        outline-offset: 2px;
    }

    &[aria-invalid="true"] {
        border-color: rgba(229, 9, 20, 0.6);
        box-shadow: 0 0 0 1px rgba(229, 9, 20, 0.25);
    }
`;

const InlineError = styled.span`
    font-size: 0.85rem;
    color: #ffb3b3;
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
    gap: 1rem;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    margin-top: -0.3rem;
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
    margin-left: auto;

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
    useExperimentPreload();
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
            {value: "lt-3", label: "Less than 3 hours per week"},
            {value: "3-6", label: "Between 3 and 6 hours per week"},
            {value: "6-9", label: "Between 6 and 9 hours per week"},
            {value: "9-12", label: "Between 9 and 12 hours per week"},
            {value: "gt-12", label: "More than 12 hours per week"}
        ],
        []
    );

    const ageNumber = Number(age);
    const hasAgeValue = age.trim() !== "";
    const isAgeNumeric = hasAgeValue && !Number.isNaN(ageNumber);
    const ageBelowMinimum = isAgeNumeric && ageNumber < 18;
    const ageAboveMaximum = isAgeNumeric && ageNumber > 100;
    const ageError = (() => {
        if (!hasAgeValue) {
            return "Please enter your age.";
        }
        if (!isAgeNumeric) {
            return "Please enter a numeric age.";
        }
        if (ageBelowMinimum) {
            return "You must be at least 18 years old to participate.";
        }
        if (ageAboveMaximum) {
            return "Please double-check your age.";
        }
        return null;
    })();
    const isAgeValid = ageError === null;
    const otherFieldsComplete = gender !== "" && origin.trim() !== "" && experience !== "";
    const showAgeError = Boolean(ageError) && (hasAgeValue || touched);
    const isFormValid = isAgeValid && otherFieldsComplete;

    const navigateToInstructions = (pid, demographicsRecordId) => {
        navigate("/instructions", {
            state: {pid, demographicsId: demographicsRecordId ?? null, from: "demographics"}
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setTouched(true);
        setSubmitError(null);

        if (!(hasSubmitted && participantPid)) {
            if (!isAgeValid) {
                setSubmitError(ageError ?? "Please verify your age (18-100)." );
                return;
            }
            if (!otherFieldsComplete) {
                setSubmitError("Please complete all required questions before continuing.");
                return;
            }
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
                <Title>Demographic information</Title>

                <FormSection>
                    <QuestionsGrid>
                        <FieldGroup>
                            <FieldLabel htmlFor="age">
                                What is your age?<Required>*</Required>
                            </FieldLabel>
                            <TextInput
                                id="age"
                                type="number"
                                inputMode="numeric"
                                min="18"
                                max="100"
                                placeholder="e.g., 28"
                                value={age}
                                onChange={(event) => {
                                    setAge(event.target.value);
                                    if (submitError) {
                                        setSubmitError(null);
                                    }
                                }}
                                aria-invalid={showAgeError}
                            />
                            {showAgeError ? (
                                <InlineError role="alert">{ageError}</InlineError>
                            ) : null}
                        </FieldGroup>
                        <FieldGroup>
                            <FieldLabel htmlFor="gender">
                                What is your gender?<Required>*</Required>
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
                                What is your nationality?<Required>*</Required>
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
                        </FieldGroup>
                        <FieldGroup>
                            <FieldLabel htmlFor="experience">
                                How many hours per week do you spend using streaming platforms on average?<Required>*</Required>
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
                </FormSection>

                <ButtonRow>
                    <SecondaryButton type="button" onClick={() => navigate("/consent")} disabled={isSubmitting}>
                        Go back to consent
                    </SecondaryButton>
                    <PrimaryButton
                        type="submit"
                        disabled={isSubmitting || (!hasSubmitted && !isFormValid)}
                    >
                        {isSubmitting ? "Saving..." : "Continue to instructions"}
                    </PrimaryButton>
                </ButtonRow>
            </Wrapper>
        </Page>
    );
}

export default Demographics;
