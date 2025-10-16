import React, {useEffect, useMemo, useState} from "react";
import styled from "styled-components";
import {Loader} from "../../utils/style/Atoms";
import {useExperimentRounds} from "../../utils/hooks/useExperimentRounds";
import ExperimentRound from "../../components/ExperimentRound";
import {useNavigate} from "react-router-dom";
import {supabase} from "../../utils/supabaseClient";

const Page = styled.main`
    min-height: 100vh;
    background: #040404;
    color: #ffffff;
    padding: clamp(1.5rem, 4vw, 4rem);
    padding-bottom: clamp(6rem, 12vh, 8rem);
`;

const Header = styled.header`
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    margin-bottom: 2.5rem;
`;

const RoundTitle = styled.h1`
    margin: 0;
    font-size: clamp(1.8rem, 3vw, 2.6rem);
    font-weight: 700;
`;

const RoundSummary = styled.p`
    margin: 0;
    color: #d0d0d0;
    font-size: 0.95rem;
    max-width: 760px;
    line-height: 1.5rem;
`;

const ControlButton = styled.button`
    padding: 0.65rem 1.5rem;
    border-radius: 10px;
    border: none;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    cursor: pointer;
    background: ${({primary}) => (primary ? "#e50914" : "#1f1f1f")};
    color: ${({primary}) => (primary ? "#0b0b0b" : "#f5f5f5")};
    opacity: ${({disabled}) => (disabled ? 0.45 : 1)};
    transition: transform 0.2s ease, background 0.2s ease;

    &:hover {
        transform: translateY(-2px);
        background: ${({primary}) => (primary ? "#f6121d" : "#2e2e2e")};
    }

    &:focus-visible {
        outline: 2px solid #ffffff;
        outline-offset: 2px;
    }

    &:disabled {
        cursor: not-allowed;
        transform: none;
        background: ${({primary}) => (primary ? "#3f3f3f" : "#2a2a2a")};
        color: #9c9c9c;
    }
`;

const FooterBar = styled.footer`
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(8, 8, 8, 0.96);
    border-top: 1px solid rgba(255, 255, 255, 0.12);
    padding: 1rem clamp(1.5rem, 4vw, 3rem);
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    z-index: 1000;
`;

const FooterActions = styled.div`
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
`;

const FooterMessage = styled.span`
    font-size: 0.9rem;
    color: #d9d9d9;
    letter-spacing: 0.04em;
`;

const LoaderWrapper = styled.div`
    display: flex;
    justify-content: center;
    padding: 3rem 0;
`;

const SelectionNotice = styled.div`
    margin: 1.5rem 0 0;
    padding: 1rem 1.25rem;
    border-radius: 12px;
    background: rgba(229, 9, 20, 0.15);
    border: 1px solid rgba(229, 9, 20, 0.35);
    color: #ffeaea;
    max-width: 520px;
    font-size: 0.9rem;
    line-height: 1.4rem;
`;

const FeedbackCard = styled.section`
    margin-top: 1.5rem;
    padding: 1.5rem 1.75rem;
    border-radius: 16px;
    background: rgba(18, 18, 18, 0.9);
    border: 1px solid rgba(255, 255, 255, 0.08);
    display: grid;
    gap: 1.2rem;
    max-width: 640px;
`;

const FeedbackTitle = styled.h2`
    margin: 0;
    font-size: 1.15rem;
    font-weight: 600;
`;

const FeedbackGroup = styled.div`
    display: grid;
    gap: 0.65rem;
`;

const FeedbackLabel = styled.span`
    font-size: 0.95rem;
    font-weight: 500;
`;

const Required = styled.span`
    color: #e50914;
`;

const FeedbackOptions = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 0.6rem;
`;

const FeedbackOption = styled.label`
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

const FeedbackTextarea = styled.textarea`
    width: 100%;
    min-height: 110px;
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

const FeedbackError = styled.div`
    padding: 0.75rem 1rem;
    border-radius: 10px;
    background: rgba(229, 9, 20, 0.2);
    border: 1px solid rgba(229, 9, 20, 0.5);
    color: #ffe0e0;
    font-size: 0.85rem;
    max-width: 520px;
`;

const PersistErrorNotice = styled.div`
    margin-top: 1rem;
    padding: 0.85rem 1.1rem;
    border-radius: 10px;
    background: rgba(229, 9, 20, 0.2);
    border: 1px solid rgba(229, 9, 20, 0.5);
    color: #ffe0e0;
    font-size: 0.85rem;
    max-width: 520px;
