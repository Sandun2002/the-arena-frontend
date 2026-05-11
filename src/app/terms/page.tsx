/* eslint-disable react/no-unescaped-entities */
"use client";
import Link from "next/link";
import LegalTOC from "@/components/ui/LegalTOC";

const tocItems = [
  { id: "acceptance", label: "1. Acceptance of Terms" },
  { id: "about", label: "2. About The Arena" },
  { id: "definitions", label: "3. Definitions" },
  { id: "eligibility", label: "4. Eligibility & Registration" },
  { id: "account", label: "5. Account Security" },
  { id: "booking", label: "6. Bookings & Payment" },
  { id: "fee", label: "7. Platform Service Fee" },
  { id: "cancellation", label: "8. Cancellations & Refunds" },
  { id: "vendor", label: "9. Vendor Obligations" },
  { id: "player", label: "10. Player Obligations" },
  { id: "prohibited", label: "11. Prohibited Conduct" },
  { id: "reviews", label: "12. Reviews" },
  { id: "ip", label: "13. Intellectual Property" },
  { id: "disclaimer", label: "14. Disclaimers & Liability" },
  { id: "indemnity", label: "15. Indemnification" },
  { id: "termination", label: "16. Suspension & Termination" },
  { id: "thirdparty", label: "17. Third-Party Services" },
  { id: "availability", label: "18. Platform Availability" },
  { id: "amendments", label: "19. Amendments" },
  { id: "disputes", label: "20. Dispute Resolution" },
  { id: "law", label: "21. Governing Law" },
  { id: "general", label: "22. General Provisions" },
  { id: "contact", label: "23. Contact Us" },
];

const contactEmails = ["admin@thearena.lk", "support@thearena.lk", "info@thearena.lk"];
const contactAddress = "26/12b Station Road, Dehiwala, Sri Lanka";
const primaryContactEmail = "support@thearena.lk";

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
      <div className="space-y-4 text-secondary leading-7 md:leading-8 text-[14px] md:text-[15px] break-words">{children}</div>
    </section>
  );
}

function SubHeading({ children }: { children: React.ReactNode }) {
  return <h3 className="text-primary text-base md:text-lg font-bold mt-6 md:mt-7 mb-2">{children}</h3>;
}

function BulletList({ children }: { children: React.ReactNode }) {
  return <ul className="space-y-2 pl-5 list-disc marker:text-emerald-400">{children}</ul>;
}

