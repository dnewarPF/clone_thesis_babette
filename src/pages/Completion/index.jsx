import React from "react";
import styled from "styled-components";
import {Link, useLocation, useNavigate} from "react-router-dom";

const Page = styled.main`
    min-height: 100vh;
    background: radial-gradient(circle at top, rgba(25, 25, 25, 0.75), #040404 65%);
    color: #ffffff;
    display: flex;
    justify-content: center;
    padding: clamp(2rem, 6vw, 5rem);
`;

const Wrapper = styled.section`
    width: 100%;
    max-width: 680px;
    background: rgba(14, 14, 14, 0.92);
    border-radius: 24px;
    padding: clamp(2rem, 4vw, 3.25rem);
    box-shadow: 0 24px 48px rgba(0, 0, 0, 0.45);
    display: grid;
    gap: 1.6rem;
    text-align: left;
`;

const Title = styled.h1`
    margin: 0;
    font-size: clamp(2rem, 4vw, 2.8rem);
    font-weight: 700;
`;

const Paragraph = styled.p`
    margin: 0;
    font-size: 1.05rem;
    line-height: 1.6rem;
    color: #dddddd;
`;

const Card = styled.div`
    padding: 1.25rem 1.4rem;
    border-radius: 18px;
    background: rgba(255, 255, 255, 0.07);
    border: 1px solid rgba(255, 255, 255, 0.12);
    display: grid;
    gap: 0.9rem;
`;

const StatList = styled.ul`
    margin: 0;
    padding-left: 1.2rem;
    display: grid;
    gap: 0.55rem;
    font-size: 0.95rem;
    color: #dcdcdc;
`;

const Actions = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    align-items: center;
`;

const PrimaryButton = styled.button`
    padding: 0.8rem 2.2rem;
    border-radius: 999px;
    border: none;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    cursor: pointer;
    background: #e50914;
    color: #0b0b0b;
    transition: transform 0.2s ease, background 0.2s ease;

    &:hover {
        transform: translateY(-2px);
        background: #f6121d;
    }

    &:focus-visible {
        outline: 3px solid #ffffff;
        outline-offset: 4px;
    }
`;

const SecondaryLink = styled(Link)`
    font-size: 0.95rem;
    color: #cfcfcf;
    text-decoration: underline;

    &:hover {
        color: #ffffff;
    }
`;

function Completion() {
    const navigate = useNavigate();
    const location = useLocation();
    const participantPid = location.state?.pid ?? null;
    const totalDecisionTimeSeconds = location.state?.totalDecisionTimeSeconds ?? null;
    const roundsCompleted = location.state?.roundsCompleted ?? null;

    return (
        <Page>
            <Wrapper>
                <Title>All done! 🎬</Title>
                <Paragraph>
                    Thank you for your time and attention. Your participation helps us understand how different
                    variables influence viewing choices.
                </Paragraph>

                {roundsCompleted || totalDecisionTimeSeconds ? (
                    <Card>
                        <Paragraph as="h2" style={{margin: 0, fontSize: "1.05rem", fontWeight: 600, color: "#f5f5f5"}}>
                            Session highlights
                        </Paragraph>
                        <StatList>
                            {roundsCompleted ? <li>Rounds completed: {roundsCompleted}</li> : null}
                            {totalDecisionTimeSeconds ? (
                                <li>
                                    Total decision time: {Math.round(totalDecisionTimeSeconds)} seconds
                                </li>
                            ) : null}
                            {participantPid ? <li>Participant ID: {participantPid}</li> : null}
                        </StatList>
                    </Card>
                ) : null}

                <Paragraph>
                    Questions or curious about the study? Feel free to reach out to the research team. You can close this
                    window whenever you are ready.
                </Paragraph>

                <Actions>
                    <PrimaryButton type="button" onClick={() => navigate("/")}>
                        Back to start
                    </PrimaryButton>
                    <SecondaryLink to="/instructions">View instructions again</SecondaryLink>
                </Actions>
            </Wrapper>
        </Page>
    );
}

export default Completion;
