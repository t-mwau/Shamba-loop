import Link from "next/link";

const steps = [
  { number: "01", title: "List what you have", text: "Post your crop or animal waste in a few taps. It’s free, and takes less than a minute." },
  { number: "02", title: "Meet the right buyers", text: "Nearby processors find your listing and make clear offers, with pickup details included." },
  { number: "03", title: "Agree on pickup", text: "Confirm the final weight, pickup, and payment details directly with your buyer. ShambaLoop does not process payments yet." },
];

export default function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow hero-eyebrow"><span className="eyebrow-dot" /> KENYA’S FARM WASTE MARKETPLACE</p>
          <h1>What’s left in the field can <em>take you further.</em></h1>
          <p className="hero-description">Turn crop and animal waste into extra income. ShambaLoop connects farmers with nearby processors who are ready to buy.</p>
          <div className="hero-actions">
            <Link className="button button-primary" href="/farmer/new-listing">List your farm waste <span aria-hidden="true">→</span></Link>
            <Link className="button button-text" href="/processor">Explore available supply <span aria-hidden="true">↗</span></Link>
          </div>
          <div className="trust-row"><div className="avatar-stack" aria-hidden="true"><span>M</span><span>P</span><span>G</span></div><p><strong>Made for the people who grow Kenya.</strong><br />Simple, local, and built around your trust.</p></div>
        </div>
        <div className="hero-art" aria-label="Illustration of the agricultural waste marketplace">
          <div className="art-sun" />
          <div className="art-hill art-hill-back" />
          <div className="art-hill art-hill-front" />
          <div className="art-stalks"><i /><i /><i /><i /><i /></div>
          <div className="art-card art-card-top"><span className="art-card-icon">🌽</span><span><strong>Maize stalks</strong><small>850 kg · Nakuru</small></span><b>+ KSh 6,800</b></div>
          <div className="art-card art-card-bottom"><span className="match-icon">↗</span><span><strong>A better match, nearby</strong><small>Offer received · Pickup to agree</small></span></div>
          <div className="art-caption">THE SHAMBALOOP CYCLE <span>✳</span></div>
        </div>
      </section>

      <section className="proof-strip" aria-label="ShambaLoop benefits">
        <div><span className="proof-icon">↗</span><p><strong>Earn from the extra</strong><small>Give farm waste a market value</small></p></div>
        <div><span className="proof-icon">⌖</span><p><strong>Buyers close to home</strong><small>Local matches, less transport</small></p></div>
        <div><span className="proof-icon">✓</span><p><strong>Clear offers</strong><small>Agree on price and pickup together</small></p></div>
      </section>

      <section className="how-section">
        <div className="section-intro">
          <p className="eyebrow">A BETTER WAY TO MOVE WASTE</p>
          <h2>From farm leftovers<br />to a fresh start.</h2>
          <p>Farmers shouldn’t have to burn what someone else can use. We make the connection simple and the next step clear.</p>
          <Link className="text-link" href="/farmer">See your farmer dashboard <span aria-hidden="true">→</span></Link>
        </div>
        <div className="steps-list">
          {steps.map((step) => <article className="step" key={step.number}><span className="step-number">{step.number}</span><div><h3>{step.title}</h3><p>{step.text}</p></div><span className="step-arrow" aria-hidden="true">↗</span></article>)}
        </div>
      </section>

      <section className="impact-banner">
        <span className="impact-flower" aria-hidden="true">✳</span>
        <div><p className="eyebrow">GOOD FOR YOUR POCKET. BETTER FOR OUR LAND.</p><h2>Keep value in the loop.</h2><p>Every pickup helps turn potential smoke into useful material—and puts more value back in farmers’ hands.</p></div>
        <Link className="button button-light" href="/processor">Find a buyer <span aria-hidden="true">→</span></Link>
      </section>
    </>
  );
}
