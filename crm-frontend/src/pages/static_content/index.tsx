import PageWrapper from "./PageWrapper";
import TermsMd from "./content/Terms.txt";
import PrivacyMd from "./content/Privacy.txt";
import RefundMd from "./content/Refund.txt";


export const PrivacyPage = () => <PageWrapper pageTitle="Privacy Policy" md={PrivacyMd} />
export const TermsPage = () => <PageWrapper pageTitle="Terms and Conditions" md={TermsMd} />
export const RefundPolicyPage = () => <PageWrapper pageTitle="Refund Policy" md={RefundMd} />


