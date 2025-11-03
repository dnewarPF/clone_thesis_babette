import React, {useEffect, useMemo, useState, useId} from "react";
import styled from "styled-components";
import {Loader} from "../../utils/style/Atoms";
import {useExperimentRounds} from "../../utils/hooks/useExperimentRounds";
import ExperimentRound from "../../components/ExperimentRound";
import {useLocation, useNavigate} from "react-router-dom";
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
    gap: 1rem;
    margin-bottom: 2.5rem;
`;

const ProgressBarContainer = styled.div`
    position: relative;
    width: 100%;
    height: 0.5rem;
    background: rgba(255, 255, 255, 0.08);
    border-radius: 999px;
    overflow: hidden;
`;

const ProgressIndicator = styled.div`
    position: absolute;
    inset: 0;
    width: ${({$progress}) => `${$progress}%`};
    background: linear-gradient(90deg, #e50914 0%, #f6121d 100%);
    border-radius: 999px;
    transition: width 0.3s ease;
`;

const RoundTitle = styled.h2`
    margin: 0;
    font-size: clamp(1.35rem, 2.6vw, 1.9rem);
    font-weight: 600;
    letter-spacing: 0.02em;
`;

const HelpWrapper = styled.div`
    position: relative;
    display: inline-flex;
    align-items: center;
    margin-left: auto;
`;

const HelpButton = styled.button`
    width: 34px;
    height: 34px;
    border-radius: 50%;
    border: 1px solid rgba(255, 255, 255, 0.25);
    background: rgba(255, 255, 255, 0.06);
    color: #ffffff;
    font-weight: 700;
    font-size: 1rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.2s ease, background 0.2s ease, border-color 0.2s ease;

    &:hover {
        transform: translateY(-1px);
        background: rgba(229, 9, 20, 0.18);
        border-color: rgba(229, 9, 20, 0.5);
    }

    &:focus-visible {
        outline: 2px solid #ffffff;
        outline-offset: 3px;
        background: rgba(229, 9, 20, 0.25);
        border-color: rgba(229, 9, 20, 0.6);
    }
`;

const HelpTooltip = styled.div`
    position: absolute;
    top: 120%;
    right: 0;
    width: clamp(220px, 28vw, 320px);
    padding: 0.8rem 1rem;
    border-radius: 12px;
    background: rgba(10, 10, 10, 0.94);
    border: 1px solid rgba(255, 255, 255, 0.12);
    box-shadow: 0 16px 32px rgba(0, 0, 0, 0.45);
    color: #f0f0f0;
    font-size: 0.82rem;
    line-height: 1.45;
    opacity: 0;
    transform: translateY(-6px);
    pointer-events: none;
    transition: opacity 0.2s ease, transform 0.2s ease;
    z-index: 25;

    ${HelpWrapper}:hover &,
    ${HelpWrapper}:focus-within & {
        opacity: 1;
        transform: translateY(0);
        pointer-events: auto;
    }
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
    margin-left: auto;
`;

const LoaderWrapper = styled.div`
    display: flex;
    justify-content: center;
    padding: 3rem 0;
`;

const FeedbackCard = styled.section`
    display: grid;
    gap: 1.5rem;
    width: 100%;
    /* Use the full available content width so long labels don't wrap early */
    max-width: none;
    margin: 2rem 0 0;
`;

// Constrain specific content blocks (tiles list and textarea) to half width
const HalfWidthBlock = styled.div`
    width: 100%;
    max-width: 50%;
    @media (max-width: 900px) {
        max-width: 100%;
    }
`;

const FeedbackGroup = styled.div`
    display: grid;
    gap: 0.9rem;
`;

const FeedbackLabel = styled.span`
    font-size: 1.2rem;
    font-weight: 500;
`;

const FeedbackHighlight = styled.span`
    color: #e50914;
    font-weight: 600;
`;

const LikertRow = styled.div`
    display: flex;
    align-items: center;
    gap: 0.7rem;
    flex-wrap: nowrap;
    font-size: 1rem;
    color: #cfcfcf;
`;

const LikertLabel = styled.span`
    white-space: nowrap;
    font-size: 1rem;
`;

const LikertOption = styled.label`
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    font-size: 1rem;
    color: #ffffff;

    input {
        accent-color: #e50914;
        cursor: pointer;
    }
`;

const Required = styled.span`
    color: #e50914;
`;

const FeedbackOptions = styled.div`
    display: inline-flex;
    flex-direction: column;
    gap: 0.9rem;
    width: max-content;
`;

const FeedbackOption = styled.label`
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.85rem;
    font-size: 1.05rem;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.08);
    cursor: pointer;
    transition: background 0.2s ease, transform 0.2s ease;
    width: 100%;

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

