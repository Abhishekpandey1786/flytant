import React from "react";
import PageHeader from "./PageHeader";
import { FaUserCheck, FaUserLock, FaBan } from "react-icons/fa";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <PageHeader />
      <div className="max-w-5xl mx-auto px-6 py-12">
        <header className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white drop-shadow-md">
            Terms of Service
          </h2>
          <p className="mt-3 text-gray-400 text-base md:text-lg max-w-2xl mx-auto">
            Please read these Terms carefully before using Flytant. By
            accessing or using our platform, you agree to be bound by them.
          </p>
        </header>

        {/* Disclaimer */}
        <div className="bg-yellow-900/40 border border-yellow-600 text-yellow-300 p-4 rounded-lg mb-10 text-sm">
          <strong>Disclaimer:</strong> This is a placeholder. Please consult a
          legal professional to draft your official Terms of Service.
        </div>

        {/* Sections */}
        <div className="space-y-8">
          {/* Section 1 */}
          <section className="flex items-start bg-slate-800 p-6 rounded-2xl shadow-lg border border-fuchsia-800 hover:scale-[1.01] transition-transform">
            <div className="text-white text-3xl mr-4">
              <FaUserCheck />
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-white mb-3">
                1. Eligibility
              </h3>
              <p className="text-gray-300 leading-relaxed">
                You must be at least{" "}
                <span className="text-fuchsia-400 font-semibold">18 years old</span>{" "}
                to use our service. By using the service, you represent and
                warrant that you meet this requirement.
              </p>
            </div>
          </section>

          {/* Section 2 */}
          <section className="flex items-start bg-slate-800 p-6 rounded-2xl shadow-lg border border-fuchsia-800 hover:scale-[1.01] transition-transform">
            <div className="text-white text-3xl mr-4">
              <FaUserLock />
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-white mb-3">
                2. User Accounts
              </h3>
              <p className="text-gray-300 leading-relaxed">
                You are responsible for{" "}
                <span className="text-fuchsia-400 font-semibold">
                  safeguarding your account
                </span>{" "}
                information. Notify us immediately upon becoming aware of any
                breach of security or unauthorized use of your account.
              </p>
            </div>
          </section>

          {/* Section 3 */}
          <section className="flex items-start bg-slate-800 p-6 rounded-2xl shadow-lg border border-fuchsia-800 hover:scale-[1.01] transition-transform">
            <div className="text-white text-3xl mr-4">
              <FaBan />
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-white mb-3">
                3. Prohibited Conduct
              </h3>
              <p className="text-gray-300 leading-relaxed">
                You agree not to use the service for any{" "}
                <span className="text-fuchsia-400 font-semibold">illegal</span>{" "}
                or unauthorized purpose, or to engage in any activity that is
                harmful, fraudulent, or otherwise objectionable.
              </p>
            </div>
          </section>
        </div>

        {/* Footer Note */}
        <footer className="mt-12 text-center text-sm text-gray-500">
          Last Updated: September 2025 <br />
          For any questions regarding these Terms, contact us at{" "}
          <a
            href="mailto:terms@flytant.com"
            className="text-fuchsia-400 hover:underline"
          >
            terms@flytant.com
          </a>
        </footer>
      </div>
    </div>
  );
};

export default TermsOfService;
