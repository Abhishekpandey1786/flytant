import React from "react";
import PageHeader from "./PageHeader";
import { FaUserShield, FaLock, FaShareAlt } from "react-icons/fa";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <PageHeader />
      <div className="max-w-5xl mx-auto px-6 py-15">
        {/* Header */}
        <header className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white drop-shadow-md">
            Privacy Policy
          </h2>
          <p className="mt-3 text-gray-400 text-base md:text-lg max-w-2xl mx-auto">
            Your privacy matters to us. Please read this carefully to
            understand how we handle your data.
          </p>
        </header>

        {/* Disclaimer */}
        <div className="bg-yellow-900/40 border border-yellow-600 text-yellow-300 p-4 rounded-lg mb-10 text-sm">
          <strong>Disclaimer:</strong> This is a placeholder. Please consult a
          legal professional to draft your official Privacy Policy.
        </div>

        {/* Sections */}
        <div className="space-y-8">
          {/* Section 1 */}
          <section className="flex items-start bg-slate-800 p-6 rounded-2xl shadow-lg border border-fuchsia-800 hover:scale-[1.01] transition-transform">
            <div className="text-white text-3xl mr-4">
              <FaUserShield />
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-white mb-3">
                1. Information We Collect
              </h3>
              <p className="text-gray-300 leading-relaxed">
                We may collect information you provide directly to us, such as
                your <span className="text-fuchsia-400 font-semibold">name</span>,{" "}
                <span className="text-fuchsia-400 font-semibold">email address</span>, and
                profile information when you register an account. Additional
                usage data may be collected to improve user experience and
                platform functionality.
              </p>
            </div>
          </section>

          {/* Section 2 */}
          <section className="flex items-start bg-slate-800 p-6 rounded-2xl shadow-lg border border-fuchsia-800 hover:scale-[1.01] transition-transform">
            <div className="text-white text-3xl mr-4">
              <FaLock />
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-white mb-3">
                2. How We Use Your Information
              </h3>
              <p className="text-gray-300 leading-relaxed">
                We use the information we collect to{" "}
                <span className="text-fuchsia-400 font-semibold">
                  operate and maintain our service
                </span>
                , provide you with platform features, personalize your
                experience, and communicate with you about your account,
                updates, or promotional offers (with your consent).
              </p>
            </div>
          </section>

          {/* Section 3 */}
          <section className="flex items-start bg-slate-800 p-6 rounded-2xl shadow-lg border border-fuchsia-800 hover:scale-[1.01] transition-transform">
            <div className="text-white text-3xl mr-4">
              <FaShareAlt />
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-white mb-3">
                3. Sharing Your Information
              </h3>
              <p className="text-gray-300 leading-relaxed">
                We do not share your{" "}
                <span className="text-fuchsia-400 font-semibold">personal data</span>{" "}
                with third parties without your consent, except when required by
                law, to protect our rights, or to provide essential platform
                services through trusted partners who comply with this policy.
              </p>
            </div>
          </section>
        </div>

        {/* Footer Note */}
        <footer className="mt-12 text-center text-sm text-gray-500">
          Last Updated: September 2025 <br />
          For any privacy concerns, contact us at{" "}
          <a
            href="mailto:privacy@flytant.com"
            className="text-fuchsia-400 hover:underline"
          >
            privacy@flytant.com
          </a>
        </footer>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