const familiarityOptions = [
    {value: "never", label: "I did not know and have not seen the movie before"},
    {value: "aware", label: "I knew the movie, but have not seen it before"},
    {value: "seen", label: "I have seen the movie before"}
];

const ALL_INFO_OPTIONS = [
    {value: "title", label: "Title"},
    {value: "image", label: "Teaser image"},
    {value: "genre", label: "Genre"},
    {value: "ratings", label: "Ratings"},
    {value: "adjectives", label: "Keywords"},
    {value: "preview", label: "Video preview"}
];

function Movies() {
    const {isLoading, rounds, error} = useExperimentRounds();
    const navigate = useNavigate();
    const location = useLocation();
    const [participantContext, setParticipantContext] = useState(() => {
        let storedPid = location.state?.pid ?? null;
        let storedDemographicsId = location.state?.demographicsId ?? null;

        if (typeof window !== "undefined") {
            storedPid = storedPid ?? sessionStorage.getItem("participantPid");
            storedDemographicsId =
                storedDemographicsId ?? sessionStorage.getItem("demographicsId");
        }

        return {
            pid: storedPid,
            demographicsId: storedDemographicsId
        };
    });
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
    const [isFeedbackStep, setIsFeedbackStep] = useState(false);
    // Drag-and-drop visual state for ranking UI
    const [draggingIndex, setDraggingIndex] = useState(null);
    const [dragOverIndex, setDragOverIndex] = useState(null);
    const helpTooltipId = useId();

    const currentRound = rounds[roundIndex] ?? null;

    const availableInfoOptions = useMemo(() => {
        const config = currentRound?.config ?? {};
        const result = [];
        // Always available base features
        result.push("title");
        result.push("image");
        result.push("genre");
        // Conditional features per scenario
        if (config.showRatings) result.push("ratings");
        if (config.useAdjectives) result.push("adjectives");
        if (config.usePreview) result.push("preview");
        return result;
    }, [currentRound?.config]);

    useEffect(() => {
        const statePid = location.state?.pid ?? null;
        if (statePid && statePid !== participantContext.pid) {
            setParticipantContext((prev) => ({...prev, pid: statePid}));
            if (typeof window !== "undefined") {
                sessionStorage.setItem("participantPid", statePid);
            }
        }

        const stateDemographicsId = location.state?.demographicsId ?? null;
        if (stateDemographicsId && stateDemographicsId !== participantContext.demographicsId) {
            setParticipantContext((prev) => ({...prev, demographicsId: stateDemographicsId}));
            if (typeof window !== "undefined") {
                sessionStorage.setItem("demographicsId", String(stateDemographicsId));
            }
        }
    }, [location.state, participantContext.pid, participantContext.demographicsId]);

    useEffect(() => {
        setRoundStart(Date.now());
        setActiveMovieId(null);
        setRoundFeedbackError(null);
        setIsFeedbackStep(false);

        if (typeof window !== "undefined") {
            window.scrollTo({top: 0, left: 0, behavior: "auto"});
        }
    }, [roundIndex]);

    useEffect(() => {
        if (!isFeedbackStep) {
            return;
        }
        if (typeof window !== "undefined") {
            window.scrollTo({top: 0, left: 0, behavior: "auto"});
        }
    }, [isFeedbackStep]);

    // Reset drag state between rounds/steps
    useEffect(() => {
        setDraggingIndex(null);
        setDragOverIndex(null);
    }, [roundIndex, isFeedbackStep]);

    const currentSelection = useMemo(
        () => selections.find((entry) => entry.round === roundIndex) ?? null,
        [selections, roundIndex]
    );

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
                familiarity: "",
                helpfulRanking: [],
                notes: ""
            }
        }));
        setRoundFeedbackSaved((prev) => ({
            ...prev,
            [roundIndex]: false
        }));
        setRoundFeedbackError(null);
    };

    // Back navigation removed: users cannot return to previous rounds

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

        let effectivePid = participantContext.pid;

        if (!effectivePid) {
            effectivePid =
                crypto.randomUUID?.() ??
                `participant-${Date.now()}-${Math.random().toString(16).slice(2)}`;

            setParticipantContext((prev) => ({
                ...prev,
                pid: effectivePid
            }));

            if (typeof window !== "undefined") {
                sessionStorage.setItem("participantPid", effectivePid);
            }
        }

        const participantPayload = {
            pid: effectivePid,
            user_agent: typeof navigator !== "undefined" ? navigator.userAgent : "unknown",
            consent: true
        };

        const {data: participantData, error: participantError} = await supabase
            .from("participants")
            .upsert([participantPayload], {onConflict: "pid"})
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
            familiarity: feedback.familiarity ?? "",
            helpfulRanking: Array.isArray(feedback.helpfulRanking) ? feedback.helpfulRanking : [],
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
        familiarity: "",
        helpfulRanking: [],
        notes: ""
    };

    const isCurrentFeedbackComplete =
        Boolean(currentRoundFeedback.confidence) &&
        Boolean(currentRoundFeedback.infoSatisfaction) &&
        Boolean(currentRoundFeedback.familiarity) &&
        Array.isArray(currentRoundFeedback.helpfulRanking) &&
        currentRoundFeedback.helpfulRanking.length === availableInfoOptions.length &&
        Boolean(currentRoundFeedback.notes && currentRoundFeedback.notes.trim());

    useEffect(() => {
        if (!isFeedbackStep || availableInfoOptions.length === 0) {
            return;
        }
        setRoundFeedback((prev) => {
            const existing = prev[roundIndex] ?? {};
            const currentRanking = Array.isArray(existing.helpfulRanking) ? existing.helpfulRanking : [];
            if (currentRanking.length === availableInfoOptions.length) {
                return prev;
            }
            return {
                ...prev,
                [roundIndex]: {
                    confidence: existing.confidence ?? "",
                    infoSatisfaction: existing.infoSatisfaction ?? "",
                    familiarity: existing.familiarity ?? "",
                    helpfulRanking: [...availableInfoOptions],
                    notes: existing.notes ?? ""
                }
            };
        });
    }, [isFeedbackStep, availableInfoOptions, roundIndex]);

    if (error) {
        return <Page>Something went wrong while fetching the experiment data.</Page>;
    }

    const handleFeedbackRadioChange = (field) => (event) => {
        const value = event.target.value;
        setRoundFeedback((prev) => ({
            ...prev,
            [roundIndex]: {
                ...(prev[roundIndex] ?? {
                    confidence: "",
                    infoSatisfaction: "",
                    familiarity: "",
                    helpfulRanking: [],
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
                    familiarity: "",
                    helpfulRanking: [],
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
        if (!isFeedbackStep) {
            if (!currentSelection) {
                setRoundFeedbackError(null);
                return;
            }
            setRoundFeedbackError(null);
            if (typeof window !== "undefined") {
                window.scrollTo({top: 0, left: 0, behavior: "auto"});
            }
            setIsFeedbackStep(true);
            return;
        }

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
                if (typeof window !== "undefined") {
                    window.scrollTo({top: 0, left: 0, behavior: "auto"});
                }
                navigate("/questionnaire", {
                    state: {
                        selections,
                        sessionId: session.id,
                        pid: participantContext.pid ?? null
                    }
                });
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
    const totalRounds = rounds.length || 8;
    const progressPercent = totalRounds > 0 ? ((roundIndex + (isFeedbackStep ? 1 : 0)) / totalRounds) * 100 : 0;
    const primaryLabel = isFeedbackStep
        ? isFinalRound
            ? "Go to questionnaire"
            : "Next round"
        : "Continue to questions";
    return (
        <Page>
            <Header>
                <ProgressBarContainer aria-hidden="true">
                    <ProgressIndicator $progress={Math.min(progressPercent, 100)} />
                </ProgressBarContainer>
                <RoundTitle>Experiment round {roundIndex + 1} of {rounds.length || 8}</RoundTitle>
            </Header>

            {isLoading || !currentRound ? (
                <LoaderWrapper data-testid="loader">
                    <Loader/>
                </LoaderWrapper>
            ) : !isFeedbackStep ? (
                <ExperimentRound
                    key={currentRound.id}
                    round={currentRound}
                    activeMovieId={activeMovieId}
                    onSetActive={setActiveMovieId}
                    onConfirmSelection={handleSelection}
                    selectedMovieId={currentSelection?.movieId ?? null}
                    renderHelp={() => (
                        <HelpWrapper>
                            <HelpButton type="button" aria-describedby={helpTooltipId} aria-label="Show task reminder">
                                ?
                            </HelpButton>
                            <HelpTooltip id={helpTooltipId}>
                                Hover over any movie tile to reveal extra information. Select the title you would like to watch with the
                                'Watch now' button, then choose 'Continue to questions' to lock in your choice.
                            </HelpTooltip>
                        </HelpWrapper>
                    )}
                />
            ) : null}

            {currentSelection && isFeedbackStep ? (
                <FeedbackCard>
                    <FeedbackGroup>
                        <FeedbackLabel>
                            Did you already know or have you seen this movie before? <Required>*</Required>
                        </FeedbackLabel>
                        <FeedbackOptions>
                            {familiarityOptions.map((option) => (
                                <FeedbackOption key={`familiarity-${option.value}`}>
                                    <input
                                        type="radio"
                                        name={`familiarity-${roundIndex}`}
                                        value={option.value}
                                        checked={currentRoundFeedback.familiarity === option.value}
                                        onChange={handleFeedbackRadioChange("familiarity")}
                                        disabled={isPersisting}
                                    />
                                    <span>{option.label}</span>
                                </FeedbackOption>
                            ))}
                        </FeedbackOptions>
                    </FeedbackGroup>
                    <FeedbackGroup>
                        <FeedbackLabel>
                            How confident are you about this choice? <Required>*</Required>
                        </FeedbackLabel>
                        <LikertRow>
                            <LikertLabel>Not at all confident</LikertLabel>
                            {roundLikertScale.map((option, index) => (
                                <React.Fragment key={`confidence-${option.value}`}>
                                    <LikertOption>
                                        <input
                                            type="radio"
                                            name={`confidence-${roundIndex}`}
                                            value={option.value}
                                            checked={currentRoundFeedback.confidence === option.value}
                                            onChange={handleFeedbackRadioChange("confidence")}
                                            disabled={isPersisting}
                                        />
                                        <span>{option.label}</span>
                                    </LikertOption>
                                </React.Fragment>
                            ))}
                            <LikertLabel>Completely confident</LikertLabel>
                        </LikertRow>
                    </FeedbackGroup>
                    <FeedbackGroup>
                        <FeedbackLabel>
                            Was the information sufficient to decide? <Required>*</Required>
                        </FeedbackLabel>
                        <LikertRow>
                            <LikertLabel>Not at all sufficient</LikertLabel>
                            {roundLikertScale.map((option, index) => (
                                <React.Fragment key={`info-${option.value}`}>
                                    <LikertOption>
                                        <input
                                            type="radio"
                                            name={`info-${roundIndex}`}
                                            value={option.value}
                                            checked={currentRoundFeedback.infoSatisfaction === option.value}
                                            onChange={handleFeedbackRadioChange("infoSatisfaction")}
                                            disabled={isPersisting}
                                        />
                                        <span>{option.label}</span>
                                    </LikertOption>
                                </React.Fragment>
                            ))}
                            <LikertLabel>Extremely sufficient</LikertLabel>
                        </LikertRow>
                    </FeedbackGroup>
                    <FeedbackGroup>
                        <FeedbackLabel>
                            Rank the <FeedbackHighlight>descriptive features</FeedbackHighlight> by importance (drag to reorder). <Required>*</Required>
                        </FeedbackLabel>
                        {(() => {
                            const displayOrder = (Array.isArray(currentRoundFeedback.helpfulRanking) &&
                                currentRoundFeedback.helpfulRanking.length === availableInfoOptions.length)
                                ? currentRoundFeedback.helpfulRanking
                                : availableInfoOptions;

                            const handleDropToIndex = (toIndex, fromIndex) => {
                                if (Number.isNaN(fromIndex) || fromIndex === toIndex) return;
                                setRoundFeedback((prev) => {
                                    const existing = prev[roundIndex] ?? {
                                        confidence: "",
                                        infoSatisfaction: "",
                                        familiarity: "",
                                        helpfulRanking: [],
                                        notes: ""
                                    };
                                    const base = (Array.isArray(existing.helpfulRanking) && existing.helpfulRanking.length === availableInfoOptions.length)
                                        ? existing.helpfulRanking
                                        : availableInfoOptions;
                                    const next = [...base];
                                    const [moved] = next.splice(fromIndex, 1);
                                    next.splice(toIndex, 0, moved);
                                    return {
                                        ...prev,
                                        [roundIndex]: {
                                            ...existing,
                                            helpfulRanking: next
                                        }
                                    };
                                });
                                setRoundFeedbackSaved((prev) => ({...prev, [roundIndex]: false}));
                                setRoundFeedbackError(null);
                                setDraggingIndex(null);
                                setDragOverIndex(null);
                            };

                            return (
                                <HalfWidthBlock role="list" style={{display: "grid", gap: "0.5rem"}}>
                                    {displayOrder.map((val, idx) => {
                                        const option = ALL_INFO_OPTIONS.find((o) => o.value === val);

                                        const onTileDragStart = (e) => {
                                            e.dataTransfer.effectAllowed = "move";
                                            e.dataTransfer.setData("text/plain", String(idx));
                                            setDraggingIndex(idx);
                                            const isHandle = e.currentTarget && e.currentTarget.getAttribute && e.currentTarget.getAttribute('data-handle') === 'true';
                                            const node = isHandle && e.currentTarget.parentNode ? e.currentTarget.parentNode : e.currentTarget;
                                            const rect = node.getBoundingClientRect();
                                            const dragClone = node.cloneNode(true);
                                            dragClone.style.width = `${rect.width}px`;
                                            dragClone.style.position = "absolute";
                                            dragClone.style.top = "-9999px";
                                            dragClone.style.left = "-9999px";
                                            dragClone.style.pointerEvents = "none";
                                            dragClone.style.opacity = "1";
                                            dragClone.style.margin = "0";
                                            document.body.appendChild(dragClone);
                                            e.dataTransfer.setDragImage(dragClone, rect.width / 2, rect.height / 2);
                                            window.setTimeout(() => dragClone.remove(), 0);
                                        };
                                        const onTileDragEnd = () => {
                                            setDraggingIndex(null);
                                            setDragOverIndex(null);
                                        };

                                        const onSlotDragOver = (e) => {
                                            e.preventDefault();
                                            e.dataTransfer.dropEffect = "move";
                                            setDragOverIndex(idx);
                                        };
                                        const onSlotDragEnter = () => setDragOverIndex(idx);
                                        const onSlotDragLeave = (e) => {
                                            // Only clear when leaving the slot itself
                                            if (!e.currentTarget.contains(e.relatedTarget)) {
                                                setDragOverIndex((prev) => (prev === idx ? null : prev));
                                            }
                                        };

                                        const onSlotDrop = (e) => {
                                            e.preventDefault();
                                            const fromIndex = Number(e.dataTransfer.getData("text/plain"));
                                            handleDropToIndex(idx, fromIndex);
                                        };

                                        const isOver = dragOverIndex === idx;
                                        const slotStyle = {
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "0.9rem",
                                            width: "100%",
                                            padding: "0.7rem 1rem",
                                            borderRadius: 12,
                                            background: isOver ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.08)",
                                            border: isOver ? "1px dashed #e50914" : "1px solid rgba(255,255,255,0.08)",
                                            boxShadow: isOver ? "0 0 0 3px rgba(229,9,20,0.25)" : "none",
                                            transform: isOver ? "scale(1.01)" : "none",
                                            transition: "background 120ms ease, box-shadow 120ms ease, transform 120ms ease, border-color 120ms ease"
                                        };
                                        const bubbleStyle = {
                                            width: 26,
                                            height: 26,
                                            borderRadius: 8,
                                            background: isOver ? "rgba(229,9,20,0.28)" : "rgba(255,255,255,0.12)",
                                            display: "inline-flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontSize: 13,
                                            color: "#ffffff",
                                            flexShrink: 0,
                                            transition: "background 120ms ease"
                                        };
                                        const tileStyle = {
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "flex-start",
                                            fontSize: "1.05rem",
                                            color: "#ffffff",
                                            userSelect: "none",
                                            padding: "0.35rem 0.6rem",
                                            borderRadius: 8,
                                            background: "rgba(255,255,255,0.10)",
                                            boxShadow: draggingIndex === idx ? "0 8px 20px rgba(0,0,0,0.45)" : "none",
                                            opacity: draggingIndex === idx ? 0.7 : 1,
                                            transform: draggingIndex === idx ? "scale(0.98)" : "none",
                                            transition: "transform 120ms ease, opacity 120ms ease, box-shadow 120ms ease",
                                            cursor: isPersisting ? "not-allowed" : (draggingIndex === idx ? "grabbing" : "grab"),
                                            flex: 1
                                        };
                                        const handleStyle = {
                                            marginLeft: 'auto',
                                            padding: "0.15rem 0.35rem",
                                            borderRadius: 6,
                                            color: "#ffffff",
                                            background: "rgba(255,255,255,0.12)",
                                            cursor: isPersisting ? "not-allowed" : (draggingIndex === idx ? "grabbing" : "grab"),
                                            lineHeight: 1,
                                            fontSize: 16,
                                            opacity: isPersisting ? 0.6 : 1,
                                            transition: "background 120ms ease, opacity 120ms ease"
                                        };

                                        return (
                                            <div
                                                key={`rank-slot-${val}`}
                                                role="listitem"
                                                onDragOver={onSlotDragOver}
                                                onDragEnter={onSlotDragEnter}
                                                onDragLeave={onSlotDragLeave}
                                                onDrop={onSlotDrop}
                                                style={slotStyle}
                                                aria-label={`Rank slot ${idx + 1}`}
                                                aria-dropeffect="move"
                                            >
                                                <span style={bubbleStyle}>{idx + 1}</span>
                                                <div
                                                    data-tile
                                                    draggable={!isPersisting}
                                                    onDragStart={onTileDragStart}
                                                    onDragEnd={onTileDragEnd}
                                                    style={tileStyle}
                                                    aria-label={`Rank ${idx + 1}: ${option?.label ?? val}`}
                                                    aria-grabbed={draggingIndex === idx}
                                                    title="Drag to reorder"
                                                >
                                                    <span>{option?.label ?? val}</span>
                                                    {isOver ? (
                                                        <span style={{
                                                            marginLeft: 10,
                                                            fontSize: 12,
                                                            color: "#ffb3b3"
                                                        }}>
                                                            Drop here to set as rank {idx + 1}
                                                        </span>
                                                    ) : null}
                                                    <span
                                                        role="button"
                                                        title="Drag to reorder"
                                                        aria-label={`Drag handle for rank ${idx + 1}: ${option?.label ?? val}`}
                                                        data-handle
                                                        draggable={!isPersisting}
                                                        onDragStart={(e) => {
                                                            onTileDragStart(e);
                                                        }}
                                                        onDragEnd={onTileDragEnd}
                                                        style={handleStyle}
                                                        aria-grabbed={draggingIndex === idx}
                                                    >
                                                        ☰
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </HalfWidthBlock>
                            );
                        })()}
                    </FeedbackGroup>
                    <FeedbackGroup>
                        <FeedbackLabel>
                            Briefly explain your choice based on how you ranked the <FeedbackHighlight>descriptive features</FeedbackHighlight> above. <Required>*</Required>
                        </FeedbackLabel>
                        <HalfWidthBlock>
                            <FeedbackTextarea
                                value={currentRoundFeedback.notes}
                                onChange={handleFeedbackNotesChange}
                                disabled={isPersisting}
                            />
                        </HalfWidthBlock>
                    </FeedbackGroup>
                </FeedbackCard>
            ) : null}

            {roundFeedbackError ? <FeedbackError role="alert">{roundFeedbackError}</FeedbackError> : null}
            {persistError ? <PersistErrorNotice role="alert">{persistError}</PersistErrorNotice> : null}

            <FooterBar>
                <FooterActions>
                    <ControlButton
                        primary
                        onClick={goToNext}
                        disabled={
                            isPersisting ||
                            (!isFeedbackStep && !hasSelectionForCurrentRound) ||
                            (isFeedbackStep && (!isCurrentFeedbackComplete || !hasSelectionForCurrentRound))
                        }
                    >
                        {primaryLabel}
                    </ControlButton>
                </FooterActions>
            </FooterBar>
        </Page>
    );
}

export default Movies;
