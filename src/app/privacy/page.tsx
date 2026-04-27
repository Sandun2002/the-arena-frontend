/* eslint-disable react/no-unescaped-entities */
import Link from "next/link";

const tocItems = [
  { id: "intro", label: "1. Introduction" },
  { id: "about", label: "2. About Us" },
  { id: "scope", label: "3. Scope & Applicability" },
  { id: "age", label: "4. Age Restriction" },
  { id: "data", label: "5. Data We Collect" },
  { id: "collection", label: "6. How We Collect Data" },
  { id: "legal-basis", label: "7. Legal Basis" },
  { id: "cookies", label: "8. Cookies & Analytics" },
  { id: "use", label: "9. How We Use Your Data" },
  { id: "sharing", label: "10. Data Sharing" },
  { id: "retention", label: "11. Data Retention" },
  { id: "security", label: "12. Data Security" },
  { id: "rights", label: "13. Your Rights" },
  { id: "deletion", label: "14. Account Deletion" },
  { id: "thirdparty", label: "15. Third-Party Links" },
  { id: "changes", label: "16. Policy Changes" },
  { id: "law", label: "17. Governing Law" },
  { id: "contact", label: "18. Contact Us" },
];

function Section({
  id,
  number,
  title,
  children,
}: {
  id: string;
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 md:scroll-mt-28 border-b border-default pb-8 md:pb-10 mb-8 md:mb-10">
      <p className="text-xs font-bold tracking-[0.18em] uppercase text-emerald-400 mb-2">Section {number}</p>
      <h2 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-primary mb-4 md:mb-5">{title}</h2>
      <div className="space-y-4 text-secondary leading-7 md:leading-8 text-[14px] md:text-[15px]">{children}</div>
    </section>
  );
}

function SubHeading({ children }: { children: React.ReactNode }) {
  return <h3 className="text-primary text-base md:text-lg font-bold mt-6 md:mt-7 mb-2">{children}</h3>;
}

function BulletList({ children }: { children: React.ReactNode }) {
  return <ul className="space-y-2 pl-5 list-disc marker:text-emerald-400">{children}</ul>;
}

function RightCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-xl border border-default bg-surface-raised/50 p-5 hover:border-emerald-500/40 transition-colors">
      <p className="text-primary font-bold text-sm mb-2">{title}</p>
      <p className="text-secondary text-sm leading-6">{description}</p>
    </div>
  );
}

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-surface-base text-secondary pt-24 md:pt-28 pb-14 md:pb-20 relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[420px] h-[420px] bg-emerald-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[420px] h-[420px] bg-emerald-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-[260px,1fr] gap-6 md:gap-10">
          <aside data-lenis-prevent className="hidden lg:block sticky top-28 h-fit max-h-[calc(100vh-8rem)] overflow-y-auto pr-2">
            <p className="text-xs text-muted uppercase tracking-[0.18em] font-bold border-b border-default pb-3 mb-4">Contents</p>
            <nav className="space-y-1">
              {tocItems.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className="block text-sm text-muted hover:text-emerald-400 transition-colors"
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </aside>

          <div>
            <header className="mb-8 md:mb-12 border-b border-default pb-8 md:pb-10">
              <span className="inline-flex px-3 py-1 rounded-full bg-surface-raised border border-default text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                Legal Document
              </span>
              <h1 className="mt-5 text-3xl sm:text-4xl md:text-6xl font-black tracking-tight text-primary">
                Privacy <span className="text-emerald-500">Policy</span>
              </h1>
              <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-secondary">
                <span>Operated by <span className="text-primary font-semibold">Astryx Global (Pvt) Ltd</span></span>
                <span>Effective: <span className="text-primary font-semibold">[INSERT DATE]</span></span>
                <span>Last Updated: <span className="text-primary font-semibold">[INSERT DATE]</span></span>
              </div>
              <p className="mt-6 border-l-[3px] border-l-emerald-500/50 bg-surface-raised/60 pl-5 pr-4 py-4 leading-7 md:leading-8 text-[14px] md:text-[15px] rounded-r-lg">
                This Privacy Policy explains how The Arena collects, uses, stores, and protects your personal data. It is prepared
                in compliance with Sri Lanka's <strong>Personal Data Protection Act No. 9 of 2022 (PDPA)</strong> and the
                <strong> Electronic Transactions Act No. 19 of 2006</strong>. By using the Platform, you agree to the terms of this
                Policy.
              </p>
            </header>

            <details className="lg:hidden mb-8 rounded-xl border border-default bg-surface-raised/50">
              <summary className="cursor-pointer list-none px-4 py-3 text-sm font-semibold text-primary flex items-center justify-between">
                Jump to Section
                <span className="text-xs uppercase tracking-wider text-muted">18 items</span>
              </summary>
              <nav data-lenis-prevent className="px-4 pb-4 pt-1 space-y-1 max-h-64 overflow-y-auto border-t border-default">
                {tocItems.map((item) => (
                  <a
                    key={`mobile-${item.id}`}
                    href={`#${item.id}`}
                    className="block text-sm text-secondary hover:text-emerald-400 transition-colors"
                  >
                    {item.label}
                  </a>
                ))}
              </nav>
            </details>

            <Section id="intro" number="01" title="Introduction">
              <p>
                This Privacy Policy ("Policy") describes how Astryx Global (Pvt) Ltd, a company incorporated under the laws of Sri
                Lanka ("we", "us", "our", or "the Company"), collects, uses, stores, shares, and protects the personal data of
                individuals who use The Arena platform ("Platform"), accessible via our web-based application.
              </p>
              <p>
                The Arena is a digital marketplace that operates exclusively within Sri Lanka, acting solely as an intermediary
                connecting end-users ("Players") with third-party indoor sports facility operators ("Vendors"). The Arena does not
                own, operate, or maintain any of the sports facilities listed on the Platform.
              </p>
              <p>
                By accessing or using the Platform, you acknowledge that you have read, understood, and agree to be bound by this
                Policy. If you do not agree, you must immediately cease using the Platform.
              </p>
            </Section>

            <Section id="about" number="02" title="About Us and Our Role">
              <p>
                For the purposes of the PDPA, Astryx Global (Pvt) Ltd is the <strong>Controller</strong> of personal data collected
                through the Platform. In our capacity as a marketplace intermediary, we also act as a <strong>Processor</strong> for
                certain personal data we handle on behalf of Vendors to facilitate bookings.
              </p>
              <div className="rounded-2xl border border-default bg-surface-raised/50 p-6 space-y-2">
                <p className="text-primary font-bold">Astryx Global (Pvt) Ltd</p>
                <p><strong>Address:</strong> [Registered Address Placeholder]</p>
                <p><strong>Reg. No.:</strong> [Company Registration No. Placeholder]</p>
                <p><strong>DPO Email:</strong> [privacy@placeholder.com]</p>
                <p><strong>DPO Name:</strong> [Name Placeholder]</p>
              </div>
            </Section>

            <Section id="scope" number="03" title="Scope and Applicability">
              <p>This Policy applies to:</p>
              <BulletList>
                <li>All <strong>Players (end-users)</strong> who register for an account, browse the Platform, or make a booking;</li>
                <li>All <strong>Vendors</strong> who register and list sports facilities on the Platform; and</li>
                <li>Any other individuals whose personal data is processed in connection with the Platform.</li>
              </BulletList>
              <p>
                This Policy does not apply to third-party websites, services, or applications linked to or accessible through the
                Platform. We are not responsible for the privacy practices of such third parties and encourage you to review their
                respective privacy policies.
              </p>
            </Section>

            <Section id="age" number="04" title="Age Restriction and Eligibility">
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-primary">
                The Platform is intended exclusively for individuals who are <strong>18 years of age or older</strong>. By using the
                Platform and providing your personal data, you represent and warrant that you meet this age requirement.
              </div>
              <p>
                We do not knowingly collect, process, or store personal data from individuals under the age of 18. If we become
                aware that personal data has been provided by a minor, we will take immediate steps to delete such data from our
                records. If you believe a minor has registered on the Platform, please contact us immediately at
                [privacy@placeholder.com].
              </p>
            </Section>

            <Section id="data" number="05" title="Personal Data We Collect">
              <p>
                We collect the minimum personal data necessary to provide the services offered through the Platform. We do not
                collect personal data beyond what is described in this Policy.
              </p>

              <SubHeading>5.1 Account Registration Data</SubHeading>
              <p>When you register an account — whether as a Player or Vendor — we collect:</p>
              <div className="overflow-x-auto">
                <table className="w-full text-left border border-default text-sm">
                  <thead>
                    <tr className="bg-surface-raised/70">
                      <th className="p-3 border border-default text-primary uppercase text-xs tracking-wider">Data</th>
                      <th className="p-3 border border-default text-primary uppercase text-xs tracking-wider">Purpose</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-3 border border-default"><strong>Full Name</strong></td>
                      <td className="p-3 border border-default">Identity verification and personalisation</td>
                    </tr>
                    <tr>
                      <td className="p-3 border border-default"><strong>Email Address</strong></td>
                      <td className="p-3 border border-default">Account creation, login, booking confirmations, and service communications</td>
                    </tr>
                    <tr>
                      <td className="p-3 border border-default"><strong>Phone Number</strong></td>
                      <td className="p-3 border border-default">Account verification, booking management, and Vendor communication for confirmed bookings</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <SubHeading>5.2 Location Data</SubHeading>
              <span className="inline-flex px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                Ephemeral — Never Stored
              </span>
              <p>
                With your explicit consent, the Platform accesses your device's live location (GPS coordinates) on a strictly
                ephemeral basis, solely to identify and display indoor sports facilities near you.
              </p>
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-200">
                <p className="mb-2">We make the following unambiguous representations regarding your location data:</p>
                <BulletList>
                  <li>Your location is accessed <strong>only at the moment of your request</strong> and used solely to return nearby venue results.</li>
                  <li>Your location data is <strong>NOT persistently stored</strong> in our databases, servers, or any data storage medium.</li>
                  <li>Your location data is <strong>NOT tracked, logged, or retained</strong> after your search query is processed.</li>
                  <li>Your location data is <strong>NOT used</strong> for profiling, behavioural analytics, or any marketing or advertising purpose whatsoever.</li>
                </BulletList>
              </div>
              <p>
                You may revoke location access at any time by disabling location permissions in your device settings. Other
                Platform features will remain fully functional.
              </p>

              <SubHeading>5.3 Transaction and Payment Data</SubHeading>
              <p>
                All payment processing is handled exclusively by <strong>PayHere</strong>, a third-party payment gateway. We do not
                collect, process, or store any raw financial data including credit card numbers, debit card numbers, or bank
                account details.
              </p>
              <p>The only payment-related data retained by the Company:</p>
              <BulletList>
                <li><strong>Transaction ID</strong> — A unique reference number assigned by PayHere upon completion of a transaction, used for booking reference and dispute resolution.</li>
                <li><strong>Payment Status</strong> — The outcome of a transaction (e.g., successful, failed, pending, refunded), used for booking management.</li>
              </BulletList>

              <SubHeading>5.4 Device, Technical, and Usage Data</SubHeading>
              <p>
                When you access the Platform, we may automatically collect technical information including your IP address, browser
                type, device type, operating system, pages visited, session duration, and referring URLs. This data is collected
                through cookies and Google Analytics and is used to improve the Platform. It does not on its own identify you
                personally.
              </p>
            </Section>

            <Section id="collection" number="06" title="How We Collect Your Personal Data">
              <BulletList>
                <li><strong>Directly from you</strong> — When you register, complete your profile, or make a booking.</li>
                <li><strong>Automatically</strong> — Through cookies and analytics tools when you interact with the Platform.</li>
                <li><strong>From your device</strong> — Location data accessed with your consent via your device's GPS.</li>
                <li><strong>From third-party processors</strong> — Transaction metadata (ID, status) received from PayHere upon payment completion.</li>
              </BulletList>
            </Section>

            <Section id="legal-basis" number="07" title="Legal Basis for Processing">
              <p>In accordance with the PDPA, we process your personal data on the following lawful bases:</p>
              <BulletList>
                <li><strong>Performance of a Contract</strong> — Processing necessary to fulfil a booking, manage your account, and communicate about your use of the Platform.</li>
                <li><strong>Consent</strong> — For location data, non-essential cookies, and Google Analytics. You may withdraw consent at any time without affecting prior lawful processing.</li>
                <li><strong>Legal Obligation</strong> — Processing necessary to comply with Sri Lankan laws and lawful requests from regulatory or law enforcement authorities.</li>
                <li><strong>Legitimate Interests</strong> — For fraud prevention, platform security, and service improvement, where such interests are not overridden by your fundamental rights.</li>
              </BulletList>
            </Section>

            <Section id="cookies" number="08" title="Cookies and Analytics">
              <SubHeading>8.1 What Are Cookies</SubHeading>
              <p>
                Cookies are small text files placed on your device when you access a website. They enable the website to remember
                preferences, maintain sessions, and collect usage information.
              </p>

              <SubHeading>8.2 How We Use Cookies</SubHeading>
              <div className="overflow-x-auto">
                <table className="w-full text-left border border-default text-sm">
                  <thead>
                    <tr className="bg-surface-raised/70">
                      <th className="p-3 border border-default text-primary uppercase text-xs tracking-wider">Cookie Type</th>
                      <th className="p-3 border border-default text-primary uppercase text-xs tracking-wider">Purpose</th>
                      <th className="p-3 border border-default text-primary uppercase text-xs tracking-wider">Can Be Disabled?</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-3 border border-default"><strong>Strictly Necessary</strong></td>
                      <td className="p-3 border border-default">Essential for login sessions and secure Platform access</td>
                      <td className="p-3 border border-default">No</td>
                    </tr>
                    <tr>
                      <td className="p-3 border border-default"><strong>Functional</strong></td>
                      <td className="p-3 border border-default">Remembers your preferences and display settings</td>
                      <td className="p-3 border border-default">Yes</td>
                    </tr>
                    <tr>
                      <td className="p-3 border border-default"><strong>Analytics (Google Analytics)</strong></td>
                      <td className="p-3 border border-default">Collects anonymised data on how users interact with the Platform to help us improve the experience</td>
                      <td className="p-3 border border-default">Yes</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <SubHeading>8.3 Managing Cookies</SubHeading>
              <p>
                You may manage cookie preferences through your browser settings. Disabling certain cookies may affect Platform
                functionality. To opt out of Google Analytics tracking specifically, use the{" "}
                <a
                  href="https://tools.google.com/dlpage/gaoptout"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:text-emerald-300"
                >
                  Google Analytics Opt-Out Browser Add-on
                </a>
                .
              </p>
              <p>
                By continuing to use the Platform without adjusting your cookie settings, you consent to our use of cookies as
                described in this section.
              </p>
            </Section>

            <Section id="use" number="09" title="How We Use Your Personal Data">
              <BulletList>
                <li><strong>Account Creation & Management</strong> — To register your account, authenticate your identity, and maintain your profile.</li>
                <li><strong>Booking Facilitation</strong> — To process venue booking requests, confirm reservations, and manage the booking lifecycle.</li>
                <li><strong>Service Communications</strong> — To send booking confirmations, payment receipts, reminders, and cancellation notices.</li>
                <li><strong>Customer Support</strong> — To respond to your queries, complaints, and requests for assistance.</li>
                <li><strong>Venue Discovery</strong> — To use your ephemeral location data (with consent) to display nearby sports facilities.</li>
                <li><strong>Platform Improvement</strong> — To analyse aggregated usage data and improve features and the user experience.</li>
                <li><strong>Legal Compliance</strong> — To comply with Sri Lankan laws and lawful requests from governmental or regulatory authorities.</li>
                <li><strong>Fraud Prevention & Security</strong> — To detect, investigate, and prevent fraudulent transactions and unauthorised access.</li>
              </BulletList>
              <p>
                We will not use your personal data for any purpose incompatible with those listed above without obtaining your prior
                consent.
              </p>
            </Section>

            <Section id="sharing" number="10" title="Disclosure and Sharing of Personal Data">
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-primary">
                We do not sell, rent, or trade your personal data to third parties for their own commercial or marketing purposes.
              </div>
              <p>We may share your personal data only in the following strictly defined circumstances:</p>

              <SubHeading>10.1 With Vendors (Sports Facilities)</SubHeading>
              <p>When you complete a booking, we share the following with the specific Vendor at which the booking is made:</p>
              <BulletList>
                <li>Your <strong>Full Name</strong></li>
                <li>Your <strong>Phone Number</strong></li>
              </BulletList>
              <p>
                This data is shared solely to enable the Vendor to manage your booking and confirm your arrival. Vendors are
                contractually prohibited from using this data for any other purpose or retaining it beyond what is necessary for
                booking management.
              </p>

              <SubHeading>10.2 With Payment Processor (PayHere)</SubHeading>
              <p>
                When you make a payment, you interact with PayHere's secure payment environment. Basic booking reference
                information may be shared with PayHere to process your transaction. We do not transmit your financial details to
                PayHere — these are entered directly into PayHere's secure interface.
              </p>

              <SubHeading>10.3 With Analytics Provider (Google Analytics)</SubHeading>
              <p>
                We share anonymised, aggregated usage data with Google LLC through Google Analytics. This data does not identify you
                personally and is used solely to analyse Platform performance.
              </p>

              <SubHeading>10.4 Legal and Regulatory Disclosures</SubHeading>
              <p>
                We may disclose your personal data to government authorities, regulatory bodies, law enforcement agencies, or courts
                if required by applicable law or regulation. Where legally permissible, we will endeavour to notify you before such
                disclosure.
              </p>

              <SubHeading>10.5 Business Transfers</SubHeading>
              <p>
                In the event of a merger, acquisition, or sale of assets of Astryx Global (Pvt) Ltd, your personal data may be
                transferred to the successor entity. We will take reasonable steps to ensure confidentiality is maintained and will
                notify you of such a transfer prior to completion where practicable.
              </p>
            </Section>

            <Section id="retention" number="11" title="Data Retention">
              <p>
                We retain your personal data only for as long as necessary to fulfil the purposes for which it was collected,
                including to comply with legal, accounting, or reporting obligations.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-left border border-default text-sm">
                  <thead>
                    <tr className="bg-surface-raised/70">
                      <th className="p-3 border border-default text-primary uppercase text-xs tracking-wider">Data Type</th>
                      <th className="p-3 border border-default text-primary uppercase text-xs tracking-wider">Retention Period</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-3 border border-default"><strong>Active Account Data</strong></td>
                      <td className="p-3 border border-default">Duration of active account registration</td>
                    </tr>
                    <tr>
                      <td className="p-3 border border-default"><strong>Booking & Transaction Records</strong></td>
                      <td className="p-3 border border-default">As required by Sri Lankan statutory obligations (tax, financial record-keeping)</td>
                    </tr>
                    <tr>
                      <td className="p-3 border border-default"><strong>Post-Deletion Personal Data</strong></td>
                      <td className="p-3 border border-default"><strong>90 days</strong> from the date the deletion request is processed, then permanently deleted</td>
                    </tr>
                    <tr>
                      <td className="p-3 border border-default"><strong>Location Data</strong></td>
                      <td className="p-3 border border-default"><strong>Not retained</strong> — processed in real-time and immediately discarded</td>
                    </tr>
                    <tr>
                      <td className="p-3 border border-default"><strong>Anonymised / Aggregated Data</strong></td>
                      <td className="p-3 border border-default">Retained indefinitely for analytical purposes</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p>
                The 90-day post-deletion retention period exists to allow resolution of outstanding disputes, comply with legal
                obligations, and facilitate system backup and integrity processes. Upon expiry of this period, your personal data
                will be permanently and irreversibly deleted from our active systems.
              </p>
            </Section>

            <Section id="security" number="12" title="Data Security">
              <p>
                We implement appropriate technical and organisational measures to protect your personal data against unauthorised
                access, disclosure, alteration, loss, or destruction, including:
              </p>
              <BulletList>
                <li>Encryption of data in transit using industry-standard <strong>TLS/HTTPS</strong> protocols;</li>
                <li><strong>Access controls and authentication mechanisms</strong> restricting internal access to authorised personnel only;</li>
                <li>Regular <strong>security assessments</strong> and vulnerability testing of our systems; and</li>
                <li><strong>Contractual data protection obligations</strong> imposed on all third-party service providers who process data on our behalf.</li>
              </BulletList>
              <p>
                No method of electronic transmission or storage is completely secure. We cannot guarantee absolute security. In the
                event of a data breach likely to result in a risk to your rights and freedoms, we will notify you and the relevant
                authorities in accordance with our obligations under the PDPA.
              </p>
            </Section>

            <Section id="rights" number="13" title="Your Rights Under the PDPA">
              <p>
                Under the Personal Data Protection Act No. 9 of 2022, you have the following rights. To exercise any of these
                rights, submit a written request to <strong>[privacy@placeholder.com]</strong>.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 mt-2">
                <RightCard
                  title="Right of Access"
                  description="Request a copy of the personal data we hold about you and information on how we process it."
                />
                <RightCard
                  title="Right to Rectification"
                  description="Request correction of any inaccurate or incomplete personal data we hold about you."
                />
                <RightCard
                  title="Right to Erasure"
                  description="Request deletion of your personal data where there is no valid legal basis for continued processing."
                />
                <RightCard
                  title="Right to Restriction"
                  description="Request that we restrict processing of your data in certain circumstances, such as where you contest its accuracy."
                />
                <RightCard
                  title="Right to Portability"
                  description="Receive your data in a structured, machine-readable format and transfer it to another controller where feasible."
                />
                <RightCard
                  title="Right to Object"
                  description="Object to processing where we rely on legitimate interests as our legal basis."
                />
                <RightCard
                  title="Right to Withdraw Consent"
                  description="Withdraw consent at any time where we rely on consent as our legal basis, without affecting prior lawful processing."
                />
              </div>
              <p>
                We will respond to all rights requests within the timeframe stipulated by the PDPA. We may require identity
                verification before processing your request.
              </p>
            </Section>

            <Section id="deletion" number="14" title="Account Deletion">
              <p>You may request deletion of your account and associated personal data at any time by:</p>
              <BulletList>
                <li>Submitting a deletion request through the <strong>account settings</strong> section of the Platform; or</li>
                <li>Sending a written request to <strong>[privacy@placeholder.com]</strong> from your registered email address.</li>
              </BulletList>
              <p>
                Upon receipt of a valid deletion request, we will acknowledge within [X] business days, process the deletion within
                [X] business days of identity verification, retain your personal data for 90 days as described in Section 11, and
                then permanently delete it.
              </p>
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                <p>
                  Please note that certain booking or transaction records may be retained beyond account deletion if required by
                  applicable Sri Lankan statutory obligations. You will be informed of any such retention at the time of your
                  deletion request.
                </p>
                <p className="mt-2">
                  Account deletion is <strong>irreversible</strong> upon expiry of the 90-day retention period. All booking history,
                  saved preferences, and account-related data will be permanently lost.
                </p>
              </div>
            </Section>

            <Section id="thirdparty" number="15" title="Third-Party Links and Services">
              <p>
                The Platform may contain links to third-party websites, applications, or services — including the PayHere payment
                gateway and Google Analytics. These services are governed by their own terms and privacy policies, entirely
                independent of this Policy.
              </p>
              <p>
                We do not control, endorse, or accept responsibility for the privacy practices of any third-party service. We
                strongly encourage you to read the privacy policies of any third-party service you access through or in connection
                with the Platform before providing any personal data to such services.
              </p>
            </Section>

            <Section id="changes" number="16" title="Changes to This Privacy Policy">
              <p>
                We reserve the right to amend, update, or modify this Policy at any time. In the case of material changes —
                including changes to the categories of data we collect, the purposes for which we use your data, or the third
                parties with whom we share your data — we will endeavour to notify you by:
              </p>
              <BulletList>
                <li>Displaying a <strong>prominent notice</strong> on the Platform; and/or</li>
                <li>Sending a notification to your <strong>registered email address</strong>.</li>
              </BulletList>
              <p>
                Non-material changes will take effect immediately upon posting. The date of the most recent update is always
                indicated at the top of this document. Your continued use of the Platform following notification constitutes
                acceptance of the revised Policy.
              </p>
            </Section>

            <Section id="law" number="17" title="Governing Law and Jurisdiction">
              <p>
                This Privacy Policy is governed by and construed in accordance with the laws of the <strong>Democratic Socialist
                Republic of Sri Lanka</strong>, including but not limited to the Personal Data Protection Act No. 9 of 2022 and the
                Electronic Transactions Act No. 19 of 2006.
              </p>
              <p>
                Any dispute arising out of or in connection with this Policy shall be subject to the <strong>exclusive jurisdiction
                of the courts of Sri Lanka</strong>.
              </p>
            </Section>

            <Section id="contact" number="18" title="Contact Us and Data Protection Officer">
              <p>
                If you have any questions, concerns, or complaints regarding this Privacy Policy or our data processing practices, or
                if you wish to exercise any of the rights described in Section 13, please contact our Data Protection Officer:
              </p>
              <div className="rounded-2xl border border-default bg-surface-raised/50 p-6 space-y-2">
                <p className="text-primary font-bold">Data Protection Officer — Astryx Global (Pvt) Ltd</p>
                <p><strong>Address:</strong> [Full Registered Address Placeholder]</p>
                <p><strong>Email:</strong> [privacy@placeholder.com]</p>
                <p><strong>Phone:</strong> [+94 XX XXX XXXX]</p>
              </div>
              <p>
                We will acknowledge your inquiry within [X] business days and aim to resolve it within <strong>30 days</strong>, or
                within such other period as required by the PDPA. If you are not satisfied with our response, you have the right to
                lodge a complaint with the relevant data protection authority in Sri Lanka.
              </p>
              <p className="text-xs text-muted pt-3">
                For platform usage terms, see <Link href="/terms" className="text-emerald-400 hover:text-emerald-300">Terms of Service</Link>.
              </p>
            </Section>
          </div>
        </div>
      </div>
    </main>
  );
}
