export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,rgba(120,119,198,0.2),rgba(255,255,255,0))]"></div>
        <div className="absolute top-20 left-20 w-32 h-32 bg-purple-500/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-28 right-28 w-40 h-40 bg-pink-500/10 rounded-full blur-xl animate-pulse delay-500"></div>
      </div>
      <div className="relative z-10 max-w-4xl mx-auto">
        <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-purple-500/20 shadow-2xl p-8">
          <h1 className="text-3xl font-bold text-white mb-8">Terms of Service</h1>
          
          <div className="prose max-w-none">
            <p className="text-sm text-gray-400 mb-6">
              <strong>Last updated:</strong> {new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-300 mb-4">
                By accessing and using Synapse ("the Platform"), you accept and agree to be bound by 
                these Terms of Service ("Terms"). If you do not agree to these Terms, please do not 
                use the Platform.
              </p>
              <p className="text-gray-300">
                These Terms constitute a legally binding agreement between you and McGill University 
                regarding your use of Synapse.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">2. Description of Service</h2>
              <p className="text-gray-300 mb-4">
                Synapse is a pedagogical research platform designed to facilitate interdisciplinary 
                conversations between McGill University students. The Platform:
              </p>
              <ul className="list-disc pl-6 text-gray-300 mb-4">
                <li>Connects students with complementary knowledge and curiosity</li>
                <li>Facilitates one-on-one academic conversations</li>
                <li>Serves as a research instrument to study student connections</li>
                <li>Promotes interdisciplinary learning and collaboration</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">3. Eligibility</h2>
              <p className="text-gray-300 mb-4">
                To use Synapse, you must:
              </p>
              <ul className="list-disc pl-6 text-gray-300 mb-4">
                <li>Be a current McGill University student, faculty, or staff member</li>
                <li>Have a valid McGill email address (@mail.mcgill.ca or @mcgill.ca)</li>
                <li>Be at least 18 years old or have parental consent</li>
                <li>Agree to these Terms and our Privacy Policy</li>
                <li>Provide accurate and complete information</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">4. User Accounts and Responsibilities</h2>
              
              <h3 className="text-lg font-medium text-white mb-3">Account Security</h3>
              <p className="text-gray-300 mb-4">You are responsible for:</p>
              <ul className="list-disc pl-6 text-gray-300 mb-4">
                <li>Maintaining the confidentiality of your account credentials</li>
                <li>All activities that occur under your account</li>
                <li>Notifying us immediately of any unauthorized use</li>
                <li>Keeping your profile information accurate and up-to-date</li>
              </ul>

              <h3 className="text-lg font-medium text-white mb-3">Acceptable Use</h3>
              <p className="text-gray-300 mb-4">You agree to use the Platform only for legitimate academic purposes and will not:</p>
              <ul className="list-disc pl-6 text-gray-300 mb-4">
                <li>Submit false, misleading, or inappropriate content</li>
                <li>Use the Platform for commercial or promotional purposes</li>
                <li>Harass, intimidate, or discriminate against other users</li>
                <li>Share personal contact information publicly</li>
                <li>Attempt to circumvent security measures</li>
                <li>Use automated tools to access the Platform</li>
                <li>Violate any applicable laws or regulations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">5. Content and Intellectual Property</h2>
              
              <h3 className="text-lg font-medium text-white mb-3">Your Content</h3>
              <p className="text-gray-300 mb-4">
                You retain ownership of the content you submit (curiosity requests, profile information, etc.). 
                By submitting content, you grant McGill University a non-exclusive, royalty-free license to:
              </p>
              <ul className="list-disc pl-6 text-gray-300 mb-4">
                <li>Use your content to provide the matching service</li>
                <li>Analyze content for research purposes (anonymized)</li>
                <li>Improve the Platform's functionality</li>
              </ul>

              <h3 className="text-lg font-medium text-white mb-3">Platform Content</h3>
              <p className="text-gray-300 mb-4">
                The Platform's design, functionality, and underlying technology are owned by McGill University 
                and protected by intellectual property laws.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">6. Privacy and Data Use</h2>
              <p className="text-gray-300 mb-4">
                Your privacy is important to us. Please review our Privacy Policy, which explains:
              </p>
              <ul className="list-disc pl-6 text-gray-300 mb-4">
                <li>What information we collect and how we use it</li>
                <li>How we share information with other users</li>
                <li>Your rights regarding your personal data</li>
                <li>Our security measures and data retention practices</li>
              </ul>
              <p className="text-gray-300">
                By using the Platform, you consent to our data practices as described in the Privacy Policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">7. Research Participation</h2>
              <p className="text-gray-300 mb-4">
                By using Synapse, you acknowledge that:
              </p>
              <ul className="list-disc pl-6 text-gray-300 mb-4">
                <li>The Platform serves as a research instrument</li>
                <li>Your usage data may be analyzed for research purposes</li>
                <li>Research findings may be published (with anonymized data only)</li>
                <li>You can withdraw from research participation at any time</li>
              </ul>
              <p className="text-gray-300">
                All research activities comply with McGill University's Research Ethics Board guidelines.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">8. Matching and Connections</h2>
              
              <h3 className="text-lg font-medium text-white mb-3">How Matching Works</h3>
              <p className="text-gray-300 mb-4">
                Our algorithm matches users based on complementary knowledge and curiosity. 
                We cannot guarantee matches for every request.
              </p>

              <h3 className="text-lg font-medium text-white mb-3">Double Opt-In Policy</h3>
              <p className="text-gray-300 mb-4">
                Contact information is only shared after both parties consent to a connection. 
                You are not obligated to accept any match request.
              </p>

              <h3 className="text-lg font-medium text-white mb-3">Meeting Guidelines</h3>
              <p className="text-gray-300 mb-4">
                When meeting matched users:
              </p>
              <ul className="list-disc pl-6 text-gray-300 mb-4">
                <li>Meet in public, safe locations</li>
                <li>Respect each other's time and boundaries</li>
                <li>Keep conversations academic and professional</li>
                <li>Report any inappropriate behavior</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">9. Prohibited Conduct</h2>
              <p className="text-gray-300 mb-4">
                The following behaviors are strictly prohibited:
              </p>
              <ul className="list-disc pl-6 text-gray-300 mb-4">
                <li>Harassment, bullying, or discriminatory behavior</li>
                <li>Sharing inappropriate or offensive content</li>
                <li>Using the Platform for dating or romantic purposes</li>
                <li>Soliciting commercial services or products</li>
                <li>Impersonating others or providing false information</li>
                <li>Attempting to hack or disrupt the Platform</li>
                <li>Violating McGill University's Code of Student Conduct</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">10. Disclaimers and Limitations</h2>
              
              <h3 className="text-lg font-medium text-white mb-3">Service Availability</h3>
              <p className="text-gray-300 mb-4">
                The Platform is provided "as is" without warranties. We do not guarantee:
              </p>
              <ul className="list-disc pl-6 text-gray-300 mb-4">
                <li>Continuous or error-free operation</li>
                <li>Successful matches for every request</li>
                <li>The quality or outcome of user interactions</li>
                <li>Compatibility with all devices or browsers</li>
              </ul>

              <h3 className="text-lg font-medium text-white mb-3">Limitation of Liability</h3>
              <p className="text-gray-300 mb-4">
                McGill University shall not be liable for any indirect, incidental, or consequential 
                damages arising from your use of the Platform, including but not limited to:
              </p>
              <ul className="list-disc pl-6 text-gray-300 mb-4">
                <li>Interactions with other users</li>
                <li>Loss of data or content</li>
                <li>Technical failures or security breaches</li>
                <li>Misuse of the Platform by other users</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">11. Termination</h2>
              
              <h3 className="text-lg font-medium text-white mb-3">By You</h3>
              <p className="text-gray-300 mb-4">
                You may terminate your account at any time by contacting us or using the 
                account deletion feature.
              </p>

              <h3 className="text-lg font-medium text-white mb-3">By Us</h3>
              <p className="text-gray-300 mb-4">
                We may suspend or terminate your account if you:
              </p>
              <ul className="list-disc pl-6 text-gray-300 mb-4">
                <li>Violate these Terms or our policies</li>
                <li>Engage in prohibited conduct</li>
                <li>Are no longer eligible to use the Platform</li>
                <li>Pose a security risk to other users</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">12. Changes to Terms</h2>
              <p className="text-gray-300 mb-4">
                We may modify these Terms at any time. Material changes will be communicated through:
              </p>
              <ul className="list-disc pl-6 text-gray-300 mb-4">
                <li>Email notification to registered users</li>
                <li>Prominent notice on the Platform</li>
                <li>Updated "Last modified" date on this page</li>
              </ul>
              <p className="text-gray-300">
                Continued use of the Platform after changes constitutes acceptance of the new Terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">13. Dispute Resolution</h2>
              <p className="text-gray-300 mb-4">
                Any disputes arising from these Terms or your use of the Platform will be:
              </p>
              <ul className="list-disc pl-6 text-gray-300 mb-4">
                <li>First addressed through informal negotiation</li>
                <li>Subject to the laws of Quebec, Canada</li>
                <li>Resolved in the courts of Quebec if necessary</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">14. Contact Information</h2>
              <p className="text-gray-300 mb-4">
                For questions about these Terms or to report violations, contact:
              </p>
              <div className="bg-slate-900/40 border border-purple-500/20 p-4 rounded-lg">
                <p className="text-gray-300 mb-2">
                  <strong>Synapse Platform Team</strong><br />
                  McGill University<br />
                  Montreal, QC, Canada
                </p>
                <p className="text-gray-300">
                  Email: <a href="mailto:synapse-support@mcgill.ca" className="text-purple-400 hover:text-purple-300">
                    synapse-support@mcgill.ca
                  </a>
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">15. Severability</h2>
              <p className="text-gray-300">
                If any provision of these Terms is found to be unenforceable, the remaining 
                provisions will continue in full force and effect.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}