export default function TermsPage() {

  return (
    <main className="min-h-screen bg-surface-base text-secondary pt-24 md:pt-28 pb-14 md:pb-20 relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[420px] h-[420px] bg-emerald-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[420px] h-[420px] bg-emerald-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6 md:gap-10 lg:gap-16">
          <LegalTOC items={tocItems} />

          <div className="min-w-0">
            <header className="mb-8 md:mb-12 border-b border-default pb-8 md:pb-10">
              <span className="inline-flex px-3 py-1 rounded-full bg-surface-raised border border-default text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                Legal Document
              </span>
              <h1 className="mt-5 text-3xl sm:text-4xl md:text-6xl font-black tracking-tight text-primary">
                Terms of <span className="text-emerald-500">Service</span>
              </h1>
              <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-secondary">
                <span>Operated by <span className="text-primary font-semibold">Astryx Global (Pvt) Ltd</span></span>
                <span>Effective: <span className="text-primary font-semibold">9 May 2026</span></span>
                <span>Last Updated: <span className="text-primary font-semibold">9 May 2026</span></span>
              </div>
              <p className="mt-6 border-l-[3px] border-l-emerald-500/50 bg-surface-raised/60 pl-5 pr-4 py-4 leading-7 md:leading-8 text-[14px] md:text-[15px] rounded-r-lg">
                Please read these Terms of Service carefully before using The Arena platform. By accessing or using the Platform &mdash;
                whether as a Player or a Vendor &mdash; you agree to be legally bound by these Terms. If you do not agree, you must
                not use the Platform.
              </p>
            </header>

            <Section id="acceptance" number="01" title="Acceptance of Terms">
              <p>
                These Terms of Service ("Terms") constitute a legally binding agreement between you and Astryx Global (Pvt) Ltd,
                a company incorporated under the laws of Sri Lanka ("we", "us", "our", or "The Arena"), governing your access to
                and use of The Arena web-based platform (the "Platform").
              </p>
              <p>
                By registering an account, accessing, browsing, or using the Platform in any manner, you acknowledge that you have
                read, understood, and irrevocably agree to be bound by these Terms, our Privacy Policy, and any other policies,
                guidelines, or notices published on the Platform from time to time, all of which are incorporated herein by
                reference.
              </p>
              <p>
                If you are using the Platform on behalf of an organisation, business, or entity, you represent and warrant that you
                have full authority to bind that entity to these Terms, and references to "you" shall include that entity.
              </p>
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-200">
                If you do not agree to these Terms in whole or in part, you must immediately cease accessing or using the Platform
                and must not register an account.
              </div>
            </Section>

            <Section id="about" number="02" title="About The Arena and Our Role">
              <p>
                The Arena is a web-based digital marketplace owned and operated by Astryx Global (Pvt) Ltd, operating exclusively
                within the Democratic Socialist Republic of Sri Lanka. The Platform acts solely as a digital intermediary,
                connecting Players with Vendors to enable the discovery, availability checking, and booking of indoor sports
                facilities.
              </p>
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-primary">
                <strong>The Arena does not own, operate, manage, control, or maintain any of the sports facilities listed on the Platform.</strong>{" "}
                We are not a party to the underlying service relationship between a Player and a Vendor in respect of the use of
                any sports facility. Our role is limited to providing the Platform as a technology intermediary and facilitating the
                booking and payment process.
              </div>
              <p>
                Nothing in these Terms or in the relationship between The Arena and any user shall be construed as creating an
                employer/employee, franchisor/franchisee, agent/principal, partnership, joint venture, or any other form of joint
                undertaking.
              </p>
            </Section>

            <Section id="definitions" number="03" title="Definitions">
              <p>In these Terms, the following words and expressions shall have the meanings set out below:</p>
              <div className="overflow-x-auto">
                <table className="w-full text-left border border-default text-sm">
                  <thead>
                    <tr className="bg-surface-raised/70">
                      <th className="p-3 border border-default text-primary uppercase text-xs tracking-wider">Term</th>
                      <th className="p-3 border border-default text-primary uppercase text-xs tracking-wider">Meaning</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-3 border border-default"><strong>"Platform"</strong></td>
                      <td className="p-3 border border-default">The Arena web-based application and all associated services operated by Astryx Global (Pvt) Ltd.</td>
                    </tr>
                    <tr>
                      <td className="p-3 border border-default"><strong>"Player" / "End-User"</strong></td>
                      <td className="p-3 border border-default">Any individual who registers an account on the Platform for the purpose of discovering and booking indoor sports facilities.</td>
                    </tr>
                    <tr>
                      <td className="p-3 border border-default"><strong>"Vendor"</strong></td>
                      <td className="p-3 border border-default">Any indoor sports facility operator registered on the Platform who lists their facilities, availability, and pricing for booking by Players.</td>
                    </tr>
                    <tr>
                      <td className="p-3 border border-default"><strong>"Booking"</strong></td>
                      <td className="p-3 border border-default">A confirmed reservation of a specific time slot at a Vendor's facility, made through the Platform by a Player upon successful payment.</td>
                    </tr>
                    <tr>
                      <td className="p-3 border border-default"><strong>"Platform Service Fee"</strong></td>
                      <td className="p-3 border border-default">The fee charged by The Arena to the Player on top of the Vendor's facility price, as a consideration for use of the Platform.</td>
                    </tr>
                    <tr>
                      <td className="p-3 border border-default"><strong>"Total Booking Amount"</strong></td>
                      <td className="p-3 border border-default">The sum of the Vendor's facility price and The Arena's Platform Service Fee, displayed to the Player at checkout prior to payment confirmation.</td>
                    </tr>
                    <tr>
                      <td className="p-3 border border-default"><strong>"PayHere"</strong></td>
                      <td className="p-3 border border-default">The third-party payment gateway used by The Arena to process all transactions on the Platform.</td>
                    </tr>
                    <tr>
                      <td className="p-3 border border-default"><strong>"Content"</strong></td>
                      <td className="p-3 border border-default">All text, images, data, listings, reviews, information, and other material available on or submitted to the Platform.</td>
                    </tr>
                    <tr>
                      <td className="p-3 border border-default"><strong>"User"</strong></td>
                      <td className="p-3 border border-default">Any individual or entity accessing or using the Platform, including Players and Vendors.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Section>

            <Section id="eligibility" number="04" title="Eligibility and Account Registration">
              <SubHeading>4.1 Eligibility</SubHeading>
              <p>Use of the Platform is available exclusively to individuals who:</p>
              <BulletList>
                <li>Are <strong>18 years of age or older;</strong></li>
                <li>Are legally capable of entering into binding contracts under the laws of Sri Lanka;</li>
                <li>Are resident in or operating within the Democratic Socialist Republic of Sri Lanka; and</li>
                <li>Are not barred from using the Platform under any applicable law or by a prior suspension or termination by The Arena.</li>
              </BulletList>
              <p>
                By registering an account, you represent and warrant that you meet all of the above eligibility requirements. The
                Arena reserves the right to verify eligibility at any time and to suspend or terminate accounts where eligibility
                requirements are not met.
              </p>
              <SubHeading>4.2 Account Registration</SubHeading>
              <p>
                To access the Platform's features — including browsing listings, checking availability, and making bookings — you
                must register and maintain an active account ("Account"). During registration, you agree to provide accurate,
                current, and complete information, including your full name, email address, and phone number, and to promptly
                update such information if it changes.
              </p>
              <p>You must not:</p>
              <BulletList>
                <li>Register using false, misleading, or another person's identity or information;</li>
                <li>Create more than one Account;</li>
                <li>Register on behalf of another person without their express authorisation; or</li>
                <li>Re-register following a suspension or termination of a prior Account without The Arena's written consent.</li>
              </BulletList>
              <p>
                The Arena reserves the right to refuse registration or to suspend any Account at its sole discretion, including
                where registration information is found to be inaccurate, incomplete, or in breach of these Terms.
              </p>
              <SubHeading>4.3 Vendor Registration</SubHeading>
              <p>
                Vendors must complete a separate registration process as stipulated by The Arena from time to time. By registering
                as a Vendor, you represent and warrant that you have the legal authority to list and offer the sports facilities on
                the Platform, that all information provided in relation to your facilities is accurate and current, and that you
                have obtained all applicable licences, permits, and regulatory approvals necessary to operate your sports facility
                under Sri Lankan law.
              </p>
            </Section>

            <Section id="account" number="05" title="Account Security and Responsibilities">
              <p>You are solely responsible for maintaining the confidentiality and security of your Account credentials, including your password. You agree to:</p>
              <BulletList>
                <li>Not disclose your password or Account details to any third party;</li>
                <li>Not permit any other person to access or use your Account;</li>
                <li>Log out of your Account at the end of each session on shared or public devices;</li>
                <li>Notify The Arena immediately at <strong>{primaryContactEmail}</strong> if you become aware of any unauthorised access to or use of your Account.</li>
              </BulletList>
              <p>
                You accept full responsibility for all activities, bookings, transactions, and conduct that occur through your
                Account, whether or not authorised by you. The Arena shall not be liable for any loss or damage arising from your
                failure to maintain the security of your Account credentials.
              </p>
            </Section>

            <Section id="booking" number="06" title="Bookings and Payment">
              <SubHeading>6.1 Booking Process</SubHeading>
              <p>Players may browse available sports facilities, check available time slots, and make bookings through the Platform. To complete a booking, the Player must:</p>
              <BulletList>
                <li>Select the desired facility, date, and time slot;</li>
                <li>Review the Total Booking Amount displayed at checkout, which includes the Vendor's facility price and The Arena's Platform Service Fee; and</li>
                <li>Complete payment in full through the PayHere payment gateway.</li>
              </BulletList>
              <SubHeading>6.2 Booking Confirmation</SubHeading>
              <p>
                A booking is considered <strong>confirmed immediately upon successful completion of payment</strong> through the
                Platform. Upon confirmation, the Player will receive a booking confirmation via email and/or through the Platform.
                The confirmed booking is personal and non-transferable — it may not be assigned, resold, or transferred to any
                other person.
              </p>
              <p>
                The Arena makes no guarantee that a time slot displayed as available will remain available until the point of
                payment, as availability is subject to real-time changes by Vendors. The Arena shall not be liable for any slot
                that becomes unavailable between the time of viewing and the time of payment.
              </p>
              <SubHeading>6.3 Payment</SubHeading>
              <p>All payments on the Platform are processed exclusively through PayHere. By proceeding with a payment, you represent and warrant that:</p>
              <BulletList>
                <li>You are the authorised holder of the payment method being used;</li>
                <li>The payment details you provide are accurate and complete; and</li>
                <li>Sufficient funds or credit are available to complete the transaction.</li>
              </BulletList>
              <p>
                The Arena does not store, access, or process any raw financial data including card numbers or bank account details.
                All such data is handled exclusively by PayHere in accordance with its own security standards and privacy policy.
                The Arena retains only the transaction ID and payment status for booking management purposes.
              </p>
              <p>The Arena collects the Total Booking Amount from the Player as the merchant of record on the Platform. All payments are made in Sri Lankan Rupees (LKR).</p>
              <SubHeading>6.4 Pricing</SubHeading>
              <p>
                Facility prices displayed on the Platform are set by Vendors and are subject to change at any time at the Vendor's
                discretion. The Arena makes no representations or warranties regarding the accuracy, completeness, or currency of
                pricing information and shall not be liable for any pricing errors or discrepancies in Vendor listings. The Total
                Booking Amount displayed to the Player at checkout, prior to payment confirmation, is the definitive amount to be
                charged.
              </p>
            </Section>

            <Section id="fee" number="07" title="Platform Service Fee">
              <p>
                The Arena charges a Platform Service Fee on each booking made through the Platform. This fee is charged to the
                Player in addition to the Vendor's facility price and is displayed separately and transparently as part of the Total
                Booking Amount at checkout, prior to the Player confirming payment.
              </p>
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-200">
                <strong>The Platform Service Fee is strictly non-refundable under all circumstances</strong>, including in the event
                of booking cancellation, Vendor cancellation, no-show by the Player, or any dispute between a Player and a Vendor.
                The Platform Service Fee is consideration for The Arena's provision of the Platform and booking facilitation
                services and is earned upon booking confirmation.
              </div>
              <p>
                The Arena reserves the right to revise the Platform Service Fee at any time. Any change to the Platform Service Fee
                will be reflected in the Total Booking Amount displayed at checkout at the time of booking and will not affect
                bookings already confirmed prior to such change.
              </p>
            </Section>

            <Section id="cancellation" number="08" title="Cancellations and Refunds">
              <SubHeading>8.1 The Arena's Role in Refunds</SubHeading>
              <p>
                The Arena acts as a digital intermediary and is not the provider of the underlying sports facility services.
                Accordingly, <strong>The Arena does not administer, process, or guarantee refunds</strong> of the Vendor's facility
                price component of any booking. All refund requests in relation to the facility price must be directed by the Player
                to the relevant Vendor directly.
              </p>
              <SubHeading>8.2 Player Cancellations and No-Shows</SubHeading>
              <p>
                If a Player fails to attend a confirmed booking ("no-show") or cancels a booking, <strong>no refund of any amount
                — including the facility price or the Platform Service Fee — will be issued by The Arena</strong>. Any request for a
                refund of the facility price component in the event of a Player cancellation must be made directly to the Vendor,
                subject to the Vendor's own cancellation and refund policy.
              </p>
              <p>Players are strongly advised to review the Vendor's cancellation policy, where available on the Platform, prior to making a booking.</p>
              <SubHeading>8.3 Vendor Cancellations</SubHeading>
              <p>
                If a Vendor cancels a confirmed booking or is unable to honour a confirmed booking for any reason, the
                <strong> Vendor bears sole responsibility for refunding the facility price component</strong> of the booking to the
                affected Player. In such circumstances, the Player must contact the Vendor directly to arrange the refund.
              </p>
              <p>
                The Platform Service Fee charged by The Arena remains non-refundable even in the event of a Vendor cancellation, as
                it represents consideration for the booking facilitation services already rendered by The Arena.
              </p>
              <SubHeading>8.4 Refund Disputes</SubHeading>
              <p>
                In the event that a Player is unable to obtain a refund from a Vendor following a Vendor cancellation, the Player
                may report the matter to The Arena at <strong>{primaryContactEmail}</strong>. The Arena may, at its sole
                discretion and without obligation, investigate the matter and take appropriate action against the Vendor in
                accordance with Section 9. The Arena assumes no financial liability in connection with any such dispute and shall
                not be required to compensate the Player for any unrecovered facility price.
              </p>
            </Section>

            <Section id="vendor" number="09" title="Vendor Obligations">
              <p>By registering and listing facilities on the Platform, each Vendor irrevocably agrees to the following obligations:</p>
              <SubHeading>9.1 Accuracy of Listings</SubHeading>
              <p>
                Vendors are solely responsible for ensuring that all information in their listings — including facility descriptions,
                amenities, pricing, and <strong>availability</strong> — is accurate, complete, and kept up to date at all times.
                Vendors must update their availability on the Platform in real time to prevent confirmed bookings from being made
                for unavailable slots.
              </p>
              <SubHeading>9.2 Honouring Confirmed Bookings</SubHeading>
              <p>
                Vendors must honour all bookings confirmed through the Platform. A confirmed booking constitutes a binding
                commitment by the Vendor to make the booked facility available to the Player at the specified date, time, and
                terms. Vendors must not cancel confirmed bookings except in circumstances of genuine emergency or force majeure.
                In any event where a Vendor cancels a confirmed booking, the Vendor must promptly refund the facility price to the
                affected Player.
              </p>
              <SubHeading>9.3 Facility Standards and Compliance</SubHeading>
              <BulletList>
                <li>Maintaining their sports facilities in a safe, clean, and functional condition;</li>
                <li>Ensuring their facilities comply with all applicable Sri Lankan health, safety, and operational laws and regulations;</li>
                <li>Holding all required licences, permits, and insurance necessary to operate their sports facility; and</li>
                <li>Ensuring the safety and welfare of Players using their facilities.</li>
              </BulletList>
              <p>The Arena makes no representations or warranties regarding the condition, safety, or standards of any Vendor's facility. Players use Vendor facilities entirely at their own risk.</p>
              <SubHeading>9.4 Player Data</SubHeading>
              <p>
                Vendors acknowledge that personal data shared with them by The Arena (specifically, a Player's name and phone
                number in connection with a confirmed booking) is provided solely for the purpose of managing that specific booking.
                Vendors must not use such data for any other purpose, including but not limited to marketing, solicitation, or
                further disclosure to third parties. Vendors must handle all such data in compliance with the Personal Data
                Protection Act No. 9 of 2022 of Sri Lanka.
              </p>
              <SubHeading>9.5 Vendor Suspension and Removal</SubHeading>
              <BulletList>
                <li>Repeated failure to maintain accurate availability information causing confirmed bookings for unavailable slots;</li>
                <li>Failure to honour confirmed bookings without reasonable cause;</li>
                <li>Failure to refund Players following a Vendor-initiated cancellation;</li>
                <li>Conduct that endangers the safety or welfare of Players;</li>
                <li>Provision of false, misleading, or fraudulent listing information;</li>
                <li>Misuse of Player personal data in violation of applicable law; or</li>
                <li>Any other material breach of these Terms.</li>
              </BulletList>
            </Section>

            <Section id="player" number="10" title="Player Obligations">
              <p>By using the Platform to make bookings, each Player agrees to the following:</p>
              <BulletList>
                <li>Attend confirmed bookings punctually and comply with all rules, policies, and instructions of the Vendor at the booked facility;</li>
                <li>Treat all Vendor facilities, equipment, and property with reasonable care and not cause or permit any damage, destruction, or injury;</li>
                <li>Not exceed the number of persons permitted under the booking;</li>
                <li>Leave the booked facility in a clean and tidy condition at the conclusion of the booking;</li>
                <li>Conduct themselves in a lawful, respectful, and reasonable manner at all times while on Vendor premises;</li>
                <li>Not make any alterations to the setup or configuration of a facility without the Vendor's explicit permission; and</li>
                <li>Not resell, transfer, or assign a confirmed booking to any other person.</li>
              </BulletList>
              <p>
                Players acknowledge and agree that their use of any sports facility is governed by the relationship between the
                Player and the Vendor. The Arena has no responsibility for and expressly disclaims all liability in connection with
                anything that occurs at a Vendor's facility, including but not limited to personal injury, property damage, or any
                other loss.
              </p>
            </Section>

            <Section id="prohibited" number="11" title="Prohibited Conduct">
              <p>All users of the Platform are strictly prohibited from the following:</p>
              <SubHeading>11.1 Unlawful and Harmful Use</SubHeading>
              <BulletList>
                <li>Using the Platform for any purpose that is unlawful, fraudulent, or prohibited under Sri Lankan law or these Terms;</li>
                <li>Submitting false, inaccurate, or misleading information at any point during registration or use of the Platform;</li>
                <li>Impersonating any person or entity or misrepresenting your affiliation with any person or entity;</li>
                <li>Using another person's account or permitting another person to use your account.</li>
              </BulletList>
              <SubHeading>11.2 Platform Integrity</SubHeading>
              <BulletList>
                <li>Attempting to gain unauthorised access to any part of the Platform, its servers, databases, or any systems connected to the Platform;</li>
                <li>Introducing viruses, trojans, malware, spyware, or any other malicious code to the Platform;</li>
                <li>Using automated tools, bots, scrapers, crawlers, or similar technologies to access, extract, or monitor the Platform without The Arena's prior written consent;</li>
                <li>Probing, scanning, or testing the vulnerability of the Platform or any network connected to it;</li>
                <li>Taking any action that imposes an unreasonable or disproportionate load on the Platform's infrastructure.</li>
              </BulletList>
              <SubHeading>11.3 Content and Communications</SubHeading>
              <BulletList>
                <li>Posting, uploading, or transmitting any content that is defamatory, obscene, harassing, threatening, abusive, hateful, discriminatory, or otherwise unlawful;</li>
                <li>Transmitting unsolicited commercial communications, spam, or chain messages to other users;</li>
                <li>Posting content that infringes the intellectual property rights, privacy rights, or any other rights of any third party;</li>
                <li>Engaging in conduct that disrupts, degrades, or interferes with other users' ability to use the Platform.</li>
              </BulletList>
              <SubHeading>11.4 Commercial Misuse</SubHeading>
              <BulletList>
                <li>Reselling, sublicensing, or commercially exploiting any part of the Platform or its content without The Arena's prior written consent;</li>
                <li>Using the Platform to solicit users to use competing services;</li>
                <li>Reproducing, copying, or distributing any content from the Platform for commercial purposes without authorisation.</li>
              </BulletList>
            </Section>

            <Section id="reviews" number="12" title="Reviews">
              <p>The Arena provides Players with the ability to post reviews of Vendor facilities on the Platform, subject to the following conditions:</p>
              <BulletList>
                <li><strong>Eligibility to Review:</strong> Only Players who have completed a confirmed and attended booking at a specific Vendor's facility are permitted to post a review of that facility. Reviews from unverified or non-transacting users will not be accepted.</li>
                <li><strong>Accuracy and Honesty:</strong> Reviews must be based on the Player's genuine first-hand experience at the facility. Players must not post false, misleading, fabricated, or malicious reviews.</li>
                <li><strong>Content Standards:</strong> Reviews must not contain defamatory, abusive, threatening, discriminatory, or otherwise unlawful content. Reviews that violate these standards will be removed.</li>
                <li><strong>Moderation:</strong> The Arena reserves the right, at its sole discretion, to remove, edit, or decline to publish any review that violates these Terms or that is determined to be fraudulent, abusive, or otherwise contrary to the integrity of the Platform.</li>
              </BulletList>
              <p>
                Reviews posted by Players represent the individual opinion of the reviewer and do not represent the views,
                endorsements, or positions of The Arena. The Arena makes no representations or warranties regarding the accuracy or
                reliability of any review posted on the Platform.
              </p>
            </Section>

            <Section id="ip" number="13" title="Intellectual Property">
              <SubHeading>13.1 The Arena's Intellectual Property</SubHeading>
              <p>
                The Arena, including its name, logo, brand identity, platform design, underlying code, features, functionality,
                content, and all associated intellectual property rights, is owned by and vested exclusively in Astryx Global (Pvt)
                Ltd. All such rights are protected under Sri Lankan and applicable international intellectual property laws.
              </p>
              <p>You must not, without The Arena's prior written consent:</p>
              <BulletList>
                <li>Reproduce, copy, distribute, modify, or create derivative works from any part of the Platform or its content;</li>
                <li>Use The Arena's name, logo, or brand identity in any manner whatsoever, including in advertising, promotional materials, or any public-facing communication;</li>
                <li>Represent or imply any affiliation with, endorsement by, or association with The Arena; or</li>
                <li>Frame, deep-link, or screen-scrape any part of the Platform.</li>
              </BulletList>
              <SubHeading>13.2 User-Submitted Content</SubHeading>
              <p>
                By submitting any content to the Platform — including reviews, profile information, or any other material — you
                grant The Arena a non-exclusive, royalty-free, worldwide, perpetual licence to use, display, reproduce, and
                distribute such content on the Platform solely in connection with the operation and promotion of the Platform. You
                represent and warrant that you own or have the necessary rights to grant this licence and that your submitted
                content does not infringe any third-party rights.
              </p>
              <p>You retain ownership of any content you submit. The Arena does not claim ownership of user-submitted content.</p>
              <SubHeading>13.3 Limited Licence to Users</SubHeading>
              <p>
                Subject to your compliance with these Terms, The Arena grants you a limited, non-exclusive, non-transferable,
                revocable licence to access and use the Platform solely for its intended personal, non-commercial purpose. This
                licence does not include any right to resell or commercially exploit the Platform or its content.
              </p>
            </Section>

            <Section id="disclaimer" number="14" title="Disclaimers and Limitation of Liability">
              <SubHeading>14.1 Platform Provided "As Is"</SubHeading>
              <p>
                The Platform is provided on an "as is" and "as available" basis without warranties of any kind, whether express or
                implied, including but not limited to implied warranties of merchantability, fitness for a particular purpose, or
                non-infringement. The Arena does not warrant that the Platform will be uninterrupted, error-free, secure, or free
                of viruses or other harmful components.
              </p>
              <SubHeading>14.2 No Warranty Regarding Vendors</SubHeading>
              <BulletList>
                <li>The quality, safety, condition, suitability, or legality of any Vendor's facility or services;</li>
                <li>The accuracy, completeness, or currency of any Vendor's listing information, pricing, or availability;</li>
                <li>The ability of any Vendor to honour a confirmed booking; or</li>
                <li>The conduct of any Vendor or Player before, during, or after a booking.</li>
              </BulletList>
              <SubHeading>14.3 Limitation of Liability</SubHeading>
              <BulletList>
                <li>Loss of profits, revenue, data, or goodwill;</li>
                <li>Personal injury, bodily harm, or death occurring at a Vendor's facility;</li>
                <li>Property damage occurring at or in connection with a Vendor's facility;</li>
                <li>Any loss arising from a Vendor's failure to honour a confirmed booking; or</li>
                <li>Any unauthorised access to or alteration of your data.</li>
              </BulletList>
              <p className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                In any event where The Arena is found liable to you, The Arena's total aggregate liability shall be <strong>strictly
                limited to the Total Booking Amount paid by you in respect of the specific transaction giving rise to the claim</strong>,
                excluding the Platform Service Fee which is non-refundable.
              </p>
              <p>
                Nothing in these Terms excludes or limits The Arena's liability for death or personal injury caused by The Arena's
                own gross negligence, fraud, or fraudulent misrepresentation, or any other liability that cannot be excluded or
                limited by applicable Sri Lankan law.
              </p>
              <SubHeading>14.4 Physical Activity Risk</SubHeading>
              <p>
                You acknowledge that participation in sports and physical activities carries an inherent risk of injury. The Arena is
                a booking platform only and is not responsible for any injury, illness, accident, or other harm that may occur
                during your use of any sports facility booked through the Platform. You participate in all physical activities
                entirely at your own risk.
              </p>
            </Section>

            <Section id="indemnity" number="15" title="Indemnification">
              <p>
                You agree to indemnify, defend, and hold harmless The Arena, Astryx Global (Pvt) Ltd, and their respective
                directors, officers, employees, agents, successors, and assigns from and against any and all claims, demands,
                losses, liabilities, costs, and expenses (including reasonable legal fees) arising out of or in connection with:
              </p>
              <BulletList>
                <li>Your use of or access to the Platform;</li>
                <li>Any breach by you of these Terms or any applicable law or regulation;</li>
                <li>Any content you submit to the Platform;</li>
                <li>Your interactions with any other user, Vendor, or third party through the Platform;</li>
                <li>Any claim by a third party arising from your conduct at a Vendor's facility; or</li>
                <li>Any infringement by you of any intellectual property or other rights of any third party.</li>
              </BulletList>
            </Section>

            <Section id="termination" number="16" title="Account Suspension and Termination">
              <SubHeading>16.1 Termination by The Arena</SubHeading>
              <p>The Arena reserves the right to suspend or permanently terminate your Account, with or without prior notice, in the following circumstances:</p>
              <BulletList>
                <li>Misconduct, misbehaviour, or abusive conduct toward other users, Vendors, or The Arena's staff;</li>
                <li>Any material breach of these Terms, including but not limited to prohibited conduct under Section 11;</li>
                <li>Non-compliance with or disagreement to any of The Arena's policies, rules, or guidelines;</li>
                <li>Provision of false, inaccurate, or misleading registration information;</li>
                <li>Fraudulent use of the Platform or payment methods; or</li>
                <li>Any activity that, in The Arena's reasonable judgment, may expose The Arena or any other user to legal liability.</li>
              </BulletList>
              <SubHeading>16.2 Termination by You</SubHeading>
              <p>
                You may terminate your Account at any time by submitting a deletion request through your Account settings or by
                contacting The Arena at <strong>{primaryContactEmail}</strong>. Account deletion is subject to the data retention
                provisions set out in The Arena's Privacy Policy.
              </p>
              <SubHeading>16.3 Effect of Termination</SubHeading>
              <BulletList>
                <li>Your right to access and use the Platform shall immediately cease;</li>
                <li>Any pending or upcoming confirmed bookings may be cancelled at The Arena's discretion;</li>
                <li>You must immediately cease all use of the Platform and The Arena's intellectual property.</li>
              </BulletList>
              <p>Termination shall not affect any rights or obligations accrued prior to the date of termination. Sections 13, 14, 15, 20, and 21 of these Terms shall survive termination.</p>
              <SubHeading>16.4 Reinstatement</SubHeading>
              <p>
                A suspended or terminated user may not re-register or attempt to access the Platform in any manner without The
                Arena's prior written consent. The Arena may, at its sole and absolute discretion, reinstate a suspended user.
              </p>
            </Section>

            <Section id="thirdparty" number="17" title="Third-Party Services">
              <p>
                The Platform integrates with and may contain links to third-party services, including the PayHere payment gateway
                and Google Analytics. These third-party services are governed by their own terms and conditions and privacy
                policies, which are entirely independent of these Terms and The Arena's Privacy Policy.
              </p>
              <p>
                The Arena makes no representations or warranties regarding any third-party service and shall not be liable for any
                loss, damage, or inconvenience arising from your use of or reliance on any third-party service. The inclusion of any
                third-party link or integration on the Platform does not constitute an endorsement of that third party by The Arena.
              </p>
            </Section>

            <Section id="availability" number="18" title="Platform Availability">
              <p>
                The Arena endeavours to make the Platform available at all times. However, we do not guarantee that the Platform
                will be available uninterrupted, error-free, or free from technical faults at all times. The Platform may be
                unavailable from time to time due to scheduled maintenance, technical upgrades, or circumstances beyond our
                reasonable control.
              </p>
              <p>
                The Arena reserves the right to modify, suspend, or discontinue any feature, functionality, or the Platform itself,
                temporarily or permanently, at any time and without notice. The Arena shall not be liable for any loss, damage, or
                inconvenience arising from any interruption, suspension, or discontinuation of the Platform or any of its features.
              </p>
            </Section>

            <Section id="amendments" number="19" title="Amendments to These Terms">
              <p>
                The Arena reserves the right to amend, update, or replace these Terms at any time. In the case of material changes,
                The Arena will endeavour to notify registered users by displaying a prominent notice on the Platform and/or by
                sending a notification to your registered email address prior to the changes taking effect.
              </p>
              <p>
                Non-material changes — such as grammatical corrections or minor clarifications — will take effect immediately upon
                posting. The date of the most recent revision will always be indicated at the top of this page.
              </p>
            </Section>

            <Section id="disputes" number="20" title="Dispute Resolution">
              <SubHeading>20.1 Disputes Between Players and Vendors</SubHeading>
              <p>
                Any dispute arising between a Player and a Vendor in connection with a booking, the condition of a facility, or any
                other matter relating to the underlying sports facility services shall be resolved directly between the Player and
                the Vendor. The Arena is not a party to such disputes and has no obligation to mediate, arbitrate, or adjudicate
                them.
              </p>
              <SubHeading>20.2 Disputes Between Users and The Arena</SubHeading>
              <BulletList>
                <li><strong>Step 1 — Good Faith Resolution:</strong> The disputing party shall first submit a written notice of the dispute to The Arena at <strong>{primaryContactEmail}</strong>, describing the nature of the dispute and the relief sought.</li>
                <li><strong>Step 2 — Litigation:</strong> If the dispute remains unresolved after a 30-day good faith resolution period, either party may commence proceedings before the courts of competent jurisdiction in Sri Lanka.</li>
              </BulletList>
            </Section>

            <Section id="law" number="21" title="Governing Law and Jurisdiction">
              <p>
                These Terms are governed by and shall be construed in accordance with the laws of the <strong>Democratic Socialist
                Republic of Sri Lanka</strong>, including but not limited to the Electronic Transactions Act No. 19 of 2006 and the
                Consumer Affairs Authority Act.
              </p>
              <p>
                Any legal action, suit, or proceeding arising out of or relating to these Terms or the Platform shall be subject to
                the <strong>exclusive jurisdiction of the courts of Sri Lanka</strong>. You irrevocably submit to this jurisdiction
                and waive any objection to proceedings in such courts on grounds of venue or inconvenient forum.
              </p>
            </Section>

            <Section id="general" number="22" title="General Provisions">
              <SubHeading>22.1 Entire Agreement</SubHeading>
              <p>
                These Terms, together with The Arena's Privacy Policy and any other policies or guidelines published on the
                Platform, constitute the entire agreement between you and The Arena with respect to your use of the Platform and
                supersede all prior or contemporaneous agreements, representations, or understandings.
              </p>
              <SubHeading>22.2 Severability</SubHeading>
              <p>If any provision of these Terms is found to be invalid, unlawful, or unenforceable under applicable law, that provision shall be severed from the remaining Terms, which shall continue in full force and effect.</p>
              <SubHeading>22.3 No Waiver</SubHeading>
              <p>No failure or delay by The Arena in exercising any right, power, or remedy under these Terms shall operate as a waiver of that right, power, or remedy.</p>
              <SubHeading>22.4 Assignment</SubHeading>
              <p>
                The Arena may, at its sole discretion, assign or transfer its rights and obligations under these Terms to any
                affiliate, successor, or acquirer without your consent. You may not assign, transfer, or sub-licence any of your
                rights or obligations under these Terms to any third party without The Arena's prior written consent.
              </p>
              <SubHeading>22.5 Force Majeure</SubHeading>
              <p>The Arena shall not be liable for any delay or failure in performance of its obligations under these Terms to the extent that such delay or failure is caused by circumstances beyond its reasonable control.</p>
              <SubHeading>22.6 Notices</SubHeading>
              <p>
                All notices, requests, or communications under these Terms shall be in writing. Notices to The Arena shall be sent
                to <strong>{primaryContactEmail}</strong> or to The Arena's registered address. Notices to you shall be sent to
                the email address registered with your Account and shall be deemed received upon transmission.
              </p>
            </Section>

            <Section id="contact" number="23" title="Contact Us">
              <p>
                For any questions, concerns, or complaints regarding these Terms of Service, or for any other enquiries relating to
                the Platform, please contact us at:
              </p>
              <div className="rounded-2xl border border-default bg-surface-raised/50 p-6 space-y-2">
                <p className="text-primary font-bold">Astryx Global (Pvt) Ltd — The Arena</p>
                <p><strong>Address:</strong> {contactAddress}</p>
                <p><strong>Email:</strong> {contactEmails.join(" / ")}</p>
              </div>
              <p>We aim to respond to all enquiries within 3 business days.</p>
              <p className="text-xs text-muted pt-3">
                Looking for account support? Visit our <Link href="/contact" className="text-emerald-400 hover:text-emerald-300">Contact page</Link>.
              </p>
            </Section>
          </div>
        </div>
      </div>
    </main>
  );
}
