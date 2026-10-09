import { Link } from "react-router-dom";

import siteConfig from "../siteConfig";

import "./RefundPolicy.css";

function RefundPolicy() {
  const hasContact =
    siteConfig.supportEmail ||
    siteConfig.supportPhone ||
    siteConfig.whatsappNumber;

  return (
    <div className="policy-page">

      <article className="policy-card">

        <p className="policy-small-title">
          TYOHARA
        </p>

        <h1>
          Cancellation and Refund Policy
        </h1>

        <h2>
          Cancelling an order
        </h2>

        <p>
          You can cancel your order until it has been shipped.
          Once an order has been shipped, it cannot be cancelled.
        </p>

        <h2>
          Refunds
        </h2>

        <p>
          If your order is cancelled before it is shipped, your
          refund will be processed within 3 days to the original
          payment method. After we process it, your bank or
          payment provider may take a few more days to show the
          amount in your account.
        </p>

        <p>
          Once an order has been shipped, no refund is given.
        </p>

        <p>
          For Cash on Delivery orders that are cancelled before
          shipping, there is nothing to refund because no payment
          has been made.
        </p>

        {hasContact && (
          <>
            <h2>
              Contact us
            </h2>

            <p>
              To cancel an order or ask about a refund, contact us
              as early as possible and keep your order ID ready.
            </p>

            <ul>
              {siteConfig.supportEmail && (
                <li>
                  Email:{" "}
                  <a href={`mailto:${siteConfig.supportEmail}`}>
                    {siteConfig.supportEmail}
                  </a>
                </li>
              )}

              {siteConfig.supportPhone && (
                <li>
                  Phone: {siteConfig.supportPhone}
                </li>
              )}

              {siteConfig.whatsappNumber && (
                <li>
                  WhatsApp:{" "}
                  <a
                    href={`https://wa.me/${siteConfig.whatsappNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Message us
                  </a>
                </li>
              )}
            </ul>
          </>
        )}

        <Link
          to="/"
          className="policy-back"
        >
          Back to Home
        </Link>

      </article>

    </div>
  );
}

export default RefundPolicy;
