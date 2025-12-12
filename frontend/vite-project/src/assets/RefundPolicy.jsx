import React from "react";
import PageHeader from "./PageHeader"; // Assuming PageHeader is a separate component
import { FaMoneyBillWave, FaUndo, FaBalanceScale } from "react-icons/fa";

const CancellationRefundPolicy = () => {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <PageHeader />
      <div className="max-w-5xl mx-auto px-6 py-12">
        <header className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white drop-shadow-md">
            Cancellation & Refund Policy
          </h2>
          <p className="mt-3 text-gray-400 text-base md:text-lg max-w-2xl mx-auto">
            At vistafluence.com, we strive to build transparency, fairness, and trust.
            Please review this policy carefully before funding your account.
          </p>
        </header>

        {/* Introduction Block */}
        <div className="bg-fuchsia-900/40 border border-fuchsia-600 text-fuchsia-300 p-4 rounded-lg mb-10 text-sm">
          <p className="font-bold mb-2">Policy Scope:</p>
          <p>
            This policy outlines the rules, procedures, and conditions under
            which campaigns can be cancelled and refunds may be granted for both
            brand/agency partners and creators. By using vistafluence.com, you agree to
            be bound by this policy.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-8">
          {/* Section 1: General Principles */}
          <section className="flex items-start bg-slate-800 p-6 rounded-2xl shadow-lg hover:scale-[1.01] transition-transform neno-button shadow-x1 hover:shadow-fuchsia-800/50 text-white border-2 border-fuchsia-800">
            <div className="text-white text-3xl mr-4">
              <FaBalanceScale />
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-white mb-3">
                1. General Principles
              </h3>
              <ul className="text-gray-300 leading-relaxed space-y-2 list-disc ml-5">
                <li>
                  <span className="text-fuchsia-400 font-semibold">
                    Budget Consumption:
                  </span>{" "}
                  Funds are deducted only when valid clicks/deliverables are
                  completed. Consumed funds are non-refundable.
                </li>
                <li>
                  <span className="text-fuchsia-400 font-semibold">
                    Subscriptions:
                  </span>{" "}
                  Paid subscription plan fees (for brands, agencies, and
                  creators) are generally non-refundable once the service period
                  begins.
                </li>
                <li>
                  <span className="text-fuchsia-400 font-semibold">
                    Performance Risk:
                  </span>{" "}
                  Refunds are not provided for dissatisfaction with campaign
                  results (CTR, ROI), as performance depends on external factors.
                </li>
                <li>
                  <span className="text-fuchsia-400 font-semibold">
                    Regulatory Compliance:
                  </span>{" "}
                  All financial transactions comply with Indian regulations
                  (including GST and TDS).
                </li>
              </ul>
            </div>
          </section>

          {/* Section 2: Cancellation Policy */}
          <section className="flex items-start bg-slate-800 p-6 rounded-2xl shadow-lg hover:scale-[1.01] transition-transform neno-button shadow-x1 hover:shadow-fuchsia-800/50 text-white border-2 border-fuchsia-800">
            <div className="text-white text-3xl mr-4">
              <FaUndo />
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-white mb-3">
                2. Cancellation Policy
              </h3>
              <ul className="text-gray-300 leading-relaxed space-y-2 list-disc ml-5">
                <li>
                  <span className="text-fuchsia-400 font-semibold">
                    Before Campaign Launch:
                  </span>{" "}
                  Campaigns may be cancelled. A refund of the unused wallet
                  balance will be granted after deducting applicable processing
                  and gateway fees.
                </li>
                <li>
                  <span className="text-fuchsia-400 font-semibold">
                    After Campaign Launch:
                  </span>{" "}
                  Cancellations are generally not permitted once a campaign is
                  live. No refunds will be issued for the consumed budget.
                  However, payment gateway charges, processing fees, and
                  applicable taxes will be deducted from any remaining balance.
                </li>
              </ul>
            </div>
          </section>

          {/* Section 3: Refund Policy - When Applicable */}
          <section className="flex items-start bg-slate-800 p-6 rounded-2xl shadow-lg hover:scale-[1.01] transition-transform neno-button shadow-x1 hover:shadow-fuchsia-800/50 text-white border-2 border-fuchsia-800">
            <div className="text-white text-3xl mr-4">
              <FaMoneyBillWave />
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-white mb-3">
                3. Refund Conditions (Case-by-Case Basis)
              </h3>
              <p className="text-gray-300 leading-relaxed mb-3">
                Refunds are not automatic and are reviewed on a case-by-case
                basis under the following conditions:
              </p>
              <ul className="text-gray-300 leading-relaxed space-y-2 list-disc ml-5">
                <li>Duplicate transactions or multiple payments for the same
                  campaign.</li>
                <li>Verified platform errors or billing discrepancies caused
                  by vistafluence.com.</li>
                <li>Campaigns that could not be launched due to technical
                  issues on vistafluence.com’s side.</li>
              </ul>
              <p className="text-gray-300 leading-relaxed mt-4 pt-4 border-t border-slate-700">
                <span className="text-red-400 font-semibold">
                  Refunds are NOT applicable for:
                </span>{" "}
                Exhaustion of wallet balance due to valid deliverables,
                dissatisfaction with campaign performance, incorrect campaign
                setup by the advertiser, or violation of vistafluence.com's Terms &
                Conditions.
              </p>
            </div>
          </section>
        </div>

        {/* Footer Note */}
        <footer className="mt-12 text-center text-sm text-gray-500">
          <p className="mb-2">
            To request a refund, please contact us with your account and
            transaction details:
          </p>
          <p>
            Email:{" "}
            <a
              href="mailto:information@vistafluence.com"
              className="text-fuchsia-400 hover:underline"
            >
              information@vistafluence.com
            </a>
          </p>
          <p>
            Website:{" "}
            <a
              href="https://vistafluence.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-fuchsia-400 hover:underline"
            >
              https://vistafluence.com
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
};

export default CancellationRefundPolicy;