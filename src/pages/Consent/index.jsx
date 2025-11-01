import React from "react";
import styled from "styled-components";
import {useNavigate} from "react-router-dom";
import {useExperimentPreload} from "../../utils/hooks/useExperimentPreload";

const Page = styled.main`
    min-height: 100vh;
    background: #000000;
    color: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: clamp(2rem, 6vw, 5rem);
`;

const Content = styled.section`
    max-width: 860px;
    width: 100%;
    display: grid;
    gap: clamp(1.5rem, 3vw, 2.5rem);
`;

const Title = styled.h1`
    margin: 0;
    font-size: clamp(1.8rem, 3vw, 2.6rem);
    font-weight: 700;
`;

const Section = styled.section`
    display: grid;
    gap: 0.75rem;
`;

const SectionHeading = styled.h2`
    margin: 0;
    font-size: 1.3rem;
    font-weight: 600;
    color: #f3f3f3;
`;

const SectionText = styled.p`
    margin: 0;
    font-size: 1.05rem;
    line-height: 1.7;
    color: #e0e0e0;
`;

const CheckboxRow = styled.label`
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    font-size: 1.05rem;
    line-height: 1.7;
    color: #e6e6e6;
`;

const Checkbox = styled.input`
    margin-top: 0.3rem;
    width: 1.1rem;
    height: 1.1rem;
    border: 2px solid #555555;
    background: transparent;
    accent-color: #e50914;
`;

const ButtonRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
`;

const Button = styled.button`
    min-width: 160px;
    padding: 0.85rem 2.25rem;
    border-radius: 999px;
    border: none;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    cursor: pointer;
    transition: transform 0.2s ease, background 0.2s ease, color 0.2s ease;
    background: ${({variant}) => (variant === "secondary" ? "#3a3a3a" : "#e50914")};
    color: ${({variant}) => (variant === "secondary" ? "#f5f5f5" : "#0b0b0b")};

    &:hover {
        transform: translateY(-2px);
        background: ${({variant}) => (variant === "secondary" ? "#4a4a4a" : "#f6121d")};
    }

    &:focus-visible {
        outline: 2px solid #ffffff;
        outline-offset: 3px;
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
        background: ${({variant}) => (variant === "secondary" ? "#3a3a3a" : "#8a090f")};
    }

    &:disabled:hover {
        background: ${({variant}) => (variant === "secondary" ? "#3a3a3a" : "#8a090f")};
    }
`;

function Consent() {
    const navigate = useNavigate();
    const [consentConfirmed, setConsentConfirmed] = React.useState(false);
    useExperimentPreload();

    const handleContinue = () => {
        if (!consentConfirmed) {
            return;
        }
        navigate("/demographics");
    };

    return (
        <Page>
            <Content>
                <Title>Consent form</Title>
                <Section>
                    <SectionHeading>Procedure:</SectionHeading>
                    <SectionText>
                        You will be asked to complete a short online task involving several decision scenarios, followed by
                        a few brief questions. We will also measure the time taken to make a decision for each scenario. The total
                        duration will be approximately 10 to 15 minutes.
                    </SectionText>
                </Section>
                <Section>
                    <SectionHeading>Voluntary participation:</SectionHeading>
                    <SectionText>
                        Participation is entirely voluntary. You may withdraw from the study at any time without giving a
                        reason and without any negative consequences.
                    </SectionText>
                </Section>
                <Section>
                    <SectionHeading>Confidentiality:</SectionHeading>
                    <SectionText>
                        All responses will be collected anonymously. No personally identifying information will be stored or
                        published. Data will be used exclusively for academic research within this master's thesis project.
                    </SectionText>
                </Section>
                <SectionText>
                    If you have any questions or remarks about this study, please contact me at{" "}
                    <a href="mailto:b.a.scheepers@students.uu.nl">b.a.scheepers@students.uu.nl</a> or my supervisor Dr. A.
                    Chatzimparmpas at <a href="mailto:a.chatzimparmpas@uu.nl">a.chatzimparmpas@uu.nl</a>.
                </SectionText>
                <CheckboxRow htmlFor="consent-confirmation">
                    <Checkbox
                        id="consent-confirmation"
                        type="checkbox"
                        checked={consentConfirmed}
                        onChange={(event) => setConsentConfirmed(event.target.checked)}
                    />
                    I confirm that I have read this information, understand my rights, and consent to participate in this
                    study.
                </CheckboxRow>
                <ButtonRow>
                    <Button type="button" variant="secondary" onClick={() => navigate("/")}>
                        Go back
                    </Button>
                    <Button type="button" onClick={handleContinue} disabled={!consentConfirmed}>
                        Continue
                    </Button>
                </ButtonRow>
            </Content>
        </Page>
    );
}

export default Consent;