`;

const roundLikertScale = [
    {value: "1", label: "1"},
    {value: "2", label: "2"},
    {value: "3", label: "3"},
    {value: "4", label: "4"},
    {value: "5", label: "5"}
];

const roundInfoOptions = [
    {value: "preview", label: "Video preview"},
    {value: "ratings", label: "Ratings"},
    {value: "adjectives", label: "Keywords"},
    {value: "other", label: "Other"}
];

function Movies() {
    const {isLoading, rounds, error} = useExperimentRounds();
    const navigate = useNavigate();
    const [roundIndex, setRoundIndex] = useState(0);
    const [activeMovieId, setActiveMovieId] = useState(null);
    const [roundStart, setRoundStart] = useState(() => Date.now());
    const [selections, setSelections] = useState([]);
    const [sessionRecord, setSessionRecord] = useState(null);
    const [isPersisting, setIsPersisting] = useState(false);
    const [persistError, setPersistError] = useState(null);
    const [roundFeedback, setRoundFeedback] = useState({});
    const [roundFeedbackSaved, setRoundFeedbackSaved] = useState({});
    const [roundFeedbackError, setRoundFeedbackError] = useState(null);

    const currentRound = rounds[roundIndex] ?? null;

    useEffect(() => {
        setRoundStart(Date.now());
        setActiveMovieId(null);
        setRoundFeedbackError(null);
    }, [roundIndex]);

    const currentSelection = useMemo(
        () => selections.find((entry) => entry.round === roundIndex) ?? null,
        [selections, roundIndex]
    );

    if (error) {
        return <Page>Something went wrong while fetching the experiment data.</Page>;
    }

    const handleSelection = (movie) => {
        if (!movie) {
            return;
        }
        const decisionTimeMs = Date.now() - roundStart;
        const decisionTimeSeconds = Math.round((decisionTimeMs / 1000) * 10) / 10;

        setPersistError(null);
        setSelections((prev) => {
            const filtered = prev.filter((entry) => entry.round !== roundIndex);
            return [
                ...filtered,
                {
                    round: roundIndex,
                    movieId: movie.id,
                    title: movie.title || movie.name,
                    decisionTimeSeconds
                }
            ];
        });
        setRoundFeedback((prev) => ({
            ...prev,
            [roundIndex]: prev[roundIndex] ?? {
                confidence: "",
                infoSatisfaction: "",
                helpfulElement: "",
                notes: ""
            }
        }));
        setRoundFeedbackSaved((prev) => ({
            ...prev,
            [roundIndex]: false
        }));
        setRoundFeedbackError(null);
    };

    const goToPrevious = () => {
        if (isPersisting) {
            return;
        }
        setRoundFeedbackError(null);
        setPersistError(null);
        setRoundIndex((prev) => Math.max(prev - 1, 0));
    };

    const ensureSession = async () => {
        if (sessionRecord) {
            return sessionRecord;
        }

        const orderPayload = rounds.map((round, index) => ({
            index,
            rating_visible: Boolean(round.config?.showRatings),
            preview_enabled: Boolean(round.config?.usePreview),
            keywords_visible: Boolean(round.config?.useAdjectives)
        }));

        const participantPayload = {
            pid: crypto.randomUUID?.() ?? `participant-${Date.now()}-${Math.random().toString(16).slice(2)}`,
            user_agent: typeof navigator !== "undefined" ? navigator.userAgent : "unknown",
            consent: true
        };

        const {data: participantData, error: participantError} = await supabase
            .from("participants")
            .insert([participantPayload])
            .select()
            .single();

        if (participantError) {
            throw participantError;
        }

        const {data: sessionData, error: sessionError} = await supabase
            .from("sessions")
            .insert([{participant_id: participantData.id, order_json: orderPayload}])
            .select()
            .single();

        if (sessionError) {
            throw sessionError;
        }

        const {error: conditionsError} = await supabase.from("conditions").insert(
            orderPayload.map((condition, index) => ({
                session_id: sessionData.id,
                index,
                rating_visible: condition.rating_visible,
                preview_enabled: condition.preview_enabled,
                keywords_visible: condition.keywords_visible
            }))
        );

        if (conditionsError) {
            throw conditionsError;
        }

        setSessionRecord(sessionData);
        return sessionData;
    };

    const persistChoices = async (sessionId, choices) => {
        if (!sessionId || !choices.length) {
            return;
        }

        const choicePayload = choices.map((entry) => ({
            session_id: sessionId,
            condition_index: entry.round,
            movie_id: String(entry.movieId),
            time_to_choice_ms: Math.round(entry.decisionTimeSeconds * 1000)
        }));

        const {error} = await supabase.from("choices").insert(choicePayload);

        if (error) {
            throw error;
        }
    };

    const persistRoundFeedback = async (sessionId, round, feedback, selection) => {
        if (!sessionId || !feedback) {
            return;
        }
        if (roundFeedbackSaved[round]) {
            return;
        }

        const payload = {
            confidence: Number(feedback.confidence),
            infoSatisfaction: Number(feedback.infoSatisfaction),
            helpfulElement: feedback.helpfulElement,
            notes: feedback.notes?.trim() || null,
            movieId: selection?.movieId ?? null,
            movieTitle: selection?.title ?? null
        };

        const {error} = await supabase.from("events").insert([
            {
                session_id: sessionId,
                condition_index: round,
                event_type: "round_feedback",
                movie_id: selection?.movieId ? String(selection.movieId) : null,
                payload_json: payload
            }
        ]);

        if (error) {
            throw error;
        }

        setRoundFeedbackSaved((prev) => ({
            ...prev,
            [round]: true
        }));
    };

    const currentRoundFeedback = roundFeedback[roundIndex] ?? {
        confidence: "",
        infoSatisfaction: "",
        helpfulElement: "",
        notes: ""
    };

    const isCurrentFeedbackComplete =
        Boolean(currentRoundFeedback.confidence) &&
        Boolean(currentRoundFeedback.infoSatisfaction) &&
        Boolean(currentRoundFeedback.helpfulElement);

    const handleFeedbackRadioChange = (field) => (event) => {
        const value = event.target.value;
        setRoundFeedback((prev) => ({
            ...prev,
            [roundIndex]: {
                ...(prev[roundIndex] ?? {
                    confidence: "",
                    infoSatisfaction: "",
                    helpfulElement: "",
                    notes: ""
                }),
                [field]: value
            }
        }));
        setRoundFeedbackError(null);
        setRoundFeedbackSaved((prev) => ({
            ...prev,
            [roundIndex]: false
        }));
    };

    const handleFeedbackNotesChange = (event) => {
        const {value} = event.target;
        setRoundFeedback((prev) => ({
            ...prev,
            [roundIndex]: {
                ...(prev[roundIndex] ?? {
                    confidence: "",
                    infoSatisfaction: "",
                    helpfulElement: "",
                    notes: ""
                }),
                notes: value
            }
        }));
        setRoundFeedbackSaved((prev) => ({
            ...prev,
            [roundIndex]: false
        }));
    };

    const goToNext = async () => {
        if (!isCurrentFeedbackComplete || !currentSelection) {
            setRoundFeedbackError("Please answer the round feedback questions before continuing.");
            return;
        }

        try {
            setPersistError(null);
            setIsPersisting(true);
            const session = await ensureSession();
            await persistRoundFeedback(session.id, roundIndex, currentRoundFeedback, currentSelection);
            setRoundFeedbackError(null);

            if (roundIndex >= Math.max(rounds.length - 1, 0)) {
                await persistChoices(session.id, selections);
                setPersistError(null);
                setIsPersisting(false);
                navigate("/questionnaire", {state: {selections, sessionId: session.id}});
                return;
            }

            setIsPersisting(false);
            setRoundIndex((prev) => Math.min(prev + 1, Math.max(rounds.length - 1, 0)));
        } catch (persistErr) {
            console.error("Failed to save round feedback", persistErr);
            setRoundFeedbackError("Saving feedback failed. Please try again.");
            setPersistError("We could not save your selections. Please check your connection and try again.");
            setIsPersisting(false);
        }
    };

    const hasSelectionForCurrentRound = Boolean(currentSelection);
    const isFinalRound = rounds.length > 0 && roundIndex >= rounds.length - 1;
    const primaryLabel = isFinalRound ? "Go to questionnaire" : "Next round";

    return (
        <Page>
            <Header>
                <RoundTitle>Experiment round {roundIndex + 1} of {rounds.length || 8}</RoundTitle>
                <RoundSummary>
                    Pick 1 movie per round. Only the "Watch now" button confirms your selection. Every round contains
                    unique movies (6 categories x 10 movies) and a different combination of variables.
                </RoundSummary>
            </Header>

            {isLoading || !currentRound ? (
                <LoaderWrapper data-testid="loader">
                    <Loader/>
                </LoaderWrapper>
            ) : (
                <ExperimentRound
                    key={currentRound.id}
                    round={currentRound}
                    activeMovieId={activeMovieId}
                    onSetActive={setActiveMovieId}
                    onConfirmSelection={handleSelection}
                    selectedMovieId={currentSelection?.movieId ?? null}
                />
            )}

            {currentSelection ? (
                <SelectionNotice>
                    You selected <strong>{currentSelection.title}</strong>. Click <strong>{primaryLabel}</strong> to
                    continue.
                </SelectionNotice>
            ) : null}

            {currentSelection ? (
                <FeedbackCard>
                    <FeedbackTitle>Round feedback</FeedbackTitle>
                    <FeedbackGroup>
                        <FeedbackLabel>
                            How confident are you about this choice? <Required>*</Required>
                        </FeedbackLabel>
                        <FeedbackOptions>
                            {roundLikertScale.map((option) => (
                                <FeedbackOption key={`confidence-${option.value}`}>
                                    <input
                                        type="radio"
                                        name={`confidence-${roundIndex}`}
                                        value={option.value}
                                        checked={currentRoundFeedback.confidence === option.value}
                                        onChange={handleFeedbackRadioChange("confidence")}
                                        disabled={isPersisting}
                                    />
                                    <span>{option.label}</span>
                                </FeedbackOption>
                            ))}
                        </FeedbackOptions>
                    </FeedbackGroup>
                    <FeedbackGroup>
                        <FeedbackLabel>
                            Was the information sufficient to decide? <Required>*</Required>
                        </FeedbackLabel>
                        <FeedbackOptions>
                            {roundLikertScale.map((option) => (
                                <FeedbackOption key={`info-${option.value}`}>
                                    <input
                                        type="radio"
                                        name={`info-${roundIndex}`}
                                        value={option.value}
                                        checked={currentRoundFeedback.infoSatisfaction === option.value}
                                        onChange={handleFeedbackRadioChange("infoSatisfaction")}
                                        disabled={isPersisting}
                                    />
                                    <span>{option.label}</span>
                                </FeedbackOption>
                            ))}
                        </FeedbackOptions>
                    </FeedbackGroup>
                    <FeedbackGroup>
                        <FeedbackLabel>
                            Which element influenced you the most? <Required>*</Required>
                        </FeedbackLabel>
                        <FeedbackOptions>
                            {roundInfoOptions.map((option) => (
                                <FeedbackOption key={`helpful-${option.value}`}>
                                    <input
                                        type="radio"
                                        name={`helpful-${roundIndex}`}
                                        value={option.value}
                                        checked={currentRoundFeedback.helpfulElement === option.value}
                                        onChange={handleFeedbackRadioChange("helpfulElement")}
                                        disabled={isPersisting}
                                    />
                                    <span>{option.label}</span>
                                </FeedbackOption>
                            ))}
                        </FeedbackOptions>
                    </FeedbackGroup>
                    <FeedbackGroup>
                        <FeedbackLabel>Optional notes about this choice</FeedbackLabel>
                        <FeedbackTextarea
                            value={currentRoundFeedback.notes}
                            onChange={handleFeedbackNotesChange}
                            placeholder="Describe anything that helped or made the decision harder."
                            disabled={isPersisting}
                        />
                    </FeedbackGroup>
                </FeedbackCard>
            ) : null}

            {roundFeedbackError ? <FeedbackError role="alert">{roundFeedbackError}</FeedbackError> : null}
            {persistError ? <PersistErrorNotice role="alert">{persistError}</PersistErrorNotice> : null}

            <FooterBar>
                <FooterMessage>
                    {isPersisting
                        ? "Saving your selections..."
                        : currentSelection
                        ? isCurrentFeedbackComplete
                            ? isFinalRound
                                ? `Final round completed: ${currentSelection.title}`
                                : `Selected: ${currentSelection.title}`
                            : "Please complete the round feedback to continue."
                        : "Select a movie with the 'Watch now' button to continue."}
                </FooterMessage>
                <FooterActions>
                    <ControlButton onClick={goToPrevious} disabled={roundIndex === 0 || isPersisting}>
                        Previous round
                    </ControlButton>
                    <ControlButton
                        primary
                        onClick={goToNext}
                        disabled={!hasSelectionForCurrentRound || isPersisting || !isCurrentFeedbackComplete}
                    >
                        {primaryLabel}
                    </ControlButton>
                </FooterActions>
            </FooterBar>
        </Page>
    );
}

export default Movies;
