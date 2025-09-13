export default function PrivacyPolicy() {
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
          <h1 className="text-3xl font-bold text-white mb-8">Privacy Policy</h1>
          
          <div className="prose max-w-none">
            <p className="text-sm text-gray-400 mb-6">
              <strong>Last updated:</strong> {new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">1. Introduction</h2>
              <p className="text-gray-300 mb-4">
                Synapse ("we," "our," or "us") is a pedagogical research platform operated by McGill University. 
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information when 
                you use our curiosity connector platform.
              </p>
              <p className="text-gray-300">
                By using Synapse, you consent to the data practices described in this policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">2. Information We Collect</h2>
              
              <h3 className="text-lg font-medium text-white mb-3">Personal Information</h3>
              <p className="text-gray-300 mb-4">We collect the following personal information:</p>
              <ul className="list-disc pl-6 text-gray-300 mb-4">
                <li>McGill email address (for authentication and communication)</li>
                <li>Full name</li>
                <li>Academic information (faculty, program, year of study)</li>
                <li>Knowledge and curiosity tags (topics of interest)</li>
                <li>Curiosity requests (questions you submit)</li>
              </ul>

              <h3 className="text-lg font-medium text-white mb-3">Usage Information</h3>
              <p className="text-gray-300 mb-4">We automatically collect:</p>
              <ul className="list-disc pl-6 text-gray-300 mb-4">
                <li>Log data (IP address, browser type, access times)</li>
                <li>Platform usage patterns</li>
                <li>Match acceptance/decline decisions</li>
                <li>System interaction data for research purposes</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">3. How We Use Your Information</h2>
              <p className="text-gray-300 mb-4">We use your information to:</p>
              <ul className="list-disc pl-6 text-gray-300 mb-4">
                <li>Facilitate connections between students with complementary interests</li>
                <li>Send match notifications and connection emails</li>
                <li>Improve our matching algorithm</li>
                <li>Conduct pedagogical research on interdisciplinary learning</li>
                <li>Ensure platform security and prevent abuse</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">4. Information Sharing</h2>
              
              <h3 className="text-lg font-medium text-white mb-3">With Other Users</h3>
              <p className="text-gray-300 mb-4">
                We share limited information with other users only after both parties consent to a match:
              </p>
              <ul className="list-disc pl-6 text-gray-300 mb-4">
                <li>Name and academic background (faculty, program, year)</li>
                <li>Email address (only after match acceptance)</li>
                <li>The specific curiosity request that led to the match</li>
              </ul>

              <h3 className="text-lg font-medium text-white mb-3">For Research</h3>
              <p className="text-gray-300 mb-4">
                We may use anonymized, aggregated data for research purposes, including:
              </p>
              <ul className="list-disc pl-6 text-gray-300 mb-4">
                <li>Studying patterns of interdisciplinary curiosity</li>
                <li>Analyzing the effectiveness of our matching algorithm</li>
                <li>Publishing research findings (with no personally identifiable information)</li>
              </ul>

              <h3 className="text-lg font-medium text-white mb-3">Legal Requirements</h3>
              <p className="text-gray-300 mb-4">
                We may disclose your information if required by law or to protect the rights, 
                property, or safety of McGill University, our users, or others.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">5. Data Security</h2>
              <p className="text-gray-300 mb-4">
                We implement appropriate technical and organizational measures to protect your personal information:
              </p>
              <ul className="list-disc pl-6 text-gray-300 mb-4">
                <li>Encryption of data in transit and at rest</li>
                <li>Access controls and authentication requirements</li>
                <li>Regular security audits and updates</li>
                <li>Secure hosting infrastructure</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">6. Your Rights</h2>
              <p className="text-gray-300 mb-4">You have the right to:</p>
              <ul className="list-disc pl-6 text-gray-300 mb-4">
                <li>Access your personal information</li>
                <li>Correct inaccurate information</li>
                <li>Delete your account and associated data</li>
                <li>Export your data in a portable format</li>
                <li>Withdraw consent for data processing</li>
                <li>Object to certain uses of your information</li>
              </ul>
              <p className="text-gray-300">
                To exercise these rights, please contact us at the information provided below.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">7. Data Retention</h2>
              <p className="text-gray-300 mb-4">
                We retain your personal information for as long as necessary to:
              </p>
              <ul className="list-disc pl-6 text-gray-300 mb-4">
                <li>Provide our services</li>
                <li>Comply with legal obligations</li>
                <li>Resolve disputes</li>
                <li>Conduct legitimate research activities</li>
              </ul>
              <p className="text-gray-300">
                You may request deletion of your account at any time, after which we will 
                anonymize or delete your personal information within 30 days.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">8. Cookies and Tracking</h2>
              <p className="text-gray-300 mb-4">
                We use essential cookies and similar technologies to:
              </p>
              <ul className="list-disc pl-6 text-gray-300 mb-4">
                <li>Maintain your login session</li>
                <li>Remember your preferences</li>
                <li>Ensure platform security</li>
                <li>Analyze usage patterns (anonymized)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">9. Third-Party Services</h2>
              <p className="text-gray-300 mb-4">
                We use the following third-party services that may collect information:
              </p>
              <ul className="list-disc pl-6 text-gray-300 mb-4">
                <li><strong>Supabase:</strong> Database and authentication services</li>
                <li><strong>Resend:</strong> Email delivery services</li>
                <li><strong>Vercel:</strong> Hosting and deployment services</li>
              </ul>
              <p className="text-gray-300">
                These services have their own privacy policies and data practices.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">10. Changes to This Policy</h2>
              <p className="text-gray-300 mb-4">
                We may update this Privacy Policy from time to time. We will notify you of any 
                material changes by posting the new policy on this page and updating the 
                "Last updated" date.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">11. Contact Information</h2>
              <p className="text-gray-300 mb-4">
                If you have questions about this Privacy Policy or our data practices, please contact:
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
              <h2 className="text-xl font-semibold text-white mb-4">12. Governing Law</h2>
              <p className="text-gray-300">
                This Privacy Policy is governed by the laws of Quebec, Canada, and any disputes 
                will be resolved in the courts of Quebec.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}